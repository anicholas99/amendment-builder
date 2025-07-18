/**
 * Patent PDF Retrieval Service
 * 
 * Handles retrieval of patent PDFs from multiple sources for examiner-cited prior art.
 * Integrates with existing Azure Blob Storage infrastructure for caching and serving.
 */

import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { authenticatePatbase, callPatbaseApi } from '@/lib/api/patbase';
import { StorageServerService } from './storage.server-service';
import { prisma } from '@/lib/prisma';
import { BlobServiceClient } from '@azure/storage-blob';
import { environment } from '@/config/environment';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import os from 'os';

export interface PatentPdfResult {
  success: boolean;
  priorArtId?: string;
  storageUrl?: string;
  source: 'cache' | 'patbase' | 'uspto' | 'google_patents';
  error?: string;
}

export class PatentPdfRetrievalService {
  
  /**
   * Main method to retrieve a patent PDF for examiner-cited prior art
   */
  static async retrievePatentPdf(
    patentNumber: string,
    projectId: string,
    tenantId: string,
    userId: string,
    options: {
      fileType?: 'cited-reference' | 'examiner-citation';
      forceRefresh?: boolean;
    } = {}
  ): Promise<PatentPdfResult> {
    const { fileType = 'examiner-citation', forceRefresh = false } = options;
    
    logger.info('[PatentPdfRetrieval] Starting PDF retrieval', {
      patentNumber,
      projectId,
      tenantId,
      userId,
      fileType,
      forceRefresh,
    });

    try {
      // Step 1: Check if we already have this PDF cached
      if (!forceRefresh) {
        const existingPdf = await this.checkExistingPdf(patentNumber, projectId);
        if (existingPdf) {
          logger.info('[PatentPdfRetrieval] Found cached PDF', {
            patentNumber,
            priorArtId: existingPdf.id,
          });
          return {
            success: true,
            priorArtId: existingPdf.id,
            storageUrl: existingPdf.storageUrl,
            source: 'cache',
          };
        }
      }

      // Step 2: Try multiple sources to retrieve the PDF
      const pdfData = await this.fetchPdfFromSources(patentNumber);
      
      if (!pdfData) {
        return {
          success: false,
          source: 'uspto',
          error: 'Patent PDF not found in any available source',
        };
      }

      // Step 3: Upload to Azure Blob Storage
      const uploadResult = await this.uploadPdfToStorage(
        pdfData.buffer,
        patentNumber,
        tenantId,
        userId
      );

      // Step 4: Save to database as SavedPriorArt record
      const priorArt = await this.savePriorArtRecord({
        projectId,
        patentNumber,
        title: pdfData.metadata?.title || `Patent ${patentNumber}`,
        abstract: pdfData.metadata?.abstract,
        storageUrl: uploadResult.blobName,
        fileType,
        extractedText: pdfData.extractedText,
        extractedMetadata: pdfData.metadata,
      });

      logger.info('[PatentPdfRetrieval] Successfully retrieved and stored PDF', {
        patentNumber,
        priorArtId: priorArt.id,
        source: pdfData.source,
      });

      return {
        success: true,
        priorArtId: priorArt.id,
        storageUrl: uploadResult.blobName,
        source: pdfData.source,
      };

    } catch (error) {
      logger.error('[PatentPdfRetrieval] Failed to retrieve patent PDF', {
        patentNumber,
        projectId,
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        source: 'uspto',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if we already have this patent PDF cached
   */
  private static async checkExistingPdf(
    patentNumber: string,
    projectId: string
  ): Promise<{ id: string; storageUrl: string } | null> {
    if (!prisma) {
      logger.warn('[PatentPdfRetrieval] Prisma not available');
      return null;
    }

    const normalizedPatentNumber = patentNumber.replace(/[-\s]/g, '').toUpperCase();
    
    const existingPriorArt = await prisma.savedPriorArt.findFirst({
      where: {
        projectId,
        patentNumber: normalizedPatentNumber,
        storageUrl: { not: null },
      },
      select: {
        id: true,
        storageUrl: true,
      },
    });

    return existingPriorArt as { id: string; storageUrl: string } | null;
  }

  /**
   * Try multiple sources to fetch the PDF
   */
  private static async fetchPdfFromSources(
    patentNumber: string
  ): Promise<{
    buffer: Buffer;
    metadata?: any;
    extractedText?: string;
    source: 'patbase' | 'uspto' | 'google_patents';
  } | null> {
    
    // Try PatBase first (if available)
    try {
      const patbasePdf = await this.fetchFromPatbase(patentNumber);
      if (patbasePdf) {
        return { ...patbasePdf, source: 'patbase' };
      }
    } catch (error) {
      logger.warn('[PatentPdfRetrieval] PatBase retrieval failed', {
        patentNumber,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Try USPTO public APIs
    try {
      const usptoPdf = await this.fetchFromUSPTO(patentNumber);
      if (usptoPdf) {
        return { ...usptoPdf, source: 'uspto' };
      }
    } catch (error) {
      logger.warn('[PatentPdfRetrieval] USPTO retrieval failed', {
        patentNumber,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Try Google Patents as fallback
    try {
      const googlePdf = await this.fetchFromGooglePatents(patentNumber);
      if (googlePdf) {
        return { ...googlePdf, source: 'google_patents' };
      }
    } catch (error) {
      logger.warn('[PatentPdfRetrieval] Google Patents retrieval failed', {
        patentNumber,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return null;
  }

  /**
   * Fetch PDF from PatBase (enhanced from existing integration)
   */
  private static async fetchFromPatbase(
    patentNumber: string
  ): Promise<{ buffer: Buffer; metadata?: any; extractedText?: string } | null> {
    try {
      const sessionToken = await authenticatePatbase();
      
      // First, try to get full patent data including PDF if available
      const patentData = await callPatbaseApi('getpublication', {
        number: patentNumber,
        format: 'json',
        includeFullText: 'true',
      }, { sessionToken });

      // Safely access PatBase response properties
      const patentDataAny = patentData as any;

      // Check if PatBase provides a PDF URL or binary data
      if (patentDataAny?.PdfUrl || patentDataAny?.pdfData) {
        let pdfBuffer: Buffer;
        
        if (patentDataAny.PdfUrl) {
          // Download from PDF URL
          const response = await axios.get(patentDataAny.PdfUrl, {
            responseType: 'arraybuffer',
            headers: {
              Cookie: `SessionFarm_GUID=${sessionToken}`,
            },
            timeout: 30000, // 30 second timeout
          });
          pdfBuffer = Buffer.from(response.data);
        } else if (patentDataAny.pdfData) {
          // Use provided PDF binary data
          pdfBuffer = Buffer.from(patentDataAny.pdfData, 'base64');
        } else {
          return null;
        }

        // Extract metadata from PatBase response
        const metadata = {
          title: patentDataAny.title || patentDataAny.Title,
          abstract: patentDataAny.abstract || patentDataAny.Abstract,
          publicationDate: patentDataAny.publicationDate || patentDataAny.PD,
          assignee: patentDataAny.assignee || patentDataAny.Assignee,
          inventors: patentDataAny.inventors || patentDataAny.Inventors,
        };

        return {
          buffer: pdfBuffer,
          metadata,
          extractedText: patentDataAny.fullText,
        };
      }

      return null;
    } catch (error) {
      logger.error('[PatentPdfRetrieval] PatBase error', {
        patentNumber,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Fetch PDF from USPTO public APIs
   */
  private static async fetchFromUSPTO(
    patentNumber: string
  ): Promise<{ buffer: Buffer; metadata?: any } | null> {
    try {
      // Clean patent number for USPTO format
      const cleanNumber = patentNumber.replace(/[^0-9]/g, '');
      
      // USPTO provides PDFs at predictable URLs
      const usptoPdfUrl = `https://patft.uspto.gov/netacgi/nph-Parser?Sect1=PTO2&Sect2=HITOFF&u=%2Fnetahtml%2FPTO%2Fsearch-adv.htm&r=1&f=G&l=50&d=PTXT&S1=${cleanNumber}.PN.&OS=PN/${cleanNumber}&RS=PN/${cleanNumber}`;
      
      // Alternative direct PDF URL (more reliable)
      const directPdfUrl = `https://patft.uspto.gov/netacgi/nph-Parser?Sect1=PTO1&Sect2=HITOFF&d=PALL&p=1&u=%2Fnetahtml%2FPTO%2Fsrchnum.htm&r=1&f=G&l=50&s1=${cleanNumber}.PN.&OS=PN/${cleanNumber}&RS=PN/${cleanNumber}`;

      const response = await axios.get(directPdfUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (response.status === 200 && response.data) {
        return {
          buffer: Buffer.from(response.data),
          metadata: {
            source: 'USPTO',
            patentNumber,
          },
        };
      }

      return null;
    } catch (error) {
      logger.error('[PatentPdfRetrieval] USPTO error', {
        patentNumber,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Fetch PDF from Google Patents
   */
  private static async fetchFromGooglePatents(
    patentNumber: string
  ): Promise<{ buffer: Buffer; metadata?: any } | null> {
    try {
      // Google Patents PDF URL format
      const googlePdfUrl = `https://patentimages.storage.googleapis.com/pdfs/${patentNumber}.pdf`;
      
      const response = await axios.get(googlePdfUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (response.status === 200 && response.data) {
        return {
          buffer: Buffer.from(response.data),
          metadata: {
            source: 'Google Patents',
            patentNumber,
          },
        };
      }

      return null;
    } catch (error) {
      logger.error('[PatentPdfRetrieval] Google Patents error', {
        patentNumber,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Upload PDF to Azure Blob Storage
   */
  private static async uploadPdfToStorage(
    pdfBuffer: Buffer,
    patentNumber: string,
    tenantId: string,
    userId: string
  ): Promise<{ blobName: string }> {
    const connectionString = environment.azure.storageConnectionString;
    if (!connectionString) {
      throw new ApplicationError(
        ErrorCode.CONFIG_MISSING,
        'Azure Storage connection string not configured'
      );
    }

    // Generate secure blob name with tenant isolation
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const blobName = `${tenantId}/${userId}/patent-pdfs/${uuidv4()}-${timestamp}-${patentNumber}.pdf`;

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient('patent-files-private');
    
    // Ensure container exists
    await containerClient.createIfNotExists();
    
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload PDF with metadata
    await blockBlobClient.upload(pdfBuffer, pdfBuffer.length, {
      blobHTTPHeaders: {
        blobContentType: 'application/pdf',
      },
      metadata: {
        originalName: `${patentNumber}.pdf`,
        patentNumber,
        uploadedBy: userId,
        tenantId,
        uploadedAt: new Date().toISOString(),
        source: 'patent-pdf-retrieval',
      },
    });

    logger.info('[PatentPdfRetrieval] PDF uploaded to storage', {
      blobName,
      patentNumber,
      size: pdfBuffer.length,
    });

    return { blobName };
  }

  /**
   * Save prior art record to database
   */
  private static async savePriorArtRecord(data: {
    projectId: string;
    patentNumber: string;
    title: string;
    abstract?: string;
    storageUrl: string;
    fileType: string;
    extractedText?: string;
    extractedMetadata?: any;
  }): Promise<{ id: string }> {
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database connection unavailable'
      );
    }

    const normalizedPatentNumber = data.patentNumber.replace(/[-\s]/g, '').toUpperCase();

    const priorArt = await prisma.savedPriorArt.create({
      data: {
        projectId: data.projectId,
        patentNumber: normalizedPatentNumber,
        title: data.title,
        abstract: data.abstract,
        storageUrl: data.storageUrl,
        fileType: data.fileType,
        extractedText: data.extractedText,
        extractedMetadata: data.extractedMetadata ? JSON.stringify(data.extractedMetadata) : null,
        savedAt: new Date(),
      },
    });

    return { id: priorArt.id };
  }

  /**
   * Bulk retrieve PDFs for multiple patents (for office action processing)
   */
  static async bulkRetrievePatentPdfs(
    patentNumbers: string[],
    projectId: string,
    tenantId: string,
    userId: string,
    options: {
      fileType?: 'cited-reference' | 'examiner-citation';
      maxConcurrent?: number;
    } = {}
  ): Promise<PatentPdfResult[]> {
    const { fileType = 'examiner-citation', maxConcurrent = 3 } = options;
    
    logger.info('[PatentPdfRetrieval] Starting bulk PDF retrieval', {
      patentCount: patentNumbers.length,
      projectId,
      maxConcurrent,
    });

    const results: PatentPdfResult[] = [];
    
    // Process in batches to avoid overwhelming external APIs
    for (let i = 0; i < patentNumbers.length; i += maxConcurrent) {
      const batch = patentNumbers.slice(i, i + maxConcurrent);
      
      const batchPromises = batch.map(patentNumber =>
        this.retrievePatentPdf(patentNumber, projectId, tenantId, userId, { fileType })
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches to be respectful to external APIs
      if (i + maxConcurrent < patentNumbers.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    logger.info('[PatentPdfRetrieval] Bulk retrieval completed', {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    });

    return results;
  }
} 
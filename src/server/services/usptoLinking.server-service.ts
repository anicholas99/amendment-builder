/**
 * USPTO Linking Service - Simplified Version
 * 
 * Links USPTO applications to projects using only the ProjectDocument table.
 * All documents are stored as metadata first, then essential ones are
 * downloaded and OCR'd for AI context.
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { fetchProsecutionHistory } from '@/lib/api/uspto/services/prosecutionHistoryService';
import { downloadDocumentPDF } from '@/lib/api/uspto/client';
import { EnhancedTextExtractionService } from './enhanced-text-extraction.server-service';
import { StorageServerService } from './storage.server-service';
import { generateId } from '@/lib/utils/ids';
import { 
  categorizeDocument, 
  isEssentialDocument,
  selectEssentialDocuments,
  getDocumentDisplayName,
} from '@/lib/api/uspto/utils/documentCategorization';
import type { ProsecutionDocument } from '@/lib/api/uspto/services/prosecutionHistoryService';
import fs from 'fs/promises';
import path from 'path';
import { tmpdir } from 'os';

interface LinkingResult {
  totalDocuments: number;
  documentsStored: number;
  essentialDocuments: number;
  essentialProcessed: number;
  errors: Array<{
    documentCode: string;
    error: string;
  }>;
}

export class USPTOLinkingService {
  /**
   * Link USPTO application to project - simplified approach
   */
  static async linkUSPTOToProject(
    projectId: string,
    applicationNumber: string,
    tenantId: string,
    userId: string
  ): Promise<LinkingResult> {
    try {
      logger.info('[USPTOLinkingService] Starting USPTO linking', {
        projectId,
        applicationNumber,
        tenantId,
      });

      // Clean application number
      const cleanAppNumber = applicationNumber.replace(/[^0-9]/g, '');
      
      // Fetch prosecution history
      const prosecutionHistory = await fetchProsecutionHistory(cleanAppNumber);
      
      if (!prosecutionHistory || !prosecutionHistory.documents) {
        throw new ApplicationError(
          ErrorCode.API_NETWORK_ERROR,
          'Failed to fetch USPTO prosecution history'
        );
      }

      const { documents } = prosecutionHistory;
      logger.info('[USPTOLinkingService] Fetched prosecution history', {
        applicationNumber: cleanAppNumber,
        documentCount: documents.length,
      });

      // Process in transaction
      const result = await prisma.$transaction(async (tx) => {
        const linkingResult: LinkingResult = {
          totalDocuments: documents.length,
          documentsStored: 0,
          essentialDocuments: 0,
          essentialProcessed: 0,
          errors: [],
        };

        // Step 1: Store ALL documents as metadata in ProjectDocument
        for (const doc of documents) {
          try {
            const categorization = categorizeDocument(doc.documentCode);
            
            // Check if document already exists
            const existing = await tx.projectDocument.findFirst({
              where: {
                projectId,
                usptoDocumentCode: doc.documentCode,
                usptoMailDate: doc.mailDate ? new Date(doc.mailDate) : null,
              },
            });

            if (!existing) {
              await tx.projectDocument.create({
                data: {
                  id: generateId(),
                  projectId,
                  fileName: `${doc.documentCode}_${doc.mailDate || 'undated'}.json`,
                  originalName: getDocumentDisplayName(doc.documentCode),
                  fileType: 'uspto-document',
                  applicationNumber: cleanAppNumber,
                  usptoDocumentCode: doc.documentCode,
                  usptoMailDate: doc.mailDate ? new Date(doc.mailDate) : null,
                  isEssentialDoc: categorization.isEssential,
                  documentCategory: categorization.category,
                  extractedMetadata: JSON.stringify({
                    ...doc,
                    importance: categorization.importance,
                    purpose: categorization.purpose,
                    displayName: getDocumentDisplayName(doc.documentCode),
                  }),
                  uploadedBy: userId,
                  // No storageUrl or extractedText yet - just metadata
                },
              });
              linkingResult.documentsStored++;
              
              if (categorization.isEssential) {
                linkingResult.essentialDocuments++;
              }
            }
          } catch (error) {
            logger.error('[USPTOLinkingService] Failed to store document metadata', {
              documentCode: doc.documentCode,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }

        // Step 2: Select which essential documents to process
        const essentialDocs = selectEssentialDocuments(documents);
        const docsToProcess = Object.entries(essentialDocs)
          .filter(([_, doc]) => doc !== undefined)
          .map(([type, doc]) => ({ type, doc: doc! }));

        logger.info('[USPTOLinkingService] Processing essential documents', {
          selected: docsToProcess.map(d => ({
            type: d.type,
            code: d.doc.documentCode,
          })),
        });

        // Step 3: Download and OCR essential documents
        for (const { type, doc } of docsToProcess) {
          try {
            // Ensure doc has required properties for ProsecutionDocument
            const prosecutionDoc: ProsecutionDocument = {
              ...doc,
              category: categorizeDocument(doc.documentCode).category as any,
              importance: categorizeDocument(doc.documentCode).importance,
              isDownloadable: true,
              documentCodeDescriptionText: doc.documentCode,
              documentIdentifier: doc.documentCode,
            };
            await this.processEssentialDocument(
              prosecutionDoc,
              projectId,
              cleanAppNumber,
              tx
            );
            linkingResult.essentialProcessed++;
          } catch (error) {
            logger.error('[USPTOLinkingService] Failed to process essential document', {
              documentCode: doc.documentCode,
              type,
              error: error instanceof Error ? error.message : String(error),
            });
            
            linkingResult.errors.push({
              documentCode: doc.documentCode,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }

        // Step 4: Update patent application metadata if available
        if (prosecutionHistory.applicationData) {
          await this.updatePatentApplication(
            projectId,
            prosecutionHistory.applicationData,
            cleanAppNumber,
            tx
          );
        }

        return linkingResult;
      });

      logger.info('[USPTOLinkingService] USPTO linking completed', {
        projectId,
        applicationNumber: cleanAppNumber,
        result,
      });

      return result;

    } catch (error) {
      logger.error('[USPTOLinkingService] Failed to link USPTO application', {
        projectId,
        applicationNumber,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        `Failed to link USPTO application: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Process a single essential document: download, OCR, and update
   */
  private static async processEssentialDocument(
    doc: ProsecutionDocument,
    projectId: string,
    applicationNumber: string,
    tx: any // Prisma transaction client
  ): Promise<void> {
    const tempDir = await fs.mkdtemp(path.join(tmpdir(), 'uspto-'));
    const tempFilePath = path.join(tempDir, `${doc.documentCode}_${Date.now()}.pdf`);
    
    try {
      logger.info('[USPTOLinkingService] Processing essential document', {
        documentCode: doc.documentCode,
        hasDownloadUrl: !!doc.downloadOptionBag,
      });

      // Download PDF from USPTO
      const pdfBuffer = await downloadDocumentPDF(doc);
      await fs.writeFile(tempFilePath, pdfBuffer);

      // Extract text using enhanced OCR service
      const extractedText = await EnhancedTextExtractionService.extractTextFromFile({
        filepath: tempFilePath,
        mimetype: 'application/pdf',
        originalFilename: `${doc.documentCode}.pdf`,
      } as any);

      // Upload to Azure storage
      const containerName = this.getContainerForCategory(
        categorizeDocument(doc.documentCode).category
      );
      const blobName = `uspto/${applicationNumber}/${doc.documentCode}_${Date.now()}.pdf`;
      const storageUrl = await StorageServerService.uploadBuffer(
        pdfBuffer,
        blobName,
        'application/pdf',
        containerName
      );

      // Update the ProjectDocument with OCR text and storage URL
      await tx.projectDocument.updateMany({
        where: {
          projectId,
          usptoDocumentCode: doc.documentCode,
          usptoMailDate: doc.mailDate ? new Date(doc.mailDate) : null,
        },
        data: {
          storageUrl,
          extractedText,
          updatedAt: new Date(),
        },
      });

      logger.info('[USPTOLinkingService] Essential document processed', {
        documentCode: doc.documentCode,
        textLength: extractedText.length,
      });

    } finally {
      // Cleanup temp files
      try {
        await fs.unlink(tempFilePath);
        await fs.rmdir(tempDir);
      } catch (cleanupError) {
        logger.warn('[USPTOLinkingService] Failed to cleanup temp files', {
          error: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
        });
      }
    }
  }

  /**
   * Update patent application metadata
   */
  private static async updatePatentApplication(
    projectId: string,
    applicationData: any,
    applicationNumber: string,
    tx: any
  ): Promise<void> {
    const existingApp = await tx.patentApplication.findUnique({
      where: { projectId }
    });

    const metadata = {
      lastUSPTOSync: new Date().toISOString(),
      attorneyDocketNumber: applicationData.attorneyDocketNumber,
    };

    if (existingApp) {
      await tx.patentApplication.update({
        where: { projectId },
        data: {
          applicationNumber: applicationNumber || existingApp.applicationNumber,
          title: applicationData.title || existingApp.title,
          filingDate: applicationData.filingDate 
            ? new Date(applicationData.filingDate)
            : existingApp.filingDate,
          status: applicationData.status || existingApp.status,
          examinerName: applicationData.examinerName || existingApp.examinerName,
          artUnit: applicationData.artUnit || existingApp.artUnit,
          inventors: applicationData.inventorName 
            ? JSON.stringify(applicationData.inventorName)
            : existingApp.inventors,
          assignee: applicationData.applicantName || existingApp.assignee,
          metadata: JSON.stringify({
            ...((existingApp.metadata as any) || {}),
            ...metadata,
          }),
        }
      });
    } else {
      await tx.patentApplication.create({
        data: {
          id: generateId(),
          projectId,
          applicationNumber,
          title: applicationData.title,
          filingDate: applicationData.filingDate 
            ? new Date(applicationData.filingDate)
            : null,
          status: applicationData.status || 'PENDING',
          examinerName: applicationData.examinerName,
          artUnit: applicationData.artUnit,
          inventors: applicationData.inventorName 
            ? JSON.stringify(applicationData.inventorName)
            : null,
          assignee: applicationData.applicantName,
          metadata: JSON.stringify(metadata),
        }
      });
    }
  }

  /**
   * Get container name based on document category
   */
  private static getContainerForCategory(category: string): string {
    switch (category) {
      case 'office-action':
        return 'office-actions-private';
      case 'specification':
        return 'patent-files-private';
      default:
        return 'uspto-documents-private';
    }
  }
}

/**
 * Get essential USPTO documents for AI context
 * This is used by AI agents to get the OCR'd text
 */
export async function getEssentialUSPTODocuments(
  projectId: string,
  tenantId?: string // Optional for backwards compatibility
): Promise<{
  officeAction?: string;
  claims?: string;
  specification?: string;
  lastResponse?: string;
  searchNotes?: string;
  interview?: string;
}> {
  try {
    // Get all essential documents with extracted text
    const docs = await prisma.projectDocument.findMany({
      where: {
        projectId,
        fileType: 'uspto-document',
        isEssentialDoc: true,
        extractedText: { not: null },
      },
      select: {
        usptoDocumentCode: true,
        documentCategory: true,
        extractedText: true,
        usptoMailDate: true,
      },
      orderBy: { usptoMailDate: 'desc' },
    });

    // Group by category and get most recent
    const result: any = {};
    
    // Map categories to result keys
    const categoryMap: Record<string, string> = {
      'office-action': 'officeAction',
      'claims': 'claims',
      'specification': 'specification',
      'response': 'lastResponse',
      'search-notes': 'searchNotes',
      'interview': 'interview',
    };

    for (const doc of docs) {
      const resultKey = categoryMap[doc.documentCategory || ''];
      if (resultKey && !result[resultKey] && doc.extractedText) {
        result[resultKey] = doc.extractedText;
      }
    }

    logger.debug('[USPTOLinkingService] Essential documents retrieved', {
      projectId,
      hasOfficeAction: !!result.officeAction,
      hasClaims: !!result.claims,
      hasSpecification: !!result.specification,
      hasLastResponse: !!result.lastResponse,
      hasSearchNotes: !!result.searchNotes,
      hasInterview: !!result.interview,
    });

    return result;
  } catch (error) {
    logger.error('[USPTOLinkingService] Failed to get essential documents', {
      projectId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new ApplicationError(
      ErrorCode.INTERNAL_ERROR,
      'Failed to retrieve essential USPTO documents'
    );
  }
}
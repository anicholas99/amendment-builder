import { NextApiResponse } from 'next';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { AuthenticatedRequest } from '@/types/middleware';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { apiResponse } from '@/utils/api/responses';
import { projectDocumentRepository } from '@/repositories/projectDocumentRepository';
import { EnhancedTextExtractionService } from '@/server/services/enhanced-text-extraction.server-service';
import { BlobServiceClient } from '@azure/storage-blob';
import { environment } from '@/config/environment';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const querySchema = z.object({
  projectId: z.string().uuid(),
  documentId: z.string().uuid(),
});

/**
 * OCR API Handler
 * Simple OCR processing that matches the "New Response" button logic
 * 
 * POST: Triggers OCR processing for the document
 * GET: Returns OCR status and results
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (!['POST', 'GET'].includes(req.method || '')) {
    return apiResponse.methodNotAllowed(res, ['POST', 'GET']);
  }

  try {
    const { projectId, documentId } = querySchema.parse(req.query);
    const { tenantId } = req.user!;

    if (!tenantId) {
      throw new ApplicationError(
        ErrorCode.TENANT_NOT_FOUND,
        'Tenant context is required'
      );
    }

    // Verify document belongs to project and tenant
    const document = await projectDocumentRepository.findByIdWithTenantVerification(
      documentId,
      tenantId
    );

    if (!document) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'Document not found or access denied'
      );
    }

    if (document.projectId !== projectId) {
      throw new ApplicationError(
        ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
        'Document does not belong to the specified project'
      );
    }

    if (req.method === 'GET') {
      // Return current OCR status and results
      return apiResponse.ok(res, {
        documentId,
        ocrStatus: (document as any).ocrStatus || null,
        ocrProcessedAt: (document as any).ocrProcessedAt || null,
        ocrError: (document as any).ocrError || null,
        hasOcrText: !!(document as any).ocrText,
        ocrTextLength: (document as any).ocrText?.length || 0,
      });
    }

    // POST: Run OCR processing (same logic as New Response button)
    if (!document.storageUrl) {
      throw new ApplicationError(
        ErrorCode.INVALID_INPUT,
        'Document must be downloaded before OCR can be performed'
      );
    }

    logger.info('[OCR] Starting OCR processing', {
      documentId,
      projectId,
      fileName: document.originalName,
      tenantId,
    });

    // Update status to pending
    await projectDocumentRepository.updateOCRStatus(documentId, 'pending');

    // Process OCR asynchronously (same as New Response button logic)
    setImmediate(async () => {
      try {
        // Extract blob information (same logic as process-timeline.ts)
        let blobName: string;
        let containerName: string;

        if ((document as any).extractedText?.startsWith('blob:')) {
          // Pattern: extractedText = "blob:actualBlobName" (from USPTO download)
          blobName = (document as any).extractedText.substring(5); // Remove "blob:" prefix
          containerName = 'office-actions-private'; // Default for USPTO docs
        } else if ((document as any).extractedMetadata) {
          // Try extractedMetadata for blobName
          try {
            const metadata = JSON.parse((document as any).extractedMetadata || '{}');
            if (metadata.blobName) {
              blobName = metadata.blobName;
              containerName = 'office-actions-private';
            } else {
              blobName = document.storageUrl!;
              containerName = 'patent-files-private';
            }
          } catch (error) {
            blobName = document.storageUrl!;
            containerName = 'patent-files-private';
          }
        } else {
          // Direct storageUrl usage
          blobName = document.storageUrl!;
          containerName = 'patent-files-private';
        }

        logger.debug('[OCR] Using blob info', {
          containerName,
          blobName,
          documentId,
        });

        // Download from blob storage (same as process-timeline.ts)
        const connectionString = environment.azure.storageConnectionString;
        if (!connectionString) {
          throw new ApplicationError(
            ErrorCode.CONFIG_MISSING,
            'Azure Storage connection string not configured'
          );
        }

        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Download to temp file
        const tempFilePath = path.join(os.tmpdir(), `ocr-${documentId}-${Date.now()}.pdf`);
        await blockBlobClient.downloadToFile(tempFilePath);

        logger.debug('[OCR] Downloaded PDF to temp file', {
          tempFilePath,
          blobName,
        });

        // Create formidable-like file object (same as process-timeline.ts)
        const fileObject = {
          filepath: tempFilePath,
          originalFilename: document.originalName,
          mimetype: 'application/pdf',
          size: 0,
        } as any;

        // Use the SAME text extraction method as "New Response" button
        let extractedText: string;
        try {
          extractedText = await EnhancedTextExtractionService.extractTextFromFile(fileObject);
          logger.info('[OCR] Enhanced text extraction successful', {
            textLength: extractedText.length,
            documentId,
          });
        } catch (enhancedError) {
          logger.warn('[OCR] Enhanced text extraction failed, trying basic method', {
            error: enhancedError instanceof Error ? enhancedError.message : String(enhancedError),
          });
          
          // Fallback (same as process-timeline.ts)
          const { StorageServerService } = await import('@/server/services/storage.server-service');
          extractedText = await StorageServerService.extractTextFromFile(fileObject);
          logger.info('[OCR] Basic text extraction successful', {
            textLength: extractedText.length,
            documentId,
          });
        }

        // Clean up temp file
        await fs.unlink(tempFilePath);

        // Save OCR results to database
        await projectDocumentRepository.updateOCRResult(documentId, extractedText);

        logger.info('[OCR] OCR processing completed successfully', {
          documentId,
          projectId,
          textLength: extractedText.length,
          fileName: document.originalName,
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        await projectDocumentRepository.updateOCRStatus(
          documentId,
          'failed',
          errorMessage
        );

        logger.error('[OCR] OCR processing failed', {
          documentId,
          projectId,
          error: errorMessage,
          fileName: document.originalName,
        });
      }
    });

    return apiResponse.ok(res, {
      success: true,
      message: 'OCR processing started',
      documentId,
      status: 'pending',
    });

  } catch (error) {
    logger.error('[OCR] OCR API error', {
      error: error instanceof Error ? error.message : String(error),
      projectId: req.query.projectId,
      documentId: req.query.documentId,
      method: req.method,
    });

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCode.INTERNAL_ERROR,
      'Failed to process OCR request'
    );
  }
}

// SECURITY: This endpoint is tenant-protected using project-based resolution
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: querySchema,
    },
    rateLimit: 'ai', // Use AI rate limit since OCR processing is resource-intensive
  }
); 
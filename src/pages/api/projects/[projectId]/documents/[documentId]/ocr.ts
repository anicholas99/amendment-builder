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
 * Convert PDF to individual page images (same as working test page)
 */
async function convertPDFToImages(pdfBuffer: Buffer): Promise<Buffer[]> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-convert-'));
  const pdfPath = path.join(tempDir, 'input.pdf');
  
  let tempFiles: string[] = [pdfPath];
  
  try {
    // Write PDF to temp file
    await fs.writeFile(pdfPath, pdfBuffer);
    
    // Use pdf-poppler to convert PDF to images
    const poppler = await import('pdf-poppler');
    
    const opts = {
      format: 'png' as const,
      out_dir: tempDir,
      out_prefix: 'page',
      page: null, // Convert all pages
      scale: 1024, // Higher scale for better OCR accuracy
    };
    
    await poppler.convert(pdfPath, opts);
    
    // Read all generated images
    const files = await fs.readdir(tempDir);
    const imageFiles = files
      .filter(f => f.startsWith('page') && f.endsWith('.png'))
      .sort(); // Ensure correct page order
    
    const images: Buffer[] = [];
    
    for (const file of imageFiles) {
      const imagePath = path.join(tempDir, file);
      tempFiles.push(imagePath);
      const imageBuffer = await fs.readFile(imagePath);
      images.push(imageBuffer);
    }
    
    logger.info('[OCR] PDF converted to images', {
      pageCount: images.length,
      tempDir,
    });
    
    return images;
  } catch (error) {
    logger.error('[OCR] PDF to images conversion failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error('Failed to convert PDF to images');
  } finally {
    // Clean up temp files
    for (const file of tempFiles) {
      try {
        await fs.unlink(file);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    try {
      await fs.rmdir(tempDir);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}



/**
 * Check if a document is a CLAIM document that needs strikethrough removal
 */
function isClaimDoc(document: any): boolean {
  // Check USPTO document code (primary indicator)
  if (document.usptoDocumentCode) {
    const code = document.usptoDocumentCode.toUpperCase();
    if (code === 'CLM' || code.includes('CLAIM')) {
      return true;
    }
  }
  
  // Check filename as secondary indicator
  if (document.originalName) {
    const filename = document.originalName.toUpperCase();
    if (filename.includes('CLM') || filename.includes('CLAIM')) {
      return true;
    }
  }
  
  // Check document category
  if (document.documentCategory) {
    const category = document.documentCategory.toLowerCase();
    if (category === 'claims' || category.includes('claim')) {
      return true;
    }
  }
  
  return false;
}

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

        // Check if this is a CLAIM document that needs strikethrough removal
        const isClaimDocument = isClaimDoc(document);
        
        // Declare fileObject variable that will be used for text extraction
        let fileObject: any;
        
        // If it's a claim document, preprocess with strikethrough removal
        if (isClaimDocument) {
          logger.info('[OCR] Claim document detected - applying strikethrough removal', {
            documentId,
            fileName: document.originalName,
            usptoDocumentCode: (document as any).usptoDocumentCode,
          });
          
          try {
            // Import our strikethrough removal function
            const { removeStrikethroughsCanvas } = await import('@/lib/image-processing/strikethrough-removal');
            
            // Read the PDF file
            const pdfBuffer = await fs.readFile(tempFilePath);
            
            // Convert PDF to images first (same as working test page)
            const images = await convertPDFToImages(pdfBuffer);
            
            // Apply strikethrough removal to each image and process with OCR
            let allExtractedText = '';
            
            for (let i = 0; i < images.length; i++) {
              try {
                // Apply strikethrough removal to this page
                const processedImage = await removeStrikethroughsCanvas(images[i]);
                
                logger.debug('[OCR] Processed page for strikethrough removal', {
                  documentId,
                  pageNumber: i + 1,
                  originalSize: images[i].length,
                  processedSize: processedImage.length,
                });
                
                // Extract text from processed image using Azure Computer Vision
                const { AzureComputerVisionOCRService } = await import('@/server/services/azure-computer-vision-ocr.server-service');
                const ocrResult = await AzureComputerVisionOCRService.extractTextFromDocument(
                  processedImage,
                  { language: 'en' }
                );
                
                // Add page text with separator
                if (allExtractedText) {
                  allExtractedText += '\n\n=== Page ' + (i + 1) + ' ===\n\n';
                }
                allExtractedText += ocrResult.content;
                
                logger.debug('[OCR] Page OCR completed', {
                  documentId,
                  pageNumber: i + 1,
                  confidence: ocrResult.metadata.confidence,
                  textLength: ocrResult.content.length,
                });
                
              } catch (pageError) {
                logger.warn('[OCR] Page processing failed, using original image', {
                  documentId,
                  pageNumber: i + 1,
                  error: pageError instanceof Error ? pageError.message : String(pageError),
                });
                
                // Try OCR on original image for this page
                try {
                  const { AzureComputerVisionOCRService } = await import('@/server/services/azure-computer-vision-ocr.server-service');
                  const ocrResult = await AzureComputerVisionOCRService.extractTextFromDocument(
                    images[i],
                    { language: 'en' }
                  );
                  
                  if (allExtractedText) {
                    allExtractedText += '\n\n=== Page ' + (i + 1) + ' ===\n\n';
                  }
                  allExtractedText += ocrResult.content;
                } catch (ocrError) {
                  logger.error('[OCR] Page OCR also failed', {
                    documentId,
                    pageNumber: i + 1,
                    error: ocrError instanceof Error ? ocrError.message : String(ocrError),
                  });
                  
                  if (allExtractedText) {
                    allExtractedText += '\n\n=== Page ' + (i + 1) + ' ===\n\n';
                  }
                  allExtractedText += `[OCR failed for page ${i + 1}]`;
                }
              }
            }
            
            // Save the extracted text directly
            await projectDocumentRepository.updateOCRResult(documentId, allExtractedText);
            
            logger.info('[OCR] Strikethrough removal and OCR completed', {
              documentId,
              originalSize: pdfBuffer.length,
              pagesProcessed: images.length,
              totalTextLength: allExtractedText.length,
            });
            
            // Skip the normal OCR processing since we already did it
            return;
            
            // Clean up original temp file
            await fs.unlink(tempFilePath);
            
          } catch (strikethroughError) {
            logger.warn('[OCR] Strikethrough removal failed, proceeding with original document', {
              documentId,
              error: strikethroughError instanceof Error ? strikethroughError.message : String(strikethroughError),
            });
            
            // Fall back to original file if strikethrough removal fails
            fileObject = {
              filepath: tempFilePath,
              originalFilename: document.originalName,
              mimetype: 'application/pdf',
              size: 0,
            };
          }
        } else {
          // Regular document - create file object normally
          fileObject = {
            filepath: tempFilePath,
            originalFilename: document.originalName,
            mimetype: 'application/pdf',
            size: 0,
          };
        }

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

        // Clean up temp file(s)
        try {
          await fs.unlink(fileObject.filepath);
        } catch (cleanupError) {
          logger.warn('[OCR] Failed to clean up temp file', {
            tempFile: fileObject.filepath,
            error: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
          });
        }

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
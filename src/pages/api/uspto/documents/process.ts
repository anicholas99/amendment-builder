import type { NextApiResponse } from 'next';
import { z } from 'zod';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { AuthenticatedRequest } from '@/types/middleware';
import { apiResponse } from '@/utils/api/responses';
import { downloadOfficeAction } from '@/lib/api/uspto/services/officeActionService';
import { uploadToStorage } from '@/server/services/storageService';
import { createOfficeAction } from '@/repositories/officeActionRepository';
import { OfficeActionStatus } from '@prisma/client';
import { extractTextFromDocument } from '@/server/services/textExtractionService';
import { v4 as uuidv4 } from 'uuid';
import { setImmediate } from 'timers';

const apiLogger = createApiLogger('uspto-process-document');

// Request body schema
const requestSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required'),
  projectId: z.string().uuid('Project ID must be a valid UUID'),
  applicationNumber: z.string().optional(),
  documentMetadata: z.object({
    documentCode: z.string().optional(),
    description: z.string().optional(),
    mailDate: z.string().optional(),
  }).optional(),
});

/**
 * USPTO Document Processing API Handler
 * Downloads a USPTO document and initiates processing for Office Action analysis
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  apiLogger.logRequest(req);

  if (req.method !== 'POST') {
    throw new ApplicationError(
      ErrorCode.VALIDATION_FAILED,
      `Method ${req.method} not allowed`
    );
  }

  try {
    const { documentId, projectId, applicationNumber, documentMetadata } = requestSchema.parse(req.body);
    const { userId, tenantId } = req.user!;

    apiLogger.info('Processing USPTO document', {
      documentId,
      projectId,
      userId,
      tenantId,
    });

    // Download the document from USPTO
    const pdfBuffer = await downloadOfficeAction(documentId);

    // Generate storage path
    const blobName = `office-actions/${projectId}/${uuidv4()}.pdf`;
    
    // Upload to permanent storage
    const uploadResult = await uploadToStorage({
      buffer: Buffer.from(pdfBuffer),
      containerName: 'office-actions',
      blobName,
      contentType: 'application/pdf',
      metadata: {
        documentId,
        source: 'USPTO',
        projectId,
        userId,
        applicationNumber: applicationNumber || '',
      },
    });

    // Create Office Action record
    const officeAction = await createOfficeAction({
      projectId,
      tenantId: tenantId!,
      oaNumber: documentId,
      dateIssued: documentMetadata?.mailDate ? new Date(documentMetadata.mailDate) : null,
      originalFileName: `USPTO-${documentId}.pdf`,
      fileUrl: uploadResult.url,
      blobPath: blobName,
      status: OfficeActionStatus.PENDING,
      metadata: {
        source: 'USPTO',
        documentCode: documentMetadata?.documentCode,
        description: documentMetadata?.description,
        usptoDocumentId: documentId,
      },
    });

    // Generate a job ID for tracking
    const jobId = `uspto-process-${officeAction.id}`;

    // Process document asynchronously
    setImmediate(async () => {
      try {
        apiLogger.info('Starting async USPTO document processing', {
          jobId,
          officeActionId: officeAction.id,
        });

        // Extract text from PDF
        const extractedText = await extractTextFromDocument(
          Buffer.from(pdfBuffer),
          'application/pdf'
        );

        // Update Office Action with extracted text
        await updateOfficeAction(officeAction.id, {
          extractedText,
          status: OfficeActionStatus.TEXT_EXTRACTED,
        });

        apiLogger.info('USPTO document text extraction completed', {
          jobId,
          officeActionId: officeAction.id,
          textLength: extractedText.length,
        });

        // Here you would trigger further processing:
        // - Parse rejections
        // - Extract citations
        // - Generate analysis
        // This integrates with your existing OA processing pipeline

      } catch (error) {
        apiLogger.errorSafe('Failed to process USPTO document', error as Error);
        
        // Update status to failed
        await updateOfficeAction(officeAction.id, {
          status: OfficeActionStatus.PROCESSING_FAILED,
          metadata: {
            ...officeAction.metadata,
            processingError: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    });

    apiLogger.info('USPTO document processing initiated', {
      officeActionId: officeAction.id,
      jobId,
    });

    return apiResponse.ok(res, {
      success: true,
      data: {
        jobId,
        officeActionId: officeAction.id,
        status: 'processing',
      },
    });
  } catch (error) {
    apiLogger.errorSafe('Failed to initiate USPTO document processing', error as Error);
    
    if (error instanceof ApplicationError) {
      throw error;
    }
    
    throw new ApplicationError(
      ErrorCode.API_NETWORK_ERROR,
      'Failed to process USPTO document'
    );
  }
}

// Helper function to update Office Action (import from repository in real implementation)
async function updateOfficeAction(id: string, data: any) {
  // This would use the actual repository method
  // For now, it's a placeholder
  return { id, ...data };
}

// SECURITY: This endpoint is tenant-protected using project-based resolution
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      body: requestSchema,
    },
    rateLimit: 'ai', // Use AI rate limit since this involves processing
  }
);
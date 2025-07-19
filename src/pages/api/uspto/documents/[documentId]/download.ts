import type { NextApiResponse } from 'next';
import { z } from 'zod';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { SecurePresets } from '@/server/api/securePresets';
import { AuthenticatedRequest } from '@/types/middleware';
import { apiResponse } from '@/utils/api/responses';
import { downloadOfficeAction } from '@/lib/api/uspto/services/officeActionService';
import { v4 as uuidv4 } from 'uuid';
import { uploadToStorage } from '@/server/services/storageService';
import { logAIOperation } from '@/server/services/aiAuditService';

const apiLogger = createApiLogger('uspto-document-download');

// Query schema
const querySchema = z.object({
  documentId: z.string().min(1, 'Document ID is required'),
});

/**
 * USPTO Document Download API Handler
 * Downloads a document from USPTO and stores it temporarily
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  apiLogger.logRequest(req);

  if (req.method !== 'GET') {
    throw new ApplicationError(
      ErrorCode.VALIDATION_FAILED,
      `Method ${req.method} not allowed`
    );
  }

  try {
    const { documentId } = querySchema.parse(req.query);
    const { userId, tenantId } = req.user!;

    apiLogger.info('Downloading USPTO document', {
      documentId,
      userId,
      tenantId,
    });

    // Download the document from USPTO
    const pdfBuffer = await downloadOfficeAction(documentId);

    // Generate a temporary filename
    const tempFileName = `uspto-document-${documentId}-${uuidv4()}.pdf`;
    
    // Upload to blob storage for temporary access
    const uploadResult = await uploadToStorage({
      buffer: Buffer.from(pdfBuffer),
      containerName: 'temp-downloads',
      blobName: tempFileName,
      contentType: 'application/pdf',
      metadata: {
        documentId,
        source: 'USPTO',
        userId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      },
    });

    // Log the operation
    await logAIOperation({
      tenantId: tenantId!,
      userId: userId!,
      projectId: null,
      operationType: 'uspto_document_download',
      model: 'USPTO API',
      prompt: `Download document ${documentId}`,
      response: `Document downloaded successfully (${pdfBuffer.byteLength} bytes)`,
      tokenUsage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
      cost: 0,
      metadata: {
        documentId,
        size: pdfBuffer.byteLength,
        storageUrl: uploadResult.url,
      },
    });

    apiLogger.info('USPTO document downloaded successfully', {
      documentId,
      size: pdfBuffer.byteLength,
    });

    return apiResponse.ok(res, {
      success: true,
      data: {
        documentId,
        filename: `USPTO-Document-${documentId}.pdf`,
        contentType: 'application/pdf',
        size: pdfBuffer.byteLength,
        downloadUrl: uploadResult.url,
      },
    });
  } catch (error) {
    apiLogger.errorSafe('Failed to download USPTO document', error as Error);
    
    if (error instanceof ApplicationError) {
      throw error;
    }
    
    throw new ApplicationError(
      ErrorCode.API_NETWORK_ERROR,
      'Failed to download document from USPTO'
    );
  }
}

// SECURITY: Requires authentication for tracking and rate limiting
export default SecurePresets.userPrivate(handler, {
  validate: {
    query: querySchema,
  },
  rateLimit: 'search',
});
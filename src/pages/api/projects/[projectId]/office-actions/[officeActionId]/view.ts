/**
 * Office Action Document Viewer API Endpoint
 * 
 * GET /api/projects/[projectId]/office-actions/[officeActionId]/view
 * 
 * Serves Office Action PDF documents for inline viewing in the DocumentViewer
 * Follows security patterns with tenant isolation and proper access control
 */

import { NextApiResponse } from 'next';
import { z } from 'zod';
import { AuthenticatedRequest } from '@/types/middleware';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';

import { findOfficeActionById } from '@/repositories/officeActionRepository';

const apiLogger = createApiLogger('office-actions/view');

// ============ VALIDATION SCHEMAS ============

const querySchema = z.object({
  projectId: z.string().uuid('Invalid project ID format'),
  officeActionId: z.string().uuid('Invalid office action ID format'),
});

// ============ HANDLER ============

/**
 * Office Action Document Viewer Handler
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
    // Validate query parameters
    const { projectId, officeActionId } = querySchema.parse(req.query);
    const { id: userId, tenantId } = req.user!;

    if (!tenantId) {
      throw new ApplicationError(
        ErrorCode.TENANT_NOT_FOUND,
        'Tenant context is required'
      );
    }

    // Get office action and verify access
    const officeAction = await findOfficeActionById(officeActionId, tenantId);
    
    if (!officeAction) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'Office Action not found'
      );
    }

    // Verify it belongs to the project
    if (officeAction.projectId !== projectId) {
      throw new ApplicationError(
        ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
        'Office Action does not belong to this project'
      );
    }

    // Check if document has blob storage reference
    if (!officeAction.blobName) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'Office Action document not found in storage'
      );
    }

    apiLogger.info('Office Action document access authorized', {
      officeActionId,
      projectId,
      userId,
      tenantId,
      fileName: officeAction.originalFileName,
    });

    // Get document stream from Azure blob storage
    const { BlobServiceClient } = await import('@azure/storage-blob');
    const { environment } = await import('@/config/environment');

    const connectionString = environment.azure.storageConnectionString;
    if (!connectionString) {
      throw new ApplicationError(
        ErrorCode.CONFIG_MISSING,
        'Azure Storage connection string not configured'
      );
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient('office-actions-private');
    const blockBlobClient = containerClient.getBlockBlobClient(officeAction.blobName);

    // Check if blob exists
    const exists = await blockBlobClient.exists();
    if (!exists) {
      apiLogger.error('Office Action blob not found in storage', {
        blobName: officeAction.blobName,
        officeActionId,
      });
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'Office Action document not found in storage'
      );
    }

    // Get blob properties
    const properties = await blockBlobClient.getProperties();
    const contentType = properties.contentType || 'application/pdf';
    const fileName = officeAction.originalFileName || 'office-action.pdf';

    // Get download stream
    const downloadResponse = await blockBlobClient.download();
    if (!downloadResponse.readableStreamBody) {
      throw new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        'Failed to get document stream'
      );
    }

    const stream = downloadResponse.readableStreamBody as NodeJS.ReadableStream;

    // Set headers for inline viewing
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    
    // Cache headers for better performance
    res.setHeader('Cache-Control', 'private, max-age=3600'); // 1 hour cache
    res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Security: prevent embedding in other sites

    // Stream the document
    stream.pipe(res);

    apiLogger.info('Office Action document served successfully', {
      officeActionId,
      fileName,
      contentType,
    });

  } catch (error) {
    apiLogger.error('Failed to serve Office Action document', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCode.INTERNAL_ERROR,
      'Failed to serve Office Action document'
    );
  }
}

// ============ EXPORT WITH SECURITY ============

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: querySchema,
    },
    rateLimit: 'resource', // Higher limit for document viewing
  }
); 
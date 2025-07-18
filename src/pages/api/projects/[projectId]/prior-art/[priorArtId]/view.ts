/**
 * Prior Art Document Viewer API Endpoint
 * 
 * GET /api/projects/[projectId]/prior-art/[priorArtId]/view
 * 
 * Serves Prior Art PDF documents for inline viewing in the DocumentViewer
 * Leverages existing SavedPriorArt infrastructure with proper security
 */

import { NextApiResponse } from 'next';
import { z } from 'zod';
import { AuthenticatedRequest } from '@/types/middleware';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';

const apiLogger = createApiLogger('prior-art/view');

// ============ VALIDATION SCHEMAS ============

const querySchema = z.object({
  projectId: z.string().uuid('Invalid project ID format'),
  priorArtId: z.string().uuid('Invalid prior art ID format'),
});

// ============ HANDLER ============

/**
 * Prior Art Document Viewer Handler
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
    const { projectId, priorArtId } = querySchema.parse(req.query);
    const { id: userId, tenantId } = req.user!;

    if (!tenantId) {
      throw new ApplicationError(
        ErrorCode.TENANT_NOT_FOUND,
        'Tenant context is required'
      );
    }

    // Import prisma dynamically
    const { prisma } = await import('@/lib/prisma');

    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        'Database connection unavailable'
      );
    }

    // Verify the prior art exists and user has access
    const priorArt = await prisma.savedPriorArt.findFirst({
      where: {
        id: priorArtId,
        projectId,
        project: {
          tenantId,
        },
      },
      select: {
        id: true,
        title: true,
        storageUrl: true,
        patentNumber: true,
      } as any,
    }) as any;

    if (!priorArt) {
      apiLogger.warn('Prior art not found or access denied', {
        priorArtId,
        projectId,
        userId,
      });
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'Prior art not found or access denied'
      );
    }

    if (!priorArt.storageUrl) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'Prior art document not found in storage'
      );
    }

    apiLogger.info('Prior art document access authorized', {
      priorArtId,
      projectId,
      userId,
      tenantId,
      patentNumber: priorArt.patentNumber,
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
    const containerClient = blobServiceClient.getContainerClient('patent-files-private');
    const blockBlobClient = containerClient.getBlockBlobClient(priorArt.storageUrl);

    // Check if blob exists
    const exists = await blockBlobClient.exists();
    if (!exists) {
      apiLogger.error('Prior art blob not found in storage', {
        blobName: priorArt.storageUrl,
        priorArtId,
      });
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'Prior art document not found in storage'
      );
    }

    // Get blob properties
    const properties = await blockBlobClient.getProperties();
    const contentType = properties.contentType || 'application/pdf';
    const fileName = priorArt.title || priorArt.patentNumber || 'prior-art.pdf';

    // Get download stream
    const downloadResponse = await blockBlobClient.download();
    if (!downloadResponse.readableStreamBody) {
      throw new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        'Failed to get document stream'
      );
    }

    // Set headers for inline viewing
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    
    // Cache headers for better performance
    res.setHeader('Cache-Control', 'private, max-age=3600'); // 1 hour cache
    res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Security: prevent embedding in other sites

    // Stream the document
    const stream = downloadResponse.readableStreamBody as NodeJS.ReadableStream;
    stream.pipe(res);

    apiLogger.info('Prior art document served successfully', {
      priorArtId,
      patentNumber: priorArt.patentNumber,
      contentType,
    });

  } catch (error) {
    apiLogger.error('Failed to serve prior art document', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCode.INTERNAL_ERROR,
      'Failed to serve prior art document'
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
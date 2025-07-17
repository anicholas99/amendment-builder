import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/server/logger';
import { z } from 'zod';
import { BlobServiceClient } from '@azure/storage-blob';
import { environment } from '@/config/environment';

const querySchema = z.object({
  projectId: z.string().uuid(),
  fileId: z.string().uuid(),
});

const PATENT_FILES_CONTAINER = 'patent-files-private';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only GET requests are accepted',
    });
  }

  try {
    const { projectId, fileId } = querySchema.parse(req.query);
    const { id: userId, tenantId } = req.user!;

    if (!tenantId) {
      throw new Error(
        'Tenant ID is required but was not provided by middleware'
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

    // Verify the file exists and user has access
    const priorArt = (await prisma.savedPriorArt.findFirst({
      where: {
        id: fileId,
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
    })) as any;

    if (!priorArt) {
      logger.warn('[PatentFileDownload] File not found or access denied', {
        fileId,
        projectId,
        userId,
      });
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'File not found or access denied'
      );
    }

    if (!priorArt.storageUrl) {
      throw new ApplicationError(
        ErrorCode.STORAGE_DOWNLOAD_FAILED,
        'File has no associated storage URL'
      );
    }

    const connectionString = environment.azure.storageConnectionString;
    if (!connectionString) {
      throw new ApplicationError(
        ErrorCode.CONFIG_MISSING,
        'Azure Storage connection string not configured'
      );
    }

    // Get the file from blob storage
    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(
      PATENT_FILES_CONTAINER
    );
    const blockBlobClient = containerClient.getBlockBlobClient(
      priorArt.storageUrl
    );

    // Check if blob exists
    const exists = await blockBlobClient.exists();
    if (!exists) {
      logger.error('[PatentFileDownload] Blob not found in storage', {
        blobName: priorArt.storageUrl,
        fileId,
      });
      throw new ApplicationError(
        ErrorCode.STORAGE_DOWNLOAD_FAILED,
        'File not found in storage'
      );
    }

    // Get blob properties
    const properties = await blockBlobClient.getProperties();
    const contentType = properties.contentType || 'application/octet-stream';

    // Get download stream
    const downloadResponse = await blockBlobClient.download();

    if (!downloadResponse.readableStreamBody) {
      throw new ApplicationError(
        ErrorCode.STORAGE_DOWNLOAD_FAILED,
        'Failed to get file stream'
      );
    }

    logger.info('[PatentFileDownload] File download authorized', {
      fileId,
      projectId,
      userId,
      filename: priorArt.title,
    });

    // Set response headers
    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${priorArt.title || priorArt.patentNumber || 'patent-document'}.pdf"`
    );

    if (properties.contentLength) {
      res.setHeader('Content-Length', properties.contentLength);
    }

    // Stream the file to the response
    const stream = downloadResponse.readableStreamBody as NodeJS.ReadableStream;
    stream.pipe(res);
  } catch (error) {
    logger.error('[PatentFileDownload] Download failed', {
      userId: req.user?.id,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof ApplicationError) {
      return res.status(error.statusCode || 400).json({
        error: error.code,
        message: error.message,
      });
    }

    return res.status(500).json({
      error: ErrorCode.INTERNAL_ERROR,
      message: 'Failed to download file',
    });
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
    rateLimit: 'api',
  }
);

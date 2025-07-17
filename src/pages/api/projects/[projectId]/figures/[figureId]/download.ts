import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { StorageServerService } from '@/server/services/storage.server-service';
import { SecurePresets } from '@/server/api/securePresets';
import { FigureStatus } from '@/constants/database-enums';
import { sendSafeErrorResponse } from '@/utils/secureErrorResponse';
import { ApplicationError } from '@/lib/error';

const apiLogger = createApiLogger('projects/figures/download');

// Query validation
const querySchema = z.object({
  projectId: z.string(),
  figureId: z.string(),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectId, figureId } = req.query as z.infer<typeof querySchema>;
  const userId = req.user!.id;

  // Get tenant from the project (already validated by withTenantGuard)
  const { resolveTenantIdFromProject } = await import(
    '@/repositories/tenantRepository'
  );
  const tenantId = await resolveTenantIdFromProject(projectId);

  if (!tenantId) {
    return res.status(404).json({ error: 'Project not found' });
  }

  try {
    apiLogger.debug('Secure figure download requested', {
      projectId,
      figureId,
      userId,
      tenantId,
    });

    // Import prisma dynamically to avoid initialization issues
    const { prisma } = await import('@/lib/prisma');

    if (!prisma) {
      apiLogger.error('Database connection not available');
      return res.status(500).json({ error: 'Database connection error' });
    }

    // First check if the figure exists and has been uploaded
    const figure = (await prisma.projectFigure.findFirst({
      where: {
        id: figureId,
        projectId,
        deletedAt: null,
      },
    })) as any; // Type assertion due to Prisma type generation lag

    if (!figure) {
      apiLogger.warn('Figure not found', { figureId, projectId });
      return res.status(404).json({ error: 'Figure not found' });
    }

    // Only log details in debug mode
    apiLogger.debug('Figure found for download', {
      figureId,
      projectId,
      figureKey: figure.figureKey,
      status: figure.status,
      blobName: figure.blobName,
      fileName: figure.fileName,
    });

    // Check if the figure has been uploaded
    if (figure.status === FigureStatus.PENDING) {
      apiLogger.info('Figure is pending upload', { figureId, projectId });
      return res
        .status(404)
        .json({ error: 'Figure has not been uploaded yet' });
    }

    /**
     * ---------------------
     *  Caching with ETag
     * ---------------------
     * We allow the browser to cache the image but force it to re-validate on every request.
     * This keeps images fresh (they can be reassigned) while saving bandwidth when unchanged.
     */

    let etagValue: string | null = null;
    if (figure.blobName) {
      const crypto = await import('crypto');
      etagValue = `"${crypto
        .createHash('md5')
        .update(figure.blobName)
        .digest('hex')}"`;

      // If client already has the latest version, short-circuit.
      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch && ifNoneMatch === etagValue) {
        apiLogger.debug('ETag matches – returning 304', {
          figureId,
          etagValue,
        });
        res.setHeader(
          'Cache-Control',
          'private, no-cache, max-age=0, must-revalidate'
        );
        res.setHeader('ETag', etagValue);
        return res.status(304).end();
      }
    }

    // Download with access control – only executed when a new version is needed
    const { stream, contentType, fileName } =
      await StorageServerService.downloadFigure(figureId, userId, tenantId);

    apiLogger.debug('Serving figure download', {
      figureId,
      fileName,
      contentType,
      figureKey: figure.figureKey,
      blobName: figure.blobName,
    });

    // Response headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

    // Allow client caching but require re-validation
    res.setHeader(
      'Cache-Control',
      'private, no-cache, max-age=0, must-revalidate'
    );
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (etagValue) {
      res.setHeader('ETag', etagValue);
    }

    // Stream the file body
    stream.pipe(res);

    // Only log completion in debug mode
    apiLogger.debug('Figure download completed', {
      figureId,
      fileName,
      userId,
    });
  } catch (error) {
    apiLogger.error('Figure download failed', {
      figureId,
      projectId,
      userId,
      error: error instanceof Error ? error : String(error),
    });

    // Check for specific error types to set appropriate status codes
    if (error instanceof Error && error.message.includes('access denied')) {
      sendSafeErrorResponse(res, error, 403, 'Access denied');
      return;
    }

    if (error instanceof Error && error.message.includes('not found')) {
      sendSafeErrorResponse(res, error, 404, 'Figure not found');
      return;
    }

    if (error instanceof ApplicationError) {
      sendSafeErrorResponse(res, error, error.statusCode || 500, error.message);
      return;
    }

    sendSafeErrorResponse(res, error, 500, 'Download failed');
  }
}

// Tenant resolver for security - resolve tenant from project
const resolveTenantId = async (req: NextApiRequest): Promise<string | null> => {
  const { projectId } = req.query;
  if (!projectId || typeof projectId !== 'string') {
    return null;
  }

  const { resolveTenantIdFromProject } = await import(
    '@/repositories/tenantRepository'
  );
  return resolveTenantIdFromProject(projectId);
};

// Use browserAccessible preset since images are loaded directly by the browser
// without custom headers like x-tenant-slug
export default SecurePresets.browserAccessible(resolveTenantId, handler, {
  validate: {
    query: querySchema,
  },
  rateLimit: 'resource', // Use higher limit for browser resources
});

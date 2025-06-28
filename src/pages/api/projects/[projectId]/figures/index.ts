import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { StorageServerService } from '@/server/services/storage.server-service';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { figureRepository } from '@/repositories/figureRepository';
import { sendSafeErrorResponse } from '@/utils/secure-error-response';

const apiLogger = createApiLogger('projects/figures');

// Query validation for projectId
const querySchema = z.object({
  projectId: z.string(),
});

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  apiLogger.logRequest(req);

  const { projectId } = req.query as z.infer<typeof querySchema>;

  if (!projectId || typeof projectId !== 'string') {
    throw new ApplicationError(
      ErrorCode.VALIDATION_REQUIRED_FIELD,
      'Project ID is required'
    );
  }

  try {
    if (req.method === 'GET') {
      // Check if the request wants elements included
      const includeElements = req.query.includeElements === 'true';

      if (includeElements) {
        // Get figures with their elements using the new normalized structure
        apiLogger.info('Getting figures with elements for project', {
          projectId,
        });

        const figures =
          await figureRepository.getFiguresWithElements(projectId);

        apiLogger.info('Successfully retrieved figures with elements', {
          projectId,
          figureCount: figures.length,
        });

        return res.status(200).json({ figures });
      } else {
        // Get figures for the project (legacy format)
        apiLogger.info('Getting figures for project', { projectId });

        // User and tenant are guaranteed by the secure preset
        const userId = req.user!.id;
        const tenantId = req.user!.tenantId!;

        // Import and use the repository
        const { listProjectFigures } = await import(
          '@/repositories/figureRepository'
        );
        const figures = await listProjectFigures(projectId, userId, tenantId);

        // Transform to API response format
        const responseData = figures.map(figure => ({
          id: figure.id,
          status: (figure as any).status || 'UPLOADED', // Include status field, default to UPLOADED for backwards compatibility
          figureKey: figure.figureKey,
          fileName: figure.fileName,
          description: figure.description,
          url: `/api/projects/${projectId}/figures/${figure.id}/download`,
          uploadedAt: figure.createdAt,
          sizeBytes: figure.sizeBytes,
          mimeType: figure.mimeType,
        }));

        return res.status(200).json({ figures: responseData });
      }
    }

    if (req.method === 'POST') {
      // Upload new figure
      apiLogger.info('Uploading figure for project', { projectId });

      // Tenant ID is guaranteed by the secure preset
      const tenantId = req.user!.tenantId!;

      // Call the storage service to handle the secure upload
      const response = await StorageServerService.uploadFigure(req, tenantId);

      apiLogger.info('Figure uploaded successfully', {
        projectId,
        figureId: response.id,
        fileName: response.fileName,
        secureUrl: response.url,
      });

      apiLogger.logResponse(201, response);
      return res.status(201).json(response);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    apiLogger.error('Failed to list figures', {
      projectId,
      error: error instanceof Error ? error : String(error),
    });

    if (error instanceof ApplicationError) {
      sendSafeErrorResponse(res, error, error.statusCode || 500, error.message);
      return;
    }

    sendSafeErrorResponse(
      res,
      error,
      500,
      'Failed to retrieve figures. Please try again later.'
    );
  }
}

// Use the new secure preset
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

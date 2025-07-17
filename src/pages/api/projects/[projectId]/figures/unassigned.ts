import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { listUnassignedProjectFigures } from '@/repositories/figure';
import { sendSafeErrorResponse } from '@/utils/secureErrorResponse';
import { ApplicationError } from '@/lib/error';
import { apiResponse } from '@/utils/api/responses';

const apiLogger = createApiLogger('projects/figures/unassigned');

// Query validation
const querySchema = z.object({
  projectId: z.string(),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  apiLogger.logRequest(req);

  const { projectId } = req.query as z.infer<typeof querySchema>;

  try {
    if (req.method === 'GET') {
      // Get unassigned figures for the project
      apiLogger.info('Getting unassigned figures for project', { projectId });

      // User and tenant are guaranteed by the secure preset
      const userId = req.user!.id;
      const tenantId = req.user!.tenantId!;

      const figures = await listUnassignedProjectFigures(
        projectId,
        userId,
        tenantId
      );

      // Transform to API response format
      const responseData = figures.map(figure => ({
        id: figure.id,
        figureKey: figure.figureKey,
        fileName: figure.fileName,
        originalName: figure.fileName,
        description: figure.description,
        url: `/api/projects/${projectId}/figures/${figure.id}/download`,
        uploadedAt: figure.createdAt,
        sizeBytes: figure.sizeBytes,
        mimeType: figure.mimeType,
      }));

      apiLogger.info('Found unassigned figures', {
        projectId,
        count: responseData.length,
      });

      return apiResponse.ok(res, { figures: responseData });
    }

    return apiResponse.methodNotAllowed(res, ['GET']);
  } catch (error) {
    apiLogger.error('Failed to fetch unassigned figures', {
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
      'Failed to fetch unassigned figures. Please try again later.'
    );
  }
}

// Use the new secure preset, which adds the missing tenant protection
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: querySchema,
    },
  }
);

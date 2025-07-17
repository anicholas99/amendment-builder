import { NextApiRequest, NextApiResponse } from 'next';
import { getProjectWorkspace } from '@/repositories/project/core.repository';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { AuthenticatedRequest } from '@/types/middleware';
import { ClaimData } from '@/types/claimTypes';
import { figureRepository } from '@/repositories/figure';
import { sendSafeErrorResponse } from '@/utils/secureErrorResponse';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { z } from 'zod';
import { apiResponse } from '@/utils/api/responses';

// Query validation schema
const querySchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { projectId } = req.query as z.infer<typeof querySchema>;
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    throw new ApplicationError(
      ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
      'Tenant ID not found'
    );
  }

  if (req.method !== 'GET') {
    return apiResponse.methodNotAllowed(res, ['GET']);
  }

  try {
    const rawWorkspaceData = await getProjectWorkspace(projectId, tenantId);

    // This check is important because the repository can return null
    if (!rawWorkspaceData) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'Project not found'
      );
    }

    // Also fetch figures with elements for the normalized data
    const figuresWithElements =
      await figureRepository.getFiguresWithElements(projectId);

    // Transform data to match the DTO, ensuring dates are strings
    const workspaceData = {
      ...rawWorkspaceData,
      invention: rawWorkspaceData.invention
        ? {
            ...rawWorkspaceData.invention,
            createdAt: rawWorkspaceData.invention.createdAt.toISOString(),
            updatedAt: rawWorkspaceData.invention.updatedAt.toISOString(),
            claimSyncedAt:
              rawWorkspaceData.invention.claimSyncedAt?.toISOString(),
          }
        : null,
      claims:
        rawWorkspaceData.invention?.claims.map(
          (c: any) =>
            ({
              ...c,
              dependsOn: null,
              projectId: projectId,
              createdAt: c.createdAt.toISOString(),
              updatedAt: c.updatedAt.toISOString(),
            }) as ClaimData
        ) ?? [],
      figures: rawWorkspaceData.figures.map((f: any) => ({
        ...f,
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
        deletedAt: f.deletedAt?.toISOString() ?? undefined,
        figureKey: f.figureKey ?? undefined,
        description: f.description ?? undefined,
      })),
      figuresWithElements: figuresWithElements,
    };

    return apiResponse.ok(res, {
      success: true,
      data: workspaceData,
    });
  } catch (error) {
    if (error instanceof ApplicationError) {
      sendSafeErrorResponse(
        res,
        error,
        error.statusCode || 500,
        error.message // ApplicationError messages are meant to be user-safe
      );
      return;
    }

    logger.error('Failed to get workspace data', { error, projectId });
    sendSafeErrorResponse(
      res,
      error,
      500,
      'Failed to retrieve workspace data. Please try again later.'
    );
  }
}

// SECURITY: This endpoint is tenant-protected using project-based resolution
// Users can only access workspace data for projects within their own tenant
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

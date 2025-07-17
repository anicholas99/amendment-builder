import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import {
  updateProjectFigure,
  deleteProjectFigure,
  assignFigureToSlot,
  getProjectFigure,
  unassignFigure,
} from '@/repositories/figure';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { sendSafeErrorResponse } from '@/utils/secureErrorResponse';
import { apiResponse } from '@/utils/api/responses';

const apiLogger = createApiLogger('projects/figures/[figureId]');

// Query validation
const querySchema = z.object({
  projectId: z.string(),
  figureId: z.string(),
});

// Body validation for PATCH
const updateBodySchema = z.object({
  figureKey: z.string().nullable().optional(),
  description: z.string().optional(),
  unassign: z.boolean().optional(),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  apiLogger.logRequest(req);

  const { projectId, figureId } = req.query as z.infer<typeof querySchema>;
  // User and tenant are guaranteed by the secure preset
  const userId = req.user!.id;
  const tenantId = req.user!.tenantId!;

  try {
    switch (req.method) {
      case 'PATCH': {
        // Update figure metadata (figureKey or description)
        const body = updateBodySchema.parse(req.body);

        // First get the current figure to determine the operation type
        const currentFigure = await getProjectFigure(
          figureId,
          userId,
          tenantId
        );

        if (!currentFigure) {
          return apiResponse.notFound(res, 'Figure not found or access denied');
        }

        // Check if this is an unassignment operation
        if (body.unassign === true) {
          // This is an unassignment operation
          apiLogger.info('Unassigning figure', {
            figureId,
            figureKey: currentFigure.figureKey,
            userId,
          });

          const unassignedFigure = await unassignFigure(
            figureId,
            userId,
            tenantId
          );

          apiLogger.logResponse(200, unassignedFigure);
          return apiResponse.ok(res, unassignedFigure);
        }

        // Check if this is an assignment operation
        // Assignment happens when we're setting a figureKey on an uploaded figure
        if (
          body.figureKey &&
          currentFigure.status === 'UPLOADED' &&
          !currentFigure.figureKey
        ) {
          // This is an assignment operation
          apiLogger.info('Assigning uploaded figure to pending slot', {
            uploadedFigureId: figureId,
            targetFigureKey: body.figureKey,
            userId,
          });

          const assignedFigure = await assignFigureToSlot(
            figureId,
            body.figureKey,
            userId,
            tenantId
          );

          apiLogger.logResponse(200, assignedFigure);
          return apiResponse.ok(res, assignedFigure);
        }

        // Regular update operation
        const updates: { figureKey?: string | null; description?: string } = {};

        if (body.figureKey !== undefined) {
          // Allow null/empty string to clear figureKey
          updates.figureKey = body.figureKey || null;
        }

        if (body.description !== undefined) {
          updates.description = body.description;
        }

        apiLogger.info('Updating figure', {
          projectId,
          figureId,
          updates,
          userId,
        });

        const updatedFigure = await updateProjectFigure(
          figureId,
          updates,
          userId,
          tenantId
        );

        if (!updatedFigure) {
          return apiResponse.notFound(res, 'Figure not found or access denied');
        }

        apiLogger.logResponse(200, updatedFigure);
        return apiResponse.ok(res, updatedFigure);
      }

      case 'DELETE': {
        // Delete figure
        apiLogger.info('Deleting figure', {
          projectId,
          figureId,
          userId,
        });

        const deleted = await deleteProjectFigure(figureId, userId, tenantId);

        if (!deleted) {
          return apiResponse.notFound(res, 'Figure not found or access denied');
        }

        apiLogger.logResponse(204);
        return res.status(204).end();
      }

      default:
        return apiResponse.methodNotAllowed(res, ['PATCH', 'DELETE']);
    }
  } catch (error) {
    apiLogger.error('Failed to update figure', {
      error: error instanceof Error ? error : String(error),
      figureId,
      projectId,
    });

    if (error instanceof ApplicationError) {
      sendSafeErrorResponse(res, error, error.statusCode || 500, error.message);
      return;
    }

    sendSafeErrorResponse(
      res,
      error,
      500,
      'Failed to update figure. Please try again later.'
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
  }
);

import { NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { findProjectForAccess } from '@/repositories/project/security.repository';
import { logger } from '@/server/logger';
import {
  createProjectFigure,
  listProjectFigures,
  updateProjectFigure,
} from '@/repositories/figure';
import { apiResponse } from '@/utils/api/responses';

const apiLogger = createApiLogger('projects/figures/create-pending');

// Query validation
const querySchema = z.object({
  projectId: z.string(),
});

// Body validation
const createPendingSchema = z.object({
  figureKey: z.string(), // e.g., "FIG. 4"
  description: z.string().optional(),
  title: z.string().optional(),
});

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
    if (req.method === 'POST') {
      // Create a pending figure slot
      const body = createPendingSchema.parse(req.body);
      const userId = req.user!.id;
      const tenantId = req.user!.tenantId!;

      apiLogger.info('Creating pending figure slot', {
        projectId,
        figureKey: body.figureKey,
        userId,
      });

      // Verify project belongs to tenant and user has access
      const project = await findProjectForAccess(projectId);

      if (
        !project ||
        project.userId !== userId ||
        project.tenantId !== tenantId
      ) {
        throw new ApplicationError(
          ErrorCode.PROJECT_ACCESS_DENIED,
          'Project not found or access denied'
        );
      }

      // Check if figure already exists by listing all figures and filtering
      const existingFigures = await listProjectFigures(
        projectId,
        userId,
        tenantId
      );

      const existingFigure = existingFigures.find(
        fig => fig.figureKey === body.figureKey
      );

      if (existingFigure) {
        // If it already exists, just return it (idempotent)
        logger.info('[API] Pending figure already exists', {
          projectId,
          figureKey: body.figureKey,
          figureId: existingFigure.id,
          status: existingFigure.status,
        });

        // Return complete figure data matching the frontend format
        const existingFigureResponse = {
          id: existingFigure.id,
          projectId: existingFigure.projectId,
          figureKey: existingFigure.figureKey,
          status: existingFigure.status || 'PENDING',
          description: existingFigure.description || '',
          title: body.title || `Figure ${body.figureKey}`,
          fileName: existingFigure.fileName || '',
          blobName: existingFigure.blobName || '',
          mimeType: existingFigure.mimeType || 'image/png',
          sizeBytes: existingFigure.sizeBytes || 0,
          displayOrder: 0,
          elements: [], // Empty elements array for consistency
          createdAt: existingFigure.createdAt,
        };

        return apiResponse.ok(res, existingFigureResponse);
      }

      // Create new pending figure using createProjectFigure
      const newFigure = await createProjectFigure(
        {
          projectId,
          figureKey: body.figureKey,
          fileName: '', // Empty for pending figures
          originalName: body.title || `Figure ${body.figureKey}`,
          blobName: '', // Empty for pending figures
          mimeType: 'image/png', // Default mime type
          sizeBytes: 0, // 0 for pending figures
          description: body.description || '',
          uploadedBy: userId,
        },
        tenantId
      );

      // Update the figure to be PENDING status if it was created as ASSIGNED
      if (newFigure.status !== 'PENDING') {
        const updatedFigure = await updateProjectFigure(
          newFigure.id,
          {
            status: 'PENDING',
            fileName: '',
            blobName: '',
            sizeBytes: 0,
          },
          userId,
          tenantId
        );

        logger.info('[API] Created and updated pending figure successfully', {
          projectId,
          figureKey: body.figureKey,
          figureId: updatedFigure?.id,
        });

        if (updatedFigure) {
          // Return complete figure data matching the frontend format
          const updatedFigureResponse = {
            id: updatedFigure.id,
            projectId: updatedFigure.projectId,
            figureKey: updatedFigure.figureKey,
            status: 'PENDING',
            description: updatedFigure.description || '',
            title: body.title || `Figure ${body.figureKey}`,
            fileName: '',
            blobName: '',
            mimeType: 'image/png',
            sizeBytes: 0,
            displayOrder: 0,
            elements: [], // Empty elements array for new figures
            createdAt: updatedFigure.createdAt,
          };

          apiLogger.logResponse(201, updatedFigureResponse);
          return apiResponse.created(res, updatedFigureResponse);
        }
      }

      logger.info('[API] Created pending figure successfully', {
        projectId,
        figureKey: body.figureKey,
        figureId: newFigure.id,
      });

      // Return complete figure data matching the frontend format
      const figureResponse = {
        id: newFigure.id,
        projectId: newFigure.projectId,
        figureKey: newFigure.figureKey,
        status: 'PENDING',
        description: newFigure.description || '',
        title: body.title || `Figure ${body.figureKey}`,
        fileName: '',
        blobName: '',
        mimeType: 'image/png',
        sizeBytes: 0,
        displayOrder: 0,
        elements: [], // Empty elements array for new figures
        createdAt: newFigure.createdAt,
      };

      apiLogger.logResponse(201, figureResponse);
      return apiResponse.created(res, figureResponse);
    }

    return apiResponse.methodNotAllowed(res, ['POST']);
  } catch (error) {
    apiLogger.error('Failed to create pending figure', {
      projectId,
      error: error instanceof Error ? error : String(error),
    });

    // Let the error bubble up to be caught by the middleware
    throw error;
  }
}

// Apply secure preset with tenant resolution
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler as any
);

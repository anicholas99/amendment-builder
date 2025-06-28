import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/monitoring/logger';
import { figureRepository } from '@/repositories/figureRepository';
import { sendSafeErrorResponse } from '@/utils/secure-error-response';

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
      const project = await prisma!.project.findFirst({
        where: {
          id: projectId,
          tenantId: tenantId,
          userId: userId,
        },
        select: { id: true },
      });

      if (!project) {
        throw new ApplicationError(
          ErrorCode.PROJECT_ACCESS_DENIED,
          'Project not found or access denied'
        );
      }

      // Check if figure already exists
      const existingFigure = await prisma!.projectFigure.findFirst({
        where: {
          projectId,
          figureKey: body.figureKey,
          deletedAt: null,
        },
      });

      if (existingFigure) {
        // If it already exists, just return it (idempotent)
        logger.info('[API] Pending figure already exists', {
          projectId,
          figureKey: body.figureKey,
          figureId: existingFigure.id,
          status: (existingFigure as any).status,
        });

        return res.status(200).json({
          id: existingFigure.id,
          projectId: existingFigure.projectId,
          figureKey: existingFigure.figureKey,
          status: (existingFigure as any).status || 'PENDING',
          description: existingFigure.description,
          title: existingFigure.title,
          createdAt: existingFigure.createdAt,
        });
      }

      // Create new pending figure
      const newFigure = await prisma!.projectFigure.create({
        data: {
          projectId,
          figureKey: body.figureKey,
          title: body.title || `Figure ${body.figureKey}`,
          description: body.description || '',
          status: 'PENDING',
          uploadedBy: userId,
          displayOrder: parseInt(body.figureKey.replace(/[^\d]/g, '')) || 0,
        } as any,
      });

      logger.info('[API] Created pending figure successfully', {
        projectId,
        figureKey: body.figureKey,
        figureId: newFigure.id,
      });

      apiLogger.logResponse(201, newFigure);
      return res.status(201).json({
        id: newFigure.id,
        projectId: newFigure.projectId,
        figureKey: newFigure.figureKey,
        status: 'PENDING',
        description: newFigure.description,
        title: newFigure.title,
        createdAt: newFigure.createdAt,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    apiLogger.error('Failed to create pending figure', {
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
      'Failed to create pending figure. Please try again later.'
    );
  }
}

// Apply secure preset with tenant resolution
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler as any
);

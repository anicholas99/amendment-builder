import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { figureRepository } from '@/repositories/figure';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { z } from 'zod';
import { apiResponse } from '@/utils/api/responses';

const apiLogger = createApiLogger('figure-metadata');

// Query validation schema
const querySchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  figureId: z.string().min(1, 'Figure ID is required'),
});

// Request body validation
const updateSchema = z.object({
  title: z.string().max(200, 'Title is too long').optional(),
  description: z.string().max(1000, 'Description is too long').optional(),
  displayOrder: z.number().int().min(0).optional(),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { projectId, figureId } = req.query as z.infer<typeof querySchema>;

  // Validation is now handled by SecurePresets, but we keep the checks for clarity
  if (!projectId || typeof projectId !== 'string') {
    throw new ApplicationError(
      ErrorCode.VALIDATION_REQUIRED_FIELD,
      'Project ID is required'
    );
  }

  if (!figureId || typeof figureId !== 'string') {
    throw new ApplicationError(
      ErrorCode.VALIDATION_REQUIRED_FIELD,
      'Figure ID is required'
    );
  }

  switch (req.method) {
    case 'PATCH':
      return handlePatch(req, res, figureId);
    default:
      return apiResponse.methodNotAllowed(res, ['PATCH']);
  }
}

async function handlePatch(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  figureId: string
) {
  try {
    const body = updateSchema.parse(req.body);

    apiLogger.info('Updating figure metadata', { figureId, updates: body });

    const updatedFigure = await figureRepository.updateFigureMetadata(
      figureId,
      body
    );

    apiLogger.info('Successfully updated figure metadata', { figureId });

    return apiResponse.ok(res, { figure: updatedFigure });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: error.errors,
      });
    }
    apiLogger.error('Failed to update figure metadata', { error, figureId });
    throw error;
  }
}

// SECURITY: This endpoint is tenant-protected using project-based resolution
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: querySchema,
      body: updateSchema,
      bodyMethods: ['PATCH'],
    },
    rateLimit: 'api',
  }
);

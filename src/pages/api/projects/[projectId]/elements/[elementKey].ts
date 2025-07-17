import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { figureRepository } from '@/repositories/figure';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { z } from 'zod';

const apiLogger = createApiLogger('project-elements');

// Query validation schema
const querySchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  elementKey: z.string().min(1, 'Element key is required'),
});

// Request body validation
const updateElementSchema = z.object({
  name: z
    .string()
    .min(1, 'Element name is required')
    .max(200, 'Element name is too long'),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { projectId, elementKey } = req.query as z.infer<typeof querySchema>;

  // Validation is now handled by SecurePresets, but we keep the checks for clarity
  if (!projectId || typeof projectId !== 'string') {
    throw new ApplicationError(
      ErrorCode.VALIDATION_REQUIRED_FIELD,
      'Project ID is required'
    );
  }

  if (!elementKey || typeof elementKey !== 'string') {
    throw new ApplicationError(
      ErrorCode.VALIDATION_REQUIRED_FIELD,
      'Element key is required'
    );
  }

  switch (req.method) {
    case 'PATCH':
      return handlePatch(req, res, projectId, elementKey);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handlePatch(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  projectId: string,
  elementKey: string
) {
  try {
    const body = updateElementSchema.parse(req.body);

    apiLogger.info('Updating element name globally', {
      projectId,
      elementKey,
      newName: body.name,
    });

    const updatedElement = await figureRepository.updateElementName(
      projectId,
      elementKey,
      body.name
    );

    apiLogger.info('Successfully updated element name', {
      projectId,
      elementKey,
    });

    return res.status(200).json({ element: updatedElement });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: error.errors,
      });
    }
    apiLogger.error('Failed to update element name', {
      error,
      projectId,
      elementKey,
    });
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
      body: updateElementSchema,
      bodyMethods: ['PATCH'],
    },
    rateLimit: 'api',
  }
);

import { NextApiRequest, NextApiResponse } from 'next';
import { RequestWithServices } from '@/types/middleware';
import { logger } from '@/server/logger';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { apiResponse } from '@/utils/api/responses';

// Validation schema for updating the title
const updateTitleSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty.')
    .max(500, 'Title is too long'),
});

// Query validation schema
const querySchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { inventionService } = (req as RequestWithServices).services;
  const { projectId } = req.query;

  if (!projectId || typeof projectId !== 'string') {
    return apiResponse.badRequest(res, 'Invalid project ID');
  }

  try {
    switch (req.method) {
      case 'GET':
        const inventionData =
          await inventionService.getInventionData(projectId);
        return apiResponse.ok(res, { title: inventionData?.title || '' });

      case 'PUT':
        await inventionService.updateTitle(projectId, req.body.title);
        return apiResponse.ok(res, { success: true });

      default:
        return apiResponse.methodNotAllowed(res, ['GET', 'PUT']);
    }
  } catch (error) {
    logger.error('Failed to handle title request', {
      projectId,
      method: req.method,
      error,
    });
    return apiResponse.serverError(res, error);
  }
}

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: querySchema,
      body: updateTitleSchema,
      bodyMethods: ['PUT'],
    },
    rateLimit: 'api',
  }
);

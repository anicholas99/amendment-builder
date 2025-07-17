import { NextApiRequest, NextApiResponse } from 'next';
import { RequestWithServices } from '@/types/middleware';
import { logger } from '@/server/logger';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { apiResponse } from '@/utils/api/responses';

// Validation schema for updating the abstract
const updateAbstractSchema = z.object({
  abstract: z.string().min(1, 'Abstract cannot be empty.'),
});

const querySchema = z.object({
  projectId: z.string(),
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
        return apiResponse.ok(res, { abstract: inventionData?.abstract || '' });

      case 'PUT':
        await inventionService.updateAbstract(projectId, req.body.abstract);
        return apiResponse.ok(res, { success: true });

      default:
        return apiResponse.methodNotAllowed(res, ['GET', 'PUT']);
    }
  } catch (error) {
    logger.error('Failed to handle abstract request', {
      projectId,
      method: req.method,
      error,
    });
    return apiResponse.serverError(res, error);
  }
}

// Use the new secure preset
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: querySchema,
      body: updateAbstractSchema,
    },
  }
);

import { NextApiRequest, NextApiResponse } from 'next';
import { RequestWithServices } from '@/types/middleware';
import { logger } from '@/server/logger';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { apiResponse } from '@/utils/api/responses';

// Validation schema for updating features
const updateFeaturesSchema = z.object({
  features: z.array(z.string()).min(1, 'At least one feature is required.'),
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
        return apiResponse.ok(res, { features: inventionData?.features || [] });

      case 'PUT':
        await inventionService.updateFeatures(projectId, req.body.features);
        return apiResponse.ok(res, { success: true });

      default:
        return apiResponse.methodNotAllowed(res, ['GET', 'PUT']);
    }
  } catch (error) {
    logger.error('Failed to handle features request', {
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
      body: updateFeaturesSchema,
      bodyMethods: ['PUT'],
    },
    rateLimit: 'api',
  }
);

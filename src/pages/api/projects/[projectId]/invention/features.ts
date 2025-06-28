import { NextApiRequest, NextApiResponse } from 'next';
import { inventionDataService } from '@/server/services/invention-data.server-service';
import { logger } from '@/lib/monitoring/logger';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

// Validation schema for updating features
const updateFeaturesSchema = z.object({
  features: z.array(z.string()).min(1, 'At least one feature is required.'),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { projectId } = req.query;

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  const { features } = req.body;

  try {
    await inventionDataService.updateFeatures(projectId, features);
    return res.status(200).json({ message: 'Features updated successfully.' });
  } catch (error) {
    logger.error('[API] Error updating invention features', {
      projectId,
      error,
    });
    return res
      .status(500)
      .json({ error: 'Failed to update invention features' });
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

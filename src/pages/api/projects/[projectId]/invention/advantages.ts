import { NextApiRequest, NextApiResponse } from 'next';
import { inventionDataService } from '@/server/services/invention-data.server-service';
import { logger } from '@/lib/monitoring/logger';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

// Validation schema for updating advantages
const updateAdvantagesSchema = z.object({
  advantages: z.array(z.string()).min(1, 'At least one advantage is required.'),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { projectId } = req.query;

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  const { advantages } = req.body;

  try {
    await inventionDataService.updateAdvantages(projectId, advantages);
    return res
      .status(200)
      .json({ message: 'Advantages updated successfully.' });
  } catch (error) {
    logger.error('[API] Error updating invention advantages', {
      projectId,
      error,
    });
    return res
      .status(500)
      .json({ error: 'Failed to update invention advantages' });
  }
}

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      body: updateAdvantagesSchema,
      bodyMethods: ['PUT'],
    },
    rateLimit: 'api',
  }
);

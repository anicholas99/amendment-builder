import { NextApiRequest, NextApiResponse } from 'next';
import { inventionDataService } from '@/server/services/invention-data.server-service';
import { logger } from '@/lib/monitoring/logger';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

// Validation schema for updating use cases
const updateUseCasesSchema = z.object({
  useCases: z.array(z.string()).min(1, 'At least one use case is required.'),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { projectId } = req.query;

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  const { useCases } = req.body;

  try {
    await inventionDataService.updateUseCases(projectId, useCases);
    return res.status(200).json({ message: 'Use cases updated successfully.' });
  } catch (error) {
    logger.error('[API] Error updating invention use cases', {
      projectId,
      error,
    });
    return res
      .status(500)
      .json({ error: 'Failed to update invention use cases' });
  }
}

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      body: updateUseCasesSchema,
      bodyMethods: ['PUT'],
    },
    rateLimit: 'api',
  }
);

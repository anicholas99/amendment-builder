import { NextApiRequest, NextApiResponse } from 'next';
import { inventionDataService } from '@/server/services/invention-data.server-service';
import { logger } from '@/lib/monitoring/logger';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

// Validation schema for updating process steps
const updateProcessStepsSchema = z.object({
  processSteps: z
    .array(z.string())
    .min(1, 'At least one process step is required.'),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { projectId } = req.query;

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  const { processSteps } = req.body;

  try {
    await inventionDataService.updateProcessSteps(projectId, processSteps);
    return res
      .status(200)
      .json({ message: 'Process steps updated successfully.' });
  } catch (error) {
    logger.error('[API] Error updating invention process steps', {
      projectId,
      error,
    });
    return res
      .status(500)
      .json({ error: 'Failed to update invention process steps' });
  }
}

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      body: updateProcessStepsSchema,
      bodyMethods: ['PUT'],
    },
    rateLimit: 'api',
  }
);

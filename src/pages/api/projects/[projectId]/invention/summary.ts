import { NextApiRequest, NextApiResponse } from 'next';
import { inventionDataService } from '@/server/services/invention-data.server-service';
import { logger } from '@/lib/monitoring/logger';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

// Validation schema for updating the summary
const updateSummarySchema = z.object({
  summary: z.string().min(1, 'Summary cannot be empty.'),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { projectId } = req.query;

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  const { summary } = req.body;

  try {
    await inventionDataService.updateSummary(projectId, summary);
    return res.status(200).json({ message: 'Summary updated successfully.' });
  } catch (error) {
    logger.error('[API] Error updating invention summary', {
      projectId,
      error,
    });
    return res
      .status(500)
      .json({ error: 'Failed to update invention summary' });
  }
}

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      body: updateSummarySchema,
      bodyMethods: ['PUT'],
    },
    rateLimit: 'api',
  }
);

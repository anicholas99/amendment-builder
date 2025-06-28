import { NextApiRequest, NextApiResponse } from 'next';
import { inventionDataService } from '@/server/services/invention-data.server-service';
import { logger } from '@/lib/monitoring/logger';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

// Validation schema for updating the background
const updateBackgroundSchema = z.object({
  background: z.union([
    z.string(),
    z.object({
      technicalField: z.string().optional(),
      problemStatement: z.string().optional(),
      existingSolutions: z.string().optional(),
    }),
  ]),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { projectId } = req.query;

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  const { background } = req.body;

  try {
    await inventionDataService.updateBackground(projectId, background);
    return res
      .status(200)
      .json({ message: 'Background updated successfully.' });
  } catch (error) {
    logger.error('[API] Error updating invention background', {
      projectId,
      error,
    });
    return res
      .status(500)
      .json({ error: 'Failed to update invention background' });
  }
}

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      body: updateBackgroundSchema,
      bodyMethods: ['PUT'],
    },
  }
);

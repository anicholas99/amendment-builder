import { NextApiRequest, NextApiResponse } from 'next';
import { inventionDataService } from '@/server/services/invention-data.server-service';
import { logger } from '@/lib/monitoring/logger';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

// Validation schema for updating the technical field
const updateTechnicalFieldSchema = z.object({
  technicalField: z.string().min(1, 'Technical field cannot be empty.'),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { projectId } = req.query;

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  const { technicalField } = req.body;

  try {
    await inventionDataService.updateTechnicalField(projectId, technicalField);
    return res
      .status(200)
      .json({ message: 'Technical field updated successfully.' });
  } catch (error) {
    logger.error('[API] Error updating invention technical field', {
      projectId,
      error,
    });
    return res
      .status(500)
      .json({ error: 'Failed to update invention technical field' });
  }
}

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      body: updateTechnicalFieldSchema,
      bodyMethods: ['PUT'],
    },
    rateLimit: 'api',
  }
);

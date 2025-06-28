import { NextApiRequest, NextApiResponse } from 'next';
import { inventionDataService } from '@/server/services/invention-data.server-service';
import { logger } from '@/lib/monitoring/logger';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

// Validation schema for updating the abstract
const updateAbstractSchema = z.object({
  abstract: z.string().min(1, 'Abstract cannot be empty.'),
});

const querySchema = z.object({
  projectId: z.string(),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { projectId } = req.query as { projectId: string };
  const { abstract } = req.body;

  try {
    await inventionDataService.updateAbstract(projectId, abstract);
    return res.status(200).json({ message: 'Abstract updated successfully.' });
  } catch (error) {
    logger.error('[API] Error updating invention abstract', {
      projectId,
      error,
    });
    return res
      .status(500)
      .json({ error: 'Failed to update invention abstract' });
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

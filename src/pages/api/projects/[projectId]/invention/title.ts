import { NextApiRequest, NextApiResponse } from 'next';
import { inventionDataService } from '@/server/services/invention-data.server-service';
import { logger } from '@/lib/monitoring/logger';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

// Validation schema for updating the title
const updateTitleSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty.')
    .max(500, 'Title is too long'),
});

// Query validation schema
const querySchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { projectId } = req.query as z.infer<typeof querySchema>;

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  const { title } = req.body as z.infer<typeof updateTitleSchema>;

  try {
    await inventionDataService.updateTitle(projectId, title);
    return res.status(200).json({ message: 'Title updated successfully.' });
  } catch (error) {
    logger.error('[API] Error updating invention title', {
      projectId,
      error,
    });
    return res.status(500).json({ error: 'Failed to update invention title' });
  }
}

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: querySchema,
      body: updateTitleSchema,
      bodyMethods: ['PUT'],
    },
    rateLimit: 'api',
  }
);

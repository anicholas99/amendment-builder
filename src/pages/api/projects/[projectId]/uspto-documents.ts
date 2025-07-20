import { NextApiRequest, NextApiResponse } from 'next';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { z } from 'zod';
import { USPTOSyncService } from '@/server/services/usptoSync.server-service';
import { AuthenticatedRequest, RequestWithServices } from '@/types/middleware';

const querySchema = z.object({
  projectId: z.string().uuid('Invalid project ID format'),
});

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authReq = req as AuthenticatedRequest & RequestWithServices;
  const { tenantId } = authReq.user!;
  const { projectId } = querySchema.parse(req.query);

  try {
    const syncService = new USPTOSyncService();
    const data = await syncService.getUSPTODocuments(projectId, tenantId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch USPTO documents',
    });
  }
}

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  { 
    rateLimit: 'standard',
    validate: { query: querySchema }
  }
);
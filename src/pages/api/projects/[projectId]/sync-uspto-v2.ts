import { NextApiRequest, NextApiResponse } from 'next';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { z } from 'zod';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { USPTOSyncService } from '@/server/services/usptoSync.server-service';
import { AuthenticatedRequest, RequestWithServices } from '@/types/middleware';

const SyncUSPTOSchema = z.object({
  applicationNumber: z.string().trim().min(1, 'Application number is required'),
});

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { projectId } = req.query;
  const authReq = req as AuthenticatedRequest & RequestWithServices;
  const { tenantId, id: userId } = authReq.user!;
  
  if (typeof projectId !== 'string') {
    throw new ApplicationError(ErrorCode.INVALID_INPUT, 'Invalid project ID', 400);
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are accepted.',
    });
  }

  try {
    const { applicationNumber } = SyncUSPTOSchema.parse(req.body);
    
    const syncService = new USPTOSyncService();
    const result = await syncService.syncUSPTOData(
      projectId,
      applicationNumber,
      tenantId,
      userId
    );

    res.status(200).json({
      success: true,
      message: 'USPTO data synced successfully',
      stats: result,
    });
  } catch (error) {
    if (error instanceof ApplicationError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to sync USPTO data',
    });
  }
}

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      body: SyncUSPTOSchema,
      method: 'POST',
    },
    rateLimit: 'ai', // USPTO sync can be expensive
  }
);
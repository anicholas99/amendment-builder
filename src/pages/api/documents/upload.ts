import { NextApiRequest, NextApiResponse } from 'next';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { StorageServerService } from '@/server/services/storage.server-service';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

const apiLogger = createApiLogger('upload-invention');

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  apiLogger.logRequest(req);

  // All logic is now delegated to the service layer
  const response = await StorageServerService.uploadInvention(req);

  apiLogger.logResponse(200, response);
  return res.status(200).json(response);
}

// SECURITY: This endpoint is tenant-protected using the user's tenant
// File uploads are scoped to the authenticated user's tenant
export default SecurePresets.tenantProtected(
  TenantResolvers.fromUser,
  handler,
  {
    rateLimit: 'upload',
  }
);

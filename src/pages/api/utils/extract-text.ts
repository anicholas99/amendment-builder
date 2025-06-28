import { NextApiResponse } from 'next';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { AuthenticatedRequest } from '@/types/middleware';
import { StorageServerService } from '@/server/services/storage.server-service';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

const apiLogger = createApiLogger('extract-text');

// Disable Next.js body parsing to allow formidable to handle it
export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
  apiLogger.logRequest(req);

  const extractedText = await StorageServerService.extractTextFromFile(req);

  return res.status(200).json({ text: extractedText });
}

// Use the new secure preset
export default SecurePresets.tenantProtected(TenantResolvers.fromUser, handler);

import { NextApiRequest, NextApiResponse } from 'next';
import { swaggerSpec } from '@/config/swagger';
import { SecurePresets } from '@/server/api/securePresets';
import { apiResponse } from '@/utils/api/responses';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return apiResponse.methodNotAllowed(res, ['GET']);
  }

  res.setHeader('Content-Type', 'application/json');
  return apiResponse.ok(res, swaggerSpec);
}

// Use SecurePresets for a public documentation endpoint
export default SecurePresets.public(handler);

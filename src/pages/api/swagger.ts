import { NextApiRequest, NextApiResponse } from 'next';
import { swaggerSpec } from '@/config/swagger';
import { SecurePresets } from '@/lib/api/securePresets';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(swaggerSpec);
}

// Use SecurePresets for a public documentation endpoint
export default SecurePresets.public(handler);

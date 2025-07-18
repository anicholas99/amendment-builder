/**
 * Debug endpoint to check Azure Computer Vision tier and limits
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { env } from '@/config/env';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const endpoint = env.AZURE_COMPUTER_VISION_ENDPOINT;
  const hasKey = !!env.AZURE_COMPUTER_VISION_API_KEY;
  
  // Extract resource info from endpoint
  const resourceMatch = endpoint?.match(/https:\/\/([^.]+)\.cognitiveservices\.azure\.com/);
  const resourceName = resourceMatch?.[1] || 'unknown';

  return res.status(200).json({
    status: 'Azure Computer Vision Configuration',
    endpoint,
    resourceName,
    hasApiKey: hasKey,
    note: 'Check Azure Portal → Computer Vision Resource → Pricing tier to see if you are on Free (F0) or Standard (S0)',
    limits: {
      'Free (F0)': {
        pages: '2 pages max',
        fileSize: '4 MB max',
        requests: '1 per second',
        cost: 'Free'
      },
      'Standard (S0)': {
        pages: '2,000 pages max',
        fileSize: '500 MB max', 
        requests: '15 per second',
        cost: 'Pay per page (~$1-2 per 1000 pages)'
      }
    },
    upgradeInstructions: 'Azure Portal → Your Computer Vision Resource → Pricing tier → Select Standard S0'
  });
} 
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { logger } from '@/lib/monitoring/logger';
import { SecurePresets } from '@/lib/api/securePresets';
import { ClaimRepository } from '@/repositories/claimRepository';
import { AuthenticatedRequest } from '@/types/middleware';
import { ApplicationError, ErrorCode } from '@/lib/error';

const querySchema = z.object({
  claimId: z.string(),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { claimId } = req.query as z.infer<typeof querySchema>;

  try {
    if (req.method === 'GET') {
      logger.info('[API] Getting history for claim', { claimId });

      const history = await ClaimRepository.findHistoryByClaimId(claimId);

      return res.status(200).json({ history });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    logger.error('[API] Error getting claim history', {
      claimId,
      error,
    });
    return res.status(500).json({ error: 'Failed to get claim history' });
  }
}

export default SecurePresets.tenantProtected(
  async (req: AuthenticatedRequest) => {
    const { claimId } = req.query;
    if (!claimId || typeof claimId !== 'string') return null;
    return await ClaimRepository.resolveTenantId(claimId);
  },
  handler,
  {
    validate: {
      query: querySchema,
    },
  }
);

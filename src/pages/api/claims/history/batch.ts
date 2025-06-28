import { NextApiResponse } from 'next';
import { z } from 'zod';
import { logger } from '@/lib/monitoring/logger';
import { SecurePresets } from '@/lib/api/securePresets';
import { ClaimRepository } from '@/repositories/claimRepository';
import { AuthenticatedRequest } from '@/types/middleware';
import { ApplicationError, ErrorCode } from '@/lib/error';

const bodySchema = z.object({
  claimIds: z.array(z.string()).min(1).max(50), // Limit to 50 claims per request
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { claimIds } = req.body as z.infer<typeof bodySchema>;

    logger.info('[API] Getting batch history for claims', {
      count: claimIds.length,
      claimIds: claimIds.slice(0, 5), // Log first 5 for debugging
    });

    // Fetch all histories in parallel with proper error handling
    const histories = await Promise.all(
      claimIds.map(async claimId => {
        try {
          const history = await ClaimRepository.findHistoryByClaimId(claimId);
          return { claimId, history, error: null };
        } catch (error) {
          logger.warn('[API] Failed to get history for claim', {
            claimId,
            error,
          });
          return { claimId, history: [], error: 'Failed to fetch history' };
        }
      })
    );

    // Format response as a map for easy client-side lookup
    const historyMap = histories.reduce(
      (acc, { claimId, history, error }) => {
        acc[claimId] = { history, error };
        return acc;
      },
      {} as Record<string, { history: any[]; error: string | null }>
    );

    return res.status(200).json({ histories: historyMap });
  } catch (error) {
    logger.error('[API] Error getting batch claim history', { error });
    return res.status(500).json({ error: 'Failed to get claim histories' });
  }
}

// Resolver to check tenant access for all claims
const resolveTenantId = async (
  req: AuthenticatedRequest
): Promise<string | null> => {
  const { claimIds } = req.body || {};
  if (!Array.isArray(claimIds) || claimIds.length === 0) return null;

  // Validate all claims belong to the same tenant
  const claimTenants = await Promise.all(
    claimIds.map(id => ClaimRepository.resolveTenantId(id))
  );

  // Check if all claims have the same tenant
  const uniqueTenants = Array.from(
    new Set(claimTenants.filter(t => t !== null))
  ) as string[];

  if (uniqueTenants.length === 0) {
    logger.warn('[API] No valid tenant found for claims', { claimIds });
    return null;
  }

  if (uniqueTenants.length > 1) {
    logger.error('[API] Claims belong to different tenants', {
      claimIds,
      tenants: uniqueTenants,
    });
    throw new ApplicationError(
      ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
      'Claims must belong to the same tenant'
    );
  }

  return uniqueTenants[0];
};

export default SecurePresets.tenantProtected(resolveTenantId, handler, {
  validate: {
    body: bodySchema,
  },
  rateLimit: 'api', // This counts as 1 request instead of N
});

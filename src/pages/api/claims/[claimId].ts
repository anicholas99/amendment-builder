import { logger } from '@/lib/monitoring/logger';
import { ClaimRepository } from '@/repositories/claimRepository';
import { AuthenticatedRequest } from '@/types/middleware';
import { NextApiResponse } from 'next';
import { SecurePresets } from '@/lib/api/securePresets';
import { z } from 'zod';

// Query validation
const querySchema = z.object({
  claimId: z.string(),
});

// Body validation for PATCH
const patchBodySchema = z.object({
  text: z.string().min(1, 'Claim text is required'),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { claimId } = req.query as z.infer<typeof querySchema>;
  const { user } = req;

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  switch (req.method) {
    case 'PATCH':
      const { text } = req.body as z.infer<typeof patchBodySchema>;
      const updatedClaim = await ClaimRepository.update(claimId, text, user.id);
      logger.info(`[API] Updated claim ${claimId}`);
      res.status(200).json(updatedClaim);
      break;

    case 'DELETE':
      try {
        await ClaimRepository.delete(claimId);
        logger.info(`[API] Deleted claim ${claimId}`);
        res
          .status(200)
          .json({ success: true, message: 'Claim deleted successfully' });
      } catch (error: any) {
        // Check if it's a "record not found" error from Prisma
        if (error?.code === 'P2025') {
          // DELETE is idempotent - if the claim doesn't exist, that's fine
          logger.info(
            `[API] DELETE request for non-existent claim ${claimId} - returning success (idempotent)`
          );
          res
            .status(200)
            .json({ success: true, message: 'Claim deleted successfully' });
        } else {
          logger.error(`[API] Error deleting claim ${claimId}`, { error });
          throw error; // Let the error handler middleware deal with it
        }
      }
      break;

    default:
      res.setHeader('Allow', ['PATCH', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Custom tenant resolver for claims
const claimTenantResolver = async (
  req: AuthenticatedRequest
): Promise<string | null> => {
  const { claimId } = req.query;
  if (!claimId || typeof claimId !== 'string') return null;

  const tenantId = await ClaimRepository.resolveTenantId(claimId);

  // For DELETE operations, if the claim doesn't exist, we'll allow it through
  // The handler will return success (idempotent DELETE)
  if (!tenantId && req.method === 'DELETE') {
    // Return the user's active tenant to pass the guard
    return req.user?.tenantId || null;
  }

  return tenantId;
};

// SECURITY: This endpoint is tenant-protected using claim-based resolution
// Users can only modify claims within their own tenant
export default SecurePresets.tenantProtected(claimTenantResolver, handler, {
  validate: {
    query: querySchema,
    body: patchBodySchema,
    bodyMethods: ['PATCH'], // Only PATCH needs body validation
  },
  rateLimit: 'api',
});

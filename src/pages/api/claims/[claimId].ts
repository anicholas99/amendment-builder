import { logger } from '@/server/logger';
import { ClaimRepository } from '@/repositories/claimRepository';
import { AuthenticatedRequest } from '@/types/middleware';
import { NextApiResponse } from 'next';
import { SecurePresets } from '@/server/api/securePresets';
import { z } from 'zod';
import { ApplicationError } from '@/lib/error';

// Query validation
const querySchema = z.object({
  claimId: z.string(),
  renumber: z
    .enum(['true', 'false'])
    .optional()
    .transform(val => val === 'true'),
});

// Body validation for PATCH
const patchBodySchema = z
  .object({
    text: z.string().min(1, 'Claim text is required').optional(),
    number: z.number().int().positive().optional(),
  })
  .refine(data => data.text !== undefined || data.number !== undefined, {
    message: 'Either text or number must be provided',
  });

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { user } = req;

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Parse and validate query parameters
  const queryResult = querySchema.safeParse(req.query);
  if (!queryResult.success) {
    return res.status(400).json({
      error: 'Invalid query parameters',
      details: queryResult.error.errors,
    });
  }

  const { claimId, renumber } = queryResult.data;

  switch (req.method) {
    case 'PATCH':
      const { text, number } = req.body as z.infer<typeof patchBodySchema>;

      try {
        let updatedClaim;

        // Handle number update
        if (number !== undefined) {
          logger.info(
            `[API] Attempting to update claim ${claimId} number to ${number}`,
            {
              claimId,
              newNumber: number,
              userId: user.id,
              tenantId: user.tenantId,
            }
          );

          updatedClaim = await ClaimRepository.updateClaimNumber(
            claimId,
            number,
            user.id
          );
          logger.info(`[API] Updated claim ${claimId} number to ${number}`);
        }

        // Handle text update (can be done after number update)
        if (text !== undefined) {
          updatedClaim = await ClaimRepository.update(claimId, text, user.id);
          logger.info(`[API] Updated claim ${claimId} text`);
        }

        return res.status(200).json({
          success: true,
          data: updatedClaim,
        });
      } catch (error: unknown) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorCode = (error as any)?.code;

        logger.error(`[API] Error updating claim ${claimId}`, {
          error: errorObj.message,
          errorMessage: errorObj.message,
          errorCode,
          errorStack: errorObj.stack,
          requestBody: req.body,
          userId: user.id,
          tenantId: user.tenantId,
        });

        if (error instanceof ApplicationError) {
          return res.status(error.statusCode || 400).json({
            error: error.message,
          });
        }

        // For database errors, provide more specific messages
        if (errorCode === 'P2025') {
          return res.status(404).json({
            error: 'Claim not found',
          });
        }

        if (errorCode === 'P2002') {
          return res.status(409).json({
            error: 'Claim number already exists',
          });
        }

        return res.status(500).json({
          error: 'Failed to update claim',
          details:
            process.env.NODE_ENV === 'development'
              ? errorObj.message
              : undefined,
        });
      }
      break;

    case 'DELETE':
      try {
        if (renumber) {
          // Use the new delete with renumbering method
          logger.info(`[API] Deleting claim ${claimId} with renumbering`, {
            claimId,
            userId: user.id,
            tenantId: user.tenantId,
          });

          const result = await ClaimRepository.deleteWithRenumbering(
            claimId,
            user.id
          );

          logger.info(
            `[API] Deleted claim ${claimId} and renumbered ${result.renumberedCount} claims`
          );

          return res.status(200).json({
            success: true,
            data: {
              message: `Claim deleted successfully. ${result.renumberedCount} subsequent claims were renumbered.`,
              deletedClaimNumber: result.deletedClaim.number,
              renumberedCount: result.renumberedCount,
              claims: result.updatedClaims,
            },
          });
        } else {
          // Use the simple delete method (backward compatibility)
          await ClaimRepository.delete(claimId);
          logger.info(`[API] Deleted claim ${claimId} (simple delete)`);
          return res.status(200).json({
            success: true,
            data: { message: 'Claim deleted successfully' },
          });
        }
      } catch (error: unknown) {
        // Check if it's a "record not found" error from Prisma
        const errorCode = (error as any)?.code;
        if (errorCode === 'P2025') {
          // DELETE is idempotent - if the claim doesn't exist, that's fine
          logger.info(
            `[API] DELETE request for non-existent claim ${claimId} - returning success (idempotent)`
          );
          res
            .status(200)
            .json({ success: true, message: 'Claim deleted successfully' });
        } else {
          logger.error(`[API] Error deleting claim ${claimId}`, {
            error,
            withRenumbering: renumber,
          });

          if (error instanceof ApplicationError) {
            return res.status(error.statusCode || 400).json({
              error: error.message,
            });
          }

          return res.status(500).json({
            error: 'Failed to delete claim',
            details:
              process.env.NODE_ENV === 'development'
                ? error instanceof Error
                  ? error.message
                  : String(error)
                : undefined,
          });
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

import { logger } from '@/server/logger';
import { ClaimRepository } from '@/repositories/claimRepository';
import { AuthenticatedRequest } from '@/types/middleware';
import { NextApiResponse } from 'next';
import { SecurePresets } from '@/server/api/securePresets';
import { z } from 'zod';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { prisma } from '@/lib/prisma';
import {
  createClaimNumberMapping,
  batchUpdateClaimDependencies,
  validateClaimDependencies,
} from '@/utils/claimDependencyUpdater';

// Body validation
const bodySchema = z.object({
  inventionId: z.string(),
  updates: z
    .array(
      z.object({
        claimId: z.string(),
        newNumber: z.number().int().positive(),
      })
    )
    .min(1),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { user } = req;

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!prisma) {
    logger.error('[BatchUpdateNumbers] Prisma client not initialized');
    return res.status(500).json({ error: 'Database connection error' });
  }

  const { inventionId, updates } = req.body as z.infer<typeof bodySchema>;

  try {
    logger.info('[BatchUpdateNumbers] Starting batch update', {
      inventionId,
      updateCount: updates.length,
      userId: user.id,
      tenantId: user.tenantId,
    });

    // Perform all updates in a single transaction
    const result = await prisma.$transaction(
      async tx => {
        // First, verify all claims belong to the same invention and user has access
        const claimIds = updates.map(u => u.claimId);
        const claims = await tx.claim.findMany({
          where: {
            id: { in: claimIds },
            inventionId,
          },
          include: {
            invention: {
              include: {
                project: {
                  select: { tenantId: true },
                },
              },
            },
          },
        });

        // Verify all claims were found
        if (claims.length !== updates.length) {
          throw new ApplicationError(
            ErrorCode.INVALID_INPUT,
            'Some claims not found or do not belong to the specified invention'
          );
        }

        // Verify tenant access
        const projectTenantId = claims[0]?.invention?.project?.tenantId;
        if (!projectTenantId || projectTenantId !== user.tenantId) {
          throw new ApplicationError(
            ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
            'Access denied to these claims'
          );
        }

        // Create a map of current numbers to avoid conflicts
        const currentNumbers = new Map<string, number>();
        claims.forEach(claim => {
          currentNumbers.set(claim.id, claim.number);
        });

        // Build the number mapping for dependency updates
        const numberMappingData = updates.map(update => ({
          claimId: update.claimId,
          oldNumber: currentNumbers.get(update.claimId) || 0,
          newNumber: update.newNumber,
        }));
        const numberMapping = createClaimNumberMapping(numberMappingData);

        // Get ALL claims for this invention to update dependencies
        const allClaims = await tx.claim.findMany({
          where: { inventionId },
          orderBy: { number: 'asc' },
        });

        // Sort updates by new number in descending order
        // This helps avoid conflicts when incrementing numbers
        const sortedUpdates = [...updates].sort(
          (a, b) => b.newNumber - a.newNumber
        );

        // Use temporary negative numbers to avoid conflicts
        let tempNumber = -1000000;

        // First pass: Move all claims to temporary numbers
        for (const update of sortedUpdates) {
          await tx.claim.update({
            where: { id: update.claimId },
            data: { number: tempNumber-- },
          });
        }

        // Second pass: Move claims to their final numbers
        const updatedClaims = [];
        for (const update of updates) {
          const updatedClaim = await tx.claim.update({
            where: { id: update.claimId },
            data: { number: update.newNumber },
          });
          updatedClaims.push(updatedClaim);

          // Log the number change for debugging
          const oldNumber = currentNumbers.get(update.claimId);
          if (oldNumber && oldNumber !== update.newNumber) {
            logger.info('[BatchUpdateNumbers] Claim number changed', {
              claimId: update.claimId,
              oldNumber,
              newNumber: update.newNumber,
              userId: user.id,
            });
          }
        }

        // Third pass: Update dependencies in ALL claims
        // Create an updated version of allClaims with the new numbers
        const allClaimsWithNewNumbers = allClaims.map(claim => {
          // Find if this claim was renumbered
          const update = updates.find(u => u.claimId === claim.id);
          return {
            id: claim.id,
            number: update ? update.newNumber : claim.number,
            text: claim.text,
          };
        });

        const claimsWithUpdatedDeps = batchUpdateClaimDependencies(
          allClaimsWithNewNumbers,
          numberMapping
        );

        // Update claims that had dependency changes
        for (const claim of claimsWithUpdatedDeps) {
          if (claim.textUpdated) {
            // Get the final number for this claim (it might have been renumbered)
            const updateForThisClaim = updates.find(
              u => u.claimId === claim.id
            );
            const finalNumber = updateForThisClaim?.newNumber || claim.number;

            await tx.claim.update({
              where: { id: claim.id },
              data: { text: claim.text },
            });

            logger.info('[BatchUpdateNumbers] Updated dependencies in claim', {
              claimId: claim.id,
              claimNumber: finalNumber,
              userId: user.id,
            });
          }
        }

        // Get final state of all claims for validation
        const finalClaims = await tx.claim.findMany({
          where: { inventionId },
          orderBy: { number: 'asc' },
        });

        // Validate that all dependencies are correct
        const validationErrors = validateClaimDependencies(
          finalClaims.map(c => ({ number: c.number, text: c.text }))
        );

        if (validationErrors.length > 0) {
          // Separate self-reference errors from other errors
          const selfReferenceErrors = validationErrors.filter(
            error =>
              error.includes('forward reference') &&
              error.match(/Claim (\d+) has forward reference to claim (\1)/)
          );
          const otherErrors = validationErrors.filter(
            error =>
              !error.includes('forward reference') ||
              !error.match(/Claim (\d+) has forward reference to claim (\1)/)
          );

          // Log self-reference warnings
          if (selfReferenceErrors.length > 0) {
            logger.warn(
              '[BatchUpdateNumbers] Self-referencing claims detected (allowed)',
              {
                selfReferences: selfReferenceErrors,
                inventionId,
              }
            );
          }

          // Only throw if there are non-self-reference errors
          if (otherErrors.length > 0) {
            logger.error('[BatchUpdateNumbers] Dependency validation failed', {
              errors: otherErrors,
              inventionId,
            });
            throw new ApplicationError(
              ErrorCode.INVALID_INPUT,
              `Claim dependency validation failed: ${otherErrors.join('; ')}`
            );
          }
        }

        logger.info(
          '[BatchUpdateNumbers] Batch update completed successfully',
          {
            inventionId,
            updateCount: updatedClaims.length,
            dependenciesUpdated: claimsWithUpdatedDeps.filter(
              c => c.textUpdated
            ).length,
          }
        );

        return finalClaims;
      },
      {
        maxWait: 5000,
        timeout: 10000,
      }
    );

    return res.status(200).json({
      success: true,
      data: { claims: result },
    });
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const errorCode = (error as any)?.code;

    logger.error('[BatchUpdateNumbers] Error during batch update', {
      error: errorObj.message,
      errorCode,
      errorStack: errorObj.stack,
      inventionId,
      updateCount: updates.length,
      userId: user.id,
      tenantId: user.tenantId,
    });

    if (error instanceof ApplicationError) {
      return res.status(error.statusCode || 400).json({
        error: error.message,
      });
    }

    if (errorCode === 'P2034' || errorCode === 'P2024') {
      return res.status(409).json({
        error: 'Transaction conflict, please retry',
      });
    }

    return res.status(500).json({
      error: 'Failed to update claim numbers',
      details:
        process.env.NODE_ENV === 'development' ? errorObj.message : undefined,
    });
  }
}

// Custom tenant resolver
const batchUpdateTenantResolver = async (
  req: AuthenticatedRequest
): Promise<string | null> => {
  const { inventionId } = req.body;
  if (!inventionId || typeof inventionId !== 'string') return null;

  if (!prisma) {
    logger.error('[BatchUpdateTenantResolver] Prisma client not initialized');
    return null;
  }

  const invention = await prisma!.invention.findUnique({
    where: { id: inventionId },
    select: {
      project: {
        select: { tenantId: true },
      },
    },
  });

  return invention?.project?.tenantId || null;
};

// SECURITY: This endpoint is tenant-protected
export default SecurePresets.tenantProtected(
  batchUpdateTenantResolver,
  handler,
  {
    validate: {
      body: bodySchema,
      bodyMethods: ['POST'],
    },
    rateLimit: 'api',
  }
);

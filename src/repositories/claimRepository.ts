import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import {
  generateClaimHash,
  CURRENT_PARSER_VERSION,
} from '@/utils/claimVersioning';

export interface ClaimData {
  id?: string;
  inventionId: string;
  number: number;
  text: string;
}

export class ClaimRepository {
  /**
   * Creates multiple claims for a given invention. This is typically used when
   * processing an invention disclosure for the first time.
   * @param inventionId - The ID of the invention.
   * @param claims - An array of claim objects to create.
   * @returns The result of the createMany operation.
   */
  static async createClaimsForInvention(
    inventionId: string,
    claims: { number: number; text: string }[]
  ) {
    if (!prisma)
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client not initialized'
      );
    logger.info(
      `[ClaimRepository] Creating ${claims.length} claims for invention ${inventionId}`
    );
    try {
      // First, get existing claim numbers for this invention
      const existingClaims = await prisma.claim.findMany({
        where: { inventionId },
        select: { number: true },
      });

      const existingNumbers = new Set(existingClaims.map(c => c.number));

      // Process each claim to ensure unique numbers
      const claimsToCreate = claims.map(claim => {
        let claimNumber = claim.number;

        // If the number already exists, find the next available number
        while (existingNumbers.has(claimNumber)) {
          claimNumber++;
          logger.warn(
            `[ClaimRepository] Claim number ${claim.number} already exists, using ${claimNumber} instead`
          );
        }

        // Add this number to the set so subsequent claims don't use it
        existingNumbers.add(claimNumber);

        return {
          inventionId,
          number: claimNumber,
          text: claim.text,
        };
      });

      // Store the creation timestamp to filter results
      const creationTime = new Date();

      const result = await prisma.claim.createMany({
        data: claimsToCreate,
      });

      logger.info(
        `[ClaimRepository] Successfully created ${result.count} claims.`
      );

      // Return only the newly created claims by filtering on creation time
      // This prevents returning any old/deleted claims that might still exist
      const createdClaims = await prisma.claim.findMany({
        where: {
          inventionId,
          number: { in: claimsToCreate.map(c => c.number) },
          createdAt: { gte: new Date(creationTime.getTime() - 1000) }, // Within 1 second of creation
        },
        orderBy: { number: 'asc' },
      });

      return { count: result.count, claims: createdClaims };
    } catch (error) {
      logger.error('[ClaimRepository] Error creating claims:', { error });
      throw new Error('Failed to create claims in database.');
    }
  }

  /**
   * Finds all claims for a given invention ID.
   * @param inventionId - The ID of the invention.
   * @returns An array of claims, sorted by claim number.
   */
  static async findByInventionId(inventionId: string) {
    if (!prisma)
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client not initialized'
      );
    logger.debug(
      `[ClaimRepository] Finding claims for invention ${inventionId}`
    );

    const claims = await prisma.claim.findMany({
      where: { inventionId },
      orderBy: { number: 'asc' },
    });

    return claims;
  }

  /**
   * Updates the text of a single claim.
   * @param claimId - The ID of the claim to update.
   * @param text - The new text for the claim.
   * @param userId - Optional user ID (no longer used for history tracking).
   * @returns The updated claim object.
   */
  static async update(claimId: string, text: string, userId?: string) {
    if (!prisma)
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client not initialized'
      );
    logger.debug(`[ClaimRepository] Updating claim ${claimId}`);

    // Check if this is claim 1 to update the hash
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      select: { number: true, inventionId: true },
    });

    if (!claim) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        `Claim with ID ${claimId} not found.`
      );
    }

    // Update the claim
    const updatedClaim = await prisma.claim.update({
      where: { id: claimId },
      data: { text },
    });

    // If this is claim 1, update the invention hash
    if (claim.number === 1) {
      logger.info('[ClaimRepository] Updating claim 1 hash in invention', {
        inventionId: claim.inventionId,
      });

      try {
        const claim1Hash = generateClaimHash(text);

        // Try to update with new fields - this will fail if migration hasn't been applied yet
        await prisma.$executeRaw`
          UPDATE inventions 
          SET claim1Hash = ${claim1Hash},
              claim1ParsedAt = ${new Date()},
              parserVersion = ${CURRENT_PARSER_VERSION}
          WHERE id = ${claim.inventionId}
        `;
      } catch (error) {
        logger.warn(
          '[ClaimRepository] Could not update claim 1 hash - migration may not be applied yet',
          {
            error,
            inventionId: claim.inventionId,
          }
        );
        // Don't fail the claim update if hash update fails
      }
    }

    return updatedClaim;
  }

  /**
   * Updates the claim number for a single claim.
   *
   * Behavior:
   * - If the target number is empty (gap) → simply moves the claim to that number
   * - If the target number is occupied → swaps the two claims
   *
   * This allows intuitive reordering where gaps are filled before swapping occurs.
   *
   * @param claimId - The ID of the claim to update.
   * @param newNumber - The new claim number.
   * @param userId - Optional user ID for tracking history.
   * @returns The updated claim object.
   */
  static async updateClaimNumber(
    claimId: string,
    newNumber: number,
    userId?: string
  ) {
    if (!prisma)
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client not initialized'
      );

    logger.info('[ClaimRepository] Updating claim number', {
      claimId,
      newNumber,
    });

    return prisma.$transaction(async tx => {
      // Get the claim to update
      const claimToUpdate = await tx.claim.findUnique({
        where: { id: claimId },
        include: { invention: true },
      });

      if (!claimToUpdate) {
        throw new ApplicationError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          `Claim with ID ${claimId} not found.`
        );
      }

      const oldNumber = claimToUpdate.number;
      const inventionId = claimToUpdate.inventionId;

      // If the number isn't changing, return early
      if (oldNumber === newNumber) {
        return claimToUpdate;
      }

      // Check if another claim already has the target number
      const existingClaimWithNumber = await tx.claim.findFirst({
        where: {
          inventionId,
          number: newNumber,
          id: { not: claimId },
        },
      });

      let updatedClaim;

      if (existingClaimWithNumber) {
        // Swap the numbers
        logger.info('[ClaimRepository] Swapping claim numbers', {
          claim1: { id: claimId, oldNumber, newNumber },
          claim2: {
            id: existingClaimWithNumber.id,
            oldNumber: newNumber,
            newNumber: oldNumber,
          },
        });

        // To avoid unique constraint violations, we need to use a temporary number
        // First, update our claim to a temporary negative number
        const tempNumber = -999999; // Use a negative number that won't conflict

        await tx.claim.update({
          where: { id: claimId },
          data: { number: tempNumber },
        });

        // Update the other claim to have the old number
        await tx.claim.update({
          where: { id: existingClaimWithNumber.id },
          data: { number: oldNumber },
        });

        // Finally, update our claim to have the new number
        updatedClaim = await tx.claim.update({
          where: { id: claimId },
          data: { number: newNumber },
        });

        // NOTE: We don't create history entries for number changes
        // History should only track actual text content changes, not metadata
        logger.info(
          '[ClaimRepository] Claim numbers swapped - no history entry created for number change'
        );
      } else {
        // Simple update - no conflict
        updatedClaim = await tx.claim.update({
          where: { id: claimId },
          data: { number: newNumber },
        });

        // NOTE: We don't create history entries for number changes
        // History should only track actual text content changes, not metadata
        logger.info(
          '[ClaimRepository] Claim number updated - no history entry created for number change'
        );
      }

      return updatedClaim;
    });
  }

  /**
   * Deletes a single claim by its ID.
   * @param claimId - The ID of the claim to delete.
   * @returns The deleted claim object.
   */
  static async delete(claimId: string) {
    if (!prisma)
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client not initialized'
      );
    logger.debug(`[ClaimRepository] Deleting claim ${claimId}`);
    return prisma.claim.delete({
      where: { id: claimId },
    });
  }

  /**
   * Efficiently deletes multiple claims by their IDs in a single transaction.
   * @param claimIds - Array of claim IDs to delete.
   * @param tenantId - Tenant ID for security validation.
   * @returns The count of deleted claims.
   */
  static async deleteMany(
    claimIds: string[],
    tenantId: string
  ): Promise<number> {
    if (!prisma)
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client not initialized'
      );

    logger.info(`[ClaimRepository] Batch deleting ${claimIds.length} claims`);

    try {
      const result = await prisma.claim.deleteMany({
        where: {
          id: { in: claimIds },
          invention: {
            project: {
              tenantId: tenantId,
            },
          },
        },
      });

      logger.info(
        `[ClaimRepository] Successfully batch deleted ${result.count} claims`
      );
      return result.count;
    } catch (error) {
      logger.error('[ClaimRepository] Error batch deleting claims:', { error });
      throw new ApplicationError(
        ErrorCode.DB_QUERY_ERROR,
        'Failed to batch delete claims'
      );
    }
  }

  /**
   * Deletes a claim and renumbers all subsequent claims, updating dependencies.
   * @param claimId - The ID of the claim to delete.
   * @param userId - Optional user ID for tracking history.
   * @returns Object containing deleted claim info and renumbered claims.
   */
  static async deleteWithRenumbering(claimId: string, userId?: string) {
    if (!prisma)
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client not initialized'
      );

    logger.info('[ClaimRepository] Deleting claim with renumbering', {
      claimId,
      userId,
    });

    // Import dependency updater functions
    const {
      createClaimNumberMapping,
      batchUpdateClaimDependencies,
      validateClaimDependencies,
    } = await import('@/utils/claimDependencyUpdater');

    return prisma.$transaction(
      async tx => {
        // Get the claim to delete
        const claimToDelete = await tx.claim.findUnique({
          where: { id: claimId },
          include: { invention: true },
        });

        if (!claimToDelete) {
          throw new ApplicationError(
            ErrorCode.DB_RECORD_NOT_FOUND,
            `Claim with ID ${claimId} not found.`
          );
        }

        const deletedNumber = claimToDelete.number;
        const inventionId = claimToDelete.inventionId;

        // Delete the claim
        await tx.claim.delete({
          where: { id: claimId },
        });

        // Get all remaining claims for this invention
        const remainingClaims = await tx.claim.findMany({
          where: { inventionId },
          orderBy: { number: 'asc' },
        });

        // Build renumbering updates for claims that need to shift down
        const updates = remainingClaims
          .filter(claim => claim.number > deletedNumber)
          .map(claim => ({
            claimId: claim.id,
            oldNumber: claim.number,
            newNumber: claim.number - 1,
          }));

        // If no claims need renumbering, we're done
        if (updates.length === 0) {
          logger.info(
            '[ClaimRepository] No claims need renumbering after deletion'
          );
          return {
            deletedClaim: claimToDelete,
            renumberedCount: 0,
            updatedClaims: [],
          };
        }

        // Create the number mapping for dependency updates
        const numberMapping = createClaimNumberMapping(updates);

        // Update claim numbers using temporary negative numbers to avoid conflicts
        let tempNumber = -1000000;
        for (const update of updates) {
          await tx.claim.update({
            where: { id: update.claimId },
            data: { number: tempNumber-- },
          });
        }

        // Update to final numbers
        for (const update of updates) {
          await tx.claim.update({
            where: { id: update.claimId },
            data: { number: update.newNumber },
          });

          // NOTE: We don't create history entries for number changes due to deletions
          // History should only track actual text content changes, not metadata
          logger.info(
            '[ClaimRepository] Claim renumbered after deletion - no history entry created',
            {
              claimId: update.claimId,
              oldNumber: update.oldNumber,
              newNumber: update.newNumber,
              deletedNumber: deletedNumber,
            }
          );
        }

        // Get all claims again with updated numbers
        const allClaimsAfterRenumber = await tx.claim.findMany({
          where: { inventionId },
          orderBy: { number: 'asc' },
        });

        // Update dependencies in all claims
        const claimsWithUpdatedDeps = batchUpdateClaimDependencies(
          allClaimsAfterRenumber.map(c => ({
            id: c.id,
            number: c.number,
            text: c.text,
          })),
          numberMapping
        );

        // Update claims that had dependency changes
        for (const claim of claimsWithUpdatedDeps) {
          if (claim.textUpdated) {
            await tx.claim.update({
              where: { id: claim.id },
              data: { text: claim.text },
            });

            // NOTE: We don't create history entries for dependency renumbering
            // History should only track intentional text changes, not automatic updates
            logger.info(
              '[ClaimRepository] Updated dependencies in claim - no history entry created',
              {
                claimId: claim.id,
                claimNumber: claim.number,
                deletedNumber: deletedNumber,
              }
            );
          }
        }

        // Final validation
        const finalClaims = await tx.claim.findMany({
          where: { inventionId },
          orderBy: { number: 'asc' },
        });

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
              '[ClaimRepository] Self-referencing claims detected (allowed)',
              {
                selfReferences: selfReferenceErrors,
                inventionId,
              }
            );
          }

          // Only throw if there are non-self-reference errors
          if (otherErrors.length > 0) {
            logger.error(
              '[ClaimRepository] Dependency validation failed after deletion',
              {
                errors: otherErrors,
                inventionId,
              }
            );
            throw new ApplicationError(
              ErrorCode.INVALID_INPUT,
              `Claim dependency validation failed: ${otherErrors.join('; ')}`
            );
          }
        }

        logger.info(
          '[ClaimRepository] Successfully deleted claim with renumbering',
          {
            deletedClaimNumber: deletedNumber,
            renumberedCount: updates.length,
            dependenciesUpdated: claimsWithUpdatedDeps.filter(
              c => c.textUpdated
            ).length,
          }
        );

        return {
          deletedClaim: claimToDelete,
          renumberedCount: updates.length,
          updatedClaims: finalClaims,
        };
      },
      {
        maxWait: 5000,
        timeout: 10000,
      }
    );
  }

  /**
   * Deletes all claims for a given invention ID. This is typically used when
   * reprocessing an invention disclosure.
   * @param inventionId - The ID of the invention.
   * @returns The result of the deleteMany operation.
   */
  static async deleteByInventionId(inventionId: string) {
    if (!prisma)
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client not initialized'
      );
    logger.info(
      `[ClaimRepository] Deleting all claims for invention ${inventionId}`
    );
    try {
      const result = await prisma.claim.deleteMany({
        where: { inventionId },
      });
      logger.info(
        `[ClaimRepository] Successfully deleted ${result.count} claims.`
      );
      return result;
    } catch (error) {
      logger.error(
        `[ClaimRepository] Error deleting claims for invention ${inventionId}:`,
        { error }
      );
      throw new Error('Failed to delete claims in database.');
    }
  }

  /**
   * Creates a single new claim.
   * @param data - The data for the new claim.
   * @returns The newly created claim object.
   */
  static async create(data: ClaimData) {
    if (!prisma)
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client not initialized'
      );
    logger.debug(
      `[ClaimRepository] Creating single claim for invention ${data.inventionId}`
    );
    return prisma.claim.create({
      data,
    });
  }

  /**
   * Resolves the tenant ID for a given claim ID.
   * This traverses the relationship: Claim -> Invention -> Project -> Tenant
   * @param claimId - The ID of the claim.
   * @returns The tenant ID if found, null otherwise.
   */
  static async resolveTenantId(claimId: string): Promise<string | null> {
    if (!prisma)
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client not initialized'
      );
    try {
      const claim = await prisma.claim.findUnique({
        where: { id: claimId },
        select: {
          invention: {
            select: {
              project: {
                select: {
                  tenantId: true,
                },
              },
            },
          },
        },
      });

      return claim?.invention?.project?.tenantId || null;
    } catch (error) {
      logger.error('[ClaimRepository] Error resolving tenant ID for claim', {
        claimId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new ApplicationError(
        ErrorCode.DB_QUERY_ERROR,
        'Failed to resolve tenant ID for claim'
      );
    }
  }

  /**
   * Updates all claims for an invention by deleting existing ones and creating new ones.
   * This ensures a clean update of all claims in a single transaction.
   * @param inventionId - The ID of the invention.
   * @param claims - An array of new claims to create.
   * @returns The result of the operation.
   */
  static async updateClaimsForInvention(
    inventionId: string,
    claims: { number: number; text: string }[]
  ) {
    if (!prisma)
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client not initialized'
      );

    logger.info(
      `[ClaimRepository] Updating claims for invention ${inventionId}, replacing with ${claims.length} new claims`
    );

    try {
      return await prisma.$transaction(async tx => {
        // Delete existing claims
        const deleteResult = await tx.claim.deleteMany({
          where: { inventionId },
        });

        logger.debug(
          `[ClaimRepository] Deleted ${deleteResult.count} existing claims`
        );

        // Create new claims if any
        if (claims.length > 0) {
          const createResult = await tx.claim.createMany({
            data: claims.map(claim => ({
              inventionId,
              number: claim.number,
              text: claim.text,
            })),
          });

          logger.debug(
            `[ClaimRepository] Created ${createResult.count} new claims`
          );

          return { deleted: deleteResult.count, created: createResult.count };
        }

        return { deleted: deleteResult.count, created: 0 };
      });
    } catch (error) {
      logger.error('[ClaimRepository] Error updating claims:', { error });
      throw new ApplicationError(
        ErrorCode.DB_QUERY_ERROR,
        'Failed to update claims in database.'
      );
    }
  }

  /**
   * Finds multiple claims by their IDs with tenant validation
   * @param claimIds - Array of claim IDs to find
   * @param tenantId - Tenant ID for security validation
   * @returns Array of claims that exist and belong to the tenant
   */
  static async findByIds(claimIds: string[], tenantId: string) {
    if (!prisma)
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client not initialized'
      );

    logger.debug(`[ClaimRepository] Finding claims by IDs`, {
      claimCount: claimIds.length,
      tenantId,
    });

    try {
      const claims = await prisma.claim.findMany({
        where: {
          id: { in: claimIds },
          invention: {
            project: {
              tenantId: tenantId,
            },
          },
        },
        orderBy: { number: 'asc' },
      });

      return claims;
    } catch (error) {
      logger.error('[ClaimRepository] Error finding claims by IDs:', { error });
      throw new ApplicationError(
        ErrorCode.DB_QUERY_ERROR,
        'Failed to find claims by IDs'
      );
    }
  }
}

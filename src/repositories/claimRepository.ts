import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/monitoring/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';

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
   * @param userId - Optional user ID for tracking history. If not provided, history won't be tracked.
   * @returns The updated claim object.
   */
  static async update(claimId: string, text: string, userId?: string) {
    if (!prisma)
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client not initialized'
      );
    logger.debug(
      `[ClaimRepository] Updating claim ${claimId}${userId ? ` by user ${userId}` : ' (system operation)'}`
    );

    const originalClaim = await prisma.claim.findUnique({
      where: { id: claimId },
    });

    if (!originalClaim) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        `Claim with ID ${claimId} not found.`
      );
    }

    return prisma.$transaction(async tx => {
      const updatedClaim = await tx.claim.update({
        where: { id: claimId },
        data: { text },
      });

      // Only create history if userId is provided
      if (userId) {
        await tx.claimHistory.create({
          data: {
            claimId: claimId,
            userId: userId,
            previousText: originalClaim.text,
            newText: text,
          },
        });
      } else {
        logger.info('[ClaimRepository] Skipping history creation for system operation');
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
   * Finds the history for a given claim ID.
   * @param claimId - The ID of the claim.
   * @returns An array of claim history entries, sorted by timestamp descending.
   */
  static async findHistoryByClaimId(claimId: string) {
    if (!prisma)
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client not initialized'
      );
    logger.debug(`[ClaimRepository] Finding history for claim ${claimId}`);
    return prisma.claimHistory.findMany({
      where: { claimId },
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
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

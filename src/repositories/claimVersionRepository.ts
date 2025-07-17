import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';

/**
 * Creates a new ClaimVersion from the current working claims.
 * @param inventionId The ID of the invention.
 * @param userId The ID of the user creating the version.
 * @param versionName Optional name for the version.
 * @returns A promise resolving to the newly created ClaimVersion with its snapshots.
 */
export async function createClaimVersionFromCurrent(
  inventionId: string,
  userId: string,
  versionName: string | null
): Promise<Prisma.ClaimVersionGetPayload<{ include: { snapshots: true } }>> {
  logger.debug(
    `Repository: Creating new claim version for invention ${inventionId} by user ${userId}`
  );

  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client not initialized'
    );
  }

  try {
    // Get current claims from the invention
    const currentClaims = await prisma.claim.findMany({
      where: { inventionId },
      orderBy: { number: 'asc' },
    });

    if (currentClaims.length === 0) {
      throw new ApplicationError(
        ErrorCode.INVALID_INPUT,
        'No claims found to create version from'
      );
    }

    // Create the version with snapshots in a transaction
    const result = await prisma.$transaction(async tx => {
      // Create the version
      const version = await tx.claimVersion.create({
        data: {
          inventionId,
          userId,
          name: versionName,
        },
      });

      // Create snapshots for each claim
      const snapshotData = currentClaims.map(claim => ({
        claimVersionId: version.id,
        number: claim.number,
        text: claim.text,
      }));

      await tx.claimSnapshot.createMany({
        data: snapshotData,
      });

      // Return the version with snapshots
      return tx.claimVersion.findUnique({
        where: { id: version.id },
        include: { snapshots: true },
      });
    });

    if (!result) {
      throw new ApplicationError(
        ErrorCode.DB_QUERY_ERROR,
        'Failed to create claim version'
      );
    }

    logger.info(
      `Repository: Created claim version ${result.id} with ${result.snapshots.length} snapshots`
    );

    return result;
  } catch (error) {
    logger.error(
      `Repository: Error creating claim version for invention ${inventionId}:`,
      { error }
    );

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      'Failed to create claim version'
    );
  }
}

/**
 * Gets all claim versions for an invention.
 * @param inventionId The ID of the invention.
 * @returns A promise resolving to an array of ClaimVersions.
 */
export async function getClaimVersionsByInvention(
  inventionId: string
): Promise<Prisma.ClaimVersionGetPayload<{ include: { user: true } }>[]> {
  logger.debug(
    `Repository: Fetching claim versions for invention ${inventionId}`
  );

  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client not initialized'
    );
  }

  try {
    const versions = await prisma.claimVersion.findMany({
      where: { inventionId },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    logger.info(
      `Repository: Found ${versions.length} claim versions for invention ${inventionId}`
    );

    return versions;
  } catch (error) {
    logger.error(
      `Repository: Error fetching claim versions for invention ${inventionId}:`,
      { error }
    );
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      'Failed to fetch claim versions'
    );
  }
}

/**
 * Gets a specific claim version with its snapshots.
 * @param versionId The ID of the version.
 * @returns A promise resolving to the ClaimVersion with snapshots.
 */
export async function getClaimVersionWithSnapshots(
  versionId: string
): Promise<Prisma.ClaimVersionGetPayload<{
  include: { snapshots: true; user: true };
}> | null> {
  logger.debug(
    `Repository: Fetching claim version ${versionId} with snapshots`
  );

  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client not initialized'
    );
  }

  try {
    const version = await prisma.claimVersion.findUnique({
      where: { id: versionId },
      include: {
        snapshots: {
          orderBy: { number: 'asc' },
        },
        user: true,
      },
    });

    if (!version) {
      logger.warn(`Repository: Claim version ${versionId} not found`);
      return null;
    }

    logger.info(
      `Repository: Found claim version ${versionId} with ${version.snapshots.length} snapshots`
    );

    return version;
  } catch (error) {
    logger.error(`Repository: Error fetching claim version ${versionId}:`, {
      error,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      'Failed to fetch claim version'
    );
  }
}

/**
 * Restores claims from a specific version.
 * @param versionId The ID of the version to restore.
 * @param inventionId The ID of the invention.
 * @returns A promise resolving to the restored claims.
 */
export async function restoreClaimsFromVersion(
  versionId: string,
  inventionId: string
): Promise<Prisma.ClaimGetPayload<{}>[]> {
  logger.debug(
    `Repository: Restoring claims from version ${versionId} to invention ${inventionId}`
  );

  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client not initialized'
    );
  }

  try {
    // Get the version with snapshots
    const version = await getClaimVersionWithSnapshots(versionId);

    if (!version) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'Claim version not found'
      );
    }

    if (version.inventionId !== inventionId) {
      throw new ApplicationError(
        ErrorCode.INVALID_INPUT,
        'Version does not belong to the specified invention'
      );
    }

    // Restore claims in a transaction
    const restoredClaims = await prisma.$transaction(async tx => {
      // Delete existing claims
      await tx.claim.deleteMany({
        where: { inventionId },
      });

      // Create new claims from snapshots
      const claimData = version.snapshots.map(snapshot => ({
        inventionId,
        number: snapshot.number,
        text: snapshot.text,
      }));

      await tx.claim.createMany({
        data: claimData,
      });

      // Return the newly created claims
      return tx.claim.findMany({
        where: { inventionId },
        orderBy: { number: 'asc' },
      });
    });

    logger.info(
      `Repository: Restored ${restoredClaims.length} claims from version ${versionId}`
    );

    return restoredClaims;
  } catch (error) {
    logger.error(
      `Repository: Error restoring claims from version ${versionId}:`,
      { error }
    );

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      'Failed to restore claims from version'
    );
  }
}

/**
 * Deletes a claim version.
 * @param versionId The ID of the version to delete.
 * @param userId The ID of the user requesting deletion (for permission check).
 * @returns A promise resolving when deletion is complete.
 */
export async function deleteClaimVersion(
  versionId: string,
  userId: string
): Promise<void> {
  logger.debug(
    `Repository: Deleting claim version ${versionId} requested by user ${userId}`
  );

  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client not initialized'
    );
  }

  try {
    // Check if version exists and user has permission
    const version = await prisma.claimVersion.findUnique({
      where: { id: versionId },
      select: { userId: true },
    });

    if (!version) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'Claim version not found'
      );
    }

    // Only the creator can delete their version
    if (version.userId !== userId) {
      throw new ApplicationError(
        ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
        'You do not have permission to delete this version'
      );
    }

    // Delete the version (snapshots will cascade delete)
    await prisma.claimVersion.delete({
      where: { id: versionId },
    });

    logger.info(`Repository: Deleted claim version ${versionId}`);
  } catch (error) {
    logger.error(`Repository: Error deleting claim version ${versionId}:`, {
      error,
    });

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      'Failed to delete claim version'
    );
  }
}

import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { safeJsonParse } from '@/utils/jsonUtils';
import { ClaimSyncData } from '@/types/api/claim-elements';
import { Prisma } from '@prisma/client';

/**
 * Retrieves claim sync data for a project with tenant verification.
 * This ensures that claim sync data can only be accessed by authorized tenants.
 *
 * @param projectId - The ID of the project
 * @param tenantId - The ID of the tenant for verification
 * @returns The claim sync data or null if not found/unauthorized
 */
export async function getClaimSyncData(
  projectId: string,
  tenantId: string
): Promise<ClaimSyncData | null> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    // First verify the project belongs to the tenant
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        tenantId: tenantId,
        deletedAt: null, // Exclude soft-deleted projects
      },
      select: {
        id: true,
      },
    });

    if (!project) {
      logger.warn('[ClaimSyncRepository] Project not found or access denied', {
        projectId,
        tenantId,
      });
      return null;
    }

    // Now fetch the invention data
    const invention = await prisma.invention.findUnique({
      where: { projectId },
      select: {
        parsedClaimElementsJson: true,
        searchQueriesJson: true,
        claimSyncedAt: true,
        lastSyncedClaim: true,
      },
    });

    // Add debug logging for troubleshooting
    logger.info('[ClaimSyncRepository] Query result', {
      projectId,
      tenantId,
      hasInvention: !!invention,
      hasParsedElements: !!invention?.parsedClaimElementsJson,
      hasSearchQueries: !!invention?.searchQueriesJson,
      parsedElementsLength: invention?.parsedClaimElementsJson?.length,
      searchQueriesLength: invention?.searchQueriesJson?.length,
    });

    if (!invention) {
      logger.info('[ClaimSyncRepository] No invention found for project', {
        projectId,
      });
      return null;
    }

    // Parse JSON fields safely
    const parsedElements = invention.parsedClaimElementsJson
      ? safeJsonParse<string[]>(invention.parsedClaimElementsJson) || []
      : [];

    const searchQueries = invention.searchQueriesJson
      ? safeJsonParse<string[]>(invention.searchQueriesJson) || []
      : [];

    // Log parsed data for debugging
    logger.info('[ClaimSyncRepository] Parsed claim sync data', {
      projectId,
      parsedElementsCount: parsedElements.length,
      searchQueriesCount: searchQueries.length,
      parsedElementsType: Array.isArray(parsedElements)
        ? 'array'
        : typeof parsedElements,
      searchQueriesType: Array.isArray(searchQueries)
        ? 'array'
        : typeof searchQueries,
    });

    return {
      parsedElements: Array.isArray(parsedElements) ? parsedElements : [],
      searchQueries: Array.isArray(searchQueries) ? searchQueries : [],
      lastSyncedClaim: invention.lastSyncedClaim || undefined,
    };
  } catch (error) {
    logger.error('[ClaimSyncRepository] Error getting claim sync data', {
      projectId,
      tenantId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Handle specific Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new ApplicationError(
        ErrorCode.DB_QUERY_ERROR,
        `Database error retrieving claim sync data: ${error.message}`
      );
    }

    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      'Failed to retrieve claim sync data'
    );
  }
}

/**
 * Saves claim sync data for a project with tenant verification.
 * This ensures that claim sync data can only be modified by authorized tenants.
 *
 * @param projectId - The ID of the project
 * @param tenantId - The ID of the tenant for verification
 * @param data - The claim sync data to save
 */
export async function saveClaimSyncData(
  projectId: string,
  tenantId: string,
  data: ClaimSyncData
): Promise<void> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    // Use a transaction to ensure data consistency
    await prisma.$transaction(async tx => {
      // First verify the project belongs to the tenant
      const project = await tx.project.findFirst({
        where: {
          id: projectId,
          tenantId: tenantId,
          deletedAt: null,
        },
        select: {
          id: true,
        },
      });

      if (!project) {
        throw new ApplicationError(
          ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
          'Project not found or access denied'
        );
      }

      // Upsert the invention data
      await tx.invention.upsert({
        where: { projectId },
        update: {
          parsedClaimElementsJson: JSON.stringify(data.parsedElements),
          searchQueriesJson: JSON.stringify(data.searchQueries),
          claimSyncedAt: new Date(),
          lastSyncedClaim: data.lastSyncedClaim || null,
          updatedAt: new Date(),
        },
        create: {
          projectId,
          parsedClaimElementsJson: JSON.stringify(data.parsedElements),
          searchQueriesJson: JSON.stringify(data.searchQueries),
          claimSyncedAt: new Date(),
          lastSyncedClaim: data.lastSyncedClaim || null,
        },
      });
    });

    logger.info('[ClaimSyncRepository] Saved claim sync data', {
      projectId,
      tenantId,
      elementCount: data.parsedElements.length,
      queryCount: data.searchQueries.length,
    });
  } catch (error) {
    logger.error('[ClaimSyncRepository] Error saving claim sync data', {
      projectId,
      tenantId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Re-throw ApplicationError as is
    if (error instanceof ApplicationError) {
      throw error;
    }

    // Handle specific Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ApplicationError(
          ErrorCode.DB_DUPLICATE_ENTRY,
          'Duplicate claim sync data entry'
        );
      }
      throw new ApplicationError(
        ErrorCode.DB_QUERY_ERROR,
        `Database error saving claim sync data: ${error.message}`
      );
    }

    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      'Failed to save claim sync data'
    );
  }
}

/**
 * Deletes claim sync data for a project with tenant verification.
 * This is useful when resetting or cleaning up project data.
 *
 * @param projectId - The ID of the project
 * @param tenantId - The ID of the tenant for verification
 */
export async function deleteClaimSyncData(
  projectId: string,
  tenantId: string
): Promise<void> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    await prisma.$transaction(async tx => {
      // First verify the project belongs to the tenant
      const project = await tx.project.findFirst({
        where: {
          id: projectId,
          tenantId: tenantId,
          deletedAt: null,
        },
        select: {
          id: true,
        },
      });

      if (!project) {
        throw new ApplicationError(
          ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
          'Project not found or access denied'
        );
      }

      // Check if invention exists before trying to update
      const invention = await tx.invention.findUnique({
        where: { projectId },
        select: { id: true },
      });

      if (!invention) {
        logger.info('[ClaimSyncRepository] No invention to clear sync data', {
          projectId,
        });
        return;
      }

      // Clear the claim sync fields
      await tx.invention.update({
        where: { projectId },
        data: {
          parsedClaimElementsJson: null,
          searchQueriesJson: null,
          claimSyncedAt: null,
          lastSyncedClaim: null,
          updatedAt: new Date(),
        },
      });
    });

    logger.info('[ClaimSyncRepository] Deleted claim sync data', {
      projectId,
      tenantId,
    });
  } catch (error) {
    logger.error('[ClaimSyncRepository] Error deleting claim sync data', {
      projectId,
      tenantId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Re-throw ApplicationError as is
    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      'Failed to delete claim sync data'
    );
  }
}

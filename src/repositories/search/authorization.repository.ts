/**
 * Authorization and Tenant Operations
 *
 * This module contains operations related to authorization and tenant validation.
 */

import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/monitoring/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';

/**
 * Get search history with project tenant info for authorization
 * @param searchHistoryId The search history ID
 * @returns Search history with project tenant information
 */
export async function getSearchHistoryWithTenant(
  searchHistoryId: string
): Promise<{
  id: string;
  project: {
    tenantId: string;
  } | null;
} | null> {
  try {
    logger.debug(
      `Repository: Finding search history with tenant info: ${searchHistoryId}`
    );

    const searchHistory = await prisma!.searchHistory.findUnique({
      where: { id: searchHistoryId },
      select: {
        id: true,
        project: {
          select: { tenantId: true },
        },
      },
    });

    if (!searchHistory) {
      logger.debug(
        `Repository: Search history not found for tenant validation: ${searchHistoryId}`
      );
      return null;
    }

    logger.debug(
      `Repository: Found search history with tenant info: ${searchHistoryId}`
    );
    return searchHistory;
  } catch (error) {
    logger.error('Failed to fetch search history with tenant info', {
      error,
      searchHistoryId,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to fetch search history: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Find search history with project tenant authorization check
 * @param searchHistoryId The search history ID
 * @param userId The user ID for authorization
 * @returns Search history with project info or null if not found/unauthorized
 */
export async function findSearchHistoryWithProjectAccess(
  searchHistoryId: string,
  userId: string
): Promise<{
  id: string;
  projectId: string;
  project: {
    id: string;
    userId: string;
    tenantId: string;
  };
} | null> {
  try {
    logger.debug(
      `Repository: Finding search history with project access: ${searchHistoryId}, user: ${userId}`
    );

    const searchHistory = await prisma!.searchHistory.findUnique({
      where: { id: searchHistoryId },
      select: {
        id: true,
        projectId: true,
        project: {
          select: {
            id: true,
            userId: true,
            tenantId: true,
          },
        },
      },
    });

    if (!searchHistory) {
      logger.debug(`Repository: Search history not found: ${searchHistoryId}`);
      return null;
    }

    // Check if project exists and projectId is not null
    if (!searchHistory.project || !searchHistory.projectId) {
      logger.debug(
        `Repository: Search history ${searchHistoryId} has no project associated`
      );
      return null;
    }

    // Check if user has access to the project
    const hasAccess = searchHistory.project.userId === userId;

    if (!hasAccess) {
      logger.debug(
        `Repository: User ${userId} does not have access to search history ${searchHistoryId}`
      );
      return null;
    }

    logger.debug(
      `Repository: Found search history with project access: ${searchHistoryId}`
    );

    // At this point we know projectId and project are not null
    return {
      id: searchHistory.id,
      projectId: searchHistory.projectId,
      project: searchHistory.project,
    };
  } catch (error) {
    logger.error('Failed to find search history with project access', {
      error,
      searchHistoryId,
      userId,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to find search history with project access: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

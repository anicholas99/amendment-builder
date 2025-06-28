/**
 * Search History Core Operations
 *
 * This module contains the core CRUD operations for search history records.
 * All read operations automatically transform data to ProcessedSearchHistoryEntry format.
 * All write operations use serialization to ensure consistent database format.
 *
 * DATA FLOW:
 * 1. Database stores results as JSON string (results: string | null)
 * 2. Read operations use processSearchHistoryEntry() to parse and normalize
 * 3. Write operations use serializeSearchHistoryEntry() to stringify
 * 4. Result normalization happens in searchHistory.ts utils
 *
 * IMPORTANT: Do NOT do data transformation in this file. Use the utils in:
 * - src/features/search/utils/searchHistory.ts for all transformations
 */

import { Prisma, SearchHistory } from '@prisma/client/index.js';
import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/monitoring/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import {
  processSearchHistoryEntry,
  processSearchHistoryEntries,
  serializeSearchHistoryEntry,
} from '@/features/search/utils/searchHistory';
import { ProcessedSearchHistoryEntry } from '../../types/domain/searchHistory';

/**
 * Finds multiple search history entries based on provided criteria.
 * @param options Prisma SearchHistoryFindManyArgs (where, orderBy, take, skip, etc.).
 * @returns A promise resolving to an array of ProcessedSearchHistoryEntry entries.
 */
export async function findManySearchHistory(
  options: Prisma.SearchHistoryFindManyArgs
): Promise<ProcessedSearchHistoryEntry[]> {
  logger.debug(
    '[SearchHistory] Repository: Finding search history with options:',
    options
  );

  const rawEntries = await prisma!.searchHistory.findMany(options);

  // Transform all entries to processed format (now async)
  const processedEntries = await processSearchHistoryEntries(rawEntries);

  logger.info('[SearchHistory] Repository: Found and processed entries', {
    total: rawEntries.length,
    processed: processedEntries.length,
    failed: rawEntries.length - processedEntries.length,
  });

  return processedEntries;
}

/**
 * Creates a new search history entry.
 * @param data Data for the new entry, using ProcessedSearchHistoryEntry format.
 * @returns A promise resolving to the newly created ProcessedSearchHistoryEntry.
 */
export async function createSearchHistory(
  data: Partial<ProcessedSearchHistoryEntry> & { query: string }
): Promise<ProcessedSearchHistoryEntry | null> {
  try {
    // Serialize the data for database storage
    const serialized = serializeSearchHistoryEntry(data);

    // Ensure required fields
    const createData: Prisma.SearchHistoryCreateInput = {
      query: data.query,
      timestamp: serialized.timestamp || new Date(),
      results: serialized.results || null,
      // Relationships
      ...(data.projectId && {
        project: { connect: { id: data.projectId } },
      }),
      ...(data.userId && {
        user: { connect: { id: data.userId } },
      }),
      // Status fields
      citationExtractionStatus: serialized.citationExtractionStatus || null,
    };

    const created = await prisma!.searchHistory.create({ data: createData });

    // Transform the created entry before returning (now async)
    return processSearchHistoryEntry(created);
  } catch (error) {
    logger.error('[SearchHistory] Repository: Error creating search history', {
      error,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to create search history: ${error}`
    );
  }
}

/**
 * Deletes all search history entries for a specific project.
 * @param projectId The ID of the project whose search history should be deleted.
 * @returns A promise resolving to the Prisma BatchPayload (containing count).
 */
export async function deleteSearchHistoryByProjectId(
  projectId: string
): Promise<Prisma.BatchPayload> {
  logger.info(
    `[SearchHistory] Repository: Deleting all entries for project ${projectId}`
  );

  return prisma!.searchHistory.deleteMany({
    where: { projectId: projectId },
  });
}

/**
 * Find a search history record by ID
 * @param id The search history ID
 * @param select Optional object specifying which fields to select
 * @returns The processed search history record or null if not found
 */
export async function findSearchHistoryById(
  id: string,
  select?: Prisma.SearchHistorySelect
): Promise<ProcessedSearchHistoryEntry | null> {
  try {
    logger.debug(
      `[SearchHistory] Repository: Finding search history with ID: ${id}`
    );

    // Base query options
    const queryOptions: Prisma.SearchHistoryFindUniqueArgs = {
      where: { id },
    };

    // Handle select options
    if (select) {
      queryOptions.select = select;
    }

    const searchHistoryEntry =
      await prisma!.searchHistory.findUnique(queryOptions);

    if (!searchHistoryEntry) {
      return null;
    }

    // Transform the entry before returning (now async)
    const processed = await processSearchHistoryEntry(searchHistoryEntry);

    return processed;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(
      `[SearchHistory] Repository error finding search history ID ${id}:`,
      {
        error: err,
      }
    );
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to fetch search history: ${err.message}`
    );
  }
}

/**
 * Update a search history record with new data
 * @param id The ID of the search history record to update
 * @param data The processed data to update
 * @returns The updated processed search history record
 * @throws DatabaseError if the update operation fails
 */
export async function updateSearchHistory(
  id: string,
  data: Partial<ProcessedSearchHistoryEntry>
): Promise<ProcessedSearchHistoryEntry | null> {
  try {
    logger.debug(
      `[SearchHistory] Repository: Updating search history with ID: ${id}`
    );

    // Serialize the processed data for database storage
    const serialized = serializeSearchHistoryEntry(data);

    // Convert to Prisma update format
    const updateData: Prisma.SearchHistoryUpdateInput = {
      ...(serialized.query && { query: serialized.query }),
      ...(serialized.timestamp && { timestamp: serialized.timestamp }),
      ...(serialized.results !== undefined && { results: serialized.results }),
      ...(serialized.citationExtractionStatus !== undefined && {
        citationExtractionStatus: serialized.citationExtractionStatus,
      }),
      // Handle relationships
      ...(data.projectId !== undefined && {
        project: data.projectId
          ? { connect: { id: data.projectId } }
          : { disconnect: true },
      }),
      ...(data.userId !== undefined && {
        user: data.userId
          ? { connect: { id: data.userId } }
          : { disconnect: true },
      }),
    };

    const updatedSearchHistory = await prisma!.searchHistory.update({
      where: { id },
      data: updateData,
    });

    logger.debug(
      `[SearchHistory] Repository: Successfully updated search history ${id}`
    );

    // Transform the updated entry before returning (now async)
    return processSearchHistoryEntry(updatedSearchHistory);
  } catch (error) {
    logger.error(
      `[SearchHistory] Repository error updating search history ID ${id}:`,
      error
    );
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to update search history: ${error}`
    );
  }
}

/**
 * Delete a specific search history entry by its ID.
 * @param id The ID of the search history entry to delete.
 * @returns The deleted search history entry as ProcessedSearchHistoryEntry or null if not found.
 */
export async function deleteSearchHistoryById(
  id: string
): Promise<ProcessedSearchHistoryEntry | null> {
  logger.info(
    `[SearchHistory] Attempting to delete search history entry with ID: ${id}`
  );
  try {
    const result = await prisma!.searchHistory.delete({
      where: {
        id: id,
      },
    });
    logger.info(
      `[SearchHistory] Successfully deleted search history entry with ID: ${id}`
    );

    // Transform the deleted entry before returning (now async)
    return processSearchHistoryEntry(result);
  } catch (error) {
    // Handle specific Prisma error for record not found
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      logger.warn(
        `[SearchHistory] Search history entry with ID ${id} not found for deletion.`
      );
      return null;
    }
    logger.error(
      `[SearchHistory] Error deleting search history entry with ID ${id}:`,
      {
        error: error instanceof Error ? error : new Error(String(error)),
      }
    );
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      'Failed to delete search history entry by ID'
    );
  }
}

/**
 * Find all search history IDs associated with a project, ordered by most recent first.
 *
 * @param projectId - The ID of the project
 * @returns A promise resolving to an array of search history IDs
 */
export async function findSearchHistoryIdsByProjectId(
  projectId: string
): Promise<string[]> {
  try {
    logger.debug(
      `[SearchHistory] Repository: Finding search history IDs for project ID: ${projectId}`
    );

    const searchHistoryEntries = await prisma!.searchHistory.findMany({
      where: {
        projectId: projectId,
      },
      select: {
        id: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    const searchHistoryIds = searchHistoryEntries.map(
      (entry: { id: string }) => entry.id
    );
    logger.debug(
      `[SearchHistory] Repository: Found ${searchHistoryIds.length} search history IDs for project ${projectId}`
    );

    return searchHistoryIds;
  } catch (error) {
    logger.error(
      `[SearchHistory] Repository error finding search history IDs for project ${projectId}:`,
      error
    );
    // Return empty array on error for graceful degradation
    return [];
  }
}

/**
 * Validate if a search history entry exists and return its basic info
 * @param searchHistoryId The search history ID to validate
 * @returns Basic search history info or null if not found
 */
export async function validateSearchHistoryExists(
  searchHistoryId: string
): Promise<{
  id: string;
  projectId: string;
} | null> {
  try {
    logger.debug(
      `[SearchHistory] Repository: Validating search history exists: ${searchHistoryId}`
    );

    const searchHistory = await prisma!.searchHistory.findUnique({
      where: { id: searchHistoryId },
      select: {
        id: true,
        projectId: true,
      },
    });

    if (!searchHistory) {
      logger.debug(
        `[SearchHistory] Repository: Search history not found: ${searchHistoryId}`
      );
      return null;
    }

    // Check if projectId is not null
    if (!searchHistory.projectId) {
      logger.debug(
        `[SearchHistory] Repository: Search history ${searchHistoryId} has no projectId`
      );
      return null;
    }

    return {
      id: searchHistory.id,
      projectId: searchHistory.projectId,
    };
  } catch (error) {
    logger.error('[SearchHistory] Failed to validate search history exists', {
      error,
      searchHistoryId,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to validate search history: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get the most recent search history entry for a project with citation extraction results
 * @param projectId The project ID
 * @returns The most recent search history with citations or null
 */
export async function getSearchHistoryWithTenant(searchHistoryId: string) {
  try {
    logger.debug('[SearchHistory] getSearchHistoryWithTenant called', {
      searchHistoryId,
    });

    const searchHistory = await prisma!.searchHistory.findUnique({
      where: { id: searchHistoryId },
      select: {
        id: true,
        project: {
          select: {
            id: true,
            tenantId: true,
          },
        },
      },
    });

    logger.debug('[SearchHistory] getSearchHistoryWithTenant query result', {
      searchHistoryId,
      found: !!searchHistory,
      hasProject: !!searchHistory?.project,
      projectId: searchHistory?.project?.id,
      tenantId: searchHistory?.project?.tenantId,
    });

    if (!searchHistory || !searchHistory.project) {
      logger.warn(
        '[SearchHistory] getSearchHistoryWithTenant - no search history or project found',
        {
          searchHistoryId,
          searchHistoryFound: !!searchHistory,
          projectFound: !!searchHistory?.project,
        }
      );
      return null;
    }

    const result = {
      searchHistoryId: searchHistory.id,
      projectId: searchHistory.project.id,
      tenantId: searchHistory.project.tenantId,
    };

    logger.debug('[SearchHistory] getSearchHistoryWithTenant returning', {
      searchHistoryId,
      result,
    });

    return result;
  } catch (error) {
    logger.error('[SearchHistory] Failed to get search history with tenant', {
      error,
      searchHistoryId,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to get search history: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

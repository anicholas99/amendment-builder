/**
 * Search History Data Transformation Layer
 *
 * This file contains the core data transformation logic for search history:
 * - Database <-> Application format conversion
 * - Result normalization (single source of truth)
 * - Data serialization/deserialization
 *
 * This is the ONLY place where search history data transformation should happen.
 * UI-specific formatting should go in searchHistoryUtils.ts
 * Component-specific logic should go in component-specific utils (e.g., searchHistoryRowUtils.ts)
 */

import {
  ProcessedSearchHistoryEntry,
  RawSearchHistoryEntry,
  SerializedSearchHistoryEntry,
  SearchHistoryEntry,
  NormalizedSearchResult,
} from '@/types/domain/searchHistory';
import { SearchResult, MappedSearchResult } from '@/types/searchTypes';
import { safeJsonParse } from '@/utils/jsonUtils';
import { logger } from '@/utils/clientLogger';

// Type for search results that can be stored in search history
export type SearchHistoryResults =
  | SearchResult[]
  | MappedSearchResult[]
  | unknown;

/**
 * Normalize a search result to ensure both 'number' and 'patentNumber' fields exist
 * This is the single source of truth for result normalization
 *
 * @param result - The raw result from any source
 * @returns Normalized result with both required fields
 */
export function normalizeSearchResult(result: any): NormalizedSearchResult {
  const normalized = {
    ...result,
    number: result.number || result.patentNumber || '',
    patentNumber: result.patentNumber || result.number || '',
  };

  // Ensure required fields from PriorArtReference are present
  return {
    title: '',
    source: 'GooglePatents',
    relevance: 0,
    ...normalized,
  } as NormalizedSearchResult;
}

/**
 * Normalize an array of search results
 *
 * @param results - Array of raw results
 * @returns Array of normalized results
 */
export function normalizeSearchResults(
  results: any[]
): NormalizedSearchResult[] {
  if (!Array.isArray(results)) {
    return [];
  }
  return results.map(normalizeSearchResult);
}

/**
 * Process raw search history from database into application format
 *
 * Note: Citation jobs are no longer stored in SearchHistory.
 * To get citation jobs, use getCitationJobsForSearch() instead.
 *
 * @param entry - The raw search history entry from database
 * @param fetchCitationJobs - Whether to fetch citation job data from database (server-side only)
 */
export async function processSearchHistory(
  entry: RawSearchHistoryEntry,
  fetchCitationJobs: boolean = true
): Promise<ProcessedSearchHistoryEntry | null> {
  try {
    // Parse results if needed - optimized to avoid double parsing
    let normalizedResults: NormalizedSearchResult[] = [];

    if (entry.results) {
      let parsedResults: SearchHistoryResults = [];

      // Check if already an array (shouldn't be in DB, but handle gracefully)
      if (Array.isArray(entry.results)) {
        parsedResults = entry.results;
      } else if (typeof entry.results === 'string' && entry.results.trim()) {
        // Parse once and check result
        const parsed = safeJsonParse<SearchHistoryResults>(entry.results);

        // Only parse again if we got a string (double-stringified case)
        if (typeof parsed === 'string' && parsed.trim()) {
          parsedResults = safeJsonParse<SearchHistoryResults>(parsed) || [];
        } else {
          parsedResults = parsed || [];
        }
      }

      // Normalize results if we have an array
      if (Array.isArray(parsedResults)) {
        normalizedResults = normalizeSearchResults(parsedResults);
      }
    }

    // Initialize citation job fields
    const citationJobCount = 0;
    let citationJobId: string | undefined;

    // Note: Citation jobs must be fetched separately via API calls
    // They cannot be fetched directly in client-side code

    const processed: ProcessedSearchHistoryEntry = {
      id: entry.id,
      query: entry.query,
      timestamp:
        entry.timestamp instanceof Date
          ? entry.timestamp
          : new Date(entry.timestamp),
      results: normalizedResults,
      resultCount: normalizedResults.length,
      projectId: entry.projectId || '',
      userId: entry.userId || null,
      citationExtractionStatus: entry.citationExtractionStatus || undefined,
      citationJobId: citationJobId || null,
      citationJobCount,
      hasCitationJobs: citationJobCount > 0,
      parsedElements: [],
      searchData: {},
    };

    return processed;
  } catch (error) {
    logger.error('Failed to process search history', {
      error,
      entryId: entry.id,
    });
    return null;
  }
}

/**
 * Serialize processed entry for API response
 */
export function serializeSearchHistory(
  entry: ProcessedSearchHistoryEntry
): SerializedSearchHistoryEntry {
  return {
    id: entry.id,
    query: entry.query,
    timestamp:
      entry.timestamp instanceof Date
        ? entry.timestamp.toISOString()
        : String(entry.timestamp),
    results: entry.results ? JSON.stringify(entry.results) : undefined,
    projectId: entry.projectId || undefined,
    userId: entry.userId === null ? undefined : entry.userId,
    citationExtractionStatus: entry.citationExtractionStatus,
  };
}

/**
 * Process multiple search history entries
 * @param entries - Array of raw search history entries
 * @param fetchCitationJobs - Whether to fetch citation job data from database (server-side only)
 */
export async function processSearchHistories(
  entries: RawSearchHistoryEntry[],
  fetchCitationJobs: boolean = true
): Promise<ProcessedSearchHistoryEntry[]> {
  // Process all entries in parallel for better performance
  const processingPromises = entries.map(entry =>
    processSearchHistory(entry, fetchCitationJobs)
  );

  // Wait for all processing to complete
  const processed = await Promise.all(processingPromises);

  // Filter out any failed entries
  return processed.filter(
    (entry): entry is ProcessedSearchHistoryEntry => entry !== null
  );
}

/**
 * Client-side processing of search history entries
 * This version skips database calls and only does JSON parsing
 */
export async function processSearchHistoriesClient(
  entries: RawSearchHistoryEntry[]
): Promise<ProcessedSearchHistoryEntry[]> {
  return processSearchHistories(entries, false);
}

/**
 * Convert ProcessedSearchHistoryEntry back to database format for saving
 * Note: This is minimal now since most complex data is stored elsewhere
 */
export function serializeForDatabase(
  entry: Partial<ProcessedSearchHistoryEntry>
): Partial<RawSearchHistoryEntry> {
  const serialized: Partial<RawSearchHistoryEntry> = {};

  if (entry.id) serialized.id = entry.id;
  if (entry.query) serialized.query = entry.query;
  if (entry.timestamp) {
    serialized.timestamp = new Date(entry.timestamp);
  }
  if (entry.results !== undefined) {
    serialized.results = JSON.stringify(entry.results);
  }
  if (entry.projectId !== undefined) {
    serialized.projectId = entry.projectId;
  }
  if (entry.userId !== undefined) {
    serialized.userId = entry.userId;
  }
  if (entry.citationExtractionStatus !== undefined) {
    serialized.citationExtractionStatus = entry.citationExtractionStatus;
  }

  return serialized;
}

// Backward compatibility aliases
export const processSearchHistoryEntry = processSearchHistory;
export const processSearchHistoryEntries = processSearchHistories;
export const serializeSearchHistoryEntry = serializeForDatabase;

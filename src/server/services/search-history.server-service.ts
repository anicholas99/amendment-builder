/**
 * Search History Server-Side Service
 *
 * Provides business logic for search history operations.
 */
import { logger } from '@/server/logger';
import { ProcessedSearchHistoryEntry } from '@/types/domain/searchHistory';
import { findSearchHistoryById } from '@/repositories/search/searchHistory.repository';

export class SearchHistoryServerService {
  /**
   * Fetches a specific SearchHistory entry by its ID.
   * Returns the processed entry with all JSON fields parsed.
   *
   * @param searchHistoryId The ID of the search history entry.
   * @returns The processed entry or null if not found or on error.
   */
  static async getSearchHistoryEntry(
    searchHistoryId: string
  ): Promise<ProcessedSearchHistoryEntry | null> {
    try {
      const entry = await findSearchHistoryById(searchHistoryId);

      if (!entry) {
        logger.warn(
          `[SearchHistory Service] Search history entry not found for ID: ${searchHistoryId}`
        );
        return null;
      }

      return entry;
    } catch (error) {
      logger.error(
        `[SearchHistory Service] Error fetching search history entry ${searchHistoryId}:`,
        error
      );
      // In a real app, we'd throw a structured ApplicationError here
      return null;
    }
  }

  /**
   * Extracts the top N reference numbers (patent numbers) from a SearchHistory entry.
   * Uses the pre-parsed results array from ProcessedSearchHistoryEntry.
   * Sorts results by relevance/score descending before slicing.
   *
   * @param entry The ProcessedSearchHistoryEntry object.
   * @param n The maximum number of reference numbers to return.
   * @returns An array of the top N reference number strings.
   */
  static getTopNReferenceNumbersFromSearchEntry(
    entry: ProcessedSearchHistoryEntry | null,
    n: number
  ): string[] {
    if (!entry) {
      logger.warn('[SearchHistory Service] No entry provided');
      return [];
    }

    const results = entry.results;

    if (!Array.isArray(results) || results.length === 0) {
      logger.debug(
        `[SearchHistory Service] No results found in entry ${entry.id}`
      );
      return [];
    }

    const sortedResults = [...results].sort(
      (a, b) => (b.relevance || 0) - (a.relevance || 0)
    );

    const referenceNumbers = sortedResults
      .slice(0, n)
      .map(r => r.number)
      .filter(num => num && num.length > 0);

    logger.debug(
      `[SearchHistory Service] Extracted ${referenceNumbers.length} reference numbers from entry ${entry.id}`
    );

    return referenceNumbers;
  }
}

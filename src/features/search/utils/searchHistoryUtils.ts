/**
 * Search History UI Utilities
 *
 * This file contains UI-specific utilities for displaying search history:
 * - Date formatting for display
 * - Color/style helpers (relevancy badges)
 * - UI state checks (hasCitationJobId)
 *
 * For data transformation and normalization, see searchHistory.ts
 * For SearchHistoryRow component-specific logic, see searchHistoryRowUtils.ts
 *
 * IMPORTANT: This file should NOT contain data transformation logic.
 * All data should already be in ProcessedSearchHistoryEntry format.
 */
import { PriorArtReference } from '../../../types/claimTypes';
import { logger } from '@/utils/clientLogger';
import {
  SearchHistoryEntry,
  ProcessedSearchHistoryEntry,
  AnySearchHistoryEntry as DomainAnySearchHistoryEntry,
} from '@/types/domain/searchHistory';

// Re-export domain types for backward compatibility
export type {
  SearchHistoryEntry, // Re-export the raw type for compatibility
  ProcessedSearchHistoryEntry,
} from '@/types/domain/searchHistory';

// Alias for components that still use the old name
export type EnhancedSearchHistoryEntry = ProcessedSearchHistoryEntry;

// Use the domain type
export type AnySearchHistoryEntry = DomainAnySearchHistoryEntry;

/**
 * Format date string or timestamp for display
 */
export const formatDate = (date: string): string => {
  if (!date) return 'Unknown date';
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return 'Unknown date';
    }
    return parsedDate.toLocaleString();
  } catch (e) {
    logger.error('[SearchHistory] Error formatting date:', e);
    return 'Unknown date';
  }
};

/**
 * Get relevancy badge color based on score
 */
export const getRelevancyColor = (score: number): string => {
  if (score >= 0.8) return 'green';
  if (score >= 0.6) return 'yellow';
  return 'red';
};

/**
 * Get consistent relevance badge classes for all components
 */
export const getRelevanceBadgeClasses = (score: number): string => {
  if (score >= 0.8)
    return 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300';
  if (score >= 0.6)
    return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300';
  if (score >= 0.4)
    return 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300';
  return 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300';
};

/**
 * Get search results from entry
 * Since server already returns ProcessedSearchHistoryEntry, we just return the results
 */
export const parseSearchResults = (
  entry: AnySearchHistoryEntry
): PriorArtReference[] => {
  // The entry should already be processed by the server
  if ('results' in entry && Array.isArray(entry.results)) {
    return entry.results || [];
  }

  // Fallback for any edge cases
  logger.warn(
    '[SearchHistory] Entry missing or invalid results field, returning empty array',
    {
      entryId: (entry as any).id,
    }
  );
  return [];
};

/**
 * Check if a search entry has a citation job (either in database or cache)
 */
export const hasCitationJobId = (
  entry: ProcessedSearchHistoryEntry,
  index: number
): boolean => {
  // First make sure we have a valid entry
  if (!entry) return false;

  // Check if we have a citation job ID directly
  if (entry.citationJobId !== undefined && entry.citationJobId !== null) {
    return true;
  }

  // Check if we have citation job count (new pattern)
  if (entry.citationJobCount && entry.citationJobCount > 0) {
    return true;
  }

  // Check if entry indicates it has citation jobs
  if (entry.hasCitationJobs) {
    return true;
  }

  // Legacy: Check if we have citation job IDs array (for backward compatibility)
  if (
    (entry as any).citationJobIds &&
    (entry as any).citationJobIds.length > 0
  ) {
    return true;
  }

  return false;
};

/**
 * Get parsed elements from entry
 * Note: Parsed elements are now stored in ClaimSetVersion, not SearchHistory
 * This function is kept for backward compatibility but will likely return empty
 */
export const parseParsedElements = (
  entry: any // Using any since it could be various types
): string[] => {
  // Check if entry has parsedElements directly
  if ('parsedElements' in entry && Array.isArray(entry.parsedElements)) {
    return entry.parsedElements || [];
  }

  // Parsed elements might be in search data
  logger.debug(
    '[SearchHistory] Entry missing parsedElements - these are now stored in ClaimSetVersion',
    {
      hasSearchData: !!entry.searchData,
      searchDataType: typeof entry.searchData,
    }
  );

  return [];
};

/**
 * Format relevance value as percentage string
 */
export const formatRelevancePercentage = (value: number | unknown): string => {
  if (typeof value === 'number' && !isNaN(value)) {
    return `${Math.round(value * 100)}%`;
  }
  return 'N/A';
};

/**
 * Check if relevance value is valid for display
 */
export const isValidRelevance = (value: number | unknown): boolean => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

/**
 * Clean HTML tags and entities from abstract text
 */
export const cleanAbstract = (abstract: string): string => {
  // Remove HTML tags and decode common HTML entities
  return abstract
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&') // Replace encoded ampersands
    .replace(/&lt;/g, '<') // Replace encoded less than
    .replace(/&gt;/g, '>') // Replace encoded greater than
    .replace(/&quot;/g, '"') // Replace encoded quotes
    .trim();
};

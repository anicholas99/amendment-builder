import React from 'react';
import {
  useCitationMatchesQuery,
  useCitationMatchesPollingQuery,
} from '@/hooks/api/useSearchHistory';
import { logger } from '@/lib/monitoring/logger';

// Defines the structure of a single citation match
export interface CitationMatch {
  id: string;
  [key: string]: any; // Allow other properties
}

// Defines the structure of the grouped results from the API
export interface GroupedCitation {
  elementText: string;
  matches: CitationMatch[];
}

// Defines the full shape of the API response
export interface CitationMatchesResponse {
  groupedResults: GroupedCitation[];
}

// Defines the result type of our custom hook
interface UseCitationMatchesResult {
  data: CitationMatchesResponse | null;
  isLoading: boolean;
  error: Error | null;
}

// Global cache to track references that have citation jobs
const referencesWithCitationsCache = new Map<string, Set<string>>();

/**
 * Hook for fetching citation matches for a search with React Query.
 * This now correctly types the expected API response.
 */
export function useCitationMatches(
  searchId: string | null
): UseCitationMatchesResult {
  // Use polling until we get at least one grouped result
  const { data, isLoading, error } = useCitationMatchesPollingQuery(
    searchId,
    3000
  );

  return {
    data: data as CitationMatchesResponse | null,
    isLoading,
    error,
  };
}

/**
 * Function to check if a reference has citations for a search history entry,
 * regardless of the currently selected version
 */
export function hasReferenceWithCitations(
  searchHistoryId: string | null,
  referenceNumber: string
): boolean {
  if (!searchHistoryId || !referenceNumber) return false;

  // Normalize the reference number to match the format used in citationJobNumbers
  const normalizedRef = referenceNumber.replace(/-/g, '').toUpperCase();

  // Check if we have a cache entry for this search history
  const searchCache = referencesWithCitationsCache.get(searchHistoryId);
  if (searchCache && searchCache.has(normalizedRef)) {
    return true;
  }

  return false;
}

/**
 * Function to update the cache when a reference gets a citation job
 */
export function addReferenceWithCitation(
  searchHistoryId: string,
  referenceNumber: string
): void {
  const normalizedRef = referenceNumber.replace(/-/g, '').toUpperCase();

  if (!referencesWithCitationsCache.has(searchHistoryId)) {
    referencesWithCitationsCache.set(searchHistoryId, new Set());
  }

  const searchCache = referencesWithCitationsCache.get(searchHistoryId)!;
  searchCache.add(normalizedRef);
}

/**
 * Function to initialize the cache with existing references
 */
export function initializeReferencesWithCitations(
  searchHistoryId: string,
  referenceNumbers: string[]
): void {
  const normalizedRefs = referenceNumbers.map(ref =>
    ref.replace(/-/g, '').toUpperCase()
  );

  referencesWithCitationsCache.set(searchHistoryId, new Set(normalizedRefs));
}

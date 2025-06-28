import { useMemo } from 'react';
import { ProcessedSearchHistoryEntry as SearchHistoryEntry } from '@/types/domain/searchHistory';
import { ProcessedCitationMatch } from '@/types/domain/citation';

export interface CitationMatchSummary {
  id: string;
  parsedElementText: string | null;
  reasoningScore: number | null;
  reasoningSummary: string | null;
}

interface UseSearchDerivedDataProps {
  searchHistory: SearchHistoryEntry[];
  citationMatchesData: ProcessedCitationMatch[] | undefined;
  selectedReference: string | null;
}

/**
 * Custom hook to compute search-related derived data
 */
export function useSearchDerivedData({
  searchHistory,
  citationMatchesData,
  selectedReference,
}: UseSearchDerivedDataProps) {
  // Transform search history into a format usable by the UI
  const availableSearches = useMemo(
    () =>
      searchHistory.map((entry, index) => ({
        id: entry.id,
        display: `Search #${searchHistory.length - index}`,
        query: entry.query,
      })),
    [searchHistory]
  );

  // Citation match summaries for the selected reference (used for relevancy analysis)
  const selectedReferenceCitationMatches = useMemo<
    CitationMatchSummary[]
  >(() => {
    if (!citationMatchesData || !selectedReference) return [];

    // Removed debug logging for performance

    // Normalize the selected reference number in multiple ways
    const normalizedSelectedRef = selectedReference
      .replace(/-/g, '')
      .toUpperCase();
    const simpleSelectedRef = selectedReference
      .replace(/[^A-Za-z0-9]/g, '')
      .toUpperCase();

    // Try to match in different ways
    const matches = citationMatchesData.filter(match => {
      if (!match.referenceNumber) return false;

      // Try different normalization approaches
      const normalizedMatchRef = match.referenceNumber
        .replace(/-/g, '')
        .toUpperCase();
      const simpleMatchRef = match.referenceNumber
        .replace(/[^A-Za-z0-9]/g, '')
        .toUpperCase();

      // Check direct match first
      if (match.referenceNumber === selectedReference) return true;

      // Then try normalized versions
      if (normalizedMatchRef === normalizedSelectedRef) return true;
      if (simpleMatchRef === simpleSelectedRef) return true;

      // Finally, try substring matching as a fallback
      if (
        normalizedMatchRef.includes(normalizedSelectedRef) ||
        normalizedSelectedRef.includes(normalizedMatchRef)
      ) {
        return true;
      }

      return false;
    });

    // Removed logging for performance

    return matches.map(match => ({
      id: match.id,
      parsedElementText: match.parsedElementText || null,
      reasoningScore: match.reasoning?.score ?? null,
      reasoningSummary: match.reasoning?.summary ?? null,
    }));
  }, [citationMatchesData, selectedReference]);

  return {
    availableSearches,
    selectedReferenceCitationMatches,
  };
}

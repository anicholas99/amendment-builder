import { useMemo } from 'react';
import { GroupedCitationMatch } from '../types/citationResultsTable';

/**
 * Hook for filtering citation results based on search ID.
 *
 * @param groupedResults - All grouped citation results
 * @param selectedSearchId - Currently selected search ID
 * @returns Filtered grouped results
 */
export function useCitationFiltering(
  groupedResults: GroupedCitationMatch[],
  selectedSearchId: string | null
) {
  return useMemo(() => {
    if (!selectedSearchId) {
      return groupedResults;
    }

    // Filter matches by search ID
    const filtered = groupedResults
      .map(group => {
        const filteredMatches = group.matches.filter(match => {
          // Filter by search ID
          return match.searchHistoryId === selectedSearchId;
        });

        return {
          ...group,
          matches: filteredMatches,
        };
      })
      .filter(group => group.matches.length > 0); // Only keep groups with matches

    return filtered;
  }, [groupedResults, selectedSearchId]);
}

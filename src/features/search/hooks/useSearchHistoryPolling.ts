import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToastWrapper';
import { logger } from '@/utils/clientLogger';
import { SearchHistoryApiService } from '@/client/services/search-history.client-service';
import { ProcessedSearchHistoryEntry } from '@/types/domain/searchHistory';

interface SearchHistoryPollingProps {
  searchHistory: ProcessedSearchHistoryEntry[];
  onSearchHistoryUpdate?: (
    updatedHistory: ProcessedSearchHistoryEntry[]
  ) => void;
  enabled?: boolean;
  projectId?: string | null;
}

const POLLING_INTERVAL = 10000; // 10 seconds

/**
 * Hook for polling search history updates using React Query.
 */
export const useSearchHistoryPolling = ({
  searchHistory,
  onSearchHistoryUpdate,
  enabled = true,
  projectId,
}: SearchHistoryPollingProps): void => {
  const toast = useToast();
  const completedSearchesToastedRef = useRef<Set<string>>(new Set());

  const { data: latestHistory } = useQuery({
    queryKey: ['searchHistory', projectId],
    queryFn: () => {
      if (!projectId) {
        // This should not happen if enabled is false, but as a safeguard:
        return Promise.resolve(searchHistory);
      }
      return SearchHistoryApiService.getSearchHistory(projectId);
    },
    enabled: !!projectId && enabled,
    refetchInterval: POLLING_INTERVAL,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!latestHistory || !onSearchHistoryUpdate) return;

    // Check for newly completed searches to show a toast
    searchHistory.forEach(oldEntry => {
      const newEntry = latestHistory.find(e => e.id === oldEntry.id);
      if (
        newEntry &&
        oldEntry.citationExtractionStatus === 'processing' &&
        newEntry.citationExtractionStatus === 'completed' &&
        !completedSearchesToastedRef.current.has(newEntry.id)
      ) {
        completedSearchesToastedRef.current.add(newEntry.id);
        const resultCount = Array.isArray(newEntry.results)
          ? newEntry.results.length
          : 0;
        toast({
          title: 'Search Complete',
          description: `Found ${resultCount} patent${
            resultCount !== 1 ? 's' : ''
          } matching your search criteria.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    });

    // Create simple snapshots to detect any change
    const currentSnapshot = searchHistory
      .map(h => `${h.id}:${h.citationExtractionStatus}`)
      .join(',');
    const latestSnapshot = latestHistory
      .map(h => `${h.id}:${h.citationExtractionStatus}`)
      .join(',');

    if (currentSnapshot !== latestSnapshot) {
      onSearchHistoryUpdate(latestHistory);
    }
  }, [latestHistory, searchHistory, onSearchHistoryUpdate, toast]);

  useEffect(() => {
    // Clear the set of toasted searches if the project changes
    completedSearchesToastedRef.current.clear();
  }, [projectId]);
};

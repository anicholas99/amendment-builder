import { useState, useEffect, useRef } from 'react';
import { ProcessedSearchHistoryEntry } from '@/types/domain/searchHistory';

export interface UseOptimisticSearchReturn {
  optimisticSearch: ProcessedSearchHistoryEntry | null;
  displaySearchHistory: ProcessedSearchHistoryEntry[];
  searchStartTimeRef: React.MutableRefObject<number>;
  startOptimisticSearch: (
    tempSearchId: string,
    projectId: string,
    searchQueries?: string[],
    parsedElements?: string[]
  ) => void;
  clearOptimisticSearch: () => void;
}

export function useOptimisticSearch(
  searchHistory: ProcessedSearchHistoryEntry[],
  minimumSearchDuration: number = 1000
): UseOptimisticSearchReturn {
  const [optimisticSearch, setOptimisticSearch] =
    useState<ProcessedSearchHistoryEntry | null>(null);
  const searchStartTimeRef = useRef<number>(0);

  // Merge optimistic search with real search history
  const displaySearchHistory = optimisticSearch
    ? (() => {
        // Check if we already have a real search that replaced our optimistic one
        const hasRealProcessingEntry = searchHistory.some(
          entry =>
            entry.citationExtractionStatus === 'processing' &&
            !entry.id.startsWith('optimistic-')
        );

        if (hasRealProcessingEntry) {
          return searchHistory;
        }

        // Prepend optimistic search
        return [optimisticSearch, ...searchHistory];
      })()
    : searchHistory;

  // Clean up optimistic entry when real entry appears
  useEffect(() => {
    if (!optimisticSearch) return;

    // Check if we have a real processing entry
    const hasRealProcessingEntry = searchHistory.some(
      entry =>
        entry.citationExtractionStatus === 'processing' &&
        !entry.id.startsWith('optimistic-')
    );

    if (hasRealProcessingEntry) {
      // Wait for minimum display duration before removing
      const elapsed = Date.now() - searchStartTimeRef.current;
      const remaining = Math.max(0, minimumSearchDuration - elapsed);

      const timeoutId = setTimeout(() => {
        setOptimisticSearch(null);
      }, remaining);

      return () => clearTimeout(timeoutId);
    }
  }, [searchHistory, optimisticSearch, minimumSearchDuration]);

  // Failsafe: Remove optimistic entry after 30 seconds
  useEffect(() => {
    if (!optimisticSearch) return;

    const timeoutId = setTimeout(() => {
      setOptimisticSearch(null);
    }, 30000); // 30 seconds

    return () => clearTimeout(timeoutId);
  }, [optimisticSearch]);

  const startOptimisticSearch = (
    tempSearchId: string,
    projectId: string,
    searchQueries: string[] = [],
    parsedElements: string[] = []
  ) => {
    searchStartTimeRef.current = Date.now();

    const query =
      searchQueries.slice(0, 2).join(' | ') +
        (searchQueries.length > 2 ? ' | ...' : '') || 'Searching...';

    setOptimisticSearch({
      id: tempSearchId,
      projectId,
      query,
      timestamp: new Date(),
      results: [],
      resultCount: 0,
      citationExtractionStatus: 'processing',
      parsedElements,
      searchData: {},
      userId: null,
      citationJobId: null,
      hasCitationJobs: false,
      citationJobCount: 0,
    });
  };

  const clearOptimisticSearch = () => {
    setOptimisticSearch(null);
  };

  return {
    optimisticSearch,
    displaySearchHistory,
    searchStartTimeRef,
    startOptimisticSearch,
    clearOptimisticSearch,
  };
}

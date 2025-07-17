/**
 * useOptimisticSearch Hook - Simplified Version
 *
 * This hook provides optimistic UI updates for search operations.
 * It shows a temporary "processing" entry while the real search is being created.
 *
 * The simplified approach:
 * 1. Show optimistic entry immediately when search starts
 * 2. Remove it when we detect the real entry in searchHistory
 * 3. No complex hiding/showing - the real entry comes from the server
 *
 * @param searchHistory - Current search history from the API
 * @param minimumSearchDuration - Minimum time to show optimistic entry (prevents flickering)
 * @returns Object with optimistic search state and display functions
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { ProcessedSearchHistoryEntry } from '@/types/domain/searchHistory';
import { logger } from '@/utils/clientLogger';
import { useQueryClient } from '@tanstack/react-query';
import { searchHistoryKeys } from '@/lib/queryKeys/projectKeys';
import React from 'react';

export interface UseOptimisticSearchReturn {
  optimisticSearch: ProcessedSearchHistoryEntry | null;
  displaySearchHistory: ProcessedSearchHistoryEntry[];
  searchStartTimeRef: React.MutableRefObject<number>;
  correlationIdRef: React.MutableRefObject<string | null>;
  startOptimisticSearch: (
    tempSearchId: string,
    projectId: string,
    searchQueries?: string[],
    parsedElements?: string[]
  ) => void;
  clearOptimisticSearch: () => void;
}

interface OptimisticState {
  optimisticEntry: ProcessedSearchHistoryEntry | null;
  correlationId: string | null;
  realSearchId: string | null;
}

export function useOptimisticSearch(
  searchHistory: ProcessedSearchHistoryEntry[],
  minimumSearchDuration: number = 1000
): UseOptimisticSearchReturn {
  const [optimisticState, setOptimisticState] = useState<OptimisticState>({
    optimisticEntry: null,
    correlationId: null,
    realSearchId: null,
  });
  const searchStartTimeRef = useRef<number>(0);
  const correlationIdRef = useRef<string | null>(null);
  const queryClient = useQueryClient();
  const projectIdRef = useRef<string | null>(null);
  const activeOptimisticIdRef = useRef<string | null>(null);

  // Check if we have a real entry that matches our optimistic one
  const hasMatchingRealEntry = useCallback(() => {
    if (!optimisticState.optimisticEntry) return false;

    const searchStartTime = searchStartTimeRef.current;
    const optimisticQuery = optimisticState.optimisticEntry.query;

    return searchHistory.some(entry => {
      // Skip optimistic entries
      if (entry.id.startsWith('optimistic-')) return false;

      // Check if this is a new search (created after we started)
      const entryTime = new Date(entry.timestamp).getTime();
      const timeDiff = entryTime - searchStartTime;
      const isNew = timeDiff >= -5000; // 5 second buffer for clock differences

      // Check if the query matches
      const normalizeQuery = (q: string) =>
        q.toLowerCase().replace(/\s+/g, ' ').trim();
      const queryMatches =
        optimisticQuery &&
        entry.query &&
        normalizeQuery(entry.query).includes(
          normalizeQuery(optimisticQuery).substring(0, 50)
        );

      // It's our new search if it's new and matches our query
      const isOurSearch =
        isNew &&
        queryMatches &&
        (entry.citationExtractionStatus === 'processing' ||
          entry.citationExtractionStatus === 'completed');

      return isOurSearch;
    });
  }, [searchHistory, optimisticState.optimisticEntry, searchStartTimeRef]);

  // Build the display list - only show optimistic if no matching real entry exists
  const displaySearchHistory = React.useMemo(() => {
    // First, filter out any optimistic entries from the search history
    const realEntries = searchHistory.filter(
      entry => !entry.id.startsWith('optimistic-')
    );

    // If we have an optimistic entry and no matching real entry, prepend it
    if (optimisticState.optimisticEntry && !hasMatchingRealEntry()) {
      return [optimisticState.optimisticEntry, ...realEntries];
    }

    // Otherwise just return the real entries
    return realEntries;
  }, [searchHistory, optimisticState.optimisticEntry, hasMatchingRealEntry]);

  // Clean up optimistic entry when real entry appears
  useEffect(() => {
    const currentOptimisticEntry = optimisticState.optimisticEntry;
    const currentCorrelationId = optimisticState.correlationId;
    if (!currentOptimisticEntry) return;

    if (hasMatchingRealEntry()) {
      // Clear optimistic search after minimum duration
      const searchStartTime = searchStartTimeRef.current;
      const elapsed = Date.now() - searchStartTime;
      const remainingTime = Math.max(0, minimumSearchDuration - elapsed);

      const timeoutId = setTimeout(() => {
        logger.info(
          '[useOptimisticSearch] Removing optimistic search after delay',
          {
            optimisticId: currentOptimisticEntry.id,
          }
        );

        setOptimisticState({
          optimisticEntry: null,
          correlationId: null,
          realSearchId: null,
        });
        correlationIdRef.current = null;
        activeOptimisticIdRef.current = null;
      }, remainingTime);

      return () => clearTimeout(timeoutId);
    }
  }, [
    searchHistory,
    optimisticState.optimisticEntry,
    minimumSearchDuration,
    hasMatchingRealEntry,
  ]);

  // Simple polling for search completion
  useEffect(() => {
    if (!projectIdRef.current) return;

    // Check if we have any processing searches (optimistic or real)
    const hasProcessing =
      optimisticState.optimisticEntry ||
      searchHistory.some(e => e.citationExtractionStatus === 'processing');

    if (!hasProcessing) {
      logger.debug(
        '[useOptimisticSearch] No processing searches, skipping polling'
      );
      return;
    }

    logger.info('[useOptimisticSearch] Starting polling for search updates', {
      hasOptimistic: !!optimisticState.optimisticEntry,
      projectId: projectIdRef.current,
    });

    // Poll every 2 seconds
    const intervalId = setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: searchHistoryKeys.all(projectIdRef.current!),
      });
    }, 2000);

    return () => clearInterval(intervalId);
  }, [optimisticState.optimisticEntry, searchHistory, queryClient]);

  const startOptimisticSearch = useCallback(
    (
      tempSearchId: string,
      projectId: string,
      searchQueries?: string[],
      parsedElements?: string[]
    ) => {
      // Check if we already have an active optimistic search
      if (activeOptimisticIdRef.current) {
        logger.debug(
          '[useOptimisticSearch] Optimistic search already active, ignoring duplicate',
          {
            activeId: activeOptimisticIdRef.current,
            attemptedId: tempSearchId,
          }
        );
        return;
      }

      const now = Date.now();
      const correlationId = `${projectId}-${now}-${Math.random().toString(36).substr(2, 9)}`;

      projectIdRef.current = projectId;
      correlationIdRef.current = correlationId;
      searchStartTimeRef.current = now;
      activeOptimisticIdRef.current = tempSearchId;

      const query =
        searchQueries && searchQueries.length > 0
          ? searchQueries.join(' | ')
          : 'Searching...';

      const optimisticEntry: ProcessedSearchHistoryEntry = {
        id: tempSearchId,
        query,
        timestamp: new Date(now),
        results: [],
        resultCount: 0,
        citationExtractionStatus: 'processing',
        parsedElements: parsedElements || [],
        projectId,
        searchData: {
          correlationId,
        },
        userId: null,
        citationJobId: null,
        hasCitationJobs: false,
        citationJobCount: 0,
      };

      logger.info('[useOptimisticSearch] Starting optimistic search', {
        tempSearchId,
        projectId,
        correlationId,
      });

      setOptimisticState({
        optimisticEntry,
        correlationId,
        realSearchId: null,
      });
    },
    []
  );

  const clearOptimisticSearch = useCallback(() => {
    if (optimisticState.optimisticEntry) {
      logger.info('[useOptimisticSearch] Clearing optimistic search', {
        tempSearchId: optimisticState.optimisticEntry.id,
      });
    }
    setOptimisticState({
      optimisticEntry: null,
      correlationId: null,
      realSearchId: null,
    });
    correlationIdRef.current = null;
    activeOptimisticIdRef.current = null;
  }, [optimisticState.optimisticEntry]);

  return {
    optimisticSearch: optimisticState.optimisticEntry,
    displaySearchHistory,
    searchStartTimeRef,
    correlationIdRef,
    startOptimisticSearch,
    clearOptimisticSearch,
  };
}

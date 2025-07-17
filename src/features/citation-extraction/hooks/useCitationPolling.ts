import { useEffect, useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCitationStatus } from './useCitationStatus';
import { useCitationStore } from '../store';
import { logger } from '@/utils/clientLogger';

// Maximum time to keep showing optimistic refs before clearing them
const OPTIMISTIC_REF_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Hook to handle polling for citation status and show notifications
 * when citations are ready
 */
export function useCitationPolling() {
  const queryClient = useQueryClient();
  const activeSearchId = useCitationStore(state => state.activeSearchId);
  const getOptimisticRefsForSearch = useCitationStore(
    state => state.getOptimisticRefsForSearch
  );
  const clearStaleOptimisticRefs = useCitationStore(
    state => state.clearStaleOptimisticRefs
  );
  const [pollInterval, setPollInterval] = useState(10000); // Optimized from 3000ms to reduce CPU usage

  // Get optimistic refs for the active search - memoized to prevent dependency issues
  const optimisticRefs = useMemo(
    () => (activeSearchId ? getOptimisticRefsForSearch(activeSearchId) : {}),
    [activeSearchId, getOptimisticRefsForSearch]
  );

  // Clear stale optimistic refs periodically
  useEffect(() => {
    if (!activeSearchId) return;

    const intervalId = setInterval(() => {
      clearStaleOptimisticRefs(activeSearchId, OPTIMISTIC_REF_TIMEOUT_MS);
    }, 10000); // Check every 10 seconds

    return () => clearInterval(intervalId);
  }, [activeSearchId, clearStaleOptimisticRefs]);

  // Poll for citation jobs when there are optimistic refs
  const { data: citationJobsData, error } = useCitationStatus({
    searchHistoryId: activeSearchId,
    enabled: !!activeSearchId && Object.keys(optimisticRefs).length > 0,
    refetchInterval: pollInterval, // Use dynamic interval
  });

  // Handle rate limit errors by backing off
  useEffect(() => {
    if (error && 'statusCode' in error && error.statusCode === 429) {
      // Double the interval on rate limit, max 60 seconds
      setPollInterval(prev => Math.min(prev * 2, 60000));
      logger.warn('[useCitationPolling] Rate limited, backing off', {
        newInterval: Math.min(pollInterval * 2, 60000),
      });
    } else if (!error && pollInterval > 10000) {
      // Gradually reduce interval when successful, but not below 10000ms
      setPollInterval(prev => Math.max(10000, prev * 0.8));
    }
  }, [error, pollInterval]);

  // Note: Toast notifications are now handled in CitationsTabContainer
  // to show a single toast when all citation extraction completes with matches

  // Note: Toast tracking is now handled in CitationsTabContainer
}

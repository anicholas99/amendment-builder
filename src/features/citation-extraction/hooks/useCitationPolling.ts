import { useEffect, useState, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCitationStatus } from './useCitationStatus';
import { useCitationStore } from '../store';
import { logger } from '@/lib/monitoring/logger';
import { citationKeys } from '@/lib/queryKeys';
import { useToast } from '@chakra-ui/react';

// Maximum time to keep showing optimistic refs before clearing them
const OPTIMISTIC_REF_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Hook to handle polling for citation status and show notifications
 * when citations are ready
 */
export function useCitationPolling() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const activeSearchId = useCitationStore(state => state.activeSearchId);
  const getOptimisticRefsForSearch = useCitationStore(
    state => state.getOptimisticRefsForSearch
  );
  const clearStaleOptimisticRefs = useCitationStore(
    state => state.clearStaleOptimisticRefs
  );
  const [pollInterval, setPollInterval] = useState(10000); // Optimized from 3000ms to reduce CPU usage
  const hasShownToastRef = useRef<Set<string>>(new Set());

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

  // Show toast when citations are ready
  useEffect(() => {
    if (!citationJobsData || !activeSearchId) return;

    const realJobs = Array.isArray(citationJobsData)
      ? citationJobsData
      : citationJobsData?.jobs || [];

    // Check for completed jobs that we haven't toasted yet
    realJobs.forEach(job => {
      if (job.status === 'COMPLETED' && job.referenceNumber) {
        const toastKey = `${activeSearchId}-${job.referenceNumber}`;
        if (!hasShownToastRef.current.has(toastKey)) {
          // Check if we have citation matches for this reference
          const queryKey = citationKeys.matches.bySearchHistory(activeSearchId);
          const matches = queryClient.getQueryData<any>(queryKey);

          let hasMatches = false;
          if (matches?.groupedResults) {
            hasMatches = matches.groupedResults.some((group: any) =>
              group.matches?.some(
                (match: any) => match.referenceNumber === job.referenceNumber
              )
            );
          }

          if (hasMatches) {
            hasShownToastRef.current.add(toastKey);
            toast({
              title: 'Citation extraction complete',
              description: `Reference ${job.referenceNumber} has been processed`,
              status: 'success',
              duration: 3000,
              isClosable: true,
              position: 'bottom-right',
            });
          }
        }
      }
    });
  }, [citationJobsData, activeSearchId, queryClient, toast]);

  // Reset toast tracking when search changes
  useEffect(() => {
    hasShownToastRef.current.clear();
  }, [activeSearchId]);
}

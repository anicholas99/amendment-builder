import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/utils/clientLogger';

/**
 * Hook to poll for citation reasoning status updates
 * When matches with pending or processing reasoning are detected,
 * this hook will start a polling interval to check for updates
 *
 * @param searchHistoryId The ID of the current search history entry
 * @param shouldPoll A boolean flag indicating whether to poll for reasoning status updates
 * @param maxAttempts Maximum number of poll attempts before stopping (default: 30)
 * @param pollInterval Polling interval in milliseconds (default: 2000ms)
 * @returns void
 */
export const useReasoningStatusPolling = (
  searchHistoryId: string | null,
  shouldPoll: boolean,
  maxAttempts = 30,
  pollInterval = 2000
) => {
  const queryClient = useQueryClient();
  const pollCount = useRef(0);
  const pollIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing interval on dependency changes
    if (pollIdRef.current) {
      clearInterval(pollIdRef.current);
      pollIdRef.current = null;
    }

    // Reset poll count when dependencies change
    pollCount.current = 0;

    // Only start polling if searchHistoryId is provided and shouldPoll is true
    if (!searchHistoryId || !shouldPoll) {
      return;
    }

    logger.debug(
      `[ReasoningPolling] Starting polling for search ${searchHistoryId}, shouldPoll=${shouldPoll}`
    );

    // Start a polling interval
    pollIdRef.current = setInterval(() => {
      // Increment poll count
      pollCount.current++;

      // Stop polling if max attempts reached
      if (pollCount.current >= maxAttempts) {
        logger.warn(
          `[ReasoningPolling] Reached max poll attempts (${maxAttempts}) for reasoning status. Stopping.`
        );
        if (pollIdRef.current) {
          clearInterval(pollIdRef.current);
          pollIdRef.current = null;
        }
        return;
      }

      // Check if there are still pending/processing items by querying the cache
      const cachedMatches = queryClient.getQueryData<any[]>([
        'citationMatches',
        searchHistoryId,
      ]);
      const hasPendingReasoning = cachedMatches?.some(
        match =>
          match.reasoningStatus === 'PENDING' ||
          match.reasoningStatus === 'PROCESSING'
      );

      // Only continue if there are still pending items
      if (!hasPendingReasoning) {
        logger.info(
          `[ReasoningPolling] No more pending reasoning, stopping poll after ${pollCount.current} attempts.`
        );
        if (pollIdRef.current) {
          clearInterval(pollIdRef.current);
          pollIdRef.current = null;
        }
        return;
      }

      // Invalidate the query to trigger a refetch
      logger.debug(
        `[ReasoningPolling] Polling attempt ${pollCount.current}, invalidating citationMatches query.`
      );
      queryClient.invalidateQueries({
        queryKey: ['citationMatches', searchHistoryId],
      });
    }, pollInterval);

    // Clean up on unmount or dependency change
    return () => {
      logger.debug(`[ReasoningPolling] Cleaning up reasoning polling.`);
      if (pollIdRef.current) {
        clearInterval(pollIdRef.current);
        pollIdRef.current = null;
      }
    };
  }, [searchHistoryId, shouldPoll, queryClient, pollInterval, maxAttempts]);
};

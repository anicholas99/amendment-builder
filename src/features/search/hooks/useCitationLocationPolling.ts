import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SearchApiService } from '@/client/services/search.client-service';

import { logger } from '@/lib/monitoring/logger';
import { isApiError } from '@/types/safe-type-helpers';

// Assuming TableCitationMatch interface is similar/compatible with API response
// Ideally, import the type from where it's defined (e.g., useCitationMatches or the component)
interface CitationMatch {
  id: string;
  locationStatus?: string | null;
  locationJobId?: number | null;
  // other fields...
}

const MAX_POLL_ATTEMPTS = 20; // Add a max poll attempt safety

export const useCitationLocationPolling = (
  searchHistoryId: string | null,
  shouldPoll: boolean,
  claimSetVersionId?: string | null, // Add claimSetVersionId parameter
  maxAttempts = 10,
  pollInterval = 5000
) => {
  const queryClient = useQueryClient();
  const activePolls = useRef<Map<number, ReturnType<typeof setInterval>>>(
    new Map()
  );
  const pollCounts = useRef<Map<number, number>>(new Map()); // Track poll counts per job

  useEffect(() => {
    // Only run the effect if polling is requested and we have an ID
    if (!shouldPoll || !searchHistoryId) {
      // If no search ID or shouldPoll is false, clear any existing polls and return
      activePolls.current.forEach(intervalId => clearInterval(intervalId));
      activePolls.current.clear();
      pollCounts.current.clear(); // Reset counts when polling stops
      return;
    }

    logger.debug(
      `[LocationPolling] Starting polling for search ${searchHistoryId}, shouldPoll=${shouldPoll}, versionId=${claimSetVersionId}`
    );

    const currentPolls = activePolls.current;
    const currentCounts = pollCounts.current;

    // Build the correct query key based on available parameters
    const queryKey = claimSetVersionId
      ? ['citationMatches', searchHistoryId, claimSetVersionId]
      : ['citationMatches', searchHistoryId];

    // Fetch the *current* data directly from the query cache when needed
    const cachedMatches = queryClient.getQueryData<CitationMatch[]>(queryKey);

    if (!cachedMatches) {
      logger.warn(
        `[LocationPolling] No cached citation matches found for key ${JSON.stringify(queryKey)}, cannot determine jobs to poll.`
      );
      return; // Cannot proceed without data
    }

    // Determine which job IDs need polling based on cached data
    const jobIdsToPoll = new Set<number>();
    cachedMatches.forEach(match => {
      if (
        (match.locationStatus === 'PROCESSING' ||
          match.locationStatus === 'PENDING') &&
        match.locationJobId != null
      ) {
        jobIdsToPoll.add(match.locationJobId);
      }
    });

    logger.debug(
      `[LocationPolling] Found ${jobIdsToPoll.size} jobs to poll from ${cachedMatches.length} matches`
    );

    // --- Start polling for new processing matches within the filtered set ---
    jobIdsToPoll.forEach(jobId => {
      if (!currentPolls.has(jobId)) {
        // Check poll count before starting
        const attempts = currentCounts.get(jobId) || 0;
        if (attempts >= MAX_POLL_ATTEMPTS) {
          logger.warn(
            `[LocationPolling] Max poll attempts (${MAX_POLL_ATTEMPTS}) reached for job ${jobId}. Stopping poll.`
          );
          return;
        }

        logger.debug(
          `[LocationPolling] Starting polling for locationJobId: ${jobId}`
        );

        // Initialize count
        currentCounts.set(jobId, attempts);

        const intervalId = setInterval(async () => {
          const currentAttempts = (currentCounts.get(jobId) || 0) + 1;
          currentCounts.set(jobId, currentAttempts);

          if (currentAttempts > MAX_POLL_ATTEMPTS) {
            logger.warn(
              `[LocationPolling] Max poll attempts (${MAX_POLL_ATTEMPTS}) reached during interval for job ${jobId}. Stopping poll.`
            );
            clearInterval(intervalId);
            currentPolls.delete(jobId);
            return;
          }

          try {
            const data = await SearchApiService.getCitationLocationResult(
              jobId.toString()
            );

            logger.debug(
              `[LocationPolling] Polled for ${jobId}, External Status: ${data?.status}`
            );

            // Stop polling if status is 1 (Success) or 2 (Failure)
            if (data?.status === 1 || data?.status === 2) {
              logger.info(
                `[LocationPolling] Location job ${jobId} finished (Status: ${data.status}). Invalidating matches query.`
              );
              queryClient.invalidateQueries({
                queryKey,
                refetchType: 'all',
              });
              clearInterval(intervalId);
              currentPolls.delete(jobId);
            }
          } catch (error) {
            if (isApiError(error) && (error as any).status === 404) {
              logger.debug(
                `[useCitationLocationPolling] Job ${jobId} not found (404)`
              );
              clearInterval(intervalId);
              currentPolls.delete(jobId);
              return;
            }
            logger.error('[LocationPolling] Error polling job', error);
          }
        }, pollInterval);

        currentPolls.set(jobId, intervalId);
      }
    });

    // Clean up intervals for jobs no longer in processing set
    currentPolls.forEach((intervalId, id) => {
      if (!jobIdsToPoll.has(id)) {
        clearInterval(intervalId);
        currentPolls.delete(id);
      }
    });

    return () => {
      currentPolls.forEach(intervalId => clearInterval(intervalId));
      currentPolls.clear();
      currentCounts.clear();
    };
  }, [
    searchHistoryId,
    shouldPoll,
    claimSetVersionId,
    queryClient,
    pollInterval,
  ]);
};

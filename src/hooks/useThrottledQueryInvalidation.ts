import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/utils/clientLogger';
import { useQueryInvalidationDelay } from './useQueryInvalidationDelay';

interface InvalidateOptions {
  queryKey: readonly unknown[];
  refetchType?: 'active' | 'inactive' | 'all' | 'none';
}

/**
 * Custom hook that provides a throttled version of queryClient.invalidateQueries
 * This prevents rapid successive invalidations that cause duplicate API requests
 *
 * @param delay - Throttle delay in milliseconds (default: 500ms)
 * @returns Throttled invalidate function
 */
export const useThrottledQueryInvalidation = (delay: number = 500) => {
  const queryClient = useQueryClient();
  const { scheduleInvalidation, cancel } = useQueryInvalidationDelay(
    queryClient,
    { delay }
  );

  const pendingInvalidations = useRef<Map<string, InvalidateOptions>>(
    new Map()
  );
  const scheduledKeys = useRef<Set<string>>(new Set());

  const throttledInvalidate = useCallback(
    (options: InvalidateOptions) => {
      const keyString = JSON.stringify(options.queryKey);

      // Store the pending invalidation (this will override any previous one for the same key)
      pendingInvalidations.current.set(keyString, options);

      // Only schedule if we haven't already scheduled for this key
      if (!scheduledKeys.current.has(keyString)) {
        scheduledKeys.current.add(keyString);

        logger.debug(
          '[useThrottledQueryInvalidation] Scheduling invalidation for key',
          { key: keyString }
        );

        scheduleInvalidation(async () => {
          const pendingOptions = pendingInvalidations.current.get(keyString);
          if (pendingOptions) {
            logger.debug(
              '[useThrottledQueryInvalidation] Executing invalidation for key',
              { key: keyString }
            );
            queryClient.invalidateQueries(pendingOptions);
            pendingInvalidations.current.delete(keyString);
          }
          scheduledKeys.current.delete(keyString);
        });
      }
    },
    [queryClient, scheduleInvalidation]
  );

  // Cleanup function to clear all pending invalidations
  const clearAllPendingInvalidations = useCallback(() => {
    cancel();
    pendingInvalidations.current.clear();
    scheduledKeys.current.clear();
    logger.debug(
      '[useThrottledQueryInvalidation] Cleared all pending invalidations'
    );
  }, [cancel]);

  // Execute all pending invalidations immediately
  const flushPendingInvalidations = useCallback(() => {
    logger.debug(
      '[useThrottledQueryInvalidation] Flushing all pending invalidations'
    );

    // Cancel all scheduled invalidations
    cancel();
    scheduledKeys.current.clear();

    // Execute all pending invalidations immediately
    pendingInvalidations.current.forEach(options => {
      queryClient.invalidateQueries(options);
    });
    pendingInvalidations.current.clear();
  }, [queryClient, cancel]);

  return {
    throttledInvalidate,
    clearAllPendingInvalidations,
    flushPendingInvalidations,
  };
};

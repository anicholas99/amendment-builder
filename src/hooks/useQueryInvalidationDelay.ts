import { useCallback, useRef } from 'react';
import { QueryClient } from '@tanstack/react-query';

interface UseQueryInvalidationDelayOptions {
  delay?: number;
}

/**
 * Hook that provides delayed query invalidation functionality
 * Used to schedule query invalidations with a delay to prevent rapid successive calls
 */
export const useQueryInvalidationDelay = (
  queryClient: QueryClient,
  options: UseQueryInvalidationDelayOptions = {}
) => {
  const { delay = 500 } = options;
  // eslint-disable-next-line no-restricted-globals
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const scheduleInvalidation = useCallback(
    (callback: () => void | Promise<void>) => {
      // Cancel any existing scheduled invalidation
      cancel();

      // Schedule new invalidation
      // eslint-disable-next-line no-restricted-globals, no-restricted-syntax
      timeoutRef.current = setTimeout(() => {
        callback();
        timeoutRef.current = null;
      }, delay);
    },
    [cancel, delay]
  );

  return {
    scheduleInvalidation,
    cancel,
  };
};

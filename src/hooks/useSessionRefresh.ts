import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/utils/clientLogger';
import { authQueryKeys } from '@/lib/queryKeys';

// Refresh session 5 minutes before it expires
const REFRESH_BEFORE_EXPIRY = 5 * 60 * 1000; // 5 minutes
// Check every minute
const CHECK_INTERVAL = 60 * 1000; // 1 minute

/**
 * Hook to automatically refresh the session before it expires
 * This prevents the user from getting logged out during active use
 */
export function useSessionRefresh() {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    const checkAndRefreshSession = async () => {
      try {
        // Get current session from cache
        const session = queryClient.getQueryData(authQueryKeys.session());

        if (!session) {
          logger.debug('[useSessionRefresh] No session to refresh');
          return;
        }

        // Check if we're close to expiry
        // Note: This is a simplified check - in production you'd want to
        // check the actual token expiry from the session data
        const lastFetchTime = queryClient.getQueryState(
          authQueryKeys.session()
        )?.dataUpdatedAt;

        if (!lastFetchTime) return;

        const timeSinceLastFetch = Date.now() - lastFetchTime;
        const sessionAge = timeSinceLastFetch;

        // Assume 30 minute session timeout (adjust based on your Auth0 config)
        const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
        const timeUntilExpiry = SESSION_TIMEOUT - sessionAge;

        if (timeUntilExpiry < REFRESH_BEFORE_EXPIRY) {
          logger.info('[useSessionRefresh] Refreshing session before expiry', {
            timeUntilExpiry: Math.round(timeUntilExpiry / 1000) + 's',
          });

          // Invalidate and refetch the session
          await queryClient.invalidateQueries({
            queryKey: authQueryKeys.session(),
            refetchType: 'active',
          });
        }
      } catch (error) {
        logger.error('[useSessionRefresh] Error checking session', { error });
      }
    };

    // Initial check
    checkAndRefreshSession();

    // Set up interval
    intervalRef.current = setInterval(checkAndRefreshSession, CHECK_INTERVAL);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [queryClient]);
}

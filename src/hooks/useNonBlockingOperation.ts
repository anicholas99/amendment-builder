import { useCallback } from 'react';
import { logger } from '@/utils/clientLogger';

/**
 * Hook for deferring heavy operations to prevent blocking UI animations
 *
 * This is a centralized solution for the common pattern of needing to defer
 * heavy operations (like cache invalidation) until after UI transitions complete.
 *
 * @example
 * ```typescript
 * const deferOperation = useNonBlockingOperation();
 *
 * // Defer heavy cache invalidation
 * deferOperation(() => {
 *   queryClient.invalidateQueries(['heavy-query']);
 * }, 'cache-invalidation');
 * ```
 */
export const useNonBlockingOperation = () => {
  const deferOperation = useCallback(
    (operation: () => void | Promise<void>, operationName?: string) => {
      // Use requestIdleCallback for optimal scheduling, with setTimeout fallback
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(
          async () => {
            try {
              await operation();
              if (operationName) {
                logger.debug(
                  `[NonBlockingOperation] Completed: ${operationName}`
                );
              }
            } catch (error) {
              logger.error(`[NonBlockingOperation] Failed: ${operationName}`, {
                error,
              });
            }
          },
          { timeout: 1000 } // Ensure operation runs within 1 second
        );
      } else {
        setTimeout(async () => {
          try {
            await operation();
            if (operationName) {
              logger.debug(
                `[NonBlockingOperation] Completed: ${operationName}`
              );
            }
          } catch (error) {
            logger.error(`[NonBlockingOperation] Failed: ${operationName}`, {
              error,
            });
          }
        }, 100);
      }
    },
    []
  );

  return deferOperation;
};

/**
 * Custom hook for managing and debugging project loading states
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { logger } from '@/utils/clientLogger';
import { useToast } from '@/hooks/useToastWrapper';
import { useTimeout } from '@/hooks/useTimeout';

export interface LoadingState {
  isLoading: boolean;
  operation: string | null;
  startTime: number | null;
  error: Error | null;
}

export function useProjectLoadingState() {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    operation: null,
    startTime: null,
    error: null,
  });

  const [activeSafetyTimeout, setActiveSafetyTimeout] = useState(false);
  const currentOperationRef = useRef<string | null>(null);
  const toast = useToast();

  // Safety timeout using useTimeout
  const cancelSafetyTimeout = useTimeout(
    () => {
      const operation = currentOperationRef.current;
      if (operation) {
        logger.warn(
          `[Loading] Safety timeout triggered for operation: ${operation}`
        );
        setLoadingState(prev => {
          // Only clear if it's still the same operation
          if (prev.operation === operation) {
            toast({
              title: 'Operation timed out',
              description: `The operation "${operation}" is taking longer than expected. Loading state has been cleared.`,
              status: 'warning',
              duration: 5000,
              isClosable: true,
            });

            return {
              isLoading: false,
              operation: null,
              startTime: null,
              error: new Error(`Operation timed out: ${operation}`),
            };
          }
          return prev;
        });
      }
      setActiveSafetyTimeout(false);
      currentOperationRef.current = null;
    },
    activeSafetyTimeout ? 8000 : null
  );

  // Function to start loading state with safety timeout
  const startLoading = useCallback(
    (operation: string) => {
      logger.info(`[Loading] Starting: ${operation}`);

      // Cancel any existing safety timeout
      if (activeSafetyTimeout) {
        setActiveSafetyTimeout(false);
      }

      // Set new loading state
      setLoadingState({
        isLoading: true,
        operation,
        startTime: Date.now(),
        error: null,
      });

      // Set up safety timeout
      currentOperationRef.current = operation;
      setActiveSafetyTimeout(true);

      return () => {
        // Function to finalize this specific loading operation
        return (error?: Error) => {
          finishLoading(operation, error);
        };
      };
    },
    [activeSafetyTimeout]
  );

  // Function to finish loading state
  const finishLoading = useCallback((operation: string, error?: Error) => {
    logger.info(
      `[Loading] Finishing: ${operation}${error ? ' with error' : ' successfully'}`
    );

    // Clear safety timeout
    setActiveSafetyTimeout(false);
    currentOperationRef.current = null;

    setLoadingState(prev => {
      // Only update if it's the same operation
      if (prev.operation === operation) {
        return {
          isLoading: false,
          operation: null,
          startTime: null,
          error: error || null,
        };
      }
      return prev;
    });
  }, []);

  return {
    ...loadingState,
    startLoading,
    finishLoading,
  };
}

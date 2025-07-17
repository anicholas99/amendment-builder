import { useState, useCallback, useRef } from 'react';
import { logger } from '@/utils/clientLogger';

export interface LoadingStateConfig {
  operation: string;
  message?: string;
  submessage?: string;
  timeout?: number; // Optional timeout in milliseconds
  onTimeout?: () => void;
}

export interface LoadingStateResult {
  // State
  isLoading: boolean;
  operation: string | null;
  message: string | null;
  submessage: string | null;
  error: Error | null;
  startTime: number | null;

  // Actions
  startLoading: (config: LoadingStateConfig | string) => void;
  stopLoading: (error?: Error) => void;
  updateMessage: (message: string, submessage?: string) => void;
  reset: () => void;

  // Computed
  duration: number | null;
  isError: boolean;
}

/**
 * Hook for managing loading states with consistent patterns
 *
 * @example
 * const loadingState = useLoadingState();
 *
 * // Simple usage
 * loadingState.startLoading('Fetching data');
 * const data = await fetchData();
 * loadingState.stopLoading();
 *
 * // With configuration
 * loadingState.startLoading({
 *   operation: 'save',
 *   message: 'Saving changes...',
 *   timeout: 30000,
 *   onTimeout: () => toast({ title: 'Save is taking longer than expected' })
 * });
 *
 * // With error handling
 * try {
 *   loadingState.startLoading('Processing');
 *   await process();
 * } catch (error) {
 *   loadingState.stopLoading(error);
 * }
 */
export function useLoadingState(): LoadingStateResult {
  const [state, setState] = useState({
    isLoading: false,
    operation: null as string | null,
    message: null as string | null,
    submessage: null as string | null,
    error: null as Error | null,
    startTime: null as number | null,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any existing timeout
  const clearLoadingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Start loading with configuration
  const startLoading = useCallback(
    (config: LoadingStateConfig | string) => {
      const configuration: LoadingStateConfig =
        typeof config === 'string'
          ? { operation: config, message: config }
          : config;

      // Clear any existing timeout
      clearLoadingTimeout();

      // Log the start of operation
      logger.info(`[LoadingState] Starting: ${configuration.operation}`, {
        message: configuration.message,
        timeout: configuration.timeout,
      });

      // Update state
      setState({
        isLoading: true,
        operation: configuration.operation,
        message: configuration.message || configuration.operation,
        submessage: configuration.submessage || null,
        error: null,
        startTime: Date.now(),
      });

      // Set timeout if provided
      if (configuration.timeout && configuration.timeout > 0) {
        timeoutRef.current = setTimeout(() => {
          logger.warn(
            `[LoadingState] Operation timed out: ${configuration.operation}`
          );

          if (configuration.onTimeout) {
            configuration.onTimeout();
          }

          // Auto-stop loading on timeout
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: new Error(`Operation timed out: ${configuration.operation}`),
          }));
        }, configuration.timeout);
      }
    },
    [clearLoadingTimeout]
  );

  // Stop loading
  const stopLoading = useCallback(
    (error?: Error) => {
      clearLoadingTimeout();

      setState(prev => {
        if (!prev.isLoading) return prev;

        const duration = prev.startTime ? Date.now() - prev.startTime : 0;

        logger.info(`[LoadingState] Stopped: ${prev.operation}`, {
          duration,
          error: error?.message,
        });

        return {
          ...prev,
          isLoading: false,
          error: error || null,
        };
      });
    },
    [clearLoadingTimeout]
  );

  // Update message while loading
  const updateMessage = useCallback((message: string, submessage?: string) => {
    setState(prev => {
      if (!prev.isLoading) return prev;

      return {
        ...prev,
        message,
        submessage: submessage !== undefined ? submessage : prev.submessage,
      };
    });
  }, []);

  // Reset state
  const reset = useCallback(() => {
    clearLoadingTimeout();

    setState({
      isLoading: false,
      operation: null,
      message: null,
      submessage: null,
      error: null,
      startTime: null,
    });
  }, [clearLoadingTimeout]);

  // Calculate duration
  const duration =
    state.startTime && !state.isLoading ? Date.now() - state.startTime : null;

  return {
    ...state,
    startLoading,
    stopLoading,
    updateMessage,
    reset,
    duration,
    isError: !!state.error,
  };
}

/**
 * Hook for managing multiple concurrent loading states
 *
 * @example
 * const loadingStates = useMultipleLoadingStates();
 *
 * // Start different operations
 * loadingStates.start('fetch', 'Fetching data...');
 * loadingStates.start('process', 'Processing results...');
 *
 * // Check specific states
 * if (loadingStates.isLoading('fetch')) { ... }
 *
 * // Stop specific operation
 * loadingStates.stop('fetch');
 *
 * // Check if any operation is loading
 * if (loadingStates.isAnyLoading()) { ... }
 */
export function useMultipleLoadingStates() {
  const [states, setStates] = useState<
    Map<string, LoadingStateConfig & { startTime: number }>
  >(new Map());

  const start = useCallback(
    (key: string, config: LoadingStateConfig | string) => {
      const configuration: LoadingStateConfig =
        typeof config === 'string'
          ? { operation: config, message: config }
          : config;

      setStates(prev => {
        const next = new Map(prev);
        next.set(key, { ...configuration, startTime: Date.now() });
        return next;
      });
    },
    []
  );

  const stop = useCallback((key: string) => {
    setStates(prev => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const isLoading = useCallback(
    (key: string) => {
      return states.has(key);
    },
    [states]
  );

  const isAnyLoading = useCallback(() => {
    return states.size > 0;
  }, [states]);

  const getLoadingOperations = useCallback(() => {
    return Array.from(states.entries()).map(([key, value]) => ({
      key,
      ...value,
      duration: Date.now() - value.startTime,
    }));
  }, [states]);

  const reset = useCallback(() => {
    setStates(new Map());
  }, []);

  return {
    start,
    stop,
    isLoading,
    isAnyLoading,
    getLoadingOperations,
    reset,
    count: states.size,
  };
}

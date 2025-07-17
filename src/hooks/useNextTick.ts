import { useCallback, useRef, useEffect } from 'react';

/**
 * Hook that returns a function to defer execution to the next tick
 * Uses requestAnimationFrame for better performance than setTimeout(0)
 */
export function useNextTick() {
  const rafRef = useRef<number | null>(null);

  const nextTick = useCallback((callback: () => void) => {
    // Cancel any pending RAF
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    // Schedule for next frame
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      callback();
    });
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  return { nextTick, cleanup };
}

/**
 * Alternative using queueMicrotask for truly immediate execution
 * after current call stack but before next render
 */
export function useMicrotask() {
  const isMountedRef = useRef(true);

  const queueTask = useCallback((callback: () => void) => {
    queueMicrotask(() => {
      if (isMountedRef.current) {
        callback();
      }
    });
  }, []);

  // Track mount state
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return queueTask;
}

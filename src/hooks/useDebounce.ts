import { useEffect, useRef, useState, useCallback } from 'react';
import { delay } from '@/utils/delay';

/**
 * A custom hook that debounces a value.
 *
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes or the component unmounts
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Re-run the effect if value or delay changes

  return debouncedValue;
}

/**
 * Hook that returns a debounced callback function using async patterns
 * @param callback The callback to debounce
 * @param delayMs The delay in milliseconds
 * @returns A debounced version of the callback and cancel function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delayMs: number
): [(...args: Parameters<T>) => void, () => void] {
  const cancelRef = useRef<boolean>(false);
  const callbackRef = useRef(callback);
  const argsRef = useRef<Parameters<T> | null>(null);

  // Update callback ref on each render
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      cancelRef.current = true; // Cancel any pending execution
      argsRef.current = args;
      cancelRef.current = false; // Reset cancel flag

      // Use async function with proper error handling
      const performDelay = async () => {
        try {
          await delay(delayMs);
          if (!cancelRef.current && argsRef.current) {
            callbackRef.current(...argsRef.current);
            argsRef.current = null;
          }
        } catch {
          // Ignore errors from delay cancellation
        }
      };

      // Execute the async function
      void performDelay();
    },
    [delayMs]
  );

  const cancel = useCallback(() => {
    cancelRef.current = true;
    argsRef.current = null;
  }, []);

  return [debouncedCallback, cancel];
}

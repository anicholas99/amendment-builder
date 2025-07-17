import { useEffect, useRef } from 'react';

/**
 * Custom hook for declarative intervals in React
 * Properly handles cleanup and ref updates
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (delay === null) {
      return;
    }

    // eslint-disable-next-line no-restricted-globals, no-restricted-syntax
    const id = setInterval(() => savedCallback.current(), delay);

    return () => clearInterval(id);
  }, [delay]);
}

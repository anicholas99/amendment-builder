import { useEffect, useRef } from 'react';

/**
 * A hook that provides a declarative timeout.
 * @param callback The function to call after the timeout.
 * @param delay The delay in milliseconds.
 */
export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) {
      return;
    }

    // eslint-disable-next-line no-restricted-globals, no-restricted-syntax
    const id = setTimeout(() => savedCallback.current(), delay);

    return () => clearTimeout(id);
  }, [delay]);

  // The hook itself doesn't need to return anything for this implementation,
  // but you could expand it to return controls like `start`, `stop`, `reset`.
}

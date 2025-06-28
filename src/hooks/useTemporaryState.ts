import { useCallback, useRef, useEffect, useState } from 'react';

/**
 * Hook for managing state that automatically reverts after a specified duration.
 * Useful for temporary UI states like success messages, highlight effects, etc.
 *
 * @param defaultValue - The default/reset value
 * @param duration - Duration in milliseconds before reverting to default
 * @returns [value, setValue, clearValue] - Current value, setter, and manual clear function
 */
export function useTemporaryState<T>(
  defaultValue: T,
  duration: number = 3000
): [T, (value: T) => void, () => void] {
  const [value, setValue] = useState<T>(defaultValue);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any existing timeout when setting a new value
  const setTemporaryValue = useCallback(
    (newValue: T) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Set the new value
      setValue(newValue);

      // If the new value is different from default, set timeout to revert
      if (newValue !== defaultValue) {
        timeoutRef.current = setTimeout(() => {
          setValue(defaultValue);
          timeoutRef.current = null;
        }, duration);
      }
    },
    [defaultValue, duration]
  );

  // Manual clear function
  const clearValue = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setValue(defaultValue);
  }, [defaultValue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [value, setTemporaryValue, clearValue];
}

/**
 * Hook for managing a Set that automatically removes items after a duration.
 * Useful for tracking temporary states like "saving" indicators.
 *
 * @param duration - Duration in milliseconds before removing items
 * @returns Object with the set, add, remove, and clear methods
 */
export function useTemporarySet<T>(duration: number = 300) {
  const [items, setItems] = useState<Set<T>>(new Set());
  const timersRef = useRef<Map<T, NodeJS.Timeout>>(new Map());

  const add = useCallback(
    (item: T) => {
      // Clear existing timer for this item if any
      const existingTimer = timersRef.current.get(item);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Add item to set
      setItems(prev => new Set(prev).add(item));

      // Set timer to remove item
      const timer = setTimeout(() => {
        setItems(prev => {
          const next = new Set(prev);
          next.delete(item);
          return next;
        });
        timersRef.current.delete(item);
      }, duration);

      timersRef.current.set(item, timer);
    },
    [duration]
  );

  const remove = useCallback((item: T) => {
    // Clear timer if exists
    const timer = timersRef.current.get(item);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(item);
    }

    // Remove from set
    setItems(prev => {
      const next = new Set(prev);
      next.delete(item);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    // Clear all timers
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current.clear();

    // Clear set
    setItems(new Set());
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
    };
  }, []);

  return {
    items,
    add,
    remove,
    clear,
    has: (item: T) => items.has(item),
    size: items.size,
  };
}

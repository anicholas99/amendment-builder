import { useCallback } from 'react';
import { unstable_batchedUpdates } from 'react-dom';

/**
 * Hook that provides a function to batch multiple state updates
 * This prevents cascading re-renders when updating multiple contexts
 */
export function useBatchedUpdates() {
  const batchUpdates = useCallback((updates: () => void) => {
    // In React 18+, updates are automatically batched
    // But for React 17 and earlier, we need unstable_batchedUpdates
    if (typeof unstable_batchedUpdates === 'function') {
      unstable_batchedUpdates(updates);
    } else {
      // Fallback for React 18+ or if unstable_batchedUpdates is not available
      updates();
    }
  }, []);

  return batchUpdates;
}

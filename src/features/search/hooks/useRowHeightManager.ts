import React, { useRef, useCallback, useEffect } from 'react';
import { logger } from '@/lib/monitoring/logger';
import { VariableSizeList as List } from 'react-window';
import { SearchHistoryEntry } from '../utils/searchHistoryUtils';

interface RowHeightManagerResult {
  getRowHeight: (index: number) => number;
  updateRowHeight: (index: number, height: number) => void; // Function to update height
  resetCache: () => void;
}

const DEFAULT_ROW_HEIGHT = 60; // Default height for unmeasured/collapsed rows

/**
 * Hook for managing measured row heights in react-window.
 */
export const useRowHeightManager = (
  listRef: React.RefObject<List>,
  searchHistory: SearchHistoryEntry[] // Accept only necessary dependencies
): RowHeightManagerResult => {
  // Cache measured row heights using index as key
  const rowHeights = useRef<{ [key: number]: number }>({});

  // Get stored height or return default
  const getRowHeight = useCallback((index: number): number => {
    return rowHeights.current[index] || DEFAULT_ROW_HEIGHT;
  }, []); // No dependencies needed as it only reads the ref

  // Function provided to rows to report their measured height
  const updateRowHeight = useCallback(
    (index: number, height: number) => {
      // Only update and notify list if height is different from cached value
      // Also check if height is positive to avoid issues
      if (rowHeights.current[index] !== height && height > 0) {
        // logger.log(`[useRowHeightManager] Updating height for index ${index}: ${height}`);
        rowHeights.current[index] = height;
        // Crucial: Tell react-window to discard cached size AND FORCE UPDATE
        // for this index and subsequent ones.
        listRef.current?.resetAfterIndex(index, true); // Use true to force update
      }
    },
    [listRef]
  ); // Depends only on listRef

  // Function to reset the entire cache (e.g., when data set changes drastically)
  const resetCache = useCallback(() => {
    if (listRef.current) {
      // logger.log("[useRowHeightManager] Resetting entire height cache.");
      rowHeights.current = {};
      listRef.current.resetAfterIndex(0); // Reset all heights
    }
  }, [listRef]); // Depends only on listRef

  // Reset cache only when the number of items changes
  useEffect(() => {
    // logger.log("[useRowHeightManager] Search history length changed, resetting cache.");
    resetCache();
  }, [searchHistory.length, resetCache]);

  return {
    getRowHeight,
    updateRowHeight, // Ensure this is returned
    resetCache,
  };
};

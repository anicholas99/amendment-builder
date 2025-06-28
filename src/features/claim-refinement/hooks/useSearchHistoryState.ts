import React, { useState, useCallback, useRef } from 'react';
import { ProcessedSearchHistoryEntry } from '@/features/search/types';

interface SearchHistoryState {
  searchHistory: ProcessedSearchHistoryEntry[];
  parsedResultsCache: React.MutableRefObject<
    Record<string, ProcessedSearchHistoryEntry>
  >;
}

interface SearchHistoryActions {
  setSearchHistory: (history: ProcessedSearchHistoryEntry[]) => void;
  updateSearchHistoryFromSidebar: (history: unknown[]) => void;
  addToParsedResultsCache: (
    id: string,
    entry: ProcessedSearchHistoryEntry
  ) => void;
  getFromParsedResultsCache: (
    id: string
  ) => ProcessedSearchHistoryEntry | undefined;
}

export function useSearchHistoryState(): SearchHistoryState &
  SearchHistoryActions {
  const [searchHistory, setSearchHistory] = useState<
    ProcessedSearchHistoryEntry[]
  >([]);
  const parsedResultsCache = useRef<
    Record<string, ProcessedSearchHistoryEntry>
  >({});

  // Simple update from sidebar - just set the search history directly
  const updateSearchHistoryFromSidebar = useCallback((history: unknown[]) => {
    // Convert to ProcessedSearchHistoryEntry if needed
    const processedHistory = history as ProcessedSearchHistoryEntry[];
    if (processedHistory.length > 0) {
      setSearchHistory(processedHistory);
    }
  }, []);

  // Cache management
  const addToParsedResultsCache = useCallback(
    (id: string, entry: ProcessedSearchHistoryEntry) => {
      parsedResultsCache.current[id] = entry;
    },
    []
  );

  const getFromParsedResultsCache = useCallback(
    (id: string): ProcessedSearchHistoryEntry | undefined => {
      return parsedResultsCache.current[id];
    },
    []
  );

  return {
    // State
    searchHistory,
    parsedResultsCache,

    // Actions
    setSearchHistory,
    updateSearchHistoryFromSidebar,
    addToParsedResultsCache,
    getFromParsedResultsCache,
  };
}

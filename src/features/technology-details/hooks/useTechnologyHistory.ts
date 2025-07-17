import React, { useState, useCallback, useRef, useEffect } from 'react';
import { InventionData } from '../../../types';
import { logger } from '@/utils/clientLogger';
import { useDebounce } from '@/hooks/useDebounce';

interface HistoryEntry {
  data: InventionData;
  timestamp: number;
  description: string;
}

interface UseTechnologyHistoryOptions {
  maxHistorySize?: number;
}

/**
 * Custom hook to manage undo/redo history for technology details
 */
export const useTechnologyHistory = (
  analyzedInvention: InventionData | null,
  setAnalyzedInvention: (
    value: React.SetStateAction<InventionData | null>
  ) => void,
  options: UseTechnologyHistoryOptions = {}
) => {
  const { maxHistorySize = 20 } = options;

  // History state
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Ref to track if we're in the middle of an undo/redo operation
  const isUndoRedoOperation = useRef(false);

  const debouncedInvention = useDebounce(analyzedInvention, 1000);

  useEffect(() => {
    if (debouncedInvention) {
      setHistory(prevHistory => {
        const newEntry: HistoryEntry = {
          data: debouncedInvention,
          timestamp: Date.now(),
          description: 'Debounced change',
        };
        const filteredHistory = prevHistory.filter(
          entry => entry.timestamp !== newEntry.timestamp
        );
        return [newEntry, ...filteredHistory].slice(0, maxHistorySize);
      });
    }
  }, [debouncedInvention, maxHistorySize]);

  // Add a new entry to history
  const addToHistory = useCallback(
    (description: string) => {
      if (!analyzedInvention || isUndoRedoOperation.current) {
        return;
      }

      const newEntry: HistoryEntry = {
        data: { ...analyzedInvention },
        timestamp: Date.now(),
        description,
      };

      setHistory(prev => {
        // Remove any entries after the current index
        const newHistory = prev.slice(0, currentIndex + 1);

        // Add the new entry
        newHistory.push(newEntry);

        // Limit history size
        if (newHistory.length > maxHistorySize) {
          newHistory.shift();
        }

        return newHistory;
      });

      setCurrentIndex(prev => Math.min(prev + 1, maxHistorySize - 1));

      logger.info('[TechnologyHistory] Added history entry:', {
        description,
        historyLength: history.length + 1,
        currentIndex: currentIndex + 1,
      });
    },
    [analyzedInvention, currentIndex, history.length, maxHistorySize]
  );

  // Undo the last change
  const undo = useCallback(() => {
    if (currentIndex <= 0 || !analyzedInvention) {
      logger.info('[TechnologyHistory] Cannot undo - no previous state');
      return false;
    }

    isUndoRedoOperation.current = true;
    const previousEntry = history[currentIndex - 1];

    setAnalyzedInvention(previousEntry.data);

    setCurrentIndex(currentIndex - 1);
    isUndoRedoOperation.current = false;

    logger.info('[TechnologyHistory] Undo performed:', {
      description: previousEntry.description,
      newIndex: currentIndex - 1,
    });

    return true;
  }, [currentIndex, history, setAnalyzedInvention, analyzedInvention]);

  // Redo the next change
  const redo = useCallback(() => {
    if (currentIndex >= history.length - 1 || !analyzedInvention) {
      logger.info('[TechnologyHistory] Cannot redo - no next state');
      return false;
    }

    isUndoRedoOperation.current = true;
    const nextEntry = history[currentIndex + 1];

    setAnalyzedInvention(nextEntry.data);

    setCurrentIndex(currentIndex + 1);
    isUndoRedoOperation.current = false;

    logger.info('[TechnologyHistory] Redo performed:', {
      description: nextEntry.description,
      newIndex: currentIndex + 1,
    });

    return true;
  }, [currentIndex, history, setAnalyzedInvention, analyzedInvention]);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
    logger.info('[TechnologyHistory] History cleared');
  }, []);

  // Get the current state info
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;
  const historyLength = history.length;

  // Get descriptions for tooltips
  const previousDescription =
    currentIndex > 0 ? history[currentIndex - 1].description : null;
  const nextDescription =
    currentIndex < history.length - 1
      ? history[currentIndex + 1].description
      : null;

  // Initialize history with current state if needed
  const initializeHistory = useCallback(() => {
    if (analyzedInvention && history.length === 0) {
      const initialEntry: HistoryEntry = {
        data: { ...analyzedInvention },
        timestamp: Date.now(),
        description: 'Initial technology details',
      };
      setHistory([initialEntry]);
      setCurrentIndex(0);
      logger.info('[TechnologyHistory] Initialized with current data');
    }
  }, [analyzedInvention, history.length]);

  const recordManualChange = (updatedInvention: InventionData) => {
    setHistory(prevHistory => {
      const newEntry: HistoryEntry = {
        data: updatedInvention,
        timestamp: Date.now(),
        description: 'Manual change',
      };
      const filteredHistory = prevHistory.filter(
        entry => entry.timestamp !== newEntry.timestamp
      );
      return [newEntry, ...filteredHistory].slice(0, maxHistorySize);
    });
  };

  return {
    // Operations
    addToHistory,
    undo,
    redo,
    clearHistory,
    initializeHistory,
    recordManualChange,

    // State
    canUndo,
    canRedo,
    historyLength,
    currentIndex,
    previousDescription,
    nextDescription,

    // Flag to check if we're in undo/redo operation
    isUndoRedoOperation: isUndoRedoOperation.current,
  };
};

import React, { useState, useCallback, useRef } from 'react';
import { logger } from '@/utils/clientLogger';
import { InventionData } from '@/types';

interface HistoryEntry {
  claims: Record<string, string>;
  timestamp: Date;
  description: string;
}

interface UseClaimHistoryOptions {
  maxHistorySize?: number;
}

export const useClaimHistory = (
  analyzedInvention: InventionData | null,
  setAnalyzedInvention: React.Dispatch<
    React.SetStateAction<InventionData | null>
  >,
  updateToDatabase?: (invention: InventionData | null) => void,
  options: UseClaimHistoryOptions = {}
) => {
  const { maxHistorySize = 20 } = options;

  // History state
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Ref to track if we're in the middle of an undo/redo operation
  const isUndoRedoOperation = useRef(false);

  // Add a new entry to history
  const addToHistory = useCallback(
    (description: string) => {
      if (!analyzedInvention?.claims || isUndoRedoOperation.current) {
        return;
      }

      const newEntry: HistoryEntry = {
        claims: { ...(analyzedInvention.claims as Record<string, string>) },
        timestamp: new Date(),
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

      logger.info('[ClaimHistory] Added history entry:', {
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
      logger.info('[ClaimHistory] Cannot undo - no previous state');
      return false;
    }

    isUndoRedoOperation.current = true;
    const previousEntry = history[currentIndex - 1];

    const updatedInvention = {
      ...analyzedInvention,
      claims: previousEntry.claims,
    };

    setAnalyzedInvention(updatedInvention);

    // Persist to database if function provided
    if (updateToDatabase) {
      updateToDatabase(updatedInvention);
    }

    setCurrentIndex(currentIndex - 1);
    isUndoRedoOperation.current = false;

    logger.info('[ClaimHistory] Undo performed:', {
      description: previousEntry.description,
      newIndex: currentIndex - 1,
    });

    return true;
  }, [
    currentIndex,
    history,
    setAnalyzedInvention,
    analyzedInvention,
    updateToDatabase,
  ]);

  // Redo the next change
  const redo = useCallback(() => {
    if (currentIndex >= history.length - 1 || !analyzedInvention) {
      logger.info('[ClaimHistory] Cannot redo - no next state');
      return false;
    }

    isUndoRedoOperation.current = true;
    const nextEntry = history[currentIndex + 1];

    const updatedInvention = {
      ...analyzedInvention,
      claims: nextEntry.claims,
    };

    setAnalyzedInvention(updatedInvention);

    // Persist to database if function provided
    if (updateToDatabase) {
      updateToDatabase(updatedInvention);
    }

    setCurrentIndex(currentIndex + 1);
    isUndoRedoOperation.current = false;

    logger.info('[ClaimHistory] Redo performed:', {
      description: nextEntry.description,
      newIndex: currentIndex + 1,
    });

    return true;
  }, [
    currentIndex,
    history,
    setAnalyzedInvention,
    analyzedInvention,
    updateToDatabase,
  ]);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
    logger.info('[ClaimHistory] History cleared');
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
    if (analyzedInvention?.claims && history.length === 0) {
      const initialEntry: HistoryEntry = {
        claims: { ...(analyzedInvention.claims as Record<string, string>) },
        timestamp: new Date(),
        description: 'Initial claims',
      };
      setHistory([initialEntry]);
      setCurrentIndex(0);
      logger.debug('[ClaimHistory] Initialized with current claims');
    }
  }, [analyzedInvention, history.length]);

  return {
    // Operations
    addToHistory,
    undo,
    redo,
    clearHistory,
    initializeHistory,

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

export default useClaimHistory;

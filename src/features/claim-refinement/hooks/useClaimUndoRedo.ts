import { useState, useCallback, useEffect, useRef } from 'react';
import { useUpdateClaimMutation } from '@/hooks/api/useClaims';
import { useToast } from '@/hooks/useToastWrapper';
import { logger } from '@/utils/clientLogger';

interface UseClaimUndoRedoOptions {
  claimId: string;
  currentText: string;
  onTextChange?: (text: string) => void;
}

interface SessionHistoryEntry {
  text: string;
  timestamp: number;
}

// Storage key helper
const getStorageKey = (claimId: string) => `claim-history-${claimId}`;

// Max entries to store per claim
const MAX_HISTORY_ENTRIES = 20;

export const useClaimUndoRedo = ({
  claimId,
  currentText,
  onTextChange,
}: UseClaimUndoRedoOptions) => {
  // Don't use undo/redo for temporary claims
  const isTemporaryId = claimId.startsWith('temp-');

  const { mutate: updateClaim } = useUpdateClaimMutation();
  const toast = useToast();

  // Load initial history from sessionStorage
  const loadHistoryFromStorage = useCallback(
    (claimId: string): SessionHistoryEntry[] => {
      if (isTemporaryId) return [{ text: currentText, timestamp: Date.now() }];

      try {
        const stored = sessionStorage.getItem(getStorageKey(claimId));
        if (stored) {
          const parsed = JSON.parse(stored);
          // Validate the data structure
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (error) {
        logger.debug('[useClaimUndoRedo] Failed to load history from storage', {
          error,
        });
      }

      // Return initial state if nothing in storage
      return [{ text: currentText, timestamp: Date.now() }];
    },
    [currentText, isTemporaryId]
  );

  // Session-based history for immediate undo/redo
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryEntry[]>(
    () => loadHistoryFromStorage(claimId)
  );
  const [sessionHistoryIndex, setSessionHistoryIndex] = useState(() => {
    const history = loadHistoryFromStorage(claimId);
    return history.length - 1;
  });

  // Track if we're in an undo/redo operation
  const isUndoRedoOperationRef = useRef(false);

  // Debounce timer for adding to session history
  const historyDebounceTimer = useRef<NodeJS.Timeout>();

  // Save history to sessionStorage whenever it changes
  useEffect(() => {
    if (isTemporaryId) return;

    try {
      sessionStorage.setItem(
        getStorageKey(claimId),
        JSON.stringify(sessionHistory)
      );
    } catch (error) {
      // Handle quota exceeded error gracefully
      logger.warn('[useClaimUndoRedo] Failed to save history to storage', {
        error,
      });
    }
  }, [sessionHistory, claimId, isTemporaryId]);

  // Reset session history when claim ID changes
  useEffect(() => {
    const loadedHistory = loadHistoryFromStorage(claimId);
    setSessionHistory(loadedHistory);
    setSessionHistoryIndex(loadedHistory.length - 1);
  }, [claimId, loadHistoryFromStorage]);

  // Add current text to session history when it changes (with debouncing)
  useEffect(() => {
    // Skip if we're in an undo/redo operation or text hasn't changed
    if (isUndoRedoOperationRef.current) return;

    const lastEntry = sessionHistory[sessionHistoryIndex];
    if (lastEntry && lastEntry.text === currentText) return;

    // Clear existing timer
    if (historyDebounceTimer.current) {
      clearTimeout(historyDebounceTimer.current);
    }

    // Debounce adding to history (500ms)
    historyDebounceTimer.current = setTimeout(() => {
      setSessionHistory(prev => {
        // Remove any entries after current position (branching history)
        const newHistory = prev.slice(0, sessionHistoryIndex + 1);

        // Add new entry
        newHistory.push({ text: currentText, timestamp: Date.now() });

        // Limit history size to MAX_HISTORY_ENTRIES
        if (newHistory.length > MAX_HISTORY_ENTRIES) {
          // Remove oldest entries
          newHistory.splice(0, newHistory.length - MAX_HISTORY_ENTRIES);
        }

        return newHistory;
      });

      // Update index to point to new entry
      setSessionHistoryIndex(prev => {
        const newHistory = sessionHistory.slice(0, prev + 1);
        newHistory.push({ text: currentText, timestamp: Date.now() });
        return Math.min(newHistory.length - 1, MAX_HISTORY_ENTRIES - 1);
      });

      logger.debug('[useClaimUndoRedo] Added to session history', {
        historyLength: sessionHistory.length + 1,
        textLength: currentText.length,
      });
    }, 500);

    return () => {
      if (historyDebounceTimer.current) {
        clearTimeout(historyDebounceTimer.current);
      }
    };
  }, [currentText, sessionHistoryIndex, sessionHistory]);

  // Check if we can navigate
  const canUndo = !isTemporaryId && sessionHistoryIndex > 0;
  const canRedo =
    !isTemporaryId && sessionHistoryIndex < sessionHistory.length - 1;

  const undo = useCallback(() => {
    if (!canUndo || claimId.startsWith('temp-')) return;

    isUndoRedoOperationRef.current = true;

    const newIndex = sessionHistoryIndex - 1;
    const targetEntry = sessionHistory[newIndex];

    if (!targetEntry) {
      isUndoRedoOperationRef.current = false;
      return;
    }

    logger.debug('[useClaimUndoRedo] Undoing to previous version', {
      claimId,
      fromIndex: sessionHistoryIndex,
      toIndex: newIndex,
      textPreview: targetEntry.text.substring(0, 50) + '...',
    });

    // Update the claim
    updateClaim(
      { claimId, text: targetEntry.text },
      {
        onSuccess: () => {
          setSessionHistoryIndex(newIndex);
          // Update local state if callback provided
          onTextChange?.(targetEntry.text);

          // Clear the operation flag after a delay
          setTimeout(() => {
            isUndoRedoOperationRef.current = false;
          }, 100);
        },
        onError: error => {
          isUndoRedoOperationRef.current = false;
          logger.error('[useClaimUndoRedo] Failed to undo', { error });
          toast({
            title: 'Failed to undo',
            description: 'Could not revert to previous version',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        },
      }
    );
  }, [
    canUndo,
    claimId,
    sessionHistory,
    sessionHistoryIndex,
    updateClaim,
    onTextChange,
    toast,
  ]);

  const redo = useCallback(() => {
    if (!canRedo || claimId.startsWith('temp-')) return;

    isUndoRedoOperationRef.current = true;

    const newIndex = sessionHistoryIndex + 1;
    const targetEntry = sessionHistory[newIndex];

    if (!targetEntry) {
      isUndoRedoOperationRef.current = false;
      return;
    }

    logger.debug('[useClaimUndoRedo] Redoing to newer version', {
      claimId,
      fromIndex: sessionHistoryIndex,
      toIndex: newIndex,
      textPreview: targetEntry.text.substring(0, 50) + '...',
    });

    // Update the claim
    updateClaim(
      { claimId, text: targetEntry.text },
      {
        onSuccess: () => {
          setSessionHistoryIndex(newIndex);
          // Update local state if callback provided
          onTextChange?.(targetEntry.text);

          // Clear the operation flag after a delay
          setTimeout(() => {
            isUndoRedoOperationRef.current = false;
          }, 100);
        },
        onError: error => {
          isUndoRedoOperationRef.current = false;
          logger.error('[useClaimUndoRedo] Failed to redo', { error });
          toast({
            title: 'Failed to redo',
            description: 'Could not apply newer version',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        },
      }
    );
  }, [
    canRedo,
    claimId,
    sessionHistory,
    sessionHistoryIndex,
    updateClaim,
    onTextChange,
    toast,
  ]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when this specific claim's textarea is focused
      const target = e.target as HTMLElement;

      // Check if target is within this claim's container
      const claimContainer = target.closest('[data-claim-id]');
      if (
        !claimContainer ||
        claimContainer.getAttribute('data-claim-id') !== claimId
      ) {
        return;
      }

      // Check for undo/redo shortcuts
      if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, claimId]);

  // Clean up sessionStorage for old temporary claims on mount
  useEffect(() => {
    try {
      const keys = Object.keys(sessionStorage);
      const tempClaimKeys = keys.filter(
        key =>
          key.startsWith('claim-history-temp-') &&
          key !== getStorageKey(claimId)
      );

      // Remove old temporary claim histories
      tempClaimKeys.forEach(key => {
        sessionStorage.removeItem(key);
      });
    } catch (error) {
      logger.debug(
        '[useClaimUndoRedo] Failed to clean up temp claim histories',
        { error }
      );
    }
  }, [claimId]);

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    historyLength: sessionHistory.length,
    historyPosition: sessionHistoryIndex,
    // Provide the current history entry for UI display
    currentHistoryEntry: sessionHistory[sessionHistoryIndex],
  };
};

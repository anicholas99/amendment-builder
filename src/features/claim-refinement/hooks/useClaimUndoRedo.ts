import { useState, useCallback, useEffect, useRef } from 'react';
import { useClaimHistoryQuery } from '@/hooks/api/useClaimHistory';
import { useUpdateClaimMutation } from '@/hooks/api/useClaims';
import { useToast } from '@chakra-ui/react';
import { logger } from '@/lib/monitoring/logger';

interface UseClaimUndoRedoOptions {
  claimId: string;
  currentText: string;
  onTextChange?: (text: string) => void;
}

export const useClaimUndoRedo = ({
  claimId,
  currentText,
  onTextChange,
}: UseClaimUndoRedoOptions) => {
  // Don't fetch history for temporary claims
  const isTemporaryId = claimId.startsWith('temp-');

  const {
    data: historyData,
    refetch,
    isLoading,
  } = useClaimHistoryQuery(claimId);
  const { mutate: updateClaim } = useUpdateClaimMutation();
  const toast = useToast();

  // Track where we are in the history (0 = current, 1 = one step back, etc.)
  const [historyPosition, setHistoryPosition] = useState(0);

  // Track the last text we saw to detect external changes
  const lastTextRef = useRef(currentText);

  // Track if we're in an undo/redo operation
  const isUndoRedoOperationRef = useRef(false);

  // Track the original text to enable undo even before first save
  const [originalText, setOriginalText] = useState(currentText);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const history = historyData?.history || [];

  // Force fetch history on mount for non-temporary claims
  useEffect(() => {
    if (!isTemporaryId && claimId) {
      logger.debug('[useClaimUndoRedo] Prefetching history on mount', {
        claimId,
      });
      refetch();
    }
  }, [claimId, isTemporaryId, refetch]);

  // Debug logging
  useEffect(() => {
    logger.debug('[useClaimUndoRedo] History state', {
      claimId,
      historyLength: history.length,
      historyPosition,
      isLoading,
      isTemporaryId,
      hasHistory: history.length > 0,
      hasUnsavedChanges,
    });
  }, [
    claimId,
    history.length,
    historyPosition,
    isLoading,
    isTemporaryId,
    hasUnsavedChanges,
  ]);

  // Reset position when claim ID changes (not on text changes)
  useEffect(() => {
    setHistoryPosition(0);
    lastTextRef.current = currentText;
    setOriginalText(currentText);
    setHasUnsavedChanges(false);
  }, [claimId]); // Only reset on claim ID change, not text change

  // Detect when text changes externally (not from undo/redo) and refetch history
  useEffect(() => {
    // Skip for temporary IDs or if we're in an undo/redo operation
    if (isTemporaryId || isUndoRedoOperationRef.current) return;

    // If text changed and we're at the current position (not viewing history)
    if (currentText !== lastTextRef.current && historyPosition === 0) {
      lastTextRef.current = currentText;

      // Track if we have unsaved changes
      if (currentText !== originalText) {
        setHasUnsavedChanges(true);
      }

      // No need to manually refetch - React Query will handle it via invalidation
      logger.debug('[useClaimUndoRedo] Text changed externally', {
        claimId,
        textLength: currentText.length,
        hasUnsavedChanges: currentText !== originalText,
      });
    }
  }, [currentText, historyPosition, claimId, isTemporaryId, originalText]);

  // Reset unsaved changes when history is updated (indicating a save completed)
  useEffect(() => {
    if (history.length > 0 && hasUnsavedChanges) {
      // Check if the most recent history entry matches our current text
      const mostRecentEntry = history[0];
      if (mostRecentEntry && mostRecentEntry.newText === currentText) {
        logger.debug(
          '[useClaimUndoRedo] Save completed, resetting unsaved changes',
          {
            claimId,
            historyLength: history.length,
          }
        );
        setHasUnsavedChanges(false);
        setOriginalText(currentText);
      }
    }
  }, [history, hasUnsavedChanges, currentText, claimId]);

  // Check if we can navigate (also check if not loading and not temporary)
  // Allow undo if we have history OR if we have unsaved changes (can revert to original)
  const canUndo =
    !isLoading &&
    !isTemporaryId &&
    (historyPosition < history.length ||
      (historyPosition === 0 && hasUnsavedChanges));
  const canRedo = !isLoading && !isTemporaryId && historyPosition > 0;

  const undo = useCallback(() => {
    if (!canUndo || claimId.startsWith('temp-')) return;

    isUndoRedoOperationRef.current = true;

    // Special case: if we're at position 0 with unsaved changes but no history,
    // revert to the original text
    if (historyPosition === 0 && hasUnsavedChanges && history.length === 0) {
      logger.debug(
        '[useClaimUndoRedo] Reverting to original text (no history yet)',
        {
          claimId,
          originalTextLength: originalText.length,
        }
      );

      // Update the claim to original text
      updateClaim(
        { claimId, text: originalText },
        {
          onSuccess: () => {
            setHasUnsavedChanges(false);
            // Update local state if callback provided
            onTextChange?.(originalText);

            // Clear the operation flag after a delay
            setTimeout(() => {
              isUndoRedoOperationRef.current = false;
            }, 500);
          },
          onError: error => {
            isUndoRedoOperationRef.current = false;
            logger.error('[useClaimUndoRedo] Failed to revert to original', {
              error,
            });
            toast({
              title: 'Failed to undo',
              description: 'Could not revert to original text',
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
          },
        }
      );
      return;
    }

    // Normal history-based undo
    const targetPosition = historyPosition + 1;
    const targetEntry = history[historyPosition];

    // Update to the previous text
    const targetText = targetEntry.previousText;

    logger.debug('[useClaimUndoRedo] Undoing to previous version', {
      claimId,
      position: targetPosition,
      timestamp: targetEntry.timestamp,
    });

    // Update the claim
    updateClaim(
      { claimId, text: targetText },
      {
        onSuccess: () => {
          setHistoryPosition(targetPosition);
          // Update local state if callback provided
          onTextChange?.(targetText);

          // Clear the operation flag after a delay
          setTimeout(() => {
            isUndoRedoOperationRef.current = false;
          }, 500);
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
    history,
    historyPosition,
    updateClaim,
    onTextChange,
    toast,
    hasUnsavedChanges,
    originalText,
  ]);

  const redo = useCallback(() => {
    if (!canRedo || claimId.startsWith('temp-')) return;

    isUndoRedoOperationRef.current = true;
    const targetPosition = historyPosition - 1;

    // When redoing to position 0, we need the most recent history entry's newText
    // For other positions, we use the entry at that position
    let targetText: string;
    if (targetPosition === 0 && history.length > 0) {
      // Going back to current state - use the most recent change's new text
      targetText = history[0].newText;
    } else if (targetPosition > 0) {
      // Going to an intermediate state - use that position's new text
      targetText = history[targetPosition - 1].newText;
    } else {
      // Shouldn't happen, but fallback to current text
      targetText = currentText;
    }

    logger.debug('[useClaimUndoRedo] Redoing to newer version', {
      claimId,
      position: targetPosition,
      targetText: targetText.substring(0, 50) + '...',
    });

    // Update the claim
    updateClaim(
      { claimId, text: targetText },
      {
        onSuccess: () => {
          setHistoryPosition(targetPosition);
          // Update local state if callback provided
          onTextChange?.(targetText);

          // Clear the operation flag after a delay
          setTimeout(() => {
            isUndoRedoOperationRef.current = false;
          }, 500);
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
    history,
    historyPosition,
    currentText,
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

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    historyLength: history.length,
    historyPosition,
    // Provide the current history entry for UI display
    currentHistoryEntry: history[historyPosition - 1],
  };
};

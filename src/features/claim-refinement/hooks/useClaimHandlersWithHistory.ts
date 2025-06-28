import React, { useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useClaimManagement, useClaimHistory } from './index';
import { useSimpleClaimGeneration } from './useSimpleClaimGeneration';
import { InventionData } from '@/types';
import { TOAST_DURATIONS, TOAST_MESSAGES } from '../constants';

interface ClaimHandlersWithHistoryProps {
  projectId: string;
  analyzedInvention: InventionData | null;
  setAnalyzedInvention: React.Dispatch<
    React.SetStateAction<InventionData | null>
  >;
  updateClaimsInDatabase: (updatedInvention: InventionData | null) => void;
}

export function useClaimHandlersWithHistory({
  projectId,
  analyzedInvention,
  setAnalyzedInvention,
  updateClaimsInDatabase,
}: ClaimHandlersWithHistoryProps) {
  const toast = useToast();

  // Initialize claim management hooks
  const {
    handleClaimChange,
    handleDeleteClaim,
    handleInsertNewClaim,
    handleAddClaim,
    handleReorderClaim,
    isAddingClaim,
    setIsAddingClaim,
    newClaimText,
    setNewClaimText,
    newClaimDependsOn,
    setNewClaimDependsOn,
  } = useClaimManagement(
    analyzedInvention,
    setAnalyzedInvention,
    updateClaimsInDatabase
  );

  // Initialize claim history hook
  const {
    addToHistory,
    undo,
    redo,
    clearHistory,
    initializeHistory,
    canUndo,
    canRedo,
    previousDescription,
    nextDescription,
    isUndoRedoOperation,
  } = useClaimHistory(
    analyzedInvention,
    setAnalyzedInvention,
    updateClaimsInDatabase
  );

  // Initialize claim generation hook
  const { generateClaim1, isGenerating } = useSimpleClaimGeneration({
    onClaimGenerated: claimText => {
      handleClaimChangeWithHistory('1', claimText);
    },
  });

  const handleGenerateClaim1WithProjectId = useCallback(() => {
    generateClaim1({ projectId, invention: analyzedInvention });
  }, [generateClaim1, projectId, analyzedInvention]);

  // Wrap handlers with history tracking
  const handleClaimChangeWithHistory = useCallback(
    (claimNumber: string, text: string) => {
      if (!isUndoRedoOperation) {
        addToHistory(`Updated claim ${claimNumber}`);
      }
      handleClaimChange(claimNumber, text);
    },
    [handleClaimChange, addToHistory, isUndoRedoOperation]
  );

  const handleDeleteClaimWithHistory = useCallback(
    (claimNumber: string) => {
      if (!isUndoRedoOperation) {
        addToHistory(`Deleted claim ${claimNumber}`);
      }
      handleDeleteClaim(claimNumber);
    },
    [handleDeleteClaim, addToHistory, isUndoRedoOperation]
  );

  const handleInsertNewClaimWithHistory = useCallback(
    (afterClaimNumber: string, text: string = '', dependsOn: string = '') => {
      if (!isUndoRedoOperation) {
        addToHistory(`Added dependent claim after claim ${afterClaimNumber}`);
      }
      handleInsertNewClaim(afterClaimNumber, text, dependsOn);
    },
    [handleInsertNewClaim, addToHistory, isUndoRedoOperation]
  );

  const handleAddClaimWithHistory = useCallback(() => {
    if (!isUndoRedoOperation) {
      addToHistory('Added new claim');
    }
    handleAddClaim();
  }, [handleAddClaim, addToHistory, isUndoRedoOperation]);

  const handleReorderClaimWithHistory = useCallback(
    (claimNumber: string, direction: 'up' | 'down') => {
      if (!isUndoRedoOperation) {
        addToHistory(`Moved claim ${claimNumber} ${direction}`);
      }
      handleReorderClaim(claimNumber, direction);
    },
    [handleReorderClaim, addToHistory, isUndoRedoOperation]
  );

  // Handle undo with toast notification
  const handleUndo = useCallback(() => {
    if (undo()) {
      toast({
        title: TOAST_MESSAGES.SUCCESS.UNDO,
        description: previousDescription || 'Changes reverted',
        status: 'info',
        duration: TOAST_DURATIONS.SHORT,
        isClosable: true,
      });
    }
  }, [undo, previousDescription, toast]);

  // Handle redo with toast notification
  const handleRedo = useCallback(() => {
    if (redo()) {
      toast({
        title: TOAST_MESSAGES.SUCCESS.REDO,
        description: nextDescription || 'Changes reapplied',
        status: 'info',
        duration: TOAST_DURATIONS.SHORT,
        isClosable: true,
      });
    }
  }, [redo, nextDescription, toast]);

  // Handle confirm apply
  const handleConfirmApply = useCallback(
    (newClaimText: string) => {
      if (!isUndoRedoOperation) {
        addToHistory('Applied amendment to claim 1');
      }
      handleClaimChange('1', newClaimText);
    },
    [handleClaimChange, addToHistory, isUndoRedoOperation]
  );

  // Get current claim 1 text
  const getCurrentClaim1Text = useCallback(() => {
    const claims = analyzedInvention?.claims;
    if (claims) {
      if (Array.isArray(claims)) {
        return claims[0] || '';
      } else if (typeof claims === 'object') {
        return claims['1'] || '';
      }
    }
    return '';
  }, [analyzedInvention]);

  return {
    // Claim management
    isAddingClaim,
    setIsAddingClaim,
    newClaimText,
    setNewClaimText,
    newClaimDependsOn,
    setNewClaimDependsOn,

    // Claim handlers with history
    handleClaimChangeWithHistory,
    handleDeleteClaimWithHistory,
    handleInsertNewClaimWithHistory,
    handleAddClaimWithHistory,
    handleReorderClaimWithHistory,

    // Claim generation
    handleGenerateClaim1: handleGenerateClaim1WithProjectId,
    isRegeneratingClaim1: isGenerating,

    // History operations
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    previousDescription,
    nextDescription,
    initializeHistory,
    clearHistory,

    // Utilities
    handleConfirmApply,
    getCurrentClaim1Text,
  };
}

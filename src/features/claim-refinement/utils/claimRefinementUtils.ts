import React, { startTransition } from 'react';
import { logger } from '@/lib/monitoring/logger';
import { useToast } from '@chakra-ui/react';
import { ClaimsClientService } from '@/client/services/claims.client-service';
import { ProjectApiService } from '@/client/services/project.client-service';
import {
  StructuredInventionData,
  ClaimHistoryEntry,
} from '../types/claimRefinementView';
import { PriorArtApiService } from '@/client/services/prior-art.client-service';

/**
 * Utility functions for claim refinement business logic
 */

/**
 * Updates claims in the database using the mutation
 */
export const updateClaimsInDatabase = (
  updatedInvention: StructuredInventionData | null,
  projectId: string,
  updateInventionMutation: any
) => {
  if (!updatedInvention || !projectId) return;
  updateInventionMutation.mutate(updatedInvention);
};

/**
 * Saves a change to claim history for undo/redo functionality
 */
export const saveToHistory = (
  description: string,
  analyzedInvention: StructuredInventionData | null,
  historyIndex: number,
  setClaimHistory: React.Dispatch<React.SetStateAction<ClaimHistoryEntry[]>>,
  setHistoryIndex: React.Dispatch<React.SetStateAction<number>>
) => {
  if (!analyzedInvention) return;

  const newEntry = {
    data: analyzedInvention,
    description,
  };

  startTransition(() => {
    setClaimHistory(prev => {
      // Long history updates can be deferred so they don't block the UI thread
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newEntry);
      return newHistory.slice(-20); // Keep last 20 entries
    });
  });

  startTransition(() => {
    setHistoryIndex(prev => Math.min(prev + 1, 19));
  });
};

/**
 * Handles claim change with history tracking
 */
export const handleClaimChangeWithHistory = (
  claimNumber: string,
  text: string,
  setAnalyzedInvention: React.Dispatch<
    React.SetStateAction<StructuredInventionData | null>
  >,
  saveToHistoryFn: (description: string) => void,
  updateClaimMutation: any
) => {
  saveToHistoryFn(`Edit claim ${claimNumber}`);

  startTransition(() => {
    setAnalyzedInvention(currentInvention => {
      if (!currentInvention) return null;

      // Prevent update if text is unchanged
      if (currentInvention.claims?.[claimNumber] === text) {
        return currentInvention;
      }

      const updatedInvention = {
        ...currentInvention,
        claims: {
          ...currentInvention.claims,
          [claimNumber]: text,
        },
      };
      return updatedInvention;
    });
  });

  updateClaimMutation.mutate({ claimId: claimNumber, text });
};

/**
 * Handles claim deletion with history tracking
 */
export const handleDeleteClaimWithHistory = (
  claimNumber: string,
  setAnalyzedInvention: React.Dispatch<
    React.SetStateAction<StructuredInventionData | null>
  >,
  saveToHistoryFn: (description: string) => void,
  updateClaimsInDatabaseFn: (
    updatedInvention: StructuredInventionData | null
  ) => void,
  toast: ReturnType<typeof useToast>
) => {
  saveToHistoryFn(`Delete claim ${claimNumber}`);

  let updatedInventionForDb: StructuredInventionData | null = null;

  startTransition(() => {
    setAnalyzedInvention(currentInvention => {
      if (!currentInvention?.claims) return currentInvention;

      const updatedClaims = { ...currentInvention.claims };
      delete updatedClaims[claimNumber];

      const updatedInvention = {
        ...currentInvention,
        claims: updatedClaims,
      };

      updatedInventionForDb = updatedInvention;
      return updatedInvention;
    });
  });

  // Since state updates can be async, we need to ensure we have the updated
  // value to send to the DB. A better approach might be to get it from the
  // functional update, but this is a safe way to do it without major refactoring.
  setTimeout(() => {
    if (updatedInventionForDb) {
      updateClaimsInDatabaseFn(updatedInventionForDb);
    }
  }, 0);

  toast({
    title: 'Claim deleted',
    status: 'success',
    duration: 2000,
  });
};

/**
 * Handles inserting a new claim with history tracking
 */
export const handleInsertNewClaimWithHistory = (
  afterClaimNumber: string,
  text: string,
  dependsOn: string,
  setAnalyzedInvention: React.Dispatch<
    React.SetStateAction<StructuredInventionData | null>
  >,
  saveToHistoryFn: (description: string) => void,
  updateClaimsInDatabaseFn: (
    updatedInvention: StructuredInventionData | null
  ) => void,
  toast: ReturnType<typeof useToast>
) => {
  let newClaimNumber = '1';
  let updatedInventionForDb: StructuredInventionData | null = null;

  startTransition(() => {
    setAnalyzedInvention(currentInvention => {
      if (!currentInvention) return null;

      const currentClaims = currentInvention.claims || {};
      const maxNumber = Math.max(
        ...Object.keys(currentClaims).map(n => parseInt(n)),
        0
      );
      newClaimNumber = (maxNumber + 1).toString();

      const updatedInvention = {
        ...currentInvention,
        claims: {
          ...currentClaims,
          [newClaimNumber]: text,
        },
      };
      updatedInventionForDb = updatedInvention;
      return updatedInvention;
    });
  });

  saveToHistoryFn(`Add claim ${newClaimNumber}`);

  setTimeout(() => {
    if (updatedInventionForDb) {
      updateClaimsInDatabaseFn(updatedInventionForDb);
    }
  }, 0);

  toast({
    title: 'Claim added',
    status: 'success',
    duration: 2000,
  });
};

/**
 * Generates claim 1 using AI
 */
export const handleGenerateClaim1 = async (
  projectId: string,
  analyzedInvention: StructuredInventionData | null,
  setIsRegeneratingClaim1: React.Dispatch<React.SetStateAction<boolean>>,
  setAnalyzedInvention: (invention: StructuredInventionData | null) => void,
  saveToHistoryFn: (description: string) => void,
  updateClaimsInDatabaseFn: (
    updatedInvention: StructuredInventionData | null
  ) => void,
  toast: ReturnType<typeof useToast>
) => {
  if (!projectId) return;

  setIsRegeneratingClaim1(true);
  try {
    const data = await ClaimsClientService.generateClaim1(
      projectId,
      analyzedInvention
    );

    if (data.claim && analyzedInvention) {
      saveToHistoryFn('Generate claim 1');

      const updatedInvention = {
        ...analyzedInvention,
        claims: {
          '1': data.claim,
          ...Object.fromEntries(
            Object.entries(analyzedInvention?.claims || {}).filter(
              ([num]) => num !== '1'
            )
          ),
        },
      };

      startTransition(() => {
        setAnalyzedInvention(updatedInvention);
      });
      updateClaimsInDatabaseFn(updatedInvention);

      toast({
        title: 'Claim 1 generated successfully',
        status: 'success',
        duration: 3000,
      });
    }
  } catch (error) {
    logger.error('Failed to generate claim 1:', error);
    toast({
      title: 'Failed to generate claim 1',
      status: 'error',
      duration: 5000,
    });
  } finally {
    setIsRegeneratingClaim1(false);
  }
};

/**
 * Handles adding a new claim with history
 */
export const handleAddClaimWithHistory = (
  newClaimText: string,
  setAnalyzedInvention: React.Dispatch<
    React.SetStateAction<StructuredInventionData | null>
  >,
  saveToHistoryFn: (description: string) => void,
  updateClaimsInDatabaseFn: (
    updatedInvention: StructuredInventionData | null
  ) => void,
  setNewClaimText: React.Dispatch<React.SetStateAction<string>>,
  setNewClaimDependsOn: React.Dispatch<React.SetStateAction<string>>,
  setIsAddingClaim: React.Dispatch<React.SetStateAction<boolean>>,
  toast: ReturnType<typeof useToast>
) => {
  if (!newClaimText.trim()) return;

  let newClaimNumber = '1';
  let updatedInventionForDb: StructuredInventionData | null = null;

  startTransition(() => {
    setAnalyzedInvention(currentInvention => {
      if (!currentInvention) return null;

      const currentClaims = currentInvention.claims || {};
      const maxNumber = Math.max(
        ...Object.keys(currentClaims).map(n => parseInt(n)),
        0
      );
      newClaimNumber = (maxNumber + 1).toString();

      const updatedInvention = {
        ...currentInvention,
        claims: {
          ...currentClaims,
          [newClaimNumber]: newClaimText,
        },
      };
      updatedInventionForDb = updatedInvention;
      return updatedInvention;
    });
  });

  saveToHistoryFn(`Add claim ${newClaimNumber}`);

  setTimeout(() => {
    if (updatedInventionForDb) {
      updateClaimsInDatabaseFn(updatedInventionForDb);
    }
  }, 0);

  setNewClaimText('');
  setNewClaimDependsOn('');
  setIsAddingClaim(false);

  toast({
    title: 'Claim added',
    status: 'success',
    duration: 2000,
  });
};

/**
 * Handles applying a suggestion to claim 1
 */
export const handleConfirmApply = (
  newClaimText: string,
  setAnalyzedInvention: React.Dispatch<
    React.SetStateAction<StructuredInventionData | null>
  >,
  saveToHistoryFn: (description: string) => void,
  updateClaimsInDatabaseFn: (
    updatedInvention: StructuredInventionData | null
  ) => void
) => {
  saveToHistoryFn('Apply suggestion to claim 1');
  let updatedInventionForDb: StructuredInventionData | null = null;

  startTransition(() => {
    setAnalyzedInvention(currentInvention => {
      if (!currentInvention) return null;
      const updatedInvention = {
        ...currentInvention,
        claims: {
          ...currentInvention.claims,
          '1': newClaimText,
        },
      };
      updatedInventionForDb = updatedInvention;
      return updatedInvention;
    });
  });

  setTimeout(() => {
    if (updatedInventionForDb) {
      updateClaimsInDatabaseFn(updatedInventionForDb);
    }
  }, 0);
};

/**
 * Gets the current claim 1 text
 */
export const getCurrentClaim1Text = (
  analyzedInvention: StructuredInventionData | null
): string => {
  return analyzedInvention?.claims?.['1'] || '';
};

/**
 * Handles undo operation
 */
export const handleUndo = (
  claimHistory: ClaimHistoryEntry[],
  historyIndex: number,
  setAnalyzedInvention: (invention: StructuredInventionData | null) => void,
  setHistoryIndex: React.Dispatch<React.SetStateAction<number>>
) => {
  if (historyIndex > 0) {
    const targetIndex = historyIndex - 1;
    const targetEntry = claimHistory[targetIndex];
    if (targetEntry) {
      startTransition(() => {
        setAnalyzedInvention(targetEntry.data);
      });
      setHistoryIndex(targetIndex);
    }
  }
};

/**
 * Handles redo operation
 */
export const handleRedo = (
  claimHistory: ClaimHistoryEntry[],
  historyIndex: number,
  setAnalyzedInvention: (invention: StructuredInventionData | null) => void,
  setHistoryIndex: React.Dispatch<React.SetStateAction<number>>
) => {
  if (historyIndex < claimHistory.length - 1) {
    const targetIndex = historyIndex + 1;
    const targetEntry = claimHistory[targetIndex];
    if (targetEntry) {
      startTransition(() => {
        setAnalyzedInvention(targetEntry.data);
      });
      setHistoryIndex(targetIndex);
    }
  }
};

/**
 * Initializes claim history
 */
export const initializeHistory = (
  analyzedInvention: StructuredInventionData | null,
  setClaimHistory: React.Dispatch<React.SetStateAction<ClaimHistoryEntry[]>>,
  setHistoryIndex: React.Dispatch<React.SetStateAction<number>>
) => {
  if (analyzedInvention?.claims) {
    startTransition(() => {
      setClaimHistory(prevHistory => {
        if (prevHistory.length === 0) {
          return [
            {
              data: analyzedInvention,
              description: 'Initial state',
            },
          ];
        }
        return prevHistory;
      });
      setHistoryIndex(prevIndex => (prevIndex === -1 ? 0 : prevIndex));
    });
  }
};

/**
 * Handles saving prior art
 */
export const handleSavePriorArt = async (
  reference: any,
  projectId: string,
  toast: ReturnType<typeof useToast>
) => {
  try {
    await ProjectApiService.savePriorArt(projectId, reference);

    toast({
      title: 'Prior art saved',
      status: 'success',
      duration: 2000,
    });
  } catch (error) {
    logger.error('Failed to save prior art:', error);
    toast({
      title: 'Failed to save prior art',
      status: 'error',
      duration: 3000,
    });
  }
};

/**
 * Handles removing prior art
 */
export const handleRemovePriorArt = async (
  projectId: string,
  _index: number,
  art: any,
  toast: ReturnType<typeof useToast>
) => {
  if (!art?.id) {
    logger.error('Failed to remove prior art: item has no ID', { art });
    toast({
      title: 'Failed to remove prior art',
      description: 'The selected item is missing a unique identifier.',
      status: 'error',
      duration: 3000,
    });
    return;
  }

  try {
    await PriorArtApiService.removePriorArt(projectId, art.id);

    toast({
      title: 'Prior art removed',
      status: 'success',
      duration: 2000,
    });
  } catch (error) {
    logger.error('Failed to remove prior art:', {
      error,
      projectId,
      priorArtId: art.id,
    });
    toast({
      title: 'Failed to remove prior art',
      description:
        error instanceof Error ? error.message : 'An unknown error occurred.',
      status: 'error',
      duration: 3000,
    });
  }
};

/**
 * Handles analyzing prior art
 */
export const handleAnalyzePriorArt = async (
  searchHistoryId: string,
  selectedReferenceNumbers: string[],
  forceRefresh: boolean,
  projectId: string,
  analyzedInvention: StructuredInventionData | null,
  setIsAnalyzing: React.Dispatch<React.SetStateAction<boolean>>,
  setLoadingMessage: React.Dispatch<React.SetStateAction<string>>,
  setAnalysisData: (data: any) => void,
  setActiveTab: (tab: string) => void,
  toast: ReturnType<typeof useToast>
) => {
  if (!projectId || !analyzedInvention?.claims?.['1']) return;

  setIsAnalyzing(true);
  setLoadingMessage('Analyzing prior art...');

  try {
    const data = await ProjectApiService.analyzePriorArt(
      projectId,
      searchHistoryId,
      selectedReferenceNumbers,
      forceRefresh,
      analyzedInvention.claims['1']
    );

    setAnalysisData(data);
    setActiveTab('prior-art'); // Use constant from TABS
  } catch (error) {
    logger.error('Failed to analyze prior art:', error);
    toast({
      title: 'Failed to analyze prior art',
      status: 'error',
      duration: 3000,
    });
  } finally {
    setIsAnalyzing(false);
    setLoadingMessage('');
  }
};

/**
 * Refreshes invention data (placeholder implementation)
 */
export const refreshInventionData = async (): Promise<void> => {
  logger.log('Refreshing invention data');
  return Promise.resolve();
};

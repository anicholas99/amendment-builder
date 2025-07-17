import React, { useCallback } from 'react';
import { useToast } from '@/hooks/useToastWrapper';
import { logger } from '@/utils/clientLogger';
import { emitPriorArtEvent } from '@/features/search/utils/priorArtEvents';
import {
  useAddSavedPriorArt,
  useRemoveSavedPriorArt,
} from './usePriorArtOperations';
import { PriorArtReference } from '@/types/claimTypes';
import { SavedPriorArt } from '@/features/search/types';
import { InventionData } from '@/types';
import { TOAST_DURATIONS, TOAST_MESSAGES } from '../constants';

interface PriorArtHandlersProps {
  projectId: string;
  analyzedInvention: InventionData | null;
  setAnalyzedInvention: React.Dispatch<
    React.SetStateAction<InventionData | null>
  >;
}

interface PriorArtHandlers {
  handleSavePriorArt: (priorArt: PriorArtReference) => Promise<void>;
  handleRemovePriorArt: (
    indexToRemove: number,
    artItem?: SavedPriorArt
  ) => Promise<void>;
  refreshInventionData: () => Promise<void>;
}

export function usePriorArtHandlers({
  projectId,
  analyzedInvention,
  setAnalyzedInvention,
}: PriorArtHandlersProps): PriorArtHandlers {
  const toast = useToast();
  const addMutation = useAddSavedPriorArt(() => {
    toast({
      title: 'Error',
      description: TOAST_MESSAGES.ERRORS.NO_PROJECT_ID,
      status: 'error',
      duration: TOAST_DURATIONS.MEDIUM,
    });
  });
  const removeMutation = useRemoveSavedPriorArt(() => {
    toast({
      title: 'Error',
      description: TOAST_MESSAGES.ERRORS.NO_PROJECT_ID,
      status: 'error',
      duration: TOAST_DURATIONS.MEDIUM,
    });
  });

  const handleSavePriorArt = useCallback(
    async (artItem: PriorArtReference) => {
      if (!projectId) {
        toast({
          title: 'Error',
          description: TOAST_MESSAGES.ERRORS.NO_PROJECT_ID,
          status: 'error',
          duration: TOAST_DURATIONS.MEDIUM,
        });
        return;
      }

      try {
        await addMutation.mutateAsync({
          projectId,
          referenceNumber: artItem.number,
        });

        // Emit event to notify other components
        emitPriorArtEvent({
          projectId,
          patentNumber: artItem.number,
          action: 'saved',
        });

        // Note: Success toast is handled by the mutation hook
      } catch (error) {
        // Note: Error toast is handled by the mutation hook
        logger.error('Error saving prior art:', error);
      }
    },
    [projectId, addMutation, toast]
  );

  const handleRemovePriorArt = useCallback(
    async (indexToRemove: number, artItem?: SavedPriorArt) => {
      // The art item must be passed from the parent component
      if (!artItem || !projectId) {
        logger.error('Cannot remove prior art', {
          hasArtItem: !!artItem,
          projectId,
          index: indexToRemove,
        });
        return;
      }

      logger.info('handleRemovePriorArt called', {
        indexToRemove,
        artItem,
        patentNumber: artItem.patentNumber,
      });

      try {
        await removeMutation.mutateAsync({
          projectId,
          savedPriorArtId: artItem.id,
        });

        // Update analyzedInvention if it has prior_art field
        if (analyzedInvention?.prior_art) {
          const updatedPriorArtList = analyzedInvention.prior_art.filter(
            (art: unknown, index: number) => index !== indexToRemove
          );
          setAnalyzedInvention({
            ...analyzedInvention,
            prior_art: updatedPriorArtList,
          });
        }

        // Emit event for other components to update
        emitPriorArtEvent({
          projectId,
          patentNumber: artItem.patentNumber,
          action: 'removed',
        });

        // Note: Toast is handled by the mutation hook
      } catch (error) {
        // Note: Error toast is handled by the mutation hook
        logger.error('Error removing prior art:', error);
      }
    },
    [projectId, analyzedInvention, setAnalyzedInvention, removeMutation]
  );

  const refreshInventionData = useCallback(async () => {
    logger.info(
      '[ClaimRefinementView] refreshInventionData called - data managed by useProjectSidebarData'
    );
    // Data refresh is now handled by the sidebar's useProjectSidebarData hook
  }, []);

  return {
    handleSavePriorArt,
    handleRemovePriorArt,
    refreshInventionData,
  };
}

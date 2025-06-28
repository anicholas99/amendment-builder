import React, { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import {
  PriorArtManagerProps,
  PriorArtHandlers,
  PriorArtAnalysisHandlers,
} from '../../types/claimRefinementView';
import {
  handleSavePriorArt,
  handleRemovePriorArt,
  handleAnalyzePriorArt,
  refreshInventionData,
} from '../../utils/claimRefinementUtils';
import { useDeletePriorArt } from '@/hooks/api/usePriorArt';

/**
 * PriorArtManager - Manages all prior art related operations
 *
 * This component encapsulates:
 * - Prior art saving and removal
 * - Prior art analysis
 * - Analysis data management
 * - Loading states for analysis
 */
export const PriorArtManager: React.FC<PriorArtManagerProps> = ({
  projectId,
  analyzedInvention,
  children,
}) => {
  const toast = useToast();

  const deletePriorArtMutation = useDeletePriorArt();

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [analysisData, setAnalysisData] = useState<{ results?: Array<{ referenceNumber: string; analysis: string }> } | null>(null);

  // Prior art handlers
  const handleSavePriorArtFn = useCallback(
    async (reference: { id: string; title?: string; abstract?: string; publicationNumber?: string }) => {
      await handleSavePriorArt(reference, projectId, toast);
    },
    [projectId, toast]
  );

  const handleRemovePriorArtFn = useCallback(
    async (_index: number, art: { id?: string; title?: string }) => {
      if (!projectId || !art?.id) {
        toast({
          title: 'Failed to remove prior art',
          description: 'Missing project or prior art ID',
          status: 'error',
        });
        return;
      }
      try {
        await deletePriorArtMutation.mutateAsync({
          projectId,
          priorArtId: art.id,
        });
        toast({
          title: 'Prior art removed',
          status: 'success',
          duration: 2000,
        });
      } catch (error) {
        toast({
          title: 'Failed to remove prior art',
          description: error?.message ?? 'Unknown error',
          status: 'error',
          duration: 3000,
        });
      }
    },
    [projectId, deletePriorArtMutation, toast]
  );

  const refreshInventionDataFn = useCallback(async () => {
    return await refreshInventionData();
  }, []);

  // Prior art analysis handlers
  const handleAnalyzePriorArtFn = useCallback(
    async (
      searchHistoryId: string,
      selectedReferenceNumbers: string[],
      forceRefresh: boolean
    ) => {
      await handleAnalyzePriorArt(
        searchHistoryId,
        selectedReferenceNumbers,
        forceRefresh,
        projectId,
        analyzedInvention,
        setIsAnalyzing,
        setLoadingMessage,
        setAnalysisData,
        () => {
          // Tab handling is managed by parent component
        },
        toast
      );
    },
    [projectId, analyzedInvention, toast]
  );

  // Create handlers object
  const handlers: PriorArtHandlers & PriorArtAnalysisHandlers = {
    handleSavePriorArt: handleSavePriorArtFn,
    handleRemovePriorArt: handleRemovePriorArtFn,
    refreshInventionData: refreshInventionDataFn,
    handleAnalyzePriorArt: handleAnalyzePriorArtFn,
  };

  return <>{children(handlers)}</>;
};

PriorArtManager.displayName = 'PriorArtManager';

import React, { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/utils/clientLogger';
import { useToast } from '@/hooks/useToastWrapper';
import { InventionData } from '@/types/invention';
import { useProcessInventionMutation } from '@/hooks/api/useProjects';
import { useProjectData } from '@/contexts/ProjectDataContext';
import { inventionQueryKeys } from '@/lib/queryKeys/inventionKeys';
import { UploadedFigure } from '../hooks/useTechnologyInputFileHandler';

/**
 * Hook for handling invention analysis
 * Text input already contains extracted file content from useFileManagement
 */
export const useInventionAnalysis = (
  textInput: string,
  projectId?: string,
  uploadedFigures?: UploadedFigure[]
) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const analyzeInventionMutation = useProcessInventionMutation();
  const toast = useToast();

  const analyzeInventionText = useCallback(async () => {
    if (!projectId) {
      logger.error('[useInventionAnalysis] No project ID provided');
      return false;
    }

    if (!textInput || textInput.trim().length < 10) {
      toast.error({
        title: 'No Content',
        description: 'Please enter text or upload files before analyzing',
      });
      return false;
    }

    setIsProcessing(true);

    try {
      logger.info('[useInventionAnalysis] Starting analysis', {
        textLength: textInput.length,
        projectId,
        uploadedFigureCount: uploadedFigures?.length || 0,
      });

      // Analyze the text (already contains extracted file content)
      const result = await analyzeInventionMutation.mutateAsync({
        projectId,
        text: textInput,
        uploadedFigures: uploadedFigures?.map(fig => ({
          id: fig.id,
          assignedNumber: fig.assignedNumber,
          url: fig.url,
          fileName: fig.fileName,
        })),
      });

      logger.info('[useInventionAnalysis] Analysis completed successfully');
      return true;
    } catch (error) {
      logger.error('[useInventionAnalysis] Analysis failed', {
        error: error instanceof Error ? error.message : String(error),
      });

      toast.error({
        title: 'Analysis Failed',
        description: 'Failed to analyze invention. Please try again.',
      });

      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [projectId, textInput, analyzeInventionMutation, toast, uploadedFigures]);

  return {
    isProcessing,
    analyzeInventionText,
  };
};

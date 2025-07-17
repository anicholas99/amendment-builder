import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/useToastWrapper';
import { logger } from '@/utils/clientLogger';
import { useGeneratePatentMutation } from '@/hooks/api/useProjects';

export interface UsePatentGenerationReturn {
  isGenerating: boolean;
  generationProgress: number;
  handleGeneratePatent: (
    versionName?: string,
    selectedRefs?: string[]
  ) => Promise<void>;
  resetProgress: () => void;
  setContentReady: () => void; // New function to signal content is ready
}

/**
 * Simplified patent generation hook that follows codebase patterns
 * Uses React Query's built-in loading state and simple progress tracking
 */
export const usePatentGeneration = (
  projectId: string
): UsePatentGenerationReturn => {
  const toast = useToast();
  const generateMutation = useGeneratePatentMutation();
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }
    };
  }, []);

  const resetProgress = useCallback(() => {
    setGenerationProgress(0);
    setIsLoadingContent(false);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
  }, []);

  const setContentReady = useCallback(() => {
    setIsLoadingContent(false);
    setGenerationProgress(100);
    // Clear the max timeout when content is ready
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
    // Clear the progress interval as well
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const handleGeneratePatent = useCallback(
    async (versionName?: string, selectedRefs?: string[]) => {
      try {
        logger.info('[PatentGeneration] Starting generation', {
          projectId,
          versionName,
          selectedRefs,
        });

        // Reset and immediately start progress to show loading state
        setGenerationProgress(0);
        setIsLoadingContent(true);

        // Start progress simulation immediately for instant feedback
        let currentProgress = 5; // Start at 5% immediately
        setGenerationProgress(currentProgress);

        progressIntervalRef.current = setInterval(() => {
          currentProgress += Math.random() * 3 + 1; // Random increment 1-4%
          if (currentProgress >= 95) {
            currentProgress = 95; // Cap at 95% until complete
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
          }
          setGenerationProgress(Math.round(currentProgress));
        }, 800); // Update every 800ms for smooth progress

        // Maximum timeout fallback - ensure we always complete after 60 seconds
        maxTimeoutRef.current = setTimeout(() => {
          logger.warn('[PatentGeneration] Maximum timeout reached, forcing completion');
          setContentReady();
        }, 60000); // 60 seconds maximum to account for slow API calls

        // Generate patent
        await generateMutation.mutateAsync({
          projectId,
          versionName:
            versionName || `Patent v${new Date().toISOString().split('T')[0]}`,
          selectedRefs,
        });

        // API call complete, but keep loading state until content is ready
        // Progress stays at 95% until setContentReady is called

        logger.info(
          '[PatentGeneration] API generation completed, waiting for content',
          {
            projectId,
          }
        );
      } catch (error) {
        logger.error('[PatentGeneration] Generation failed', {
          projectId,
          error: error instanceof Error ? error.message : String(error),
        });

        // Clean up on error
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setGenerationProgress(0);
        setIsLoadingContent(false);

        toast({
          title: 'Generation Failed',
          description:
            'Failed to generate patent application. Please try again.',
          status: 'error',
          duration: 5000,
        });

        throw error;
      }
    },
    [projectId, generateMutation, toast, setContentReady]
  );

  return {
    isGenerating: generateMutation.isPending || isLoadingContent,
    generationProgress,
    handleGeneratePatent,
    resetProgress,
    setContentReady,
  };
};

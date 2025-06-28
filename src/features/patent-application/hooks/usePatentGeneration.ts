import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { logger } from '@/lib/monitoring/logger';
import { useGeneratePatentMutation } from '@/hooks/api/useProjects';
import { useQueryClient } from '@tanstack/react-query';
import { patentKeys, projectKeys } from '@/lib/queryKeys';
import { getProjectRelatedInvalidationKeys } from '@/lib/queryKeys';
import { versionQueryKeys } from '@/lib/queryKeys/versionQueryKeys';
import { draftQueryKeys } from '@/lib/queryKeys/draftQueryKeys';

export interface UsePatentGenerationReturn {
  isGenerating: boolean;
  generationProgress: number;
  handleGeneratePatent: (
    versionName?: string,
    selectedRefs?: string[]
  ) => Promise<void>;
}

/**
 * Hook for patent generation - handles generating patent content and UI updates
 * Simplified to ensure proper UI refresh after generation
 */
export const usePatentGeneration = (
  projectId: string
): UsePatentGenerationReturn => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [generationProgress, setGenerationProgress] = useState(0);
  const generateMutation = useGeneratePatentMutation();

  const handleGeneratePatent = useCallback(
    async (versionName?: string, selectedRefs?: string[]) => {
      try {
        // Start progress
        setGenerationProgress(10);

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setGenerationProgress(prev => Math.min(prev + 10, 90));
        }, 1000);

        // Generate patent
        const result = await generateMutation.mutateAsync({
          projectId,
          versionName:
            versionName || `Patent v${new Date().toISOString().split('T')[0]}`,
          selectedRefs,
        });

        // Clear progress interval
        clearInterval(progressInterval);
        setGenerationProgress(100);

        // Force refresh all project-related data
        const keysToInvalidate = getProjectRelatedInvalidationKeys(projectId);
        await Promise.all(
          keysToInvalidate.map((key: readonly string[]) =>
            queryClient.invalidateQueries({ queryKey: key })
          )
        );

        // Also invalidate version-specific queries
        await queryClient.invalidateQueries({
          queryKey: versionQueryKeys.all(projectId),
        });
        await queryClient.invalidateQueries({
          queryKey: versionQueryKeys.latest(projectId),
        });

        // CRITICAL: Invalidate draft documents to ensure UI updates
        await queryClient.invalidateQueries({
          queryKey: draftQueryKeys.all(projectId),
        });
        
        // Force refetch draft documents to ensure immediate UI update
        await queryClient.refetchQueries({
          queryKey: draftQueryKeys.all(projectId),
          type: 'active',
        });

        // Show success message
        toast({
          title: 'Patent Generated Successfully',
          description:
            'Your patent application has been generated and is ready for review.',
          status: 'success',
          duration: 5000,
        });

        // Reset progress after a delay
        setTimeout(() => {
          setGenerationProgress(0);
        }, 1000);
      } catch (error) {
        logger.error('[Patent Generation] Failed:', error);
        toast({
          title: 'Generation Failed',
          description: 'Unable to generate patent. Please try again.',
          status: 'error',
          duration: 5000,
        });
        setGenerationProgress(0);
      }
    },
    [generateMutation, projectId, toast, queryClient]
  );

  return {
    isGenerating: generateMutation.isPending,
    generationProgress,
    handleGeneratePatent,
  };
};

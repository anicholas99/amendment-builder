import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import { ClaimApiService } from '@/client/services/claim.client-service';
import { logger } from '@/lib/monitoring/logger';

/**
 * Provides a stable function to update a specific claim's text.
 * This hook centralizes the claim update logic and leverages the
 * ProjectAutosaveContext to handle debounced saving.
 *
 * This pattern avoids re-render cascades by providing a stable `updateClaim`
 * function to child components.
 */
export const useUpdateClaim = (projectId: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ claimId, text }: { claimId: string; text: string }) =>
      ClaimApiService.updateClaim(projectId, claimId, text),
    onSuccess: () => {
      toast({
        title: 'Claim saved.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      // Invalidate project data to refetch and keep UI consistent
      queryClient.invalidateQueries({
        queryKey: ['project', projectId],
      });
    },
    onError: (error: any) => {
      logger.error('Failed to update claim:', error);
      toast({
        title: 'Error saving claim',
        description: error.message || 'An unexpected error occurred.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });
};

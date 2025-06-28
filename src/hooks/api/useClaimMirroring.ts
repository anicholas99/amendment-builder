import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import { ClaimApiService } from '@/client/services/claim.client-service';
import { logger } from '@/lib/monitoring/logger';
import { claimQueryKeys } from './useClaims';

export type ClaimType = 'system' | 'method' | 'apparatus' | 'process' | 'crm';

interface MirrorClaimsInput {
  projectId: string;
  claimIds: string[];
  targetType: ClaimType;
}

/**
 * Hook for mirroring claims to a different type
 */
export const useClaimMirroring = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, claimIds, targetType }: MirrorClaimsInput) => {
      logger.info('[useClaimMirroring] Mirroring claims', {
        projectId,
        claimCount: claimIds.length,
        targetType,
      });

      return await ClaimApiService.mirrorClaims(projectId, claimIds, targetType);
    },
    onSuccess: (data, variables) => {
      logger.info('[useClaimMirroring] Successfully mirrored claims', {
        projectId: variables.projectId,
        mirroredCount: data.claims?.length || 0,
      });

      // Invalidate claims query to refetch the updated list
      queryClient.invalidateQueries({
        queryKey: claimQueryKeys.list(variables.projectId),
      });

      toast({
        title: 'Claims Mirrored Successfully',
        description: data.message || `Created ${data.claims?.length || 0} new claims`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: any, variables) => {
      logger.error('[useClaimMirroring] Failed to mirror claims', {
        projectId: variables.projectId,
        error,
      });

      toast({
        title: 'Failed to Mirror Claims',
        description: error.message || 'An error occurred while mirroring claims',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });
}; 
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToastWrapper';
import { claimQueryKeys } from './useClaims';
import { ClaimsApiService } from '@/services/api/claims.api-service';
import { logger } from '@/utils/clientLogger';
import { ProjectApiService } from '@/client/services/project.client-service';

interface BatchUpdateNumbersParams {
  inventionId: string;
  updates: Array<{
    claimId: string;
    newNumber: number;
  }>;
}

interface InsertClaimParams {
  projectId: string;
  inventionId: string;
  afterClaimNumber: number;
  text: string;
}

/**
 * Hook for batch claim operations including smart insert with renumbering
 */
export const useClaimBatchOperations = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  // Batch update claim numbers
  const batchUpdateNumbers = useMutation({
    mutationFn: async (params: BatchUpdateNumbersParams) => {
      return await ClaimsApiService.batchUpdateNumbers(params);
    },
    onSuccess: (_, variables) => {
      // Invalidate all claim queries to refresh the data
      queryClient.invalidateQueries({ queryKey: claimQueryKeys.all });

      logger.info('[ClaimBatchOperations] Successfully updated claim numbers', {
        updateCount: variables.updates.length,
      });
    },
    onError: error => {
      logger.error('[ClaimBatchOperations] Failed to update claim numbers', {
        error,
      });
      toast({
        title: 'Failed to update claim numbers',
        description:
          error instanceof Error ? error.message : 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  // Smart insert claim with automatic renumbering
  const insertClaimWithRenumbering = useMutation({
    mutationFn: async ({
      projectId,
      inventionId,
      afterClaimNumber,
      text,
    }: InsertClaimParams) => {
      // Get current claims to calculate renumbering
      const currentClaims = queryClient.getQueryData(
        claimQueryKeys.list(projectId)
      ) as any;
      const claims = Array.isArray(currentClaims)
        ? currentClaims
        : currentClaims?.claims || [];

      // Desired number for the new claim
      const newClaimNumber = afterClaimNumber + 1;

      // Check if the desired number is already taken by a real (non-temp) claim
      const collisionExists = claims.some(
        (c: any) =>
          c.number === newClaimNumber && !String(c.id).startsWith('temp-')
      );

      // Only renumber consecutive claims when there's a collision
      const claimsToRenumber: Array<{ claimId: string; newNumber: number }> =
        [];

      if (collisionExists) {
        // Sort claims by number to find consecutive sequence
        const sortedClaims = claims
          .filter((c: any) => !String(c.id).startsWith('temp-'))
          .sort((a: any, b: any) => a.number - b.number);

        // Find consecutive claims starting from newClaimNumber
        let currentNumber = newClaimNumber;
        for (const claim of sortedClaims) {
          if (claim.number === currentNumber) {
            // This claim needs to be renumbered
            claimsToRenumber.push({
              claimId: claim.id,
              newNumber: currentNumber + 1,
            });
            currentNumber++;
          } else if (claim.number > currentNumber) {
            // Found a gap, stop renumbering
            break;
          }
        }
      }

      // Start a transaction-like operation
      try {
        // Step 1: Renumber only if needed
        if (claimsToRenumber.length > 0) {
          await ClaimsApiService.batchUpdateNumbers({
            inventionId,
            updates: claimsToRenumber,
          });
        }

        // Step 2: Add the new claim at the desired position
        const newClaim = await ClaimsApiService.addClaim(projectId, {
          number: newClaimNumber,
          text,
        });

        return { newClaim, renumberedCount: claimsToRenumber.length };
      } catch (error) {
        // If anything fails, the backend transaction should roll back
        throw error;
      }
    },
    onMutate: async ({ projectId, afterClaimNumber, text }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: claimQueryKeys.list(projectId),
      });

      // Snapshot the previous value
      const previousClaims = queryClient.getQueryData(
        claimQueryKeys.list(projectId)
      );

      // Optimistically update the UI
      queryClient.setQueryData(claimQueryKeys.list(projectId), (old: any) => {
        if (!old) return old;

        const claims = Array.isArray(old) ? old : old.claims || [];
        const newClaimNumber = afterClaimNumber + 1;

        // Create a temporary new claim
        const tempClaim = {
          id: `temp-insert-${Date.now()}`,
          number: newClaimNumber,
          text,
          inventionId: claims[0]?.inventionId || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Just insert the temp claim; don't adjust other numbers optimistically
        const updatedClaims = [...claims, tempClaim].sort(
          (a: any, b: any) => a.number - b.number
        );

        return Array.isArray(old)
          ? updatedClaims
          : { ...old, claims: updatedClaims };
      });

      return { previousClaims };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousClaims) {
        queryClient.setQueryData(
          claimQueryKeys.list(variables.projectId),
          context.previousClaims
        );
      }

      toast({
        title: 'Failed to insert claim',
        description: 'The claim could not be inserted. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
    onSuccess: async (data, variables) => {
      // Immediately fetch fresh claims and replace cache to ensure correct order
      try {
        const freshClaims = await queryClient.fetchQuery({
          queryKey: claimQueryKeys.list(variables.projectId),
          queryFn: () => ProjectApiService.getClaims(variables.projectId),
          staleTime: 0,
        });
        queryClient.setQueryData(
          claimQueryKeys.list(variables.projectId),
          freshClaims
        );
      } catch (error) {
        // Fallback: simple cache invalidation
        queryClient.invalidateQueries({
          queryKey: claimQueryKeys.list(variables.projectId),
          refetchType: 'active',
        });
      }

      toast({
        title: 'Claim inserted successfully',
        description:
          data.renumberedCount > 0
            ? `Inserted new claim and renumbered ${data.renumberedCount} subsequent claims`
            : 'New claim added',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  return {
    batchUpdateNumbers: batchUpdateNumbers.mutate,
    insertClaimWithRenumbering: insertClaimWithRenumbering.mutate,
    insertClaimWithRenumberingAsync: insertClaimWithRenumbering.mutateAsync,
    isInserting: insertClaimWithRenumbering.isPending,
    isUpdatingNumbers: batchUpdateNumbers.isPending,
  };
};

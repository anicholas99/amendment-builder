import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  AmendmentsClientService, 
  AmendmentGenerationResult,
  UpdateAmendmentParams 
} from '@/client/services/amendments.client-service';
import { useToast } from '@/hooks/use-toast';
import { amendmentKeys } from '@/lib/queryKeys';

/**
 * React Query hook for fetching amendments
 */
export function useAmendments(projectId: string | undefined) {
  return useQuery({
    queryKey: amendmentKeys.byProject(projectId!),
    queryFn: () => AmendmentsClientService.getAmendments(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * React Query hook for generating amendments
 */
export function useGenerateAmendments() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: AmendmentsClientService.generateAmendments,
    onSuccess: (data, variables) => {
      // Update cache
      queryClient.setQueryData(
        amendmentKeys.byProject(variables.projectId),
        data
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: amendmentKeys.byProject(variables.projectId),
      });
      
      toast({
        title: 'Amendments Generated',
        description: `Successfully generated amendments for ${data.claims.length} claims`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate amendments',
        variant: 'destructive',
      });
    },
  });
}

/**
 * React Query hook for updating a specific claim amendment
 */
export function useUpdateAmendment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: AmendmentsClientService.updateAmendment,
    onMutate: async (params: UpdateAmendmentParams) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: queryKeys.amendments.byProject(params.projectId),
      });

      // Snapshot previous value
      const previousAmendments = queryClient.getQueryData<AmendmentGenerationResult>(
        queryKeys.amendments.byProject(params.projectId)
      );

      // Optimistically update
      if (previousAmendments) {
        const updatedClaims = previousAmendments.claims.map(claim =>
          claim.claimNumber === params.claimNumber
            ? { ...claim, amendedText: params.amendedText }
            : claim
        );

        queryClient.setQueryData(
          queryKeys.amendments.byProject(params.projectId),
          {
            ...previousAmendments,
            claims: updatedClaims,
          }
        );
      }

      return { previousAmendments };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousAmendments) {
        queryClient.setQueryData(
          amendmentKeys.byProject(variables.projectId),
          context.previousAmendments
        );
      }
      
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update amendment',
        variant: 'destructive',
      });
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        amendmentKeys.byProject(variables.projectId),
        data
      );
      
      toast({
        title: 'Amendment Updated',
        description: `Claim ${variables.claimNumber} updated successfully`,
      });
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({
        queryKey: amendmentKeys.byProject(variables.projectId),
      });
    },
  });
}
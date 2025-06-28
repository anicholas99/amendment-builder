import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PriorArtApiService } from '@/client/services/prior-art.client-service';
import {
  ClaimRefinementAnalysisParams,
  ClaimRefinementAnalysisResult,
  GenerateDependentClaimsRequest,
  GenerateDependentClaimsResponse,
  GetPriorArtResponse,
  CreatePriorArtResponse,
  AddSavedPriorArtRequest,
  RemoveSavedPriorArtRequest,
  DeletePriorArtResponse,
} from '@/types/api/responses';
import { claimQueryKeys } from '@/hooks/api/useClaims';

export const usePriorArtAnalysis = (
  onSuccess?: (data: ClaimRefinementAnalysisResult) => void,
  onError?: (error: Error) => void
) => {
  return useMutation<
    ClaimRefinementAnalysisResult,
    Error,
    ClaimRefinementAnalysisParams
  >({
    mutationFn: (data: ClaimRefinementAnalysisParams) =>
      PriorArtApiService.analyzePriorArt(data),
    onSuccess,
    onError,
  });
};

export const useGenerateDependentClaims = (
  onSuccess?: (data: GenerateDependentClaimsResponse) => void,
  onError?: (error: Error) => void
) => {
  const queryClient = useQueryClient();

  return useMutation<
    GenerateDependentClaimsResponse,
    Error,
    GenerateDependentClaimsRequest
  >({
    mutationFn: (data: GenerateDependentClaimsRequest) =>
      PriorArtApiService.generateDependentClaims(data),
    onSuccess: async (data, variables) => {
      // Invalidate claims to get fresh IDs after generation
      if (variables.projectId) {
        await queryClient.invalidateQueries({
          queryKey: claimQueryKeys.list(variables.projectId),
          refetchType: 'active',
        });
      }
      onSuccess?.(data);
    },
    onError,
  });
};

export const useGetPriorArt = (
  projectId: string,
  options?: {
    onSuccess?: (data: GetPriorArtResponse) => void;
    onError?: (error: Error) => void;
  }
) => {
  return useQuery<GetPriorArtResponse, Error>({
    queryKey: ['priorArt', projectId],
    queryFn: () => PriorArtApiService.getProjectPriorArt(projectId),
    enabled: !!projectId,
    ...options,
  });
};

/**
 * Hook to add a saved prior art reference
 */
export const useAddSavedPriorArt = (
  onSuccess?: (data: CreatePriorArtResponse) => void,
  onError?: (error: Error) => void
) => {
  return useMutation<CreatePriorArtResponse, Error, AddSavedPriorArtRequest>({
    mutationFn: (data: AddSavedPriorArtRequest) =>
      PriorArtApiService.savePriorArt(data.projectId, {
        patentNumber: data.referenceNumber,
      }),
    onSuccess,
    onError,
  });
};

/**
 * Hook to remove a saved prior art reference
 */
export const useRemoveSavedPriorArt = (
  onSuccess?: (data: DeletePriorArtResponse) => void,
  onError?: (error: Error) => void
) => {
  return useMutation<DeletePriorArtResponse, Error, RemoveSavedPriorArtRequest>(
    {
      mutationFn: (data: RemoveSavedPriorArtRequest) =>
        PriorArtApiService.removePriorArt(data.projectId, data.savedPriorArtId),
      onSuccess,
      onError,
    }
  );
};

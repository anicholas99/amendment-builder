/**
 * React Query hooks for claim operations shared across the application
 */
import { useApiMutation } from '@/lib/api/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { ClaimsClientService } from '@/client/services/claims.client-service';

/**
 * Hook for parsing claim elements
 */
function useParseClaimMutation() {
  return useApiMutation({
    mutationFn: async ({
      claimOneText,
      projectId,
    }: {
      claimOneText: string;
      projectId: string;
    }) => {
      const result = await ClaimsClientService.parseClaimElements(
        claimOneText,
        projectId
      );
      return { parsedElements: result as string[] };
    },
  });
}

/**
 * Hook for generating search queries
 */
function useGenerateQueriesMutation() {
  return useApiMutation({
    mutationFn: async ({
      parsedElements,
      projectId,
    }: {
      parsedElements: string[];
      projectId: string;
    }) => {
      const queries = await ClaimsClientService.generateSearchQueries(
        parsedElements,
        projectId
      );
      return { queries, searchQueries: queries };
    },
  });
}

/**
 * Consolidated hook for claim operations
 * Provides both mutations with their original names for backward compatibility
 */
export function useClaimOperations() {
  const parseClaim = useParseClaimMutation();
  const generateQueries = useGenerateQueriesMutation();

  return {
    parseClaim,
    generateQueries,
  };
}

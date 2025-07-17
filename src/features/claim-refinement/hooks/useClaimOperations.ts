/**
 * React Query hooks for claim operations shared across the application
 */
import { useMutation } from '@tanstack/react-query';
import { ClaimsClientService } from '@/client/services/claims.client-service';
import { logger } from '@/utils/clientLogger';
import { useProjectData } from '@/contexts/ProjectDataContext';

/**
 * Hook for parsing claim text into elements
 * @returns Array of claim element strings
 */
export const useParseClaim = () => {
  const { activeProjectId } = useProjectData();

  return useMutation({
    mutationFn: async (claimText: string) => {
      if (!activeProjectId) {
        throw new Error('No active project selected');
      }

      logger.info('[Claim Refinement] Parsing claim text');
      const result = await ClaimsClientService.parseClaimElements(
        claimText,
        activeProjectId
      );

      // Result is now always string[]
      logger.info('[Claim Refinement] Parsing complete', {
        elementCount: result.length,
      });

      return result;
    },
  });
};

/**
 * Hook for generating search queries from parsed elements
 * @returns Array of search query strings
 */
export const useGenerateSearchQueries = () => {
  const { activeProjectId } = useProjectData();

  return useMutation({
    mutationFn: async (parsedElements: string[]) => {
      if (!activeProjectId) {
        throw new Error('No active project selected');
      }

      logger.info('[Claim Refinement] Generating search queries', {
        elementCount: parsedElements.length,
      });

      const queries = await ClaimsClientService.generateSearchQueries(
        parsedElements,
        activeProjectId
      );

      logger.info('[Claim Refinement] Query generation complete', {
        queryCount: queries.length,
      });

      return queries;
    },
  });
};

/**
 * Consolidated hook for claim operations
 * Provides both mutations with their original names for backward compatibility
 */
export function useClaimOperations() {
  const parseClaim = useParseClaim();
  const generateQueries = useGenerateSearchQueries();

  return {
    parseClaim,
    generateQueries,
  };
}

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/apiClient';
import { logger } from '@/utils/clientLogger';
import type { AmendmentContextBundle } from '@/server/services/amendment-context.server-service';

interface AmendmentContextResponse {
  success: boolean;
  context: AmendmentContextBundle;
  aiPromptContext: string;
  summary: {
    hasOfficeAction: boolean;
    hasClaims: boolean;
    hasSpecification: boolean;
    hasLastResponse: boolean;
    hasExtras: boolean;
    readyForAI: boolean;
  };
}

export const amendmentContextQueryKeys = {
  all: ['amendment-context'] as const,
  byProject: (projectId: string) => ['amendment-context', projectId] as const,
};

/**
 * Hook to get amendment context for AI processing
 * 
 * @param projectId - The project ID
 * @param enabled - Whether to enable the query
 * @returns Amendment context data including OCR'd documents
 */
export function useAmendmentContext(projectId: string, enabled = true) {
  return useQuery({
    queryKey: amendmentContextQueryKeys.byProject(projectId),
    queryFn: async (): Promise<AmendmentContextResponse> => {
      logger.info('[useAmendmentContext] Fetching amendment context', { projectId });
      
      try {
        const response = await apiFetch(`/api/projects/${projectId}/amendment/context`);
        const data = await response.json();
        
        logger.info('[useAmendmentContext] Amendment context response', {
          projectId,
          success: data.success,
          hasContext: !!data.context,
          contextComplete: data.context?.metadata?.contextComplete,
          totalDocuments: data.context?.metadata?.totalDocuments,
          ocrDocuments: data.context?.metadata?.ocrDocuments,
          missingDocs: data.context?.metadata?.missingDocuments,
          summary: data.summary,
        });
        
        return data;
      } catch (error) {
        logger.error('[useAmendmentContext] Failed to fetch amendment context', {
          projectId,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
    enabled: !!projectId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - context doesn't change frequently
    retry: 2,
  });
} 
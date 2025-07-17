import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { StructuredCombinedAnalysis } from '@/client/services/patent/patentability/combined-analysis.client-service';

export interface CombinedAnalysisRecord {
  id: string;
  createdAt: string;
  referenceNumbers: string[];
  analysis: StructuredCombinedAnalysis;
  claim1Text: string;
}

interface CombinedAnalysesResponse {
  analyses: CombinedAnalysisRecord[];
}

/**
 * Hook to fetch past combined analyses for a search history
 */
export function useCombinedAnalyses(searchHistoryId: string | null) {
  return useQuery<CombinedAnalysisRecord[]>({
    queryKey: ['combinedAnalyses', searchHistoryId],
    queryFn: async () => {
      if (!searchHistoryId) {
        return [];
      }

      const response = await apiFetch(
        API_ROUTES.AI.COMBINED_ANALYSES_BY_SEARCH(searchHistoryId)
      );

      if (!response.ok) {
        throw new Error('Failed to fetch combined analyses');
      }

      const result = await response.json();

      // Handle wrapped response format - API returns { data: { analyses: [...] } }
      const data: CombinedAnalysesResponse = result.data || result;

      return data.analyses;
    },
    enabled: !!searchHistoryId,
  });
}

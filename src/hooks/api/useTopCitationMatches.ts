import { useQuery } from '@tanstack/react-query';
import {
  CitationApiService,
  TopCitationMatchesResponse,
} from '@/services/api/citationApiService';
import { citationKeys } from '@/lib/queryKeys/citationKeys';

interface UseTopCitationMatchesOptions {
  searchHistoryId: string | null;
  referenceNumber?: string;
  enabled?: boolean;
}

/**
 * Hook for fetching top citation matches from deep analysis
 * These are the high-quality matches identified by the AI
 */
export function useTopCitationMatches({
  searchHistoryId,
  referenceNumber,
  enabled = true,
}: UseTopCitationMatchesOptions) {
  return useQuery<TopCitationMatchesResponse>({
    queryKey: citationKeys.topMatches(searchHistoryId || '', referenceNumber),
    queryFn: () =>
      CitationApiService.getTopCitationMatches(
        searchHistoryId!,
        referenceNumber
      ),
    enabled: enabled && !!searchHistoryId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Citation Matches Hook
 *
 * React Query hook for fetching and managing citation matches.
 * This is the ONLY place where citation match queries should be defined.
 */

import { useApiQuery } from '@/lib/api/queryClient';
import { UseQueryOptions } from '@tanstack/react-query';
import { CitationMatchResponse } from '@/client/services/citation-match.client-service';
import { logger } from '@/lib/monitoring/logger';
import { STALE_TIME, GC_TIME } from '@/constants/time';
import { ApplicationError } from '@/lib/error';
import { API_ROUTES } from '@/constants/apiRoutes';

// Query key factory for consistent cache keys
export const citationMatchQueryKeys = {
  all: ['citationMatches'] as const,
  bySearch: (searchHistoryId: string) =>
    [...citationMatchQueryKeys.all, 'search', searchHistoryId] as const,
};

/**
 * Hook to fetch grouped citation matches for a search history entry
 */
export function useGroupedCitationMatches(
  searchHistoryId: string | null,
  options?: Omit<
    UseQueryOptions<CitationMatchResponse | null, ApplicationError>,
    'queryKey' | 'queryFn'
  >
) {
  if (!searchHistoryId) {
    logger.debug('[useGroupedCitationMatches] No searchHistoryId provided');
  }

  return useApiQuery<CitationMatchResponse | null>(
    [...citationMatchQueryKeys.bySearch(searchHistoryId || '')],
    {
      url: API_ROUTES.CITATION_MATCHES.BY_SEARCH,
      params: searchHistoryId ? { searchHistoryId } : undefined,
      enabled: !!searchHistoryId && options?.enabled !== false,
      staleTime: STALE_TIME.SHORT, // 2 minutes - shorter because citations can change frequently
      gcTime: GC_TIME.SHORT, // 5 minutes
      ...options,
    }
  );
}

/**
 * Hook with simplified return interface for backward compatibility
 */
export function useGroupedCitationMatchesWithStatus(
  searchHistoryId: string | null
) {
  const { data, isLoading, error } = useGroupedCitationMatches(searchHistoryId);

  return {
    citationMatches: data,
    isLoading,
    error,
  };
}

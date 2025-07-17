import { useApiQuery } from '@/lib/api/queryClient';
import { ProcessedSearchHistoryEntry } from '@/types/domain/searchHistory';
import { API_ROUTES } from '@/constants/apiRoutes';
import { searchHistoryKeys } from '@/lib/queryKeys/projectKeys';
import { logger } from '@/utils/clientLogger';
import { STALE_TIME } from '@/constants/time';

/**
 * Hook to fetch the search history for a given project.
 * @param projectId The ID of the project.
 * @returns A query result object with the list of search history entries.
 */
export function useProjectSearchHistory(projectId?: string) {
  const queryKey = searchHistoryKeys.all(projectId || 'none');

  return useApiQuery<ProcessedSearchHistoryEntry[]>([...queryKey], {
    url: projectId ? API_ROUTES.SEARCH_HISTORY.LIST : '',
    params: projectId ? { projectId } : undefined,
    enabled: !!projectId,
    staleTime: STALE_TIME.DEFAULT,
    select: (data: any) => {
      // Handle both array and object responses for backward compatibility
      if (Array.isArray(data)) {
        return data;
      } else if (data && typeof data === 'object' && 'searchHistory' in data) {
        return data.searchHistory || [];
      }

      logger.warn(
        '[useProjectSearchHistory] Unexpected search history response format',
        { data }
      );
      return [];
    },
  });
}

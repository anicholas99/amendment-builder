/* eslint-disable local/no-direct-react-query-hooks */
/**
 * Centralized hook for fetching composite search history data.
 * This includes saved prior art and project exclusions, which are
 * essential for displaying the state of references in the search UI.
 */
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { logger } from '@/lib/monitoring/logger';
import {
  SearchApiService,
  SearchHistoryDataResponse,
  ProjectExclusion,
} from '@/client/services/search.client-service';
import { ApplicationError } from '@/lib/error';
import { SavedPriorArt } from '@/types/domain/priorArt';
import { STALE_TIME } from '@/constants/time';

// The shape of the data after the 'select' function transforms it.
interface TransformedSearchHistoryData {
  savedArtNumbers: Set<string>;
  excludedPatentNumbers: Set<string>;
}

/**
 * Query key factory for search history data queries.
 */
export const searchHistoryDataQueryKeys = {
  all: ['searchHistoryData'] as const,
  byProject: (projectId: string) =>
    [...searchHistoryDataQueryKeys.all, projectId] as const,
};

/**
 * The primary hook for fetching saved art and exclusions for a project.
 * It uses a 'select' function to transform the raw API response into Sets
 * for efficient lookups in the UI.
 *
 * @param projectId The ID of the project.
 * @param options Optional React Query options.
 */
export function useSearchHistoryData(
  projectId: string | undefined,
  options?: Omit<
    UseQueryOptions<
      SearchHistoryDataResponse,
      ApplicationError,
      TransformedSearchHistoryData
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: searchHistoryDataQueryKeys.byProject(projectId || ''),
    queryFn: () => {
      if (!projectId) {
        logger.warn(
          '[useSearchHistoryData] No projectId provided, returning empty data.'
        );
        return { searchHistory: [], savedPriorArt: [], exclusions: [] };
      }
      logger.info('[useSearchHistoryData] Fetching data for project:', {
        projectId,
      });
      return SearchApiService.getSearchHistoryData(projectId);
    },
    enabled: !!projectId,
    staleTime: STALE_TIME.DEFAULT,
    select: data => {
      // Process saved art into a Set of normalized patent numbers.
      const savedArtNumbers = new Set<string>(
        (data.savedPriorArt || []).map((art: SavedPriorArt) =>
          String(art.patentNumber).replace(/-/g, '').toUpperCase()
        )
      );

      // Process exclusions into a Set of normalized patent numbers.
      const excludedPatentNumbers = new Set<string>(
        (data.exclusions || []).map((exclusion: ProjectExclusion) =>
          String(exclusion.patentNumber).replace(/-/g, '').toUpperCase()
        )
      );

      return { savedArtNumbers, excludedPatentNumbers };
    },
    ...options,
  });
}

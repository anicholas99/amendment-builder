import { useApiQuery, ApiQueryOptions } from '@/lib/api/queryClient';
import { logger } from '@/utils/clientLogger';
import { API_ROUTES } from '@/constants/apiRoutes';
import { exclusionKeys } from '@/lib/queryKeys/projectKeys';
import { normalizePatentNumber } from '@/features/patent-application/utils/patentUtils';

interface ProjectExclusion {
  id: string;
  patentNumber: string;
  createdAt: string;
  title?: string | null;
  abstract?: string | null;
  url?: string | null;
  authors?: string | null;
  publicationDate?: string | null;
}

interface ExclusionsResponse {
  exclusions: ProjectExclusion[];
  count: number;
}

// New standardized response format
interface StandardizedExclusionsResponse {
  success: boolean;
  data: {
    exclusions: ProjectExclusion[];
    count: number;
  };
}

/**
 * Hook to fetch project exclusions.
 * Returns a Set of normalized patent numbers for efficient lookup.
 */
export function useProjectExclusions(
  projectId: string | null,
  options?: Omit<
    ApiQueryOptions<ExclusionsResponse, Set<string>>,
    'url' | 'select'
  >
) {
  const queryKey = exclusionKeys.all(projectId || 'none');

  return useApiQuery<ExclusionsResponse, Set<string>>([...queryKey], {
    url: API_ROUTES.PROJECTS.EXCLUSIONS(projectId ?? ''),
    enabled: !!projectId,
    select: data => {
      // Handle both legacy and new standardized response formats
      const exclusions =
        (data as any)?.data?.exclusions || (data as any)?.exclusions;
      if (!exclusions) {
        return new Set<string>();
      }
      return new Set<string>(
        exclusions
          .map((exclusion: ProjectExclusion) =>
            normalizePatentNumber(exclusion.patentNumber || '')
          )
          .filter(Boolean)
      );
    },
    ...options,
  });
}

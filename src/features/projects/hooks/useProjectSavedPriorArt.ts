import { useApiQuery } from '@/lib/api/queryClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ProcessedSavedPriorArt } from '@/types/domain/priorArt';
import { processSavedPriorArtArray } from '@/features/search/utils/priorArt';

interface PriorArtResponse {
  priorArt: any[];
}

/**
 * Hook to fetch saved prior art for a project.
 * @param projectId The ID of the project to fetch prior art for.
 * @returns A query result object with the saved prior art data.
 */
const useProjectSavedPriorArt = (projectId: string | null) => {
  return useApiQuery<PriorArtResponse, ProcessedSavedPriorArt[]>(
    ['savedPriorArt', projectId || 'none'],
    {
      url: projectId ? API_ROUTES.PROJECTS.PRIOR_ART.LIST(projectId) : '',
      enabled: !!projectId,
      select: data => {
        return processSavedPriorArtArray(data.priorArt);
      },
    }
  );
};

export default useProjectSavedPriorArt;

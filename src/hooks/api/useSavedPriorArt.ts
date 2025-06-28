import { useQuery } from '@tanstack/react-query';
import { priorArtKeys } from '@/lib/queryKeys';
import { PriorArtApiService } from '@/client/services/prior-art.client-service';
import { SavedPriorArt } from '@/types/domain/priorArt';

export const useSavedPriorArt = (projectId: string | null) => {
  return useQuery<SavedPriorArt[]>({
    queryKey: priorArtKeys.saved.byProject(projectId || ''),
    queryFn: async () => {
      if (!projectId) return [];
      const response = await PriorArtApiService.getProjectPriorArt(projectId);
      // Extract prior art from the response
      return response.priorArt || [];
    },
    enabled: !!projectId,
  });
};

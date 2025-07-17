import { useQuery } from '@tanstack/react-query';
import { priorArtKeys } from '@/lib/queryKeys';
import { PriorArtApiService } from '@/client/services/prior-art.client-service';
import { SavedPriorArt } from '@/types/domain/priorArt';
import { logger } from '@/utils/clientLogger';

export const useSavedPriorArt = (projectId: string | null) => {
  // Debug logging
  logger.debug('[useSavedPriorArt] Hook called', {
    projectId,
    enabled: !!projectId,
    queryKey: priorArtKeys.saved.byProject(projectId || ''),
  });

  return useQuery<SavedPriorArt[]>({
    queryKey: priorArtKeys.saved.byProject(projectId || ''),
    queryFn: async () => {
      if (!projectId) return [];

      logger.debug('[useSavedPriorArt] Executing query', { projectId });

      try {
        const response = await PriorArtApiService.getProjectPriorArt(projectId);

        logger.debug('[useSavedPriorArt] Raw response received', {
          hasResponse: !!response,
          responseType: typeof response,
          responseKeys: response ? Object.keys(response) : [],
        });

        // The validated response from PriorArtApiService.getProjectPriorArt should have priorArt array
        if (response && Array.isArray(response.priorArt)) {
          logger.debug('[useSavedPriorArt] Found priorArt array', {
            count: response.priorArt.length,
          });
          return response.priorArt as SavedPriorArt[];
        }

        logger.warn('[useSavedPriorArt] Unexpected response format', {
          response,
        });
        return [];
      } catch (error) {
        logger.error('[useSavedPriorArt] Error fetching prior art', {
          projectId,
          error,
        });
        throw error;
      }
    },
    enabled: !!projectId,
  });
};

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { logger } from '@/utils/clientLogger';
import { STALE_TIME } from '@/constants/time';

interface ProjectElement {
  id: string;
  elementKey: string;
  elementName: string;
}

/**
 * Hook to fetch all elements for a project
 * This includes all elements, not just those associated with figures
 */
export function useProjectElements(projectId: string | null | undefined) {
  return useQuery<ProjectElement[]>({
    queryKey: ['projects', projectId, 'elements', 'all'],
    queryFn: async () => {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      logger.debug('[useProjectElements] Fetching all project elements', {
        projectId,
      });

      const response = await apiFetch(
        API_ROUTES.PROJECTS.ELEMENTS.LIST(projectId)
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch project elements');
      }

      const data = await response.json();

      logger.info(
        '[useProjectElements] Fetched project elements successfully',
        {
          projectId,
          elementCount: data.elements.length,
        }
      );

      return data.elements;
    },
    enabled: !!projectId,
    staleTime: STALE_TIME.DEFAULT,
    refetchOnWindowFocus: false,
  });
}

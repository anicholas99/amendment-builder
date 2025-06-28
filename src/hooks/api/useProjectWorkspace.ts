import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ProjectWorkspaceApiService } from '@/services/api/projectWorkspaceService';
import { inventionKeys } from '@/lib/queryKeys';
import { claimQueryKeys } from '@/hooks/api/useClaims';
import { queryKeys } from '@/config/reactQueryConfig';
import { ProjectWorkspace } from '@/types/projectWorkspace';
import { useEffect } from 'react';
import { logger } from '@/lib/monitoring/logger';

// Query key factory for workspace queries
export const projectWorkspaceQueryKeys = {
  all: ['projectWorkspace'] as const,
  byProject: (projectId: string) => ['projectWorkspace', projectId] as const,
};

/**
 * Hook for fetching complete project workspace data
 * This replaces multiple individual API calls with a single aggregated call
 */
export const useProjectWorkspace = (projectId: string) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery<ProjectWorkspace>({
    queryKey: projectWorkspaceQueryKeys.byProject(projectId),
    queryFn: () => ProjectWorkspaceApiService.getWorkspace(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) {
      logger.info(
        '[useProjectWorkspace] Hydrating individual caches from workspace data'
      );

      // 1. Hydrate invention cache
      if (data.invention) {
        queryClient.setQueryData(
          inventionKeys.detail(projectId),
          data.invention
        );
      }

      // 2. Hydrate claims cache
      queryClient.setQueryData(claimQueryKeys.list(projectId), {
        claims: data.claims,
      });

      // 3. Hydrate figures cache with transformed data
      const combinedFigures: { [key: string]: any } = {};

      // Use the normalized figures with elements if available
      if (data.figuresWithElements && data.figuresWithElements.length > 0) {
        data.figuresWithElements.forEach(figure => {
          if (figure.figureKey) {
            const elementsObject: Record<string, string> = {};
            figure.elements.forEach(element => {
              elementsObject[element.elementKey] =
                element.elementName || element.calloutDescription || '';
            });

            combinedFigures[figure.figureKey] = {
              description: figure.title || figure.description || '',
              elements: elementsObject,
              type: 'image',
              content: '',
              image:
                (figure.status === 'UPLOADED' ||
                  figure.status === 'ASSIGNED') &&
                figure.fileName
                  ? `/api/projects/${projectId}/figures/${figure.id}/download`
                  : '',
            };
          }
        });
      } else if (data.figures) {
        // Fallback to basic figure data if normalized data isn't available
        data.figures.forEach(dbFigure => {
          const figureKey = dbFigure.figureKey;
          if (figureKey) {
            combinedFigures[figureKey] = {
              description: dbFigure.description || '',
              elements: {},
              type: 'image',
              content: '',
              image: `/api/projects/${projectId}/figures/${dbFigure.id}/download`,
            };
          }
        });
      }

      queryClient.setQueryData(
        queryKeys.projects.figures(projectId),
        combinedFigures
      );
    }
  }, [data, projectId, queryClient]);

  return {
    workspaceData: data,
    isLoadingWorkspace: isLoading,
    isError,
    error,
  };
};

/**
 * Helper hook to extract specific data from workspace
 */
export const useWorkspaceData = (projectId: string | null) => {
  const { workspaceData, ...queryState } = useProjectWorkspace(projectId || '');

  return {
    data: workspaceData,
    ...queryState,
  };
};

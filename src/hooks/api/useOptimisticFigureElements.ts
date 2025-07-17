/* eslint-disable local/no-direct-react-query-hooks */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { queryKeys } from '@/config/reactQueryConfig';
import { logger } from '@/utils/clientLogger';

interface OptimisticElementUpdate {
  projectId: string;
  figureId: string;
  figureKey?: string;
  elementKey: string;
  elementName: string;
  calloutDescription?: string;
}

interface MutationContext {
  previousElements?: any;
  previousFigures?: any;
}

/**
 * Hook to add an element with proper optimistic updates
 */
export function useOptimisticAddElement(
  projectId: string | null | undefined,
  figureId: string | null | undefined,
  figureKey?: string | null
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, OptimisticElementUpdate, MutationContext>({
    mutationFn: async elementData => {
      if (!projectId || !figureId) {
        throw new Error('Project ID and Figure ID are required');
      }

      const response = await apiFetch(
        API_ROUTES.PROJECTS.FIGURES.ELEMENTS(projectId, figureId),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            elementKey: elementData.elementKey,
            elementName: elementData.elementName,
            calloutDescription:
              elementData.calloutDescription || elementData.elementName,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to add element to figure');
      }
    },
    onMutate: async ({ projectId, figureKey, elementKey, elementName }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['projects', projectId, 'elements', 'all'],
      });
      await queryClient.cancelQueries({
        queryKey: queryKeys.projects.figures(projectId),
      });

      // Snapshot the previous values
      const previousElements = queryClient.getQueryData([
        'projects',
        projectId,
        'elements',
        'all',
      ]);
      const previousFigures = queryClient.getQueryData(
        queryKeys.projects.figures(projectId)
      );

      // Optimistically update the elements cache
      queryClient.setQueryData(
        ['projects', projectId, 'elements', 'all'],
        (old: any) => {
          if (!old || !figureId) return old;
          return {
            ...old,
            [figureId]: [
              ...(old[figureId] || []),
              {
                elementKey,
                elementName,
                calloutDescription: elementName,
              },
            ],
          };
        }
      );

      // Optimistically update the figures cache if we have the figure key
      if (figureKey) {
        queryClient.setQueryData(
          queryKeys.projects.figures(projectId),
          (old: any) => {
            if (!old || !old[figureKey]) return old;
            return {
              ...old,
              [figureKey]: {
                ...old[figureKey],
                elements: {
                  ...(old[figureKey].elements || {}),
                  [elementKey]: elementName,
                },
              },
            };
          }
        );
      }

      logger.debug('[useOptimisticAddElement] Optimistic update applied', {
        projectId,
        figureId,
        elementKey,
      });

      return { previousElements, previousFigures };
    },
    onError: (err, variables, context) => {
      // Roll back to the previous values
      if (context?.previousElements) {
        queryClient.setQueryData(
          ['projects', variables.projectId, 'elements', 'all'],
          context.previousElements
        );
      }
      if (context?.previousFigures) {
        queryClient.setQueryData(
          queryKeys.projects.figures(variables.projectId),
          context.previousFigures
        );
      }
      logger.error('[useOptimisticAddElement] Error, rolling back', err);
    },
    onSettled: (data, error, variables) => {
      // Refetch in the background to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ['projects', variables.projectId, 'elements', 'all'],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.figures(variables.projectId),
      });
    },
  });
}

/**
 * Hook to remove an element with proper optimistic updates
 */
export function useOptimisticRemoveElement(
  projectId: string | null | undefined,
  figureId: string | null | undefined,
  figureKey?: string | null
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, MutationContext>({
    mutationFn: async elementKey => {
      if (!projectId || !figureId) {
        throw new Error('Project ID and Figure ID are required');
      }

      const response = await apiFetch(
        `${API_ROUTES.PROJECTS.FIGURES.ELEMENTS(projectId, figureId)}?elementKey=${encodeURIComponent(elementKey)}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to remove element from figure');
      }
    },
    onMutate: async elementKey => {
      if (!projectId || !figureId) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['projects', projectId, 'elements', 'all'],
      });
      await queryClient.cancelQueries({
        queryKey: queryKeys.projects.figures(projectId),
      });

      // Snapshot the previous values
      const previousElements = queryClient.getQueryData([
        'projects',
        projectId,
        'elements',
        'all',
      ]);
      const previousFigures = queryClient.getQueryData(
        queryKeys.projects.figures(projectId)
      );

      // Optimistically update the elements cache
      queryClient.setQueryData(
        ['projects', projectId, 'elements', 'all'],
        (old: any) => {
          if (!old || !old[figureId]) return old;
          return {
            ...old,
            [figureId]: old[figureId].filter(
              (el: any) => el.elementKey !== elementKey
            ),
          };
        }
      );

      // Optimistically update the figures cache if we have the figure key
      if (figureKey) {
        queryClient.setQueryData(
          queryKeys.projects.figures(projectId),
          (old: any) => {
            if (!old || !old[figureKey]) return old;
            const { [elementKey]: _removed, ...restElements } =
              old[figureKey].elements || {};
            return {
              ...old,
              [figureKey]: {
                ...old[figureKey],
                elements: restElements,
              },
            };
          }
        );
      }

      logger.debug('[useOptimisticRemoveElement] Optimistic update applied', {
        projectId,
        figureId,
        elementKey,
      });

      return { previousElements, previousFigures };
    },
    onError: (err, elementKey, context) => {
      // Roll back to the previous values
      if (context?.previousElements && projectId) {
        queryClient.setQueryData(
          ['projects', projectId, 'elements', 'all'],
          context.previousElements
        );
      }
      if (context?.previousFigures && projectId) {
        queryClient.setQueryData(
          queryKeys.projects.figures(projectId),
          context.previousFigures
        );
      }
      logger.error('[useOptimisticRemoveElement] Error, rolling back', err);
    },
    onSettled: () => {
      if (!projectId) return;
      // Refetch in the background to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'elements', 'all'],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.figures(projectId),
      });
    },
  });
}

/**
 * Hook to update an element with proper optimistic updates
 */
export function useOptimisticUpdateElement(
  projectId: string | null | undefined,
  figureKey?: string | null
) {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { elementKey: string; name: string },
    MutationContext
  >({
    mutationFn: async ({ elementKey, name }) => {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      const response = await apiFetch(
        API_ROUTES.PROJECTS.ELEMENTS.BY_KEY(projectId, elementKey),
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update element');
      }
    },
    onMutate: async ({ elementKey, name }) => {
      if (!projectId) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['projects', projectId, 'elements', 'all'],
      });
      await queryClient.cancelQueries({
        queryKey: queryKeys.projects.figures(projectId),
      });

      // Snapshot the previous values
      const previousElements = queryClient.getQueryData([
        'projects',
        projectId,
        'elements',
        'all',
      ]);
      const previousFigures = queryClient.getQueryData(
        queryKeys.projects.figures(projectId)
      );

      // Optimistically update the elements cache
      queryClient.setQueryData(
        ['projects', projectId, 'elements', 'all'],
        (old: any) => {
          if (!old) return old;
          const updated = { ...old };

          // Update element in all figures
          Object.keys(updated).forEach(figId => {
            if (Array.isArray(updated[figId])) {
              updated[figId] = updated[figId].map((el: any) =>
                el.elementKey === elementKey
                  ? { ...el, elementName: name, calloutDescription: name }
                  : el
              );
            }
          });

          return updated;
        }
      );

      // Optimistically update the figures cache
      queryClient.setQueryData(
        queryKeys.projects.figures(projectId),
        (old: any) => {
          if (!old) return old;
          const updated = { ...old };

          // Update element in all figures
          Object.keys(updated).forEach(figKey => {
            if (updated[figKey]?.elements?.[elementKey]) {
              updated[figKey] = {
                ...updated[figKey],
                elements: {
                  ...updated[figKey].elements,
                  [elementKey]: name,
                },
              };
            }
          });

          return updated;
        }
      );

      logger.debug('[useOptimisticUpdateElement] Optimistic update applied', {
        projectId,
        elementKey,
        name,
      });

      return { previousElements, previousFigures };
    },
    onError: (err, variables, context) => {
      // Roll back to the previous values
      if (context?.previousElements && projectId) {
        queryClient.setQueryData(
          ['projects', projectId, 'elements', 'all'],
          context.previousElements
        );
      }
      if (context?.previousFigures && projectId) {
        queryClient.setQueryData(
          queryKeys.projects.figures(projectId),
          context.previousFigures
        );
      }
      logger.error('[useOptimisticUpdateElement] Error, rolling back', err);
    },
    onSettled: () => {
      if (!projectId) return;
      // Refetch in the background to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'elements', 'all'],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.figures(projectId),
      });
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FigureApiService,
  FigureUpdatePayload,
} from '@/services/api/figureApiService';
import { inventionQueryKeys } from '@/lib/queryKeys/inventionKeys';
import { logger } from '@/utils/clientLogger';
import { queryKeys } from '@/config/reactQueryConfig';
import { Figures } from '@/features/technology-details/components/figures/carousel-components/types';
import { UnassignedFigure } from './useUnassignedFigures';
import { FigureStatus } from '@/constants/database-enums';

interface UpdateFigureParams {
  projectId: string;
  figureId: string;
  updates: FigureUpdatePayload;
  skipInvalidate?: boolean;
}

// Debounce timer to prevent rapid invalidations
const invalidationTimer: NodeJS.Timeout | null = null;

/**
 * Hook for updating figure metadata
 */
export function useUpdateFigure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      figureId,
      updates,
    }: UpdateFigureParams) => {
      logger.debug('[useUpdateFigure] Updating figure', {
        projectId,
        figureId,
        updates,
      });

      return FigureApiService.updateFigure(projectId, figureId, updates);
    },
    onMutate: async ({ projectId, figureId, updates }) => {
      const figuresQueryKey = queryKeys.projects.figures(projectId);
      const unassignedQueryKey = [
        ...queryKeys.projects.figures(projectId),
        'unassigned',
      ];

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: figuresQueryKey });
      await queryClient.cancelQueries({ queryKey: unassignedQueryKey });

      // NOTE: Always deep‐clone the cached figures so we never mutate
      // the same reference that React Query is still holding.
      // Mutating the original object in place (even via shallow spread)
      // prevents React Query from being able to detect the change which
      // results in the UI continuing to display the **old** image until a
      // hard refresh. We use `structuredClone` because it is fast and
      // handles nested objects without relying on JSON.parse/stringify.
      const previousFigures = structuredClone(
        queryClient.getQueryData(figuresQueryKey) as Figures | undefined
      );
      const previousUnassigned = queryClient.getQueryData(
        unassignedQueryKey
      ) as UnassignedFigure[];

      // Handle 'unassign' operation
      if (updates.unassign) {
        if (previousFigures) {
          const newFigures: Figures = structuredClone(previousFigures);
          let figureKeyToUpdate: string | null = null;
          let figureBeingUnassigned: any = null;

          for (const [key, figure] of Object.entries(newFigures)) {
            if (figure.image?.includes(figureId)) {
              figureKeyToUpdate = key;
              figureBeingUnassigned = figure;
              break;
            }
          }

          if (figureKeyToUpdate && figureBeingUnassigned) {
            // Remove image from assigned figure
            newFigures[figureKeyToUpdate] = {
              ...newFigures[figureKeyToUpdate],
              image: undefined,
              // DO NOT change type, content, description, or any other fields
            };
            queryClient.setQueryData(figuresQueryKey, newFigures);

            // Optimistically add to unassigned list
            const newUnassignedFigure: UnassignedFigure = {
              id: figureId,
              figureKey: null,
              fileName: `Figure ${figureKeyToUpdate}`,
              originalName: `Figure ${figureKeyToUpdate}`,
              description: figureBeingUnassigned.description || '',
              url: `/api/projects/${projectId}/figures/${figureId}/download`,
              uploadedAt: new Date().toISOString(),
              sizeBytes: 0, // We don't have this info in the cache
              mimeType: 'image/png', // Default assumption
            };

            // Prepend to unassigned list (most recent first)
            const newUnassigned = [
              newUnassignedFigure,
              ...(previousUnassigned || []),
            ];
            queryClient.setQueryData(unassignedQueryKey, newUnassigned);
          }
        }
      }

      // Handle 'assign' operation
      if (updates.figureKey) {
        const targetFigureKey = updates.figureKey;
        const figureToAssign = previousUnassigned?.find(f => f.id === figureId);

        if (figureToAssign && previousFigures) {
          // Optimistically remove from unassigned list
          const newUnassigned = previousUnassigned.filter(
            f => f.id !== figureId
          );
          queryClient.setQueryData(unassignedQueryKey, newUnassigned);

          // Optimistically add to the figures list
          const newFigures: Figures = structuredClone(previousFigures || {});
          newFigures[targetFigureKey] = {
            ...newFigures[targetFigureKey],
            image: figureToAssign.url,
            // DO NOT change type, description, elements, or any other fields
          };
          queryClient.setQueryData(figuresQueryKey, newFigures);
        }
      }

      // Return a context object with the snapshotted value
      return { previousFigures, previousUnassigned };
    },
    onSuccess: (data, variables) => {
      // data is the updated figure from the API
      const figuresQueryKey = queryKeys.projects.figures(variables.projectId);

      queryClient.setQueryData(
        figuresQueryKey,
        (oldData: Figures | undefined) => {
          if (!oldData) return oldData;

          const newData = { ...oldData };

          if (variables.updates.unassign) {
            // Force-clear the image regardless of what the server returned
            if (data.figureKey && newData[data.figureKey]) {
              newData[data.figureKey] = {
                ...newData[data.figureKey],
                image: undefined,
                // DO NOT update description or any other fields
              };
            }
          } else if (
            variables.updates.figureKey &&
            data.figureKey &&
            newData[data.figureKey]
          ) {
            // For assign operations, update with the correct figure ID from the server
            // The server returns the ASSIGNED figure (was PENDING), not the UPLOADED figure
            newData[data.figureKey] = {
              ...newData[data.figureKey],
              image: `/api/projects/${variables.projectId}/figures/${data.id}/download?v=${Date.now()}`,
              // DO NOT update description or any other fields
            };
          } else if (data.figureKey && newData[data.figureKey]) {
            // For other updates (not assign/unassign), update normally
            newData[data.figureKey] = {
              ...newData[data.figureKey],
              description:
                data.description ?? newData[data.figureKey].description,
              // Other fields can be updated for non-assign/unassign operations
            };
          }
          return newData;
        }
      );

      // After a successful assign or unassign, invalidate the unassigned list
      // to ensure it's in sync.
      if (variables.updates.unassign || variables.updates.figureKey) {
        queryClient.invalidateQueries({
          queryKey: [
            ...queryKeys.projects.figures(variables.projectId),
            'unassigned',
          ],
        });
      }

      // Only invalidate invention detail for non-assign/unassign operations
      if (!variables.updates.unassign && !variables.updates.figureKey) {
        queryClient.invalidateQueries({
          queryKey: inventionQueryKeys.detail(variables.projectId),
        });
      }
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, variables, context) => {
      const figuresQueryKey = queryKeys.projects.figures(variables.projectId);
      const unassignedQueryKey = [
        ...queryKeys.projects.figures(variables.projectId),
        'unassigned',
      ];
      // Rollback both caches
      if (context?.previousFigures) {
        queryClient.setQueryData(figuresQueryKey, context.previousFigures);
      }
      if (context?.previousUnassigned) {
        queryClient.setQueryData(
          unassignedQueryKey,
          context.previousUnassigned
        );
      }

      logger.error('[useUpdateFigure] Failed to update figure', {
        projectId: variables.projectId,
        figureId: variables.figureId,
        error: err,
      });
    },
    // Always refetch after error or success:
    onSettled: (data, error, variables) => {
      // We only invalidate the main figures query on error now,
      // as onSuccess handles the happy path.
      if (error) {
        logger.info(
          '[useUpdateFigure] Mutation failed, invalidating queries.',
          {
            projectId: variables.projectId,
          }
        );
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.figures(variables.projectId),
        });
        queryClient.invalidateQueries({
          queryKey: [
            ...queryKeys.projects.figures(variables.projectId),
            'unassigned',
          ],
        });
      }
    },
  });
}

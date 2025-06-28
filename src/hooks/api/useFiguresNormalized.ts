import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FigureApiService } from '@/services/api/figureApiService';
import { logger } from '@/lib/monitoring/logger';
import { queryKeys } from '@/config/reactQueryConfig';
import { STALE_TIME } from '@/constants/time';
import { useToast } from '@chakra-ui/react';

/**
 * Hook to fetch figures with their elements using the normalized structure
 */
export function useFiguresWithElements(projectId: string) {
  return useQuery({
    queryKey: [...queryKeys.projects.figures(projectId), 'withElements'],
    queryFn: async () => {
      logger.debug('[useFiguresWithElements] Fetching figures with elements', {
        projectId,
      });

      const response =
        await FigureApiService.listFiguresWithElements(projectId);

      logger.info('[useFiguresWithElements] Fetched figures successfully', {
        projectId,
        figureCount: response.figures.length,
      });

      return response.figures;
    },
    enabled: !!projectId,
    staleTime: STALE_TIME.DEFAULT,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to update figure metadata (title, description, displayOrder)
 */
export function useUpdateFigureMetadata() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      projectId,
      figureId,
      updates,
    }: {
      projectId: string;
      figureId: string;
      updates: {
        title?: string;
        description?: string;
        displayOrder?: number;
      };
    }) => {
      return FigureApiService.updateFigureMetadata(
        projectId,
        figureId,
        updates
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate the figures query to refetch updated data
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.figures(variables.projectId),
      });

      toast({
        title: 'Figure updated',
        description: 'Figure metadata has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });
    },
    onError: error => {
      logger.error('[useUpdateFigureMetadata] Failed to update figure', {
        error,
      });

      toast({
        title: 'Update failed',
        description: 'Failed to update figure metadata. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
    },
  });
}

/**
 * Hook to add an element to a figure
 */
export function useAddElementToFigure() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      projectId,
      figureId,
      element,
    }: {
      projectId: string;
      figureId: string;
      element: {
        elementKey: string;
        elementName: string;
        calloutDescription?: string;
      };
    }) => {
      return FigureApiService.addElementToFigure(projectId, figureId, element);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.figures(variables.projectId),
      });

      toast({
        title: 'Element added',
        description: `Element ${variables.element.elementKey} has been added to the figure.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });
    },
    onError: error => {
      logger.error('[useAddElementToFigure] Failed to add element', { error });

      toast({
        title: 'Failed to add element',
        description:
          'Could not add the element to the figure. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
    },
  });
}

/**
 * Hook to remove an element from a figure
 */
export function useRemoveElementFromFigure() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      projectId,
      figureId,
      elementKey,
    }: {
      projectId: string;
      figureId: string;
      elementKey: string;
    }) => {
      return FigureApiService.removeElementFromFigure(
        projectId,
        figureId,
        elementKey
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.figures(variables.projectId),
      });

      toast({
        title: 'Element removed',
        description: `Element ${variables.elementKey} has been removed from the figure.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });
    },
    onError: error => {
      logger.error('[useRemoveElementFromFigure] Failed to remove element', {
        error,
      });

      toast({
        title: 'Failed to remove element',
        description:
          'Could not remove the element from the figure. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
    },
  });
}

/**
 * Hook to update an element's callout description
 */
export function useUpdateElementCallout() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      projectId,
      figureId,
      elementKey,
      calloutDescription,
    }: {
      projectId: string;
      figureId: string;
      elementKey: string;
      calloutDescription: string;
    }) => {
      return FigureApiService.updateElementCallout(projectId, figureId, {
        elementKey,
        calloutDescription,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.figures(variables.projectId),
      });

      toast({
        title: 'Callout updated',
        description: 'Element callout description has been updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });
    },
    onError: error => {
      logger.error('[useUpdateElementCallout] Failed to update callout', {
        error,
      });

      toast({
        title: 'Update failed',
        description: 'Failed to update callout description. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
    },
  });
}

/**
 * Hook to update an element's name globally
 */
export function useUpdateElementName() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      projectId,
      elementKey,
      name,
    }: {
      projectId: string;
      elementKey: string;
      name: string;
    }) => {
      return FigureApiService.updateElementName(projectId, elementKey, name);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.figures(variables.projectId),
      });

      toast({
        title: 'Element updated',
        description: `Element ${variables.elementKey} has been renamed to "${variables.name}".`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });
    },
    onError: error => {
      logger.error('[useUpdateElementName] Failed to update element name', {
        error,
      });

      toast({
        title: 'Update failed',
        description: 'Failed to update element name. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
    },
  });
}

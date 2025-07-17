import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { logger } from '@/utils/clientLogger';
import { queryKeys } from '@/config/reactQueryConfig';

interface FigureElement {
  elementKey: string;
  elementName: string;
  calloutDescription?: string | null;
}

/**
 * Hook to fetch elements for a specific figure
 */
export function useFigureElements(
  projectId: string | null | undefined,
  figureId: string | null | undefined
) {
  return useQuery<FigureElement[]>({
    queryKey: ['projects', projectId, 'figures', figureId, 'elements'],
    queryFn: async () => {
      if (!projectId || !figureId) {
        throw new Error('Project ID and Figure ID are required');
      }

      const response = await apiFetch(
        API_ROUTES.PROJECTS.FIGURES.ELEMENTS(projectId, figureId)
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch figure elements');
      }

      const result = await response.json();

      // Handle standardized API response format
      const data = result.data || result;
      return data.elements;
    },
    enabled: !!projectId && !!figureId,
  });
}

/**
 * Hook to add an element to a figure
 */
export function useAddFigureElement(
  projectId: string | null | undefined,
  figureId: string | null | undefined
) {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { elementKey: string; elementName: string; calloutDescription?: string }
  >({
    mutationFn: async elementData => {
      if (!projectId || !figureId) {
        throw new Error('Project ID and Figure ID are required');
      }

      const response = await apiFetch(
        API_ROUTES.PROJECTS.FIGURES.ELEMENTS(projectId, figureId),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(elementData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to add element to figure');
      }
    },
    onSuccess: async () => {
      // Invalidate queries in the background without waiting
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'figures', figureId, 'elements'],
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.figures(projectId!),
      });

      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'elements', 'all'],
      });
    },
  });
}

/**
 * Hook to update an element's callout description
 */
export function useUpdateFigureElementCallout(
  projectId: string | null | undefined,
  figureId: string | null | undefined
) {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { elementKey: string; calloutDescription: string }
  >({
    mutationFn: async ({ elementKey, calloutDescription }) => {
      if (!projectId || !figureId) {
        throw new Error('Project ID and Figure ID are required');
      }

      const response = await apiFetch(
        API_ROUTES.PROJECTS.FIGURES.ELEMENTS(projectId, figureId),
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ elementKey, calloutDescription }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update element callout');
      }
    },
    onSuccess: async () => {
      // Invalidate queries in the background without waiting
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'figures', figureId, 'elements'],
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.figures(projectId!),
      });

      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'elements', 'all'],
      });
    },
  });
}

/**
 * Hook to remove an element from a figure
 */
export function useRemoveFigureElement(
  projectId: string | null | undefined,
  figureId: string | null | undefined
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
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
    onSuccess: async () => {
      // Invalidate queries in the background without waiting
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'figures', figureId, 'elements'],
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.figures(projectId!),
      });

      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'elements', 'all'],
      });
    },
  });
}

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { queryKeys } from '@/config/reactQueryConfig';
import { logger } from '@/utils/clientLogger';
import { z } from 'zod';
import { STALE_TIME } from '@/constants/time';

// Response validation schema
const UnassignedFigureSchema = z.object({
  id: z.string(),
  figureKey: z.null().optional(),
  fileName: z.string(),
  originalName: z.string(),
  description: z.string().optional(),
  url: z.string(),
  uploadedAt: z.string(),
  sizeBytes: z.number(),
  mimeType: z.string(),
});

const UnassignedFiguresResponseSchema = z.object({
  figures: z.array(UnassignedFigureSchema),
});

export type UnassignedFigure = z.infer<typeof UnassignedFigureSchema>;
export type UnassignedFiguresResponse = z.infer<
  typeof UnassignedFiguresResponseSchema
>;

/**
 * Hook to fetch unassigned figures for a project
 * These are figures that have been uploaded but not assigned to any figure key
 */
export function useUnassignedFigures(projectId: string) {
  return useQuery({
    queryKey: [...queryKeys.projects.figures(projectId), 'unassigned'],
    queryFn: async (): Promise<UnassignedFigure[]> => {
      try {
        logger.debug('[useUnassignedFigures] Fetching unassigned figures', {
          projectId,
        });

        // Add cache-busting parameter to ensure fresh data
        const cacheBuster = Date.now();
        const response = await apiFetch(
          `${API_ROUTES.PROJECTS.FIGURES.UNASSIGNED(projectId)}?_t=${cacheBuster}`
        );
        const result = await response.json();

        // Handle standardized API response format
        const data = result.data || result;

        // Validate response
        const validated = UnassignedFiguresResponseSchema.parse(data);

        logger.info('[useUnassignedFigures] Fetched unassigned figures', {
          projectId,
          count: validated.figures.length,
        });

        return validated.figures;
      } catch (error) {
        logger.error(
          '[useUnassignedFigures] Failed to fetch unassigned figures',
          {
            projectId,
            error,
          }
        );
        throw error;
      }
    },
    enabled: !!projectId,
    staleTime: STALE_TIME.IMMEDIATE, // Quick updates but not instant
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
}

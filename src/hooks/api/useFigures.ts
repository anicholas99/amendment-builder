import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/apiClient';
import { logger } from '@/lib/monitoring/logger';
import { API_ROUTES } from '@/constants/apiRoutes';
import { InventionData } from '@/types/invention';
import {
  Figures,
  Figure,
} from '@/features/technology-details/components/figures/carousel-components/types';
import { queryKeys } from '@/config/reactQueryConfig';
import { STALE_TIME } from '@/constants/time';
import { FigureApiService } from '@/services/api/figureApiService';
import { FigureStatus } from '@/constants/database-enums';
import { useQueryClient } from '@tanstack/react-query';

// Export the query key factory for figures
export const figureKeys = {
  all: ['figures'] as const,
  byProject: (projectId: string) => queryKeys.projects.figures(projectId),
};

interface DatabaseFigure {
  id: string;
  figureKey?: string;
  fileName: string;
  description?: string;
  url: string;
  uploadedAt: string;
  sizeBytes: number;
  mimeType: string;
  status?: string;
}

interface FiguresResponse {
  figures: DatabaseFigure[];
}

/**
 * Hook to fetch and combine figure content with uploaded files
 * Merges inventionData.figures (content) with database ProjectFigure records (files)
 *
 * This hook now supports both the legacy JSON format and the new normalized format.
 * It will check if the new normalized data is available and use that preferentially.
 */
export function useFigures(projectId: string, inventionData?: InventionData) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.projects.figures(projectId), // Use standard query key
    queryFn: async (): Promise<Figures> => {
      try {
        // First, try to fetch the new normalized data
        try {
          const normalizedResponse =
            await FigureApiService.listFiguresWithElements(projectId);

          logger.debug('[useFigures] Raw normalized response', {
            projectId,
            figures: normalizedResponse.figures.map(f => ({
              id: f.id,
              figureKey: f.figureKey,
              status: f.status,
              fileName: f.fileName,
              hasBlobName: !!f.blobName,
            })),
          });

          if (normalizedResponse.figures.length > 0) {
            logger.info('[useFigures] Using normalized figure data', {
              projectId,
              figureCount: normalizedResponse.figures.length,
            });

            // Convert normalized data to the legacy Figures format
            const convertedFigures: Figures = {};

            normalizedResponse.figures.forEach(figure => {
              if (figure.figureKey) {
                // Convert elements array to the legacy elements object format
                const elementsObject: Record<string, string> = {};
                figure.elements.forEach(element => {
                  // Prefer elementName over calloutDescription for display
                  const displayValue =
                    element.elementName || element.calloutDescription || '';
                  elementsObject[element.elementKey] = displayValue;
                });

                // If figure has content, use it. Otherwise, check for image URL
                const imageUrl = figure.fileName
                  ? `/api/projects/${projectId}/figures/${figure.id}/download?v=${Date.now()}`
                  : '';

                convertedFigures[figure.figureKey] = {
                  // Prefer title over description for display
                  description: figure.title || figure.description || '',
                  elements: elementsObject,
                  type: 'image',
                  content: '',
                  image: imageUrl,
                };
              }
            });

            return convertedFigures;
          } else {
            logger.info(
              '[useFigures] No normalized figures found, checking legacy format',
              {
                projectId,
              }
            );
          }
        } catch (normalizedError) {
          // If normalized endpoint fails, fall back to legacy approach
          logger.debug(
            '[useFigures] Normalized endpoint not available, using legacy format',
            {
              projectId,
            }
          );
        }

        // Legacy approach: Fetch uploaded figures from database
        const response = await apiFetch(
          API_ROUTES.PROJECTS.FIGURES.LIST(projectId)
        );
        const data: FiguresResponse = await response.json();

        logger.debug('[useFigures] Fetched figures from database', {
          projectId,
          figureCount: data.figures.length,
          figures: data.figures.map(f => ({
            id: f.id,
            figureKey: f.figureKey,
            fileName: f.fileName,
          })),
        });

        // Get figure content from inventionData
        const figureContent = inventionData?.figures || {};

        // Combine uploaded files with content
        const combinedFigures: Figures = {};

        // First, add all content-based figures
        Object.entries(figureContent).forEach(([figureKey, content]) => {
          // Handle the case where elements is an array but callouts has the descriptions
          let elementsObject: Record<string, string> = {};

          if (
            Array.isArray(content.elements) &&
            content.callouts &&
            Array.isArray(content.callouts)
          ) {
            // Build elements object from callouts
            content.callouts.forEach((callout: any) => {
              if (callout.element && callout.description) {
                elementsObject[callout.element] = callout.description;
              }
            });
          } else if (
            content.elements &&
            typeof content.elements === 'object' &&
            !Array.isArray(content.elements)
          ) {
            // Elements is already an object
            elementsObject = content.elements;
          }

          combinedFigures[figureKey] = {
            description: content.description || '',
            elements: elementsObject,
            type: content.type || 'image',
            content: content.content || '',
            image: '', // Will be set below if there's an uploaded file
          } as Figure;
        });

        // Then, merge in uploaded files
        // IMPORTANT: For figures with a figureKey, we must use the ASSIGNED figure's ID, not UPLOADED
        data.figures.forEach(dbFigure => {
          const figureKey = dbFigure.figureKey;

          if (figureKey) {
            // Log figure details for debugging
            logger.debug('[useFigures] Processing figure with figureKey', {
              id: dbFigure.id,
              figureKey: dbFigure.figureKey,
              status: dbFigure.status,
              fileName: dbFigure.fileName,
            });

            // For figures with a figureKey, process both ASSIGNED and PENDING figures
            // PENDING figures should show as empty slots, ASSIGNED figures have images
            if (
              dbFigure.status !== FigureStatus.ASSIGNED &&
              dbFigure.status !== FigureStatus.PENDING
            ) {
              logger.debug('[useFigures] Skipping non-carousel figure', {
                id: dbFigure.id,
                figureKey: dbFigure.figureKey,
                status: dbFigure.status,
              });
              return; // Skip UPLOADED and other statuses
            }

            // Handle PENDING vs ASSIGNED figures differently
            if (dbFigure.status === FigureStatus.PENDING) {
              // PENDING figures should appear as empty slots
              if (!combinedFigures[figureKey]) {
                logger.info(
                  '[useFigures] Creating empty slot for PENDING figure',
                  {
                    figureKey,
                    figureId: dbFigure.id,
                    status: dbFigure.status,
                  }
                );

                combinedFigures[figureKey] = {
                  description: dbFigure.description || '',
                  elements: {},
                  type: 'image',
                  content: '',
                  image: '', // No image for PENDING figures
                } as Figure;
              }
            } else if (dbFigure.status === FigureStatus.ASSIGNED) {
              // ASSIGNED figures have images
              if (combinedFigures[figureKey]) {
                logger.info('[useFigures] Updating figure with uploaded file', {
                  figureKey,
                  figureId: dbFigure.id,
                  fileName: dbFigure.fileName,
                  url: dbFigure.url,
                  status: dbFigure.status,
                });

                combinedFigures[figureKey] = {
                  ...combinedFigures[figureKey],
                  image: dbFigure.url,
                };
              } else {
                // Create new figure if only file exists (no content)
                logger.info(
                  '[useFigures] Creating new figure from uploaded file',
                  {
                    figureKey,
                    figureId: dbFigure.id,
                    fileName: dbFigure.fileName,
                    url: dbFigure.url,
                    status: dbFigure.status,
                  }
                );

                combinedFigures[figureKey] = {
                  description: dbFigure.description || '',
                  elements: {},
                  type: 'image',
                  content: '',
                  image: dbFigure.url,
                } as Figure;
              }
            }
          }
        });

        logger.info('[useFigures] Combined figures successfully', {
          projectId,
          contentFigures: Object.keys(figureContent).length,
          uploadedFigures: data.figures.length,
          combinedFigures: Object.keys(combinedFigures).length,
          figuresWithImages: Object.values(combinedFigures).filter(
            (f: Figure) => f.image
          ).length,
        });

        return combinedFigures;
      } catch (error) {
        logger.error('[useFigures] Failed to fetch figures', {
          projectId,
          error,
        });

        // Fallback to just content if API fails
        const figureContent = inventionData?.figures || {};
        const fallbackFigures: Figures = {};

        Object.entries(figureContent).forEach(([figureKey, content]) => {
          fallbackFigures[figureKey] = {
            description: content.description || '',
            elements: content.elements || {},
            type: content.type || 'image',
            content: content.content || '',
            image: '',
          } as Figure;
        });

        return fallbackFigures;
      }
    },
    enabled: !!projectId,
    // Prevent automatic background refetches that cause UI flicker
    // We'll manually refetch when needed after mutations complete
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Still fetch on initial mount
    // Prevent multiple components from triggering simultaneous fetches
    refetchInterval: false,
    refetchIntervalInBackground: false,
    // Share the same query instance across components
    structuralSharing: true,
    // Add gcTime to prevent immediate garbage collection and refetch
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

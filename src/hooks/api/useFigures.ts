import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/apiClient';
import { logger } from '@/utils/clientLogger';
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

// Extend the Figure type to include the database ID
export interface FigureWithId extends Figure {
  _id?: string; // Database figure ID for API calls
  title?: string;
}

export type FiguresWithIds = Record<string, FigureWithId>;

// Export the query key factory for figures
export const figureKeys = {
  all: ['figures'] as const,
  byProject: (projectId: string) => queryKeys.projects.figures(projectId),
};

interface DatabaseFigure {
  id: string;
  figureKey?: string;
  fileName?: string;
  description?: string;
  url?: string;
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
    queryFn: async (): Promise<FiguresWithIds> => {
      try {
        // First, try to fetch the new normalized data
        try {
          const normalizedResponse =
            await FigureApiService.listFiguresWithElements(projectId);

          logger.info('[useFigures] Raw normalized response', {
            projectId,
            totalFigures: normalizedResponse.figures.length,
            figures: normalizedResponse.figures.map(f => ({
              id: f.id,
              figureKey: f.figureKey,
              status: f.status,
              fileName: f.fileName,
              hasBlobName: !!f.blobName,
              description: f.description,
            })),
          });

          // Always use normalized data if the endpoint succeeded
          logger.info('[useFigures] Using normalized figure data', {
            projectId,
            figureCount: normalizedResponse.figures.length,
            hasPendingFigures: normalizedResponse.figures.some(
              f => f.status === 'PENDING'
            ),
            hasAssignedFigures: normalizedResponse.figures.some(
              f => f.status === 'ASSIGNED'
            ),
            figureStatuses: normalizedResponse.figures.map(f => ({
              figureKey: f.figureKey,
              status: f.status,
              hasFileName: !!f.fileName,
              hasBlobName: !!f.blobName,
            })),
          });

          // Convert normalized data to the legacy Figures format
          const convertedFigures: FiguresWithIds = {};

          normalizedResponse.figures.forEach(figure => {
            if (figure.figureKey) {
              // Convert elements array to the legacy elements object format
              const elementsObject: Record<string, string> = {};
              if (figure.elements && figure.elements.length > 0) {
                figure.elements.forEach(element => {
                  // Prefer elementName over calloutDescription for display
                  const displayValue =
                    element.elementName || element.calloutDescription || '';
                  elementsObject[element.elementKey] = displayValue;
                });
              }

              // If figure has content, use it. Otherwise, check for image URL
              // ASSIGNED figures should have images, regardless of fileName
              // Check both status and blobName for more reliable detection
              const isAssigned = figure.status === 'ASSIGNED';
              const hasFile = !!(figure.fileName || figure.blobName);
              const imageUrl =
                isAssigned && hasFile
                  ? `/api/projects/${projectId}/figures/${figure.id}/download?v=${Date.now()}`
                  : '';

              // Enhanced logging for debugging (can be removed in production)
              logger.debug('[useFigures] Processing figure', {
                figureKey: figure.figureKey,
                status: figure.status,
                willHaveImage: !!imageUrl,
              });

              convertedFigures[figure.figureKey] = {
                // Use description field (title is for internal use)
                description: figure.description || '',
                title: figure.title || `Figure ${figure.figureKey}`,
                elements: elementsObject,
                type: 'image',
                content: '',
                image: imageUrl,
                _id: figure.id, // Include the database ID
              };
            }
          });

          // If no figures found, try legacy approach as normalized might be missing newly created figures
          if (Object.keys(convertedFigures).length === 0) {
            logger.info(
              '[useFigures] No figures from normalized endpoint, trying legacy format',
              {
                projectId,
              }
            );
            throw new Error('No figures found, falling back to legacy');
          }

          return convertedFigures;
        } catch (normalizedError) {
          // If normalized endpoint fails, fall back to legacy approach
          logger.warn(
            '[useFigures] Normalized endpoint failed, falling back to legacy format',
            {
              projectId,
              error:
                normalizedError instanceof Error
                  ? normalizedError.message
                  : String(normalizedError),
            }
          );
        }

        // Legacy approach: Fetch uploaded figures from database
        const response = await apiFetch(
          API_ROUTES.PROJECTS.FIGURES.LIST(projectId)
        );
        const result = await response.json();

        // Handle standardized API response format
        const data: FiguresResponse = result.data || result;

        logger.info('[useFigures] Legacy API response', {
          projectId,
          figureCount: data.figures.length,
          figures: data.figures.map(f => ({
            id: f.id,
            figureKey: f.figureKey,
            fileName: f.fileName,
            status: f.status,
          })),
        });

        // Get figure content from inventionData
        const figureContent = inventionData?.figures || {};

        // Combine uploaded files with content
        const combinedFigures: FiguresWithIds = {};

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
            _id: content._id, // Include the database ID
          } as FigureWithId;
        });

        // Then, merge in uploaded files
        // IMPORTANT: For figures with a figureKey, we must use the ASSIGNED figure's ID, not UPLOADED
        data.figures.forEach(dbFigure => {
          const figureKey = dbFigure.figureKey;

          if (figureKey) {
            // For figures with a figureKey, process both ASSIGNED and PENDING figures
            // PENDING figures should show as empty slots, ASSIGNED figures have images
            if (
              dbFigure.status !== FigureStatus.ASSIGNED &&
              dbFigure.status !== FigureStatus.PENDING
            ) {
              return; // Skip UPLOADED and other statuses
            }

            // Handle PENDING vs ASSIGNED figures differently
            if (dbFigure.status === FigureStatus.PENDING) {
              // PENDING figures should appear as empty slots
              logger.info(
                '[useFigures] Found PENDING figure - creating empty slot',
                {
                  figureKey,
                  figureId: dbFigure.id,
                  status: dbFigure.status,
                  existsInCombined: !!combinedFigures[figureKey],
                }
              );

              if (!combinedFigures[figureKey]) {
                combinedFigures[figureKey] = {
                  description: dbFigure.description || '',
                  elements: {},
                  type: 'image',
                  content: '',
                  image: '', // No image for PENDING figures
                  _id: dbFigure.id, // Include the database ID
                } as FigureWithId;
              } else {
                // Update the existing figure with the database ID
                combinedFigures[figureKey]._id = dbFigure.id;
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
                  _id: dbFigure.id, // Include the database ID
                } as FigureWithId;
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
            (f: FigureWithId) => f.image
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
        const fallbackFigures: FiguresWithIds = {};

        Object.entries(figureContent).forEach(([figureKey, content]) => {
          fallbackFigures[figureKey] = {
            description: content.description || '',
            elements: content.elements || {},
            type: content.type || 'image',
            content: content.content || '',
            image: '',
            _id: content._id, // Include the database ID
          } as FigureWithId;
        });

        return fallbackFigures;
      }
    },
    enabled: !!projectId,
    // Prevent automatic background refetches that cause UI flicker
    // We'll manually refetch when needed after mutations complete
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Refetch on mount
    // Prevent multiple components from triggering simultaneous fetches
    refetchInterval: false,
    refetchIntervalInBackground: false,
    // IMPORTANT: Disable structural sharing to prevent React Query from
    // merging old and new data in unexpected ways
    structuralSharing: false,
    // Add gcTime to prevent immediate garbage collection and refetch
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Business logic utilities for PatentSidebar component
 * Extracted complex logic following the architectural blueprint
 */
import { logger } from '@/lib/monitoring/logger';
import { InventionData } from '@/types/invention';
import {
  Figures,
  Figure,
} from '../../technology-details/components/figures/carousel-components/types';
import { FigureData, isFigureData } from '@/types/ui-types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Convert InventionData figures to the FigureCarousel expected format
 * This replaces the legacy structuredData conversion logic
 */
export const convertInventionFiguresToCarouselFormat = (
  inventionFigures: unknown
): Figures => {
  // Parse if it's a JSON string
  let parsedFigures = inventionFigures;
  if (typeof inventionFigures === 'string') {
    try {
      parsedFigures = JSON.parse(inventionFigures);
    } catch (error) {
      return {} as Figures;
    }
  }

  // If figures is not an object or is null/undefined, return empty figures
  if (
    !parsedFigures ||
    typeof parsedFigures !== 'object' ||
    Array.isArray(parsedFigures)
  ) {
    return {} as Figures;
  }

  const convertedFigures: Figures = {};

  Object.entries(parsedFigures).forEach(([figureKey, figureData]) => {
    // Use type guard to check if it's valid figure data
    if (!isFigureData(figureData)) {
      return;
    }

    // Create the Figure object with all properties
    convertedFigures[figureKey] = {
      // Copy description and elements directly
      description: figureData.description,
      elements: figureData.elements || {},

      // Ensure type is one of the allowed values
      type:
        figureData.type === 'image' ||
        figureData.type === 'mermaid' ||
        figureData.type === 'reactflow'
          ? figureData.type
          : 'image', // Default to 'image' if not specified

      // Set content (used for special diagram types)
      content: figureData.originalDescription || '',

      // image property intentionally omitted - images come from ProjectFigure table
    } as Figure;
  });

  // Only log in debug mode or when there's a mismatch
  if (
    Object.keys(parsedFigures).length !== Object.keys(convertedFigures).length
  ) {
    logger.warn('[patentSidebarUtils] Figure conversion mismatch', {
      originalFigureCount: Object.keys(parsedFigures).length,
      convertedFigureCount: Object.keys(convertedFigures).length,
    });
  }

  return convertedFigures;
};

/**
 * Convert FigureCarousel format back to InventionData figures format
 * This handles the reverse transformation when updating figures
 */
export const convertCarouselFiguresToInventionFormat = (
  carouselFigures: Figures
): Record<string, unknown> => {
  const inventionFigures: Record<string, unknown> = {};

  Object.entries(carouselFigures).forEach(([key, figure]) => {
    // Ensure elements is always an object, even if it somehow became an array
    let elementsObj = {};

    if (Array.isArray(figure.elements)) {
      // If elements was corrupted into an array, convert it back to an object
      // with empty descriptions
      elementsObj = figure.elements.reduce(
        (acc: Record<string, string>, elementNum: any) => {
          acc[String(elementNum)] = '';
          return acc;
        },
        {}
      );
      logger.warn(
        `[patentSidebarUtils] Converting corrupted array elements to object for ${key}`,
        {
          originalElements: figure.elements,
          convertedElements: elementsObj,
        }
      );
    } else if (figure.elements && typeof figure.elements === 'object') {
      // Normal case - it's already an object
      elementsObj = figure.elements;
    }

    // Persist only intellectual-property metadata. Do NOT save the image URL –
    // that lives in ProjectFigure and is resolved on demand via the service layer.
    inventionFigures[key] = {
      description: figure.description || '',
      elements: elementsObj, // Always use the validated object
      // Always preserve the type for downstream rendering
      type: figure.type || 'image',
      // Store diagram/raw description if provided (e.g., mermaid source)
      originalDescription: figure.content,
      // Intentionally omit `image` so that download routes are not persisted
    };

    // Only log when there's something unusual
    if (Array.isArray(figure.elements)) {
      logger.warn(
        `[patentSidebarUtils] Converting corrupted array elements for ${key}`,
        {
          elementsCount: Object.keys(elementsObj).length,
        }
      );
    }
  });

  return inventionFigures;
};

/**
 * Extract elements from invention data for ReferenceNumeralsEditor
 * Returns elements for the current figure
 *
 * NOTE: This is now deprecated in favor of fetching from the database
 * via the FigureElement relationships. Keeping for backward compatibility.
 */
export const extractElementsFromInvention = (
  inventionData: InventionData | null,
  currentFigure?: string
): Record<string, string> => {
  // No invention data? Return empty
  if (!inventionData) {
    return {};
  }

  // If we have a current figure, get elements from that specific figure
  if (currentFigure && inventionData.figures) {
    const figures = inventionData.figures;
    if (typeof figures === 'object' && figures[currentFigure]) {
      const figure = figures[currentFigure];

      // First, check if there's a callouts array we can use for descriptions
      if (figure && typeof figure === 'object' && 'callouts' in figure) {
        const callouts = (figure as any).callouts;
        if (Array.isArray(callouts) && callouts.length > 0) {
          const elementObj: Record<string, string> = {};
          callouts.forEach((callout: any) => {
            if (callout.element && callout.description) {
              elementObj[String(callout.element)] = String(callout.description);
            }
          });
          if (Object.keys(elementObj).length > 0) {
            // Only log if there are many elements or in debug mode
            if (Object.keys(elementObj).length > 10) {
              logger.debug(
                '[extractElementsFromInvention] Using callouts for element descriptions',
                {
                  currentFigure,
                  elementCount: Object.keys(elementObj).length,
                }
              );
            }
            return elementObj;
          }
        }
      }

      // If no callouts or callouts didn't have descriptions, check elements field
      if (figure && typeof figure === 'object' && 'elements' in figure) {
        const elements = (figure as any).elements;

        // Handle different element formats
        if (Array.isArray(elements)) {
          // Convert array format to object format with empty descriptions
          const elementObj: Record<string, string> = {};
          elements.forEach(elementNum => {
            if (
              typeof elementNum === 'string' ||
              typeof elementNum === 'number'
            ) {
              elementObj[String(elementNum)] = '';
            }
          });
          // Remove noisy debug log
          // logger.debug('[extractElementsFromInvention] Converted array elements to object (no callouts found)', {
          //   currentFigure,
          //   originalArray: elements,
          //   convertedObject: elementObj,
          // });
          return elementObj;
        } else if (elements && typeof elements === 'object') {
          // It's already an object, just ensure all values are strings
          const normalizedElements: Record<string, string> = {};
          Object.entries(elements).forEach(([key, value]) => {
            normalizedElements[key] = String(value || '');
          });
          // Only log if there are descriptions or many elements
          if (
            Object.values(normalizedElements).some(desc => desc.length > 0) ||
            Object.keys(normalizedElements).length > 10
          ) {
            logger.debug(
              '[extractElementsFromInvention] Found object elements for figure',
              {
                currentFigure,
                elementCount: Object.keys(normalizedElements).length,
                hasDescriptions: Object.values(normalizedElements).some(
                  desc => desc.length > 0
                ),
              }
            );
          }
          return normalizedElements;
        }
      }
    }
  }

  // Fallback: Check if elements are stored at the top level (legacy support)
  if (inventionData.elements && typeof inventionData.elements === 'object') {
    // Remove noisy debug log - this happens too frequently
    // logger.debug('[extractElementsFromInvention] Using top-level elements (legacy)', {
    //   elementCount: Object.keys(inventionData.elements).length,
    // });
    return inventionData.elements as Record<string, string>;
  }

  // No elements found
  // Only log when debugging specific issues
  // logger.debug('[extractElementsFromInvention] No elements found', {
  //   currentFigure,
  //   hasFigures: !!inventionData.figures,
  //   hasTopLevelElements: !!inventionData.elements,
  // });
  return {};
};

/**
 * Create figure generation data for new figures
 */
export const createFigureGenerationData = (
  figureKey: string,
  figureData: unknown
) => {
  if (!isFigureData(figureData)) {
    logger.error('[patentSidebarUtils] Invalid figure data for generation');
    return null;
  }

  return {
    id: uuidv4(),
    title: `Figure ${figureKey}`,
    description: figureData.description,
    elements: figureData.elements || {},
    type:
      figureData.type === 'image' ||
      figureData.type === 'mermaid' ||
      figureData.type === 'reactflow'
        ? figureData.type
        : 'diagram',
    diagram: {
      type: 'custom',
      content: figureData.originalDescription || '',
    },
    image: figureData.image || '',
  };
};

/**
 * Validate figure data integrity
 */
export const validateFigureData = (figureData: unknown): boolean => {
  return isFigureData(figureData);
};

/**
 * Create stable project reference for chat integration
 * This ensures chat doesn't cause unnecessary re-renders
 */
export const createStableProjectReference = (
  activeProjectData: any,
  projectId: string,
  inventionData: InventionData | null
) => {
  return {
    id: activeProjectData?.id || projectId || '',
    name: activeProjectData?.name || 'Untitled Project',
    userId: activeProjectData?.userId || '',
    tenantId: activeProjectData?.tenantId || '',
    status: activeProjectData?.status || 'draft',
    textInput: activeProjectData?.textInput || '',
    createdAt: activeProjectData?.createdAt || new Date(),
    lastModified: activeProjectData?.lastModified || new Date().toISOString(),
    documents: activeProjectData?.documents || [],
    savedPriorArtItems: activeProjectData?.savedPriorArtItems || [],
    invention: inventionData || undefined,
  };
};

/**
 * Logging utilities for patent sidebar operations
 */
export const logPatentSidebarOperation = (
  operation: string,
  data: Record<string, any>
): void => {
  logger.log(`[PatentSidebar] ${operation}`, data);
};

export const logFigureOperation = (
  operation: string,
  figureKey: string,
  data: Record<string, any>
): void => {
  logger.log(`[PatentSidebar Figure] ${operation} - ${figureKey}`, data);
};

export const logFigureAction = (
  operation: string,
  figureKey: string,
  data?: any
) => {
  logger.log(`[PatentSidebar Figure] ${operation} - ${figureKey}`, data);
};

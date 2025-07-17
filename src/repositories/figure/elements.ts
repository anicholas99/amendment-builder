import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import type {
  FigureWithElements,
  FigureMetadataUpdate,
  FigureElementData,
  ElementInfo,
} from '@/types/figure';

/**
 * Figure element operations
 * Handles figure-element relationships and element management
 */

/**
 * Get all figures for a project with their associated elements
 */
export async function getFiguresWithElements(
  projectId: string
): Promise<FigureWithElements[]> {
  try {
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client not initialized'
      );
    }

    const figures = await prisma.projectFigure.findMany({
      where: {
        projectId,
        deletedAt: null, // Respect soft deletes
      },
      include: {
        figureElements: {
          include: {
            element: true,
          },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { figureKey: 'asc' }],
    });

    // Filter figures same as listProjectFigures
    // We want to show:
    // 1. All PENDING figures (figure slots without images)
    // 2. All ASSIGNED figures (have images and figureKeys)
    // 3. UPLOADED figures that don't have a figureKey (unassigned uploads)
    const filteredFigures = figures.filter(figure => {
      const status = figure.status;

      // Always include PENDING and ASSIGNED figures
      if (status === 'PENDING' || status === 'ASSIGNED') {
        return true;
      }

      // For UPLOADED figures, only include if they don't have a figureKey
      if (status === 'UPLOADED' && !figure.figureKey) {
        return true;
      }

      return false;
    });

    // Transform to a cleaner structure for the frontend
    return filteredFigures.map(figure => ({
      id: figure.id,
      status: figure.status || 'UPLOADED', // Include status field
      figureKey: figure.figureKey,
      title: figure.title,
      description: figure.description,
      displayOrder: figure.displayOrder,
      fileName: figure.fileName || '', // Provide default empty string for PENDING figures
      blobName: figure.blobName || '', // Provide default empty string for PENDING figures
      mimeType: figure.mimeType || 'image/png', // Provide default mime type
      elements: figure.figureElements.map(fe => ({
        elementKey: fe.element.elementKey,
        elementName: fe.element.name,
        calloutDescription: fe.calloutDescription,
      })),
    }));
  } catch (error) {
    logger.error('Failed to get figures with elements', {
      projectId,
      error,
    });
    throw error;
  }
}

/**
 * Update a figure's metadata (title, description, displayOrder)
 */
export async function updateFigureMetadata(
  figureId: string,
  data: FigureMetadataUpdate
) {
  try {
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client not initialized'
      );
    }

    return await prisma.projectFigure.update({
      where: { id: figureId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.displayOrder !== undefined && {
          displayOrder: data.displayOrder,
        }),
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    logger.error('Failed to update figure metadata', {
      figureId,
      data,
      error,
    });
    throw error;
  }
}

/**
 * Get elements for a specific figure
 */
export async function getElementsForFigure(
  figureId: string
): Promise<ElementInfo[]> {
  try {
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client not initialized'
      );
    }

    const figureElements = await prisma.figureElement.findMany({
      where: { figureId },
      include: {
        element: true,
      },
    });

    // Transform to a cleaner structure
    return figureElements.map(fe => ({
      elementKey: fe.element.elementKey,
      elementName: fe.element.name,
      calloutDescription: fe.calloutDescription,
    }));
  } catch (error) {
    logger.error('Failed to get elements for figure', {
      figureId,
      error,
    });
    throw error;
  }
}

/**
 * Add an element to a figure
 */
export async function addElementToFigure(
  figureId: string,
  projectId: string,
  elementData: FigureElementData
) {
  try {
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client not initialized'
      );
    }

    return await prisma.$transaction(async tx => {
      // First, ensure the element exists
      const element = await tx.element.upsert({
        where: {
          projectId_elementKey: {
            projectId,
            elementKey: elementData.elementKey,
          },
        },
        create: {
          projectId,
          elementKey: elementData.elementKey,
          name: elementData.elementName,
        },
        update: {
          name: elementData.elementName,
        },
      });

      // Then create the figure-element relationship
      return await tx.figureElement.create({
        data: {
          figureId,
          elementId: element.id,
          calloutDescription: elementData.calloutDescription,
        },
      });
    });
  } catch (error) {
    logger.error('Failed to add element to figure', {
      figureId,
      projectId,
      elementData,
      error,
    });
    throw error;
  }
}

/**
 * Remove an element from a figure
 */
export async function removeElementFromFigure(
  figureId: string,
  elementKey: string
) {
  try {
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client not initialized'
      );
    }

    // Find the element first
    const figureElement = await prisma.figureElement.findFirst({
      where: {
        figureId,
        element: {
          elementKey,
        },
      },
    });

    if (!figureElement) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'Element not found in figure'
      );
    }

    return await prisma.figureElement.delete({
      where: { id: figureElement.id },
    });
  } catch (error) {
    logger.error('Failed to remove element from figure', {
      figureId,
      elementKey,
      error,
    });
    throw error;
  }
}

/**
 * Update an element's callout description for a specific figure
 */
export async function updateElementCallout(
  figureId: string,
  elementKey: string,
  calloutDescription: string
) {
  try {
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client not initialized'
      );
    }

    const figureElement = await prisma.figureElement.findFirst({
      where: {
        figureId,
        element: {
          elementKey,
        },
      },
    });

    if (!figureElement) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'Element not found in figure'
      );
    }

    return await prisma.figureElement.update({
      where: { id: figureElement.id },
      data: {
        calloutDescription,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    logger.error('Failed to update element callout', {
      figureId,
      elementKey,
      calloutDescription,
      error,
    });
    throw error;
  }
}

/**
 * Get all elements for a project
 */
export async function getProjectElements(projectId: string) {
  try {
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client not initialized'
      );
    }

    return await prisma.element.findMany({
      where: { projectId },
      orderBy: { elementKey: 'asc' },
    });
  } catch (error) {
    logger.error('Failed to get project elements', {
      projectId,
      error,
    });
    throw error;
  }
}

/**
 * Update an element's name globally across all figures
 */
export async function updateElementName(
  projectId: string,
  elementKey: string,
  newName: string
) {
  try {
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client not initialized'
      );
    }

    return await prisma.element.update({
      where: {
        projectId_elementKey: {
          projectId,
          elementKey,
        },
      },
      data: {
        name: newName,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    logger.error('Failed to update element name', {
      projectId,
      elementKey,
      newName,
      error,
    });
    throw error;
  }
}

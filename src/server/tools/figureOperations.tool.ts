import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import {
  figureRepository,
  listProjectFigures,
  createProjectFigure,
  updateProjectFigure,
} from '@/repositories/figure';
import { findProjectByIdAndTenant } from '@/repositories/project/core.repository';

/**
 * Get all figures with their reference numerals for a project
 *
 * SECURITY: Always validates tenant ownership before accessing data
 */
export async function getFigureElements(
  projectId: string,
  tenantId: string,
  figureKey?: string
): Promise<{ success: boolean; figures: any[]; message: string }> {
  logger.info('[GetFigureElementsTool] Getting figure elements', {
    projectId,
    figureKey,
  });

  try {
    // Verify project and tenant ownership
    const project = await findProjectByIdAndTenant(projectId, tenantId);

    if (!project) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Project not found or access denied'
      );
    }

    // Get figures with elements
    const figures = await figureRepository.getFiguresWithElements(projectId);

    // Filter by specific figure if requested
    const filteredFigures = figureKey
      ? figures.filter(f => f.figureKey === figureKey)
      : figures;

    // Transform for clean response
    const figuresWithElements = filteredFigures.map(figure => ({
      figureKey: figure.figureKey || `Unassigned (${figure.id.slice(-6)})`,
      title: figure.title || '',
      description: figure.description || '',
      status: figure.status,
      elements: figure.elements.map(el => ({
        number: el.elementKey,
        description: el.calloutDescription || el.elementName,
        name: el.elementName,
      })),
    }));

    const totalElements = figuresWithElements.reduce(
      (sum, fig) => sum + fig.elements.length,
      0
    );

    return {
      success: true,
      figures: figuresWithElements,
      message: figureKey
        ? `Found ${figuresWithElements[0]?.elements.length || 0} reference numerals in ${figureKey}`
        : `Found ${figuresWithElements.length} figures with ${totalElements} total reference numerals`,
    };
  } catch (error) {
    logger.error('[GetFigureElementsTool] Failed to get figure elements', {
      projectId,
      error,
    });
    throw error;
  }
}

/**
 * Add a reference numeral to a figure
 *
 * SECURITY: Always validates tenant ownership before accessing data
 */
export async function addFigureElement(
  projectId: string,
  tenantId: string,
  figureKey: string,
  elementNumber: string,
  description: string
): Promise<{ success: boolean; element: any; message: string }> {
  logger.info('[AddFigureElementTool] Adding figure element', {
    projectId,
    figureKey,
    elementNumber,
  });

  try {
    // Verify project and tenant ownership
    const project = await findProjectByIdAndTenant(projectId, tenantId);

    if (!project) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Project not found or access denied'
      );
    }

    // Find the figure by figureKey using list method (assuming userId from context)
    const figures = await listProjectFigures(
      projectId,
      project.userId,
      tenantId
    );
    const figure = figures.find(f => f.figureKey === figureKey);

    if (!figure) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        `Figure "${figureKey}" not found`
      );
    }

    // Check if element already exists by getting elements for the figure
    const existingElements = await figureRepository.getElementsForFigure(
      figure.id
    );
    const elementExists = existingElements.some(
      el => el.elementKey === elementNumber
    );

    if (elementExists) {
      throw new ApplicationError(
        ErrorCode.DB_DUPLICATE_ENTRY,
        `Reference numeral ${elementNumber} already exists in ${figureKey}`
      );
    }

    // Add the element
    await figureRepository.addElementToFigure(figure.id, projectId, {
      elementKey: elementNumber,
      elementName: description,
      calloutDescription: description,
    });

    return {
      success: true,
      element: {
        number: elementNumber,
        description,
        figureKey,
      },
      message: `Successfully added reference numeral ${elementNumber} to ${figureKey}`,
    };
  } catch (error) {
    logger.error('[AddFigureElementTool] Failed to add figure element', {
      projectId,
      figureKey,
      elementNumber,
      error,
    });
    throw error;
  }
}

/**
 * Update a reference numeral description
 *
 * SECURITY: Always validates tenant ownership before accessing data
 */
export async function updateFigureElement(
  projectId: string,
  tenantId: string,
  figureKey: string,
  elementNumber: string,
  newDescription: string
): Promise<{ success: boolean; element: any; message: string }> {
  logger.info('[UpdateFigureElementTool] Updating figure element', {
    projectId,
    figureKey,
    elementNumber,
  });

  try {
    // Verify project and tenant ownership
    const project = await findProjectByIdAndTenant(projectId, tenantId);

    if (!project) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Project not found or access denied'
      );
    }

    // Find the figure
    const figures = await listProjectFigures(
      projectId,
      project.userId,
      tenantId
    );
    const figure = figures.find(f => f.figureKey === figureKey);

    if (!figure) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        `Figure "${figureKey}" not found`
      );
    }

    // Update the element callout description
    await figureRepository.updateElementCallout(
      figure.id,
      elementNumber,
      newDescription
    );

    // Also update the element name globally
    await figureRepository.updateElementName(
      projectId,
      elementNumber,
      newDescription
    );

    return {
      success: true,
      element: {
        number: elementNumber,
        description: newDescription,
        figureKey,
      },
      message: `Successfully updated reference numeral ${elementNumber} in ${figureKey}`,
    };
  } catch (error) {
    logger.error('[UpdateFigureElementTool] Failed to update figure element', {
      projectId,
      figureKey,
      elementNumber,
      error,
    });
    throw error;
  }
}

/**
 * Remove a reference numeral from a figure
 *
 * SECURITY: Always validates tenant ownership before accessing data
 */
export async function removeFigureElement(
  projectId: string,
  tenantId: string,
  figureKey: string,
  elementNumber: string
): Promise<{ success: boolean; message: string }> {
  logger.info('[RemoveFigureElementTool] Removing figure element', {
    projectId,
    figureKey,
    elementNumber,
  });

  try {
    // Verify project and tenant ownership
    const project = await findProjectByIdAndTenant(projectId, tenantId);

    if (!project) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Project not found or access denied'
      );
    }

    // Find the figure
    const figures = await listProjectFigures(
      projectId,
      project.userId,
      tenantId
    );
    const figure = figures.find(f => f.figureKey === figureKey);

    if (!figure) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        `Figure "${figureKey}" not found`
      );
    }

    // Remove the element from the figure
    await figureRepository.removeElementFromFigure(figure.id, elementNumber);

    return {
      success: true,
      message: `Successfully removed reference numeral ${elementNumber} from ${figureKey}`,
    };
  } catch (error) {
    logger.error('[RemoveFigureElementTool] Failed to remove figure element', {
      projectId,
      figureKey,
      elementNumber,
      error,
    });
    throw error;
  }
}

/**
 * Create a new figure slot (pending figure)
 *
 * SECURITY: Always validates tenant ownership before creating
 */
export async function createFigureSlot(
  projectId: string,
  tenantId: string,
  figureKey: string,
  title?: string,
  description?: string
): Promise<{ success: boolean; figure: any; message: string }> {
  logger.info('[CreateFigureSlotTool] Creating figure slot', {
    projectId,
    figureKey,
    title,
  });

  try {
    // Verify project and tenant ownership
    const project = await findProjectByIdAndTenant(projectId, tenantId);

    if (!project) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Project not found or access denied'
      );
    }

    // Check if figure already exists (including both PENDING and ASSIGNED figures)
    const existingFigures = await listProjectFigures(
      projectId,
      project.userId,
      tenantId
    );
    const existingFigure = existingFigures.find(f => f.figureKey === figureKey);

    if (existingFigure) {
      logger.info(
        '[CreateFigureSlotTool] Figure already exists, skipping creation',
        {
          projectId,
          figureKey,
          existingFigureId: existingFigure.id,
          status: existingFigure.status,
        }
      );

      // If the existing figure doesn't have a title but we're providing one, update it
      if (title && !existingFigure.description) {
        await figureRepository.updateFigureMetadata(existingFigure.id, {
          title: title,
          description: description || existingFigure.description,
        });
      }

      return {
        success: true,
        figure: {
          id: existingFigure.id,
          figureKey: existingFigure.figureKey,
          title:
            title ||
            existingFigure.description ||
            `Figure ${existingFigure.figureKey}`,
          description: description || existingFigure.description || '',
          status: existingFigure.status,
        },
        message: `Using existing ${figureKey}`,
      };
    }

    // Create new pending figure
    const newFigure = await createProjectFigure(
      {
        projectId,
        figureKey,
        fileName: '', // Empty for pending figures
        originalName: '', // Empty for pending figures
        blobName: '', // Empty for pending figures
        mimeType: 'image/png', // Default mime type
        sizeBytes: 0, // 0 for pending figures
        description: description || '',
        uploadedBy: project.userId,
      },
      tenantId
    );

    // Update to PENDING status and add title if needed
    await updateProjectFigure(
      newFigure.id,
      {
        status: 'PENDING',
      },
      project.userId,
      tenantId
    );

    // Update figure metadata to add the title
    if (title || description) {
      await figureRepository.updateFigureMetadata(newFigure.id, {
        title: title || `Figure ${figureKey}`,
        description: description || '',
      });
    }

    logger.info('[CreateFigureSlotTool] Figure slot created successfully', {
      projectId,
      figureKey,
      figureId: newFigure.id,
      title,
    });

    return {
      success: true,
      figure: {
        id: newFigure.id,
        figureKey,
        title: title || `Figure ${figureKey}`,
        description: description || '',
        status: 'PENDING',
      },
      message: `Successfully created figure slot ${figureKey}`,
    };
  } catch (error) {
    logger.error('[CreateFigureSlotTool] Failed to create figure slot', {
      projectId,
      figureKey,
      error,
    });
    throw error;
  }
}

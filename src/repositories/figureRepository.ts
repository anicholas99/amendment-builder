import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/monitoring/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { Prisma } from '@prisma/client';

export interface FigureUploadData {
  projectId: string;
  fileName: string;
  originalName: string;
  blobName: string;
  mimeType: string;
  sizeBytes: number;
  figureKey?: string;
  description?: string;
  uploadedBy: string;
}

export interface FigureAccessInfo {
  id: string;
  projectId: string;
  status?: string;
  fileName: string;
  blobName: string;
  mimeType: string;
  sizeBytes: number;
  figureKey?: string;
  description?: string;
  uploadedBy: string;
  createdAt: Date;
}

/**
 * Securely stores figure metadata in database with proper tenant isolation
 */
export async function createProjectFigure(
  data: FigureUploadData,
  tenantId: string
): Promise<FigureAccessInfo> {
  try {
    logger.debug('[FigureRepository] Creating project figure', {
      projectId: data.projectId,
      fileName: data.fileName,
      tenantId,
    });

    // Verify project belongs to tenant and user has access
    const project = await prisma!.project.findFirst({
      where: {
        id: data.projectId,
        tenantId: tenantId,
        userId: data.uploadedBy, // Only project owner can upload
      },
      select: { id: true, tenantId: true },
    });

    if (!project) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Project not found or access denied'
      );
    }

    // Check if there's an existing PENDING figure with the same figureKey
    let figure: any;

    if (data.figureKey) {
      const existingPendingFigure = await prisma!.projectFigure.findFirst({
        where: {
          projectId: data.projectId,
          figureKey: data.figureKey,
          status: 'PENDING',
          deletedAt: null,
        } as any, // Type assertion to handle Prisma type issue
      });

      if (existingPendingFigure) {
        // Update the existing PENDING figure instead of creating a new one
        logger.info('[FigureRepository] Updating existing PENDING figure', {
          figureId: existingPendingFigure.id,
          figureKey: data.figureKey,
          projectId: data.projectId,
        });

        figure = (await prisma!.projectFigure.update({
          where: { id: existingPendingFigure.id },
          data: {
            fileName: data.fileName,
            originalName: data.originalName,
            blobName: data.blobName,
            mimeType: data.mimeType,
            sizeBytes: data.sizeBytes,
            description: data.description || existingPendingFigure.description,
            uploadedBy: data.uploadedBy,
            status: 'ASSIGNED', // Direct upload to carousel should go to ASSIGNED
            updatedAt: new Date(),
          } as any,
        })) as any;
      }
    }

    // If no existing PENDING figure was found, create a new one
    if (!figure) {
      // Determine status based on whether figureKey is provided
      // If figureKey is provided, this is a direct carousel upload -> ASSIGNED
      // If no figureKey, this is an unassigned upload -> UPLOADED
      const status = data.figureKey ? 'ASSIGNED' : 'UPLOADED';

      figure = (await prisma!.projectFigure.create({
        data: {
          ...data,
          status: status,
        } as any,
      })) as any;

      logger.info('[FigureRepository] New figure created successfully', {
        figureId: figure.id,
        projectId: data.projectId,
        fileName: data.fileName,
        status: status,
        figureKey: data.figureKey,
      });
    }

    return {
      id: figure.id,
      projectId: figure.projectId,
      status: figure.status || (data.figureKey ? 'ASSIGNED' : 'UPLOADED'), // Include status in return
      fileName: figure.fileName,
      blobName: figure.blobName,
      mimeType: figure.mimeType,
      sizeBytes: figure.sizeBytes,
      figureKey: figure.figureKey ?? undefined,
      description: figure.description ?? undefined,
      uploadedBy: figure.uploadedBy,
      createdAt: figure.createdAt,
    };
  } catch (error) {
    logger.error('[FigureRepository] Failed to create figure', {
      projectId: data.projectId,
      error,
    });
    throw error;
  }
}

/**
 * Securely retrieves figure with access control
 */
export async function getProjectFigure(
  figureId: string,
  userId: string,
  tenantId: string
): Promise<FigureAccessInfo | null> {
  try {
    logger.debug('[FigureRepository] Getting project figure', {
      figureId,
      userId,
      tenantId,
    });

    const figure = await prisma!.projectFigure.findFirst({
      where: {
        id: figureId,
        deletedAt: null,
        project: {
          tenantId: tenantId,
          userId: userId, // Only project owner can access
        },
      },
    });

    if (!figure) {
      logger.warn('[FigureRepository] Figure not found or access denied', {
        figureId,
        userId,
        tenantId,
      });
      return null;
    }

    logger.debug('[FigureRepository] Figure retrieved successfully', {
      figureId,
      userId,
    });

    return {
      id: figure.id,
      projectId: figure.projectId,
      status: (figure as any).status || 'UPLOADED', // Include status with fallback
      fileName: figure.fileName || '',
      blobName: figure.blobName || '',
      mimeType: figure.mimeType || '',
      sizeBytes: figure.sizeBytes || 0,
      figureKey: figure.figureKey ?? undefined,
      description: figure.description ?? undefined,
      uploadedBy: figure.uploadedBy,
      createdAt: figure.createdAt,
    };
  } catch (error) {
    logger.error('[FigureRepository] Failed to get figure', {
      figureId,
      error,
    });
    throw error;
  }
}

/**
 * Lists all figures for a project with access control
 */
export async function listProjectFigures(
  projectId: string,
  userId: string,
  tenantId: string
): Promise<FigureAccessInfo[]> {
  try {
    logger.debug('[FigureRepository] Listing project figures', {
      projectId,
      userId,
      tenantId,
    });

    const figures = (await prisma!.projectFigure.findMany({
      where: {
        projectId,
        deletedAt: null,
        project: {
          tenantId: tenantId,
          userId: userId, // Only project owner can list
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })) as any[]; // Cast to any[] to access status field

    logger.debug('[FigureRepository] Found figures for project', {
      projectId,
      count: figures.length,
    });

    // For display purposes, we want to show:
    // 1. All PENDING figures (these are figure slots without images)
    // 2. All ASSIGNED figures (these have images and figureKeys)
    // 3. UPLOADED figures that don't have a figureKey (unassigned uploads)
    // We DON'T want to show UPLOADED figures that are just the source for ASSIGNED figures

    const filteredFigures = figures.filter(figure => {
      const status = (figure as any).status;

      // Always include PENDING and ASSIGNED figures
      if (status === 'PENDING' || status === 'ASSIGNED') {
        return true;
      }

      // For UPLOADED figures, only include if they don't have a figureKey
      // (i.e., they haven't been assigned anywhere)
      if (status === 'UPLOADED' && !figure.figureKey) {
        return true;
      }

      return false;
    });

    logger.debug('[FigureRepository] Filtered figures for display', {
      projectId,
      totalFigures: figures.length,
      displayedFigures: filteredFigures.length,
      figureDetails: filteredFigures.map(f => ({
        id: f.id,
        status: f.status,
        figureKey: f.figureKey,
        blobName: f.blobName,
      })),
    });

    return filteredFigures.map(figure => ({
      id: figure.id,
      projectId: figure.projectId,
      status: (figure as any).status || 'UPLOADED', // Use actual status from database
      fileName: figure.fileName || '', // Provide default for null
      blobName: figure.blobName || '', // Provide default for null
      mimeType: figure.mimeType || 'image/png', // Provide default for null
      sizeBytes: figure.sizeBytes || 0, // Provide default for null
      figureKey: figure.figureKey ?? undefined,
      description: figure.description ?? undefined,
      uploadedBy: figure.uploadedBy,
      createdAt: figure.createdAt,
    }));
  } catch (error) {
    logger.error('[FigureRepository] Failed to list figures', {
      projectId,
      error,
    });
    throw error;
  }
}

/**
 * Securely deletes figure (soft delete for audit trail)
 */
export async function deleteProjectFigure(
  figureId: string,
  userId: string,
  tenantId: string
): Promise<boolean> {
  try {
    logger.debug('[FigureRepository] Deleting project figure', {
      figureId,
      userId,
      tenantId,
    });

    // Verify access before deletion
    const figure = await getProjectFigure(figureId, userId, tenantId);
    if (!figure) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Figure not found or access denied'
      );
    }

    // Soft delete
    await prisma!.projectFigure.update({
      where: { id: figureId },
      data: { deletedAt: new Date() },
    });

    logger.info('[FigureRepository] Figure deleted successfully', {
      figureId,
      userId,
    });

    return true;
  } catch (error) {
    logger.error('[FigureRepository] Failed to delete figure', {
      figureId,
      error,
    });
    throw error;
  }
}

/**
 * Securely updates figure metadata with access control
 */
export async function updateProjectFigure(
  figureId: string,
  updates: {
    figureKey?: string | null;
    description?: string;
    status?: string;
    fileName?: string;
    originalName?: string;
    blobName?: string;
    mimeType?: string;
    sizeBytes?: number;
  },
  userId: string,
  tenantId: string
): Promise<FigureAccessInfo | null> {
  try {
    logger.debug('[FigureRepository] Updating project figure', {
      figureId,
      updates,
      userId,
      tenantId,
    });

    // Verify access before update
    const existingFigure = await getProjectFigure(figureId, userId, tenantId);
    if (!existingFigure) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Figure not found or access denied'
      );
    }

    // Update figure record
    const updatedFigure = (await prisma!.projectFigure.update({
      where: { id: figureId },
      data: {
        ...updates,
        updatedAt: new Date(),
      } as any,
    })) as any;

    logger.info('[FigureRepository] Figure updated successfully', {
      figureId,
      updates,
      userId,
    });

    return {
      id: updatedFigure.id,
      projectId: updatedFigure.projectId,
      status: updatedFigure.status || 'UPLOADED',
      fileName: updatedFigure.fileName || '',
      blobName: updatedFigure.blobName || '',
      mimeType: updatedFigure.mimeType || '',
      sizeBytes: updatedFigure.sizeBytes || 0,
      figureKey: updatedFigure.figureKey ?? undefined,
      description: updatedFigure.description ?? undefined,
      uploadedBy: updatedFigure.uploadedBy,
      createdAt: updatedFigure.createdAt,
    };
  } catch (error) {
    logger.error('[FigureRepository] Failed to update figure', {
      figureId,
      updates,
      error,
    });
    throw error;
  }
}

/**
 * Lists all unassigned figures for a project (where figureKey is null)
 * These are figures that have been uploaded but not yet assigned to a specific figure slot
 */
export async function listUnassignedProjectFigures(
  projectId: string,
  userId: string,
  tenantId: string
): Promise<FigureAccessInfo[]> {
  try {
    logger.debug('[FigureRepository] Listing unassigned project figures', {
      projectId,
      userId,
      tenantId,
    });

    // First, get all ASSIGNED figures to find which blobNames are in use
    const assignedFigures = await prisma!.projectFigure.findMany({
      where: {
        projectId,
        status: 'ASSIGNED',
        deletedAt: null,
        blobName: { not: null },
      } as any,
      select: {
        blobName: true,
      },
    });

    const assignedBlobNames = new Set(
      assignedFigures.map(f => f.blobName).filter(Boolean)
    );

    const figures = await prisma!.projectFigure.findMany({
      where: {
        projectId,
        deletedAt: null,
        figureKey: null, // Only unassigned figures
        status: 'UPLOADED', // Only uploaded figures, not pending ones
        project: {
          tenantId: tenantId,
          userId: userId, // Only project owner can list
        },
      } as any,
      select: {
        id: true,
        projectId: true,
        fileName: true,
        blobName: true,
        mimeType: true,
        sizeBytes: true,
        figureKey: true,
        description: true,
        uploadedBy: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filter out figures whose blobName is currently assigned
    const unassignedFigures = figures.filter(
      figure => !assignedBlobNames.has(figure.blobName)
    );

    logger.debug('[FigureRepository] Found unassigned figures', {
      projectId,
      totalUploaded: figures.length,
      currentlyAssigned: assignedBlobNames.size,
      availableForAssignment: unassignedFigures.length,
    });

    return unassignedFigures.map(figure => ({
      id: figure.id,
      projectId: figure.projectId,
      status: 'UPLOADED', // Provide default status
      fileName: figure.fileName || '', // Provide default for null
      blobName: figure.blobName || '', // Provide default for null
      mimeType: figure.mimeType || 'image/png', // Provide default for null
      sizeBytes: figure.sizeBytes || 0, // Provide default for null
      figureKey: figure.figureKey ?? undefined,
      description: figure.description ?? undefined,
      uploadedBy: figure.uploadedBy,
      createdAt: figure.createdAt,
    }));
  } catch (error) {
    logger.error('[FigureRepository] Failed to list unassigned figures', {
      projectId,
      error,
    });
    throw error;
  }
}

/**
 * Assigns an uploaded figure to a pending figure slot
 * Transfers blob data from uploaded figure to pending figure and keeps the uploaded figure for future reassignment
 */
export async function assignFigureToSlot(
  uploadedFigureId: string,
  targetFigureKey: string,
  userId: string,
  tenantId: string
): Promise<FigureAccessInfo> {
  return await prisma!.$transaction(async tx => {
    logger.debug('[FigureRepository] Starting figure assignment', {
      uploadedFigureId,
      targetFigureKey,
      userId,
      tenantId,
    });

    // 1. Get the uploaded figure with access control
    const uploadedFigure = await tx.projectFigure.findFirst({
      where: {
        id: uploadedFigureId,
        deletedAt: null,
        project: {
          tenantId: tenantId,
          userId: userId,
        },
      },
    });

    if (!uploadedFigure) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Uploaded figure not found or access denied'
      );
    }

    // Verify it's actually an uploaded figure
    if (
      (uploadedFigure as any).status !== 'UPLOADED' ||
      uploadedFigure.figureKey
    ) {
      throw new ApplicationError(
        ErrorCode.INVALID_INPUT,
        'Figure is not in uploaded state or already assigned'
      );
    }

    // 2. Find the pending figure with the target figureKey
    const pendingFigure = await tx.projectFigure.findFirst({
      where: {
        projectId: uploadedFigure.projectId,
        figureKey: targetFigureKey,
        status: 'PENDING',
        deletedAt: null,
      } as any,
    });

    if (!pendingFigure) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        `No pending figure found with key ${targetFigureKey}`
      );
    }

    // Verify pending figure doesn't already have a blob
    if (pendingFigure.blobName) {
      throw new ApplicationError(
        ErrorCode.INVALID_INPUT,
        'Target figure already has an image assigned'
      );
    }

    logger.info('[FigureRepository] Assigning figure', {
      uploadedFigureId,
      pendingFigureId: pendingFigure.id,
      targetFigureKey,
      projectId: uploadedFigure.projectId,
      uploadedBlobName: uploadedFigure.blobName,
      uploadedFileName: uploadedFigure.fileName,
    });

    // 3. Update the pending figure with blob data from uploaded figure
    const updatedFigure = (await tx.projectFigure.update({
      where: { id: pendingFigure.id },
      data: {
        fileName: uploadedFigure.fileName,
        originalName: uploadedFigure.originalName,
        blobName: uploadedFigure.blobName,
        mimeType: uploadedFigure.mimeType,
        sizeBytes: uploadedFigure.sizeBytes,
        status: 'ASSIGNED',
        updatedAt: new Date(),
      } as any,
    })) as any;

    // 4. Keep the uploaded figure for potential future reassignment
    // Just log that we're keeping it
    logger.info(
      '[FigureRepository] Figure assignment completed, keeping uploaded figure for future use',
      {
        assignedFigureId: pendingFigure.id,
        uploadedFigureId: uploadedFigureId,
        targetFigureKey,
        blobName: uploadedFigure.blobName,
        assignedBlobName: updatedFigure.blobName,
      }
    );

    return {
      id: updatedFigure.id,
      projectId: updatedFigure.projectId,
      status: updatedFigure.status || 'ASSIGNED',
      fileName: updatedFigure.fileName || '',
      blobName: updatedFigure.blobName || '',
      mimeType: updatedFigure.mimeType || '',
      sizeBytes: updatedFigure.sizeBytes || 0,
      figureKey: updatedFigure.figureKey,
      description: updatedFigure.description ?? undefined,
      uploadedBy: updatedFigure.uploadedBy,
      createdAt: updatedFigure.createdAt,
    };
  });
}

/**
 * Unassigns a figure by removing its blob data and setting status back to PENDING
 * This keeps the figure slot with its metadata but removes the image
 */
export async function unassignFigure(
  figureId: string,
  userId: string,
  tenantId: string
): Promise<FigureAccessInfo> {
  return await prisma!.$transaction(async tx => {
    logger.debug('[FigureRepository] Unassigning figure', {
      figureId,
      userId,
      tenantId,
    });

    // Verify access before unassignment
    const existingFigure = await tx.projectFigure.findFirst({
      where: {
        id: figureId,
        deletedAt: null,
        project: {
          tenantId: tenantId,
          userId: userId,
        },
      },
    });

    if (!existingFigure) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Figure not found or access denied'
      );
    }

    // Verify it's actually an assigned figure with blob data
    if (
      !existingFigure.blobName ||
      (existingFigure as any).status === 'PENDING'
    ) {
      throw new ApplicationError(
        ErrorCode.INVALID_INPUT,
        'Figure does not have an image assigned or is already pending'
      );
    }

    // Only allow unassigning ASSIGNED figures, not UPLOADED ones
    if ((existingFigure as any).status !== 'ASSIGNED') {
      throw new ApplicationError(
        ErrorCode.INVALID_INPUT,
        'Only assigned figures can be unassigned. This figure has status: ' +
          (existingFigure as any).status
      );
    }

    // Check if there's already an UPLOADED figure with the same blobName
    // This would exist if the figure was assigned from the unassigned pool
    const existingUploadedFigure = await tx.projectFigure.findFirst({
      where: {
        projectId: existingFigure.projectId,
        blobName: existingFigure.blobName,
        status: 'UPLOADED',
        deletedAt: null,
      } as any,
    });

    if (!existingUploadedFigure) {
      // This was a direct upload to the carousel, so we need to create an UPLOADED record
      // to preserve the image data for potential reassignment
      logger.info(
        '[FigureRepository] Creating UPLOADED record for direct carousel upload',
        {
          figureId,
          blobName: existingFigure.blobName,
        }
      );

      await tx.projectFigure.create({
        data: {
          projectId: existingFigure.projectId,
          fileName: existingFigure.fileName,
          originalName: existingFigure.originalName,
          blobName: existingFigure.blobName,
          mimeType: existingFigure.mimeType,
          sizeBytes: existingFigure.sizeBytes,
          figureKey: null, // Unassigned figures don't have a figureKey
          description: null, // Don't copy the description
          uploadedBy: existingFigure.uploadedBy,
          status: 'UPLOADED',
        } as any,
      });
    }

    // Update figure to remove blob data and set to pending
    const updatedFigure = (await tx.projectFigure.update({
      where: { id: figureId },
      data: {
        // Remove blob-related fields
        blobName: null,
        fileName: null,
        originalName: null,
        mimeType: null,
        sizeBytes: null,
        // Keep figureKey and other metadata intact
        status: 'PENDING',
        updatedAt: new Date(),
      } as any,
    })) as any;

    logger.info('[FigureRepository] Figure unassigned successfully', {
      figureId,
      figureKey: existingFigure.figureKey,
      previousBlobName: existingFigure.blobName,
      createdUploadedRecord: !existingUploadedFigure,
      userId,
    });

    return {
      id: updatedFigure.id,
      projectId: updatedFigure.projectId,
      status: updatedFigure.status || 'PENDING',
      fileName: updatedFigure.fileName || '',
      blobName: updatedFigure.blobName || '',
      mimeType: updatedFigure.mimeType || '',
      sizeBytes: updatedFigure.sizeBytes || 0,
      figureKey: updatedFigure.figureKey ?? undefined,
      description: updatedFigure.description ?? undefined,
      uploadedBy: updatedFigure.uploadedBy,
      createdAt: updatedFigure.createdAt,
    };
  });
}

/**
 * Repository for handling figure and element-related database operations
 * Provides clean, normalized access to figure data
 */
export const figureRepository = {
  /**
   * Get all figures for a project with their associated elements
   */
  async getFiguresWithElements(projectId: string) {
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
        const status = (figure as any).status;

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
        status: (figure as any).status || 'UPLOADED', // Include status field
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
  },

  /**
   * Update a figure's metadata (title, description, displayOrder)
   */
  async updateFigureMetadata(
    figureId: string,
    data: {
      title?: string;
      description?: string;
      displayOrder?: number;
    }
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
  },

  /**
   * Get elements for a specific figure
   */
  async getElementsForFigure(figureId: string) {
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
  },

  /**
   * Add an element to a figure
   */
  async addElementToFigure(
    figureId: string,
    projectId: string,
    elementData: {
      elementKey: string;
      elementName: string;
      calloutDescription?: string;
    }
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
  },

  /**
   * Remove an element from a figure
   */
  async removeElementFromFigure(figureId: string, elementKey: string) {
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
  },

  /**
   * Update an element's callout description for a specific figure
   */
  async updateElementCallout(
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
  },

  /**
   * Get all elements for a project
   */
  async getProjectElements(projectId: string) {
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
  },

  /**
   * Update an element's name globally across all figures
   */
  async updateElementName(
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
  },
};

import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import type { ProjectFigure } from '@prisma/client';
import type {
  FigureUploadData,
  FigureAccessInfo,
  FigureUpdateData,
} from '@/types/figure';

/**
 * Core figure CRUD operations
 * Handles basic create, read, update, delete, and list operations
 */

/**
 * Securely stores figure metadata in database with proper tenant isolation
 */
export async function createProjectFigure(
  data: FigureUploadData,
  tenantId: string
): Promise<FigureAccessInfo> {
  try {
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database connection not available'
      );
    }

    logger.debug('[FigureRepository] Creating new project figure', {
      projectId: data.projectId,
      fileName: data.fileName,
      figureKey: data.figureKey,
      tenantId,
    });

    // Verify project belongs to tenant and user has access
    const project = await prisma.project.findFirst({
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
    let figure: ProjectFigure | null = null;

    if (data.figureKey) {
      const existingPendingFigure = await prisma.projectFigure.findFirst({
        where: {
          projectId: data.projectId,
          figureKey: data.figureKey,
          status: 'PENDING',
          deletedAt: null,
        },
      });

      if (existingPendingFigure) {
        // Update the existing PENDING figure instead of creating a new one
        logger.info('[FigureRepository] Updating existing PENDING figure', {
          figureId: existingPendingFigure.id,
          figureKey: data.figureKey,
          projectId: data.projectId,
        });

        figure = await prisma.projectFigure.update({
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
          },
        });
      }
    }

    // If no existing PENDING figure was found, create a new one
    if (!figure) {
      // Determine status based on whether figureKey is provided
      // If figureKey is provided, this is a direct carousel upload -> ASSIGNED
      // If no figureKey, this is an unassigned upload -> UPLOADED
      const status = data.figureKey ? 'ASSIGNED' : 'UPLOADED';

      figure = await prisma.projectFigure.create({
        data: {
          fileName: data.fileName,
          originalName: data.originalName,
          blobName: data.blobName,
          mimeType: data.mimeType,
          sizeBytes: data.sizeBytes,
          figureKey: data.figureKey,
          description: data.description,
          status: status,
          project: {
            connect: { id: data.projectId },
          },
          uploader: {
            connect: { id: data.uploadedBy },
          },
        },
      });

      logger.info('[FigureRepository] New figure created successfully', {
        figureId: figure.id,
        projectId: data.projectId,
        fileName: data.fileName,
        status: status,
        figureKey: data.figureKey,
      });
    }

    if (!figure) {
      throw new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        'Failed to create or update figure'
      );
    }

    return {
      id: figure.id,
      projectId: figure.projectId,
      status: figure.status || (data.figureKey ? 'ASSIGNED' : 'UPLOADED'), // Include status in return
      fileName: figure.fileName || '',
      blobName: figure.blobName || '',
      mimeType: figure.mimeType || 'image/png',
      sizeBytes: figure.sizeBytes || 0,
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

    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database connection not available'
      );
    }

    const figure = await prisma.projectFigure.findFirst({
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
      status: figure.status || 'UPLOADED', // Include status with fallback
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

    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database connection not available'
      );
    }

    const figures = await prisma.projectFigure.findMany({
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
    });

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
      const status = figure.status;

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
      status: figure.status || 'UPLOADED', // Use actual status from database
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
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database connection not available'
      );
    }

    await prisma.projectFigure.update({
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
  updates: FigureUpdateData,
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

    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database connection not available'
      );
    }

    // Update figure record
    const updatedFigure = await prisma.projectFigure.update({
      where: { id: figureId },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });

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

    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database connection not available'
      );
    }

    // First, get all ASSIGNED figures to find which blobNames are in use
    const assignedFigures = await prisma.projectFigure.findMany({
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

    const figures = await prisma.projectFigure.findMany({
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

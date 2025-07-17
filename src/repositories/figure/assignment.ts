import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import type { FigureAccessInfo, FigureAssignment } from '@/types/figure';
import { getProjectFigure } from './core';

/**
 * Figure assignment operations
 * Handles assigning/unassigning figures to slots
 */

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
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database connection not available'
    );
  }

  return await prisma.$transaction(async tx => {
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
 * Bulk assigns uploaded figures to pending figure slots during invention processing
 * Follows the same pattern as assignFigureToSlot but optimized for multiple assignments
 */
export async function bulkAssignFiguresToSlots(
  assignments: FigureAssignment[],
  userId: string,
  tenantId: string,
  projectId: string
): Promise<FigureAccessInfo[]> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database connection not available'
    );
  }

  return await prisma.$transaction(async tx => {
    logger.debug('[FigureRepository] Starting bulk figure assignment', {
      assignmentCount: assignments.length,
      projectId,
      userId,
      tenantId,
    });

    const results: FigureAccessInfo[] = [];

    for (const assignment of assignments) {
      const { uploadedFigureId, targetFigureKey } = assignment;

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
        logger.warn(
          '[FigureRepository] Uploaded figure not found during bulk assignment',
          {
            uploadedFigureId,
            targetFigureKey,
          }
        );
        continue; // Skip this assignment but continue with others
      }

      // Verify it's actually an uploaded figure
      if (
        (uploadedFigure as any).status !== 'UPLOADED' ||
        uploadedFigure.figureKey
      ) {
        logger.warn(
          '[FigureRepository] Figure is not in uploaded state during bulk assignment',
          {
            uploadedFigureId,
            status: (uploadedFigure as any).status,
            figureKey: uploadedFigure.figureKey,
          }
        );
        continue; // Skip this assignment but continue with others
      }

      // 2. Find or create the pending figure with the target figureKey
      let pendingFigure = await tx.projectFigure.findFirst({
        where: {
          projectId: uploadedFigure.projectId,
          figureKey: targetFigureKey,
          status: 'PENDING',
          deletedAt: null,
        } as any,
      });

      // If no pending figure exists, create one (this happens during invention processing)
      if (!pendingFigure) {
        pendingFigure = await tx.projectFigure.create({
          data: {
            projectId: uploadedFigure.projectId,
            figureKey: targetFigureKey,
            title: `Figure ${targetFigureKey}`,
            description: '',
            displayOrder: 0,
            status: 'PENDING',
            uploadedBy: userId,
          } as any,
        });

        logger.debug(
          '[FigureRepository] Created pending figure for bulk assignment',
          {
            pendingFigureId: pendingFigure.id,
            targetFigureKey,
            projectId: uploadedFigure.projectId,
          }
        );
      }

      // Verify pending figure doesn't already have a blob
      if (pendingFigure.blobName) {
        logger.warn(
          '[FigureRepository] Target figure already has image during bulk assignment',
          {
            pendingFigureId: pendingFigure.id,
            targetFigureKey,
          }
        );
        continue; // Skip this assignment but continue with others
      }

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

      logger.info('[FigureRepository] Bulk assigned figure to slot', {
        uploadedFigureId,
        assignedFigureId: pendingFigure.id,
        targetFigureKey,
        projectId: uploadedFigure.projectId,
        blobName: uploadedFigure.blobName,
      });

      results.push({
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
      });
    }

    logger.info('[FigureRepository] Bulk figure assignment completed', {
      totalAssignments: assignments.length,
      successfulAssignments: results.length,
      projectId,
    });

    return results;
  });
}

/**
 * Unassigns a figure by removing its blob data and setting status back to PENDING
 * This keeps the figure slot with its metadata but removes the image
 * Returns information about the UPLOADED record created for potential reassignment
 */
export async function unassignFigure(
  figureId: string,
  userId: string,
  tenantId: string
): Promise<FigureAccessInfo & { uploadedRecordId?: string }> {
  try {
    logger.debug('[FigureRepository] Attempting to unassign figure', {
      figureId,
      userId,
      tenantId,
    });

    // Verify access before unassignment
    const figure = await getProjectFigure(figureId, userId, tenantId);
    if (!figure) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Figure not found or access denied'
      );
    }
  } catch (error) {
    logger.error('[FigureRepository] Failed to unassign figure', {
      figureId,
      error,
    });
    throw error;
  }

  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database connection not available'
    );
  }

  return await prisma.$transaction(async tx => {
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
    if (!existingFigure.blobName || existingFigure.status === 'PENDING') {
      throw new ApplicationError(
        ErrorCode.INVALID_INPUT,
        'Figure does not have an image assigned or is already pending'
      );
    }

    // Only allow unassigning ASSIGNED figures, not UPLOADED ones
    if (existingFigure.status !== 'ASSIGNED') {
      throw new ApplicationError(
        ErrorCode.INVALID_INPUT,
        'Only assigned figures can be unassigned. This figure has status: ' +
          existingFigure.status
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
      },
    });

    let uploadedRecordId: string | undefined;

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

      const uploadedRecord = await tx.projectFigure.create({
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
        },
      });
      
      uploadedRecordId = uploadedRecord.id;
    } else {
      uploadedRecordId = existingUploadedFigure.id;
    }

    // Update figure to remove blob data and set to pending
    const updatedFigure = await tx.projectFigure.update({
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
      },
    });

    logger.info('[FigureRepository] Figure unassigned successfully', {
      figureId,
      figureKey: existingFigure.figureKey,
      previousBlobName: existingFigure.blobName,
      createdUploadedRecord: !existingUploadedFigure,
      uploadedRecordId,
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
      uploadedRecordId, // Include the ID of the UPLOADED record for reassignment
    };
  });
}

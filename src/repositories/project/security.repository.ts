import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { logger } from '@/lib/monitoring/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { basicProjectSelect, ProjectBasicInfo } from './types';

/**
 * Securely updates a project, ensuring it belongs to the specified tenant.
 * @param projectId The ID of the project to update.
 * @param tenantId The ID of the tenant this project must belong to.
 * @param userId The ID of the user performing the update (used for logging/auditing, or future stricter ownership checks).
 * @param updateData The data to update the project with.
 * @returns A promise resolving to the updated project (basic info) or null if not found or not authorized.
 */
export async function secureUpdateProject(
  projectId: string,
  tenantId: string,
  userId: string, // Included for logging/auditing, or future stricter checks
  updateData: Prisma.ProjectUpdateInput
): Promise<ProjectBasicInfo | null> {
  // First, verify the project exists and belongs to the tenant AND the user.
  const projectToUpdate = await prisma!.project.findFirst({
    where: {
      id: projectId,
      tenantId: tenantId,
      // Enforce that only the project owner can update it.
      userId: userId,
    },
    select: {
      id: true,
      name: true,
      status: true,
      userId: true,
      tenantId: true,
      createdAt: true,
      updatedAt: true,
      textInput: true,
    },
  });

  if (!projectToUpdate) {
    logger.warn(
      `[secureUpdateProject] Project not found or user not authorized. ProjectID: ${projectId}, TenantID: ${tenantId}, UserID: ${userId}`
    );
    // Throw an error instead of returning null for better error handling.
    throw new ApplicationError(
      ErrorCode.PROJECT_ACCESS_DENIED,
      'Project not found or you do not have permission to update it.'
    );
  }

  return prisma!.project.update({
    where: { id: projectId }, // ID is unique, authorization already checked
    data: updateData,
    select: basicProjectSelect,
  });
}

/**
 * Securely deletes a project, ensuring it belongs to the specified tenant.
 * @param projectId The ID of the project to delete.
 * @param tenantId The ID of the tenant this project must belong to.
 * @param userId The ID of the user performing the deletion (used for logging/auditing, or future stricter ownership checks).
 * @returns A promise resolving to true if deletion was successful (after authorization), false otherwise.
 */
export async function secureDeleteProject(
  projectId: string,
  tenantId: string,
  userId: string // Included for logging/auditing or future stricter checks
): Promise<boolean> {
  // First, verify the project exists and belongs to the tenant AND the user.
  const projectToDelete = await prisma!.project.findFirst({
    where: {
      id: projectId,
      tenantId: tenantId,
      // Enforce that only the project owner can delete it.
      userId: userId,
    },
    select: { id: true }, // We only need to know if it exists and is authorized for this tenant
  });

  if (!projectToDelete) {
    logger.warn(
      `[secureDeleteProject] Project not found or user not authorized for deletion. ProjectID: ${projectId}, TenantID: ${tenantId}, UserID: ${userId}`
    );
    // Throw an error for failed authorization/not found, instead of returning false.
    throw new ApplicationError(
      ErrorCode.PROJECT_ACCESS_DENIED,
      'Project not found or you do not have permission to delete it.'
    );
  }

  // If authorized, proceed with a SOFT deletion to maintain consistency.
  await prisma!.project.update({
    where: { id: projectId }, // ID is unique, authorization for tenant/user already checked
    data: { deletedAt: new Date() },
  });

  logger.info(
    `[secureDeleteProject] Project soft-deleted successfully. ProjectID: ${projectId}, TenantID: ${tenantId}, UserID: ${userId}`
  );
  return true;
}

/**
 * Get project tenant ID for authorization purposes
 * @param projectId The ID of the project
 * @returns Project with tenant ID or null if not found
 */
export async function getProjectTenantId(
  projectId: string
): Promise<{ tenantId: string } | null> {
  try {
    logger.debug(`Repository: Getting tenant ID for project: ${projectId}`);

    const project = await prisma!.project.findUnique({
      where: { id: projectId },
      select: { tenantId: true },
    });

    if (!project) {
      logger.debug(
        `Repository: Project not found for tenant ID lookup: ${projectId}`
      );
      return null;
    }

    logger.debug(`Repository: Found tenant ID for project: ${projectId}`);
    return project;
  } catch (error) {
    logger.error(
      `[ProjectSecurity] Error finding tenant for project ${projectId}`,
      { error }
    );
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to find tenant for project ${projectId}`
    );
  }
}

/**
 * Find project by ID for basic access check
 * @param projectId The ID of the project
 * @returns Project with basic info or null if not found
 */
export async function findProjectForAccess(projectId: string): Promise<{
  id: string;
  userId: string;
  tenantId: string;
} | null> {
  try {
    logger.debug(`Repository: Finding project for access check: ${projectId}`);

    const project = await prisma!.project.findFirst({
      where: { id: projectId },
      select: {
        id: true,
        userId: true,
        tenantId: true,
      },
    });

    if (!project) {
      logger.debug(
        `Repository: Project not found for access check: ${projectId}`
      );
      return null;
    }

    logger.debug(`Repository: Found project for access check: ${projectId}`);
    return project;
  } catch (error) {
    logger.error('Failed to find project for access check', {
      error,
      projectId,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to find project for access check: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

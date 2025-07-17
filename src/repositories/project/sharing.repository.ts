import { Prisma, ProjectCollaborator } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';

/**
 * Check if a user has access to a project (owner or collaborator)
 * @param projectId The ID of the project
 * @param userId The ID of the user
 * @param requiredRole Optional minimum role required (viewer, editor, admin)
 * @returns True if user has access with the required role
 */
export async function checkProjectAccess(
  projectId: string,
  userId: string,
  requiredRole?: 'viewer' | 'editor' | 'admin'
): Promise<boolean> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    // Role hierarchy: admin > editor > viewer
    const roleHierarchy = (role: string): string[] => {
      switch (role) {
        case 'viewer':
          return ['viewer', 'editor', 'admin'];
        case 'editor':
          return ['editor', 'admin'];
        case 'admin':
          return ['admin'];
        default:
          return ['viewer', 'editor', 'admin'];
      }
    };

    const access = await prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
        OR: [
          { userId: userId }, // Owner has full access
          {
            collaborators: {
              some: {
                userId: userId,
                ...(requiredRole && {
                  role: { in: roleHierarchy(requiredRole) },
                }),
              },
            },
          },
        ],
      },
    });

    return !!access;
  } catch (error) {
    logger.error('Error checking project access', {
      error,
      projectId,
      userId,
      requiredRole,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to check project access: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get all collaborators for a project
 * @param projectId The ID of the project
 * @returns Array of collaborators with user details
 */
export async function getProjectCollaborators(projectId: string): Promise<
  (ProjectCollaborator & {
    user: { id: string; email: string; name: string | null };
    inviter: { id: string; email: string; name: string | null };
  })[]
> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    return await prisma.projectCollaborator.findMany({
      where: { projectId },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        inviter: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  } catch (error) {
    logger.error('Error getting project collaborators', {
      error,
      projectId,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to get project collaborators: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Add a collaborator to a project
 * @param projectId The ID of the project
 * @param userId The ID of the user to add as collaborator
 * @param invitedBy The ID of the user sending the invitation
 * @param role The role to assign (viewer, editor, admin)
 * @returns The created collaborator record
 */
export async function addProjectCollaborator(
  projectId: string,
  userId: string,
  invitedBy: string,
  role: 'viewer' | 'editor' | 'admin' = 'viewer'
): Promise<ProjectCollaborator> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    // Verify the inviter has access to the project
    const hasAccess = await checkProjectAccess(projectId, invitedBy, 'admin');
    if (!hasAccess) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'You do not have permission to share this project'
      );
    }

    // Verify both users are in the same tenant as the project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { tenantId: true, userId: true },
    });

    if (!project) {
      throw new ApplicationError(
        ErrorCode.PROJECT_NOT_FOUND,
        'Project not found'
      );
    }

    // Check if user is already the owner
    if (project.userId === userId) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_FAILED,
        'Cannot add project owner as collaborator'
      );
    }

    // Verify the user to be added is in the same tenant
    const userTenant = await prisma.userTenant.findFirst({
      where: {
        userId: userId,
        tenantId: project.tenantId,
      },
    });

    if (!userTenant) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_FAILED,
        'User is not in the same tenant as the project'
      );
    }

    // Create the collaborator record
    return await prisma.projectCollaborator.create({
      data: {
        projectId,
        userId,
        invitedBy,
        role,
      },
    });
  } catch (error) {
    if (error instanceof ApplicationError) {
      throw error;
    }

    // Handle unique constraint violation
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ApplicationError(
        ErrorCode.DB_DUPLICATE_ENTRY,
        'User is already a collaborator on this project'
      );
    }

    logger.error('Error adding project collaborator', {
      error,
      projectId,
      userId,
      invitedBy,
      role,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to add project collaborator: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Remove a collaborator from a project
 * @param projectId The ID of the project
 * @param userId The ID of the user to remove
 * @param removedBy The ID of the user removing the collaborator
 * @returns True if removed successfully
 */
export async function removeProjectCollaborator(
  projectId: string,
  userId: string,
  removedBy: string
): Promise<boolean> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    // Verify the remover has admin access or is removing themselves
    const hasAdminAccess = await checkProjectAccess(
      projectId,
      removedBy,
      'admin'
    );
    if (!hasAdminAccess && removedBy !== userId) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'You do not have permission to remove collaborators from this project'
      );
    }

    const result = await prisma.projectCollaborator.deleteMany({
      where: {
        projectId,
        userId,
      },
    });

    return result.count > 0;
  } catch (error) {
    if (error instanceof ApplicationError) {
      throw error;
    }

    logger.error('Error removing project collaborator', {
      error,
      projectId,
      userId,
      removedBy,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to remove project collaborator: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Update a collaborator's role
 * @param projectId The ID of the project
 * @param userId The ID of the collaborator
 * @param newRole The new role to assign
 * @param updatedBy The ID of the user updating the role
 * @returns The updated collaborator record
 */
export async function updateCollaboratorRole(
  projectId: string,
  userId: string,
  newRole: 'viewer' | 'editor' | 'admin',
  updatedBy: string
): Promise<ProjectCollaborator> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    // Verify the updater has admin access
    const hasAdminAccess = await checkProjectAccess(
      projectId,
      updatedBy,
      'admin'
    );
    if (!hasAdminAccess) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'You do not have permission to update collaborator roles'
      );
    }

    return await prisma.projectCollaborator.update({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      data: { role: newRole },
    });
  } catch (error) {
    if (error instanceof ApplicationError) {
      throw error;
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'Collaborator not found'
      );
    }

    logger.error('Error updating collaborator role', {
      error,
      projectId,
      userId,
      newRole,
      updatedBy,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to update collaborator role: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get the role of a user for a specific project
 * @param projectId The ID of the project
 * @param userId The ID of the user
 * @returns The user's role ('owner', 'admin', 'editor', 'viewer') or null if no access
 */
export async function getUserProjectRole(
  projectId: string,
  userId: string
): Promise<'owner' | 'admin' | 'editor' | 'viewer' | null> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    // Check if user is the owner
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: userId,
        deletedAt: null,
      },
    });

    if (project) {
      return 'owner';
    }

    // Check collaborator role
    const collaborator = await prisma.projectCollaborator.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (collaborator) {
      return collaborator.role as 'admin' | 'editor' | 'viewer';
    }

    return null;
  } catch (error) {
    logger.error('Error getting user project role', {
      error,
      projectId,
      userId,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to get user project role: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import {
  addProjectCollaborator,
  removeProjectCollaborator,
  updateCollaboratorRole,
  getProjectCollaborators,
  getUserProjectRole,
  checkProjectAccess,
} from '@/repositories/project/sharing.repository';
import { AuditService } from './audit.server-service';
import { AuthenticatedRequest } from '@/types/middleware';

export interface ShareProjectParams {
  projectId: string;
  userEmail: string;
  role: 'viewer' | 'editor' | 'admin';
}

export interface UpdateCollaboratorParams {
  projectId: string;
  userId: string;
  role: 'viewer' | 'editor' | 'admin';
}

/**
 * Service layer for project sharing functionality
 * Handles business logic, validation, and orchestration of project sharing
 */
export class ProjectSharingService {
  /**
   * Share a project with a user
   */
  static async shareProject(
    params: ShareProjectParams,
    inviterId: string,
    req: AuthenticatedRequest
  ) {
    try {
      // Validate that the inviter has permission to share the project
      const inviterRole = await getUserProjectRole(params.projectId, inviterId);
      if (
        !inviterRole ||
        (inviterRole !== 'admin' && inviterRole !== 'editor')
      ) {
        throw new ApplicationError(
          ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
          'Insufficient permissions to share project'
        );
      }

      // Check if user is already a collaborator
      const existingRole = await getUserProjectRole(
        params.projectId,
        params.userEmail
      );
      if (existingRole) {
        throw new ApplicationError(
          ErrorCode.DB_DUPLICATE_ENTRY,
          'User is already a collaborator on this project'
        );
      }

      // Add the collaborator
      const collaborator = await addProjectCollaborator(
        params.projectId,
        params.userEmail,
        inviterId,
        params.role
      );

      // Log the action
      await AuditService.logProjectAction(req, 'update', params.projectId, {
        action: 'share_project',
        collaborator_email: params.userEmail,
        role: params.role,
        invited_by: inviterId,
      });

      logger.info('Project shared successfully', {
        projectId: params.projectId,
        userEmail: params.userEmail,
        role: params.role,
        inviterId,
      });

      return collaborator;
    } catch (error) {
      logger.error('Failed to share project', {
        projectId: params.projectId,
        userEmail: params.userEmail,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Remove a collaborator from a project
   */
  static async removeCollaborator(
    projectId: string,
    userId: string,
    removedBy: string,
    req: AuthenticatedRequest
  ): Promise<boolean> {
    try {
      // Validate that the user removing has permission
      const removerRole = await getUserProjectRole(projectId, removedBy);
      if (
        !removerRole ||
        (removerRole !== 'admin' && removerRole !== 'editor')
      ) {
        throw new ApplicationError(
          ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
          'Insufficient permissions to remove collaborator'
        );
      }

      // Cannot remove yourself unless you're the admin
      if (userId === removedBy && removerRole !== 'admin') {
        throw new ApplicationError(
          ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
          'Cannot remove yourself from project'
        );
      }

      // Remove the collaborator
      const removed = await removeProjectCollaborator(
        projectId,
        userId,
        removedBy
      );

      if (removed) {
        // Log the action
        await AuditService.logProjectAction(req, 'update', projectId, {
          action: 'remove_collaborator',
          removed_user_id: userId,
          removed_by: removedBy,
        });

        logger.info('Collaborator removed successfully', {
          projectId,
          userId,
          removedBy,
        });
      }

      return removed;
    } catch (error) {
      logger.error('Failed to remove collaborator', {
        projectId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Update a collaborator's role
   */
  static async updateCollaboratorRole(
    params: UpdateCollaboratorParams,
    updatedBy: string,
    req: AuthenticatedRequest
  ) {
    try {
      // Validate that the user updating has permission
      const updaterRole = await getUserProjectRole(params.projectId, updatedBy);
      if (!updaterRole || updaterRole !== 'admin') {
        throw new ApplicationError(
          ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
          'Only admins can update collaborator roles'
        );
      }

      // Update the role
      const updated = await updateCollaboratorRole(
        params.projectId,
        params.userId,
        params.role,
        updatedBy
      );

      // Log the action
      await AuditService.logProjectAction(req, 'update', params.projectId, {
        action: 'update_collaborator_role',
        user_id: params.userId,
        new_role: params.role,
        updated_by: updatedBy,
      });

      logger.info('Collaborator role updated successfully', {
        projectId: params.projectId,
        userId: params.userId,
        role: params.role,
        updatedBy,
      });

      return updated;
    } catch (error) {
      logger.error('Failed to update collaborator role', {
        projectId: params.projectId,
        userId: params.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get all collaborators for a project
   */
  static async getCollaborators(projectId: string, requesterId: string) {
    try {
      // Validate that the requester has access to the project
      const requesterRole = await getUserProjectRole(projectId, requesterId);
      if (!requesterRole) {
        throw new ApplicationError(
          ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
          'No access to project'
        );
      }

      const collaborators = await getProjectCollaborators(projectId);

      logger.info('Collaborators retrieved successfully', {
        projectId,
        requesterId,
        count: collaborators.length,
      });

      return collaborators;
    } catch (error) {
      logger.error('Failed to get collaborators', {
        projectId,
        requesterId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get user's role for a project
   */
  static async getUserRole(projectId: string, userId: string) {
    try {
      const role = await getUserProjectRole(projectId, userId);
      return role;
    } catch (error) {
      logger.error('Failed to get user role', {
        projectId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Check if user has access to a project
   */
  static async checkAccess(
    projectId: string,
    userId: string
  ): Promise<boolean> {
    try {
      return await checkProjectAccess(projectId, userId);
    } catch (error) {
      logger.error('Failed to check project access', {
        projectId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }
}

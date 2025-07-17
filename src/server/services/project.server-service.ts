/**
 * Backend Project Service
 *
 * Centralizes all project-related business logic and orchestration.
 * All methods require tenantId and userId for proper multi-tenant security.
 */

import { Prisma } from '@prisma/client';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import * as projectRepo from '@/repositories/project';
import {
  ProjectWithDetails,
  ProjectBasicInfo,
} from '@/repositories/project/types';
import { ProjectStatus } from '@/types/project';
import { InventionDataService } from './invention-data.server-service';
import { safeJsonParse } from '@/utils/jsonUtils';
import { OpenaiServerService } from './openai.server-service';
import { analyzeInventionPrompt } from '@/server/prompts/prompts/analyzeInvention';
import { InventionData } from '@/types/invention';
import { Invention } from '@prisma/client';
import { ProjectActivityService } from './project-activity.server-service';
import { PatentPromptSanitizer } from '@/utils/ai/promptSanitizer';

// DTOs for service layer
export interface CreateProjectDTO {
  name: string;
  status?: ProjectStatus;
  textInput?: string;
}

export interface UpdateProjectDTO {
  name?: string;
  status?: ProjectStatus;
  textInput?: string;
}

export interface ProjectFilterOptions {
  page: number;
  limit: number;
  search?: string;
  filterBy?: 'all' | 'recent' | 'complete' | 'in-progress' | 'draft';
  sortBy?: 'name' | 'created' | 'modified' | 'recent';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedProjectsResult {
  projects: ProjectBasicInfo[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class ProjectService {
  /**
   * Get all projects for a user within a tenant (owned and shared)
   */
  async getProjectsForUser(
    userId: string,
    tenantId: string,
    options?: {
      orderBy?: 'name' | 'updatedAt' | 'createdAt';
      order?: 'asc' | 'desc';
    }
  ): Promise<ProjectBasicInfo[]> {
    logger.info('Getting projects for user', { userId, tenantId });

    try {
      const orderBy = options?.orderBy || 'updatedAt';
      const order = options?.order || 'desc';

      // Use the new function that includes shared projects
      return await projectRepo.findAccessibleProjectsForUser(tenantId, userId, {
        orderBy: { [orderBy]: order },
      });
    } catch (error) {
      logger.error('Failed to get projects', { error, userId, tenantId });
      throw new ApplicationError(
        ErrorCode.DB_QUERY_ERROR,
        'Failed to get projects'
      );
    }
  }

  /**
   * Get paginated projects for a user within a tenant with filtering and sorting
   */
  async getProjectsForUserPaginated(
    userId: string,
    tenantId: string,
    options: ProjectFilterOptions
  ): Promise<PaginatedProjectsResult> {
    logger.debug('Getting paginated projects for user', {
      userId,
      tenantId,
      options,
    });

    try {
      const { page, limit, search, filterBy, sortBy, sortOrder } = options;
      const skip = (page - 1) * limit;

      // Map sortBy to actual database field
      const sortField =
        sortBy === 'modified' || sortBy === 'recent'
          ? 'updatedAt'
          : sortBy === 'created'
            ? 'createdAt'
            : sortBy === 'name'
              ? 'name'
              : 'updatedAt';

      // Call the repository with proper pagination parameters
      // Use the new function that includes shared projects
      const result = await projectRepo.findAccessibleProjectsForUserPaginated(
        tenantId,
        userId,
        {
          skip,
          take: limit,
          search,
          filterBy,
          orderBy: { [sortField]: sortOrder || 'desc' },
        }
      );

      // Enhance projects with comprehensive activity timestamps
      if (result.projects.length > 0) {
        try {
          const projectIds = result.projects.map(p => p.id);
          const activityMap = await ProjectActivityService.getLastActivityBatch(
            projectIds,
            tenantId
          );

          // Update each project with its comprehensive last activity
          result.projects.forEach(project => {
            const lastActivity = activityMap.get(project.id);
            if (lastActivity && lastActivity > project.updatedAt) {
              // Update the updatedAt to reflect true last activity
              project.updatedAt = lastActivity;
            }
          });

          // Re-sort if we're sorting by modified/recent
          if (sortBy === 'modified' || sortBy === 'recent') {
            result.projects.sort((a, b) => {
              const diff = b.updatedAt.getTime() - a.updatedAt.getTime();
              return sortOrder === 'asc' ? -diff : diff;
            });
          }
        } catch (error) {
          // Log but don't fail - fall back to basic timestamps
          logger.warn('Failed to enhance project activity timestamps', {
            error,
            projectCount: result.projects.length,
          });
        }
      }

      return {
        projects: result.projects,
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
        hasNextPage: page < Math.ceil(result.total / limit),
        hasPrevPage: page > 1,
      };
    } catch (error) {
      logger.error('Failed to get paginated projects', {
        error,
        userId,
        tenantId,
      });
      throw new ApplicationError(
        ErrorCode.DB_QUERY_ERROR,
        'Failed to get projects'
      );
    }
  }

  /**
   * Get a single project with full details
   */
  async getProjectById(
    projectId: string,
    userId: string,
    tenantId: string
  ): Promise<ProjectWithDetails | null> {
    logger.debug('Getting project by ID', { projectId, userId, tenantId });

    try {
      // First verify the project belongs to this tenant
      const project = await projectRepo.findProjectById(projectId, tenantId);

      if (!project) {
        return null;
      }

      // Verify user access (project owner or collaborator)
      const hasAccess = await projectRepo.checkUserProjectAccess(
        projectId,
        userId,
        tenantId
      );

      if (!hasAccess) {
        logger.warn('User attempted to access project without permission', {
          projectId,
          userId,
          projectOwnerId: project.userId,
        });
        throw new ApplicationError(ErrorCode.PROJECT_ACCESS_DENIED);
      }

      return project;
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      logger.error('Failed to get project', {
        error,
        projectId,
        userId,
        tenantId,
      });
      throw new ApplicationError(
        ErrorCode.DB_QUERY_ERROR,
        'Failed to get project'
      );
    }
  }

  /**
   * Create a new project with all required setup
   */
  async createProject(
    data: CreateProjectDTO,
    userId: string,
    tenantId: string
  ): Promise<ProjectBasicInfo> {
    logger.info('Creating project', {
      userId,
      tenantId,
      projectName: data.name,
    });

    try {
      // Use the repository function which handles the entire transaction
      const result = await projectRepo.createProject(
        {
          name: data.name,
          status: data.status || ('draft' as ProjectStatus),
          textInput: data.textInput || '',
        },
        userId,
        tenantId
      );

      logger.info('Project created successfully', {
        projectId: result.id,
        userId,
        tenantId,
      });
      return result;
    } catch (error) {
      logger.error('Failed to create project', { error, userId, tenantId });

      if (error instanceof ApplicationError) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ApplicationError(
            ErrorCode.DB_DUPLICATE_ENTRY,
            'A project with this name already exists'
          );
        }
      }

      throw new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        'Failed to create project'
      );
    }
  }

  /**
   * Processes a raw text invention disclosure, creates the invention data,
   * and links it to the project.
   */
  async processInventionDisclosure(
    projectId: string,
    textInput: string,
    userId: string,
    tenantId: string
  ): Promise<Invention> {
    logger.info('Processing invention disclosure via service', {
      projectId,
      userId,
      tenantId,
    });

    // Step 1: Sanitize the invention text using appropriate context for invention disclosures
    const sanitizedTextInput =
      PatentPromptSanitizer.sanitizeInventionDisclosure(textInput);

    logger.debug('Invention text sanitization', {
      originalLength: textInput.length,
      sanitizedLength: sanitizedTextInput.length,
      wasReduced: sanitizedTextInput.length < textInput.length,
    });

    // Step 2: Analyze the invention text using AI
    const prompt = analyzeInventionPrompt(sanitizedTextInput);
    const aiResponse = await OpenaiServerService.getChatCompletion({
      messages: [
        {
          role: 'system',
          content:
            'You are an expert patent attorney analyzing invention disclosures. Return only valid JSON without any markdown formatting or code blocks.',
        },
        { role: 'user', content: prompt },
      ],
      model: 'gpt-4.1',
      temperature: 0.1,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    // Step 3: Parse the response
    let inventionData: InventionData;
    try {
      let content = aiResponse.content.trim();
      if (content.startsWith('```json')) {
        content = content.slice(7);
      } else if (content.startsWith('```')) {
        content = content.slice(3);
      }
      if (content.endsWith('```')) {
        content = content.slice(0, -3);
      }
      inventionData = JSON.parse(content);
    } catch (error) {
      logger.error('Failed to parse AI response in service', {
        error,
        response: aiResponse.content,
      });
      throw new ApplicationError(
        ErrorCode.AI_INVALID_RESPONSE,
        'Failed to parse AI response'
      );
    }

    // Step 4: Use the InventionDataService to create the full invention record
    // This service should handle the transaction of creating the invention and its claims
    const inventionService = new InventionDataService();
    await inventionService.updateMultipleFields(projectId, inventionData);

    const fullProject = await this.getProjectById(projectId, userId, tenantId);
    if (!fullProject?.invention) {
      throw new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        'Failed to retrieve invention after processing'
      );
    }

    return fullProject.invention;
  }

  /**
   * Update an existing project
   */
  async updateProject(
    projectId: string,
    data: UpdateProjectDTO,
    userId: string,
    tenantId: string
  ): Promise<ProjectWithDetails> {
    logger.info('Updating project', { projectId, userId, tenantId });

    try {
      // Build update data
      const updateData: Prisma.ProjectUpdateInput = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.textInput !== undefined) updateData.textInput = data.textInput;

      // Use secure update which verifies tenant and user access
      const updated = await projectRepo.secureUpdateProject(
        projectId,
        tenantId,
        userId,
        updateData
      );

      if (!updated) {
        throw new ApplicationError(ErrorCode.PROJECT_NOT_FOUND);
      }

      logger.info('Project updated successfully', {
        projectId,
        userId,
        tenantId,
      });

      // Fetch the full project details to return
      const fullProject = await this.getProjectById(
        projectId,
        userId,
        tenantId
      );
      if (!fullProject) {
        // This case should be rare if the update succeeded, but it's a safeguard
        throw new ApplicationError(
          ErrorCode.PROJECT_NOT_FOUND,
          'Failed to retrieve project details after update.'
        );
      }
      return fullProject;
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      logger.error('Failed to update project', {
        error,
        projectId,
        userId,
        tenantId,
      });

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new ApplicationError(ErrorCode.PROJECT_NOT_FOUND);
        }
      }

      throw new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        'Failed to update project'
      );
    }
  }

  /**
   * Delete a project and all related data
   */
  async deleteProject(
    projectId: string,
    userId: string,
    tenantId: string
  ): Promise<void> {
    logger.info('Deleting project', { projectId, userId, tenantId });

    try {
      const deleted = await projectRepo.secureDeleteProject(
        projectId,
        tenantId,
        userId
      );

      if (!deleted) {
        throw new ApplicationError(ErrorCode.PROJECT_NOT_FOUND);
      }

      logger.info('Project deleted successfully', {
        projectId,
        userId,
        tenantId,
      });
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      logger.error('Failed to delete project', {
        error,
        projectId,
        userId,
        tenantId,
      });

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new ApplicationError(ErrorCode.PROJECT_NOT_FOUND);
        }
      }

      throw new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        'Failed to delete project'
      );
    }
  }

  /**
   * Get the most recent project for a user
   */
  async getMostRecentProject(
    userId: string,
    tenantId: string
  ): Promise<string | null> {
    logger.info('Getting most recent project', { userId, tenantId });

    try {
      return await projectRepo.findMostRecentProjectIdForTenantUser(
        userId,
        tenantId
      );
    } catch (error) {
      logger.error('Failed to get most recent project', {
        error,
        userId,
        tenantId,
      });
      throw new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        'Failed to get most recent project'
      );
    }
  }

  /**
   * Retrieves the tenant ID for a given project.
   * This is a utility method for middleware and other services.
   */
  async getTenantIdForProject(projectId: string): Promise<string | null> {
    logger.debug('[ProjectService] Getting tenant ID for project', {
      projectId,
    });
    try {
      const project = await projectRepo.getProjectTenantId(projectId);
      return project?.tenantId || null;
    } catch (error) {
      logger.error('[ProjectService] Failed to get tenant ID for project', {
        error,
        projectId,
      });
      // Do not throw a fatal error, as this is often used for checks.
      // The caller (e.g., tenantGuard) is responsible for handling a null return.
      return null;
    }
  }
}

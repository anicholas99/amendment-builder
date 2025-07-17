/**
 * Service layer for patent exclusions API operations.
 * Handles API calls and response validation for project exclusions.
 */
import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/utils/clientLogger';
import { z } from 'zod';
import { validateApiResponse } from '@/lib/validation/apiValidation';

// Response schemas updated to match the new standardized API format
const ProjectExclusionSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  patentNumber: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

// Updated to match the new standardized response format with "data" wrapper
const GetExclusionsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    exclusions: z.array(ProjectExclusionSchema),
    projectId: z.string(),
  }),
});

// Updated to match the actual POST API response format
const AddExclusionResponseSchema = z.object({
  message: z.string(),
  added: z.number(),
  skipped: z.number(),
});

// Updated to match the actual DELETE API response format
const RemoveExclusionResponseSchema = z.object({
  message: z.string(),
  success: z.boolean(),
});

// Types
export type ProjectExclusion = z.infer<typeof ProjectExclusionSchema>;
export type GetExclusionsResponse = z.infer<typeof GetExclusionsResponseSchema>;
export type AddExclusionResponse = z.infer<typeof AddExclusionResponseSchema>;
export type RemoveExclusionResponse = z.infer<
  typeof RemoveExclusionResponseSchema
>;

/**
 * Service class for patent exclusions operations
 */
export class PatentExclusionsService {
  /**
   * Get all exclusions for a project (optimized for UI display)
   */
  static async getProjectExclusions(
    projectId: string
  ): Promise<ProjectExclusion[]> {
    if (!projectId) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Project ID is required'
      );
    }

    try {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.EXCLUSIONS(projectId)
      );
      const data = await response.json();

      const validated = validateApiResponse(data, GetExclusionsResponseSchema);
      return validated.data.exclusions;
    } catch (error) {
      logger.error('Error fetching project exclusions', { error, projectId });
      throw error instanceof ApplicationError
        ? error
        : new ApplicationError(
            ErrorCode.API_NETWORK_ERROR,
            'Failed to fetch project exclusions'
          );
    }
  }

  /**
   * Add patent exclusions to a project
   */
  static async addProjectExclusion(
    projectId: string,
    patentNumbers: string[],
    metadata?: Record<string, unknown>
  ): Promise<AddExclusionResponse> {
    if (!projectId || !patentNumbers || patentNumbers.length === 0) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Project ID and patent numbers are required'
      );
    }

    try {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.EXCLUSIONS(projectId),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patentNumbers, metadata }),
        }
      );

      const data = await response.json();
      return validateApiResponse(data, AddExclusionResponseSchema);
    } catch (error) {
      logger.error('Error adding project exclusion', {
        error,
        projectId,
        patentNumbers,
      });
      throw error instanceof ApplicationError
        ? error
        : new ApplicationError(
            ErrorCode.API_NETWORK_ERROR,
            'Failed to add project exclusion'
          );
    }
  }

  /**
   * Remove a patent exclusion from a project
   */
  static async removeProjectExclusion(
    projectId: string,
    patentNumber: string
  ): Promise<RemoveExclusionResponse> {
    if (!projectId || !patentNumber) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Project ID and patent number are required'
      );
    }

    try {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.EXCLUSIONS(projectId),
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patentNumber }),
        }
      );

      const data = await response.json();
      return validateApiResponse(data, RemoveExclusionResponseSchema);
    } catch (error) {
      logger.error('Error removing project exclusion', {
        error,
        projectId,
        patentNumber,
      });
      throw error instanceof ApplicationError
        ? error
        : new ApplicationError(
            ErrorCode.API_NETWORK_ERROR,
            'Failed to remove project exclusion'
          );
    }
  }
}

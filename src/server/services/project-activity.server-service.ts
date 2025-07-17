import { logger } from '@/server/logger';
import { ProjectActivityRepository } from '@/repositories/projectActivityRepository';

/**
 * Service for calculating comprehensive project activity timestamps
 * Uses repository layer for all database access
 */
export class ProjectActivityService {
  /**
   * Gets the most recent activity timestamp across all project-related data
   * @param projectId The project ID
   * @param tenantId The tenant ID for security verification
   * @returns The most recent activity date or null
   */
  static async getLastActivity(
    projectId: string,
    tenantId: string
  ): Promise<Date | null> {
    try {
      return await ProjectActivityRepository.getLastActivity(
        projectId,
        tenantId
      );
    } catch (error) {
      logger.error('[ProjectActivityService] Failed to get last activity', {
        projectId,
        tenantId,
        error,
      });
      // Don't throw - fall back gracefully
      return null;
    }
  }

  /**
   * Gets last activity for multiple projects efficiently
   * @param projectIds Array of project IDs
   * @param tenantId The tenant ID for security verification
   * @returns Map of project ID to last activity date
   */
  static async getLastActivityBatch(
    projectIds: string[],
    tenantId: string
  ): Promise<Map<string, Date>> {
    try {
      return await ProjectActivityRepository.getLastActivityBatch(
        projectIds,
        tenantId
      );
    } catch (error) {
      logger.error('[ProjectActivityService] Failed to get batch activities', {
        projectIds,
        tenantId,
        error,
      });
      // Return empty map on error
      return new Map<string, Date>();
    }
  }
}

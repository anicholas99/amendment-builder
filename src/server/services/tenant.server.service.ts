import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/monitoring/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';

/**
 * Service for tenant-related operations on the server side.
 * This service is intended to be lean and focused on resolving tenant
 * information needed by other services or middleware.
 */
export class TenantServerService {
  /**
   * Retrieves the tenantId for a given projectId.
   * This is a crucial function for middleware like `withTenantGuard` to
   * resolve the tenant context before the main handler runs.
   * @param projectId The ID of the project.
   * @returns A promise that resolves to the tenantId, or null if not found.
   */
  static async getTenantIdForProject(
    projectId: string
  ): Promise<string | null> {
    if (!projectId) {
      logger.warn('getTenantIdForProject called with no projectId');
      return null;
    }

    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client is not initialized.'
      );
    }

    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { tenantId: true },
      });
      return project?.tenantId || null;
    } catch (error) {
      logger.error('Error fetching tenantId for project', {
        projectId,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      // Re-throwing as a controlled error might be an option in the future,
      // but for tenant resolution, failing silently (returning null) is often safer.
      throw new ApplicationError(
        ErrorCode.DB_QUERY_ERROR,
        'Failed to resolve tenant for project.'
      );
    }
  }
}

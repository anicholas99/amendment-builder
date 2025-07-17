import { prisma } from '../../lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';

/**
 * ADMIN ONLY: Get all projects across all tenants
 * This should only be used for administrative/debug purposes
 */
export async function getAllProjectsForAdmin() {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  logger.warn('[ADMIN] Getting all projects across all tenants');

  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        textInput: true,
        createdAt: true,
        updatedAt: true,
        tenantId: true,
      },
    });

    logger.info(`[ADMIN] Found ${projects.length} projects`);
    return projects;
  } catch (error) {
    logger.error('[ADMIN] Error getting all projects:', error);
    throw error;
  }
}

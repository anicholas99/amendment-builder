import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';

/**
 * Performs a simple query to check database connectivity.
 * @returns A promise that resolves to a boolean indicating connectivity.
 */
async function isConnected(): Promise<boolean> {
  if (!prisma) {
    logger.warn(
      'Health Repository: Cannot check connection, Prisma client is not available.'
    );
    return false;
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Health Repository: Database connection check failed.', {
      error,
    });
    return false;
  }
}

/**
 * Counts the number of tenants in the database.
 * @returns A promise that resolves to the number of tenants.
 */
async function getTenantCount(): Promise<number> {
  if (!prisma) {
    logger.warn(
      'Health Repository: Cannot get tenant count, Prisma client is not available.'
    );
    return 0;
  }
  try {
    return await prisma.tenant.count();
  } catch (error) {
    logger.error('Health Repository: Failed to get tenant count.', { error });
    return 0;
  }
}

export const healthRepository = {
  isConnected,
  getTenantCount,
};

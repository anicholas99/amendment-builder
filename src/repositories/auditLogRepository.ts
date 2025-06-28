import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/monitoring/logger';

// Re-defining necessary types here to avoid complex circular dependencies.
// In a larger refactor, these might move to a central types location.
interface AuditLogData {
  userId?: string;
  tenantId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  ipAddress?: string;
  userAgent?: string;
  metadata?: string | null;
  success?: boolean;
  errorMessage?: string;
  timestamp: Date;
}

interface AuditLogWhere {
  userId?: string;
  tenantId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  timestamp?: {
    gte?: Date;
    lte?: Date;
  };
}

/**
 * Creates a new audit log entry in the database.
 * @param data - The audit log data to create.
 */
async function create(data: AuditLogData) {
  if (!prisma) {
    logger.error(
      'Audit log repository cannot create: Prisma client not available'
    );
    return;
  }
  try {
    return await prisma.auditLog.create({
      data,
    });
  } catch (error) {
    logger.error('Failed to create audit log entry in repository', { error });
    // Do not re-throw, as audit logging should not break the application.
  }
}

/**
 * Finds multiple audit log entries based on a filter.
 * @param where - The filter conditions.
 * @param limit - The maximum number of records to return.
 * @returns A promise that resolves to an array of audit log entries.
 */
async function findMany({
  where,
  limit = 100,
}: {
  where: AuditLogWhere;
  limit?: number;
}) {
  if (!prisma) {
    logger.error(
      'Audit log repository cannot findMany: Prisma client not available'
    );
    return [];
  }
  try {
    return await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  } catch (error) {
    logger.error('Failed to query audit logs in repository', { error });
    return []; // Return empty on error
  }
}

export const auditLogRepository = {
  create,
  findMany,
};

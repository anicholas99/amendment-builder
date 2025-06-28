import { logger } from './logger';
import { auditLogRepository } from '@/repositories/auditLogRepository';

// Type for audit log data
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

// Type for audit log query result
interface AuditLogResult extends AuditLogData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Type definition for the Prisma client methods we use
interface AuditLogPrisma {
  auditLog: {
    create: (args: { data: AuditLogData }) => Promise<AuditLogResult>;
    findMany: (args: {
      where?: Record<string, unknown>;
      orderBy?: Record<string, 'asc' | 'desc'>;
      take?: number;
    }) => Promise<AuditLogResult[]>;
  };
}

// Temporarily use any until Prisma types are generated
let prisma: AuditLogPrisma | null = null;
try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient() as AuditLogPrisma;
} catch (error) {
  logger.warn('Prisma client not available, audit logging disabled');
}

export interface AuditLogEntry {
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
  metadata?: Record<string, unknown>;
  success?: boolean;
  errorMessage?: string;
}

/**
 * Persist audit log entry to database for SOC 2 compliance
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  await auditLogRepository.create({
    ...entry,
    metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
    timestamp: new Date(),
  });
}

/**
 * Audit a data access event
 */
export async function auditDataAccess(
  userId: string | undefined,
  tenantId: string | undefined,
  resourceType: string,
  resourceId: string,
  action: 'read' | 'create' | 'update' | 'delete',
  metadata?: Record<string, unknown>
): Promise<void> {
  await createAuditLog({
    userId,
    tenantId,
    action: `${resourceType}.${action}`,
    resourceType,
    resourceId,
    metadata,
    success: true,
  });
}

/**
 * Audit an authentication event
 */
export async function auditAuthEvent(
  userId: string | undefined,
  action:
    | 'login'
    | 'logout'
    | 'failed_login'
    | 'password_reset'
    | 'tenant_switch',
  ipAddress?: string,
  userAgent?: string,
  metadata?: Record<string, unknown>,
  success: boolean = true
): Promise<void> {
  await createAuditLog({
    userId,
    action: `auth.${action}`,
    resourceType: 'user',
    resourceId: userId,
    ipAddress,
    userAgent,
    metadata,
    success,
  });
}

/**
 * Audit a privacy-related event (GDPR/CCPA compliance)
 */
export async function auditPrivacyEvent(
  userId: string,
  tenantId: string | undefined,
  action:
    | 'consent_given'
    | 'consent_revoked'
    | 'data_exported'
    | 'data_deleted'
    | 'preferences_updated',
  metadata?: Record<string, unknown>
): Promise<void> {
  await createAuditLog({
    userId,
    tenantId,
    action: `privacy.${action}`,
    resourceType: 'user_privacy',
    resourceId: userId,
    metadata,
    success: true,
  });
}

// Type for where clause, matching repository expectations
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
 * Query audit logs with filters
 */
export async function queryAuditLogs(filters: {
  userId?: string;
  tenantId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  const where: AuditLogWhere = {};

  if (filters.userId) where.userId = filters.userId;
  if (filters.tenantId) where.tenantId = filters.tenantId;
  if (filters.action) where.action = filters.action;
  if (filters.resourceType) where.resourceType = filters.resourceType;
  if (filters.resourceId) where.resourceId = filters.resourceId;

  if (filters.startDate || filters.endDate) {
    where.timestamp = {};
    if (filters.startDate) where.timestamp.gte = filters.startDate;
    if (filters.endDate) where.timestamp.lte = filters.endDate;
  }

  return auditLogRepository.findMany({
    where,
    limit: filters.limit,
  });
}

// Type for audit log record
interface AuditLogRecord {
  action: string;
  timestamp: Date;
  [key: string]: unknown;
}

/**
 * Get audit report for a specific user
 */
export async function getUserAuditReport(userId: string, tenantId?: string) {
  const where: AuditLogWhere = { userId };
  if (tenantId) where.tenantId = tenantId;

  const logs = await auditLogRepository.findMany({
    where,
    limit: 1000,
  });

  if (!logs || logs.length === 0) {
    return {
      userId,
      tenantId,
      totalActions: 0,
      summary: {},
      recentActions: [],
      firstAction: undefined,
      lastAction: undefined,
    };
  }

  // Group by action type
  const summary = logs.reduce(
    (acc: Record<string, number>, log) => {
      const actionType = log.action.split('.')[0];
      acc[actionType] = (acc[actionType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    userId,
    tenantId,
    totalActions: logs.length,
    summary,
    recentActions: logs.slice(0, 10),
    firstAction: logs[logs.length - 1]?.timestamp,
    lastAction: logs[0]?.timestamp,
  };
}

import { prisma } from '@/lib/prisma';
import { ApplicationError, ErrorCode } from '@/lib/error';
import type { AIAuditLog } from '@prisma/client';

interface CreateAIAuditLogData {
  projectId: string;
  tenantId: string;
  userId: string;
  operation: string;
  toolName?: string | null;
  model: string;
  prompt: string;
  response?: string;
  tokenUsage?: Record<string, unknown>;
  status?: string;
  errorMessage?: string | null;
}

interface UpdateAIAuditLogData {
  response?: string;
  tokenUsage?: Record<string, unknown>;
  status?: string;
  errorMessage?: string | null;
  humanReviewed?: boolean;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
}

interface AIAuditLogWhere {
  projectId?: string;
  tenantId?: string;
  userId?: string;
  operation?: string;
  humanReviewed?: boolean;
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
}

/**
 * Creates a new AI audit log entry.
 * @param data - The AI audit log data to create.
 * @returns The created audit log entry.
 */
async function create(data: CreateAIAuditLogData): Promise<AIAuditLog> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    return await prisma.aIAuditLog.create({
      data: {
        projectId: data.projectId,
        tenantId: data.tenantId,
        userId: data.userId,
        operation: data.operation,
        toolName: data.toolName || null,
        model: data.model,
        prompt: data.prompt,
        response: data.response || '',
        tokenUsage: data.tokenUsage ? JSON.stringify(data.tokenUsage) : '',
        status: data.status || 'pending',
        errorMessage: data.errorMessage || null,
      },
    });
  } catch (error) {
    console.error('Failed to create AI audit log entry', { error, data });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      'Failed to create AI audit log entry'
    );
  }
}

/**
 * Updates an existing AI audit log entry.
 * @param id - The ID of the audit log entry.
 * @param data - The data to update.
 * @returns The updated audit log entry.
 */
async function update(
  id: string,
  data: UpdateAIAuditLogData
): Promise<AIAuditLog> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    return await prisma.aIAuditLog.update({
      where: { id },
      data: {
        ...data,
        tokenUsage: data.tokenUsage ? JSON.stringify(data.tokenUsage) : '',
      },
    });
  } catch (error) {
    console.error('Failed to update AI audit log entry', { error, id, data });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      'Failed to update AI audit log entry'
    );
  }
}

/**
 * Finds multiple AI audit log entries based on filters.
 * Ensures tenant isolation.
 * @param where - The filter conditions.
 * @param limit - The maximum number of records to return.
 * @returns An array of AI audit log entries.
 */
async function findMany(
  where: AIAuditLogWhere & { tenantId: string },
  limit: number = 100
): Promise<AIAuditLog[]> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    return await prisma.aIAuditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        project: {
          select: { name: true },
        },
        user: {
          select: { name: true, email: true },
        },
      },
    });
  } catch (error) {
    console.error('Failed to query AI audit logs', { error, where });
    return [];
  }
}

/**
 * Finds a single AI audit log entry by ID.
 * Ensures tenant isolation.
 * @param id - The ID of the audit log entry.
 * @param tenantId - The tenant ID for isolation.
 * @returns The audit log entry or null if not found.
 */
async function findById(
  id: string,
  tenantId: string
): Promise<AIAuditLog | null> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    return await prisma.aIAuditLog.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        project: {
          select: { name: true },
        },
        user: {
          select: { name: true, email: true },
        },
      },
    });
  } catch (error) {
    console.error('Failed to find AI audit log by ID', { error, id, tenantId });
    return null;
  }
}

/**
 * Marks an AI audit log as reviewed.
 * @param id - The ID of the audit log entry.
 * @param tenantId - The tenant ID for isolation.
 * @param reviewerId - The ID of the reviewer.
 * @returns The updated audit log entry.
 */
async function markAsReviewed(
  id: string,
  tenantId: string,
  reviewerId: string
): Promise<AIAuditLog> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    // First verify the audit log belongs to the tenant
    const auditLog = await findById(id, tenantId);
    if (!auditLog) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'AI audit log not found'
      );
    }

    return await prisma.aIAuditLog.update({
      where: { id },
      data: {
        humanReviewed: true,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      },
    });
  } catch (error) {
    if (error instanceof ApplicationError) throw error;
    console.error('Failed to mark AI audit log as reviewed', { error, id });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      'Failed to mark AI audit log as reviewed'
    );
  }
}

/**
 * Gets AI audit logs for export (USPTO compliance).
 * @param projectId - The project ID.
 * @param tenantId - The tenant ID for isolation.
 * @returns Audit logs formatted for export.
 */
async function getForExport(
  projectId: string,
  tenantId: string
): Promise<AIAuditLog[]> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    const logs = await prisma.aIAuditLog.findMany({
      where: {
        projectId,
        tenantId,
        status: 'success',
      },
      orderBy: { createdAt: 'asc' },
      include: {
        project: {
          select: { name: true },
        },
        user: {
          select: { name: true, email: true },
        },
      },
    });

    // Mark as exported
    await prisma.aIAuditLog.updateMany({
      where: {
        projectId,
        tenantId,
        status: 'success',
        exportedAt: null,
      },
      data: {
        exportedAt: new Date(),
      },
    });

    return logs;
  } catch (error) {
    console.error('Failed to get AI audit logs for export', {
      error,
      projectId,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      'Failed to get AI audit logs for export'
    );
  }
}

export const aiAuditLogRepository = {
  create,
  update,
  findMany,
  findById,
  markAsReviewed,
  getForExport,
};

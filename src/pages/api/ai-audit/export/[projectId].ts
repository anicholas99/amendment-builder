import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { aiAuditLogRepository } from '@/repositories/aiAuditLogRepository';
import { AuthenticatedRequest } from '@/types/middleware';
import { findProjectById } from '@/repositories/project/core.repository';

const querySchema = z.object({
  projectId: z.string(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { user } = req as AuthenticatedRequest;
  const { projectId } = querySchema.parse(req.query);

  if (!user) {
    throw new ApplicationError(
      ErrorCode.AUTH_UNAUTHORIZED,
      'User not authenticated'
    );
  }

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    throw new ApplicationError(
      ErrorCode.VALIDATION_FAILED,
      `Method ${method} Not Allowed`
    );
  }

  try {
    if (!user.tenantId) {
      throw new ApplicationError(
        ErrorCode.AUTH_UNAUTHORIZED,
        'Tenant ID not found'
      );
    }

    // Verify project access
    const project = await findProjectById(projectId, user.tenantId);
    if (!project) {
      throw new ApplicationError(
        ErrorCode.PROJECT_NOT_FOUND,
        'Project not found'
      );
    }

    // Get audit logs for export
    const logs = await aiAuditLogRepository.getForExport(
      projectId,
      user.tenantId
    );

    // Transform logs for export format
    const exportData = {
      logs: logs.map(log => ({
        id: log.id,
        timestamp: log.createdAt,
        operation: log.operation,
        model: log.model,
        prompt: JSON.parse(log.prompt) as Record<string, unknown>,
        response: log.response,
        tokenUsage: log.tokenUsage
          ? (JSON.parse(log.tokenUsage) as Record<string, unknown>)
          : null,
        humanReviewed: log.humanReviewed,
        reviewedBy: log.reviewedBy,
        reviewedAt: log.reviewedAt,
      })),
      exportedAt: new Date().toISOString(),
      projectName: project.name,
    };

    logger.info('[AIAuditAPI] Exported audit logs for project', {
      projectId,
      logCount: logs.length,
      userId: user.id,
    });

    return res.status(200).json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    if (error instanceof ApplicationError) throw error;

    logger.error('[AIAuditAPI] Failed to export audit logs', {
      error,
      projectId,
    });
    throw new ApplicationError(
      ErrorCode.INTERNAL_ERROR,
      'Failed to export audit logs'
    );
  }
}

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: { query: querySchema },
    rateLimit: 'api',
  }
);

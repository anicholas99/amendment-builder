import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { aiAuditLogRepository } from '@/repositories/aiAuditLogRepository';
import { AuthenticatedRequest } from '@/types/middleware';

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

    // Get all audit logs for the project
    const logs = await aiAuditLogRepository.findMany(
      {
        projectId,
        tenantId: user.tenantId,
      },
      1000 // Get up to 1000 logs for stats
    );

    // Calculate statistics
    const totalLogs = logs.length;
    const reviewedLogs = logs.filter(log => log.humanReviewed).length;
    const reviewPercentage =
      totalLogs > 0 ? (reviewedLogs / totalLogs) * 100 : 0;

    // Group by operation
    const byOperation: Record<string, number> = {};
    logs.forEach(log => {
      byOperation[log.operation] = (byOperation[log.operation] || 0) + 1;
    });

    // Group by model
    const byModel: Record<string, number> = {};
    logs.forEach(log => {
      byModel[log.model] = (byModel[log.model] || 0) + 1;
    });

    // Calculate total tokens and cost
    let totalTokens = 0;
    let totalCost = 0;

    logs.forEach(log => {
      if (log.tokenUsage) {
        try {
          const usage = JSON.parse(log.tokenUsage) as {
            total_tokens?: number;
            estimated_cost?: number;
          };
          totalTokens += usage.total_tokens || 0;
          totalCost += usage.estimated_cost || 0;
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });

    const stats = {
      totalLogs,
      reviewedLogs,
      reviewPercentage,
      byOperation,
      byModel,
      totalTokens,
      totalCost,
    };

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('[AIAuditAPI] Failed to get audit stats', {
      error,
      projectId,
    });
    throw new ApplicationError(
      ErrorCode.INTERNAL_ERROR,
      'Failed to retrieve audit statistics'
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

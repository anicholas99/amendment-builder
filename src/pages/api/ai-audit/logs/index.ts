import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { SecurePresets } from '@/server/api/securePresets';
import { aiAuditLogRepository } from '@/repositories/aiAuditLogRepository';
import { AuthenticatedRequest } from '@/types/middleware';

const querySchema = z.object({
  projectId: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  operation: z.string().optional(),
  humanReviewed: z.coerce.boolean().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { user } = req as AuthenticatedRequest;

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
    const params = querySchema.parse(req.query);
    const { page, limit, ...filters } = params;

    if (!user.tenantId) {
      throw new ApplicationError(
        ErrorCode.AUTH_UNAUTHORIZED,
        'Tenant ID not found'
      );
    }

    // Get logs with tenant isolation
    const logs = await aiAuditLogRepository.findMany(
      {
        ...filters,
        tenantId: user.tenantId,
        ...(filters.projectId && { projectId: filters.projectId }),
        ...(filters.operation && { operation: filters.operation }),
        ...(filters.humanReviewed !== undefined && {
          humanReviewed: filters.humanReviewed,
        }),
        ...(filters.startDate && {
          createdAt: {
            ...(filters.startDate && { gte: new Date(filters.startDate) }),
            ...(filters.endDate && { lte: new Date(filters.endDate) }),
          },
        }),
      },
      limit
    );

    // Calculate pagination info
    const skip = (page - 1) * limit;
    const paginatedLogs = logs.slice(skip, skip + limit);

    return res.status(200).json({
      success: true,
      data: {
        logs: paginatedLogs,
        total: logs.length,
        page,
        limit,
      },
    });
  } catch (error) {
    logger.error('[AIAuditAPI] Failed to fetch audit logs', { error });
    throw error;
  }
}

export default SecurePresets.userPrivate(handler, {
  validate: { query: querySchema },
  rateLimit: 'api',
});

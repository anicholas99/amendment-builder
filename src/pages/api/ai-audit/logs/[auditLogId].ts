import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { SecurePresets } from '@/server/api/securePresets';
import { aiAuditLogRepository } from '@/repositories/aiAuditLogRepository';
import { AuthenticatedRequest } from '@/types/middleware';

const querySchema = z.object({
  auditLogId: z.string(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { user } = req as AuthenticatedRequest;
  const { auditLogId } = querySchema.parse(req.query);

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

    const auditLog = await aiAuditLogRepository.findById(
      auditLogId,
      user.tenantId
    );

    if (!auditLog) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'AI audit log not found'
      );
    }

    return res.status(200).json({
      success: true,
      data: auditLog,
    });
  } catch (error) {
    if (error instanceof ApplicationError) throw error;

    logger.error('[AIAuditAPI] Failed to fetch audit log', {
      error,
      auditLogId,
    });
    throw new ApplicationError(
      ErrorCode.INTERNAL_ERROR,
      'Failed to fetch audit log'
    );
  }
}

export default SecurePresets.userPrivate(handler, {
  validate: { query: querySchema },
  rateLimit: 'api',
});

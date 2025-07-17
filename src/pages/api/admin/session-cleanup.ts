import { NextApiRequest, NextApiResponse } from 'next';
import { SessionCleanupService } from '@/server/services/sessionCleanupService';
import { AuditService } from '@/server/services/audit.server-service';
import { AuthenticatedRequest } from '@/types/middleware';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { logger } from '@/server/logger';

/**
 * Admin endpoint for manual session cleanup
 *
 * POST /api/admin/session-cleanup
 *
 * Required: Admin role
 *
 * Response:
 * {
 *   success: boolean,
 *   deletedSessions: number,
 *   message: string
 * }
 */
const handler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method } = req;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are accepted.',
    });
  }

  try {
    logger.info('Manual session cleanup requested', {
      userId: req.user?.id,
      userEmail: req.user?.email,
    });

    // Perform session cleanup
    const deletedCount = await SessionCleanupService.cleanupNow();

    // Audit log the admin action
    await AuditService.logAdminAction(req, 'session.cleanup', {
      deletedSessions: deletedCount,
      triggeredBy: req.user?.email,
    });

    return res.status(200).json({
      success: true,
      data: {
        deletedSessions: deletedCount,
        message: `Successfully cleaned up ${deletedCount} expired sessions`,
      },
    });
  } catch (error) {
    logger.error('Session cleanup failed', { error });

    // Audit log the failure
    await AuditService.logAdminAction(req, 'session.cleanup.failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      triggeredBy: req.user?.email,
    });

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to perform session cleanup',
    });
  }
};

// Require global admin access for session cleanup
export default SecurePresets.adminGlobal(handler, {
  rateLimit: 'admin',
});

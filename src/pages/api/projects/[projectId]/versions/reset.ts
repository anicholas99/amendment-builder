import { NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { logger } from '@/lib/monitoring/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';
import { resetApplicationVersionsForProject } from '@/repositories/applicationVersionRepository';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { z } from 'zod';

const apiLogger = createApiLogger('projects/versions/reset');

const querySchema = z.object({
  projectId: z.string(),
});

/**
 * Reset (delete all) application versions for a project
 * POST /api/projects/[projectId]/versions/reset
 *
 * This endpoint allows users to reset their patent application by removing all generated versions,
 * effectively allowing them to start fresh with generation.
 *
 * Security: Requires authentication and tenant validation
 */
async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
  apiLogger.logRequest(req);

  const userId = req.user!.id;
  const tenantId = req.user!.tenantId;
  const { projectId } = req.query as { projectId: string };

  logger.info(
    `API [reset-versions] POST: Resetting all versions for project ${projectId}, user ${userId}, tenant ${tenantId}`
  );

  try {
    const deletedCount = await resetApplicationVersionsForProject(
      projectId,
      userId,
      tenantId!
    );

    logger.info(
      `API [reset-versions] POST: Successfully deleted ${deletedCount} versions for project ${projectId}`
    );

    res.status(200).json({
      success: true,
      message: `Successfully reset application. ${deletedCount} version(s) deleted.`,
      deletedCount,
    });
  } catch (error) {
    logger.error('Failed to reset application versions', {
      error,
      projectId,
      userId,
    });

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCode.INTERNAL_ERROR,
      'Failed to reset application versions'
    );
  }
}

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: querySchema,
    },
  }
);

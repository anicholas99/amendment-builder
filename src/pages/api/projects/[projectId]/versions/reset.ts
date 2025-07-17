import { NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { resetPatentApplicationContent } from '@/repositories/project';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { z } from 'zod';

const apiLogger = createApiLogger('projects/versions/reset');

const querySchema = z.object({
  projectId: z.string(),
});

/**
 * Completely reset patent application content for a project
 * POST /api/projects/[projectId]/versions/reset
 *
 * This endpoint allows users to reset their patent application by removing:
 * - All draft documents
 * - All saved versions and their documents
 * - Patent content flags on the project
 * 
 * This effectively returns the project to a clean state ready for new patent generation.
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
    `API [reset-patent-application] POST: Resetting all patent content for project ${projectId}, user ${userId}, tenant ${tenantId}`
  );

  try {
    const resetResult = await resetPatentApplicationContent(
      projectId,
      userId,
      tenantId!
    );

    logger.info(
      `API [reset-patent-application] POST: Successfully reset patent application for project ${projectId}`,
      resetResult
    );

    res.status(200).json({
      success: true,
      message: `Successfully reset patent application. ${resetResult.draftDocumentsDeleted} draft document(s) and ${resetResult.versionsDeleted} version(s) deleted.`,
      draftDocumentsDeleted: resetResult.draftDocumentsDeleted,
      versionsDeleted: resetResult.versionsDeleted,
    });
  } catch (error) {
    logger.error('Failed to reset patent application content', {
      error,
      projectId,
      userId,
    });

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCode.INTERNAL_ERROR,
      'Failed to reset patent application content'
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

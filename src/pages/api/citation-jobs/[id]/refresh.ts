import { NextApiResponse } from 'next';
import { z } from 'zod';
import { withAuth } from '@/middleware/auth';
import { withTenantGuard } from '@/middleware/authorization';
import { AuthenticatedRequest } from '@/types/middleware';
import { CustomApiRequest } from '@/types/api';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/server/logger';
import { prisma } from '@/lib/prisma';
import { generateClaimHash } from '@/utils/claimVersioning';

const querySchema = z.object({
  id: z.string().min(1),
});

const bodySchema = z.object({
  reason: z.string().optional(),
  projectId: z.string().optional(),
});

async function handler(
  req: CustomApiRequest & AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { id: jobId } = req.query as { id: string };
  const { reason = 'manual', projectId } = req.body;

  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client not initialized'
    );
  }

  try {
    // Get the citation job
    const citationJob = await prisma.citationJob.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        status: true,
        referenceNumber: true,
        searchHistoryId: true,
        searchHistory: {
          select: {
            projectId: true,
          },
        },
      },
    });

    if (!citationJob) {
      return res.status(404).json({
        error: 'Citation job not found',
      });
    }

    // Check if job is already in progress
    if (citationJob.status === 'PENDING' || citationJob.status === 'RUNNING') {
      return res.status(400).json({
        error: 'Job is already in progress',
        status: citationJob.status,
      });
    }

    // Get current claim 1 hash if available
    let currentClaim1Hash: string | null = null;
    const resolvedProjectId = projectId || citationJob.searchHistory.projectId;

    if (resolvedProjectId) {
      try {
        // Get the current claim 1
        const invention = await prisma.invention.findUnique({
          where: { projectId: resolvedProjectId },
          select: { id: true },
        });

        if (invention) {
          const claim1 = await prisma.claim.findFirst({
            where: {
              inventionId: invention.id,
              number: 1,
            },
            select: { text: true },
          });

          if (claim1) {
            currentClaim1Hash = generateClaimHash(claim1.text);
          }
        }
      } catch (error) {
        logger.warn('[RefreshJobAPI] Could not get claim hash', { error });
      }
    }

    // Reset the job to pending status
    await prisma.citationJob.update({
      where: { id: jobId },
      data: {
        status: 'PENDING',
        startedAt: null,
        completedAt: null,
        error: null,
        errorMessage: null,
        deepAnalysisJson: null,
        examinerAnalysisJson: null,
        lastCheckedAt: new Date(),
      },
    });

    logger.info('[RefreshJobAPI] Citation job queued for refresh', {
      jobId,
      reason,
      referenceNumber: citationJob.referenceNumber,
      currentClaim1Hash,
    });

    // TODO: Trigger the background job processor to pick up this job
    // This would typically be done via a queue system like Bull or SQS

    return res.status(200).json({
      success: true,
      jobId,
      status: 'PENDING',
      message: 'Job queued for re-analysis',
    });
  } catch (error) {
    logger.error('[RefreshJobAPI] Error refreshing citation job', {
      error,
      jobId,
    });

    if (error instanceof ApplicationError) {
      return res.status(400).json({
        error: error.message,
        code: error.code,
      });
    }

    return res.status(500).json({
      error: 'Failed to refresh citation job',
    });
  }
}

// Resolve tenantId for the citation job
const resolveTenantId = async (
  req: CustomApiRequest
): Promise<string | null> => {
  const { id: jobId } = req.query as { id: string };

  if (!prisma) {
    return null;
  }

  const job = await prisma.citationJob.findUnique({
    where: { id: jobId },
    select: {
      searchHistory: {
        select: {
          project: {
            select: {
              tenantId: true,
            },
          },
        },
      },
    },
  });

  return job?.searchHistory?.project?.tenantId || null;
};

const guardedHandler = withTenantGuard(resolveTenantId)(handler);
export default withAuth(guardedHandler as any);

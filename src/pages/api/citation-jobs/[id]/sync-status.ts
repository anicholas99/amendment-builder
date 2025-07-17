import { NextApiResponse } from 'next';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { findWithResult as getCitationJobWithResult } from '../../../../repositories/citationJobRepository';
import { CitationsServerService } from '@/server/services/citations.server.service';
import { countCitationMatchesByJobId } from '../../../../repositories/citationMatchRepository';
import { CustomApiRequest } from '@/types/api';
import { z } from 'zod';
import { idQuerySchema } from '@/lib/validation/schemas/shared/querySchemas';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { sendSafeErrorResponse } from '@/utils/secureErrorResponse';

const apiLogger = createApiLogger('citation-jobs-sync-status');

// Define request body type (empty for this endpoint)
interface EmptyBody {}

/**
 * API endpoint to manually sync the status of a citation job
 * POST /api/citation-jobs/[id]/sync-status
 */
async function handler(req: CustomApiRequest<EmptyBody>, res: NextApiResponse) {
  apiLogger.logRequest(req);

  // Only allow POST requests
  if (req.method !== 'POST') {
    apiLogger.warn('Method not allowed', { method: req.method });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // User and tenant are guaranteed by the secure preset
  const userId = req.user!.id;
  const tenantId = req.user!.tenantId!;

  // Query parameters are validated by middleware
  const { id } = (req as any).validatedQuery as z.infer<typeof idQuerySchema>;

  try {
    apiLogger.info('Manual status sync requested', { citationJobId: id });

    // Fetch the job from the database
    const job = await getCitationJobWithResult(id);

    if (!job) {
      apiLogger.warn('Citation job not found', { jobId: id, userId });
      return res.status(404).json({ error: 'Citation job not found' });
    }

    // If job is already completed, just return success
    if (job.status === 'COMPLETED') {
      apiLogger.info('Job already marked as completed', { jobId: id, userId });
      const response = {
        status: job.status,
        message: 'Job already completed',
        jobId: id,
      };
      apiLogger.logResponse(200, response);
      return res.status(200).json({
        success: true,
        data: response,
      });
    }

    // Check if the job has been running for a while - mark as completed if it's been too long
    const startedAt = job.startedAt;
    if (startedAt) {
      const elapsedMs = Date.now() - new Date(startedAt).getTime();
      // If job has been running for more than 5 minutes, mark it as done
      if (elapsedMs > 5 * 60 * 1000 && job.status === 'PROCESSING') {
        apiLogger.info('Job has been running too long - marking as completed', {
          jobId: id,
          userId,
          elapsedMs,
        });

        // Update the job status
        await CitationsServerService.updateCitationJobWithResults(
          id,
          'COMPLETED'
        );

        const response = {
          status: 'COMPLETED',
          message: 'Job marked as completed due to timeout',
          jobId: id,
        };
        apiLogger.logResponse(200, response);
        return res.status(200).json({
          success: true,
          data: response,
        });
      }
    }

    // If job is still pending or processing, check for its matches
    if (job.status === 'PENDING' || job.status === 'PROCESSING') {
      // Count how many citation matches exist for this job
      const matchCount = await countCitationMatchesByJobId(id);

      if (matchCount > 0) {
        apiLogger.info(
          'Job has matches but status is still pending/processing - marking as completed',
          {
            jobId: id,
            userId,
            matchCount,
            currentStatus: job.status,
          }
        );

        // If matches exist, the job should be considered complete
        await CitationsServerService.updateCitationJobWithResults(
          id,
          'COMPLETED'
        );

        const response = {
          status: 'COMPLETED',
          message: `Job has ${matchCount} matches`,
          jobId: id,
        };
        apiLogger.logResponse(200, response);
        return res.status(200).json({
          success: true,
          data: response,
        });
      }
    }

    // If no matches exist and the job is not completed, return an error
    apiLogger.info('No matches found and job is not completed', {
      jobId: id,
      userId,
    });
    return res
      .status(500)
      .json({ error: 'No matches found and job is not completed' });
  } catch (error) {
    apiLogger.error('Failed to sync job status', {
      jobId: id,
      error: error instanceof Error ? error : String(error),
    });

    if (error instanceof ApplicationError) {
      sendSafeErrorResponse(res, error, error.statusCode || 500, error.message);
      return;
    }

    sendSafeErrorResponse(
      res,
      error,
      500,
      'Failed to sync job status. Please try again later.'
    );
  }
}

// Use the new secure preset
export default SecurePresets.tenantProtected(
  TenantResolvers.fromCitationJob,
  handler,
  {
    validate: {
      query: idQuerySchema,
    },
  }
);

import { NextApiResponse } from 'next';
import { CustomApiRequest } from '@/types/api';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { z } from 'zod';
import { queueDeepAnalysisInline } from '@/server/services/deep-analysis-inline.server.service';
import {
  findById as getCitationJobById,
  findWithTenantInfo,
} from '@/repositories/citationJobRepository';
import environment from '@/config/environment';
import { AuthenticatedRequest } from '@/types/middleware';
import { idQuerySchema } from '@/lib/validation/schemas/shared/querySchemas';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { sendSafeErrorResponse } from '@/utils/secureErrorResponse';

// Initialize logger
const apiLogger = createApiLogger('citation-jobs/:id/deep-analysis');

// Request body schema (empty for this endpoint)
const requestBodySchema = z.object({});
type RequestBody = z.infer<typeof requestBodySchema>;

/**
 * Resolve tenant ID from the citation job
 */
const citationJobTenantResolver = async (
  req: AuthenticatedRequest
): Promise<string | null> => {
  const { id } = req.query;
  if (!id || typeof id !== 'string') return null;

  const job = await findWithTenantInfo(id);
  return job?.searchHistory?.project?.tenantId || null;
};

/**
 * API handler for triggering deep analysis on a citation job
 */
async function handler(
  req: CustomApiRequest<RequestBody>,
  res: NextApiResponse
): Promise<void> {
  apiLogger.logRequest(req);

  // Only allow POST method
  if (req.method !== 'POST') {
    throw new ApplicationError(
      ErrorCode.VALIDATION_FAILED,
      'Method not allowed'
    );
  }

  // Query parameters are validated by middleware
  const { id: jobId } = (req as any).validatedQuery;

  // Check if deep analysis is enabled
  if (!environment.features.enableDeepAnalysis) {
    apiLogger.warn('Deep analysis feature is disabled');
    throw new ApplicationError(
      ErrorCode.VALIDATION_FAILED,
      'Deep analysis feature is currently disabled'
    );
  }

  apiLogger.info('Triggering deep analysis', { jobId });

  try {
    // Check if the citation job exists and is in a valid state
    const citationJob = await getCitationJobById(jobId);

    if (!citationJob) {
      throw new ApplicationError(
        ErrorCode.CITATION_JOB_NOT_FOUND,
        'Citation job not found'
      );
    }

    // Check if job is completed
    if (
      citationJob.status !== 'COMPLETED' &&
      citationJob.status !== 'completed'
    ) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_FAILED,
        'Citation job must be completed before running deep analysis'
      );
    }

    // Check if job has raw results
    if (!citationJob.rawResultData) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_FAILED,
        'Citation job has no results to analyze'
      );
    }

    // Check if deep analysis already exists
    if (citationJob.deepAnalysisJson) {
      apiLogger.info('Deep analysis already exists for job', { jobId });
      return res.status(200).json({
        success: true,
        data: {
          message: 'Deep analysis already completed',
          hasAnalysis: true,
        },
      });
    }

    // Queue the deep analysis
    await queueDeepAnalysisInline({ jobId });

    apiLogger.info('Deep analysis queued successfully', { jobId });
    apiLogger.logResponse(202, { success: true });

    return res.status(202).json({
      success: true,
      data: {
        message: 'Deep analysis queued for processing',
        jobId,
      },
    });
  } catch (error) {
    apiLogger.error('Failed to perform deep analysis', {
      jobId,
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
      'Failed to perform deep analysis. Please try again later.'
    );
  }
}

// Use the new secure preset
export default SecurePresets.tenantProtected(
  citationJobTenantResolver,
  handler,
  {
    validate: {
      query: idQuerySchema, // Validate the ID parameter
    },
  }
);

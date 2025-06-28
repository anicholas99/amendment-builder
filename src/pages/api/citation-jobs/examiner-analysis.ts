import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/lib/monitoring/logger';
import { findWithExaminerAnalysis } from '@/repositories/citationJobRepository';
import { safeJsonParse } from '@/utils/json-utils';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';
import { z } from 'zod';
import { sendSafeErrorResponse } from '@/utils/secure-error-response';
import { ApplicationError } from '@/lib/error';

// Validation schema for query parameters
const querySchema = z.object({
  referenceNumber: z.string(),
  searchHistoryId: z.string(),
  claimSetVersionId: z.string().optional(), // Deprecated - will be removed
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { referenceNumber, searchHistoryId, claimSetVersionId } = (req as any)
    .validatedQuery as z.infer<typeof querySchema>;

  try {
    // Find the citation job for this specific combination using repository
    const job = await findWithExaminerAnalysis(
      referenceNumber,
      searchHistoryId
    );

    if (!job) {
      logger.debug('[ExaminerAnalysisAPI] No job found for', {
        referenceNumber,
        searchHistoryId,
        claimSetVersionId,
      });
      return res.status(404).json({
        error: 'Citation job not found',
        examinerAnalysis: null,
      });
    }

    // Parse and return the examiner analysis
    let examinerAnalysis = null;
    const jobWithExaminer = job as any; // Type assertion until Prisma types are regenerated
    if (jobWithExaminer.examinerAnalysisJson) {
      examinerAnalysis = safeJsonParse(jobWithExaminer.examinerAnalysisJson);
    }

    return res.status(200).json({
      jobId: job.id,
      status: job.status,
      examinerAnalysis,
      hasExaminerAnalysis: !!examinerAnalysis,
    });
  } catch (error) {
    logger.error(
      '[ExaminerAnalysisAPI] Error fetching examiner analysis',
      error
    );

    if (error instanceof ApplicationError) {
      sendSafeErrorResponse(res, error, error.statusCode || 500, error.message);
      return;
    }

    sendSafeErrorResponse(
      res,
      error,
      500,
      'Failed to retrieve examiner analysis. Please try again later.'
    );
  }
}

// Use the new secure preset
export default SecurePresets.tenantProtected(
  TenantResolvers.fromSearchHistory,
  handler,
  {
    validate: {
      query: querySchema,
    },
  }
);

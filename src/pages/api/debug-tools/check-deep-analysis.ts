import { NextApiResponse } from 'next';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { AuthenticatedRequest } from '@/types/middleware';
import {
  findWithDeepAnalysis as getCitationJobsWithDeepAnalysis,
  getStatistics as getCitationJobStatistics,
} from '../../../repositories/citationJobRepository';
import { CustomApiRequest } from '@/types/api';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';
import { env } from '@/config/env';

const apiLogger = createApiLogger('debug/check-deep-analysis');

// Define request body type (empty for this GET endpoint)
interface EmptyBody {}

async function handler(
  req: CustomApiRequest<EmptyBody>,
  res: NextApiResponse
): Promise<void> {
  // Disable debug endpoints in production
  if (env.NODE_ENV === 'production') {
    throw new ApplicationError(ErrorCode.DB_RECORD_NOT_FOUND, 'Not found');
  }

  apiLogger.info('Debug: Checking deep analysis status', {
    userId: req.user?.id,
  });

  if (req.method !== 'GET') {
    throw new ApplicationError(
      ErrorCode.VALIDATION_FAILED,
      'Method not allowed'
    );
  }

  // Get citation jobs with deep analysis data using repository functions
  const [jobsWithDeepAnalysis, statistics] = await Promise.all([
    getCitationJobsWithDeepAnalysis(10),
    getCitationJobStatistics(),
  ]);

  // Compute total jobs from statistics
  const totalJobs = statistics.reduce((acc, stat) => acc + stat._count, 0);
  const jobsWithDeepAnalysisCount = jobsWithDeepAnalysis.length;

  apiLogger.info(
    `Found ${jobsWithDeepAnalysisCount} out of ${totalJobs} citation jobs with deep analysis data`
  );

  return res.status(200).json({
    total: totalJobs,
    withDeepAnalysis: jobsWithDeepAnalysisCount,
    samples: jobsWithDeepAnalysis.map(job => ({
      id: job.id,
      referenceNumber: job.referenceNumber,
      status: 'COMPLETED', // These jobs are filtered to be completed
      searchHistoryId: 'N/A', // Not included in the query
      claimSetVersionId: 'N/A', // Not included in the query
      hasDeepAnalysisJson: !!job.deepAnalysisJson,
      deepAnalysisLength: job.deepAnalysisJson
        ? job.deepAnalysisJson.length
        : 0,
      deepAnalysisSample: job.deepAnalysisJson
        ? job.deepAnalysisJson.substring(0, 100) + '...'
        : null,
    })),
  });
}

// Use the new admin-specific secure preset
export default SecurePresets.adminTenant(TenantResolvers.fromUser, handler);

import { NextApiRequest, NextApiResponse } from 'next';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { AuthenticatedRequest } from '@/types/middleware';
import { CustomApiRequest } from '@/types/api';
import { safeJsonParse } from '@/utils/json-utils';
import { findByReferenceAndSearch } from '@/repositories/citationJobRepository';
import { getSearchHistoryWithTenant } from '@/repositories/searchRepository';
import { requireRole } from '@/middleware/role';
import { z } from 'zod';
import { withAuth } from '@/middleware/auth';
import { withTenantGuard } from '@/middleware/authorization';
import { withErrorHandling } from '@/middleware/errorHandling';
import { withRateLimit } from '@/middleware/rateLimiter';
import { withMethod } from '@/middleware/method';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';
import { env } from '@/config/env';

const apiLogger = createApiLogger('debug/find-job');

// Define Zod schema for query parameter validation
const querySchema = z.object({
  reference: z.string().min(1, 'Reference parameter is required'),
  searchId: z.string().min(1, 'Search ID parameter is required'),
  versionId: z.string().optional(),
});

// Define request body type (empty for this GET endpoint)
interface EmptyBody {}

async function handler(
  req: CustomApiRequest<EmptyBody>,
  res: NextApiResponse
): Promise<void> {
  // Disable debug endpoints in production
  if (env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }

  apiLogger.info('Admin searching for citation job', {
    userId: req.user?.id,
    query: req.query,
  });

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Query parameters are validated by SecurePresets using querySchema
  const { reference, searchId, versionId } = req.query as z.infer<
    typeof querySchema
  >;

  try {
    // Log what we're looking for
    apiLogger.info(
      `Finding jobs for reference: ${reference}, searchId: ${searchId}, versionId: ${versionId || 'any'}`
    );

    // Find citation jobs matching the criteria using repository function
    const jobs = await findByReferenceAndSearch(
      String(reference),
      String(searchId)
    );

    apiLogger.info(`Found ${jobs.length} matching jobs`);

    // Return only the first matching job's analysis if available
    const sampleJob = jobs.length > 0 ? jobs[0] : null;
    let sampleExaminerAnalysis = null;

    if (sampleJob?.examinerAnalysisJson) {
      if (typeof sampleJob.examinerAnalysisJson === 'string') {
        const parsed = safeJsonParse(sampleJob.examinerAnalysisJson);
        if (parsed === undefined) {
          apiLogger.error(
            'Failed to parse examinerAnalysisJson - invalid JSON',
            {
              jobId: sampleJob.id,
              dataPreview: sampleJob.examinerAnalysisJson.substring(0, 100),
            }
          );
        } else {
          sampleExaminerAnalysis = parsed;
        }
      } else {
        sampleExaminerAnalysis = sampleJob.examinerAnalysisJson;
      }
    }

    res.status(200).json({
      jobs: jobs.map(job => ({
        id: job.id,
        referenceNumber: reference,
        status: job.status,
        searchHistoryId: searchId,
        claimSetVersionId: versionId || 'N/A',
        hasExaminerAnalysis: !!job.examinerAnalysisJson,
      })),
      sampleExaminerAnalysis,
    });
  } catch (error) {
    apiLogger.error('Error finding citation job', { error });
    res.status(500).json({ error: 'Failed to find citation job' });
  }
}

// Resolve tenantId based on the searchHistoryId provided in the query string.
const resolveTenantId = async (
  req: AuthenticatedRequest
): Promise<string | null> => {
  const { searchId } = req.query as z.infer<typeof querySchema>;

  // Use repository function instead of direct Prisma
  const entry = await getSearchHistoryWithTenant(searchId);
  return entry?.tenantId ?? null;
};

// Use the new admin-specific secure preset
export default SecurePresets.adminTenant(resolveTenantId, handler, {
  validate: {
    query: querySchema,
  },
});

import { NextApiResponse, NextApiRequest } from 'next';
import { z } from 'zod';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import {
  findWithResult,
  update as updateCitationJob,
  findWithTenantInfo,
} from '../../../repositories/citationJobRepository';
import {
  processCitationJob,
  serializeCitationJob,
} from '@/features/citation-extraction/utils/citationJob';
import { CustomApiRequest } from '@/types/api';
import { idQuerySchema } from '@/lib/validation/schemas/shared/querySchemas';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { AuthenticatedRequest } from '@/types/middleware';
import { SecurePresets } from '@/server/api/securePresets';
import { apiResponse } from '@/utils/api/responses';

// Define request body type
interface CitationJobUpdateBody {
  status?: string;
}

// Validation schema for PATCH requests
const patchSchema = z.object({
  status: z.string().min(1, 'Status is required'),
});

// Initialize apiLogger
const apiLogger = createApiLogger('citation-jobs/:id');

async function handler(
  req: CustomApiRequest<CitationJobUpdateBody>,
  res: NextApiResponse
): Promise<void> {
  apiLogger.logRequest(req);

  // Query parameters are validated by middleware
  const { id } = (req as any).validatedQuery;

  if (req.method === 'GET') {
    apiLogger.info('Fetching citation job', { jobId: id });
    const job = await findWithResult(id);

    if (!job) {
      apiLogger.warn('Citation job not found', { jobId: id });
      throw new ApplicationError(
        ErrorCode.CITATION_JOB_NOT_FOUND,
        'Citation job not found'
      );
    }

    const processedJob = processCitationJob(job);
    const serializedJob = serializeCitationJob(processedJob);
    apiLogger.debug('Citation job retrieved data details:', {
      jobId: serializedJob.id,
      status: serializedJob.status,
      referenceNumber: serializedJob.referenceNumber,
      hasDeepAnalysis: serializedJob.hasDeepAnalysis,
      deepAnalysisLength: serializedJob.deepAnalysisJson
        ? serializedJob.deepAnalysisJson.length
        : 0,
      deepAnalysisFirst100Chars: serializedJob.deepAnalysisJson
        ? serializedJob.deepAnalysisJson.substring(0, 100) + '...'
        : null,
      hasResults: serializedJob.hasResults,
    });

    apiLogger.logResponse(200, { success: true });
    return apiResponse.ok(res, serializedJob);
  }

  if (req.method === 'PATCH') {
    const validationResult = patchSchema.safeParse(req.body);
    if (!validationResult.success) {
      return apiResponse.badRequest(res, 'Invalid request body for PATCH');
    }
    const { status } = validationResult.data;

    apiLogger.info('Updating citation job', { jobId: id });
    const updatedJob = await updateCitationJob(id, { status });

    if (!updatedJob) {
      apiLogger.warn('Citation job not found for update', {
        jobId: id,
      });
      throw new ApplicationError(
        ErrorCode.CITATION_JOB_NOT_FOUND,
        'Citation job not found'
      );
    }

    const processedJob = processCitationJob(updatedJob);
    const serializedJob = serializeCitationJob(processedJob);
    apiLogger.logResponse(200, { success: true });
    return apiResponse.ok(res, serializedJob);
  }

  // Method not allowed
  return apiResponse.methodNotAllowed(res, ['GET', 'PATCH']);
}

// Custom tenant resolver for citation jobs
const citationJobTenantResolver = async (
  req: AuthenticatedRequest
): Promise<string | null> => {
  const { id } = req.query;
  if (!id || typeof id !== 'string') return null;

  const job = await findWithTenantInfo(id);
  return job?.searchHistory?.project?.tenantId || null;
};

// Use the new secure preset
export default SecurePresets.tenantProtected(
  citationJobTenantResolver,
  handler,
  {
    validate: {
      query: idQuerySchema, // Always validate the ID parameter
    },
    // Use resource rate limit for polling individual job status
    rateLimit: 'resource',
  }
);

import { NextApiResponse } from 'next';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { CustomApiRequest } from '@/types/api';
import { AuthenticatedRequest } from '@/types/middleware';
import { getSearchHistoryWithTenant } from '@/repositories/search';
import { CitationsServerService } from '@/server/services/citations.server.service';
import {
  createCitationJobSchema,
  CreateCitationJobBody,
} from '@/types/api/citations';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';
import { securityLogger } from '@/lib/monitoring/securityLogger';
import { serializeCitationJob } from '@/features/citation-extraction/utils/citationJob';

const apiLogger = createApiLogger('citation-jobs');

// ============================================================================
// Zod Validation Schema is now imported from a shared location
// ============================================================================

// ============================================================================
// API Handler
// ============================================================================

const handler = async (
  req: CustomApiRequest<any>,
  res: NextApiResponse
): Promise<void> => {
  apiLogger.logRequest(req);

  if (req.method === 'GET') {
    const { searchHistoryId } = req.query;

    if (!searchHistoryId || typeof searchHistoryId !== 'string') {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'searchHistoryId query parameter is required'
      );
    }

    const jobs =
      await CitationsServerService.getCitationJobsBySearchHistoryId(
        searchHistoryId
      );

    // Serialize the jobs to ensure deepAnalysisJson is included as a string field
    const serializedJobs = jobs.map(job => serializeCitationJob(job));

    return res.status(200).json(serializedJobs);
  }

  if (req.method === 'POST') {
    const validationResult = createCitationJobSchema.safeParse(req.body);
    if (!validationResult.success) {
      // Log security event if userId validation fails
      const userIdError = validationResult.error.errors.find(err =>
        err.path.includes('userId')
      );
      if (userIdError && req.body.userId) {
        securityLogger.logInvalidUserId(req.body.userId, {
          path: req.url,
          method: req.method,
        });
      }

      return res.status(400).json({
        error: 'Invalid request body',
        details: validationResult.error.flatten(),
      });
    }

    const {
      userId,
      searchHistoryId,
      filterReferenceNumber,
      searchInputs,
      threshold,
    } = validationResult.data;

    const newJob = await CitationsServerService.createCitationJob({
      userId,
      searchHistoryId,
      filterReferenceNumber,
      searchInputs,
      threshold,
    });

    return res.status(201).json({ success: true, jobId: newJob.id });
  }

  throw new ApplicationError(
    ErrorCode.VALIDATION_FAILED,
    `Method ${req.method} not allowed`
  );
};

// ============================================================================
// Middleware Configuration
// ============================================================================

// Handler that injects userId for POST requests
const handlerWithInjectedUser = (
  req: CustomApiRequest<any>,
  res: NextApiResponse
) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  // Only inject userId for POST requests
  if (req.method === 'POST') {
    req.body.userId = req.user.id;
  }

  return handler(req, res);
};

const resolveTenantForCitationJob = async (req: AuthenticatedRequest) => {
  // For GET requests, get searchHistoryId from query
  // For POST requests, get it from body
  const searchHistoryId =
    req.method === 'GET'
      ? (req.query.searchHistoryId as string)
      : req.body.searchHistoryId;

  if (!searchHistoryId) return null;

  const searchHistory = await getSearchHistoryWithTenant(searchHistoryId);
  return searchHistory?.tenantId || null;
};

// Use the new secure preset
export default SecurePresets.tenantProtected(
  resolveTenantForCitationJob,
  handlerWithInjectedUser,
  {
    // Use resource rate limit for citation jobs
    // This allows 300 requests per 15 minutes which is suitable for
    // citation extraction that involves multiple requests and polling
    rateLimit: 'resource',
  }
);

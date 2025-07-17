import { NextApiResponse } from 'next';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { CustomApiRequest } from '@/types/api';
import { AuthenticatedRequest } from '@/types/middleware';
import { getSearchHistoryWithTenant } from '@/repositories/search';
import { CitationsServerService } from '@/server/services/citations.server.service';
import {
  createCitationJobSchema,
  CreateCitationJobBody,
} from '@/types/api/citations';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { securityLogger } from '@/server/monitoring/securityLogger';
import { serializeCitationJob } from '@/features/citation-extraction/utils/citationJob';
import { z } from 'zod';
import { apiResponse } from '@/utils/api/responses';

const apiLogger = createApiLogger('citation-jobs');

// ============================================================================
// Validation Schemas
// ============================================================================

// Query schema for GET requests
const getQuerySchema = z.object({
  searchHistoryId: z.string().min(1, 'searchHistoryId is required'),
});

// Body schema is already imported from shared location
// We'll use createCitationJobSchema for POST validation

// ============================================================================
// API Handler
// ============================================================================

const handler = async (
  req: AuthenticatedRequest & {
    body?: CreateCitationJobBody;
  },
  res: NextApiResponse
): Promise<void> => {
  apiLogger.logRequest(req);

  if (req.method === 'GET') {
    // Manually validate query for GET requests
    try {
      const { searchHistoryId } = getQuerySchema.parse(req.query);

      const jobs =
        await CitationsServerService.getCitationJobsBySearchHistoryId(
          searchHistoryId
        );

      // Serialize the jobs to ensure deepAnalysisJson is included as a string field
      const serializedJobs = jobs.map(job => serializeCitationJob(job));

      return apiResponse.ok(res, serializedJobs);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ApplicationError(
          ErrorCode.VALIDATION_FAILED,
          error.errors[0]?.message || 'Invalid query parameters'
        );
      }
      throw error;
    }
  }

  if (req.method === 'POST') {
    // Body has already been validated by middleware
    const {
      userId,
      searchHistoryId,
      filterReferenceNumber,
      searchInputs,
      threshold,
    } = req.body!;

    // Security check: Ensure userId matches authenticated user
    if (userId !== req.user?.id) {
      securityLogger.logInvalidUserId(userId, {
        path: req.url,
        method: req.method,
      });

      throw new ApplicationError(
        ErrorCode.AUTH_UNAUTHORIZED,
        'User ID mismatch'
      );
    }

    const newJob = await CitationsServerService.createCitationJob({
      userId,
      searchHistoryId,
      filterReferenceNumber,
      searchInputs,
      threshold,
    });

    return apiResponse.ok(res, { success: true, jobId: newJob.id });
  }

  throw new ApplicationError(
    ErrorCode.VALIDATION_FAILED,
    `Method ${req.method} not allowed`
  );
};

// ============================================================================
// Middleware Configuration
// ============================================================================

// Type for our handler function
type CitationJobHandler = (
  req: AuthenticatedRequest & {
    body?: CreateCitationJobBody;
  },
  res: NextApiResponse
) => Promise<void>;

// Middleware to inject authenticated user ID into POST body
const injectUserMiddleware =
  (handlerFn: CitationJobHandler) =>
  async (
    req: AuthenticatedRequest & {
      body?: CreateCitationJobBody;
    },
    res: NextApiResponse
  ) => {
    if (!req.user?.id) {
      return apiResponse.unauthorized(res, 'User not authenticated');
    }

    // Only inject userId for POST requests
    if (req.method === 'POST' && req.body) {
      req.body.userId = req.user.id;
    }

    return handlerFn(req, res);
  };

const resolveTenantForCitationJob = async (req: AuthenticatedRequest) => {
  // For GET requests, get searchHistoryId from query
  // For POST requests, get it from body
  let searchHistoryId: string | undefined;

  if (req.method === 'GET') {
    searchHistoryId = req.query.searchHistoryId as string;
  } else if (req.method === 'POST') {
    searchHistoryId = req.body?.searchHistoryId;
  }

  if (!searchHistoryId) return null;

  const searchHistory = await getSearchHistoryWithTenant(searchHistoryId);
  return searchHistory?.tenantId || null;
};

// Use the new secure preset with proper validation
export default SecurePresets.tenantProtected(
  resolveTenantForCitationJob,
  injectUserMiddleware(handler),
  {
    validate: {
      // Remove query validation from middleware since it's method-specific
      body: createCitationJobSchema,
      bodyMethods: ['POST'],
    },
    // Use resource rate limit for citation jobs
    // This allows 300 requests per 15 minutes which is suitable for
    // citation extraction that involves multiple requests and polling
    rateLimit: 'resource',
  }
);

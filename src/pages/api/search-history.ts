/**
 * Search History API
 *
 * This API handles saving and retrieving search history.
 */
import { NextApiResponse } from 'next';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { AuthenticatedRequest } from '@/types/middleware';
import { NormalizedSearchResult } from '@/types/domain/searchHistory';
import { normalizeSearchResults } from '@/features/search/utils/searchHistory';
import {
  findManySearchHistory,
  createSearchHistory,
  deleteSearchHistoryByProjectId,
  findSearchHistoryIdsByProjectId,
  deletePatentabilityScoresBySearchHistoryIds,
} from '@/repositories/search';
import { CustomApiRequest } from '@/types/api';
import { z } from 'zod';
import { safeJsonParse } from '@/utils/jsonUtils';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { SecurePresets } from '@/server/api/securePresets';
import { resolveTenantIdFromProject } from '@/repositories/tenantRepository';
import { apiResponse } from '@/utils/api/responses';

const apiLogger = createApiLogger('search-history');

// Interface for search history query options (replacing Prisma.SearchHistoryFindManyArgs)
interface SearchHistoryQueryOptions {
  orderBy?: { [key: string]: 'asc' | 'desc' };
  where?: { projectId?: string; project?: { tenantId: string } };
  take?: number;
}

// Schema for search result object based on prior art reference structure
const searchResultSchema = z
  .object({
    number: z.string().optional(),
    title: z.string().optional(),
    abstract: z.string().optional(),
    url: z.string().optional(),
    relevance: z.union([z.string(), z.number()]).optional(),
    year: z.string().optional(),
    authors: z.string().optional(),
    // Allow additional fields for flexibility
  })
  .passthrough();

// Query schemas for GET and DELETE
const getQuerySchema = z.object({
  projectId: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

const deleteQuerySchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
});

// Body schema for POST
const postBodySchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  query: z.string().min(1, 'Query is required').max(1000, 'Query too long'),
  results: z
    .union([
      z.string(), // Can be JSON string
      z.array(searchResultSchema), // Or array of search results
      z.object({ results: z.array(searchResultSchema) }).passthrough(), // Or object with results array
    ])
    .optional(),
});

// Type definitions
type GetQuery = z.infer<typeof getQuerySchema>;
type DeleteQuery = z.infer<typeof deleteQuerySchema>;
type PostBody = z.infer<typeof postBodySchema>;

// Custom tenant resolver that handles both GET (query) and POST (body) cases
const searchHistoryTenantResolver = async (
  req: AuthenticatedRequest
): Promise<string | null> => {
  let projectId: string | undefined;

  // For GET and DELETE, projectId comes from query
  if (req.method === 'GET' || req.method === 'DELETE') {
    projectId = req.query.projectId as string | undefined;
  }
  // For POST, projectId comes from body
  else if (req.method === 'POST') {
    projectId = req.body?.projectId;
  }

  // If no projectId, we can't resolve tenant
  // For GET without projectId, we'll filter by user's tenant in the handler
  if (!projectId) {
    return req.user?.tenantId || null;
  }

  // Resolve tenant from project
  return resolveTenantIdFromProject(projectId);
};

// Main handler that routes based on method
async function handler(
  req: AuthenticatedRequest & {
    body: PostBody;
    validatedQuery?: GetQuery | DeleteQuery;
  },
  res: NextApiResponse
) {
  const { method } = req;

  // Validate HTTP method
  if (!['GET', 'POST', 'DELETE'].includes(method || '')) {
    return apiResponse.methodNotAllowed(res, ['GET', 'POST', 'DELETE']);
  }

  const { tenantId } = req.user!;
  if (!tenantId) {
    throw new ApplicationError(
      ErrorCode.AUTH_UNAUTHORIZED,
      'User tenant not found'
    );
  }

  if (method === 'GET') {
    const { projectId, limit } = req.validatedQuery as GetQuery;

    // SECURITY: Tenant guard has already verified project access if projectId is provided
    // If no projectId, we show all search history for the user's tenant
    const queryOptions: SearchHistoryQueryOptions = {
      orderBy: { timestamp: 'desc' },
      where: {
        ...(projectId && { projectId }),
        // Filter by tenant through project relationship
        project: {
          tenantId: tenantId,
        },
      },
      ...(limit && { take: limit }),
    };

    const searchHistory = await findManySearchHistory(queryOptions as any);

    // Return the search history entries without claimSetVersion enhancement
    return apiResponse.ok(res, searchHistory);
  }

  if (method === 'POST') {
    const { projectId, query, results } = req.body;
    const { id: userId } = req.user!;

    // SECURITY: Tenant guard has already verified that the project belongs to the user's tenant

    // Normalize results to ensure it's an array of NormalizedSearchResult
    let normalizedResults: NormalizedSearchResult[] | undefined;

    if (results) {
      let rawResults: any[] = [];

      if (typeof results === 'string') {
        // Try to parse JSON string
        const parsed = safeJsonParse(results);
        if (Array.isArray(parsed)) {
          rawResults = parsed;
        } else if (
          parsed &&
          typeof parsed === 'object' &&
          'results' in parsed &&
          Array.isArray(parsed.results)
        ) {
          rawResults = parsed.results;
        }
      } else if (Array.isArray(results)) {
        rawResults = results;
      } else if (
        typeof results === 'object' &&
        'results' in results &&
        Array.isArray(results.results)
      ) {
        rawResults = results.results;
      }

      // Use the centralized normalization function
      normalizedResults = normalizeSearchResults(rawResults);
    }

    const searchHistoryEntry = await createSearchHistory({
      projectId,
      userId,
      query,
      results: normalizedResults,
      timestamp: new Date(),
      citationExtractionStatus: 'pending',
    });

    return apiResponse.created(res, searchHistoryEntry);
  }

  if (method === 'DELETE') {
    if (req.user?.role !== 'ADMIN') {
      throw new ApplicationError(
        ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
        'Admin access required'
      );
    }

    const { projectId } = req.validatedQuery as DeleteQuery;

    // SECURITY: Tenant guard has already verified that the project belongs to the admin's tenant
    // Admins can only delete search history within their own tenant

    const searchHistoryIds = await findSearchHistoryIdsByProjectId(projectId);
    if (searchHistoryIds.length > 0) {
      await deletePatentabilityScoresBySearchHistoryIds(searchHistoryIds);
    }
    const result = await deleteSearchHistoryByProjectId(projectId);

    return apiResponse.ok(res, {
      message: `Deleted ${result.count} search history records`,
      deleted: result.count,
    });
  }
}

// SECURITY: This endpoint handles project-scoped search history
// All operations are automatically restricted to the authenticated user's tenant
export default SecurePresets.tenantProtected(
  searchHistoryTenantResolver,
  handler,
  {
    validate: {
      query: {
        // GET and DELETE use query parameters
        GET: getQuerySchema,
        DELETE: deleteQuerySchema,
      } as any,
      body: postBodySchema,
      bodyMethods: ['POST'], // Only POST has a body
    },
    rateLimit: 'api',
  }
);

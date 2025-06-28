import { NextApiResponse, NextApiRequest } from 'next';
import { createApiLogger } from '../../../lib/monitoring/apiLogger';
import { AuthenticatedRequest } from '@/types/middleware';
import {
  findMatchesWithReasoning,
  getCitationMatchWithTenantInfo,
} from '@/repositories/citationRepository';
import { getSearchHistoryWithTenant } from '@/repositories/search';
import { CustomApiRequest } from '@/types/api';
import { z } from 'zod';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { citationReasoningStatusQuerySchema } from '@/lib/validation/schemas/shared/querySchemas';
import { withAuth } from '@/middleware/auth';
import { withTenantGuard } from '@/middleware/authorization';
import { withErrorHandling } from '@/middleware/errorHandling';
import { withRateLimit } from '@/middleware/rateLimiter';
import { requireRole } from '@/middleware/role';
import { withMethod } from '@/middleware/method';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

// No request body needed for this GET-only endpoint
interface EmptyBody {}

/**
 * API Route to check the reasoning status of citation matches
 *
 * GET /api/citation-reasoning/status?searchHistoryId=id
 * GET /api/citation-reasoning/status?matchIds=id1,id2,id3
 */
const handler = async (
  req: CustomApiRequest<EmptyBody>,
  res: NextApiResponse
) => {
  const apiLogger = createApiLogger('citation-reasoning-status');
  apiLogger.info('Citation reasoning status endpoint called');

  // Only allow GET method
  if (req.method !== 'GET') {
    apiLogger.warn('Method not allowed', { method: req.method });
    throw new ApplicationError(
      ErrorCode.VALIDATION_FAILED,
      'Method not allowed'
    );
  }

  // User is already authenticated via withAuth middleware
  const userId = req.user?.id;

  // Query parameters are validated by middleware
  const { searchHistoryId, matchIds } = req.query as z.infer<
    typeof citationReasoningStatusQuerySchema
  >;

  // Validate that we have at least one parameter
  if (!searchHistoryId && !matchIds) {
    apiLogger.warn('Missing required parameters', { userId });
    throw new ApplicationError(
      ErrorCode.VALIDATION_REQUIRED_FIELD,
      'Missing required parameters. Provide either searchHistoryId or matchIds'
    );
  }

  // Parse matchIds if provided
  const matchIdArray = matchIds ? matchIds.split(',') : undefined;

  // ✅ Migrated to repository for consistency and testability
  const matches = await findMatchesWithReasoning(searchHistoryId, matchIdArray);

  apiLogger.info(
    `Found ${matches.length} citation matches with reasoning status`,
    { userId }
  );

  // Count matches by status
  const statusCounts = matches.reduce(
    (acc: Record<string, number>, match: any) => {
      const status = match.reasoningStatus || 'NONE';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {}
  );

  // Return the matches and counts
  return res.status(200).json({
    success: true,
    totalMatches: matches.length,
    statusCounts,
    matches,
  });
};

// Since this endpoint can reference search history or citation matches, we'll use flexible tenant resolution
const resolveTenantId = async (
  req: AuthenticatedRequest
): Promise<string | null> => {
  const { searchHistoryId, matchIds } = req.query as z.infer<
    typeof citationReasoningStatusQuerySchema
  >;

  if (searchHistoryId) {
    const searchHistory = await getSearchHistoryWithTenant(searchHistoryId);
    return searchHistory?.tenantId || null;
  } else if (matchIds) {
    const ids = matchIds.split(',');
    const citationMatch = await getCitationMatchWithTenantInfo(ids[0]); // Use first match for tenant validation
    return citationMatch?.searchHistory?.project?.tenantId || null;
  }

  return null;
};

// Use the new secure preset to simplify the middleware chain
export default SecurePresets.tenantProtected(resolveTenantId, handler, {
  validate: {
    query: citationReasoningStatusQuerySchema,
  },
});

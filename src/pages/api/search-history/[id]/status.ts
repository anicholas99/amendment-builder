import type { NextApiResponse, NextApiRequest } from 'next';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import {
  findSearchHistoryById,
  getSearchHistoryWithTenant,
} from '../../../../repositories/searchRepository';
import { AuthenticatedRequest } from '@/types/middleware';
import { CustomApiRequest } from '@/types/api';
import { hasProperty } from '@/types/safe-type-helpers';
import { idQuerySchema } from '@/lib/validation/schemas/shared/querySchemas';
import { z } from 'zod';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { SecurePresets } from '@/server/api/securePresets';

const apiLogger = createApiLogger('search-history-status');

// No request body needed for this GET-only endpoint
interface EmptyBody {}

/**
 * API endpoint to get the citation extraction status for a specific search history entry.
 */
const handler = async (
  req: CustomApiRequest<EmptyBody>,
  res: NextApiResponse
): Promise<void> => {
  apiLogger.logRequest(req);

  // Query parameters are validated by middleware
  const { id } = (req as any).validatedQuery as z.infer<typeof idQuerySchema>;

  // User is already authenticated via middleware
  const userId = (req as AuthenticatedRequest).user!.id;

  apiLogger.info('Fetching search history status', {
    userId,
    searchHistoryId: id,
  });

  apiLogger.debug('Fetching status for searchHistoryId', {
    searchHistoryId: id,
  });

  // Fetch the full record (workaround for select type issue)
  const searchEntry = await findSearchHistoryById(id);

  if (!searchEntry) {
    apiLogger.warn('Search history entry not found', { searchHistoryId: id });
    throw new ApplicationError(
      ErrorCode.DB_RECORD_NOT_FOUND,
      'Search history entry not found'
    );
  }

  // Access status using type guard for better type safety
  const status = hasProperty(searchEntry, 'citationExtractionStatus')
    ? searchEntry.citationExtractionStatus
    : null;

  apiLogger.debug('Found status', { searchHistoryId: id, status });

  const response = {
    searchHistoryId: id,
    status: status || 'unknown', // Return 'unknown' if null/undefined
  };
  apiLogger.logResponse(200, response);
  return res.status(200).json({
    success: true,
    data: response,
  });
};

// Custom tenant resolver for the [id] route
const searchHistoryByIdTenantResolver = async (
  req: AuthenticatedRequest
): Promise<string | null> => {
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return null;
  }

  const searchHistory = await getSearchHistoryWithTenant(id);
  return searchHistory?.tenantId || null;
};

// SECURITY: This endpoint is tenant-protected using search history-based resolution
// Users can only check status for search history entries within their own tenant
export default SecurePresets.tenantProtected(
  searchHistoryByIdTenantResolver,
  handler,
  {
    validate: {
      query: idQuerySchema, // Always validate the ID parameter
    },
    rateLimit: 'api', // Use standard API rate limit for status polling
  }
);

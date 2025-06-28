/**
 * API Route: /api/search-history/[id]/citation-matches
 *
 * Retrieves all CitationMatch records associated with a specific SearchHistory ID.
 */
import type { NextApiResponse, NextApiRequest } from 'next';
import { createApiLogger } from '@/lib/monitoring/apiLogger'; // Use alias
import {
  findCitationMatchesBySearchHistoryWithAuth,
  getSearchHistoryWithTenant,
} from '@/repositories/searchRepository';
import { CustomApiRequest } from '@/types/api';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { idQuerySchema } from '@/lib/validation/schemas/shared/querySchemas';
import { serializeCitationMatch } from '@/features/citation-extraction/utils/citation';
import { SecurePresets } from '@/lib/api/securePresets';

const apiLogger = createApiLogger('search-history-citation-matches');

// No request body needed for this GET-only endpoint
interface EmptyBody {}

// Use the id query schema directly
const querySchema = idQuerySchema;

const handler = async (
  req: CustomApiRequest<EmptyBody>,
  res: NextApiResponse
): Promise<void> => {
  apiLogger.logRequest(req);

  // Only allow GET requests
  if (req.method !== 'GET') {
    apiLogger.warn('Method not allowed', { method: req.method });
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  // Query parameters are validated by middleware
  const { id: searchHistoryId } = (req as any).validatedQuery as z.infer<
    typeof querySchema
  >;

  // User is already authenticated via withAuth middleware
  const userId = req.user?.id;

  if (!userId) {
    apiLogger.error('User ID not found in authenticated request');
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    apiLogger.info('Fetching citation matches for search history', {
      userId,
      searchHistoryId,
    });

    // Use repository function to fetch citation matches with built-in authorization
    const allCitationMatches = await findCitationMatchesBySearchHistoryWithAuth(
      searchHistoryId,
      userId
    );

    // Serialize the matches for backward compatibility
    const serializedMatches = allCitationMatches.map(serializeCitationMatch);

    apiLogger.info(
      `[API/citation-matches] Returning ${serializedMatches.length} matches for SearchHistory ${searchHistoryId}`
    );
    res.status(200).json(serializedMatches);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    apiLogger.error('Error fetching citation matches', {
      error: err,
      searchHistoryId,
    });
    res
      .status(500)
      .json({ error: 'Internal server error fetching citation matches' });
  }
};

export default SecurePresets.tenantProtected(
  async (req: AuthenticatedRequest) => {
    const { id: searchHistoryId } = req.query;
    if (!searchHistoryId) return null;

    try {
      const searchHistory = await getSearchHistoryWithTenant(
        String(searchHistoryId)
      );

      if (!searchHistory) {
        apiLogger.warn('Search history not found for tenant resolution', {
          searchHistoryId,
        });
        return null;
      }
      return searchHistory.tenantId || null;
    } catch (error) {
      apiLogger.error('Error resolving tenant ID', {
        searchHistoryId,
        error,
      });
      return null;
    }
  },
  handler,
  {
    validate: {
      query: querySchema,
    },
  }
);

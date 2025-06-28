import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import {
  findSearchHistoryById,
  updateSearchHistory,
  getSearchHistoryWithTenant,
} from '../../../repositories/searchRepository';
import { AuthenticatedRequest } from '@/types/middleware';
import { CustomApiRequest } from '@/types/api';
import { SecurePresets } from '@/lib/api/securePresets';

const apiLogger = createApiLogger('search-history-update');

// Define request body type
interface UpdateSearchHistoryRequestBody {
  searchHistoryId: string;
  query: string;
  results?: any; // Search results only
}

// Zod schema
const bodySchema = z.object({
  searchHistoryId: z.string(),
  query: z.string().min(1),
  results: z.any().optional(), // Search results in any format
});

/**
 * API endpoint to update an existing search history entry with search results
 * This is called after a search is executed to update the entry created by
 * saveParsedElements with the actual search results.
 *
 * Note: Parsed elements are now stored in ClaimSetVersion, not SearchHistory
 */
async function handler(
  req: CustomApiRequest<UpdateSearchHistoryRequestBody>,
  res: NextApiResponse
): Promise<void> {
  apiLogger.logRequest(req);

  // Only allow PUT requests
  if (req.method !== 'PUT') {
    apiLogger.warn('Method not allowed', { method: req.method });
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // User is already authenticated via withAuth middleware
  const userId = req.user?.id;

  try {
    // Extract data from request body
    const { searchHistoryId, query, results } = req.body;

    // Validate required fields
    if (!searchHistoryId) {
      apiLogger.warn(
        'Missing searchHistoryId in search-history/update request'
      );
      res.status(400).json({ error: 'Missing searchHistoryId' });
      return;
    }

    if (!query) {
      apiLogger.warn('Missing query in search-history/update request');
      res.status(400).json({ error: 'Missing query' });
      return;
    }

    apiLogger.info('Updating search history with results', {
      userId,
      searchHistoryId,
      queryLength: query.length,
      hasResults: !!results,
    });

    // Find the existing search history entry
    const existingEntry = await findSearchHistoryById(searchHistoryId);

    if (!existingEntry) {
      apiLogger.warn('Search history entry not found', { searchHistoryId });
      res.status(404).json({ error: 'Search history entry not found' });
      return;
    }

    // Update the search history entry with only search-specific data
    const updatedEntry = await updateSearchHistory(searchHistoryId, {
      query,
      timestamp: new Date(), // Update timestamp
      results: results || [], // Store search results
    });

    if (!updatedEntry) {
      apiLogger.error('Failed to update search history');
      res.status(500).json({ error: 'Failed to update search history' });
      return;
    }

    apiLogger.info('Search history updated successfully', {
      userId,
      searchHistoryId: updatedEntry.id,
    });

    // Return success and the updated entry ID
    const response = {
      success: true,
      id: updatedEntry.id,
    };
    apiLogger.logResponse(200, response);
    res.status(200).json(response);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    apiLogger.error('Error updating search history with results', {
      error: err,
      userId,
      operation: 'updateSearchHistoryHandler',
    });
    res.status(500).json({
      error: 'An error occurred while updating search history',
      details: err.message,
    });
  }
}

// SECURITY: This endpoint is tenant-protected with a custom resolver
// The resolver validates that the search history belongs to the user's tenant
export default SecurePresets.tenantProtected(
  async (req: AuthenticatedRequest) => {
    const { searchHistoryId } = req.body;
    if (!searchHistoryId) return null;
    const searchHistory = await getSearchHistoryWithTenant(searchHistoryId);
    return searchHistory?.tenantId || null;
  },
  handler,
  {
    validate: {
      body: bodySchema,
      bodyMethods: ['PUT'], // Only PUT needs body validation
    },
    rateLimit: 'api',
  }
);

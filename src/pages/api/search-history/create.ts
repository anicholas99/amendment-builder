import type { NextApiRequest, NextApiResponse } from 'next';
import { CustomApiRequest } from '@/types/api';
import { z } from 'zod';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { createSearchHistory } from '@/repositories/searchRepository';
import { AuthenticatedRequest } from '@/types/middleware';
import { TenantServerService } from '@/server/services/tenant.server.service';
import { hasProperty } from '@/types/safe-type-helpers';
import { SecurePresets } from '@/lib/api/securePresets';
import { normalizeSearchResults } from '@/features/search/utils/searchHistory';

interface CreateSearchHistoryBody {
  projectId: string;
  query: string;
  results?: unknown[] | string;
  documentId?: string;
}

const apiLogger = createApiLogger('search-history-create');

// Zod schema for request body
const bodySchema = z.object({
  projectId: z.string(),
  query: z.string().min(1),
  results: z.union([z.string(), z.array(z.any())]).optional(),
  documentId: z.string().optional(),
});

/**
 * Creates a new search history entry with results.
 */
async function handler(
  req: CustomApiRequest<CreateSearchHistoryBody>,
  res: NextApiResponse
): Promise<void> {
  apiLogger.logRequest(req);

  // Only allow POST requests
  if (req.method !== 'POST') {
    apiLogger.warn('Method not allowed', { method: req.method });
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // User is guaranteed by middleware
  const { id: userId } = (req as AuthenticatedRequest).user!;

  try {
    // Extract data from request body
    const {
      projectId,
      query,
      results = [],
      documentId,
    } = req.body as {
      projectId: string;
      query: string;
      results?: unknown[] | string;
      documentId?: string;
    };

    // Log request
    apiLogger.info('Processing search history create request', {
      userId,
      projectId,
      documentId: documentId || 'N/A',
      resultsCount: Array.isArray(results) ? results.length : results ? 1 : 0,
    });

    // Validation handled by middleware

    // Parse results if they're a string
    const parsedResults =
      typeof results === 'string' ? JSON.parse(results) : results;

    // Use centralized normalization
    const normalizedResults = normalizeSearchResults(
      Array.isArray(parsedResults) ? parsedResults : []
    );

    apiLogger.info('Creating search history entry', {
      userId,
      projectId,
      documentId: documentId || 'N/A',
    });

    // Create the search history entry using repository function
    const searchHistoryEntry = await createSearchHistory({
      query,
      timestamp: new Date(),
      results: normalizedResults,
      userId,
      projectId,
    });

    if (!searchHistoryEntry) {
      apiLogger.error('Failed to create search history entry');
      res.status(500).json({
        error: 'Failed to create search history entry',
        details: 'Database operation returned null',
      });
      return;
    }

    apiLogger.info('Search history created successfully', {
      userId,
      searchHistoryId: searchHistoryEntry.id,
      projectId,
    });

    // Return success response
    const response = {
      success: true,
      id: searchHistoryEntry.id,
    };

    apiLogger.logResponse(200, response);
    res.status(200).json(response);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    apiLogger.error('Error creating search history', {
      error: err,
      userId,
      projectId: req.body?.projectId,
      operation: 'createSearchHistoryHandler',
    });

    res.status(500).json({
      error: 'An error occurred while creating search history',
      details: err.message,
    });
  }
}

// Custom tenant resolver for project-based resources
const resolveTenantId = async (
  req: AuthenticatedRequest
): Promise<string | null> => {
  const { projectId } = req.body;
  if (!projectId) return null;

  return TenantServerService.getTenantIdForProject(projectId);
};

// SECURITY: This endpoint is tenant-protected with a custom resolver
// The resolver validates that the projectId in the request body belongs to the user's tenant
export default SecurePresets.tenantProtected(resolveTenantId, handler, {
  validate: {
    body: bodySchema,
    bodyMethods: ['POST'], // Only POST needs body validation
  },
  rateLimit: 'api',
});

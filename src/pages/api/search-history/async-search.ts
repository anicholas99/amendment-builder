/**
 * Async Search API - Starts search processing in background
 * Returns immediately with a job ID that client can poll for results
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { TenantServerService } from '@/server/services/tenant.server.service';
import {
  createSearchHistory,
  updateSearchHistory,
} from '@/repositories/search/searchHistory.repository';
import environment from '@/config/environment';
import { AuthenticatedRequest } from '@/types/middleware';
import { CustomApiRequest } from '@/types/api';
import {
  executeSemanticSearch,
  ExtendedSearchResponse,
} from '@/server/services/semantic-search.server-service';
import { normalizeSearchResults } from '@/features/search/utils/searchHistory';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

const apiLogger = createApiLogger('async-search');

// Type definitions
type ParsedElement = {
  id: string;
  type: string;
  text: string;
  [key: string]: unknown;
};

type SearchFilters = {
  cpcs?: string[];
  ipcrs?: string[];
  jurisdiction?: string;
};

// Request body validation schema
const AsyncSearchRequestSchema = z.object({
  projectId: z.string().min(1),
  searchQueries: z.array(z.string().min(1)),
  searchType: z.string().optional().default('FullText'),
  filters: z
    .object({
      cpcs: z.array(z.string()).optional(),
      ipcrs: z.array(z.string()).optional(),
      jurisdiction: z.string().optional().default('US'),
    })
    .optional(),
  parsedElements: z
    .union([
      z.string(),
      z.array(
        z
          .object({
            id: z.string(),
            type: z.string(),
            text: z.string(),
          })
          .passthrough()
      ),
    ])
    .optional(), // Store parsed elements if provided
});

type AsyncSearchRequest = z.infer<typeof AsyncSearchRequestSchema>;

/**
 * Handler for async search requests
 */
async function handler(
  req: CustomApiRequest<AsyncSearchRequest>,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  apiLogger.logRequest(req);

  // User is guaranteed by middleware
  const userId = (req as AuthenticatedRequest).user!.id;

  try {
    const { projectId, searchQueries, searchType, filters, parsedElements } =
      req.body;

    // Create search history entry with 'processing' status
    const searchHistory = await createSearchHistory({
      projectId,
      userId,
      query: searchQueries.join(' | '),
      timestamp: new Date(), // Convert to Date as expected
      citationExtractionStatus: 'processing', // Reuse this field for search status
      results: [], // Initialize with empty results array
    });

    if (!searchHistory) {
      throw new ApplicationError(
        ErrorCode.DB_QUERY_ERROR,
        'Failed to create search history'
      );
    }

    apiLogger.info('Search job created', {
      searchId: searchHistory.id,
      projectId,
      queryCount: searchQueries.length,
    });

    // Queue background processing (add to your queue system)
    await queueAsyncSearch({
      searchId: searchHistory.id,
      projectId,
      queries: searchQueries,
      searchType,
      filters: filters || {},
      parsedElements,
    });

    // Return immediately with job ID
    const response = {
      searchId: searchHistory.id,
      status: 'processing',
      message:
        'Search started. Use /api/search-history/[id]/status to check progress.',
    };

    apiLogger.logResponse(202, response);
    res.status(202).json(response);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    apiLogger.error('Error starting async search', {
      error: err,
      userId,
      projectId: req.body?.projectId,
    });

    res.status(500).json({
      error: 'Failed to start search',
      details: err.message,
    });
  }
}

/**
 * Queue async search for background processing
 */
async function queueAsyncSearch(params: {
  searchId: string;
  projectId: string;
  queries: string[];
  searchType: string;
  filters: SearchFilters;
  parsedElements?: string | ParsedElement[];
}) {
  // TODO: Implement your queue system here
  // For now, process immediately in background
  setImmediate(async () => {
    try {
      await processAsyncSearch(params);
    } catch (error) {
      apiLogger.error('Background search processing failed', {
        searchId: params.searchId,
        error,
      });
    }
  });
}

/**
 * Process search in background
 */
async function processAsyncSearch(params: {
  searchId: string;
  projectId: string;
  queries: string[];
  searchType: string;
  filters: SearchFilters;
  parsedElements?: string | ParsedElement[];
}) {
  const { executeSemanticSearch } = await import(
    '@/server/services/semantic-search.server-service'
  );
  const { updateSearchHistory } = await import(
    '@/repositories/searchRepository'
  );
  const { normalizeSearchResults } = await import(
    '@/features/search/utils/searchHistory'
  );

  try {
    apiLogger.info('Starting background search processing', {
      searchId: params.searchId,
    });

    // Execute semantic search
    const searchResult = await executeSemanticSearch(
      {
        searchInputs: params.queries,
        filterCPCs: params.filters.cpcs,
        filterIPCRs: params.filters.ipcrs,
        jurisdiction: params.filters.jurisdiction,
        projectId: params.projectId,
      },
      environment.aiapi.apiKey
    );

    // Use centralized normalization
    const normalizedResults = normalizeSearchResults(
      searchResult.results || []
    );

    // Update search history with results
    await updateSearchHistory(params.searchId, {
      results: normalizedResults,
      citationExtractionStatus: 'completed',
    });

    apiLogger.info('Background search completed', {
      searchId: params.searchId,
      resultCount: normalizedResults.length,
    });
  } catch (error) {
    // Mark as failed
    await updateSearchHistory(params.searchId, {
      citationExtractionStatus: 'failed',
    });

    apiLogger.error('Background search failed', {
      searchId: params.searchId,
      error,
    });
  }
}

// Custom tenant resolver for project-based search
const projectBasedSearchTenantResolver = async (
  req: AuthenticatedRequest
): Promise<string | null> => {
  const { projectId } = req.body as { projectId?: string };
  if (!projectId) return null;

  return TenantServerService.getTenantIdForProject(projectId);
};

// Use the new secure preset
export default SecurePresets.tenantProtected(
  projectBasedSearchTenantResolver,
  handler,
  {
    validate: {
      body: AsyncSearchRequestSchema,
    },
  }
);

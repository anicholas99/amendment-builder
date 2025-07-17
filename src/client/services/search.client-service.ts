/**
 * Client-side service for search operations.
 */
import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/utils/clientLogger';
import { SavedPriorArt } from '@/types/domain/priorArt';
import { ProcessedSearchHistoryEntry } from '@/types/domain/searchHistory';

// Type definitions - TODO: Move to proper types file
export interface SearchRequestBody {
  projectId: string;
  query?: string;
  parsedElements?: string[];
  limit?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  query: string;
  searchId?: string;
}

export interface CombinedSearchData {
  id: string;
  projectId: string;
  query: string;
  results: SearchResult[];
  timestamp: string;
  status?: string;
}

export interface ProjectExclusion {
  id: string;
  projectId: string;
  patentNumber: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult {
  patentNumber: string;
  title: string;
  abstract?: string;
  relevance: number;
  [key: string]: unknown;
}

export interface SearchHistoryEntry {
  id: string;
  projectId: string;
  status: string;
  searchType?: string;
  query?: string;
  results?: SearchResult[];
  createdAt: string;
  updatedAt: string;
}

export interface SearchHistoryDataResponse {
  searchHistory: SearchHistoryEntry[];
  exclusions: ProjectExclusion[];
  savedPriorArt: SavedPriorArt[];
}

// Parameter types for the methods
export interface StartAsyncSearchParams {
  projectId: string;
  searchQueries: string[];
  parsedElements?: string[];
  metadata?: Record<string, unknown>;
}

export interface SemanticSearchParams {
  projectId: string;
  query: string;
  parsedElements?: string[];
}

export type SemanticSearchResponse = ProcessedSearchHistoryEntry;

/**
 * API client functions for search and search history operations.
 */
export class SearchApiService {
  /**
   * Get project exclusions
   */
  static async getProjectExclusions(
    projectId: string
  ): Promise<ProjectExclusion[]> {
    if (!projectId) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Project ID is required'
      );
    }

    try {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.EXCLUSIONS(projectId)
      );
      const data = await response.json();

      // Handle the standardized response format
      // apiResponse.ok() wraps data in { data: ... }
      if (data.data && data.data.exclusions) {
        return data.data.exclusions;
      }

      // Fallback for legacy format
      return data.exclusions || [];
    } catch (error) {
      logger.error('Error fetching project exclusions', { error });
      throw error instanceof ApplicationError
        ? error
        : new ApplicationError(
            ErrorCode.API_NETWORK_ERROR,
            'Failed to fetch project exclusions'
          );
    }
  }

  /**
   * Add project exclusion
   */
  static async addProjectExclusion(
    projectId: string,
    patentNumbers: string[],
    metadata?: Record<string, unknown>
  ): Promise<{ success: boolean; added?: number; skipped?: number }> {
    if (!projectId || !patentNumbers || patentNumbers.length === 0) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Project ID and patent numbers are required'
      );
    }

    try {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.EXCLUSIONS(projectId),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patentNumbers, metadata }),
        }
      );

      const data = await response.json();

      // Handle the new response format with "added" and "skipped" fields
      if (data.added !== undefined) {
        return {
          success: true,
          added: data.added,
          skipped: data.skipped,
        };
      }

      // Fallback for legacy format
      return data;
    } catch (error) {
      logger.error('Error adding project exclusion', { error });
      throw error instanceof ApplicationError
        ? error
        : new ApplicationError(
            ErrorCode.API_NETWORK_ERROR,
            'Failed to add project exclusion'
          );
    }
  }

  /**
   * Remove project exclusion
   */
  static async removeProjectExclusion(
    projectId: string,
    patentNumber: string
  ): Promise<{ success: boolean; message?: string }> {
    if (!projectId || !patentNumber) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Project ID and patent number are required'
      );
    }

    try {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.EXCLUSIONS(projectId),
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patentNumber }),
        }
      );

      const data = await response.json();

      // Handle the new response format with "message" field
      if (data.message) {
        return {
          success: data.success,
          message: data.message,
        };
      }

      // Fallback for legacy format
      return data;
    } catch (error) {
      logger.error('Error removing project exclusion', { error });
      throw error instanceof ApplicationError
        ? error
        : new ApplicationError(
            ErrorCode.API_NETWORK_ERROR,
            'Failed to remove project exclusion'
          );
    }
  }

  /**
   * Start an asynchronous search (returns immediately with search ID and entry)
   */
  static async startAsyncSearch(request: StartAsyncSearchParams): Promise<{
    searchId: string;
    searchHistory?: ProcessedSearchHistoryEntry;
  }> {
    const response = await apiFetch(API_ROUTES.SEARCH_HISTORY.ASYNC_SEARCH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: request.projectId,
        searchQueries: request.searchQueries,
        parsedElements: request.parsedElements,
        metadata: request.metadata,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to start async search: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create search history entry
   */
  static async createSearchHistory(request: {
    projectId: string;
    searchType?: string;
    query?: string;
    results?: SearchResult[];
  }): Promise<SearchHistoryEntry> {
    if (!request.projectId) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Project ID is required'
      );
    }

    try {
      const response = await apiFetch(API_ROUTES.SEARCH_HISTORY.CREATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      return await response.json();
    } catch (error) {
      logger.error('Error creating search history', { error });
      throw error instanceof ApplicationError
        ? error
        : new ApplicationError(
            ErrorCode.API_NETWORK_ERROR,
            'Failed to create search history'
          );
    }
  }

  /**
   * Get search history data for a project
   */
  static async getSearchHistoryData(
    projectId: string
  ): Promise<SearchHistoryDataResponse> {
    if (!projectId) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Project ID is required'
      );
    }

    try {
      // Fetch exclusions and saved prior art in parallel
      const [exclusionsRes, priorArtRes, searchHistoryRes] = await Promise.all([
        apiFetch(API_ROUTES.PROJECTS.EXCLUSIONS(projectId)),
        apiFetch(API_ROUTES.PROJECTS.PRIOR_ART.LIST(projectId)),
        apiFetch(API_ROUTES.PROJECTS.SEARCH_HISTORY(projectId)),
      ]);

      const exclusionsJson = await exclusionsRes.json();
      const priorArtJson = await priorArtRes.json();
      const searchHistoryJson = await searchHistoryRes.json();

      // Handle the standardized response format
      // All endpoints should use apiResponse.ok() which wraps data in { data: ... }
      const exclusions =
        exclusionsJson.data?.exclusions ?? exclusionsJson.exclusions ?? [];
      const priorArt =
        priorArtJson.data?.priorArt ?? priorArtJson.priorArt ?? [];
      const searchHistory =
        searchHistoryJson.data?.searchHistory ??
        searchHistoryJson.searchHistory ??
        [];

      return {
        searchHistory,
        exclusions,
        savedPriorArt: priorArt,
      } as SearchHistoryDataResponse;
    } catch (error) {
      logger.error('Error fetching search history composite data', { error });
      throw error instanceof ApplicationError
        ? error
        : new ApplicationError(
            ErrorCode.API_NETWORK_ERROR,
            'Failed to fetch search history data'
          );
    }
  }

  /**
   * Parse claim - delegates to ClaimsClientService
   * TODO: This should be removed once all consumers are updated to use ClaimsClientService directly
   */
  static async parseClaim(request: {
    projectId: string;
    claimOneText: string;
    [key: string]: any;
  }): Promise<{ parsedElements: string[] }> {
    // Import dynamically to avoid circular dependencies
    const { ClaimsClientService } = await import('./claims.client-service');

    const result = await ClaimsClientService.parseClaimElements(
      request.claimOneText,
      request.projectId,
      request.claimSetVersionId,
      request.allClaims,
      request.background ?? true
    );

    // Result is already string[]
    return { parsedElements: result };
  }

  /**
   * Generate queries - delegates to ClaimsClientService
   * TODO: This should be removed once all consumers are updated to use ClaimsClientService directly
   */
  static async generateQueries(request: {
    parsedElements: string[];
    projectId?: string;
  }): Promise<{ queries: string[]; searchQueries?: string[] }> {
    // Import dynamically to avoid circular dependencies
    const { ClaimsClientService } = await import('./claims.client-service');

    const queries = await ClaimsClientService.generateSearchQueries(
      request.parsedElements,
      request.projectId || ''
    );

    return { queries, searchQueries: queries };
  }

  /**
   * Get citation location result by job ID
   */
  static async getCitationLocationResult(jobId: string): Promise<{
    status: number;
    [key: string]: any;
  }> {
    if (!jobId) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Job ID is required'
      );
    }

    try {
      const response = await apiFetch(
        API_ROUTES.CITATION_LOCATION.RESULT(jobId)
      );

      const result = await response.json();

      // Handle wrapped response format - API returns { data: locationResult }
      const unwrappedResult = result.data || result;

      return unwrappedResult;
    } catch (error) {
      logger.error('Error fetching citation location result', { error });
      throw error instanceof ApplicationError
        ? error
        : new ApplicationError(
            ErrorCode.API_NETWORK_ERROR,
            'Failed to fetch citation location result'
          );
    }
  }

  /**
   * Perform a search
   */
  static async search(request: SearchRequestBody): Promise<SearchResponse> {
    const response = await apiFetch(API_ROUTES.PRIOR_ART.SEARCH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get search history for a project
   */
  static async getSearchHistory(
    projectId: string
  ): Promise<CombinedSearchData[]> {
    const response = await apiFetch(
      API_ROUTES.PROJECTS.SEARCH_HISTORY(projectId)
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch search history: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get a specific search by ID
   */
  static async getSearchById(searchId: string): Promise<CombinedSearchData> {
    const response = await apiFetch(API_ROUTES.SEARCH_HISTORY.BY_ID(searchId));

    if (!response.ok) {
      throw new Error(`Failed to fetch search: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete a search entry
   */
  static async deleteSearch(searchId: string): Promise<void> {
    const response = await apiFetch(API_ROUTES.SEARCH_HISTORY.BY_ID(searchId), {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete search: ${response.statusText}`);
    }
  }

  /**
   * Poll for async search status
   */
  static async getAsyncSearchStatus(
    projectId: string,
    searchId: string
  ): Promise<ProcessedSearchHistoryEntry> {
    const response = await apiFetch(
      `${API_ROUTES.SEARCH_HISTORY.ASYNC_SEARCH}/${searchId}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get search status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Performs a semantic search for prior art
   */
  static async semanticSearch(
    request: SemanticSearchParams
  ): Promise<SemanticSearchResponse> {
    logger.info('Starting semantic search request', {
      projectId: request.projectId,
      queryLength: request.query.length,
    });

    try {
      const response = await apiFetch(API_ROUTES.SEARCH_HISTORY.ASYNC_SEARCH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: request.projectId,
          searchQueries: [request.query],
          searchType: 'semantic',
          parsedElements: request.parsedElements,
          filters: {
            jurisdiction: 'US',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Semantic search failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      logger.error('Error performing semantic search', { error });
      throw error instanceof ApplicationError
        ? error
        : new ApplicationError(
            ErrorCode.API_NETWORK_ERROR,
            'Failed to perform semantic search'
          );
    }
  }

  /**
   * Perform a synchronous semantic search
   */
  static async performSemanticSearch(
    request: SemanticSearchParams
  ): Promise<SearchResult> {
    const response = await apiFetch(API_ROUTES.PRIOR_ART.SEARCH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: request.query,
        parsedElements: request.parsedElements,
        projectId: request.projectId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Semantic search failed: ${response.statusText}`);
    }

    return response.json();
  }
}

/**
 * Client-side API service for all citation-related operations.
 * Consolidates jobs, matches, and other citation functionalities.
 */
import { apiFetch } from '@/lib/api/apiClient';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/lib/monitoring/logger';
import { API_ROUTES } from '@/constants/apiRoutes';
import {
  CitationMatch,
  CitationMatchesListSchema,
} from '@/types/api/responses';
import { validateApiResponse } from '@/lib/validation/apiValidation';
import { CitationJob } from '@/types/citation';
import { CITATION_THRESHOLDS } from '@/config/citationExtractionConfig';
// import { CitationMatch } from '@/types/searchTypes'; // TODO: Fix this import

export interface ReferenceMetadata {
  referenceNumber: string;
  title?: string;
  abstract?: string;
  publicationDate?: string;
  inventors?: string[];
  assignee?: string;
  applicant?: string;
  classification?: string;
  priorityDate?: string;
  filingDate?: string;
  patentFamily?: string;
  legalStatus?: string;
  citationCount?: number;
  [key: string]: string | string[] | number | undefined;
}

export class CitationClientService {
  private static readonly API_BASE = '/api';
  private static readonly AUTH_HEADERS: HeadersInit = {
    'Content-Type': 'application/json',
  };

  /**
   * Get citation matches for a given search history ID.
   * @param searchId The search history ID.
   * @returns Promise with an array of citation matches.
   */
  static async getCitationMatches(searchId: string): Promise<CitationMatch[]> {
    try {
      logger.debug(`Getting citation matches for searchId: ${searchId}`);
      const url = API_ROUTES.SEARCH_HISTORY.CITATION_MATCHES(searchId);
      const response = await apiFetch(url, { method: 'GET' });
      const data = await response.json();
      logger.debug('Citation matches fetched', {
        searchId,
        count: data.length,
      });
      return validateApiResponse(data, CitationMatchesListSchema);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error in getCitationMatches', {
        error: errorMessage,
        searchId,
      });
      throw new Error(`Failed to fetch citation matches: ${errorMessage}`);
    }
  }

  /**
   * Creates a new citation extraction job.
   * This is the modern way to "save" or "generate" citation results.
   */
  static async createCitationJob(
    searchId: string,
    referenceNumber?: string,
    parsedElements?: string[],
    threshold: number = CITATION_THRESHOLDS.default
  ): Promise<{ success: boolean; jobId?: string | number }> {
    try {
      // If parsedElements not provided, we need to get them from the project
      let searchInputs = parsedElements || [];

      if (searchInputs.length === 0) {
        logger.debug(
          '[CitationClientService] No parsed elements provided, fetching from project'
        );

        try {
          // Get search history to find the project ID
          const searchResponse = await apiFetch(
            API_ROUTES.SEARCH_HISTORY.BY_ID(searchId)
          );

          if (!searchResponse.ok) {
            // If we get a 404, log it but continue - we'll try to proceed without parsed elements
            if (searchResponse.status === 404) {
              logger.warn(
                '[CitationClientService] Search history not found, proceeding without parsed elements',
                {
                  searchId,
                  status: searchResponse.status,
                }
              );
            } else {
              throw new ApplicationError(
                ErrorCode.API_INVALID_RESPONSE,
                `Failed to fetch search history: ${searchResponse.status}`
              );
            }
          } else {
            const searchData = await searchResponse.json();
            logger.debug('[CitationClientService] Search history data', {
              searchId,
              projectId: searchData.projectId,
              hasProject: !!searchData.projectId,
            });

            // Get parsed elements from the project
            if (searchData.projectId) {
              searchInputs = await this.getParsedClaimElements(
                searchData.projectId
              );
              logger.debug(
                '[CitationClientService] Fetched parsed elements from project',
                {
                  projectId: searchData.projectId,
                  elementsCount: searchInputs.length,
                  firstElement: searchInputs[0],
                }
              );
            } else {
              logger.warn(
                '[CitationClientService] No projectId found in search history',
                {
                  searchId,
                  searchData,
                }
              );
            }
          }
        } catch (error) {
          // Log the error but don't fail - we'll try to proceed without parsed elements
          logger.warn(
            '[CitationClientService] Error fetching search history or parsed elements, proceeding without them',
            {
              searchId,
              error,
            }
          );
        }
      }

      logger.debug('[CitationClientService] Final search inputs', {
        searchId,
        searchInputsCount: searchInputs.length,
        searchInputs,
        threshold, // Log the threshold being used
      });

      if (searchInputs.length === 0) {
        throw new ApplicationError(
          ErrorCode.VALIDATION_FAILED,
          'No claim elements found for citation extraction. Please ensure you have saved your claims in the "Claims" tab before running citation extraction. If you have already saved claims, please refresh the page and try again.'
        );
      }

      const response = await apiFetch(API_ROUTES.CITATION_JOBS.CREATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchInputs,
          filterReferenceNumber: referenceNumber,
          searchHistoryId: searchId,
          threshold, // Use the passed threshold parameter
        }),
      });

      return response.json();
    } catch (error) {
      logger.error('[CitationClientService] Failed to create citation job', {
        error,
        searchId,
        referenceNumber,
      });
      throw error;
    }
  }

  static async getCitationJobsBySearchHistoryId(
    searchHistoryId: string
  ): Promise<CitationJob[]> {
    try {
      const response = await apiFetch(
        `${API_ROUTES.CITATION_JOBS.LIST}?searchHistoryId=${searchHistoryId}`
      );
      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          'Failed to fetch citation jobs'
        );
      }
      return response.json();
    } catch (error) {
      logger.error(
        '[CitationClientService] Error fetching citation jobs by search history id',
        { error, searchHistoryId }
      );
      throw error;
    }
  }

  static async getCitationJobsForMultipleSearches(
    searchHistoryIds: string[]
  ): Promise<Record<string, CitationJob[]>> {
    try {
      // Make parallel GET requests for each search history ID
      const promises = searchHistoryIds.map(async searchHistoryId => {
        try {
          const response = await apiFetch(
            `${API_ROUTES.CITATION_JOBS.LIST}?searchHistoryId=${searchHistoryId}`
          );
          if (!response.ok) {
            throw new ApplicationError(
              ErrorCode.API_INVALID_RESPONSE,
              `Failed to fetch citation jobs for search history ${searchHistoryId}`
            );
          }
          const jobs = await response.json();
          return { searchHistoryId, jobs };
        } catch (error) {
          logger.warn(
            `[CitationClientService] Failed to fetch citation jobs for search history ${searchHistoryId}`,
            { error }
          );
          // Return empty array for failed requests to avoid breaking the entire batch
          return { searchHistoryId, jobs: [] };
        }
      });

      const results = await Promise.all(promises);

      // Convert array of results to a Record
      const jobsBySearchId: Record<string, CitationJob[]> = {};
      results.forEach(({ searchHistoryId, jobs }) => {
        jobsBySearchId[searchHistoryId] = jobs;
      });

      return jobsBySearchId;
    } catch (error) {
      logger.error(
        '[CitationClientService] Error fetching citation jobs for multiple searches',
        { error, searchHistoryIds }
      );
      throw error;
    }
  }

  static async syncJobStatus(
    jobId: string | number
  ): Promise<{ success: boolean }> {
    try {
      const response = await apiFetch(
        `${API_ROUTES.CITATION_JOBS.BY_ID(String(jobId))}`,
        {
          method: 'POST',
        }
      );
      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          'Failed to sync job status'
        );
      }
      return response.json();
    } catch (error) {
      logger.error('[CitationClientService] Error syncing job status', {
        error,
        jobId,
      });
      throw error;
    }
  }

  /**
   * @deprecated This method is now handled by createCitationJob
   * Kept for backward compatibility - redirects to createCitationJob
   */
  static async queueCitationExtraction(request: {
    searchInputs: string[];
    filterReferenceNumber?: string;
    searchHistoryId: string;
    threshold?: number;
  }): Promise<{
    success: boolean;
    jobId?: string | number;
    externalJobId?: string;
  }> {
    try {
      logger.warn(
        '[CitationClientService] Using deprecated queueCitationExtraction - please use createCitationJob instead'
      );

      // Call the new createCitationJob method with parsed elements
      const result = await this.createCitationJob(
        request.searchHistoryId,
        request.filterReferenceNumber,
        request.searchInputs // Pass the searchInputs as parsedElements
      );

      // Return in the expected format
      return {
        success: result.success,
        jobId: result.jobId,
        externalJobId: undefined, // No longer returned by the new API
      };
    } catch (error) {
      logger.error(
        '[CitationClientService] Error in queueCitationExtraction wrapper',
        { error }
      );
      throw error;
    }
  }

  /**
   * Get parsed claim elements from invention data
   */
  static async getParsedClaimElements(projectId: string): Promise<string[]> {
    try {
      logger.debug('[CitationClientService] Fetching parsed claim elements', {
        projectId,
      });

      const response = await apiFetch(`/api/projects/${projectId}/claim-sync`);

      if (!response.ok) {
        if (response.status === 404) {
          logger.info(
            '[CitationClientService] No invention found for project',
            { projectId }
          );
          return [];
        }
        logger.warn(
          '[CitationClientService] Failed to fetch parsed claim elements',
          {
            projectId,
            status: response.status,
          }
        );
        return [];
      }

      const data = await response.json();
      logger.debug('[CitationClientService] Claim sync data received', {
        projectId,
        hasData: !!data,
        hasParsedElements: !!data.parsedElements,
        parsedElementsLength: data.parsedElements?.length || 0,
        firstElement: data.parsedElements?.[0],
        dataKeys: Object.keys(data || {}),
      });

      // V2 format returns string array directly
      if (data.parsedElements && Array.isArray(data.parsedElements)) {
        // Filter out empty strings with proper typing
        return data.parsedElements.filter(
          (element: unknown): element is string =>
            typeof element === 'string' && element.trim().length > 0
        );
      }

      return [];
    } catch (error) {
      logger.error(
        '[CitationClientService] Error fetching parsed claim elements',
        {
          projectId,
          error,
        }
      );
      return [];
    }
  }

  /**
   * Get metadata for a single reference number
   */
  static async getReferenceMetadata(
    referenceNumber: string
  ): Promise<ReferenceMetadata | null> {
    try {
      const response = await apiFetch(
        API_ROUTES.CITATIONS.METADATA(referenceNumber)
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to fetch reference metadata: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      logger.error(
        '[CitationClientService] Error fetching reference metadata',
        {
          referenceNumber,
          error,
        }
      );
      throw error;
    }
  }

  /**
   * Get metadata for multiple reference numbers in batch
   */
  static async getReferenceMetadataBatch(
    referenceNumbers: string[]
  ): Promise<Record<string, ReferenceMetadata | undefined>> {
    try {
      const response = await apiFetch(API_ROUTES.CITATIONS.METADATA_BATCH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ referenceNumbers }),
      });

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to fetch reference metadata batch: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      logger.error(
        '[CitationClientService] Error fetching reference metadata batch',
        {
          referenceNumbers,
          error,
        }
      );
      throw error;
    }
  }
}

// Also export the type for backward compatibility
export { CitationClientService as CitationApiService };

/**
 * Semantic Search Service
 *
 * This service encapsulates the logic for performing semantic searches via the Cardinal AI API.
 * It handles:
 * 1. Queuing search jobs with Cardinal AI
 * 2. Polling for results with exponential backoff
 * 3. Post-processing results (deduplication, exclusion, enrichment)
 */
import axios from 'axios'; // Use real axios for server-side with SSL options
import https from 'https';

import {
  searchPatents,
  filterAndDeduplicateByFamily,
  clearFamilyCache,
  PatentSearchResult,
  DeduplicatedResult,
} from '@/lib/api/patbase';
import { enrichPatentMetadata } from '@/lib/clients/patbase/patbaseClient';
import { PriorArtReference } from '../../types/claimTypes';
import { findProjectExclusions } from '../../repositories/project/exclusions.repository';
import { isDevelopment } from '@/config/environment';
import { logger } from '@/lib/monitoring/logger';
// SEARCH_TYPE_MAP, // No longer needed directly here, used in API route
// SearchType as ApiSearchType // No longer needed directly here
// import { ExtendedSearchResponse } from '@/lib/api/semanticSearch'; // Import response type
import { ApplicationError, ErrorCode } from '@/lib/error';
import { UnifiedPriorArt } from '@/types/domain/priorArt.unified';
import { fromPriorArtReference } from '@/features/search/utils/priorArt.converter';
import { PriorArtReference as OldPriorArtReference } from '@/types/claimTypes';
import { POLLING_DELAY } from '@/constants/time';
import { POLLING, API_CONFIG, THRESHOLDS } from '@/constants/limits';

// Add at the top of the file with other interfaces
type CardinalAIJobStatus = 0 | 1 | 2; // 0 = no results/completed, 1 = results found, 2 = processing

interface CardinalAIRawResult {
  ucId: string;
  rankPercentage?: number;
  searchAppearanceCount?: number;
  document?: {
    title?: string;
    abstract?: string;
    CPCs?: string[];
    IPCs?: string[];
  };
  captions?: Array<{ text: string }>;
}

interface CardinalAIPollResponse {
  status: CardinalAIJobStatus;
  result: CardinalAIRawResult[] | null;
}

// Define type for project exclusions based on the repository function return type
type ProjectExclusion = {
  excludedPatentNumber: string;
};

// Cardinal AI Request Body interface
interface CardinalAIRequestBody {
  SearchInput: string;
  SearchType: number;
  FilterCPCs?: string[];
  FilterIPCRs?: string[];
  FilterReferenceNumbers?: string[];
  Jurisdiction?: string;
  Threshold?: number;
  PageSize?: number;
  PageIndex?: number;
}

// Define the structure for the parameters passed to the service
export interface SemanticSearchServiceParams {
  searchInputs: string[];
  filterCPCs?: string[];
  filterIPCRs?: string[];
  filterReferenceNumbers?: string[];
  jurisdiction?: string;
  projectId?: string;
  // searchType?: number; // Ignored
  // pageSize?: number; // Ignored
  // pageIndex?: number; // Ignored
}

// Constants for API interaction
const API_BASE_URL = 'https://aiapi.qa.cardinal-holdings.com';
const QUEUE_ENDPOINT = '/semantic-search/queue'; // Changed to relative URL
const RESULT_ENDPOINT = '/semantic-search/result'; // Changed to relative URL
const PARALLEL_SEARCH_TYPES = [0]; // Now only single type 0

// Axios instance with SSL certificate bypass for development
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: !isDevelopment, // Only bypass SSL check in development
  }),
});

// --- Helper Functions ---

/**
 * Function to poll for results with exponential backoff (moved from API route)
 * @param jobId The job ID to poll for
 * @param apiKey The API key for authentication
 * @returns The raw results data object from Cardinal AI
 */
async function pollWithBackoff(
  jobId: string,
  apiKey: string
): Promise<CardinalAIPollResponse> {
  let attempt = 0;
  const maxAttempts = POLLING.MAX_ATTEMPTS;
  let currentDelay = POLLING_DELAY.INITIAL;

  logger.info('[SemanticSearchService] Starting polling', {
    jobId,
    maxAttempts,
    initialDelay: currentDelay,
  }); // Added log

  while (attempt < maxAttempts) {
    attempt++;
    logger.info(
      `[SemanticSearchService] Polling attempt ${attempt}/${maxAttempts}, delay: ${currentDelay}ms`,
      { jobId }
    ); // Added log
    // eslint-disable-next-line no-restricted-globals, no-restricted-syntax
    await new Promise(resolve => setTimeout(resolve, currentDelay));

    try {
      const resultsResponse = await api.get(`${RESULT_ENDPOINT}/${jobId}`, {
        headers: { ApiKey: apiKey },
      });
      const resultData = resultsResponse.data;
      // Added detailed log of the received status
      logger.debug(`[SemanticSearchService] Poll attempt ${attempt} success`, {
        jobId,
        status: resultsResponse.status,
        apiStatus: resultData?.status,
        resultKeys: resultData ? Object.keys(resultData) : 'N/A',
      });

      // If we have results (status 1) or API indicates no matches (status 0 with defined result), return them
      if (
        resultData?.status === 1 ||
        (resultData?.status === 0 && resultData.result !== null)
      ) {
        logger.info(
          `[SemanticSearchService] Results found or API indicated completion`,
          {
            jobId,
            apiStatus: resultData.status,
          }
        ); // Added log
        return resultData;
      }

      // If status is 0 but result is null, it's likely still processing
      if (resultData?.status === 0 && resultData.result === null) {
        logger.debug(
          '[SemanticSearchService] API returned status 0 with null result, continuing polling...',
          { jobId }
        );
        // Continue polling
      } else if (resultData?.status === 2) {
        // If status is 2 (processing), continue polling
        logger.debug(
          '[SemanticSearchService] Job still processing (status 2), polling again...',
          {
            jobId,
          }
        );
      } else {
        // Unexpected status
        logger.warn(
          '[SemanticSearchService] Unexpected API status during polling',
          {
            jobId,
            resultData,
          }
        );
        // Decide if we should continue or throw, for now continue
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        logger.debug(
          '[SemanticSearchService] Results not ready yet (404), continuing polling...',
          {
            jobId,
            attempt,
          }
        );
        // Continue to the next attempt
      } else {
        // Log other errors but continue polling unless it's the last attempt
        // Added more context to the error log
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        const errorStatus = axios.isAxiosError(error)
          ? error.response?.status
          : undefined;
        const errorData = axios.isAxiosError(error)
          ? error.response?.data
          : undefined;
        logger.error(
          `[SemanticSearchService] Poll attempt ${attempt} failed with unexpected error`,
          {
            jobId,
            error: errorMessage,
            status: errorStatus,
            data: errorData,
          }
        );
        if (attempt === maxAttempts) {
          throw error; // Rethrow error on the last attempt
        }
      }
    }

    // Increase delay for next attempt (exponential backoff with max 10s)
    currentDelay = Math.min(currentDelay * 2, POLLING_DELAY.MAX);
  }

  // If loop completes without returning/throwing, it's a timeout
  logger.error('[SemanticSearchService] Polling timed out', {
    jobId,
    maxAttempts,
  });
  throw new ApplicationError(
    ErrorCode.INTERNAL_ERROR, // Using a more generic code as API_TIMEOUT might not be in the simplified enum
    `Polling timed out after ${maxAttempts} attempts for job ID ${jobId}`
  );
}

/**
 * Fetches raw results from the Cardinal AI API by queueing and polling.
 * @param requestBody Body for the /queue request
 * @param apiKey Cardinal AI API Key
 * @returns Raw results object from the /result endpoint
 */
async function _fetchRawCardinalAIResults(
  requestBody: CardinalAIRequestBody,
  apiKey: string
): Promise<{ jobId: string; rawData: CardinalAIPollResponse }> {
  logger.info('[SemanticSearchService] Queueing semantic search job', {
    searchType: requestBody.SearchType,
  });
  // Added log for the request body being sent
  logger.debug('[SemanticSearchService] Queue request body', {
    body: JSON.stringify(requestBody),
  });
  const queueResponse = await api.post(QUEUE_ENDPOINT, requestBody, {
    headers: { ApiKey: apiKey }, // Only pass the API key since Content-Type is already set
  });

  const { id: jobId, isSuccess } = queueResponse.data;
  // Added log for the raw queue response
  logger.debug('[SemanticSearchService] Raw queue response received', {
    data: queueResponse.data,
  });
  if (!isSuccess || !jobId) {
    logger.error(
      '[SemanticSearchService] Queue request failed or missing job ID',
      {
        responseData: queueResponse.data,
      }
    );
    throw new ApplicationError(
      ErrorCode.INTERNAL_ERROR, // Using a more generic code
      'Queue response indicated failure or missing job ID'
    );
  }
  logger.info('[SemanticSearchService] Job queued successfully', { jobId }); // Logged Job ID here

  logger.info('[SemanticSearchService] Polling for results', { jobId });
  const rawResultsData = await pollWithBackoff(jobId, apiKey);
  logger.info('[SemanticSearchService] Raw results received', {
    jobId,
    status: rawResultsData?.status,
  });

  return { jobId, rawData: rawResultsData };
}

/**
 * Processes raw Cardinal AI results: fetches/applies exclusions, deduplicates, enriches, and formats.
 * @param rawData Raw data object from the Cardinal AI /result endpoint
 * @param projectId Optional project ID to fetch exclusions
 * @returns Processed results and metadata
 */
async function _processAndEnrichResults(
  rawData: CardinalAIPollResponse,
  projectId?: string
): Promise<{
  finalResults: UnifiedPriorArt[];
  originalCount: number;
  excludedCount: number;
  message?: string;
}> {
  if (!rawData || rawData.status !== 1 || !Array.isArray(rawData.result)) {
    return {
      finalResults: [],
      originalCount: 0,
      excludedCount: 0,
      message: 'No relevant results found.',
    };
  }

  const originalCount = rawData.result.length;
  const dbExclusions = projectId ? await findProjectExclusions(projectId) : [];
  const exclusionSet = new Set(
    dbExclusions.map(ex =>
      ex.excludedPatentNumber.replace(/[^A-Z0-9]/gi, '').toUpperCase()
    )
  );

  const resultsForFiltering = rawData.result.map(item => ({
    number: item.ucId,
    patentNumber: item.ucId, // Add patentNumber for consistency
    relevancy: (item.rankPercentage || 0) / 100,
    originalRawResult: item,
  }));

  const filteredResultsByFamily = await filterAndDeduplicateByFamily(
    resultsForFiltering as any
  );

  // Map the deduplicated results, attaching other family members to the best result
  const bestResultsWithFamily = filteredResultsByFamily.map(
    (familyGroup: DeduplicatedResult) => {
      const primary = familyGroup.bestResult
        .originalRawResult as CardinalAIRawResult;
      primary.document = primary.document || {}; // Ensure document exists

      // Attach other members from the same search to the primary patent
      (primary as any).otherFamilyMembers =
        familyGroup.otherFamilyMembersInSearch.map(
          (member: PatentSearchResult) => ({
            number: member.number, // Use 'number' from PatentSearchResult
            title: member.title,
            relevance: member.relevancy,
            url: member.url,
            // These fields may not be present on otherFamilyMembersInSearch, add fallbacks
            CPCs: (member as any).CPCs || [],
            IPCs: (member as any).IPCs || [],
          })
        );
      return primary;
    }
  );

  // Map raw results to have expected properties before conversion
  const mappedResults = bestResultsWithFamily.map(rawRef => ({
    ...rawRef,
    patentNumber: rawRef.ucId,
    number: rawRef.ucId,
    title: rawRef.document?.title || '',
    abstract: rawRef.document?.abstract || '',
    CPCs: rawRef.document?.CPCs || [],
    IPCs: rawRef.document?.IPCs || [],
    relevance: (rawRef.rankPercentage || 0) / 100,
  }));

  const refsToEnrich = mappedResults.map(rawRef =>
    fromPriorArtReference(rawRef as any)
  );

  const enrichedReferences = await enrichPatentMetadata(refsToEnrich as any);

  const unifiedEnrichedReferences = enrichedReferences;

  const finalResults = unifiedEnrichedReferences.filter(result => {
    const normalized = (result.patentNumber || (result as any).number)
      .replace(/[^A-Z0-9]/gi, '')
      .toUpperCase();
    return !exclusionSet.has(normalized);
  });

  const excludedCount = unifiedEnrichedReferences.length - finalResults.length;

  return {
    finalResults: finalResults as UnifiedPriorArt[],
    originalCount,
    excludedCount,
    message: undefined,
  };
}

// Helper function to perform the parallel Cardinal AI searches and initial deduplication
async function _performParallelSearchesAndInitialDedupe(
  params: SemanticSearchServiceParams,
  apiKey: string
): Promise<{
  deduplicatedRawResults: CardinalAIRawResult[];
  firstJobId: string | null;
}> {
  logger.info(
    '[SemanticSearchService:_performParallelSearchesAndInitialDedupe] Starting parallel searches...',
    {
      inputQueryCount: params.searchInputs.length,
      firstQueryLength: params.searchInputs[0]?.length || 0,
    }
  );

  // Ensure there are queries to process
  if (!params.searchInputs || params.searchInputs.length === 0) {
    logger.warn(
      '[SemanticSearchService:_performParallelSearchesAndInitialDedupe] No search input queries provided.'
    );
    return { deduplicatedRawResults: [], firstJobId: null };
  }

  // 1. Define base request body using input params (filters, jurisdiction)
  const filterCPCs = params.filterCPCs ?? [];
  const filterIPCRs = params.filterIPCRs ?? [];
  const filterReferenceNumbers = params.filterReferenceNumbers ?? [];

  const baseRequestBody = {
    FilterCPCs: filterCPCs,
    FilterIPCRs: filterIPCRs,
    FilterReferenceNumbers: filterReferenceNumbers,
    Jurisdiction: params.jurisdiction || 'US',
    Threshold: THRESHOLDS.DEFAULT_RELEVANCE,
    PageSize: API_CONFIG.PARALLEL_SEARCH_PAGE_SIZE,
    PageIndex: 0, // Always get first page for parallel runs
  };

  // 2. Create specific request bodies for each input query string, using SearchType 0
  const searchPromises = params.searchInputs.map(queryString => {
    const requestBody = {
      ...baseRequestBody,
      SearchInput: queryString,
      SearchType: 0,
    };
    // Use existing helper to queue and poll for results
    return _fetchRawCardinalAIResults(requestBody, apiKey);
  });

  let firstJobId: string | null = null;
  const mergedRawResults: CardinalAIRawResult[] = [];

  // 3. Execute searches in parallel and wait for all to settle
  logger.info(
    `[SemanticSearchService:_performParallelSearchesAndInitialDedupe] Launching ${params.searchInputs.length} parallel searches (one per query variation)...`
  );
  const results = await Promise.allSettled(searchPromises);
  logger.info(
    `[SemanticSearchService:_performParallelSearchesAndInitialDedupe] Parallel searches settled.`
  );

  // 4. Process results, merge successful ones
  results.forEach((result, index) => {
    const inputQueryIndex = index;
    if (result.status === 'fulfilled') {
      const { jobId, rawData } = result.value;
      if (firstJobId === null) {
        firstJobId = jobId; // Capture the first successful job ID
      }
      if (rawData && rawData.status === 1 && Array.isArray(rawData.result)) {
        logger.debug(
          `[SemanticSearchService:_performParallelSearchesAndInitialDedupe] Search for Query Index ${inputQueryIndex} succeeded with ${rawData.result.length} results.`,
          { jobId }
        );
        mergedRawResults.push(...rawData.result);
      } else {
        logger.debug(
          `[SemanticSearchService:_performParallelSearchesAndInitialDedupe] Search for Query Index ${inputQueryIndex} completed but yielded no results array.`,
          { jobId, status: rawData?.status }
        );
      }
    } else {
      // Log rejected promises (errors during fetch/poll for that specific search type)
      logger.error(
        `[SemanticSearchService:_performParallelSearchesAndInitialDedupe] Parallel search for Query Index ${inputQueryIndex} failed.`,
        { reason: result.reason }
      );
    }
  });

  logger.info(
    `[SemanticSearchService:_performParallelSearchesAndInitialDedupe] Merged ${mergedRawResults.length} raw results from parallel runs.`
  );

  if (mergedRawResults.length === 0) {
    logger.warn(
      '[SemanticSearchService:_performParallelSearchesAndInitialDedupe] No results obtained from any parallel search run.'
    );
    return { deduplicatedRawResults: [], firstJobId: firstJobId }; // Return empty results
  }

  // 5. Early Deduplication by ucId (keeping highest rankPercentage)
  const uniqueResultsMap = new Map<
    string,
    { result: CardinalAIRawResult; count: number }
  >();
  mergedRawResults.forEach(item => {
    if (!item || typeof item.ucId !== 'string') return; // Skip invalid items
    const existing = uniqueResultsMap.get(item.ucId);
    if (!existing) {
      uniqueResultsMap.set(item.ucId, { result: item, count: 1 });
    } else if (
      (item.rankPercentage ?? 0) > (existing.result.rankPercentage ?? 0)
    ) {
      uniqueResultsMap.set(item.ucId, {
        result: item,
        count: existing.count + 1,
      });
    } else {
      uniqueResultsMap.set(item.ucId, {
        result: existing.result,
        count: existing.count + 1,
      });
    }
  });
  const deduplicatedRawResults = Array.from(uniqueResultsMap.values()).map(
    ({ result, count }) => ({
      ...result,
      searchAppearanceCount: count, // Add count to the result
    })
  );
  logger.info(
    `[SemanticSearchService:_performParallelSearchesAndInitialDedupe] Deduplicated ${mergedRawResults.length} merged results down to ${deduplicatedRawResults.length} unique results.`
  );

  return { deduplicatedRawResults, firstJobId };
}

// --- Main Exported Function (Modified for Parallel Execution) ---

export async function executeSemanticSearch(
  params: SemanticSearchServiceParams,
  apiKey: string
): Promise<ExtendedSearchResponse> {
  logger.info('[SemanticSearchService] executeSemanticSearch called', {
    projectId: params.projectId,
  });

  try {
    // Clear family cache for fresh search
    clearFamilyCache();

    // 1. Perform parallel searches and initial deduplication
    const { deduplicatedRawResults, firstJobId } =
      await _performParallelSearchesAndInitialDedupe(params, apiKey);
    const initialDeduplicatedCount = deduplicatedRawResults.length;

    // Handle case where initial searches yielded no unique results
    if (initialDeduplicatedCount === 0) {
      logger.warn(
        '[SemanticSearchService] No unique results obtained after initial parallel search and deduplication.'
      );
      return {
        // Return an empty/no results response
        jobId: firstJobId ?? 'parallel-run-failed',
        results: [],
        totalCount: 0,
        originalCount: 0, // 0 because this count is post-initial-dedupe
        excludedCount: 0,
        message: 'No relevant results found from parallel searches.',
      };
    }

    // 2. Prepare input for the existing post-processing pipeline
    const rawDataForProcessing: CardinalAIPollResponse = {
      status: 1 as CardinalAIJobStatus, // Indicate success for processing
      result: deduplicatedRawResults,
    };

    // 3. Call the existing post-processing function
    logger.info(
      `[SemanticSearchService] Starting post-processing (family filter, enrich, exclude) for ${initialDeduplicatedCount} unique results.`
    );
    const {
      finalResults,
      originalCount: processedOriginalCount,
      excludedCount,
      message,
    } = await _processAndEnrichResults(rawDataForProcessing, params.projectId);
    // Note: originalCount from _processAndEnrichResults now reflects the count AFTER initial dedupe.

    // 4. Construct and return the final response
    logger.info(
      '[SemanticSearchService] Search and processing complete. Preparing final response.',
      {
        firstJobId: firstJobId,
        finalCount: finalResults.length,
        initialDeduplicatedCount: initialDeduplicatedCount,
        familyFilteredCount: processedOriginalCount, // Count after family filter
        dbExcludedCount: excludedCount,
      }
    );

    return {
      jobId: firstJobId ?? 'parallel-run', // Use first successful job ID or a placeholder
      results: finalResults,
      totalCount: finalResults.length, // Final count after all processing
      originalCount: initialDeduplicatedCount, // Count after initial merge & ucId dedupe
      excludedCount: excludedCount, // Count excluded by DB check during post-processing
      message:
        message ??
        (finalResults.length === 0
          ? 'No relevant results found after processing.'
          : undefined),
    };
  } catch (error) {
    // Catch errors from the new helper or _processAndEnrichResults
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error(
      '[SemanticSearchService] Error during semantic search execution',
      {
        error: errorMessage,
        stack: errorStack,
        projectId: params.projectId,
      }
    );
    throw new ApplicationError(
      ErrorCode.INTERNAL_ERROR,
      `Semantic search service failed: ${errorMessage}`
    );
  }
}

// Mock function (generateMockResults) could be moved or removed

// Define ExtendedSearchResponse locally since it's not exported from semanticSearch
export interface ExtendedSearchResponse {
  results: UnifiedPriorArt[];
  totalCount: number;
  originalCount?: number;
  excludedCount?: number;
  jobId?: string;
  message?: string;
}

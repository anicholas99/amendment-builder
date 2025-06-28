/**
 * Inline Citation Extraction Service
 *
 * Processes citation extraction jobs inline using async/await without external workers.
 * This service polls an external API and saves results when complete.
 */

import { logger } from '@/lib/monitoring/logger';
import axios from 'axios';
import https from 'https';
import { saveCitationResultsAndConsolidate } from '@/repositories/citationRepository';
import { update as updateCitationJob } from '@/repositories/citationJobRepository';
import { environment } from '@/config/environment';
import { ApplicationError, ErrorCode } from '@/lib/error';
import {
  CITATION_THRESHOLDS,
  getValidatedThreshold,
} from '@/config/citationExtractionConfig';

// External API Configuration
const CITATION_RESULT_API_BASE =
  'https://aiapi.qa.cardinal-holdings.com/semantic-search/citation/result/';
const CITATION_QUEUE_API =
  'https://aiapi.qa.cardinal-holdings.com/semantic-search/citation/queue';
const MAX_POLLING_ATTEMPTS = 30; // 5 minutes with 10 second intervals
const POLLING_INTERVAL_MS = 10000; // 10 seconds
const PROCESSING_TIMEOUT_MS = 45000; // 45 seconds timeout

// Create HTTPS agent for development
const httpsAgent = new https.Agent({
  rejectUnauthorized: environment.isProduction,
});

interface CitationExtractionPayload {
  jobId: string;
  searchInputs: string[];
  referenceNumber?: string;
  threshold?: number;
}

/**
 * Delay helper function
 */
const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Submit job to external API
 */
async function submitToExternalApi(
  searchInputs: string[],
  referenceNumber?: string,
  threshold?: number
): Promise<string> {
  const apiKey = environment.aiapi.apiKey;
  if (!apiKey) {
    throw new ApplicationError(
      ErrorCode.API_SERVICE_UNAVAILABLE,
      'AIAPI_API_KEY not configured'
    );
  }

  // Use validated threshold from config
  const validatedThreshold = getValidatedThreshold(threshold);

  // Log the request payload being sent
  const requestPayload = {
    SearchInputs: searchInputs,
    FilterReferenceNumber: referenceNumber || null,
    Threshold: validatedThreshold,
  };

  logger.debug('[CitationExtraction] Submitting to external API', {
    url: CITATION_QUEUE_API,
    payload: requestPayload,
    searchInputsCount: searchInputs.length,
    hasReferenceNumber: !!referenceNumber,
    referenceNumber: referenceNumber || 'none',
    threshold: validatedThreshold,
  });

  try {
    const response = await axios.post(CITATION_QUEUE_API, requestPayload, {
      headers: {
        'Content-Type': 'application/json',
        ApiKey: apiKey,
      },
      timeout: 60000,
      httpsAgent,
    });

    // Log successful response
    logger.debug('[CitationExtraction] External API response', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    });

    const externalJobId = response.data?.id;
    if (!externalJobId) {
      throw new Error('External job ID not found in response');
    }

    return String(externalJobId);
  } catch (error) {
    logger.error('[CitationExtraction] Failed to submit to external API', {
      error,
    });

    // Enhanced error logging for debugging
    if (axios.isAxiosError(error) && error.response) {
      logger.error('[CitationExtraction] External API error details', {
        status: error.response.status,
        statusText: error.response.statusText,
        responseData: error.response.data,
        requestPayload: requestPayload,
      });

      // Log specific validation errors if present
      if (error.response.data?.errors?.FilterReferenceNumber) {
        logger.error(
          '[CitationExtraction] FilterReferenceNumber validation errors',
          {
            errors: error.response.data.errors.FilterReferenceNumber,
          }
        );
      }
    }

    const message =
      axios.isAxiosError(error) && error.response
        ? `External API error: ${error.response.statusText}`
        : 'Failed to connect to citation extraction service';

    throw new ApplicationError(ErrorCode.CITATION_EXTERNAL_API_ERROR, message);
  }
}

/**
 * Poll external API for results
 */
async function pollExternalApi(
  externalJobId: string,
  apiKey: string
): Promise<{ status: string; result?: Record<string, unknown> }> {
  const url = `${CITATION_RESULT_API_BASE}${externalJobId}`;

  for (let attempt = 1; attempt <= MAX_POLLING_ATTEMPTS; attempt++) {
    logger.debug(
      `[CitationExtraction] Polling attempt ${attempt}/${MAX_POLLING_ATTEMPTS} for job ${externalJobId}`
    );

    try {
      const response = await axios.get(url, {
        headers: { ApiKey: apiKey },
        timeout: 60000,
        httpsAgent,
      });

      const data = response.data;
      let jobStatus = data?.status;
      const results = data?.result;

      // Convert numerical status to string
      if (typeof jobStatus === 'number') {
        if (jobStatus === 1) {
          logger.info(
            `[CitationExtraction] External job ${externalJobId} completed`
          );
          return { status: 'COMPLETED', result: results };
        } else if (jobStatus === 0) {
          jobStatus = 'pending';
        } else if (jobStatus < 0) {
          return { status: 'FAILED', result: data?.error };
        }
      }

      if (jobStatus === 'COMPLETED') {
        return { status: 'COMPLETED', result: results };
      } else if (jobStatus === 'FAILED') {
        return { status: 'FAILED', result: data?.error };
      }

      // Still pending, wait before next attempt
      if (attempt < MAX_POLLING_ATTEMPTS) {
        await delay(POLLING_INTERVAL_MS);
      }
    } catch (error) {
      logger.error(
        `[CitationExtraction] Error polling external job ${externalJobId}:`,
        error
      );

      // If it's a 404, the job doesn't exist
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new ApplicationError(
          ErrorCode.CITATION_JOB_NOT_FOUND,
          'External job not found'
        );
      }

      // For other errors, retry
      if (attempt === MAX_POLLING_ATTEMPTS) {
        throw error;
      }

      await delay(POLLING_INTERVAL_MS);
    }
  }

  // Reached max attempts without completion
  throw new ApplicationError(
    ErrorCode.API_TIMEOUT,
    `Polling timeout after ${MAX_POLLING_ATTEMPTS} attempts`
  );
}

/**
 * Process citation extraction inline
 */
export async function processCitationExtractionInline(
  payload: CitationExtractionPayload
): Promise<void> {
  const { jobId, searchInputs, referenceNumber, threshold } = payload;

  logger.info(
    `[CitationExtraction] Starting inline processing for job ${jobId}`
  );

  // Add detailed parameter logging
  logger.debug(`[CitationExtraction] Processing parameters`, {
    jobId,
    searchInputsCount: searchInputs?.length || 0,
    referenceNumber: referenceNumber || 'NOT PROVIDED',
    hasReferenceNumber: !!referenceNumber,
    referenceNumberType: typeof referenceNumber,
    threshold: threshold || 'NOT PROVIDED',
    hasThreshold: threshold !== undefined,
    fullPayload: payload,
  });

  try {
    // Update job status to processing
    await updateCitationJob(jobId, {
      status: 'PROCESSING',
      lastCheckedAt: new Date(),
    });

    // Submit to external API
    const externalJobId = await submitToExternalApi(
      searchInputs,
      referenceNumber,
      threshold
    );

    // Update job with external ID
    await updateCitationJob(jobId, {
      externalJobId: parseInt(externalJobId, 10),
    });

    // Poll for results
    const apiKey = environment.aiapi.apiKey!;
    const { status, result } = await pollExternalApi(externalJobId, apiKey);

    if (status === 'COMPLETED') {
      logger.info(`[CitationExtraction] Job ${jobId} completed successfully`);

      // Save and consolidate results
      const saveResult = await saveCitationResultsAndConsolidate(
        jobId,
        JSON.stringify(result),
        searchInputs,
        'COMPLETED'
      );

      if (saveResult.success) {
        logger.info(
          `[CitationExtraction] Successfully saved results for job ${jobId}`
        );
      } else {
        logger.error(
          `[CitationExtraction] Failed to save results for job ${jobId}: ${saveResult.error}`
        );

        await updateCitationJob(jobId, {
          status: 'ERROR_PROCESSING_RESULTS',
          lastCheckedAt: new Date(),
          errorMessage:
            saveResult.error || 'Failed to save consolidated results',
        });
      }
    } else if (status === 'FAILED') {
      logger.warn(`[CitationExtraction] Job ${jobId} failed`);

      await updateCitationJob(jobId, {
        status: 'FAILED_EXTERNAL',
        lastCheckedAt: new Date(),
        errorMessage: result || 'External job failed',
      });
    }
  } catch (error) {
    logger.error(`[CitationExtraction] Error processing job ${jobId}:`, error);

    // Update job status to reflect the error
    try {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorCode =
        error instanceof ApplicationError
          ? error.code
          : ErrorCode.INTERNAL_ERROR;

      let status = 'ERROR_PROCESSING';
      if (errorCode === ErrorCode.API_TIMEOUT) {
        status = 'TIMEOUT';
      } else if (errorCode === ErrorCode.CITATION_JOB_NOT_FOUND) {
        status = 'NOT_FOUND';
      }

      await updateCitationJob(jobId, {
        status,
        lastCheckedAt: new Date(),
        errorMessage,
      });
    } catch (dbError) {
      logger.error(
        `[CitationExtraction] Failed to update job ${jobId} after error:`,
        dbError
      );
    }

    throw error;
  }
}

/**
 * Queue citation extraction for inline processing
 * This function starts the async processing without blocking
 */
export async function queueCitationExtractionInline(
  payload: CitationExtractionPayload
): Promise<void> {
  logger.info(
    `[CitationExtraction] Queueing job ${payload.jobId} for inline processing`
  );

  // Process inline without blocking the main thread
  // Using an IIFE to handle the async logic immediately
  (async () => {
    try {
      // Create timeout promise
      const timeoutPromise = delay(PROCESSING_TIMEOUT_MS).then(() => {
        throw new ApplicationError(
          ErrorCode.API_TIMEOUT,
          'Processing timeout after 45s'
        );
      });

      // Race between processing and timeout
      await Promise.race([
        processCitationExtractionInline(payload),
        timeoutPromise,
      ]);
    } catch (error) {
      logger.error('[CitationExtraction] Inline job failed', {
        error,
        jobId: payload.jobId,
      });

      // Ensure status is updated on timeout or other failures
      if (error instanceof ApplicationError) {
        try {
          await updateCitationJob(payload.jobId, {
            status:
              error.code === ErrorCode.API_TIMEOUT
                ? 'TIMEOUT'
                : 'ERROR_PROCESSING',
            errorMessage: error.message,
            lastCheckedAt: new Date(),
          });
        } catch (dbError) {
          logger.error(
            '[CitationExtraction] Failed to update timeout status',
            dbError
          );
        }
      }
    }
  })();

  // Return immediately without waiting for processing
  logger.info(
    `[CitationExtraction] Job ${payload.jobId} queued for inline processing`
  );
}

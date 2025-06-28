import { NextApiResponse } from 'next';
import axios, { AxiosError } from 'axios';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { safeStringify } from '@/lib/monitoring/logger';
import https from 'https';
import {
  updateCitationMatchLocationJob,
  validateCitationMatchExists,
  markCitationMatchesAsFailed,
  getCitationMatchWithTenantInfo,
} from '../../../repositories/citationRepository';
import { z } from 'zod';
import { AuthenticatedRequest } from '@/types/middleware';
import { environment } from '@/config/environment';
import { withAuth } from '@/middleware/auth';
import { withTenantGuard } from '@/middleware/authorization';
import { withCsrf } from '@/lib/security/csrf';
import { withValidation } from '@/lib/security/validate';
import { withErrorHandling } from '@/middleware/errorHandling';
import { withRateLimit } from '@/middleware/rateLimiter';
import { requireRole } from '@/middleware/role';
import { withMethod } from '@/middleware/method';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';
import { sendSafeErrorResponse } from '@/utils/secure-error-response';

// Initialize apiLogger
const apiLogger = createApiLogger('citation-location/queue');

// External API endpoint for citation location queue
const EXTERNAL_LOCATION_QUEUE_API =
  'https://aiapi.qa.cardinal-holdings.com/semantic-search/citation/location/queue';

// Create a custom HTTPS agent (reuse if defined elsewhere)
const httpsAgent = new https.Agent({
  rejectUnauthorized: environment.isProduction,
});

const bodySchema = z.object({
  citationMatchId: z.string(),
  searchText: z.string(),
  filterReferenceNumber: z.string(),
});

// Define request body type for citation location queue
interface CitationLocationQueueBody {
  citationMatchId: string;
  searchText: string;
  filterReferenceNumber: string;
}

// Helper function for exponential backoff delay
const delay = (ms: number) =>
  new Promise<void>(resolve => {
    setImmediate(() => resolve());
  });

const handler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<void> => {
  apiLogger.logRequest(req);

  if (req.method !== 'POST') {
    apiLogger.warn('Method not allowed', { method: req.method });
    res.setHeader('Allow', ['POST']);
    apiLogger.logResponse(405, { error: 'Method Not Allowed' });
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { citationMatchId, searchText, filterReferenceNumber } = req.body;

  // Add validation to check if the citation match exists in the database
  try {
    const exists = await validateCitationMatchExists(citationMatchId);
    if (!exists) {
      apiLogger.warn('Validation Error: CitationMatch not found', {
        citationMatchId,
      });
      apiLogger.logResponse(404, {
        error: 'CitationMatch not found in database',
      });
      return res
        .status(404)
        .json({ error: 'CitationMatch not found in database' });
    }
  } catch (dbError: unknown) {
    const dbErr =
      dbError instanceof Error ? dbError : new Error(String(dbError));
    apiLogger.error('Database error while validating CitationMatch existence', {
      citationMatchId,
      errorMessage: dbErr.message,
    });
    // Continue processing - we'll let the later update handle any DB issues
  }

  const apiKey = environment.aiapi.apiKey;
  if (!apiKey) {
    apiLogger.error('Configuration Error: AIAPI_API_KEY not configured', {
      citationMatchId,
    });
    apiLogger.logResponse(500, {
      error: 'Internal configuration error: API key missing',
    });
    return res
      .status(500)
      .json({ error: 'Internal configuration error: API key missing' });
  }

  apiLogger.info(`Attempting to queue location job`, { citationMatchId });

  const MAX_RETRIES = 3;
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < MAX_RETRIES) {
    attempt++;
    apiLogger.debug(`Attempt ${attempt}/${MAX_RETRIES} to call external API`, {
      citationMatchId,
    });
    try {
      // --- Log Request Payload ---
      const requestPayload = {
        searchText: searchText,
        filterReferenceNumber: filterReferenceNumber,
      };
      apiLogger.debug(
        `[Queue ${citationMatchId}] Sending request to external API`,
        {
          url: EXTERNAL_LOCATION_QUEUE_API,
          payload: safeStringify(requestPayload),
        }
      );

      // --- Call External API ---
      const externalApiResponse = await axios.post(
        EXTERNAL_LOCATION_QUEUE_API,
        requestPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            ApiKey: apiKey,
          },
          httpsAgent,
          timeout: 60000, // Increased timeout to 60 seconds (was 30000)
        }
      );

      const externalData = externalApiResponse.data;
      apiLogger.debug(`Attempt ${attempt} external API response received`, {
        citationMatchId,
        status: externalApiResponse.status,
        // Use safeStringify to avoid circular references in the response data
        // Limit log size
        responseData: safeStringify(externalData)?.substring(0, 1000),
      });

      // --- Handle External Response ---
      if (
        externalData &&
        externalData.isSuccess === true &&
        typeof externalData.id === 'number'
      ) {
        const externalLocationJobId = externalData.id;
        apiLogger.info(
          `External job queued successfully on attempt ${attempt}.`,
          {
            citationMatchId,
            externalLocationJobId,
          }
        );

        // --- Update Internal DB Record ---
        try {
          apiLogger.debug(
            `[Queue ${citationMatchId}] Attempting DB update via updateCitationMatchLocationJob`,
            { externalLocationJobId }
          );
          await updateCitationMatchLocationJob(
            citationMatchId,
            externalLocationJobId
          );
          apiLogger.info(`Updated DB with locationJobId`, {
            citationMatchId,
            externalLocationJobId,
          });

          // Success - Respond 202 Accepted
          const responseBody = {
            message: 'Location job successfully queued',
            citationMatchId: citationMatchId,
            locationJobId: externalLocationJobId,
          };
          apiLogger.logResponse(202, responseBody);
          return res.status(202).json(responseBody);
        } catch (dbError: unknown) {
          const dbErr =
            dbError instanceof Error ? dbError : new Error(String(dbError));

          // Check if it's a "not found" error
          const isNotFoundError =
            dbErr.message.includes('Record to update not found') ||
            dbErr.message.includes('not found');

          if (isNotFoundError) {
            apiLogger.warn(`CitationMatch no longer exists in the database`, {
              citationMatchId,
              externalLocationJobId,
              errorMessage: dbErr.message,
            });

            // Return a 404 response
            const responseBody = {
              error: 'CitationMatch no longer exists in the database',
              details:
                'The record may have been deleted since the request was initiated',
              locationJobId: externalLocationJobId, // Include the external job ID for reference
            };
            apiLogger.logResponse(404, responseBody);
            return res.status(404).json(responseBody);
          }

          // For other types of errors
          apiLogger.error(`DB update failed after successful queue.`, {
            citationMatchId,
            externalLocationJobId,
            errorName: dbErr.name,
            errorMessage: dbErr.message,
          });
          lastError = dbErr;
          break; // Exit retry loop on DB error after success
        }
      } else {
        // External API queueing failed (but got a valid response)
        const failureMsg = `External API indicated failure on attempt ${attempt}`;
        apiLogger.warn(failureMsg, {
          citationMatchId,
          // Use safeStringify to avoid circular references
          // Limit log size
          responseData: safeStringify(externalData)?.substring(0, 1000),
        });
        lastError = new Error(`${failureMsg}: ${safeStringify(externalData)}`);
        // Do not break here if retryable, let retry logic handle it below
        // Consider if this failure type should be retryable (depends on API behavior)
        // If it's a definitive failure (e.g., bad input), maybe break.
      }
    } catch (error: unknown) {
      const currentError =
        error instanceof Error ? error : new Error(String(error));
      lastError = currentError; // Store the most recent error

      // Log detailed error information
      interface ErrorDetailsType {
        citationMatchId: string;
        errorMessage: string;
        errorName: string;
        isAxiosError?: boolean;
        requestUrl?: string;
        requestMethod?: string;
        responseStatus?: number | null;
        [key: string]: unknown; // Add index signature for ApiLogContext compatibility
      }

      const errorDetails: ErrorDetailsType = {
        citationMatchId,
        errorMessage: currentError.message,
        errorName: currentError.name,
      };

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        errorDetails.isAxiosError = true;
        errorDetails.requestUrl = axiosError.config?.url;
        errorDetails.requestMethod = axiosError.config?.method;
        if (axiosError.response) {
          errorDetails.responseStatus = axiosError.response.status;
          // Log response data internally but don't expose
          apiLogger.debug('Axios error response data', {
            data: safeStringify(axiosError.response.data)?.substring(0, 1000),
          });
        } else {
          errorDetails.responseStatus = null; // Explicitly indicate no response received
        }
      }

      apiLogger.warn(
        `Attempt ${attempt} failed: ${currentError.message}`,
        errorDetails // Log the detailed error object
      );

      // Check if it's a retryable error (timeout or 5xx)
      let shouldRetry = false;
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (!axiosError.response) {
          apiLogger.debug('Network error or timeout detected, will retry.', {
            citationMatchId,
          });
          shouldRetry = true;
        } else if (axiosError.response.status >= 500) {
          apiLogger.debug(
            `External API returned ${axiosError.response.status}, will retry.`,
            {
              citationMatchId,
            }
          );
          shouldRetry = true;
        }
      }

      if (shouldRetry && attempt < MAX_RETRIES) {
        const delayMs = Math.pow(2, attempt - 1) * 1000;
        apiLogger.info(`Retrying attempt ${attempt + 1} after ${delayMs}ms`, {
          citationMatchId,
        });
        await delay(delayMs);
      } else {
        apiLogger.error(
          `Non-retryable error or max retries reached. Last error: ${lastError?.message}`,
          {
            citationMatchId,
            errorName: lastError?.name, // Include name
            errorMessage: lastError?.message,
            // Optionally log truncated stack of the final error
            // errorStack: lastError.stack?.substring(0, 1000)
          }
        );
        break; // Exit loop
      }
    }
  }

  // --- Handle Final Failure ---
  if (lastError) {
    const errorMessage = lastError.message;
    apiLogger.error('Queueing failed permanently after retries.', {
      citationMatchId,
      errorName: lastError.name,
      errorMessage: lastError.message,
      errorStack: lastError.stack?.substring(0, 1000), // Keep stack trace in logs only
    });

    // Try to update the DB record to FAILED
    try {
      await markCitationMatchesAsFailed(
        [citationMatchId],
        `Queueing failed: ${errorMessage.substring(0, 190)}`
      );
      apiLogger.info(`Marked CitationMatch as FAILED due to queueing error.`, {
        citationMatchId,
      });
    } catch (dbUpdateError: unknown) {
      const dbUpdErr =
        dbUpdateError instanceof Error
          ? dbUpdateError
          : new Error(String(dbUpdateError));
      apiLogger.error(
        `CRITICAL: Failed to mark CitationMatch as FAILED after queueing error.`,
        {
          citationMatchId,
          dbUpdateErrorName: dbUpdErr.name,
          dbUpdateErrorMessage: dbUpdErr.message,
          dbUpdateErrorStack: dbUpdErr.stack?.substring(0, 1000),
        }
      );
    }

    // Respond with an appropriate error status
    let statusCode = 500;
    let userMessage = 'Failed to queue location job. Please try again later.';

    if (axios.isAxiosError(lastError) && lastError.response) {
      statusCode = lastError.response.status;
      // Provide user-friendly messages based on status
      if (statusCode >= 500) {
        userMessage =
          'External service is temporarily unavailable. Please try again later.';
      } else if (statusCode === 429) {
        userMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (statusCode >= 400) {
        userMessage = 'Invalid request. Please check your input and try again.';
      }
    }

    sendSafeErrorResponse(res, lastError, statusCode, userMessage);
    return;
  }

  // Fallback: Should theoretically not be reached
  apiLogger.error('Reached end of handler unexpectedly.', { citationMatchId });
  apiLogger.logResponse(500, { error: 'Unexpected internal server error' });
  return res.status(500).json({ error: 'Unexpected internal server error' });
};

// Resolve tenantId using citationMatchId -> searchHistory -> project
const resolveTenantId = async (
  req: AuthenticatedRequest
): Promise<string | null> => {
  const { citationMatchId } = req.body as { citationMatchId?: string };
  if (!citationMatchId) return null;

  const citationMatch = await getCitationMatchWithTenantInfo(citationMatchId);
  return citationMatch?.searchHistory?.project?.tenantId ?? null;
};

// Use the new secure preset to simplify the middleware chain
export default SecurePresets.tenantProtected(resolveTenantId, handler, {
  validate: {
    body: bodySchema,
  },
});

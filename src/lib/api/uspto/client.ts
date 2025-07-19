/**
 * USPTO Open Data Portal API Client
 * 
 * Secure client for USPTO ODP API with authentication, rate limiting,
 * and error handling following project patterns.
 */

import { logger } from '@/server/logger';
import { environment } from '@/config/environment';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { 
  USPTOApiOptions, 
  USPTODocumentsResponse,
  USPTOApplicationData,
  USPTOError,
  USPTOSearchParams,
  USPTODocument
} from './types';

// Constants
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Build headers for USPTO API requests
 */
const buildHeaders = (): HeadersInit => {
  const apiKey = environment.uspto.apiKey;
  
  if (!apiKey) {
    logger.error('USPTO API key not found in environment', {
      hasKey: !!environment.uspto.apiKey,
      envKeys: Object.keys(environment.uspto || {}),
    });
    throw new ApplicationError(
      ErrorCode.CONFIGURATION_ERROR,
      'USPTO API key is not configured'
    );
  }

  // Log that we have the key (but not the key itself for security)
  logger.debug('USPTO API headers built', {
    hasApiKey: !!apiKey,
    keyLength: apiKey.length,
    keyPrefix: apiKey.substring(0, 4) + '...',
  });

  return {
    'Accept': 'application/json',
    'X-API-KEY': apiKey, // USPTO requires uppercase header for AWS API Gateway
    'User-Agent': 'AmendmentBuilder/1.0',
  };
};

/**
 * Handle USPTO API errors with proper error mapping
 */
const handleApiError = async (response: Response, url: string): Promise<never> => {
  let errorBody: string | USPTOError | null = null;
  
  try {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      errorBody = await response.json();
    } else {
      errorBody = await response.text();
    }
  } catch {
    // If we can't parse the error response, use status text
    errorBody = response.statusText;
  }

  logger.error('USPTO API request failed', {
    url,
    status: response.status,
    statusText: response.statusText,
    error: errorBody,
    headers: Object.fromEntries(response.headers.entries()),
  });

  // Map status codes to application errors
  switch (response.status) {
    case 401:
      throw new ApplicationError(
        ErrorCode.AUTHENTICATION_FAILED,
        'USPTO API authentication failed - check API key'
      );
    case 403:
      throw new ApplicationError(
        ErrorCode.AUTHORIZATION_FAILED,
        'USPTO API access forbidden - check API key permissions'
      );
    case 429:
      throw new ApplicationError(
        ErrorCode.RATE_LIMIT_EXCEEDED,
        'USPTO API rate limit exceeded'
      );
    case 404:
      throw new ApplicationError(
        ErrorCode.NOT_FOUND,
        'USPTO resource not found'
      );
    default:
      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        `USPTO API error: ${response.status} ${response.statusText}`
      );
  }
};

/**
 * Make a request to the USPTO API with retry logic
 */
export const callUSPTOApi = async <T>(
  endpoint: string,
  options: USPTOApiOptions = {}
): Promise<T> => {
  // Temporarily hardcode the correct URL until environment is fixed
  // TODO: Fix environment variable USPTO_ODP_API_URL to use https://api.uspto.gov/api/v1
  // Currently it seems to be set to https://api.uspto.gov/patent/v1 which is incorrect
  const baseUrl = 'https://api.uspto.gov/api/v1';
  const url = `${baseUrl}${endpoint}`;
  const timeout = options.timeout || DEFAULT_TIMEOUT;
  const maxRetries = options.maxRetries ?? MAX_RETRIES;
  const retryDelay = options.retryDelay || RETRY_DELAY;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const headers = buildHeaders();
      
      logger.debug('Making USPTO API request', {
        url,
        method: 'GET',
        hasApiKey: !!headers['X-API-KEY'],
      });
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await handleApiError(response, url);
      }

      const data = await response.json();
      
      logger.debug('USPTO API request successful', {
        endpoint,
        attempt: attempt + 1,
      });

      return data as T;
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (4xx)
      if (error instanceof ApplicationError && 
          [ErrorCode.AUTHENTICATION_FAILED, ErrorCode.AUTHORIZATION_FAILED, ErrorCode.NOT_FOUND].includes(error.code)) {
        throw error;
      }

      // Check if it's an abort error
      if (error instanceof Error && error.name === 'AbortError') {
        logger.error('USPTO API request timed out', {
          endpoint,
          timeout,
          attempt: attempt + 1,
        });
        lastError = new ApplicationError(
          ErrorCode.REQUEST_TIMEOUT,
          `USPTO API request timed out after ${timeout}ms`
        );
      }

      if (attempt < maxRetries) {
        logger.warn('USPTO API request failed, retrying...', {
          endpoint,
          attempt: attempt + 1,
          maxRetries,
          error: error instanceof Error ? error.message : String(error),
        });
        await sleep(retryDelay * (attempt + 1)); // Exponential backoff
      }
    }
  }

  throw lastError || new ApplicationError(
    ErrorCode.API_NETWORK_ERROR,
    'USPTO API request failed after all retries'
  );
};

/**
 * Fetch documents for a patent application
 */
export const getApplicationDocuments = async (
  applicationNumber: string,
  options?: USPTOApiOptions
): Promise<USPTODocument[]> => {
  if (!applicationNumber) {
    throw new ApplicationError(
      ErrorCode.INVALID_INPUT,
      'Application number is required'
    );
  }

  // Remove any formatting from application number (e.g., 13/937,148 -> 13937148)
  const cleanAppNumber = applicationNumber.replace(/[^\d]/g, '');
  
  // Use the correct endpoint that actually works
  const endpoint = `/patent/applications/${cleanAppNumber}/documents`;
  
  logger.debug('Fetching USPTO documents', {
    endpoint,
    applicationNumber: cleanAppNumber,
  });
  
  const response = await callUSPTOApi<USPTODocumentsResponse>(endpoint, options);
  
  // Extract documents from the response
  const documents = response.documentBag || [];
  
  logger.info('USPTO documents fetched', {
    applicationNumber: cleanAppNumber,
    documentCount: documents.length,
    totalCount: response.count,
  });
  
  return documents;
};

/**
 * Get document download URL
 * Note: The new API returns download URLs that can be accessed directly
 */
export const getDocumentDownloadUrl = (
  document: USPTODocument
): string | null => {
  if (!document.downloadOptionBag || document.downloadOptionBag.length === 0) {
    return null;
  }

  // Prefer PDF format
  const pdfOption = document.downloadOptionBag.find(
    option => option.mimeTypeIdentifier.toLowerCase().includes('pdf')
  );
  
  if (pdfOption) {
    return pdfOption.downloadUrl;
  }

  // Fall back to first available option
  return document.downloadOptionBag[0].downloadUrl;
};

/**
 * Get application data
 */
export const getApplicationData = async (
  applicationNumber: string,
  options?: USPTOApiOptions
): Promise<USPTOApplicationData> => {
  if (!applicationNumber) {
    throw new ApplicationError(
      ErrorCode.INVALID_INPUT,
      'Application number is required'
    );
  }

  const cleanAppNumber = applicationNumber.replace(/[^\d]/g, '');
  const endpoint = `/patent/applications/${cleanAppNumber}`;
  
  return callUSPTOApi<USPTOApplicationData>(endpoint, options);
};

/**
 * Search for patent applications
 */
export const searchApplications = async (
  params: USPTOSearchParams,
  options?: USPTOApiOptions
): Promise<USPTOApplicationData[]> => {
  const queryParams = new URLSearchParams();
  
  if (params.applicationNumber) {
    queryParams.append('applicationNumber', params.applicationNumber);
  }
  if (params.patentNumber) {
    queryParams.append('patentNumber', params.patentNumber);
  }
  if (params.publicationNumber) {
    queryParams.append('publicationNumber', params.publicationNumber);
  }
  if (params.filingDateFrom) {
    queryParams.append('filingDateFrom', params.filingDateFrom);
  }
  if (params.filingDateTo) {
    queryParams.append('filingDateTo', params.filingDateTo);
  }
  if (params.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  if (params.offset) {
    queryParams.append('offset', params.offset.toString());
  }

  const endpoint = `/patent/applications/search?${queryParams.toString()}`;
  const response = await callUSPTOApi<{ applications: USPTOApplicationData[] }>(endpoint, options);
  
  return response.applications || [];
};
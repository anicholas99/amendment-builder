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
  USPTOSearchParams
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
    throw new ApplicationError(
      ErrorCode.CONFIGURATION_ERROR,
      'USPTO API key is not configured'
    );
  }

  return {
    'Accept': 'application/json',
    'X-API-KEY': apiKey,
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
  const baseUrl = environment.uspto.apiUrl;
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

      const response = await fetch(url, {
        method: 'GET',
        headers: buildHeaders(),
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
): Promise<USPTODocumentsResponse> => {
  if (!applicationNumber) {
    throw new ApplicationError(
      ErrorCode.INVALID_INPUT,
      'Application number is required'
    );
  }

  // Remove any formatting from application number (e.g., 13/937,148 -> 13937148)
  const cleanAppNumber = applicationNumber.replace(/[^\d]/g, '');
  
  const endpoint = `/patent/filewrapper/documents/${cleanAppNumber}`;
  return callUSPTOApi<USPTODocumentsResponse>(endpoint, options);
};

/**
 * Download a document PDF
 */
export const downloadDocument = async (
  documentId: string,
  options?: USPTOApiOptions
): Promise<ArrayBuffer> => {
  if (!documentId) {
    throw new ApplicationError(
      ErrorCode.INVALID_INPUT,
      'Document ID is required'
    );
  }

  const baseUrl = environment.uspto.apiUrl;
  const url = `${baseUrl}/patent/filewrapper/documents/download/${documentId}`;
  const timeout = options?.timeout || DEFAULT_TIMEOUT;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      await handleApiError(response, url);
    }

    const buffer = await response.arrayBuffer();
    
    logger.debug('USPTO document download successful', {
      documentId,
      size: buffer.byteLength,
    });

    return buffer;
  } catch (error) {
    logger.error('USPTO document download failed', {
      documentId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
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
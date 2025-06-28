/**
 * PatBase API Client
 * Low-level client for PatBase REST API authentication and requests
 */

import { logger } from '@/lib/monitoring/logger';
import { safeJsonParse } from '@/utils/json-utils';
import { environment } from '@/config/environment';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { PatbaseSession, PatbaseApiOptions } from './types';

// In-memory cache for session token
let sessionCache: PatbaseSession | null = null;

// Constants
const DEFAULT_API_ENDPOINT = 'https://www.patbase.com/rest/api.php';
const SESSION_COOKIE_NAME = 'SessionFarm_GUID';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Extracts a specific cookie value from the 'set-cookie' header
 */
const extractCookieValue = (
  setCookieHeader: string | null,
  cookieName: string
): string | null => {
  if (!setCookieHeader) {
    return null;
  }

  const cookies = setCookieHeader.split(',');
  for (const cookieString of cookies) {
    const parts = cookieString.split(';')[0].split('=');
    if (parts[0].trim() === cookieName) {
      return parts[1];
    }
  }

  return null;
};

/**
 * Check if the current session is valid
 */
export const isSessionValid = (): boolean => {
  if (!sessionCache) return false;
  const now = Date.now();
  return sessionCache.expiresAt > now + 60000;
};

/**
 * Authenticate with PatBase using username and password
 */
export const authenticatePatbase = async (): Promise<string> => {
  const userId = environment.patbase.user;
  const password = environment.patbase.password;

  if (!userId || !password) {
    logger.error(
      'PatBase API credentials (PATBASE_USER, PATBASE_PASS) are not set in environment variables.'
    );
    throw new ApplicationError(
      ErrorCode.VALIDATION_FAILED,
      'PatBase API credentials are not configured.'
    );
  }

  try {
    if (isSessionValid() && sessionCache?.sessionToken) {
      return sessionCache.sessionToken;
    }

    const loginUrl = `${DEFAULT_API_ENDPOINT}?method=login&userid=${encodeURIComponent(userId)}&password=${encodeURIComponent(password)}`;
    const response = await fetch(loginUrl);
    const responseText = await response.text();

    if (responseText.includes('ERROR') || responseText.includes('error')) {
      logger.error('PatBase authentication failed', {
        status: response.status,
        statusText: response.statusText,
        response: responseText,
      });
      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        `PatBase authentication failed: ${responseText}`
      );
    }

    const setCookieHeader = response.headers.get('set-cookie');
    const sessionToken = extractCookieValue(
      setCookieHeader,
      SESSION_COOKIE_NAME
    );

    if (!sessionToken) {
      logger.error('Failed to extract PatBase session cookie', {
        headers: setCookieHeader,
        response: responseText,
      });
      throw new ApplicationError(
        ErrorCode.VALIDATION_FAILED,
        'Failed to extract PatBase session cookie.'
      );
    }

    const now = Date.now();
    sessionCache = {
      sessionToken,
      createdAt: now,
      expiresAt: now + SESSION_TIMEOUT_MS,
    };

    return sessionToken;
  } catch (error) {
    logger.error('Error authenticating with PatBase', {
      error: error instanceof Error ? error : undefined,
    });
    throw error;
  }
};

/**
 * Make an authenticated request to the PatBase API
 */
export const callPatbaseApi = async <T>(
  apiMethod: string,
  params: Record<string, string> = {},
  options: PatbaseApiOptions = {}
): Promise<T> => {
  try {
    let sessionToken = options.sessionToken;
    if (!sessionToken) {
      sessionToken = await authenticatePatbase();
    }

    const apiEndpoint = options.apiEndpoint || DEFAULT_API_ENDPOINT;
    const httpMethod = options.method || 'GET';
    let url = apiEndpoint;
    let body: string | undefined = undefined;
    const headers: Record<string, string> = {
      Cookie: `${SESSION_COOKIE_NAME}=${sessionToken}`,
      Accept: 'application/json, text/plain, */*',
      ...(options.headers || {}),
    };

    if (httpMethod === 'POST') {
      const queryParams = new URLSearchParams();
      queryParams.append('method', apiMethod);
      url = `${apiEndpoint}?${queryParams.toString()}`;
      body = options.body;
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
    } else {
      const queryParams = new URLSearchParams();
      queryParams.append('method', apiMethod);
      for (const [key, value] of Object.entries(params)) {
        queryParams.append(key, value);
      }
      url = `${apiEndpoint}?${queryParams.toString()}`;
    }

    const response = await fetch(url, {
      method: httpMethod,
      headers: headers,
      body: body,
    });

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 401) {
        sessionCache = null;
        const newSessionToken = await authenticatePatbase();
        return callPatbaseApi(apiMethod, params, {
          ...options,
          sessionToken: newSessionToken,
        });
      }

      // For 400 errors, include the query details in debug logs
      if (response.status === 400) {
        logger.debug('PatBase 400 error details', {
          method: apiMethod,
          params,
          status: response.status,
          response: errorText,
          url: url.length > 200 ? url.substring(0, 200) + '...' : url,
        });
      }

      logger.error('PatBase API request failed', {
        method: apiMethod,
        status: response.status,
        statusText: response.statusText,
        response: errorText,
      });
      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        `PatBase API request failed: ${response.status} ${response.statusText}`
      );
    }

    const textResponse = await response.text();

    if (!textResponse || textResponse.trim() === '') {
      logger.warn('PatBase API returned empty response', { method: apiMethod });
      if (apiMethod === 'getfulltextbatch') {
        return { patents: [] } as unknown as T;
      }
      return {} as T;
    }

    if (
      textResponse.trim().startsWith('{') ||
      textResponse.trim().startsWith('[')
    ) {
      try {
        const parsed = safeJsonParse<T>(textResponse);
        if (parsed === undefined) {
          logger.warn('Failed to parse JSON response from PatBase API', {
            method: apiMethod,
            textResponse:
              textResponse.length > 500
                ? textResponse.substring(0, 500) + '...'
                : textResponse,
          });
          return textResponse as unknown as T;
        }
        return parsed;
      } catch (e) {
        logger.warn('Failed to parse JSON response from PatBase API', {
          method: apiMethod,
          error: e,
        });
        return textResponse as unknown as T;
      }
    }

    if (apiMethod === 'getweek' && !isNaN(Number(textResponse))) {
      return { Week: textResponse } as unknown as T;
    }

    return textResponse as unknown as T;
  } catch (error) {
    logger.error('Error calling PatBase API', {
      method: apiMethod,
      error: error instanceof Error ? error : undefined,
    });
    throw error;
  }
};

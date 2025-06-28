/**
 * Axios Replacement Module
 *
 * This module provides an axios-like interface that uses apiFetch under the hood
 * for internal API calls, and native fetch for external API calls.
 * This ensures internal HTTP requests go through our standardized apiFetch client
 * with proper tenant handling, CSRF protection, and error handling.
 */

import { apiFetch } from './apiClient';
import { logger } from '@/lib/monitoring/logger';

export interface AxiosRequestConfig {
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  baseURL?: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  withCredentials?: boolean;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
}

export interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: AxiosRequestConfig;
  request?: any;
}

export class AxiosError extends Error {
  response?: {
    data: any;
    status: number;
    statusText: string;
    headers: Record<string, string>;
  };
  request?: any;
  config?: AxiosRequestConfig;
  code?: string;
  isAxiosError = true;

  constructor(
    message: string,
    code?: string,
    config?: AxiosRequestConfig,
    request?: any,
    response?: any
  ) {
    super(message);
    this.name = 'AxiosError';
    this.code = code;
    this.config = config;
    this.request = request;
    this.response = response;
  }
}

/**
 * Convert params object to URLSearchParams
 */
function paramsToSearchParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  return searchParams.toString();
}

/**
 * Build full URL from base URL and path
 */
function buildFullUrl(
  baseURL: string,
  url: string,
  params?: Record<string, any>
): string {
  let fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`;

  if (params && Object.keys(params).length > 0) {
    const queryString = paramsToSearchParams(params);
    fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
  }

  return fullUrl;
}

/**
 * Parse response headers from Headers object
 */
function parseHeaders(headers: Headers): Record<string, string> {
  const parsed: Record<string, string> = {};
  headers.forEach((value, key) => {
    parsed[key] = value;
  });
  return parsed;
}

/**
 * Determine if a URL is external (starts with http:// or https://)
 */
function isExternalUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Main request function that mimics axios behavior
 */
async function request<T = any>(
  config: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  const {
    url = '',
    method = 'GET',
    baseURL = '',
    headers = {},
    params,
    data,
    timeout,
    responseType = 'json',
  } = config;

  const fullUrl = buildFullUrl(baseURL, url, params);
  const isExternal = isExternalUrl(fullUrl);

  try {
    const options: RequestInit = {
      method,
      headers: {
        ...headers,
        ...(data &&
          !(data instanceof FormData) && {
            'Content-Type': 'application/json',
          }),
      },
    };

    if (data && method !== 'GET') {
      options.body = data instanceof FormData ? data : JSON.stringify(data);
    }

    logger.debug(`[axios-replacement] ${method} ${fullUrl}`);

    // Use native fetch for external URLs, apiFetch for internal URLs
    const response = isExternal
      ? await fetch(fullUrl, options)
      : await apiFetch(fullUrl, options);

    // Check response status for native fetch (apiFetch already throws on error)
    if (isExternal && !response.ok) {
      // Try to get error details from response
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        try {
          errorData = { message: await response.text() };
        } catch {
          errorData = { message: response.statusText };
        }
      }

      const error = new AxiosError(
        `Request failed with status ${response.status}`,
        'ERR_BAD_RESPONSE',
        config,
        undefined,
        {
          data: errorData,
          status: response.status,
          statusText: response.statusText,
          headers: parseHeaders(response.headers),
        }
      );
      throw error;
    }

    let responseData: T;

    // Parse response based on responseType
    if (responseType === 'blob') {
      responseData = (await response.blob()) as unknown as T;
    } else if (responseType === 'arraybuffer') {
      responseData = (await response.arrayBuffer()) as unknown as T;
    } else if (responseType === 'text') {
      responseData = (await response.text()) as unknown as T;
    } else {
      // Default to JSON
      try {
        responseData = await response.json();
      } catch {
        // If JSON parsing fails, return text
        responseData = (await response.text()) as unknown as T;
      }
    }

    return {
      data: responseData,
      status: response.status,
      statusText: response.statusText,
      headers: parseHeaders(response.headers),
      config,
    };
  } catch (error) {
    logger.error(`[axios-replacement] Request failed:`, error);

    // Handle AxiosError that was already thrown
    if (error instanceof AxiosError) {
      throw error;
    }

    if (error instanceof Error && 'status' in error) {
      // This is an API error from apiFetch
      const apiError = error as any;

      let errorData;
      try {
        errorData = JSON.parse(apiError.body || '{}');
      } catch {
        errorData = { message: apiError.body || apiError.message };
      }

      throw new AxiosError(
        apiError.message,
        'ERR_BAD_RESPONSE',
        config,
        undefined,
        {
          data: errorData,
          status: apiError.status || 0,
          statusText: apiError.message,
          headers: {},
        }
      );
    }

    // Network or other error - add more details
    logger.error(`[axios-replacement] Network error details:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      url: fullUrl,
      method,
      isExternal,
    });

    throw new AxiosError(
      error instanceof Error ? error.message : 'Network Error',
      'ERR_NETWORK',
      config
    );
  }
}

/**
 * Axios-compatible interface
 */
export const axios = {
  request,

  get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return request<T>({ ...config, method: 'GET', url });
  },

  post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return request<T>({ ...config, method: 'POST', url, data });
  },

  put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return request<T>({ ...config, method: 'PUT', url, data });
  },

  patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return request<T>({ ...config, method: 'PATCH', url, data });
  },

  delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return request<T>({ ...config, method: 'DELETE', url });
  },

  create(config?: AxiosRequestConfig) {
    return {
      request: (requestConfig: AxiosRequestConfig) =>
        request({ ...config, ...requestConfig }),
      get: <T = any>(url: string, requestConfig?: AxiosRequestConfig) =>
        request<T>({ ...config, ...requestConfig, method: 'GET', url }),
      post: <T = any>(
        url: string,
        data?: any,
        requestConfig?: AxiosRequestConfig
      ) =>
        request<T>({ ...config, ...requestConfig, method: 'POST', url, data }),
      put: <T = any>(
        url: string,
        data?: any,
        requestConfig?: AxiosRequestConfig
      ) =>
        request<T>({ ...config, ...requestConfig, method: 'PUT', url, data }),
      patch: <T = any>(
        url: string,
        data?: any,
        requestConfig?: AxiosRequestConfig
      ) =>
        request<T>({ ...config, ...requestConfig, method: 'PATCH', url, data }),
      delete: <T = any>(url: string, requestConfig?: AxiosRequestConfig) =>
        request<T>({ ...config, ...requestConfig, method: 'DELETE', url }),
    };
  },

  isAxiosError(error: any): error is AxiosError {
    return error?.isAxiosError === true;
  },
};

// Export default for drop-in replacement
export default axios;

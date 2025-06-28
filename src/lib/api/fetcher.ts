import { logger } from '@/lib/monitoring/logger';
import { apiFetch } from '@/lib/api/apiClient';

interface FetcherOptions extends RequestInit {
  defaultErrorMessage?: string;
}

/**
 * A wrapper around fetch with error handling
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns Promise that resolves to the response data
 */
export const fetcher = async <T = any>(
  url: string,
  options: FetcherOptions = {}
): Promise<T> => {
  try {
    const { defaultErrorMessage, ...fetchOptions } = options;

    const response = await apiFetch(url, fetchOptions);

    // For empty responses (like 204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    logger.error('API request failed', { error });
    throw error;
  }
};

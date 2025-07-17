/**
 * Response Standardization Middleware
 *
 * This middleware can be used to gradually migrate endpoints to standardized
 * response formats without breaking existing functionality.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { apiResponse, sendSuccess } from '@/utils/api/responses';

/**
 * Wraps an existing handler to standardize its responses
 * Use this for gradual migration of legacy endpoints
 */
export function withStandardResponses<
  T extends NextApiRequest = NextApiRequest,
>(handler: (req: T, res: NextApiResponse) => Promise<void>) {
  return async (req: T, res: NextApiResponse) => {
    // Store the original json method
    const originalJson = res.json.bind(res);
    const originalStatus = res.status.bind(res);
    let statusCode = 200;

    // Override status to capture the status code
    res.status = function (code: number) {
      statusCode = code;
      return originalStatus(code);
    };

    // Override json to intercept and standardize responses
    res.json = function (body: any) {
      // If already in standard format, pass through
      if (
        body &&
        typeof body === 'object' &&
        'data' in body &&
        !('error' in body)
      ) {
        return originalJson(body);
      }

      // Standardize success responses (2xx)
      if (statusCode >= 200 && statusCode < 300) {
        // Handle different legacy formats
        if (Array.isArray(body)) {
          // Direct array response -> wrap in data
          sendSuccess(res, body);
          return res;
        } else if (body && typeof body === 'object') {
          // Object response -> check if it needs wrapping
          const hasDataStructure =
            'results' in body ||
            'items' in body ||
            'records' in body ||
            'projects' in body ||
            'claims' in body ||
            'documents' in body;

          if (hasDataStructure) {
            // Already has some structure, keep as is but wrap in data
            sendSuccess(res, body);
          } else {
            // Plain object, wrap it
            sendSuccess(res, body);
          }
          return res;
        }
      }

      // Standardize error responses (4xx, 5xx)
      if (statusCode >= 400) {
        // Check for different error formats
        if (body && typeof body === 'object') {
          if ('error' in body || 'message' in body) {
            // Has some error structure, use apiResponse.serverError
            // which will properly format it
            const error = new Error(body.error || body.message);
            apiResponse.serverError(res, error);
            return res;
          }
        }
      }

      // Fallback to original for edge cases
      return originalJson(body);
    };

    // Execute the original handler
    try {
      await handler(req, res);
    } catch (error) {
      // Use standardized error handling
      apiResponse.serverError(res, error);
    }
  };
}

/**
 * Example usage:
 *
 * // Before
 * export default handler;
 *
 * // After (with gradual migration)
 * export default withStandardResponses(handler);
 *
 * // Or with other middleware
 * export default SecurePresets.tenantProtected(
 *   TenantResolvers.fromProject,
 *   withStandardResponses(handler)
 * );
 */

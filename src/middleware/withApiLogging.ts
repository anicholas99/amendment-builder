import { NextApiRequest, NextApiResponse } from 'next';
import { ApiLogger, createApiLogger } from '@/server/monitoring/apiLogger';
import { CustomApiRequest } from '@/types/api';
import { environment } from '@/config/environment';

export interface ApiHandler {
  (
    req: NextApiRequest | CustomApiRequest,
    res: NextApiResponse,
    apiLogger: ApiLogger
  ): Promise<void> | void;
}

/**
 * Middleware that automatically handles API request/response logging
 * Reduces redundancy by combining initial request log with operation logs
 */
export function withApiLogging(routeName: string, handler: ApiHandler) {
  return async (
    req: NextApiRequest | CustomApiRequest,
    res: NextApiResponse
  ) => {
    const apiLogger = createApiLogger(routeName);

    // Log the request details at debug level to avoid redundancy
    apiLogger.logRequest(req);

    // Override res.json to automatically log responses
    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      apiLogger.logResponse(res.statusCode || 200, body);
      return originalJson(body);
    };

    // Override res.status to track status codes
    const originalStatus = res.status.bind(res);
    res.status = function (code: number) {
      res.statusCode = code;
      return originalStatus(code);
    };

    try {
      await handler(req, res, apiLogger);
    } catch (error) {
      apiLogger.logError(error as Error);

      // If the response hasn't been sent yet, send an error response
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Internal server error',
          message: environment.isDevelopment
            ? (error as Error).message
            : undefined,
        });
      }
    }
  };
}

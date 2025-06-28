import { z } from 'zod';
import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, ApiHandler } from './middleware';

/**
 * Helper to create a typed API route handler
 * @example
 * const handler = createApiHandler({
 *   schema: z.object({ name: z.string() }),
 *   async handler(req, res) {
 *     // req.body is typed based on schema
 *     const { name } = req.body;
 *   }
 * });
 */
export function createApiHandler<TSchema extends z.ZodSchema>(config: {
  schema?: TSchema;
  handler: ApiHandler<TSchema extends z.ZodSchema ? z.infer<TSchema> : unknown>;
}): ApiHandler<TSchema extends z.ZodSchema ? z.infer<TSchema> : unknown> {
  return config.handler;
}

/**
 * Type guard to check if a request is authenticated
 */
export function isAuthenticated(
  req: NextApiRequest
): req is AuthenticatedRequest & {
  user: NonNullable<AuthenticatedRequest['user']>;
} {
  return !!(req as AuthenticatedRequest).user;
}

/**
 * Type guard to check if error is an API error with code
 */
export function isApiError(error: unknown): error is {
  code: string;
  message: string;
  statusCode?: number;
} {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as Record<string, unknown>).code === 'string' &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

/**
 * Create a typed response helper
 */
export function createResponse<T>(
  res: NextApiResponse,
  status: number,
  data: T
): void {
  res.status(status).json(data);
}

/**
 * Success response helper
 */
export function success<T>(res: NextApiResponse, data: T, status = 200): void {
  createResponse(res, status, data);
}

/**
 * Error response helper
 */
export function error(
  res: NextApiResponse,
  message: string,
  status = 500,
  details?: unknown
): void {
  const errorObj: { error: boolean; message: string; details?: unknown } = {
    error: true,
    message,
  };

  if (details !== undefined) {
    errorObj.details = details;
  }

  createResponse(res, status, errorObj);
}

/**
 * Extract typed query parameters
 */
export function getQueryParam(
  req: NextApiRequest,
  param: string,
  defaultValue?: string
): string | undefined {
  const value = req.query[param];
  if (Array.isArray(value)) {
    return value[0] || defaultValue;
  }
  return value || defaultValue;
}

/**
 * Extract typed query parameters as number
 */
export function getQueryParamAsNumber(
  req: NextApiRequest,
  param: string,
  defaultValue?: number
): number | undefined {
  const value = getQueryParam(req, param);
  if (!value) return defaultValue;

  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Type-safe method check
 */
export function assertMethod(
  req: NextApiRequest,
  res: NextApiResponse,
  allowedMethods: string[]
): boolean {
  if (!allowedMethods.includes(req.method || '')) {
    res.setHeader('Allow', allowedMethods);
    error(res, `Method ${req.method} Not Allowed`, 405);
    return false;
  }
  return true;
}

// Generic error response type
export interface ErrorResponse {
  error: string;
  message?: string;
  code?: string;
  statusCode?: number;
  details?: unknown;
}

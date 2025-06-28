import { NextApiRequest, NextApiResponse } from 'next';
import { ApiHandler, ComposedHandler } from '@/types/middleware';

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

/**
 * Middleware that restricts a handler to a specific HTTP method.
 * Returns 405 Method Not Allowed for non-matching methods.
 *
 * @example
 * // Only allow POST requests
 * export default withMethod('POST',
 *   withAuth(
 *     withTenantGuard(resolveTenantId)(handler)
 *   )
 * );
 *
 * @param method - The allowed HTTP method
 * @param handler - The handler to execute if method matches
 * @returns A middleware-wrapped handler
 */
export function withMethod<T = unknown>(
  method: HttpMethod | HttpMethod[],
  handler: ApiHandler<T>
): ComposedHandler {
  const allowedMethods = Array.isArray(method) ? method : [method];

  return async (req: NextApiRequest, res: NextApiResponse) => {
    const requestMethod = req.method?.toUpperCase() as HttpMethod;

    if (!allowedMethods.includes(requestMethod)) {
      res.setHeader('Allow', allowedMethods.join(', '));
      return res.status(405).json({
        error: 'Method not allowed',
        message: `Only ${allowedMethods.join(', ')} requests are accepted.`,
      });
    }

    return handler(req, res);
  };
}

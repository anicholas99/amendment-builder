/**
 * Middleware Composition Utility
 *
 * Provides a clean, readable way to compose middleware functions
 * instead of deeply nested function calls.
 */

import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

type Middleware = (handler: NextApiHandler) => NextApiHandler;

/**
 * Compose multiple middleware functions into a single middleware.
 * Middleware are applied from right to left (bottom to top).
 *
 * @example
 * // Instead of:
 * export default withAuth(withCsrf(withTenantGuard(resolveTenantId)(handler)))
 *
 * // Use:
 * export default composeMiddleware(
 *   handler,
 *   withTenantGuard(resolveTenantId),
 *   withCsrf,
 *   withAuth
 * );
 */
export function composeMiddleware(
  handler: NextApiHandler,
  ...middlewares: Middleware[]
): NextApiHandler {
  return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
}

/**
 * Create a middleware pipeline with clear execution order.
 * Middleware are applied from top to bottom (first to last).
 *
 * @example
 * export default createMiddlewarePipeline([
 *   withRateLimit,
 *   withAuth,
 *   withCsrf,
 *   withTenantGuard(resolveTenantId),
 *   withValidation(schema),
 *   withErrorHandling,
 * ])(handler);
 */
export function createMiddlewarePipeline(
  middlewares: Middleware[]
): (handler: NextApiHandler) => NextApiHandler {
  return (handler: NextApiHandler) => {
    return middlewares
      .reverse()
      .reduce((acc, middleware) => middleware(acc), handler);
  };
}

/**
 * Conditional middleware wrapper.
 * Apply middleware only if condition is true.
 *
 * @example
 * export default composeMiddleware(
 *   handler,
 *   conditionalMiddleware(req => req.method === 'POST', withValidation(schema)),
 *   withAuth
 * );
 */
export function conditionalMiddleware(
  condition: (req: NextApiRequest) => boolean,
  middleware: Middleware
): Middleware {
  return (handler: NextApiHandler) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      if (condition(req)) {
        return middleware(handler)(req, res);
      }
      return handler(req, res);
    };
  };
}

/**
 * Method-specific middleware wrapper.
 * Apply middleware only for specific HTTP methods.
 *
 * @example
 * export default composeMiddleware(
 *   handler,
 *   methodMiddleware(['POST', 'PUT'], withValidation(schema)),
 *   withAuth
 * );
 */
export function methodMiddleware(
  methods: string[],
  middleware: Middleware
): Middleware {
  return conditionalMiddleware(
    req => methods.includes(req.method || ''),
    middleware
  );
}

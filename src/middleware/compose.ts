/**
 * Middleware exports file
 *
 * This file re-exports individual middleware functions for use in API routes.
 * The deprecated compose-based middleware has been removed in favor of
 * explicit middleware chaining for better security visibility.
 *
 * @example
 * import { withAuth, withCsrf, withTenantGuard } from '@/middleware/compose';
 *
 * export default withAuth(
 *   withCsrf(
 *     withTenantGuard(resolveTenantId)(handler)
 *   )
 * );
 */

import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

type Middleware = (handler: NextApiHandler) => NextApiHandler;

/**
 * Composes multiple middleware functions into a single handler.
 *
 * @param {...Middleware} middlewares - The middleware functions to compose.
 * @returns {NextApiHandler} A new handler that chains the middleware.
 */
export const composeMiddleware = (...middlewares: Middleware[]): Middleware => {
  return (handler: NextApiHandler) =>
    middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
};

// Export individual middleware functions for direct use
export { withAuth } from './auth';
export { withCsrf } from '../lib/security/csrf';
export { withValidation } from '../lib/security/validate';
export { withRateLimit } from './rateLimiter';
export { withProjectCache, withTenantCache, withUserCache } from './cache';
export { createApiLogger } from '@/server/monitoring/apiLogger';
export { withActivityLogging } from './activityLogger';
export { withMethod } from './method';
export { withQueryValidation } from './queryValidation';
export { withFileUpload } from './fileUpload';

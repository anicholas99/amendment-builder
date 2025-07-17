import { NextApiRequest, NextApiResponse } from 'next';
import { withRateLimit } from './rateLimiter';
import { withSecurityHeaders, withOriginProtection } from './security';
import { withAuth } from './auth';

// Type for API handler functions
type ApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<unknown>;

// Type for middleware functions
type Middleware = (handler: ApiHandler) => ApiHandler;

/**
 * Combines multiple middleware functions into a single middleware
 * @param middlewares Array of middleware functions
 * @returns Combined middleware function
 */
function combineMiddleware(middlewares: Middleware[]): Middleware {
  return (handler: ApiHandler) => {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    );
  };
}

/**
 * Apply all security middleware to an API handler
 * @param handler API handler function
 * @returns Handler with security middleware applied
 */
function withSecurityMiddleware(handler: ApiHandler): ApiHandler {
  return combineMiddleware([
    withSecurityHeaders,
    withOriginProtection,
    withRateLimit as Middleware,
  ])(handler);
}

/**
 * Apply security middleware plus Auth0 authentication to an API handler
 * @param handler API handler function
 * @returns Handler with security and auth middleware applied
 */
function withSecureAuthHandler(handler: ApiHandler): ApiHandler {
  // Apply security middleware first
  const securedHandler = withSecurityMiddleware(handler);

  // Then apply Auth0 authentication
  // @ts-expect-error - Type mismatch between middleware handler types
  return withAuth(securedHandler);
}

/**
 * Middleware Export Hub
 *
 * Central export point for all middleware functions.
 */

export * from './auth';
export * from './tenant';
export * from './authorization';
export * from './errorHandling';

// Re-export commonly used middleware combinations
export { withAuth } from './auth';
export { withTenant, withTenantValidation } from './tenant';
export { withTenantGuard } from './authorization';
export { withCsrf } from '../lib/security/csrf';
export { withValidation } from '../lib/security/validate';
export {
  withErrorHandling,
  throwNotFound,
  throwUnauthorized,
  throwForbidden,
  throwValidationError,
  throwTenantError,
} from './errorHandling';

// export { withRateLimit } from './rate-limit';
// export { withSecurityHeaders, withOriginProtection } from './security';
// export { withAuth } from './auth';

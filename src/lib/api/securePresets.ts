/**
 * Secure API Presets
 *
 * This module provides secure-by-default middleware compositions for API routes.
 * All routes MUST use one of these presets to ensure consistent security posture.
 *
 * @module securePresets
 */

import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import {
  withAuth,
  withCsrf,
  withRateLimit,
  withValidation,
  composeMiddleware,
} from '@/middleware/compose';
import { withQueryValidation } from '@/middleware/queryValidation';
import { withTenantGuard } from '@/middleware/authorization';
import { requireRole } from '@/middleware/role';
import { withErrorHandling } from '@/middleware/errorHandling';
import { AuthenticatedRequest } from '@/types/middleware';
import { logger } from '@/lib/monitoring/logger';
import type { RateLimitType } from '@/middleware/rate-limit-config';

/**
 * Type for tenant resolver functions
 */
export type TenantResolver = (
  req: AuthenticatedRequest
) => Promise<string | null>;

/**
 * Validation schema options
 */
export interface ValidationSchemas {
  query?: z.ZodSchema;
  body?: z.ZodSchema;
  bodyMethods?: string[];
}

/**
 * Options for secure presets
 */
export interface SecurePresetOptions {
  validate?: ValidationSchemas;
  rateLimit?: RateLimitType | false;
  csrf?: boolean;
}

/**
 * Apply validation middleware based on schemas
 */
function applyValidation(schemas?: ValidationSchemas) {
  return (handler: NextApiHandler): NextApiHandler => {
    if (!schemas) return handler;

    let chain = handler;

    // Apply query validation if provided
    if (schemas.query) {
      chain = withQueryValidation(schemas.query)(chain) as NextApiHandler;
    }

    // Apply body validation for specific methods
    if (schemas.body) {
      const methods = schemas.bodyMethods || ['POST', 'PUT', 'PATCH'];
      chain = (
        (h: NextApiHandler) => (req: NextApiRequest, res: NextApiResponse) => {
          if (methods.includes(req.method || '')) {
            return (withValidation(schemas.body!) as any)(h)(req, res);
          }
          return h(req, res);
        }
      )(chain);
    }

    return chain;
  };
}

/**
 * Determine if CSRF protection is needed based on auth transport
 */
function shouldUseCsrf(explicitCsrf?: boolean): boolean {
  // If explicitly set, use that value
  if (explicitCsrf !== undefined) return explicitCsrf;

  // Default to true for cookie-based auth (your current setup)
  // In the future, this could check process.env.AUTH_TRANSPORT
  return true;
}

/**
 * Base secure middleware applied to all private endpoints
 * Enforces: Error Handling -> Rate Limiting -> Authentication
 */
function createSecureBase(
  handler: NextApiHandler,
  rateLimit: RateLimitType | false = 'api'
): NextApiHandler {
  let chain = handler;

  // Always apply authentication for secure endpoints
  chain = (withAuth as any)(chain) as NextApiHandler;

  // Apply rate limiting if specified
  if (rateLimit) {
    chain = (withRateLimit as any)(chain, rateLimit) as NextApiHandler;
  }

  // Error handling must be outermost
  chain = (withErrorHandling as any)(chain) as NextApiHandler;

  return chain;
}

/**
 * Secure API Presets
 *
 * These presets enforce security best practices and make it impossible
 * to accidentally create insecure endpoints.
 */
export const SecurePresets = {
  /**
   * For endpoints that handle tenant-specific data.
   * This is the most common preset for your application.
   *
   * @param resolver - Function to resolve tenant ID from request
   * @param handler - The API handler
   * @param options - Additional options (validation, rate limit, etc.)
   *
   * @example
   * export default SecurePresets.tenantProtected(
   *   TenantResolvers.fromProject,
   *   handler,
   *   { validate: { query: projectIdSchema } }
   * );
   */
  tenantProtected: (
    resolver: TenantResolver,
    handler: NextApiHandler,
    options: SecurePresetOptions = {}
  ): NextApiHandler => {
    // Fail loudly if resolver is missing
    if (!resolver || typeof resolver !== 'function') {
      throw new Error(
        'SecurePresets.tenantProtected requires a tenant resolver function. ' +
          'Use TenantResolvers.fromProject, TenantResolvers.fromUser, etc.'
      );
    }

    const { validate, rateLimit = 'api', csrf } = options;
    const useCsrf = shouldUseCsrf(csrf);

    // Build the chain: Handler -> Validation -> CSRF -> TenantGuard
    let chain = handler;
    chain = applyValidation(validate)(chain);

    if (useCsrf) {
      chain = (withCsrf as any)(chain) as NextApiHandler;
    }

    chain = (withTenantGuard(resolver) as any)(chain) as NextApiHandler;

    // Apply base security (auth, rate limit, error handling)
    return createSecureBase(chain, rateLimit);
  },

  /**
   * For private endpoints that don't require tenant isolation.
   * Use sparingly - most endpoints should be tenant-protected.
   *
   * @param handler - The API handler
   * @param options - Additional options
   *
   * @example
   * export default SecurePresets.userPrivate(handler, {
   *   validate: { body: updateProfileSchema }
   * });
   */
  userPrivate: (
    handler: NextApiHandler,
    options: SecurePresetOptions = {}
  ): NextApiHandler => {
    const { validate, rateLimit = 'api', csrf } = options;
    const useCsrf = shouldUseCsrf(csrf);

    // Build the chain: Handler -> Validation -> CSRF
    let chain = handler;
    chain = applyValidation(validate)(chain);

    if (useCsrf) {
      chain = (withCsrf as any)(chain) as NextApiHandler;
    }

    // Apply base security
    return createSecureBase(chain, rateLimit);
  },

  /**
   * For admin endpoints that operate within a specific tenant.
   * Enforces both admin role and tenant isolation.
   *
   * @param resolver - Function to resolve tenant ID
   * @param handler - The API handler
   * @param options - Additional options
   */
  adminTenant: (
    resolver: TenantResolver,
    handler: NextApiHandler,
    options: SecurePresetOptions = {}
  ): NextApiHandler => {
    // Wrap handler with admin role requirement
    const adminHandler = (requireRole('ADMIN') as any)(
      handler
    ) as NextApiHandler;

    // Then apply tenant protection
    return SecurePresets.tenantProtected(resolver, adminHandler, options);
  },

  /**
   * For global admin endpoints that can operate across tenants.
   * Use with extreme caution - prefer adminTenant when possible.
   *
   * @param handler - The API handler
   * @param options - Additional options
   */
  adminGlobal: (
    handler: NextApiHandler,
    options: SecurePresetOptions = {}
  ): NextApiHandler => {
    const { validate, rateLimit = 'api', csrf } = options;
    const useCsrf = shouldUseCsrf(csrf);

    // Build the chain: Handler -> Validation -> CSRF -> AdminRole
    let chain = handler;
    chain = applyValidation(validate)(chain);

    if (useCsrf) {
      chain = (withCsrf as any)(chain) as NextApiHandler;
    }

    chain = (requireRole('ADMIN') as any)(chain) as NextApiHandler;

    // Apply base security
    return createSecureBase(chain, rateLimit);
  },

  /**
   * For truly public endpoints (health checks, public data).
   * No authentication required. Use sparingly.
   *
   * @param handler - The API handler
   * @param options - Rate limit options only
   *
   * @example
   * export default SecurePresets.public(handler);
   */
  public: (
    handler: NextApiHandler,
    options: { rateLimit?: RateLimitType | false } = {}
  ): NextApiHandler => {
    const { rateLimit = 'api' } = options;

    let chain = handler;

    // Apply rate limiting for public endpoints
    if (rateLimit) {
      chain = (withRateLimit as any)(chain, rateLimit) as NextApiHandler;
    }

    // Only error handling for public endpoints
    return (withErrorHandling as any)(chain) as NextApiHandler;
  },

  /**
   * For resources accessed directly by browsers (images, downloads, etc)
   * where tenant headers cannot be sent. Validates user has access to
   * the resource's tenant without requiring it to be their active tenant.
   *
   * @param resolver - Function to resolve tenant ID from request
   * @param handler - The API handler
   * @param options - Additional options
   *
   * @example
   * export default SecurePresets.browserAccessible(
   *   TenantResolvers.fromProject,
   *   handler
   * );
   */
  browserAccessible: (
    resolver: TenantResolver,
    handler: NextApiHandler,
    options: SecurePresetOptions = {}
  ): NextApiHandler => {
    const { validate, rateLimit = 'api', csrf = false } = options;

    // Import withTenantAccess
    const { withTenantAccess } = require('@/middleware/authorization');

    // Build the chain: Handler -> Validation -> TenantAccess (not Guard)
    let chain = handler;
    chain = applyValidation(validate)(chain);

    // No CSRF for browser-accessed resources
    // Use withTenantAccess instead of withTenantGuard
    chain = (withTenantAccess(resolver) as any)(chain) as NextApiHandler;

    // Apply base security (auth, rate limit, error handling)
    return createSecureBase(chain, rateLimit);
  },
};

/**
 * Standard tenant resolvers for common use cases
 */
export const TenantResolvers = {
  /**
   * Resolve tenant from project ID in query params
   */
  fromProject: async (req: AuthenticatedRequest): Promise<string | null> => {
    const { projectId } = req.query;
    if (!projectId || typeof projectId !== 'string') {
      return null;
    }
    // Import from repository instead of inline to avoid circular dependencies
    const { resolveTenantIdFromProject } = await import(
      '@/repositories/tenantRepository'
    );
    return resolveTenantIdFromProject(projectId);
  },

  /**
   * Resolve tenant from search history ID in query params
   */
  fromSearchHistory: async (
    req: AuthenticatedRequest
  ): Promise<string | null> => {
    const { searchHistoryId } = req.query;
    if (!searchHistoryId || typeof searchHistoryId !== 'string') {
      return null;
    }
    const { resolveTenantIdFromSearchHistory } = await import(
      '@/repositories/tenantRepository'
    );
    return resolveTenantIdFromSearchHistory(searchHistoryId);
  },

  /**
   * Resolve tenant from citation job ID in query params
   */
  fromCitationJob: async (
    req: AuthenticatedRequest
  ): Promise<string | null> => {
    const { citationJobId } = req.query;
    if (!citationJobId || typeof citationJobId !== 'string') {
      return null;
    }
    const { resolveTenantIdFromCitationJob } = await import(
      '@/repositories/tenantRepository'
    );
    return resolveTenantIdFromCitationJob(citationJobId);
  },

  /**
   * Resolve tenant from an external citation location job ID.
   * This traverses CitationMatch -> SearchHistory -> Project -> Tenant.
   */
  fromCitationLocationJob: async (
    req: AuthenticatedRequest
  ): Promise<string | null> => {
    const { id } = req.query;
    if (!id || typeof id !== 'string' || !/^\d+$/.test(id)) {
      return null;
    }
    const locationJobId = parseInt(id, 10);
    const { getFullCitationMatchByLocationJobId } = await import(
      '@/repositories/citationMatchRepository'
    );
    const match = await getFullCitationMatchByLocationJobId(locationJobId);
    return match?.searchHistory?.project?.tenantId ?? null;
  },

  /**
   * Resolve tenant from authenticated user (for user-scoped resources)
   */
  fromUser: async (req: AuthenticatedRequest): Promise<string | null> => {
    return req.user?.tenantId ?? null;
  },

  /**
   * Resolve tenant from a specific field in request body
   */
  fromBodyField: (fieldName: string) => {
    return async (req: AuthenticatedRequest): Promise<string | null> => {
      const value = req.body?.[fieldName];
      if (!value || typeof value !== 'string') {
        return null;
      }
      // If the field is projectId, resolve tenant from project
      if (fieldName === 'projectId') {
        const { resolveTenantIdFromProject } = await import(
          '@/repositories/tenantRepository'
        );
        return resolveTenantIdFromProject(value);
      }
      // For other fields, return the value directly (assuming it's a tenantId)
      return value;
    };
  },
};

/**
 * Type guards for request types
 */
export function isAuthenticated(
  req: NextApiRequest
): req is AuthenticatedRequest & {
  user: NonNullable<AuthenticatedRequest['user']>;
} {
  return 'user' in req && req.user != null;
}

/**
 * Log security events for audit trail
 */
export function logSecurityEvent(
  event: 'auth_failed' | 'tenant_mismatch' | 'role_denied',
  req: NextApiRequest,
  details?: Record<string, any>
) {
  const logData: Record<string, any> = {
    event,
    method: req.method,
    url: req.url,
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
    ...details,
  };

  if (isAuthenticated(req)) {
    logData.userId = req.user.id;
    logData.userEmail = req.user.email;
    logData.userTenant = req.user.tenantId;
  }

  logger.warn(`Security Event: ${event}`, logData);
}

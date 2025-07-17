import { NextApiRequest, NextApiResponse } from 'next';
// import { getPrismaClient } from '../lib/prisma'; // No longer needed

import { withUserCache } from './cache';
import {
  findTenantBySlug,
  checkUserTenantAccess,
  findTenantById,
} from '../repositories/tenantRepository'; // Import repository functions
import { logger } from '@/server/logger';
import { validateTenantSlug } from '@/config/tenant';

// Extend the NextApiRequest type to include tenantId and user
interface ExtendedRequest extends NextApiRequest {
  tenantId?: string;
  user?: {
    id: string;
    email?: string;
    name?: string;
    role?: string;
    tenantId?: string;
  };
}

/**
 * Middleware to enforce tenant isolation
 * Validates that a user has access to the requested tenant
 * This middleware should be used AFTER authentication middleware
 *
 * @param handler - The API request handler function
 */
export function withTenantValidation(
  handler: (
    req: NextApiRequest,
    res: NextApiResponse
  ) => Promise<void | NextApiResponse>
) {
  return async (req: ExtendedRequest, res: NextApiResponse) => {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userId = req.user.id;

      // Get tenant slug from headers - NO FALLBACKS
      const tenantSlugHeader = req.headers['x-tenant-slug'];
      let tenantSlugStr: string;

      try {
        tenantSlugStr = validateTenantSlug(tenantSlugHeader);
      } catch (tenantError) {
        // No tenant provided - this is always an error
        logger.error('Missing tenant context in request', {
          path: req.url,
          method: req.method,
          error: tenantError,
        });
        return res.status(400).json({
          error: 'Tenant context is required',
          message: 'All API requests must include the x-tenant-slug header',
        });
      }

      // First, check if the tenant exists using repository
      logger.debug(
        `[withTenantValidation] Looking up tenant for slug: ${tenantSlugStr}`
      );
      const tenant = await findTenantBySlug(tenantSlugStr);

      if (!tenant) {
        logger.error(
          `[withTenantValidation] Tenant with slug "${tenantSlugStr}" not found`
        );
        return res.status(404).json({ error: 'Tenant not found' });
      }

      // Next, check if the user has access to this tenant using repository
      logger.debug(
        `[withTenantValidation] Checking access for userId: ${userId} to tenantId: ${tenant.id} (slug: ${tenantSlugStr})`
      );
      const hasAccess = await checkUserTenantAccess(userId, tenant.id);
      logger.debug(
        `[withTenantValidation] Access check result for userId ${userId} to tenantId ${tenant.id}: ${hasAccess}`
      );

      if (!hasAccess) {
        logger.error(
          `[withTenantValidation] User ${userId} does not have access to tenant ${tenant.id} (${tenantSlugStr})`
        );
        return res
          .status(403)
          .json({ error: 'You do not have access to this tenant' });
      }

      // Attach tenant ID to the request object
      req.tenantId = tenant.id;
      logger.debug(
        `[withTenantValidation] Attached tenantId ${tenant.id} to request for user ${userId}`
      );

      // If we get here, the user has access to the tenant
      // Proceed with the request
      return handler(req, res);
    } catch (error) {
      logger.error('Tenant validation middleware error:', error);
      return res.status(500).json({
        status: 'error',
        error: {
          code: 'TENANT_RESOLUTION_FAILED',
          message: 'Failed to resolve tenant',
        },
      });
    }
  };
}

/**
 * Simple tenant middleware that validates user's tenantId
 * This is used in tests and simple scenarios
 *
 * @param handler - The API request handler function
 * @param options - Middleware options
 */
export function withTenant(
  handler: (
    req: NextApiRequest,
    res: NextApiResponse
  ) => Promise<void | NextApiResponse>,
  options?: { skipTenantCheck?: boolean }
) {
  return async (req: ExtendedRequest, res: NextApiResponse) => {
    try {
      // Skip tenant check if specified
      if (options?.skipTenantCheck) {
        return handler(req, res);
      }

      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check if user has tenantId
      if (!req.user.tenantId) {
        logger.warn('User has no tenantId', { userId: req.user.id });
        return res.status(403).json({
          status: 'error',
          error: {
            code: 'TENANT_ACCESS_DENIED',
            message: 'No tenant assigned to user',
          },
        });
      }

      // Validate tenant exists
      const tenant = await findTenantById(req.user.tenantId);

      if (!tenant) {
        logger.error('Tenant not found', { tenantId: req.user.tenantId });
        return res.status(404).json({
          status: 'error',
          error: {
            code: 'TENANT_NOT_FOUND',
            message: 'Tenant not found',
          },
        });
      }

      if (tenant.deletedAt) {
        logger.error('Tenant is deleted', { tenantId: tenant.id });
        return res.status(403).json({
          status: 'error',
          error: {
            code: 'TENANT_ACCESS_DENIED',
            message: 'Tenant is deactivated',
          },
        });
      }

      // Attach tenant to request
      (req as any).tenant = {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
      };

      return handler(req, res);
    } catch (error) {
      logger.error('Tenant validation middleware error:', error);
      return res.status(500).json({
        status: 'error',
        error: {
          code: 'TENANT_RESOLUTION_FAILED',
          message: 'Failed to resolve tenant',
        },
      });
    }
  };
}

/**
 * Combined middleware for both authentication and tenant validation
 * with caching for improved performance
 *
 * @param handler - The API request handler function
 */
export function withAuthAndTenant(
  handler: (
    req: NextApiRequest,
    res: NextApiResponse
  ) => Promise<void | NextApiResponse>
) {
  // Import the auth middleware dynamically to avoid circular dependencies
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { withAuth } = require('./auth');

  // Apply middleware in sequence: auth -> user cache -> tenant validation
  return withAuth(withUserCache(withTenantValidation(handler)));
}

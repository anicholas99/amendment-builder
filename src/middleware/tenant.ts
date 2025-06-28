import { NextApiRequest, NextApiResponse } from 'next';
// import { getPrismaClient } from '../lib/prisma'; // No longer needed

import { withUserCache } from './cache';
import {
  findTenantBySlug,
  checkUserTenantAccess,
} from '../repositories/tenantRepository'; // Import repository functions
import { logger } from '@/lib/monitoring/logger';

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

      // Get tenant slug from headers
      const tenantSlug = req.headers['x-tenant-slug'] || 'development';

      if (
        !tenantSlug ||
        (typeof tenantSlug !== 'string' && !Array.isArray(tenantSlug))
      ) {
        logger.warn('No tenant slug provided in headers');
        return res.status(400).json({ error: 'Tenant slug is required' });
      }

      const tenantSlugStr = Array.isArray(tenantSlug)
        ? tenantSlug[0]
        : tenantSlug;

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
      return res.status(500).json({ error: 'Internal server error' });
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

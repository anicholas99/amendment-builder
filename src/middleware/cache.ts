import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/server/logger';
import { AuthenticatedRequest } from '@/types/middleware';
import { API_ROUTES } from '@/constants/apiRoutes';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// Cache implementation with TTL
class RequestCache {
  private cache = new Map<string, CacheItem<unknown>>();

  // Default TTL of 30 seconds
  constructor(private ttl: number = 30000) {}

  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) return null;

    // Check if item is expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Create global cache instances
const userCache = new RequestCache();
const tenantCache = new RequestCache();
const projectListCache = new RequestCache(15000); // Shorter TTL for project lists

// Middleware to cache user data
export function withUserCache<
  Req extends AuthenticatedRequest = AuthenticatedRequest,
>(
  handler: (req: Req, res: NextApiResponse) => Promise<void | NextApiResponse>
) {
  return async (req: Req, res: NextApiResponse) => {
    // Only apply caching to GET requests
    if (req.method !== 'GET' && req.user && req.user.id) {
      return handler(req, res);
    }

    const userId = req.user?.id;
    if (userId) {
      const cacheKey = `user:${userId}`;
      const cachedUser = userCache.get<{
        id: string;
        email: string;
        role: string;
      }>(cacheKey);

      if (cachedUser) {
        logger.debug(`User cache hit for ${userId}`);
        req.user = cachedUser;
      } else if (req.user) {
        userCache.set(cacheKey, req.user);
      }
    }

    return handler(req, res);
  };
}

// Middleware to cache tenant data
export function withTenantCache<
  Req extends AuthenticatedRequest = AuthenticatedRequest,
>(
  handler: (req: Req, res: NextApiResponse) => Promise<void | NextApiResponse>
) {
  return async (req: Req, res: NextApiResponse) => {
    if (req.method !== 'GET') {
      return handler(req, res);
    }

    const originalJson = res.json;

    res.json = function (body: unknown) {
      if (
        req.url?.includes(API_ROUTES.TENANTS.USER) &&
        typeof body === 'object' &&
        body !== null &&
        'tenants' in body
      ) {
        const userId = req.user?.id;
        if (userId) {
          const cacheKey = `tenants:${userId}`;
          tenantCache.set(cacheKey, (body as { tenants: unknown }).tenants);
          logger.debug(`Cached tenants for user ${userId}`);
        }
      }
      return originalJson.call(this, body);
    };

    return handler(req, res);
  };
}

// Middleware to cache project list data
export function withProjectCache<
  Req extends AuthenticatedRequest = AuthenticatedRequest,
>(
  handler: (req: Req, res: NextApiResponse) => Promise<void | NextApiResponse>
) {
  return async (req: Req, res: NextApiResponse) => {
    if (req.method !== 'GET' || !req.url?.includes(API_ROUTES.PROJECTS.LIST)) {
      return handler(req, res);
    }

    const userId = req.user?.id;
    const tenantSlug = req.headers?.['x-tenant-slug'] as string;

    if (userId && tenantSlug) {
      const cacheKey = `projects:${userId}:${tenantSlug}`;
      const cachedProjects = projectListCache.get(cacheKey);

      if (
        cachedProjects &&
        req.url &&
        !req.url.match(/\/api\/projects\/[^\/]+$/)
      ) {
        logger.debug(
          `Project list cache hit for ${userId} in tenant ${tenantSlug}`
        );
        res.status(200).json(cachedProjects);
        return;
      }

      const originalJson = res.json;
      res.json = function (body: unknown) {
        if (
          res.statusCode === 200 &&
          req.url &&
          !req.url.match(/\/api\/projects\/[^\/]+$/)
        ) {
          projectListCache.set(cacheKey, body);
          logger.debug(
            `Cached project list for ${userId} in tenant ${tenantSlug}`
          );
        }
        return originalJson.call(this, body);
      };
    }

    return handler(req, res);
  };
}

// Utility to invalidate cache when data changes
export function invalidateProjectCache(
  userId: string,
  tenantSlug: string
): void {
  const cacheKey = `projects:${userId}:${tenantSlug}`;
  projectListCache.invalidate(cacheKey);
  logger.debug(
    `Invalidated project cache for ${userId} in tenant ${tenantSlug}`
  );
}

export function invalidateTenantCache(userId: string): void {
  const cacheKey = `tenants:${userId}`;
  tenantCache.invalidate(cacheKey);
  logger.debug(`Invalidated tenant cache for ${userId}`);
}

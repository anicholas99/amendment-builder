import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/server/logger';
import {
  AuthenticatedRequest,
  ApiHandler,
  TenantResolver,
  ComposedHandler,
} from '@/types/middleware';

/**
 * Middleware to enforce that the authenticated user belongs to the same tenant
 * as the resource being accessed and (optionally) holds one of the required roles.
 *
 * Usage example:
 * ```ts
 * const resolveTenantId = async (req: AuthenticatedRequest) => {
 *   const { projectId } = req.query;
 *   const project = await prisma.project.findUnique({ where: { id: String(projectId) }, select: { tenantId: true } });
 *   return project?.tenantId ?? null;
 * };
 * export default withTenantGuard(resolveTenantId)(handler);
 * ```
 *
 * @param resolveTenantId  Function that extracts the tenantId that owns the resource
 *                         from the request. May return `null` if resource not found.
 * @param requiredRoles    Acceptable user roles (default: ['USER']).
 */
export function withTenantGuard(
  resolveTenantId: TenantResolver,
  requiredRoles: string[] = ['USER']
) {
  return <T = unknown>(handler: ApiHandler<T>): ComposedHandler => {
    return async function tenantGuardedHandler(
      req: NextApiRequest,
      res: NextApiResponse
    ) {
      const authReq = req as AuthenticatedRequest;

      // Internal services must now also respect tenant boundaries
      // No more bypassing tenant checks

      // Ensure we have an authenticated user (set by withAuth)
      if (!authReq.user) {
        logger.warn('AuthZ failure: unauthenticated request');
        return res.status(401).json({ error: 'Authentication required' });
      }

      const activeTenantId = authReq.user.tenantId;
      if (!activeTenantId) {
        logger.warn('AuthZ failure: no active tenant on session', {
          userId: authReq.user.id,
        });
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Resolve the resource owner tenant
      let resourceTenantId: string | null;
      try {
        const result = await resolveTenantId(authReq);
        resourceTenantId =
          typeof result === 'string' || result === null ? result : null;
      } catch (err: unknown) {
        logger.error('AuthZ failure: error resolving tenantId for resource', {
          error: err instanceof Error ? err.message : String(err),
          errorStack: err instanceof Error ? err.stack : undefined,
          errorType: err?.constructor?.name || typeof err,
          rawError: JSON.stringify(err),
        });
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!resourceTenantId) {
        // Resource not found or not tied to a tenant – treat as 404 to avoid info-leak
        return res.status(404).json({ error: 'Resource not found' });
      }

      if (resourceTenantId !== activeTenantId) {
        logger.warn('AuthZ failure: tenant mismatch', {
          userId: authReq.user.id,
          activeTenantId,
          resourceTenantId,
          path: authReq.url,
        });
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Basic role check (case-insensitive)
      // ADMIN users can access any endpoint, others need exact role match
      const userRole = (authReq.user.role || 'USER').toUpperCase();
      const roleAllowed =
        userRole === 'ADMIN' ||
        requiredRoles.map(r => r.toUpperCase()).includes(userRole);
      if (!roleAllowed) {
        logger.warn('AuthZ failure: role insufficient', {
          userId: authReq.user.id,
          userRole,
          requiredRoles,
        });
        return res.status(403).json({ error: 'Forbidden' });
      }

      // All good – proceed to handler
      return (
        handler as (
          req: AuthenticatedRequest,
          res: NextApiResponse
        ) => void | Promise<void>
      )(authReq, res);
    };
  };
}

/**
 * Convenience factory that returns a resolver picking the tenantId from a query param.
 * Example:
 *   export default withTenantGuard(fromQuery('tenant'))(handler)
 */
export function fromQuery(paramName: string): TenantResolver {
  return (req: AuthenticatedRequest): string | null => {
    const value = req.query[paramName];
    return typeof value === 'string' ? value : null;
  };
}

/**
 * Middleware to enforce that the authenticated user has ACCESS to the tenant
 * that owns the resource (not necessarily their active tenant).
 * Use this for resources accessed directly by browsers (images, downloads, etc)
 * where custom headers like x-tenant-slug cannot be sent.
 *
 * @param resolveTenantId  Function that extracts the tenantId that owns the resource
 * @param requiredRoles    Acceptable user roles (default: ['USER']).
 */
export function withTenantAccess(
  resolveTenantId: TenantResolver,
  requiredRoles: string[] = ['USER']
) {
  return <T = unknown>(handler: ApiHandler<T>): ComposedHandler => {
    return async function tenantAccessHandler(
      req: NextApiRequest,
      res: NextApiResponse
    ) {
      const authReq = req as AuthenticatedRequest;

      // Ensure we have an authenticated user
      if (!authReq.user) {
        logger.warn('AuthZ failure: unauthenticated request');
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Resolve the resource owner tenant
      let resourceTenantId: string | null;
      try {
        const result = await resolveTenantId(authReq);
        resourceTenantId =
          typeof result === 'string' || result === null ? result : null;
      } catch (err: unknown) {
        logger.error('AuthZ failure: error resolving tenantId for resource', {
          error: err instanceof Error ? err.message : String(err),
        });
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!resourceTenantId) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      // Check if user has access to this tenant (not if it's their active one)
      const { checkUserTenantAccess } = await import(
        '@/repositories/tenantRepository'
      );
      const hasAccess = await checkUserTenantAccess(
        authReq.user.id,
        resourceTenantId
      );

      if (!hasAccess) {
        logger.warn('AuthZ failure: user lacks access to resource tenant', {
          userId: authReq.user.id,
          resourceTenantId,
          path: authReq.url,
        });
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Basic role check
      // ADMIN users can access any endpoint, others need exact role match
      const userRole = (authReq.user.role || 'USER').toUpperCase();
      const roleAllowed =
        userRole === 'ADMIN' ||
        requiredRoles.map(r => r.toUpperCase()).includes(userRole);
      if (!roleAllowed) {
        logger.warn('AuthZ failure: role insufficient', {
          userId: authReq.user.id,
          userRole,
          requiredRoles,
        });
        return res.status(403).json({ error: 'Forbidden' });
      }

      // All good – proceed to handler
      return (
        handler as (
          req: AuthenticatedRequest,
          res: NextApiResponse
        ) => void | Promise<void>
      )(authReq, res);
    };
  };
}

// Note: Internal service authentication has been moved to internalServiceAuth module
// This middleware now focuses solely on tenant-based authorization

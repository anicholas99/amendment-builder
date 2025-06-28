import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';

/**
 * Higher-order middleware that ensures the authenticated user has the specified role.
 * Requires `withAuth` or SecurePresets to have populated `req.user` beforehand.
 */
export function requireRole<
  Req extends AuthenticatedRequest = AuthenticatedRequest,
>(role: string) {
  const expected = role.toUpperCase();

  return function roleGuard(
    handler: (req: Req, res: NextApiResponse) => void | Promise<void>
  ): (req: Req, res: NextApiResponse) => Promise<void> {
    return async (req: Req, res: NextApiResponse): Promise<void> => {
      const userRole = req.user?.role?.toUpperCase();

      // Allow access if user has the expected role OR if user is ADMIN
      // Admins should have access to all endpoints
      if (!userRole || (userRole !== expected && userRole !== 'ADMIN')) {
        res.status(403).json({ error: 'Forbidden: insufficient privileges' });
        return;
      }
      await handler(req, res);
    };
  };
}

/**
 * Middleware that only requires ADMIN role when the incoming request is a DELETE.
 * All other HTTP methods pass through unchanged.
 * This lets read-only endpoints remain accessible to normal users while still
 * protecting destructive actions.
 * Requires `withAuth` or SecurePresets to have populated `req.user` beforehand.
 */
export function requireAdminForDelete<
  Req extends AuthenticatedRequest = AuthenticatedRequest,
>(
  handler: (req: Req, res: NextApiResponse) => void | Promise<void>
): (req: Req, res: NextApiResponse) => Promise<void> {
  return async (req: Req, res: NextApiResponse): Promise<void> => {
    if (req.method === 'DELETE') {
      const userRole = req.user?.role?.toUpperCase();
      if (userRole !== 'ADMIN') {
        res
          .status(403)
          .json({ error: 'Forbidden: ADMIN role required for DELETE' });
        return;
      }
    }
    await handler(req, res);
  };
}

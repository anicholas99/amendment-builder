import { NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import { requireRole, requireAdminForDelete } from '../role';
import { AuthenticatedRequest } from '@/types/middleware';

describe('role middleware', () => {
  const mockHandler = jest.fn(
    async (req: AuthenticatedRequest, res: NextApiResponse) => {
      res.status(200).json({ success: true });
    }
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requireRole', () => {
    it('should allow access when user has the required role', async () => {
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          role: 'EDITOR',
        },
      });

      const wrappedHandler = requireRole('EDITOR')(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).toHaveBeenCalledWith(req, res);
      expect(res._getStatusCode()).toBe(200);
    });

    it('should allow access when user is ADMIN regardless of required role', async () => {
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          role: 'ADMIN',
        },
      });

      // Require EDITOR role, but user is ADMIN
      const wrappedHandler = requireRole('EDITOR')(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).toHaveBeenCalledWith(req, res);
      expect(res._getStatusCode()).toBe(200);
    });

    it('should deny access when user lacks required role', async () => {
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          role: 'USER',
        },
      });

      const wrappedHandler = requireRole('EDITOR')(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(403);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Forbidden: insufficient privileges',
      });
    });

    it('should deny access when user has no role', async () => {
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          // No role property
        },
      });

      const wrappedHandler = requireRole('EDITOR')(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(403);
    });

    it('should handle case-insensitive role comparison', async () => {
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          role: 'editor', // lowercase
        },
      });

      const wrappedHandler = requireRole('EDITOR')(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).toHaveBeenCalledWith(req, res);
      expect(res._getStatusCode()).toBe(200);
    });

    it('should handle mixed case in required role', async () => {
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          role: 'EDITOR',
        },
      });

      const wrappedHandler = requireRole('Editor')(mockHandler); // mixed case
      await wrappedHandler(req, res);

      expect(mockHandler).toHaveBeenCalledWith(req, res);
      expect(res._getStatusCode()).toBe(200);
    });

    it('should deny access when user object is missing', async () => {
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        // No user object
      });

      const wrappedHandler = requireRole('EDITOR')(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(403);
    });

    it('should work with different role types', async () => {
      const roles = ['USER', 'EDITOR', 'MODERATOR', 'ADMIN'];

      for (const role of roles) {
        jest.clearAllMocks();

        const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>(
          {
            method: 'GET',
            user: {
              id: 'user-123',
              email: 'test@example.com',
              role,
            },
          }
        );

        const wrappedHandler = requireRole(role)(mockHandler);
        await wrappedHandler(req, res);

        expect(mockHandler).toHaveBeenCalledWith(req, res);
        expect(res._getStatusCode()).toBe(200);
      }
    });
  });

  describe('requireAdminForDelete', () => {
    it('should allow non-DELETE requests for any user', async () => {
      const methods = ['GET', 'POST', 'PUT', 'PATCH'] as const;

      for (const method of methods) {
        jest.clearAllMocks();

        const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>(
          {
            method,
            user: {
              id: 'user-123',
              email: 'test@example.com',
              role: 'USER',
            },
          }
        );

        const wrappedHandler = requireAdminForDelete(mockHandler);
        await wrappedHandler(req, res);

        expect(mockHandler).toHaveBeenCalledWith(req, res);
        expect(res._getStatusCode()).toBe(200);
      }
    });

    it('should allow DELETE requests for ADMIN users', async () => {
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'DELETE',
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          role: 'ADMIN',
        },
      });

      const wrappedHandler = requireAdminForDelete(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).toHaveBeenCalledWith(req, res);
      expect(res._getStatusCode()).toBe(200);
    });

    it('should deny DELETE requests for non-ADMIN users', async () => {
      const roles = ['USER', 'EDITOR', 'MODERATOR'];

      for (const role of roles) {
        jest.clearAllMocks();

        const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>(
          {
            method: 'DELETE',
            user: {
              id: 'user-123',
              email: 'test@example.com',
              role,
            },
          }
        );

        const wrappedHandler = requireAdminForDelete(mockHandler);
        await wrappedHandler(req, res);

        expect(mockHandler).not.toHaveBeenCalled();
        expect(res._getStatusCode()).toBe(403);
        expect(JSON.parse(res._getData())).toEqual({
          error: 'Forbidden: ADMIN role required for DELETE',
        });
      }
    });

    it('should handle case-insensitive admin role check', async () => {
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'DELETE',
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          role: 'admin', // lowercase
        },
      });

      const wrappedHandler = requireAdminForDelete(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).toHaveBeenCalledWith(req, res);
      expect(res._getStatusCode()).toBe(200);
    });

    it('should deny DELETE when user has no role', async () => {
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'DELETE',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          // No role
        },
      });

      const wrappedHandler = requireAdminForDelete(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(403);
    });

    it('should deny DELETE when user object is missing', async () => {
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'DELETE',
        // No user
      });

      const wrappedHandler = requireAdminForDelete(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(403);
    });

    it('should handle OPTIONS requests without role check', async () => {
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'OPTIONS',
        // No user needed for OPTIONS
      });

      const wrappedHandler = requireAdminForDelete(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).toHaveBeenCalledWith(req, res);
      expect(res._getStatusCode()).toBe(200);
    });
  });
});

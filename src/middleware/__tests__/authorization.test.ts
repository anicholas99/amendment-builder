// Mock modules to prevent environment loading issues
jest.mock('@/config/environment', () => ({
  environment: {},
}));

jest.mock('@/lib/monitoring/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('@/repositories/tenantRepository', () => ({
  checkUserTenantAccess: jest.fn(),
}));

import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import { withTenantGuard, withTenantAccess, fromQuery } from '../authorization';
import { logger } from '@/lib/monitoring/logger';
import { checkUserTenantAccess } from '@/repositories/tenantRepository';
import {
  AuthenticatedRequest,
  ApiHandler,
  TenantResolver,
} from '@/types/middleware';

describe('authorization middleware', () => {
  const mockHandler: ApiHandler = jest.fn(
    (req: NextApiRequest, res: NextApiResponse) => {
      res.status(200).json({ success: true });
    }
  );

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'USER',
    tenantId: 'tenant-123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('withTenantGuard', () => {
    const mockResolver: TenantResolver = jest
      .fn()
      .mockResolvedValue('tenant-123');

    it('should allow access when tenant matches', async () => {
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        user: mockUser,
      });

      const wrappedHandler = withTenantGuard(mockResolver)(mockHandler);
      await wrappedHandler(req, res);

      expect(mockResolver).toHaveBeenCalledWith(req);
      expect(mockHandler).toHaveBeenCalledWith(req, res);
      expect(res._getStatusCode()).toBe(200);
    });

    it('should reject unauthenticated requests', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        // No user
      });

      const wrappedHandler = withTenantGuard(mockResolver)(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Authentication required',
      });
      expect(logger.warn).toHaveBeenCalledWith(
        'AuthZ failure: unauthenticated request'
      );
    });

    it('should reject when user has no active tenant', async () => {
      const userWithoutTenant = { ...mockUser, tenantId: undefined };
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        user: userWithoutTenant,
      });

      const wrappedHandler = withTenantGuard(mockResolver)(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(403);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Forbidden',
      });
      expect(logger.warn).toHaveBeenCalledWith(
        'AuthZ failure: no active tenant on session',
        { userId: userWithoutTenant.id }
      );
    });

    it('should return 404 when resource not found', async () => {
      const nullResolver: TenantResolver = jest.fn().mockResolvedValue(null);
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        user: mockUser,
      });

      const wrappedHandler = withTenantGuard(nullResolver)(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Resource not found',
      });
    });

    it('should reject when tenant does not match', async () => {
      const differentTenantResolver: TenantResolver = jest
        .fn()
        .mockResolvedValue('different-tenant');
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        user: mockUser,
      });

      const wrappedHandler = withTenantGuard(differentTenantResolver)(
        mockHandler
      );
      await wrappedHandler(req, res);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(403);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Forbidden',
      });
      expect(logger.warn).toHaveBeenCalledWith(
        'AuthZ failure: tenant mismatch',
        expect.objectContaining({
          userId: mockUser.id,
          activeTenantId: mockUser.tenantId,
          resourceTenantId: 'different-tenant',
        })
      );
    });

    it('should handle resolver errors', async () => {
      const errorResolver: TenantResolver = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        user: mockUser,
      });

      const wrappedHandler = withTenantGuard(errorResolver)(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Internal server error',
      });
      expect(logger.error).toHaveBeenCalledWith(
        'AuthZ failure: error resolving tenantId for resource',
        expect.objectContaining({
          error: 'Database error',
        })
      );
    });

    it('should enforce role requirements', async () => {
      const adminOnlyHandler = withTenantGuard(mockResolver, ['ADMIN'])(
        mockHandler
      );
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        user: mockUser, // USER role
      });

      await adminOnlyHandler(req, res);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(403);
      expect(logger.warn).toHaveBeenCalledWith(
        'AuthZ failure: role insufficient',
        expect.objectContaining({
          userId: mockUser.id,
          userRole: 'USER',
          requiredRoles: ['ADMIN'],
        })
      );
    });

    it('should allow access with correct role', async () => {
      const adminUser = { ...mockUser, role: 'ADMIN' };
      const adminOnlyHandler = withTenantGuard(mockResolver, [
        'ADMIN',
        'SUPERUSER',
      ])(mockHandler);
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        user: adminUser,
      });

      await adminOnlyHandler(req, res);

      expect(mockHandler).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(200);
    });

    it('should handle case-insensitive role matching', async () => {
      const mixedCaseUser = { ...mockUser, role: 'admin' };
      const adminOnlyHandler = withTenantGuard(mockResolver, ['ADMIN'])(
        mockHandler
      );
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        user: mixedCaseUser,
      });

      await adminOnlyHandler(req, res);

      expect(mockHandler).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(200);
    });
  });

  describe('withTenantAccess', () => {
    const mockResolver: TenantResolver = jest
      .fn()
      .mockResolvedValue('resource-tenant-123');

    beforeEach(() => {
      (checkUserTenantAccess as jest.Mock).mockResolvedValue(true);
    });

    it('should allow access when user has access to resource tenant', async () => {
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        user: mockUser,
      });

      const wrappedHandler = withTenantAccess(mockResolver)(mockHandler);
      await wrappedHandler(req, res);

      expect(mockResolver).toHaveBeenCalledWith(req);
      expect(checkUserTenantAccess).toHaveBeenCalledWith(
        mockUser.id,
        'resource-tenant-123'
      );
      expect(mockHandler).toHaveBeenCalledWith(req, res);
      expect(res._getStatusCode()).toBe(200);
    });

    it('should reject when user lacks access to resource tenant', async () => {
      (checkUserTenantAccess as jest.Mock).mockResolvedValue(false);

      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        user: mockUser,
      });

      const wrappedHandler = withTenantAccess(mockResolver)(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(403);
      expect(logger.warn).toHaveBeenCalledWith(
        'AuthZ failure: user lacks access to resource tenant',
        expect.objectContaining({
          userId: mockUser.id,
          resourceTenantId: 'resource-tenant-123',
        })
      );
    });

    it('should reject unauthenticated requests', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        // No user
      });

      const wrappedHandler = withTenantAccess(mockResolver)(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(401);
      expect(checkUserTenantAccess).not.toHaveBeenCalled();
    });

    it('should return 404 when resource not found', async () => {
      const nullResolver: TenantResolver = jest.fn().mockResolvedValue(null);
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        user: mockUser,
      });

      const wrappedHandler = withTenantAccess(nullResolver)(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(404);
      expect(checkUserTenantAccess).not.toHaveBeenCalled();
    });

    it('should handle resolver errors', async () => {
      const errorResolver: TenantResolver = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        user: mockUser,
      });

      const wrappedHandler = withTenantAccess(errorResolver)(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(500);
      expect(checkUserTenantAccess).not.toHaveBeenCalled();
    });

    it('should enforce role requirements', async () => {
      const adminOnlyHandler = withTenantAccess(mockResolver, ['ADMIN'])(
        mockHandler
      );
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        user: mockUser, // USER role
      });

      await adminOnlyHandler(req, res);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(403);
    });
  });

  describe('fromQuery helper', () => {
    it('should extract tenant ID from query parameter', async () => {
      const resolver = fromQuery('tenantId');
      const req = {
        query: { tenantId: 'query-tenant-123' },
      } as unknown as AuthenticatedRequest;

      const result = await resolver(req);
      expect(result).toBe('query-tenant-123');
    });

    it('should return null for missing query parameter', async () => {
      const resolver = fromQuery('tenantId');
      const req = {
        query: {},
      } as unknown as AuthenticatedRequest;

      const result = await resolver(req);
      expect(result).toBeNull();
    });

    it('should return null for non-string query parameter', async () => {
      const resolver = fromQuery('tenantId');
      const req = {
        query: { tenantId: ['array', 'value'] },
      } as unknown as AuthenticatedRequest;

      const result = await resolver(req);
      expect(result).toBeNull();
    });
  });
});

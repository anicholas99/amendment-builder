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
  findTenantBySlug: jest.fn(),
  checkUserTenantAccess: jest.fn(),
}));

jest.mock('../cache', () => ({
  withUserCache: jest.fn(handler => handler),
}));

jest.mock('../auth', () => ({
  withAuth: jest.fn(handler => handler),
}));

import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import { withTenantValidation, withAuthAndTenant } from '../tenant';
import { logger } from '@/lib/monitoring/logger';
import {
  findTenantBySlug,
  checkUserTenantAccess,
} from '@/repositories/tenantRepository';
import { withUserCache } from '../cache';
import { withAuth } from '../auth';

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

describe('tenant middleware', () => {
  const mockHandler = jest.fn(
    async (req: NextApiRequest, res: NextApiResponse) => {
      res.status(200).json({ success: true });
    }
  );

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'USER',
    tenantId: 'tenant-123',
  };

  const mockTenant = {
    id: 'tenant-123',
    slug: 'test-tenant',
    name: 'Test Tenant',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementations
    (findTenantBySlug as jest.Mock).mockResolvedValue(mockTenant);
    (checkUserTenantAccess as jest.Mock).mockResolvedValue(true);
  });

  describe('withTenantValidation', () => {
    it('should allow access when user has access to tenant', async () => {
      const { req, res } = createMocks<ExtendedRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          'x-tenant-slug': 'test-tenant',
        },
        user: mockUser,
      });

      const wrappedHandler = withTenantValidation(mockHandler);
      await wrappedHandler(req, res);

      expect(findTenantBySlug).toHaveBeenCalledWith('test-tenant');
      expect(checkUserTenantAccess).toHaveBeenCalledWith(
        mockUser.id,
        mockTenant.id
      );
      expect(req.tenantId).toBe(mockTenant.id);
      expect(mockHandler).toHaveBeenCalledWith(req, res);
      expect(res._getStatusCode()).toBe(200);
    });

    it('should reject unauthenticated requests', async () => {
      const { req, res } = createMocks<ExtendedRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          'x-tenant-slug': 'test-tenant',
        },
        // No user
      });

      const wrappedHandler = withTenantValidation(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Authentication required',
      });
    });

    it('should reject requests without user id', async () => {
      const { req, res } = createMocks<ExtendedRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          'x-tenant-slug': 'test-tenant',
        },
        user: { email: 'test@example.com' }, // No id
      });

      const wrappedHandler = withTenantValidation(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(401);
    });

    it('should use development as default when no tenant slug header is provided', async () => {
      // Mock the development tenant
      const developmentTenant = {
        id: 'dev-tenant-123',
        slug: 'development',
        name: 'Development Tenant',
      };
      (findTenantBySlug as jest.Mock).mockResolvedValue(developmentTenant);

      const { req, res } = createMocks<ExtendedRequest, NextApiResponse>({
        method: 'GET',
        // No x-tenant-slug header
        user: mockUser,
      });

      const wrappedHandler = withTenantValidation(mockHandler);
      await wrappedHandler(req, res);

      // Should use 'development' as default
      expect(findTenantBySlug).toHaveBeenCalledWith('development');
      expect(checkUserTenantAccess).toHaveBeenCalledWith(
        mockUser.id,
        developmentTenant.id
      );
      expect(req.tenantId).toBe(developmentTenant.id);
      expect(mockHandler).toHaveBeenCalledWith(req, res);
      expect(res._getStatusCode()).toBe(200);
    });

    it('should use development as default tenant slug when header is missing', async () => {
      const { req, res } = createMocks<ExtendedRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          'x-tenant-slug': undefined,
        },
        user: mockUser,
      });

      // The middleware uses 'development' as default when header is missing
      (findTenantBySlug as jest.Mock).mockResolvedValue({
        ...mockTenant,
        slug: 'development',
      });

      const wrappedHandler = withTenantValidation(mockHandler);
      await wrappedHandler(req, res);

      expect(findTenantBySlug).toHaveBeenCalledWith('development');
    });

    it('should handle array tenant slug by using first value', async () => {
      const { req, res } = createMocks<ExtendedRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          'x-tenant-slug': ['first-tenant', 'second-tenant'],
        },
        user: mockUser,
      });

      const wrappedHandler = withTenantValidation(mockHandler);
      await wrappedHandler(req, res);

      expect(findTenantBySlug).toHaveBeenCalledWith('first-tenant');
      expect(mockHandler).toHaveBeenCalled();
    });

    it('should return 404 when tenant not found', async () => {
      (findTenantBySlug as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMocks<ExtendedRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          'x-tenant-slug': 'non-existent-tenant',
        },
        user: mockUser,
      });

      const wrappedHandler = withTenantValidation(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Tenant not found',
      });
      expect(logger.error).toHaveBeenCalledWith(
        '[withTenantValidation] Tenant with slug "non-existent-tenant" not found'
      );
    });

    it('should reject when user lacks access to tenant', async () => {
      (checkUserTenantAccess as jest.Mock).mockResolvedValue(false);

      const { req, res } = createMocks<ExtendedRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          'x-tenant-slug': 'test-tenant',
        },
        user: mockUser,
      });

      const wrappedHandler = withTenantValidation(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(403);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'You do not have access to this tenant',
      });
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining(
          `User ${mockUser.id} does not have access to tenant`
        )
      );
    });

    it('should handle database errors gracefully', async () => {
      (findTenantBySlug as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const { req, res } = createMocks<ExtendedRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          'x-tenant-slug': 'test-tenant',
        },
        user: mockUser,
      });

      const wrappedHandler = withTenantValidation(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Internal server error',
      });
      expect(logger.error).toHaveBeenCalledWith(
        'Tenant validation middleware error:',
        expect.any(Error)
      );
    });

    it('should log debug messages throughout the flow', async () => {
      const { req, res } = createMocks<ExtendedRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          'x-tenant-slug': 'test-tenant',
        },
        user: mockUser,
      });

      const wrappedHandler = withTenantValidation(mockHandler);
      await wrappedHandler(req, res);

      expect(logger.debug).toHaveBeenCalledWith(
        '[withTenantValidation] Looking up tenant for slug: test-tenant'
      );
      expect(logger.debug).toHaveBeenCalledWith(
        expect.stringContaining(
          '[withTenantValidation] Checking access for userId:'
        )
      );
      expect(logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('[withTenantValidation] Access check result')
      );
      expect(logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('[withTenantValidation] Attached tenantId')
      );
    });
  });

  describe('withAuthAndTenant', () => {
    it('should apply auth, cache, and tenant validation in sequence', async () => {
      const { req, res } = createMocks<ExtendedRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          'x-tenant-slug': 'test-tenant',
        },
        user: mockUser,
      });

      // Create a mock handler to verify the middleware chain
      const testHandler = jest.fn(
        async (req: NextApiRequest, res: NextApiResponse) => {
          res.status(200).json({ success: true });
        }
      );

      const wrappedHandler = withAuthAndTenant(testHandler);
      await wrappedHandler(req, res);

      // Verify middleware were called in correct order
      expect(withAuth).toHaveBeenCalled();
      expect(withUserCache).toHaveBeenCalled();

      // The actual handler should have been called through the chain
      expect(testHandler).toHaveBeenCalledWith(req, res);
    });

    it('should pass through the middleware chain correctly', async () => {
      // Mock the middleware to verify chaining
      (withAuth as jest.Mock).mockImplementation(handler => {
        return async (req: any, res: any) => {
          req.authApplied = true;
          return handler(req, res);
        };
      });

      (withUserCache as jest.Mock).mockImplementation(handler => {
        return async (req: any, res: any) => {
          req.cacheApplied = true;
          return handler(req, res);
        };
      });

      const { req, res } = createMocks<ExtendedRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          'x-tenant-slug': 'test-tenant',
        },
        user: mockUser,
      });

      const testHandler = jest.fn(async (req: any, res: NextApiResponse) => {
        // Verify all middleware were applied
        expect(req.authApplied).toBe(true);
        expect(req.cacheApplied).toBe(true);
        expect(req.tenantId).toBe(mockTenant.id);
        res.status(200).json({ success: true });
      });

      const wrappedHandler = withAuthAndTenant(testHandler);
      await wrappedHandler(req, res);

      expect(testHandler).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(200);
    });
  });
});

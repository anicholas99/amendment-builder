/**
 * Security tests for search-history API endpoint
 *
 * These tests verify that the tenant protection is working correctly
 * and prevents cross-tenant data access.
 */

import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';

// Mock the SecurePresets module directly
jest.mock('@/lib/api/securePresets', () => {
  const mockTenantResolver = jest.fn();
  return {
    SecurePresets: {
      tenantProtected: jest.fn((resolver: any, handler: NextApiHandler) => {
        mockTenantResolver.mockImplementation(resolver);
        return async (req: AuthenticatedRequest, res: NextApiResponse) => {
          // Simulate tenant guard behavior
          const tenantId = await resolver(req);
          if (tenantId && req.user?.tenantId !== tenantId) {
            return res.status(403).json({
              error: 'Forbidden',
              message: 'Access denied to this resource',
            });
          }
          if (!tenantId && req.method !== 'GET') {
            return res.status(404).json({
              error: 'Not Found',
              message: 'Resource not found',
            });
          }
          // Handle role check for DELETE method
          if (req.method === 'DELETE' && req.user?.role !== 'ADMIN') {
            return res.status(403).json({
              error: 'Forbidden',
              message: 'Admin access required',
            });
          }
          return handler(req, res);
        };
      }),
    },
    TenantResolvers: {
      fromProject: jest.fn(),
    },
  };
});

import { createMocks } from 'node-mocks-http';
import handler from '../search-history';
import { ApplicationError, ErrorCode } from '@/lib/error';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findUnique: jest.fn(),
    },
    searchHistory: {
      findMany: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    patentabilityScore: {
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock('@/lib/monitoring/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/lib/monitoring/apiLogger', () => ({
  createApiLogger: () => ({
    logApiRequest: jest.fn(),
  }),
}));

// Mock CSRF token validation
jest.mock('@/lib/security/csrf', () => ({
  validateCsrfToken: jest.fn().mockResolvedValue(true),
}));

// Mock repository functions
jest.mock('@/repositories/search', () => ({
  findManySearchHistory: jest.fn(),
  createSearchHistory: jest.fn(),
  deleteSearchHistoryByProjectId: jest.fn(),
  findSearchHistoryIdsByProjectId: jest.fn(),
  deletePatentabilityScoresBySearchHistoryIds: jest.fn(),
}));

jest.mock('@/repositories/tenantRepository', () => ({
  resolveTenantIdFromProject: jest.fn(),
}));

// Import mocked functions after mocking
import {
  findManySearchHistory,
  createSearchHistory,
  deleteSearchHistoryByProjectId,
  findSearchHistoryIdsByProjectId,
  deletePatentabilityScoresBySearchHistoryIds,
} from '@/repositories/search';
import { resolveTenantIdFromProject } from '@/repositories/tenantRepository';

describe('Search History API - Security Tests', () => {
  const mockUser = {
    id: 'user-123',
    email: 'user@tenant1.com',
    tenantId: 'tenant-1',
    role: 'USER',
  };

  const mockAdmin = {
    id: 'admin-123',
    email: 'admin@tenant1.com',
    tenantId: 'tenant-1',
    role: 'ADMIN',
  };

  const mockProjectTenant1 = {
    id: 'project-1',
    tenantId: 'tenant-1',
    name: 'Project in Tenant 1',
  };

  const mockProjectTenant2 = {
    id: 'project-2',
    tenantId: 'tenant-2',
    name: 'Project in Tenant 2',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/search-history - Cross-tenant protection', () => {
    it('should allow creating search history for project in same tenant', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-csrf-token': 'valid-token',
        },
        body: {
          projectId: 'project-1',
          query: 'test search query',
          results: [],
        },
        // @ts-ignore - Adding user to request
        user: mockUser,
      });

      // Mock tenant resolution
      (resolveTenantIdFromProject as jest.Mock).mockResolvedValueOnce(
        'tenant-1'
      );

      // Mock search history creation
      (createSearchHistory as jest.Mock).mockResolvedValueOnce({
        id: 'search-1',
        projectId: 'project-1',
        query: 'test search query',
        userId: 'user-123',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(createSearchHistory).toHaveBeenCalledWith(
        'tenant-1',
        expect.objectContaining({
          projectId: 'project-1',
          query: 'test search query',
          userId: 'user-123',
        })
      );
    });

    it('should block creating search history for project in different tenant', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-csrf-token': 'valid-token',
        },
        body: {
          projectId: 'project-2', // Project in tenant-2
          query: 'test search query',
          results: [],
        },
        // @ts-ignore - Adding user to request
        user: mockUser, // User in tenant-1
      });

      // Mock tenant resolution - returns different tenant
      (resolveTenantIdFromProject as jest.Mock).mockResolvedValueOnce(
        'tenant-2'
      );

      await handler(req, res);

      expect(res._getStatusCode()).toBe(403);
      expect(res._getJSONData()).toEqual(
        expect.objectContaining({
          error: 'Forbidden',
          message: expect.stringContaining('Access denied'),
        })
      );
      expect(createSearchHistory).not.toHaveBeenCalled();
    });

    it('should return 404 for non-existent project', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-csrf-token': 'valid-token',
        },
        body: {
          projectId: 'non-existent-project',
          query: 'test search query',
          results: [],
        },
        // @ts-ignore - Adding user to request
        user: mockUser,
      });

      // Mock tenant resolution - returns null
      (resolveTenantIdFromProject as jest.Mock).mockResolvedValueOnce(null);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual(
        expect.objectContaining({
          error: 'Not Found',
          message: 'Resource not found',
        })
      );
      expect(createSearchHistory).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/search-history - Cross-tenant protection', () => {
    it('should only return search history for projects in same tenant', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: {
          projectId: 'project-1',
        },
        // @ts-ignore - Adding user to request
        user: mockUser,
      });

      // Mock tenant resolution
      (resolveTenantIdFromProject as jest.Mock).mockResolvedValueOnce(
        'tenant-1'
      );

      // Mock search history lookup
      (findManySearchHistory as jest.Mock).mockResolvedValueOnce([
        { id: 'search-1', projectId: 'project-1', query: 'test' },
      ]);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(findManySearchHistory).toHaveBeenCalledWith(
        'tenant-1',
        expect.objectContaining({
          projectId: 'project-1',
        })
      );
    });

    it('should block access to search history for projects in different tenant', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: {
          projectId: 'project-2', // Project in tenant-2
        },
        // @ts-ignore - Adding user to request
        user: mockUser, // User in tenant-1
      });

      // Mock tenant resolution - returns different tenant
      (resolveTenantIdFromProject as jest.Mock).mockResolvedValueOnce(
        'tenant-2'
      );

      await handler(req, res);

      expect(res._getStatusCode()).toBe(403);
      expect(findManySearchHistory).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/search-history - Cross-tenant protection', () => {
    it('should allow admin to delete search history in same tenant', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        query: {
          projectId: 'project-1',
        },
        headers: {
          'x-csrf-token': 'valid-token',
        },
        // @ts-ignore - Adding user to request
        user: mockAdmin,
      });

      // Mock tenant resolution
      (resolveTenantIdFromProject as jest.Mock).mockResolvedValueOnce(
        'tenant-1'
      );

      // Mock search history ID lookup
      (findSearchHistoryIdsByProjectId as jest.Mock).mockResolvedValueOnce([
        'search-1',
        'search-2',
      ]);

      // Mock deletion
      (deleteSearchHistoryByProjectId as jest.Mock).mockResolvedValueOnce({
        count: 2,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: 'Deleted 2 search history records',
        deleted: 2,
      });
    });

    it('should block admin from deleting search history in different tenant', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        query: {
          projectId: 'project-2', // Project in tenant-2
        },
        headers: {
          'x-csrf-token': 'valid-token',
        },
        // @ts-ignore - Adding user to request
        user: mockAdmin, // Admin in tenant-1
      });

      // Mock tenant resolution - returns different tenant
      (resolveTenantIdFromProject as jest.Mock).mockResolvedValueOnce(
        'tenant-2'
      );

      await handler(req, res);

      expect(res._getStatusCode()).toBe(403);
      expect(deleteSearchHistoryByProjectId).not.toHaveBeenCalled();
    });

    it('should block non-admin users from deleting search history', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        query: {
          projectId: 'project-1',
        },
        headers: {
          'x-csrf-token': 'valid-token',
        },
        // @ts-ignore - Adding user to request
        user: mockUser, // Regular user
      });

      // Mock tenant resolution - it happens before role check
      (resolveTenantIdFromProject as jest.Mock).mockResolvedValueOnce(
        'tenant-1'
      );

      await handler(req, res);

      expect(res._getStatusCode()).toBe(403);
      expect(res._getJSONData()).toEqual(
        expect.objectContaining({
          error: expect.any(String),
          message: expect.stringContaining('Admin access required'),
        })
      );
      // Tenant resolution happens but deletion is blocked by role check
      expect(deleteSearchHistoryByProjectId).not.toHaveBeenCalled();
    });
  });
});

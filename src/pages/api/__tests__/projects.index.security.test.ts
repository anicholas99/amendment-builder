/**
 * Security tests for projects API index endpoint
 *
 * These tests verify tenant isolation and proper access control
 * for listing and creating projects.
 */

import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import { AuthenticatedRequest } from '@/types/middleware';

// Mock dependencies first
jest.mock('@/lib/monitoring/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/server/services/project.server-service', () => ({
  projectService: {
    getProjectsForUserPaginated: jest.fn(),
    createProject: jest.fn(),
  },
}));

jest.mock('@/types/project', () => ({
  transformProject: jest.fn(project => ({
    ...project,
    transformed: true,
  })),
}));

// Mock middleware modules
jest.mock('@/middleware/compose', () => ({
  withAuth: jest.fn((handler: NextApiHandler) => handler),
  withCsrf: jest.fn((handler: NextApiHandler) => handler),
  withRateLimit: jest.fn((handler: NextApiHandler) => handler),
  withValidation: jest.fn(
    (schema: any) => (handler: NextApiHandler) => handler
  ),
  composeMiddleware: jest.fn(),
}));

jest.mock('@/middleware/queryValidation', () => ({
  withQueryValidation: jest.fn(
    (schema: any) => (handler: NextApiHandler) => handler
  ),
}));

jest.mock('@/middleware/authorization', () => ({
  withTenantGuard: jest.fn(
    (resolver: any) => (handler: NextApiHandler) => handler
  ),
}));

jest.mock('@/middleware/errorHandling', () => ({
  withErrorHandling: jest.fn((handler: NextApiHandler) => handler),
}));

// Import the handler after mocking dependencies
import handler from '../projects/index';
import { projectService } from '@/server/services/project.server-service';

describe('Projects API - Security Tests', () => {
  const mockUserTenant1 = {
    id: 'user-123',
    email: 'user@tenant1.com',
    tenantId: 'tenant-1',
    role: 'USER',
  };

  const mockUserTenant2 = {
    id: 'user-456',
    email: 'user@tenant2.com',
    tenantId: 'tenant-2',
    role: 'USER',
  };

  const mockProjectsTenant1 = [
    {
      id: 'project-1',
      name: 'Project 1',
      tenantId: 'tenant-1',
      userId: 'user-123',
    },
    {
      id: 'project-2',
      name: 'Project 2',
      tenantId: 'tenant-1',
      userId: 'user-123',
    },
  ];

  const mockProjectsTenant2 = [
    {
      id: 'project-3',
      name: 'Project 3',
      tenantId: 'tenant-2',
      userId: 'user-456',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/projects - Tenant isolation', () => {
    it("should return only projects from the user's tenant", async () => {
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        query: {
          page: '1',
          limit: '20',
        },
        user: mockUserTenant1,
      });

      // Simulate query validation middleware
      (req as any).validatedQuery = {
        page: '1',
        limit: '20',
        filterBy: 'all',
        sortBy: 'modified',
        sortOrder: 'desc',
      };

      // Mock service response
      (
        projectService.getProjectsForUserPaginated as jest.Mock
      ).mockResolvedValueOnce({
        projects: mockProjectsTenant1,
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });

      await handler(req as any, res);

      expect(res._getStatusCode()).toBe(200);
      expect(projectService.getProjectsForUserPaginated).toHaveBeenCalledWith(
        'user-123',
        'tenant-1', // Should use user's tenant
        expect.any(Object)
      );

      const responseData = res._getJSONData();
      expect(responseData.projects).toHaveLength(2);
      expect(responseData.projects[0].transformed).toBe(true); // Verify transform was called
    });

    it('should enforce tenant boundary for different users', async () => {
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        query: {
          page: '1',
          limit: '20',
        },
        user: mockUserTenant2,
      });

      // Simulate query validation middleware
      (req as any).validatedQuery = {
        page: '1',
        limit: '20',
        filterBy: 'all',
        sortBy: 'modified',
        sortOrder: 'desc',
      };

      // Mock service response for tenant 2
      (
        projectService.getProjectsForUserPaginated as jest.Mock
      ).mockResolvedValueOnce({
        projects: mockProjectsTenant2,
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });

      await handler(req as any, res);

      expect(res._getStatusCode()).toBe(200);
      expect(projectService.getProjectsForUserPaginated).toHaveBeenCalledWith(
        'user-456',
        'tenant-2', // Different tenant
        expect.any(Object)
      );

      const responseData = res._getJSONData();
      expect(responseData.projects).toHaveLength(1);
      expect(responseData.projects[0].id).toBe('project-3');
    });

    it('should handle query parameters correctly', async () => {
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        query: {
          page: '2',
          limit: '10',
          search: 'test',
          filterBy: 'in-progress',
          sortBy: 'created',
          sortOrder: 'asc',
        },
        user: mockUserTenant1,
      });

      // Simulate query validation middleware
      (req as any).validatedQuery = {
        page: '2',
        limit: '10',
        search: 'test',
        filterBy: 'in-progress',
        sortBy: 'created',
        sortOrder: 'asc',
      };

      (
        projectService.getProjectsForUserPaginated as jest.Mock
      ).mockResolvedValueOnce({
        projects: [],
        page: 2,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: true,
      });

      await handler(req as any, res);

      expect(res._getStatusCode()).toBe(200);
      expect(projectService.getProjectsForUserPaginated).toHaveBeenCalledWith(
        'user-123',
        'tenant-1',
        {
          page: 2,
          limit: 10,
          search: 'test',
          filterBy: 'in-progress',
          sortBy: 'created',
          sortOrder: 'asc',
        }
      );
    });
  });

  describe('POST /api/projects - Tenant isolation', () => {
    it("should create project in the user's tenant", async () => {
      const newProjectData = {
        name: 'New Test Project',
        status: 'draft' as const,
        textInput: 'This is a test invention',
      };

      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: newProjectData,
        user: mockUserTenant1,
      });

      const createdProject = {
        id: 'project-new',
        ...newProjectData,
        tenantId: 'tenant-1',
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (projectService.createProject as jest.Mock).mockResolvedValueOnce(
        createdProject
      );

      await handler(req as any, res);

      expect(res._getStatusCode()).toBe(201);
      expect(projectService.createProject).toHaveBeenCalledWith(
        newProjectData,
        'user-123',
        'tenant-1' // Should use user's tenant
      );

      const responseData = res._getJSONData();
      expect(responseData.id).toBe('project-new');
      expect(responseData.transformed).toBe(true); // Verify transform was called
    });

    it('should enforce tenant boundary for project creation', async () => {
      const newProjectData = {
        name: 'Another Test Project',
        status: 'draft' as const,
      };

      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: newProjectData,
        user: mockUserTenant2, // Different tenant
      });

      const createdProject = {
        id: 'project-new-2',
        ...newProjectData,
        tenantId: 'tenant-2',
        userId: 'user-456',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (projectService.createProject as jest.Mock).mockResolvedValueOnce(
        createdProject
      );

      await handler(req as any, res);

      expect(res._getStatusCode()).toBe(201);
      expect(projectService.createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Another Test Project',
          status: 'draft',
        }),
        'user-456',
        'tenant-2' // Different tenant
      );
    });
  });

  describe('Method validation', () => {
    it('should reject unsupported methods', async () => {
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'DELETE',
        user: mockUserTenant1,
      });

      await handler(req as any, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res._getJSONData()).toEqual({
        error: 'Method not allowed',
        message: 'Only GET, POST requests are accepted.',
      });
      expect(res._getHeaders()).toEqual(
        expect.objectContaining({
          allow: ['GET', 'POST'],
        })
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle missing tenant ID gracefully', async () => {
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        query: {
          page: '1',
          limit: '20',
        },
        user: {
          id: 'user-no-tenant',
          email: 'user@example.com',
          // No tenantId
          role: 'USER',
        } as any,
      });

      // Simulate query validation middleware
      (req as any).validatedQuery = {
        page: '1',
        limit: '20',
        filterBy: 'all',
        sortBy: 'modified',
        sortOrder: 'desc',
      };

      await expect(handler(req as any, res)).rejects.toThrow(
        'Tenant ID is required but was not provided by middleware'
      );
    });
  });
});

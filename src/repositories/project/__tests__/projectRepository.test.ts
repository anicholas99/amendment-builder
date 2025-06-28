/**
 * @jest-environment node
 *
 * Project Repository Strategic Tests
 *
 * Testing only the most critical operations:
 * - Project creation with tenant isolation
 * - User project queries
 * - Update with security checks
 */

import { ApplicationError, ErrorCode } from '@/lib/error';
import { Prisma } from '@prisma/client';

// Mock Prisma before imports
jest.mock('@/lib/prisma', () => {
  const mockProject = {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  };

  return {
    prisma: {
      project: mockProject,
      $transaction: jest.fn(callback => callback({ project: mockProject })),
    },
    __mocks: { mockProject },
  };
});

// Mock logger
jest.mock('@/lib/monitoring/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Import functions to test
import {
  createProject,
  findProjectsByTenantPaginated,
  secureUpdateProject,
} from '../index';

// Get mocks
const { __mocks } = require('@/lib/prisma');
const { mockProject } = __mocks;

describe('Project Repository - Strategic Tests', () => {
  const mockTenantId = 'tenant-123';
  const mockUserId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProject - Critical Operation', () => {
    it('should create project with proper tenant isolation', async () => {
      // Arrange
      const projectData = {
        name: 'Test Patent Application',
        status: 'draft' as const,
      };
      const mockCreated = {
        id: 'proj-123',
        ...projectData,
        tenantId: mockTenantId,
        userId: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockProject.create.mockResolvedValue(mockCreated);

      // Act
      const result = await createProject(projectData, mockUserId, mockTenantId);

      // Assert
      expect(result).toEqual(mockCreated);
      expect(mockProject.create).toHaveBeenCalledWith({
        data: {
          ...projectData,
          userId: mockUserId,
          tenantId: mockTenantId,
          textInput: '', // Default empty text input
        },
        select: expect.any(Object), // The function uses basicProjectSelect
      });
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      mockProject.create.mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act & Assert
      await expect(
        createProject({ name: 'Test' }, mockUserId, mockTenantId)
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('findProjectsByTenantPaginated - Most Used Query', () => {
    it('should return paginated projects for user within tenant', async () => {
      // Arrange
      const mockProjects = [
        { id: 'proj-1', name: 'Project 1', tenantId: mockTenantId },
        { id: 'proj-2', name: 'Project 2', tenantId: mockTenantId },
      ];
      mockProject.findMany.mockResolvedValue(mockProjects);
      mockProject.count.mockResolvedValue(2);

      // Act
      const result = await findProjectsByTenantPaginated(
        mockTenantId,
        mockUserId,
        { skip: 0, take: 10 }
      );

      // Assert
      expect(result.projects).toEqual(mockProjects);
      expect(result.total).toBe(2);
      expect(mockProject.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: mockUserId,
            tenantId: mockTenantId,
            deletedAt: null,
          },
          skip: 0,
          take: 10,
        })
      );
    });

    it('should handle search filtering', async () => {
      // Arrange
      mockProject.findMany.mockResolvedValue([]);
      mockProject.count.mockResolvedValue(0);

      // Act
      await findProjectsByTenantPaginated(mockTenantId, mockUserId, {
        skip: 0,
        take: 10,
        search: 'patent claim',
      });

      // Assert
      expect(mockProject.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: {
              contains: 'patent claim',
            },
          }),
        })
      );
    });
  });

  describe('secureUpdateProject - Tenant Security Check', () => {
    it('should update project only if user has access', async () => {
      // Arrange
      const projectId = 'proj-123';
      const updateData = { name: 'Updated Name' };
      const mockExisting = {
        id: projectId,
        tenantId: mockTenantId,
        userId: mockUserId,
        name: 'Old Name',
      };
      const mockUpdated = { ...mockExisting, ...updateData };

      mockProject.findFirst.mockResolvedValue(mockExisting);
      mockProject.update.mockResolvedValue(mockUpdated);

      // Act
      const result = await secureUpdateProject(
        projectId,
        mockTenantId,
        mockUserId,
        updateData
      );

      // Assert
      expect(result).toEqual(mockUpdated);
      expect(mockProject.findFirst).toHaveBeenCalledWith({
        where: {
          id: projectId,
          tenantId: mockTenantId,
          userId: mockUserId,
        },
        select: expect.any(Object),
      });
      expect(mockProject.update).toHaveBeenCalledWith({
        where: { id: projectId },
        data: updateData,
        select: expect.any(Object),
      });
    });

    it('should throw error if project not in user tenant', async () => {
      // Arrange
      mockProject.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        secureUpdateProject('proj-123', mockTenantId, mockUserId, {
          name: 'Test',
        })
      ).rejects.toThrow(ApplicationError);

      expect(mockProject.update).not.toHaveBeenCalled();
    });
  });
});

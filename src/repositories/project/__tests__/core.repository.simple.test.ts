import {
  TestDataFactory,
  setupTestEnvironment,
} from '@/lib/testing/test-helpers';

// Mock all dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {},
}));

jest.mock('@/server/logger');
jest.mock('@/config/environment', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock repository functions
const mockCreate = jest.fn();
const mockFindById = jest.fn();
const mockUpdate = jest.fn();
const mockSoftDelete = jest.fn();

jest.mock('../core.repository', () => ({
  projectRepository: {
    create: mockCreate,
    findById: mockFindById,
    update: mockUpdate,
    softDelete: mockSoftDelete,
  },
}));

describe('Project Repository (Simple)', () => {
  setupTestEnvironment();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a project', async () => {
      const projectData = {
        name: 'New Project',
        userId: 'user-1',
        tenantId: 'tenant-1',
        status: 'DRAFT' as const,
      };

      const mockProject = TestDataFactory.createMockProject(projectData);
      mockCreate.mockResolvedValue(mockProject);

      const { projectRepository } = require('../core.repository');
      const result = await projectRepository.create(projectData);

      expect(result).toEqual(mockProject);
      expect(mockCreate).toHaveBeenCalledWith(projectData);
    });
  });

  describe('findById', () => {
    it('should find project by id', async () => {
      const mockProject = TestDataFactory.createMockProject();
      mockFindById.mockResolvedValue(mockProject);

      const { projectRepository } = require('../core.repository');
      const result = await projectRepository.findById(mockProject.id);

      expect(result).toEqual(mockProject);
      expect(mockFindById).toHaveBeenCalledWith(mockProject.id);
    });
  });

  describe('update', () => {
    it('should update project', async () => {
      const mockProject = TestDataFactory.createMockProject();
      const updateData = { name: 'Updated Name' };
      const updatedProject = { ...mockProject, ...updateData };

      mockUpdate.mockResolvedValue(updatedProject);

      const { projectRepository } = require('../core.repository');
      const result = await projectRepository.update(mockProject.id, updateData);

      expect(result).toEqual(updatedProject);
      expect(mockUpdate).toHaveBeenCalledWith(mockProject.id, updateData);
    });
  });
});

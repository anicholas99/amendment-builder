/**
 * Unit tests for Project Core Repository
 *
 * These tests focus on the business logic and error handling of the repository functions.
 * We mock the Prisma client to isolate the repository logic from the database.
 */

import { ApplicationError, ErrorCode } from '@/lib/error';

// Mock Prisma namespace and errors
jest.mock('@prisma/client', () => {
  class PrismaClientKnownRequestError extends Error {
    code: string;
    clientVersion: string;
    meta?: any;

    constructor(message: string, { code, clientVersion, meta }: any) {
      super(message);
      this.name = 'PrismaClientKnownRequestError';
      this.code = code;
      this.clientVersion = clientVersion;
      this.meta = meta;
    }
  }

  return {
    Prisma: {
      PrismaClientKnownRequestError,
      validator: () => (obj: any) => obj,
    },
  };
});

// Mock the entire Prisma module before any imports
jest.mock('@/lib/prisma', () => {
  const mockFindFirst = jest.fn();
  const mockFindMany = jest.fn();
  const mockCreate = jest.fn();
  const mockCount = jest.fn();

  return {
    prisma: {
      project: {
        findFirst: mockFindFirst,
        findMany: mockFindMany,
        create: mockCreate,
        count: mockCount,
      },
      $transaction: jest.fn(callback =>
        callback({
          project: {
            create: jest.fn(),
            findUnique: jest.fn(),
          },
          applicationVersion: {
            create: jest.fn(),
          },
          document: {
            createMany: jest.fn(),
          },
        })
      ),
    },
    __mocks: {
      mockFindFirst,
      mockFindMany,
      mockCreate,
      mockCount,
    },
  };
});

// Mock the logger
jest.mock('@/lib/monitoring/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Import after mocking
import { Prisma } from '@prisma/client';
import {
  findProjectById,
  findProjectsByTenant,
  findProjectsByTenantPaginated,
  createProject,
  createProjectWithDocuments,
  findMostRecentProjectIdForTenantUser,
  findProjectByIdForTenantUser,
  findProjectByIdAndTenant,
} from '../core.repository';

// Get the mocks from the module
const { __mocks } = require('@/lib/prisma');
const { mockFindFirst, mockFindMany, mockCreate, mockCount } = __mocks;

describe('Project Core Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // For branch coverage edge cases
  let repo: any;
  let originalPrisma: any;
  beforeAll(() => {
    repo = require('../core.repository');
    originalPrisma = require('@/lib/prisma').prisma;
  });
  afterEach(() => {
    require('@/lib/prisma').prisma = originalPrisma;
  });

  describe('findProjectById', () => {
    const projectId = 'test-project-id';
    const tenantId = 'test-tenant-id';

    it('should find a project by id and tenant', async () => {
      const mockProject = {
        id: projectId,
        name: 'Test Project',
        tenantId,
        userId: 'user-123',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockFindFirst.mockResolvedValue(mockProject);

      const result = await findProjectById(projectId, tenantId);

      expect(mockFindFirst).toHaveBeenCalledWith({
        where: {
          id: projectId,
          tenantId: tenantId,
        },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockProject);
    });

    it('should return null when project not found', async () => {
      mockFindFirst.mockResolvedValue(null);

      const result = await findProjectById(projectId, tenantId);

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      mockFindFirst.mockRejectedValue(new Error('Database error'));

      await expect(findProjectById(projectId, tenantId)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('findProjectsByTenant', () => {
    const tenantId = 'test-tenant-id';
    const userId = 'test-user-id';

    it('should find all projects for a user in a tenant', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Project 1',
          tenantId,
          userId,
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'project-2',
          name: 'Project 2',
          tenantId,
          userId,
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockFindMany.mockResolvedValue(mockProjects);

      const result = await findProjectsByTenant(tenantId, userId);

      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          tenantId,
          userId,
          deletedAt: null,
        },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockProjects);
    });

    it('should exclude soft-deleted projects', async () => {
      mockFindMany.mockResolvedValue([]);

      await findProjectsByTenant(tenantId, userId);

      const call = mockFindMany.mock.calls[0][0];
      expect(call.where.deletedAt).toBeNull();
    });

    it('should pass through additional options', async () => {
      const options = { orderBy: { createdAt: 'desc' as const } };
      mockFindMany.mockResolvedValue([]);

      await findProjectsByTenant(tenantId, userId, options);

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });
  });

  describe('findProjectsByTenantPaginated', () => {
    const tenantId = 'test-tenant-id';
    const userId = 'test-user-id';
    const baseOptions = { skip: 0, take: 10 };

    it('should return paginated results with total count', async () => {
      const mockProjects = [
        { id: 'project-1', name: 'Project 1', tenantId, userId },
        { id: 'project-2', name: 'Project 2', tenantId, userId },
      ];
      const mockTotal = 5;

      mockFindMany.mockResolvedValue(mockProjects);
      mockCount.mockResolvedValue(mockTotal);

      const result = await findProjectsByTenantPaginated(
        tenantId,
        userId,
        baseOptions
      );

      expect(result).toEqual({
        projects: mockProjects,
        total: mockTotal,
      });
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          tenantId,
          userId,
          deletedAt: null,
        },
        select: expect.any(Object),
        skip: 0,
        take: 10,
        orderBy: { updatedAt: 'desc' },
      });
      expect(mockCount).toHaveBeenCalledWith({
        where: {
          tenantId,
          userId,
          deletedAt: null,
        },
      });
    });

    it('should apply search filter when provided', async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await findProjectsByTenantPaginated(tenantId, userId, {
        ...baseOptions,
        search: 'test search',
      });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: {
              contains: 'test search',
            },
          }),
        })
      );
    });

    it('should apply recent filter when filterBy is recent', async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      const beforeCall = new Date();
      await findProjectsByTenantPaginated(tenantId, userId, {
        ...baseOptions,
        filterBy: 'recent',
      });

      const whereClause = mockFindMany.mock.calls[0][0].where;
      expect(whereClause.updatedAt).toBeDefined();
      expect(whereClause.updatedAt.gte).toBeInstanceOf(Date);

      // Check that the date is approximately 2 days ago
      const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
      const dateDiff =
        beforeCall.getTime() - whereClause.updatedAt.gte.getTime();
      expect(dateDiff).toBeGreaterThan(twoDaysInMs - 1000);
      expect(dateDiff).toBeLessThan(twoDaysInMs + 1000);
    });

    it('should use custom orderBy when provided', async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await findProjectsByTenantPaginated(tenantId, userId, {
        ...baseOptions,
        orderBy: { name: 'asc' },
      });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: 'asc' },
        })
      );
    });

    it('should trim search input', async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await findProjectsByTenantPaginated(tenantId, userId, {
        ...baseOptions,
        search: '  test search  ',
      });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: {
              contains: 'test search', // Should be trimmed
            },
          }),
        })
      );
    });
  });

  describe('createProject', () => {
    const userId = 'test-user-id';
    const tenantId = 'test-tenant-id';
    const projectData = {
      name: 'Test Project',
      status: 'draft' as const,
      textInput: 'Test description',
    };

    it('should create a project successfully', async () => {
      const mockCreatedProject = {
        id: 'new-project-id',
        ...projectData,
        userId,
        tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreate.mockResolvedValue(mockCreatedProject);

      const result = await createProject(projectData, userId, tenantId);

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          name: projectData.name,
          userId,
          tenantId,
          status: projectData.status,
          textInput: projectData.textInput,
        },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockCreatedProject);
    });

    it('should use default status when not provided', async () => {
      const dataWithoutStatus = {
        name: 'Test Project',
        textInput: 'Test description',
      };

      mockCreate.mockResolvedValue({
        id: 'new-project-id',
        name: dataWithoutStatus.name,
        textInput: dataWithoutStatus.textInput,
        status: 'draft',
        userId,
        tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await createProject(dataWithoutStatus, userId, tenantId);

      const createCall = mockCreate.mock.calls[0][0];
      expect(createCall.data.status).toBe('draft');
    });

    it('should handle Prisma unique constraint violation', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '4.0.0',
          meta: { target: 'name' },
        }
      );

      mockCreate.mockRejectedValue(prismaError);

      await expect(
        createProject(projectData, userId, tenantId)
      ).rejects.toThrow(ApplicationError);

      await expect(
        createProject(projectData, userId, tenantId)
      ).rejects.toMatchObject({
        code: ErrorCode.DB_DUPLICATE_ENTRY,
        message: expect.stringContaining(
          'A project with this name already exists'
        ),
      });
    });

    it('should handle Prisma foreign key constraint violation', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        {
          code: 'P2003',
          clientVersion: '4.0.0',
        }
      );

      mockCreate.mockRejectedValue(prismaError);

      await expect(
        createProject(projectData, userId, tenantId)
      ).rejects.toThrow(ApplicationError);

      await expect(
        createProject(projectData, userId, tenantId)
      ).rejects.toMatchObject({
        code: ErrorCode.DB_CONSTRAINT_VIOLATION,
        message: expect.stringContaining('Invalid tenant or user reference'),
      });
    });

    it('should re-throw non-Prisma errors', async () => {
      const error = new Error('Some other error');
      mockCreate.mockRejectedValue(error);

      await expect(
        createProject(projectData, userId, tenantId)
      ).rejects.toThrow('Some other error');
    });

    it('should call logger.error in error branches', async () => {
      const { logger } = require('@/lib/monitoring/logger');
      // Clear any previous calls
      logger.error.mockClear();

      const error = new Error('fail');
      mockCreate.mockRejectedValue(error);

      // The function should throw the error
      await expect(
        repo.createProject(
          { name: 'n', status: 'draft', textInput: '' },
          'u',
          't'
        )
      ).rejects.toThrow('fail');

      // Logger.error should not be called for non-Prisma errors
      expect(logger.error).not.toHaveBeenCalled();

      // Now test with a Prisma error which should call logger.error
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Database error',
        { code: 'P2002', clientVersion: '4.0.0' }
      );
      mockCreate.mockRejectedValue(prismaError);

      await expect(
        repo.createProject(
          { name: 'n', status: 'draft', textInput: '' },
          'u',
          't'
        )
      ).rejects.toThrow(ApplicationError);

      // Now logger.error should have been called
      expect(logger.error).toHaveBeenCalledWith(
        'Database error creating project',
        expect.objectContaining({
          error: prismaError,
          code: 'P2002',
          userId: 'u',
          tenantId: 't',
        })
      );
    });
  });

  describe('createProjectWithDocuments', () => {
    const userId = 'test-user-id';
    const tenantId = 'test-tenant-id';
    const projectData = {
      name: 'Test Project',
      status: 'draft' as const,
      textInput: 'Test description',
    };

    // Mock transaction
    const mockTx = {
      project: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
      applicationVersion: {
        create: jest.fn(),
      },
      document: {
        createMany: jest.fn(),
      },
    };

    beforeEach(() => {
      // Mock $transaction to call the callback with our mock tx
      (require('@/lib/prisma').prisma as any).$transaction = jest.fn(
        async (callback: any) => callback(mockTx)
      );
    });

    it('should create project with documents in a transaction', async () => {
      const mockCreatedProject = {
        id: 'new-project-id',
        ...projectData,
        userId,
        tenantId,
      };
      const mockVersion = {
        id: 'version-id',
        projectId: 'new-project-id',
        userId,
        name: 'Initial Setup',
      };
      const mockProjectWithDetails = {
        ...mockCreatedProject,
        documents: [],
      };

      mockTx.project.create.mockResolvedValue(mockCreatedProject);
      mockTx.applicationVersion.create.mockResolvedValue(mockVersion);
      mockTx.document.createMany.mockResolvedValue({ count: 8 });
      mockTx.project.findUnique.mockResolvedValue(mockProjectWithDetails);

      const result = await createProjectWithDocuments(
        projectData,
        userId,
        tenantId
      );

      expect(mockTx.project.create).toHaveBeenCalledWith({
        data: {
          name: projectData.name,
          userId,
          tenantId,
          status: projectData.status,
          textInput: projectData.textInput,
        },
      });
      expect(mockTx.applicationVersion.create).toHaveBeenCalledWith({
        data: {
          projectId: 'new-project-id',
          userId,
          name: 'Initial Setup',
        },
      });
      expect(mockTx.document.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ type: 'TITLE', content: '' }),
          expect.objectContaining({ type: 'FIELD', content: '' }),
          expect.objectContaining({ type: 'BACKGROUND', content: '' }),
          expect.objectContaining({ type: 'SUMMARY', content: '' }),
          expect.objectContaining({
            type: 'BRIEF_DESCRIPTION_OF_THE_DRAWINGS',
            content: '',
          }),
          expect.objectContaining({
            type: 'DETAILED_DESCRIPTION',
            content: '',
          }),
          expect.objectContaining({ type: 'CLAIM_SET', content: '' }),
          expect.objectContaining({ type: 'ABSTRACT', content: '' }),
        ]),
      });
      expect(result).toEqual(mockProjectWithDetails);
    });

    it('should handle transaction failures', async () => {
      const error = new Error('Transaction failed');
      mockTx.project.create.mockRejectedValue(error);

      await expect(
        createProjectWithDocuments(projectData, userId, tenantId)
      ).rejects.toThrow('Transaction failed');
    });

    it('should throw if project not found after creation in createProjectWithDocuments', async () => {
      // Mock $transaction to return result with findUnique returning null
      const mockTx = {
        project: {
          create: jest.fn().mockResolvedValue({ id: 'id' }),
          findUnique: jest.fn().mockResolvedValue(null),
        },
        applicationVersion: {
          create: jest.fn().mockResolvedValue({
            id: 'ver',
            projectId: 'id',
            userId: 'u',
            name: 'Initial Setup',
          }),
        },
        document: { createMany: jest.fn().mockResolvedValue({ count: 8 }) },
      };
      require('@/lib/prisma').prisma.$transaction = jest.fn(async (cb: any) =>
        cb(mockTx)
      );
      await expect(
        repo.createProjectWithDocuments(
          { name: 'n', status: 'draft', textInput: '' },
          'u',
          't'
        )
      ).rejects.toThrow(
        'Failed to fetch newly created project within transaction.'
      );
    });

    it('should handle generic Prisma error code in createProjectWithDocuments', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Some Prisma error',
        { code: 'P9999', clientVersion: '4.0.0' }
      );
      require('@/lib/prisma').prisma.$transaction = jest.fn(() => {
        throw prismaError;
      });
      await expect(
        repo.createProjectWithDocuments(
          { name: 'n', status: 'draft', textInput: '' },
          'u',
          't'
        )
      ).rejects.toThrow(ApplicationError);
      await expect(
        repo.createProjectWithDocuments(
          { name: 'n', status: 'draft', textInput: '' },
          'u',
          't'
        )
      ).rejects.toMatchObject({ code: ErrorCode.DB_QUERY_ERROR });
    });
  });

  describe('findMostRecentProjectIdForTenantUser', () => {
    const userId = 'test-user-id';
    const tenantId = 'test-tenant-id';

    it('should find the most recent project id', async () => {
      const projectId = 'recent-project-id';
      mockFindFirst.mockResolvedValue({ id: projectId });

      const result = await findMostRecentProjectIdForTenantUser(
        userId,
        tenantId
      );

      expect(mockFindFirst).toHaveBeenCalledWith({
        where: {
          userId,
          tenantId,
          deletedAt: null,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        select: {
          id: true,
        },
      });
      expect(result).toBe(projectId);
    });

    it('should return null when no projects found', async () => {
      mockFindFirst.mockResolvedValue(null);

      const result = await findMostRecentProjectIdForTenantUser(
        userId,
        tenantId
      );

      expect(result).toBeNull();
    });

    it('should throw ApplicationError on database error', async () => {
      const dbError = new Error('Database connection failed');
      mockFindFirst.mockRejectedValue(dbError);

      await expect(
        findMostRecentProjectIdForTenantUser(userId, tenantId)
      ).rejects.toThrow(ApplicationError);

      await expect(
        findMostRecentProjectIdForTenantUser(userId, tenantId)
      ).rejects.toMatchObject({
        code: ErrorCode.DB_QUERY_ERROR,
        message: expect.stringContaining('Failed to get most recent project'),
      });
    });
  });

  describe('findProjectByIdForTenantUser', () => {
    const projectId = 'test-project-id';
    const userId = 'test-user-id';
    const tenantId = 'test-tenant-id';

    it('should find a project for specific user and tenant', async () => {
      const mockProject = {
        id: projectId,
        name: 'Test Project',
        userId,
        tenantId,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockFindFirst.mockResolvedValue(mockProject);

      const result = await findProjectByIdForTenantUser(
        projectId,
        userId,
        tenantId
      );

      expect(mockFindFirst).toHaveBeenCalledWith({
        where: {
          id: projectId,
          userId,
          tenantId,
          deletedAt: null,
        },
      });
      expect(result).toEqual(mockProject);
    });

    it('should return null when project not found', async () => {
      mockFindFirst.mockResolvedValue(null);

      const result = await findProjectByIdForTenantUser(
        projectId,
        userId,
        tenantId
      );

      expect(result).toBeNull();
    });

    it('should throw ApplicationError on database error', async () => {
      const dbError = new Error('Query timeout');
      mockFindFirst.mockRejectedValue(dbError);

      await expect(
        findProjectByIdForTenantUser(projectId, userId, tenantId)
      ).rejects.toThrow(ApplicationError);

      await expect(
        findProjectByIdForTenantUser(projectId, userId, tenantId)
      ).rejects.toMatchObject({
        code: ErrorCode.DB_QUERY_ERROR,
        message: expect.stringContaining('Failed to find project'),
      });
    });
  });

  describe('findProjectByIdAndTenant', () => {
    const projectId = 'test-project-id';
    const tenantId = 'test-tenant-id';

    it('should find a project by id and tenant', async () => {
      const mockProject = {
        id: projectId,
        name: 'Test Project',
        tenantId,
        userId: 'user-123',
        status: 'draft',
        invention: null,
        savedPriorArtItems: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockFindFirst.mockResolvedValue(mockProject);

      const result = await findProjectByIdAndTenant(projectId, tenantId);

      expect(mockFindFirst).toHaveBeenCalledWith({
        where: {
          id: projectId,
          tenantId,
        },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockProject);
    });

    it('should return null when project not found', async () => {
      mockFindFirst.mockResolvedValue(null);

      const result = await findProjectByIdAndTenant(projectId, tenantId);

      expect(result).toBeNull();
    });
  });

  // --- BEGIN: Additional branch coverage tests ---
  describe('Branch coverage edge cases', () => {
    const allRepoFns = [
      'findProjectById',
      'findProjectsByTenant',
      'findProjectsByTenantPaginated',
      'createProject',
      'createProjectWithDocuments',
      'findMostRecentProjectIdForTenantUser',
      'findProjectByIdForTenantUser',
      'findProjectByIdAndTenant',
    ];

    it('should throw ApplicationError if prisma is not initialized (all repo fns)', async () => {
      for (const fn of allRepoFns) {
        require('@/lib/prisma').prisma = undefined;
        await expect(
          repo[fn](
            ...Array(fn === 'findProjectsByTenantPaginated' ? 3 : 2).fill('a')
          )
        ).rejects.toThrow('Database client is not initialized.');
      }
    });

    it('should throw if transaction returns falsy in createProjectWithDocuments', async () => {
      require('@/lib/prisma').prisma.$transaction = jest.fn(
        async () => undefined
      );
      await expect(
        repo.createProjectWithDocuments(
          { name: 'n', status: 'draft', textInput: '' },
          'u',
          't'
        )
      ).rejects.toThrow('Project creation transaction failed unexpectedly.');
    });

    it('should throw if findMany or count throws in findProjectsByTenantPaginated', async () => {
      require('@/lib/prisma').prisma.project.findMany.mockRejectedValueOnce(
        new Error('findMany failed')
      );
      await expect(
        repo.findProjectsByTenantPaginated('t', 'u', { skip: 0, take: 1 })
      ).rejects.toThrow('findMany failed');
      require('@/lib/prisma').prisma.project.findMany.mockResolvedValueOnce([]);
      require('@/lib/prisma').prisma.project.count.mockRejectedValueOnce(
        new Error('count failed')
      );
      await expect(
        repo.findProjectsByTenantPaginated('t', 'u', { skip: 0, take: 1 })
      ).rejects.toThrow('count failed');
    });

    it('should handle generic Prisma error code in createProject', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Some Prisma error',
        { code: 'P9999', clientVersion: '4.0.0' }
      );
      mockCreate.mockRejectedValue(prismaError);
      await expect(
        repo.createProject(
          { name: 'n', status: 'draft', textInput: '' },
          'u',
          't'
        )
      ).rejects.toThrow(ApplicationError);
      await expect(
        repo.createProject(
          { name: 'n', status: 'draft', textInput: '' },
          'u',
          't'
        )
      ).rejects.toMatchObject({ code: ErrorCode.DB_QUERY_ERROR });
    });

    it('should handle generic Prisma error code in createProjectWithDocuments', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Some Prisma error',
        { code: 'P9999', clientVersion: '4.0.0' }
      );
      require('@/lib/prisma').prisma.$transaction = jest.fn(() => {
        throw prismaError;
      });
      await expect(
        repo.createProjectWithDocuments(
          { name: 'n', status: 'draft', textInput: '' },
          'u',
          't'
        )
      ).rejects.toThrow(ApplicationError);
      await expect(
        repo.createProjectWithDocuments(
          { name: 'n', status: 'draft', textInput: '' },
          'u',
          't'
        )
      ).rejects.toMatchObject({ code: ErrorCode.DB_QUERY_ERROR });
    });
  });
  // --- END: Additional branch coverage tests ---
});

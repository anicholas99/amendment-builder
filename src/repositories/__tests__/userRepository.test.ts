/**
 * @jest-environment node
 *
 * User Repository Tests
 *
 * Gold standard test coverage for user data access layer including:
 * - User CRUD operations
 * - GDPR compliance functions
 * - Tenant associations
 * - Error handling
 */

import { ApplicationError, ErrorCode } from '@/lib/error';

// Mock the entire Prisma module before any imports
jest.mock('@/lib/prisma', () => {
  const mockUser = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserTenant = {
    findMany: jest.fn(),
    findFirst: jest.fn(),
  };

  const mockProject = {
    findMany: jest.fn(),
  };

  const mockChatMessage = {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  };

  const mockSearchHistory = {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  };

  const mockUserPrivacy = {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    deleteMany: jest.fn(),
  };

  const mockTenant = {
    findUnique: jest.fn(),
  };

  return {
    prisma: {
      user: mockUser,
      userTenant: mockUserTenant,
      project: mockProject,
      chatMessage: mockChatMessage,
      searchHistory: mockSearchHistory,
      userPrivacy: mockUserPrivacy,
      tenant: mockTenant,
      $transaction: jest.fn(),
    },
    __mocks: {
      mockUser,
      mockUserTenant,
      mockProject,
      mockChatMessage,
      mockSearchHistory,
      mockUserPrivacy,
      mockTenant,
    },
  };
});

// Mock the logger
jest.mock('@/config/environment', () => ({
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
  findUsers,
  findUserByEmail,
  createUser,
  findUserById,
  updateUser,
  upsertUser,
  exportUserData,
  deleteUserData,
  getUsersInTenant,
  isUserInTenant,
  updateUserConsent,
  getUserPrivacySettings,
} from '../userRepository';

// Get the mocks from the module
const { __mocks } = require('@/lib/prisma');
const {
  mockUser,
  mockUserTenant,
  mockProject,
  mockChatMessage,
  mockSearchHistory,
  mockUserPrivacy,
  mockTenant,
} = __mocks;
const prismaMock = require('@/lib/prisma').prisma;

describe('UserRepository', () => {
  // Test data
  const mockUserData = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
    isVerified: true,
    createdAt: new Date(),
    lastLogin: new Date(),
    passwordHash: 'hashed',
    tenantId: 'tenant-123',
    deletedAt: null,
    updatedAt: new Date(),
  };

  const safeUser = {
    id: mockUserData.id,
    email: mockUserData.email,
    name: mockUserData.name,
    role: mockUserData.role,
    isVerified: mockUserData.isVerified,
    createdAt: mockUserData.createdAt,
    lastLogin: mockUserData.lastLogin,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findUsers', () => {
    it('should find users with safe fields only', async () => {
      const users = [safeUser];
      mockUser.findMany.mockResolvedValue(users);

      const result = await findUsers();

      expect(result).toEqual(users);
      expect(mockUser.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isVerified: true,
          createdAt: true,
          lastLogin: true,
        },
      });
    });

    it('should pass through query options', async () => {
      mockUser.findMany.mockResolvedValue([]);

      await findUsers({
        where: { role: 'ADMIN' },
        orderBy: { createdAt: 'desc' },
      });

      expect(mockUser.findMany).toHaveBeenCalledWith({
        where: { role: 'ADMIN' },
        orderBy: { createdAt: 'desc' },
        select: expect.any(Object),
      });
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockUser.findMany.mockRejectedValue(error);

      await expect(findUsers()).rejects.toThrow(error);
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email (case-insensitive)', async () => {
      mockUser.findUnique.mockResolvedValue(mockUserData);

      const result = await findUserByEmail('TEST@EXAMPLE.COM');

      expect(result).toEqual(mockUserData);
      expect(mockUser.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should trim whitespace from email', async () => {
      mockUser.findUnique.mockResolvedValue(mockUserData);

      await findUserByEmail('  test@example.com  ');

      expect(mockUser.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null for empty email', async () => {
      const result = await findUserByEmail('');

      expect(result).toBeNull();
      expect(mockUser.findUnique).not.toHaveBeenCalled();
    });

    it('should return null when user not found', async () => {
      mockUser.findUnique.mockResolvedValue(null);

      const result = await findUserByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create user with normalized email', async () => {
      mockUser.create.mockResolvedValue(safeUser);

      const userData: Prisma.UserCreateInput = {
        email: 'NEW@EXAMPLE.COM',
        name: 'New User',
      };

      const result = await createUser(userData);

      expect(result).toEqual(safeUser);
      expect(mockUser.create).toHaveBeenCalledWith({
        data: {
          email: 'new@example.com',
          name: 'New User',
        },
        select: expect.any(Object),
      });
    });

    it('should use email prefix as default name', async () => {
      mockUser.create.mockResolvedValue(safeUser);

      const userData: Prisma.UserCreateInput = {
        email: 'john.doe@example.com',
      };

      await createUser(userData);

      expect(mockUser.create).toHaveBeenCalledWith({
        data: {
          email: 'john.doe@example.com',
          name: 'john.doe',
        },
        select: expect.any(Object),
      });
    });

    it('should throw error for missing email', async () => {
      const userData: any = { name: 'No Email' };

      await expect(createUser(userData)).rejects.toThrow(ApplicationError);
      await expect(createUser(userData)).rejects.toMatchObject({
        code: ErrorCode.VALIDATION_REQUIRED_FIELD,
        message: expect.stringContaining('Email is required'),
      });
    });
  });

  describe('findUserById', () => {
    it('should find user by id with safe fields', async () => {
      mockUser.findUnique.mockResolvedValue(safeUser);

      const result = await findUserById('user-123');

      expect(result).toEqual(safeUser);
      expect(mockUser.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: expect.any(Object),
      });
    });

    it('should support custom select', async () => {
      const customSelect = { id: true, email: true };
      mockUser.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
      });

      await findUserById('user-123', customSelect);

      expect(mockUser.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: customSelect,
      });
    });

    it('should return null for empty id', async () => {
      const result = await findUserById('');

      expect(result).toBeNull();
      expect(mockUser.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('should update user and normalize email', async () => {
      mockUser.update.mockResolvedValue(safeUser);

      const updateData: Prisma.UserUpdateInput = {
        email: 'UPDATED@EXAMPLE.COM',
        name: 'Updated Name',
      };

      const result = await updateUser('user-123', updateData);

      expect(result).toEqual(safeUser);
      expect(mockUser.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          email: 'updated@example.com',
          name: 'Updated Name',
        },
        select: expect.any(Object),
      });
    });

    it('should throw error for missing id', async () => {
      await expect(updateUser('', { name: 'Test' })).rejects.toThrow(
        ApplicationError
      );
      await expect(updateUser('', { name: 'Test' })).rejects.toMatchObject({
        code: ErrorCode.VALIDATION_REQUIRED_FIELD,
        message: expect.stringContaining('User ID is required'),
      });
    });
  });

  describe('getUsersInTenant', () => {
    it('should get all users in a tenant', async () => {
      const mockUserTenants = [
        { userId: 'user-1', tenantId: 'tenant-123', user: safeUser },
        {
          userId: 'user-2',
          tenantId: 'tenant-123',
          user: { ...safeUser, id: 'user-2' },
        },
      ];

      mockUserTenant.findMany.mockResolvedValue(mockUserTenants);

      const result = await getUsersInTenant('tenant-123');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(safeUser);
      expect(mockUserTenant.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-123' },
        include: {
          user: {
            select: expect.any(Object),
          },
        },
      });
    });

    it('should return empty array for tenant with no users', async () => {
      mockUserTenant.findMany.mockResolvedValue([]);

      const result = await getUsersInTenant('empty-tenant');

      expect(result).toEqual([]);
    });
  });

  describe('isUserInTenant', () => {
    it('should return true if user is in tenant', async () => {
      mockUserTenant.findFirst.mockResolvedValue({
        userId: 'user-123',
        tenantId: 'tenant-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await isUserInTenant('user-123', 'tenant-123');

      expect(result).toBe(true);
      expect(mockUserTenant.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          tenantId: 'tenant-123',
        },
      });
    });

    it('should return false if user not in tenant', async () => {
      mockUserTenant.findFirst.mockResolvedValue(null);

      const result = await isUserInTenant('user-123', 'wrong-tenant');

      expect(result).toBe(false);
    });
  });

  describe('exportUserData', () => {
    it('should export all user data for GDPR', async () => {
      const mockProjects = [{ id: 'proj-1' }, { id: 'proj-2' }];
      const mockChatMessages = [{ id: 'msg-1', projectId: 'proj-1' }];
      const mockSearchHistoryData = [{ id: 'search-1', projectId: 'proj-1' }];
      const mockPrivacySettings = {
        userId: 'user-123',
        dataProcessingConsent: true,
      };

      mockProject.findMany.mockResolvedValueOnce(mockProjects);
      mockUser.findUnique.mockResolvedValue(mockUserData);
      mockProject.findMany.mockResolvedValueOnce(mockProjects);
      mockChatMessage.findMany.mockResolvedValue(mockChatMessages);
      mockSearchHistory.findMany.mockResolvedValue(mockSearchHistoryData);
      mockUserPrivacy.findUnique.mockResolvedValue(mockPrivacySettings);

      const result = await exportUserData('user-123');

      expect(result).toEqual({
        user: mockUserData,
        projects: mockProjects,
        chatMessages: mockChatMessages,
        searchHistory: mockSearchHistoryData,
        privacySettings: mockPrivacySettings,
      });

      // Verify all queries were made
      expect(mockProject.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        select: { id: true },
      });
      expect(mockChatMessage.findMany).toHaveBeenCalledWith({
        where: { projectId: { in: ['proj-1', 'proj-2'] } },
        orderBy: { timestamp: 'asc' },
      });
    });
  });

  describe('deleteUserData', () => {
    it('should soft delete user data by default', async () => {
      const mockTenantData = { id: 'tenant-123', settings: '{}' };
      mockTenant.findUnique.mockResolvedValue(mockTenantData);
      mockProject.findMany.mockResolvedValue([{ id: 'proj-1' }]);
      mockChatMessage.deleteMany.mockResolvedValue({ count: 5 });
      mockSearchHistory.deleteMany.mockResolvedValue({ count: 10 });
      mockUserPrivacy.deleteMany.mockResolvedValue({ count: 1 });
      mockUser.update.mockResolvedValue(mockUserData);

      // Mock transaction
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return callback(prismaMock);
      });

      await deleteUserData('user-123', 'tenant-123');

      expect(mockUser.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          email: 'anonymized-user-123@example.com',
          name: 'Anonymized User',
          passwordHash: null,
          isVerified: false,
          role: 'USER',
          deletedAt: expect.any(Date),
        },
      });
    });

    it('should hard delete if tenant policy requires', async () => {
      const mockTenantData = {
        id: 'tenant-123',
        settings: JSON.stringify({ dataRetentionPolicy: 'DELETE_IMMEDIATELY' }),
      };
      mockTenant.findUnique.mockResolvedValue(mockTenantData);
      mockProject.findMany.mockResolvedValue([]);
      mockChatMessage.deleteMany.mockResolvedValue({ count: 0 });
      mockSearchHistory.deleteMany.mockResolvedValue({ count: 0 });
      mockUserPrivacy.deleteMany.mockResolvedValue({ count: 0 });
      mockUser.delete.mockResolvedValue(mockUserData);

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return callback(prismaMock);
      });

      await deleteUserData('user-123', 'tenant-123');

      expect(mockUser.delete).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(mockUser.update).not.toHaveBeenCalled();
    });

    it('should throw error if tenant not found', async () => {
      mockTenant.findUnique.mockResolvedValue(null);

      await expect(
        deleteUserData('user-123', 'invalid-tenant')
      ).rejects.toThrow(ApplicationError);
      await expect(
        deleteUserData('user-123', 'invalid-tenant')
      ).rejects.toMatchObject({
        code: ErrorCode.DB_RECORD_NOT_FOUND,
        message: expect.stringContaining('Tenant not found'),
      });
    });
  });

  describe('updateUserConsent', () => {
    it('should create new privacy settings', async () => {
      const consent = {
        dataProcessingConsent: true,
        marketingConsent: false,
        dataRetentionDays: 730,
      };

      const mockPrivacy = {
        userId: 'user-123',
        ...consent,
        consentedAt: new Date(),
      };

      mockUserPrivacy.upsert.mockResolvedValue(mockPrivacy);

      const result = await updateUserConsent('user-123', consent);

      expect(result).toEqual(mockPrivacy);
      expect(mockUserPrivacy.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        create: expect.objectContaining({
          userId: 'user-123',
          dataProcessingConsent: true,
          marketingConsent: false,
          dataRetentionDays: 730,
        }),
        update: expect.objectContaining({
          dataProcessingConsent: true,
          marketingConsent: false,
          dataRetentionDays: 730,
        }),
      });
    });
  });

  describe('getUserPrivacySettings', () => {
    it('should return privacy settings', async () => {
      const mockSettings = {
        userId: 'user-123',
        dataProcessingConsent: true,
        marketingConsent: false,
      };

      mockUserPrivacy.findUnique.mockResolvedValue(mockSettings);

      const result = await getUserPrivacySettings('user-123');

      expect(result).toEqual(mockSettings);
      expect(mockUserPrivacy.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
    });

    it('should return null if no settings exist', async () => {
      mockUserPrivacy.findUnique.mockResolvedValue(null);

      const result = await getUserPrivacySettings('user-123');

      expect(result).toBeNull();
    });
  });
});

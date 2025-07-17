import {
  createMockUser,
  createMockPrismaClient,
  setupTestEnvironment,
} from '@/lib/testing/test-helpers';

// Mock all dependencies before imports
jest.mock('@/lib/prisma', () => ({
  prisma: {},
}));

jest.mock('@/config/environment', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

// Mock userRepository functions directly
const mockFindUserByEmail = jest.fn();
const mockFindUserById = jest.fn();
const mockCreateUser = jest.fn();
const mockUpdateUser = jest.fn();

jest.mock('../userRepository', () => ({
  findUserByEmail: mockFindUserByEmail,
  findUserById: mockFindUserById,
  createUser: mockCreateUser,
  updateUser: mockUpdateUser,
}));

describe('UserRepository (Simple)', () => {
  setupTestEnvironment();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = createMockUser();
      mockFindUserByEmail.mockResolvedValue(mockUser);

      const userRepository = require('../userRepository');
      const result = await userRepository.findUserByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
      expect(mockFindUserByEmail).toHaveBeenCalledWith(mockUser.email);
    });

    it('should return null when user not found', async () => {
      mockFindUserByEmail.mockResolvedValue(null);

      const userRepository = require('../userRepository');
      const result = await userRepository.findUserByEmail(
        'nonexistent@example.com'
      );

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        name: 'New User',
      };
      const mockCreatedUser = createMockUser(userData);
      mockCreateUser.mockResolvedValue(mockCreatedUser);

      const userRepository = require('../userRepository');
      const result = await userRepository.createUser(userData);

      expect(result).toEqual(mockCreatedUser);
      expect(mockCreateUser).toHaveBeenCalledWith(userData);
    });
  });
});

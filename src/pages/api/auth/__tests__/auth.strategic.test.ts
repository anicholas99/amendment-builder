/**
 * @jest-environment node
 *
 * Auth API Strategic Tests
 *
 * Testing only the most critical auth operations:
 * - Login flow initiation
 * - Session validation
 * - Tenant switching
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';

// Mock Auth0
jest.mock('@auth0/nextjs-auth0', () => ({
  handleLogin: jest.fn(),
  getSession: jest.fn(),
}));

// Mock our auth utilities
jest.mock('@/lib/auth/getSession', () => ({
  getSession: jest.fn(),
}));

// Mock repositories
jest.mock('@/repositories/tenantRepository', () => ({
  findTenantById: jest.fn(),
  setUserActiveTenant: jest.fn(),
}));

// Mock logger
jest.mock('@/lib/monitoring/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock('@/lib/monitoring/apiLogger', () => ({
  createApiLogger: jest.fn(() => ({
    logRequest: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    errorSafe: jest.fn(),
  })),
}));

// Mock middleware
jest.mock('@/middleware/compose', () => ({
  withAuth: jest.fn((handler: any) => handler),
  withCsrf: jest.fn((handler: any) => handler),
  withRateLimit: jest.fn((handler: any) => handler),
  withValidation: jest.fn((schema: any) => (handler: any) => handler),
}));

jest.mock('@/middleware/authorization', () => ({
  withTenantGuard: jest.fn((resolver: any) => (handler: any) => handler),
}));

jest.mock('@/middleware/errorHandling', () => ({
  withErrorHandling: jest.fn((handler: any) => handler),
}));

// Import handlers after mocking
import loginHandler from '../login';
import sessionHandler from '../session';
import switchTenantHandler from '../switch-tenant';

// Import mocked modules
import { handleLogin } from '@auth0/nextjs-auth0';
import { getSession } from '@/lib/auth/getSession';
import {
  findTenantById,
  setUserActiveTenant,
} from '@/repositories/tenantRepository';

describe('Auth API - Strategic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/auth/login - Can user authenticate?', () => {
    it('should initiate Auth0 login flow with valid returnTo', async () => {
      // Arrange
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: {
          returnTo: 'http://localhost:3000/projects',
        },
      });

      // Act
      await loginHandler(req, res);

      // Assert
      expect(handleLogin).toHaveBeenCalledWith(req, res, {
        returnTo: 'http://localhost:3000/projects',
        authorizationParams: expect.objectContaining({
          prompt: 'login',
          response_type: 'code',
          scope: 'openid profile email',
        }),
      });
    });

    it('should reject invalid returnTo URL', async () => {
      // Arrange
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: {
          returnTo: 'not-a-valid-url',
        },
      });

      // Act
      await loginHandler(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual(
        expect.objectContaining({
          error: 'Invalid query parameters',
        })
      );
      expect(handleLogin).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/auth/session - Is session valid?', () => {
    it('should return session data for authenticated user', async () => {
      // Arrange
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
        },
        currentTenant: {
          id: 'tenant-123',
          name: 'Test Company',
          slug: 'test-company',
        },
        tenants: [
          { id: 'tenant-123', name: 'Test Company', slug: 'test-company' },
        ],
      };
      (getSession as jest.Mock).mockResolvedValue(mockSession);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });

      // Act
      await sessionHandler(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual(mockSession);
    });

    it('should return 401 when no session exists', async () => {
      // Arrange
      (getSession as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });

      // Act
      await sessionHandler(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(401);
      expect(res._getJSONData()).toEqual({
        error: 'Unauthenticated',
      });
    });
  });

  describe('POST /api/auth/switch-tenant - Tenant switching works?', () => {
    it('should successfully switch to valid tenant user has access to', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        tenantId: 'tenant-123',
      };
      const mockSession = {
        user: mockUser,
        currentTenant: { id: 'tenant-123' },
        tenants: [
          { id: 'tenant-123', name: 'Company A' },
          { id: 'tenant-456', name: 'Company B' },
        ],
      };
      const mockTenant = {
        id: 'tenant-456',
        name: 'Company B',
        slug: 'company-b',
      };

      (getSession as jest.Mock).mockResolvedValue(mockSession);
      (findTenantById as jest.Mock).mockResolvedValue(mockTenant);
      (setUserActiveTenant as jest.Mock).mockResolvedValue(true);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          tenantId: 'tenant-456',
        },
      });

      // Add user to request as middleware would
      (req as any).user = mockUser;

      // Act
      await switchTenantHandler(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({
        success: true,
        tenant: {
          id: 'tenant-456',
          name: 'Company B',
          slug: 'company-b',
        },
      });
      expect(setUserActiveTenant).toHaveBeenCalledWith(
        'user-123',
        'tenant-456'
      );
    });

    it('should return 404 when tenant not found', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        tenantId: 'tenant-123',
      };
      const mockSession = { user: mockUser };

      (getSession as jest.Mock).mockResolvedValue(mockSession);
      (findTenantById as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          tenantId: 'tenant-456',
        },
      });

      (req as any).user = mockUser;

      // Act
      await switchTenantHandler(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({
        error: 'Tenant not found',
      });
    });
  });
});

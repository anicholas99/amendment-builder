// Mock auth0 modules that have ESM issues
jest.mock('@auth0/nextjs-auth0', () => ({
  getSession: jest.fn(),
}));

// Mock env.ts to prevent environment loading issues
jest.mock('@/config/env', () => ({
  env: {
    NODE_ENV: 'test',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    NEXT_PUBLIC_API_BASE_URL: 'http://localhost:3000/api',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
    RATE_LIMIT_WINDOW: 60,
    RATE_LIMIT_MAX_REQUESTS: 100,
    LOG_LEVEL: 'error',

    CSRF_SECRET: 'mock_csrf_secret',
    CSRF_COOKIE_NAME: 'csrf-token',
    CSRF_HEADER_NAME: 'x-csrf-token',
    INTERNAL_API_KEY: 'mock_internal_api_key',
    SERVICE_ACCOUNT_CLIENT_ID: 'mock_service_client_id',
    SERVICE_ACCOUNT_CLIENT_SECRET: 'mock_service_client_secret',
    AUTH0_SECRET: 'mock_auth0_secret',
    AUTH0_ISSUER_BASE_URL: 'https://mock.auth0.com',
    AUTH0_CLIENT_ID: 'mock_client_id',
    AUTH0_CLIENT_SECRET: 'mock_client_secret',
    DATABASE_URL: 'postgresql://test',
    DB_HOST: 'localhost',
    DB_NAME: 'testdb',
    DB_USER: 'testuser',
    DB_PASSWORD: 'testpass',
    ENABLE_DRAFTING: true,
    ENABLE_COST_TRACKING: false,
    ENABLE_PRIOR_ART_SEARCH: true,
    LOG_ENDPOINT: '',
    LOG_TO_FILE: false,
    ENABLE_LOGGING: false,
  },
}));

// Mock environment config to prevent initialization errors
jest.mock('@/config/environment', () => {
  const mockEnv = {
    api: {
      baseUrl: 'http://localhost:3000/api',
      internalApiKey: 'test-internal-api-key',
    },
    auth: {
      sessionSecret: 'test-secret',
      domain: 'test.auth0.com',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
    },
    database: {
      url: 'postgresql://test',
      host: 'localhost',
      name: 'testdb',
      user: 'testuser',
      password: 'testpass',
    },
    features: {
      enableDrafting: true,
      enableCostTracking: false,
      enablePriorArtSearch: true,
    },
    logging: {
      level: 'error',
      remoteEndpoint: '',
      enableConsole: false,
    },
    isProduction: false,
  };

  return {
    environment: mockEnv,
    default: mockEnv,
  };
});

// Mock security config to prevent environment loading
jest.mock('@/config/security', () => ({
  CSRF_CONFIG: {
    COOKIE_NAME: 'csrf-token',
    HEADER_NAME: 'x-csrf-token',
    COOKIE_OPTIONS: {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/',
      maxAge: 3600,
    },
  },
}));

// Mock logger to prevent environment dependency
jest.mock('@/lib/monitoring/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock prisma to prevent environment loading
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    tenant: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    userTenant: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import { withAuth } from '../auth';
import { getSession } from '@/lib/auth/getSession';
import { authenticateInternalService } from '@/lib/auth/internalServiceAuth';
import * as userRepository from '@/repositories/userRepository';
import * as tenantRepository from '@/repositories/tenantRepository';
import { logger } from '@/lib/monitoring/logger';
import { CSRF_CONFIG } from '@/config/security';
import { AuthenticatedRequest, ApiHandler } from '@/types/middleware';

// Mock dependencies
jest.mock('@/lib/auth/getSession');
jest.mock('@/lib/auth/internalServiceAuth');
jest.mock('@/repositories/userRepository');
jest.mock('@/repositories/tenantRepository');

describe('withAuth middleware', () => {
  const mockHandler: ApiHandler = jest.fn(
    (req: NextApiRequest, res: NextApiResponse) => {
      res.status(200).json({ success: true });
    }
  );

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
  };

  const mockTenant = {
    id: 'tenant-123',
    slug: 'test-tenant',
    name: 'Test Tenant',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementations
    (authenticateInternalService as jest.Mock).mockResolvedValue({
      isAuthenticated: false,
    });
    (getSession as jest.Mock).mockResolvedValue({
      user: mockUser,
    });
    (userRepository.findUserById as jest.Mock).mockResolvedValue(mockUser);
    (userRepository.updateUser as jest.Mock).mockResolvedValue(mockUser);
    (tenantRepository.findTenantsByUserId as jest.Mock).mockResolvedValue([
      mockTenant,
    ]);
    (tenantRepository.getUserTenantRelationship as jest.Mock).mockResolvedValue(
      {
        tenantId: mockTenant.id,
        role: 'USER',
      }
    );
  });

  describe('Authentication', () => {
    it('should allow authenticated requests with valid session', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });
      const wrappedHandler = withAuth(mockHandler);

      await wrappedHandler(req, res);

      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            id: mockUser.id,
            email: mockUser.email,
            role: 'USER',
            tenantId: mockTenant.id,
          }),
          userId: mockUser.id,
        }),
        res
      );
      expect(res._getStatusCode()).toBe(200);
    });

    it('should reject unauthenticated requests', async () => {
      (getSession as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });
      const wrappedHandler = withAuth(mockHandler);

      await wrappedHandler(req, res);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Authentication required',
      });
      expect(logger.warn).toHaveBeenCalledWith(
        'Unauthorized access attempt',
        expect.any(Object)
      );
    });

    it('should skip auth check when requireAuth is false', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });
      const wrappedHandler = withAuth(mockHandler, { requireAuth: false });

      await wrappedHandler(req, res);

      expect(getSession).not.toHaveBeenCalled();
      expect(mockHandler).toHaveBeenCalledWith(req, res);
    });

    it('should handle session errors gracefully', async () => {
      (getSession as jest.Mock).mockRejectedValue(new Error('Session error'));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });
      const wrappedHandler = withAuth(mockHandler);

      await wrappedHandler(req, res);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Internal server error',
      });
      expect(logger.error).toHaveBeenCalledWith(
        'Auth middleware error:',
        expect.any(Error)
      );
    });
  });

  describe('Internal Service Authentication', () => {
    it('should authenticate OAuth service accounts', async () => {
      const serviceAccount = {
        clientId: 'service-client-123',
        tenantId: 'service-tenant-123',
      };
      (authenticateInternalService as jest.Mock).mockResolvedValue({
        isAuthenticated: true,
        isLegacy: false,
        serviceAccount,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });
      const wrappedHandler = withAuth(mockHandler);

      await wrappedHandler(req, res);

      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          user: {
            id: `service:${serviceAccount.clientId}`,
            email: `${serviceAccount.clientId}@service.internal`,
            role: 'INTERNAL_SERVICE',
            tenantId: serviceAccount.tenantId,
          },
          serviceAccount,
        }),
        res
      );
    });

    it('should authenticate legacy API key services', async () => {
      (authenticateInternalService as jest.Mock).mockResolvedValue({
        isAuthenticated: true,
        isLegacy: true,
        tenantId: 'legacy-tenant-123',
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });
      const wrappedHandler = withAuth(mockHandler);

      await wrappedHandler(req, res);

      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          user: {
            id: 'internal-service',
            email: 'internal@service',
            role: 'INTERNAL_SERVICE',
            tenantId: 'legacy-tenant-123',
          },
        }),
        res
      );
    });

    it('should require tenant context for internal service mutations', async () => {
      (authenticateInternalService as jest.Mock).mockResolvedValue({
        isAuthenticated: true,
        isLegacy: false,
        serviceAccount: {
          clientId: 'service-client-123',
          // Missing tenantId
        },
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
      });
      const wrappedHandler = withAuth(mockHandler);

      await wrappedHandler(req, res);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Tenant context required for internal service operations',
      });
    });
  });

  describe('User Management', () => {
    it('should update existing user on login', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });
      const wrappedHandler = withAuth(mockHandler);

      await wrappedHandler(req, res);

      expect(userRepository.findUserById).toHaveBeenCalledWith(mockUser.id);
      expect(userRepository.updateUser).toHaveBeenCalledWith(mockUser.id, {
        email: mockUser.email,
        name: mockUser.name,
        lastLogin: expect.any(Date),
      });
      expect(userRepository.createUser).not.toHaveBeenCalled();
    });

    it('should create new user on first login', async () => {
      (userRepository.findUserById as jest.Mock).mockResolvedValue(null);
      (userRepository.createUser as jest.Mock).mockResolvedValue(mockUser);
      (tenantRepository.findTenantBySlug as jest.Mock).mockResolvedValue(
        mockTenant
      );

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });
      const wrappedHandler = withAuth(mockHandler);

      await wrappedHandler(req, res);

      expect(userRepository.createUser).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: 'USER',
        lastLogin: expect.any(Date),
        resetToken: expect.stringMatching(/^reset-/),
        verificationToken: expect.stringMatching(/^verify-/),
      });
      expect(tenantRepository.ensureUserTenantAccess).toHaveBeenCalledWith(
        mockUser.id,
        mockTenant.id,
        'USER'
      );
    });

    it('should handle user creation errors', async () => {
      (userRepository.findUserById as jest.Mock).mockResolvedValue(null);
      (userRepository.createUser as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });
      const wrappedHandler = withAuth(mockHandler);

      await wrappedHandler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(logger.error).toHaveBeenCalledWith(
        'Auth middleware database error:',
        expect.any(Error)
      );
    });

    it('should handle missing email in session gracefully', async () => {
      (getSession as jest.Mock).mockResolvedValue({
        user: {
          id: 'user-123',
          email: '', // Empty string instead of null
        },
      });

      // Make the repository methods fail when called with empty email
      (userRepository.findUserById as jest.Mock).mockResolvedValue(null);
      (userRepository.createUser as jest.Mock).mockRejectedValue(
        new Error('Email is required')
      );

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });
      const wrappedHandler = withAuth(mockHandler);

      await wrappedHandler(req, res);

      // The middleware should fail when trying to create/update user with empty email
      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Internal server error',
      });
      expect(logger.error).toHaveBeenCalledWith(
        'Auth middleware database error:',
        expect.any(Error)
      );
    });
  });

  describe('Tenant Management', () => {
    it('should use requested tenant from header if user has access', async () => {
      const requestedTenant = {
        id: 'requested-tenant-123',
        slug: 'requested-tenant',
        name: 'Requested Tenant',
      };
      (tenantRepository.findTenantsByUserId as jest.Mock).mockResolvedValue([
        mockTenant,
        requestedTenant,
      ]);
      (
        tenantRepository.getUserTenantRelationship as jest.Mock
      ).mockResolvedValue({
        tenantId: requestedTenant.id,
        role: 'ADMIN',
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          'x-tenant-slug': 'requested-tenant',
        },
      });
      const wrappedHandler = withAuth(mockHandler);

      await wrappedHandler(req, res);

      const calledReq = (mockHandler as jest.Mock).mock.calls[0][0];
      expect(calledReq.user.tenantId).toBe(requestedTenant.id);
      expect(calledReq.user.role).toBe('ADMIN');
    });

    it('should use default tenant if requested tenant is not accessible', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          'x-tenant-slug': 'inaccessible-tenant',
        },
      });
      const wrappedHandler = withAuth(mockHandler);

      await wrappedHandler(req, res);

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          "requested tenant 'inaccessible-tenant' but doesn't have access"
        )
      );
      const calledReq = (mockHandler as jest.Mock).mock.calls[0][0];
      expect(calledReq.user.tenantId).toBe(mockTenant.id);
    });

    it('should handle users with no tenant access', async () => {
      (tenantRepository.findTenantsByUserId as jest.Mock).mockResolvedValue([]);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });
      const wrappedHandler = withAuth(mockHandler);

      await wrappedHandler(req, res);

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('is not associated with any tenant')
      );
      const calledReq = (mockHandler as jest.Mock).mock.calls[0][0];
      expect(calledReq.user.tenantId).toBeUndefined();
    });
  });

  describe('CSRF Protection', () => {
    it('should validate CSRF token for mutation requests', async () => {
      const csrfToken = 'valid-csrf-token';
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          [CSRF_CONFIG.HEADER_NAME]: csrfToken,
        },
        cookies: {
          [CSRF_CONFIG.COOKIE_NAME]: csrfToken,
        },
      });
      const wrappedHandler = withAuth(mockHandler);

      await wrappedHandler(req, res);

      expect(mockHandler).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(200);
    });

    it('should reject mutation requests with invalid CSRF token', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          [CSRF_CONFIG.HEADER_NAME]: 'invalid-token',
        },
        cookies: {
          [CSRF_CONFIG.COOKIE_NAME]: 'valid-token',
        },
      });
      const wrappedHandler = withAuth(mockHandler);

      await wrappedHandler(req, res);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(403);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'CSRF token validation failed',
      });
    });

    it('should reject mutation requests with missing CSRF token', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        // No CSRF token in header or cookies
      });
      const wrappedHandler = withAuth(mockHandler);

      await wrappedHandler(req, res);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(403);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'CSRF token validation failed',
      });
    });

    it('should skip CSRF check for GET requests', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        // No CSRF token
      });
      const wrappedHandler = withAuth(mockHandler);

      await wrappedHandler(req, res);

      expect(mockHandler).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(200);
    });

    it('should skip CSRF check when disabled', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        // No CSRF token
      });
      const wrappedHandler = withAuth(mockHandler, { csrfCheck: false });

      await wrappedHandler(req, res);

      expect(mockHandler).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(200);
    });
  });

  describe('Edge Cases', () => {
    it('should handle all HTTP mutation methods for CSRF', async () => {
      const methods = ['POST', 'PUT', 'PATCH', 'DELETE'] as const;

      for (const method of methods) {
        jest.clearAllMocks();
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method,
          // No CSRF token
        });
        const wrappedHandler = withAuth(mockHandler);

        await wrappedHandler(req, res);

        expect(res._getStatusCode()).toBe(403);
        expect(mockHandler).not.toHaveBeenCalled();
      }
    });

    it('should handle database errors during tenant lookup', async () => {
      (tenantRepository.findTenantsByUserId as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });
      const wrappedHandler = withAuth(mockHandler);

      await wrappedHandler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(logger.error).toHaveBeenCalledWith(
        'Auth middleware database error:',
        expect.any(Error)
      );
    });
  });
});

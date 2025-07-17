import { withTenant } from '../tenant';
import {
  createMockNextApiRequest,
  createMockNextApiResponse,
  TestDataFactory,
  setupTestEnvironment,
} from '@/lib/testing/test-helpers';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/server/logger';

// Mock dependencies
jest.mock('@/server/logger');
jest.mock('@/repositories/tenantRepository');

import { findTenantById } from '@/repositories/tenantRepository';

describe('Tenant Middleware', () => {
  setupTestEnvironment();

  const mockHandler = jest.fn((req, res) =>
    res.status(200).json({ success: true })
  );
  const mockedFindTenantById = findTenantById as jest.MockedFunction<
    typeof findTenantById
  >;

  describe('withTenant', () => {
    it('should attach tenant to request when user has valid tenantId', async () => {
      const mockTenant = TestDataFactory.createMockTenant();
      const req = createMockNextApiRequest();
      req.user = {
        id: 'user-1',
        auth0Id: 'auth0|123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        tenantId: mockTenant.id,
      };
      const res = createMockNextApiResponse();

      mockedFindTenantById.mockResolvedValue(mockTenant as any);

      const handler = withTenant(mockHandler);
      await handler(req, res);

      expect(mockHandler).toHaveBeenCalledWith(req, res);
      expect(req.tenant).toEqual({
        id: mockTenant.id,
        name: mockTenant.name,
        slug: mockTenant.slug,
      });
    });

    it('should reject request when user has no tenantId', async () => {
      const req = createMockNextApiRequest();
      req.user = {
        id: 'user-1',
        auth0Id: 'auth0|123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        tenantId: null as any,
      };
      const res = createMockNextApiResponse();

      const handler = withTenant(mockHandler);
      await handler(req, res);

      expect(res.statusCode).toBe(403);
      expect(res.body).toEqual({
        status: 'error',
        error: {
          code: ErrorCode.TENANT_ACCESS_DENIED,
          message: 'No tenant assigned to user',
        },
      });
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should reject request when tenant not found', async () => {
      const req = createMockNextApiRequest();
      req.user = {
        id: 'user-1',
        auth0Id: 'auth0|123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        tenantId: 'non-existent-tenant',
      };
      const res = createMockNextApiResponse();

      mockedFindTenantById.mockResolvedValue(null);

      const handler = withTenant(mockHandler);
      await handler(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        status: 'error',
        error: {
          code: ErrorCode.TENANT_NOT_FOUND,
          message: 'Tenant not found',
        },
      });
    });

    it('should reject request when tenant is deleted', async () => {
      const mockTenant = TestDataFactory.createMockTenant({
        deletedAt: new Date(),
      });
      const req = createMockNextApiRequest();
      req.user = {
        id: 'user-1',
        auth0Id: 'auth0|123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        tenantId: mockTenant.id,
      };
      const res = createMockNextApiResponse();

      mockedFindTenantById.mockResolvedValue(mockTenant as any);

      const handler = withTenant(mockHandler);
      await handler(req, res);

      expect(res.statusCode).toBe(403);
      expect(res.body).toEqual({
        status: 'error',
        error: {
          code: ErrorCode.TENANT_ACCESS_DENIED,
          message: 'Tenant is deactivated',
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      const req = createMockNextApiRequest();
      req.user = {
        id: 'user-1',
        auth0Id: 'auth0|123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        tenantId: 'tenant-1',
      };
      const res = createMockNextApiResponse();

      mockedFindTenantById.mockRejectedValue(new Error('Database error'));

      const handler = withTenant(mockHandler);
      await handler(req, res);

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        status: 'error',
        error: {
          code: ErrorCode.TENANT_RESOLUTION_FAILED,
          message: 'Failed to resolve tenant',
        },
      });
      expect(logger.error).toHaveBeenCalled();
    });

    it('should skip tenant validation when skipTenantCheck is true', async () => {
      const req = createMockNextApiRequest();
      req.user = {
        id: 'user-1',
        auth0Id: 'auth0|123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        tenantId: null as any,
      };
      const res = createMockNextApiResponse();

      const handler = withTenant(mockHandler, { skipTenantCheck: true });
      await handler(req, res);

      expect(mockHandler).toHaveBeenCalledWith(req, res);
      expect(req.tenant).toBeUndefined();
      expect(mockedFindTenantById).not.toHaveBeenCalled();
    });
  });
});

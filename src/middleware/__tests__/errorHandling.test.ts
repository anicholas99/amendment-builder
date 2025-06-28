// Mock modules to prevent environment loading issues
jest.mock('@/lib/monitoring/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import { ZodError } from 'zod';
import {
  withErrorHandling,
  throwNotFound,
  throwUnauthorized,
  throwForbidden,
  throwValidationError,
  throwTenantError,
} from '../errorHandling';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/lib/monitoring/logger';

describe('errorHandling middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('withErrorHandling', () => {
    it('should pass through successful requests', async () => {
      const mockHandler = jest.fn(
        async (req: NextApiRequest, res: NextApiResponse) => {
          res.status(200).json({ success: true });
        }
      );

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
      const wrappedHandler = withErrorHandling(mockHandler);

      await wrappedHandler(req, res);

      expect(mockHandler).toHaveBeenCalledWith(req, res);
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({ success: true });
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should handle ApplicationError correctly', async () => {
      const mockHandler = jest.fn(async () => {
        throw new ApplicationError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          'Record not found',
          404
        );
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/test',
        query: { id: '123' },
      });
      const wrappedHandler = withErrorHandling(mockHandler);

      await wrappedHandler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        error: {
          code: ErrorCode.DB_RECORD_NOT_FOUND,
          message: 'Record not found',
        },
      });
      expect(logger.error).toHaveBeenCalledWith(
        '[API Error]',
        expect.objectContaining({
          code: ErrorCode.DB_RECORD_NOT_FOUND,
          message: 'Record not found',
          statusCode: 404,
          request: expect.objectContaining({
            method: 'GET',
            url: '/api/test',
            query: { id: '123' },
          }),
        })
      );
    });

    it('should handle ZodError as validation error', async () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['name'],
          message: 'Expected string, received number',
        },
      ]);

      const mockHandler = jest.fn(async () => {
        throw zodError;
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
      const wrappedHandler = withErrorHandling(mockHandler);

      await wrappedHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: {
          code: ErrorCode.INVALID_INPUT,
          message: expect.stringContaining('Expected string, received number'),
        },
      });
    });

    it('should handle generic Error as internal error', async () => {
      const mockHandler = jest.fn(async () => {
        throw new Error('Something went wrong');
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
      const wrappedHandler = withErrorHandling(mockHandler);

      await wrappedHandler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Something went wrong',
        },
      });
    });

    it('should handle unknown error types', async () => {
      const mockHandler = jest.fn(async () => {
        throw 'string error'; // Non-Error object
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
      const wrappedHandler = withErrorHandling(mockHandler);

      await wrappedHandler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        error: {
          code: ErrorCode.UNKNOWN_ERROR,
          message: 'An unknown error occurred',
        },
      });
    });

    it('should include user and tenant metadata in error logs', async () => {
      const mockHandler = jest.fn(async () => {
        throw new ApplicationError(ErrorCode.AUTH_UNAUTHORIZED, 'Unauthorized');
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/protected',
        user: {
          id: 'user-123',
          tenantId: 'tenant-456',
        },
      });
      const wrappedHandler = withErrorHandling(mockHandler);

      await wrappedHandler(req, res);

      expect(logger.error).toHaveBeenCalledWith(
        '[API Error]',
        expect.objectContaining({
          request: expect.objectContaining({
            userId: 'user-123',
            tenantId: 'tenant-456',
          }),
        })
      );
    });
  });

  describe('error thrower functions', () => {
    describe('throwNotFound', () => {
      it('should throw not found error with resource name', () => {
        expect(() => throwNotFound('User')).toThrow(ApplicationError);
        expect(() => throwNotFound('User')).toThrow('User not found');
      });

      it('should throw not found error with resource and ID', () => {
        expect(() => throwNotFound('User', '123')).toThrow(ApplicationError);
        expect(() => throwNotFound('User', '123')).toThrow(
          'User with ID 123 not found'
        );
      });

      it('should have correct error code', () => {
        try {
          throwNotFound('User');
        } catch (error) {
          expect(error).toBeInstanceOf(ApplicationError);
          expect((error as ApplicationError).code).toBe(
            ErrorCode.DB_RECORD_NOT_FOUND
          );
        }
      });
    });

    describe('throwUnauthorized', () => {
      it('should throw unauthorized error with default message', () => {
        expect(() => throwUnauthorized()).toThrow(ApplicationError);
        expect(() => throwUnauthorized()).toThrow(
          'You are not authorized to perform this action'
        );
      });

      it('should throw unauthorized error with custom message', () => {
        expect(() => throwUnauthorized('Invalid token')).toThrow(
          'Invalid token'
        );
      });

      it('should have correct error code', () => {
        try {
          throwUnauthorized();
        } catch (error) {
          expect(error).toBeInstanceOf(ApplicationError);
          expect((error as ApplicationError).code).toBe(
            ErrorCode.AUTH_UNAUTHORIZED
          );
        }
      });
    });

    describe('throwForbidden', () => {
      it('should throw forbidden error with default message', () => {
        expect(() => throwForbidden()).toThrow(ApplicationError);
        expect(() => throwForbidden()).toThrow(
          'You do not have permission to access this resource'
        );
      });

      it('should throw forbidden error with custom message', () => {
        expect(() => throwForbidden('Admin access required')).toThrow(
          'Admin access required'
        );
      });

      it('should have correct error code', () => {
        try {
          throwForbidden();
        } catch (error) {
          expect(error).toBeInstanceOf(ApplicationError);
          expect((error as ApplicationError).code).toBe(
            ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS
          );
        }
      });
    });

    describe('throwValidationError', () => {
      it('should throw validation error with message', () => {
        expect(() => throwValidationError('Invalid email format')).toThrow(
          ApplicationError
        );
        expect(() => throwValidationError('Invalid email format')).toThrow(
          'Invalid email format'
        );
      });

      it('should throw validation error with details', () => {
        const details = { field: 'email', reason: 'invalid format' };
        try {
          throwValidationError('Validation failed', details);
        } catch (error) {
          expect(error).toBeInstanceOf(ApplicationError);
          expect((error as ApplicationError).message).toBe('Validation failed');
          // Note: ApplicationError constructor doesn't take details parameter in the current implementation
        }
      });

      it('should have correct error code', () => {
        try {
          throwValidationError('Invalid input');
        } catch (error) {
          expect(error).toBeInstanceOf(ApplicationError);
          expect((error as ApplicationError).code).toBe(
            ErrorCode.VALIDATION_FAILED
          );
        }
      });
    });

    describe('throwTenantError', () => {
      it('should throw tenant error with default message', () => {
        expect(() => throwTenantError()).toThrow(ApplicationError);
        expect(() => throwTenantError()).toThrow(
          'You do not have access to this organization'
        );
      });

      it('should throw tenant error with custom message', () => {
        expect(() => throwTenantError('Tenant not found')).toThrow(
          'Tenant not found'
        );
      });

      it('should have correct error code', () => {
        try {
          throwTenantError();
        } catch (error) {
          expect(error).toBeInstanceOf(ApplicationError);
          expect((error as ApplicationError).code).toBe(
            ErrorCode.TENANT_ACCESS_DENIED
          );
        }
      });
    });
  });
});

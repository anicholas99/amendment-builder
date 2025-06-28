// Polyfill for Request global
global.Request = jest.fn() as any;
global.Response = jest.fn() as any;
global.Headers = jest.fn(() => ({
  get: jest.fn(),
  set: jest.fn(),
})) as any;

// Mock modules to prevent environment loading issues
jest.mock('@/config/environment', () => ({
  environment: {
    isDevelopment: false,
    isProduction: false,
    auth: {
      redirectUri: 'https://example.com/api/auth/callback',
    },
    api: {
      apiKey: 'test-api-key',
    },
  },
}));

jest.mock('@/config/security', () => ({
  SECURITY_HEADERS: {
    X_CONTENT_TYPE_OPTIONS: 'nosniff',
    X_FRAME_OPTIONS: 'DENY',
    REFERRER_POLICY: 'strict-origin-when-cross-origin',
    PERMISSIONS_POLICY: 'camera=(), microphone=(), geolocation=()',
    STRICT_TRANSPORT_SECURITY: 'max-age=31536000; includeSubDomains',
    CONTENT_SECURITY_POLICY: "default-src 'self'",
  },
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import {
  withSecurityHeaders,
  verifyOrigin,
  withOriginProtection,
  securityHeaders,
  corsMiddleware,
  validateApiKey,
} from '../security';
import { environment } from '@/config/environment';
import { SECURITY_HEADERS } from '@/config/security';

describe('security middleware', () => {
  const mockHandler = jest.fn(
    async (req: NextApiRequest, res: NextApiResponse) => {
      res.status(200).json({ success: true });
    }
  );

  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment to default test state
    (environment as any).isDevelopment = false;
    (environment as any).isProduction = false;
  });

  describe('withSecurityHeaders', () => {
    it('should add security headers to response', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
      const wrappedHandler = withSecurityHeaders(mockHandler);

      await wrappedHandler(req, res);

      expect(res.getHeader('X-Content-Type-Options')).toBe('nosniff');
      expect(res.getHeader('X-Frame-Options')).toBe('DENY');
      expect(res.getHeader('Referrer-Policy')).toBe(
        'strict-origin-when-cross-origin'
      );
      expect(res.getHeader('Permissions-Policy')).toBe(
        'camera=(), microphone=(), geolocation=()'
      );
      expect(res.getHeader('X-Request-Id')).toBe('mock-uuid-123');
      expect(mockHandler).toHaveBeenCalledWith(req, res);
    });

    it('should add HSTS header in production', async () => {
      (environment as any).isProduction = true;

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
      const wrappedHandler = withSecurityHeaders(mockHandler);

      await wrappedHandler(req, res);

      expect(res.getHeader('Strict-Transport-Security')).toBe(
        'max-age=31536000; includeSubDomains'
      );
    });

    it('should not add HSTS header in non-production', async () => {
      (environment as any).isProduction = false;

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
      const wrappedHandler = withSecurityHeaders(mockHandler);

      await wrappedHandler(req, res);

      expect(res.getHeader('Strict-Transport-Security')).toBeUndefined();
    });
  });

  describe('verifyOrigin', () => {
    it('should allow requests in development mode', () => {
      (environment as any).isDevelopment = true;

      const { req } = createMocks<NextApiRequest, NextApiResponse>({
        headers: {
          origin: 'http://malicious.com',
        },
      });

      expect(verifyOrigin(req)).toBe(true);
    });

    it('should verify origin matches allowed origins', () => {
      const { req } = createMocks<NextApiRequest, NextApiResponse>({
        headers: {
          origin: 'https://example.com',
          host: 'example.com',
        },
      });

      expect(verifyOrigin(req)).toBe(true);
    });

    it('should verify referer when origin is missing', () => {
      const { req } = createMocks<NextApiRequest, NextApiResponse>({
        headers: {
          referer: 'https://example.com/some-page',
          host: 'example.com',
        },
      });

      expect(verifyOrigin(req)).toBe(true);
    });

    it('should reject requests from unauthorized origins', () => {
      const { req } = createMocks<NextApiRequest, NextApiResponse>({
        headers: {
          origin: 'https://malicious.com',
          host: 'example.com',
        },
      });

      expect(verifyOrigin(req)).toBe(false);
    });

    it('should handle missing origin and referer', () => {
      const { req } = createMocks<NextApiRequest, NextApiResponse>({
        headers: {
          host: 'example.com',
        },
      });

      expect(verifyOrigin(req)).toBe(false);
    });
  });

  describe('withOriginProtection', () => {
    it('should allow OPTIONS requests', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'OPTIONS',
      });

      const wrappedHandler = withOriginProtection(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).toHaveBeenCalledWith(req, res);
      expect(res._getStatusCode()).toBe(200);
    });

    it('should allow GET requests without origin check', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          origin: 'https://malicious.com',
        },
      });

      const wrappedHandler = withOriginProtection(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).toHaveBeenCalledWith(req, res);
      expect(res._getStatusCode()).toBe(200);
    });

    it('should verify origin for POST requests', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          origin: 'https://example.com',
          host: 'example.com',
        },
      });

      const wrappedHandler = withOriginProtection(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).toHaveBeenCalledWith(req, res);
      expect(res._getStatusCode()).toBe(200);
    });

    it('should reject POST requests from unauthorized origins', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          origin: 'https://malicious.com',
          host: 'example.com',
        },
      });

      const wrappedHandler = withOriginProtection(mockHandler);
      await wrappedHandler(req, res);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(403);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Forbidden: Cross-site request not allowed',
      });
    });

    it('should verify origin for PUT, DELETE, PATCH requests', async () => {
      const methods = ['PUT', 'DELETE', 'PATCH'] as const;

      for (const method of methods) {
        jest.clearAllMocks();

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method,
          headers: {
            origin: 'https://malicious.com',
            host: 'example.com',
          },
        });

        const wrappedHandler = withOriginProtection(mockHandler);
        await wrappedHandler(req, res);

        expect(mockHandler).not.toHaveBeenCalled();
        expect(res._getStatusCode()).toBe(403);
      }
    });
  });

  describe('securityHeaders (legacy)', () => {
    it('should set security headers in production', () => {
      (environment as any).isProduction = true;

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>();

      securityHeaders(req, res, mockNext);

      expect(res.getHeader('X-Content-Type-Options')).toBe('nosniff');
      expect(res.getHeader('X-Frame-Options')).toBe('DENY');
      expect(res.getHeader('X-XSS-Protection')).toBe('1; mode=block');
      expect(res.getHeader('Referrer-Policy')).toBe(
        'strict-origin-when-cross-origin'
      );
      expect(res.getHeader('Permissions-Policy')).toBe(
        'camera=(), microphone=(), geolocation=()'
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should not set security headers in non-production', () => {
      (environment as any).isProduction = false;

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>();

      securityHeaders(req, res, mockNext);

      expect(res.getHeader('X-Content-Type-Options')).toBeUndefined();
      expect(res.getHeader('X-Frame-Options')).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('corsMiddleware', () => {
    it('should set CORS headers for allowed origins in production', () => {
      (environment as any).isProduction = true;

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        headers: {
          origin: 'https://patentdraft.ipdashboard.com',
        },
      });

      corsMiddleware(req, res, mockNext);

      expect(res.getHeader('Access-Control-Allow-Origin')).toBe(
        'https://patentdraft.ipdashboard.com'
      );
      expect(res.getHeader('Access-Control-Allow-Credentials')).toBe('true');
      expect(res.getHeader('Access-Control-Allow-Methods')).toBe(
        'GET, POST, PUT, DELETE, OPTIONS'
      );
      expect(res.getHeader('Access-Control-Allow-Headers')).toBe(
        'Content-Type, Authorization, X-Requested-With'
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should set CORS headers for localhost in development', () => {
      (environment as any).isProduction = false;

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        headers: {
          origin: 'http://localhost:3000',
        },
      });

      corsMiddleware(req, res, mockNext);

      expect(res.getHeader('Access-Control-Allow-Origin')).toBe(
        'http://localhost:3000'
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should not set origin header for disallowed origins', () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        headers: {
          origin: 'https://malicious.com',
        },
      });

      corsMiddleware(req, res, mockNext);

      expect(res.getHeader('Access-Control-Allow-Origin')).toBeUndefined();
      expect(res.getHeader('Access-Control-Allow-Credentials')).toBe('true');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle OPTIONS preflight requests', () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'OPTIONS',
        headers: {
          origin: 'http://localhost:3000',
        },
      });

      corsMiddleware(req, res, mockNext);

      expect(res._getStatusCode()).toBe(200);
      expect(res._isEndCalled()).toBe(true);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validateApiKey', () => {
    it('should skip validation in development mode', () => {
      (environment as any).isDevelopment = true;

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        headers: {},
      });

      validateApiKey(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(200);
    });

    it('should validate API key in production', () => {
      (environment as any).isDevelopment = false;

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        headers: {
          'x-api-key': 'test-api-key',
        },
      });

      validateApiKey(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(200);
    });

    it('should reject requests with invalid API key', () => {
      (environment as any).isDevelopment = false;

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        headers: {
          'x-api-key': 'wrong-api-key',
        },
      });

      validateApiKey(req, res, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Invalid API key',
      });
    });

    it('should reject requests without API key', () => {
      (environment as any).isDevelopment = false;

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        headers: {},
      });

      validateApiKey(req, res, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(401);
    });

    it('should reject when environment API key is not configured', () => {
      (environment as any).isDevelopment = false;
      (environment as any).api.apiKey = undefined;

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        headers: {
          'x-api-key': 'any-key',
        },
      });

      validateApiKey(req, res, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(401);
    });
  });
});

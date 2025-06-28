import { createApiRateLimiter, RATE_LIMIT_CONFIGS } from '../rateLimit';
import { NextApiRequest, NextApiResponse } from 'next';

// Mock the logger
jest.mock('@/lib/monitoring/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock environment to control Redis usage
jest.mock('@/config/environment', () => ({
  environment: {
    isProduction: false,
    redis: {
      url: '',
    },
  },
}));

describe('Rate Limiting API', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;
  let mockNext: jest.Mock;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let setHeaderMock: jest.Mock;

  beforeEach(() => {
    // Setup mocks
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    setHeaderMock = jest.fn();

    mockReq = {
      method: 'GET',
      url: '/api/test',
    } as any;
    // Add unique ip property for rate limiting to avoid test conflicts
    const randomOctet = Math.floor(Math.random() * 255);
    (mockReq as any).ip = `10.0.0.${randomOctet}`;

    mockRes = {
      status: statusMock,
      json: jsonMock,
      setHeader: setHeaderMock,
    };

    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('createApiRateLimiter', () => {
    it('should allow requests within rate limit', async () => {
      const limiter = createApiRateLimiter('api');

      // Make a request
      await limiter(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse,
        mockNext
      );

      // Should call next and set rate limit headers
      expect(mockNext).toHaveBeenCalled();
      expect(setHeaderMock).toHaveBeenCalledWith(
        'X-RateLimit-Limit',
        expect.any(String)
      );
      expect(setHeaderMock).toHaveBeenCalledWith(
        'X-RateLimit-Remaining',
        expect.any(String)
      );
      expect(setHeaderMock).toHaveBeenCalledWith(
        'X-RateLimit-Reset',
        expect.any(String)
      );
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should use different limits for different endpoints', async () => {
      const authLimiter = createApiRateLimiter('auth');
      const apiLimiter = createApiRateLimiter('api');

      // Auth limiter should have lower limits
      expect(RATE_LIMIT_CONFIGS.auth.points).toBeLessThan(
        RATE_LIMIT_CONFIGS.api.points
      );

      // Both should work independently
      await authLimiter(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse,
        mockNext
      );
      await apiLimiter(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledTimes(2);
    });

    it('should block requests exceeding rate limit', async () => {
      const limiter = createApiRateLimiter('auth'); // Auth has low limits (5 per 5 min)

      // Make requests up to the limit
      for (let i = 0; i < RATE_LIMIT_CONFIGS.auth.points; i++) {
        mockNext.mockClear();
        await limiter(
          mockReq as NextApiRequest,
          mockRes as NextApiResponse,
          mockNext
        );
        expect(mockNext).toHaveBeenCalled();
      }

      // Next request should be blocked
      mockNext.mockClear();
      await limiter(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse,
        mockNext
      );

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(429);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: expect.any(Number),
      });
      expect(setHeaderMock).toHaveBeenCalledWith(
        'Retry-After',
        expect.any(String)
      );
    });

    it('should handle errors gracefully', async () => {
      // Mock an error in the rate limiter
      const limiter = createApiRateLimiter('api');

      // Override consume to throw an error
      const originalConsume = Object.getPrototypeOf(
        Object.getPrototypeOf(limiter)
      ).consume;
      Object.getPrototypeOf(Object.getPrototypeOf(limiter)).consume = jest
        .fn()
        .mockRejectedValue(new Error('Test error'));

      await limiter(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse,
        mockNext
      );

      // Should still call next on error
      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();

      // Restore original
      Object.getPrototypeOf(Object.getPrototypeOf(limiter)).consume =
        originalConsume;
    });

    it('should track rate limits per IP', async () => {
      const limiter = createApiRateLimiter('auth');

      // First IP
      (mockReq as any).ip = '192.168.1.1';
      for (let i = 0; i < RATE_LIMIT_CONFIGS.auth.points; i++) {
        mockNext.mockClear();
        await limiter(
          mockReq as NextApiRequest,
          mockRes as NextApiResponse,
          mockNext
        );
        expect(mockNext).toHaveBeenCalled();
      }

      // Should be blocked
      mockNext.mockClear();
      await limiter(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse,
        mockNext
      );
      expect(mockNext).not.toHaveBeenCalled();

      // Different IP should still work
      (mockReq as any).ip = '192.168.1.2';
      mockNext.mockClear();
      statusMock.mockClear();
      await limiter(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse,
        mockNext
      );
      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });
  });

  describe('Rate limit configurations', () => {
    it('should have appropriate limits for different endpoints', () => {
      // Auth endpoints should have strict limits
      expect(RATE_LIMIT_CONFIGS.auth.points).toBe(5);
      expect(RATE_LIMIT_CONFIGS.auth.blockDuration).toBeDefined();

      // API endpoints should have moderate limits
      expect(RATE_LIMIT_CONFIGS.api.points).toBeGreaterThan(50);

      // AI endpoints should have lower limits due to cost
      expect(RATE_LIMIT_CONFIGS.ai.points).toBeLessThan(
        RATE_LIMIT_CONFIGS.api.points
      );

      // System endpoints should have high limits
      expect(RATE_LIMIT_CONFIGS.system.points).toBeGreaterThan(
        RATE_LIMIT_CONFIGS.api.points
      );
    });
  });
});

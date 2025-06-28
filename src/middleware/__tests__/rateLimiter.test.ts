// Mock modules to prevent environment loading issues
jest.mock('@/config/environment', () => ({
  environment: {
    isTest: false,
    isDevelopment: false,
    isProduction: false,
  },
}));

jest.mock('@/lib/monitoring/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('@/utils/network', () => ({
  getClientIp: jest.fn(() => '127.0.0.1'),
}));

jest.mock('../rate-limit-config', () => ({
  rateLimiters: {
    api: jest.fn((req, res, next) => next()),
    auth: jest.fn((req, res, next) => next()),
    search: jest.fn((req, res, next) => next()),
    upload: jest.fn((req, res, next) => next()),
  },
  RateLimitType: {
    API: 'api',
    AUTH: 'auth',
    SEARCH: 'search',
    UPLOAD: 'upload',
  },
}));

jest.mock('express-rate-limit', () => {
  return jest.fn(options => {
    // Return a mock middleware function
    return jest.fn((req, res, next) => {
      // Simulate rate limiting behavior
      const mockRateLimitInfo = {
        limit: options.max,
        current: 1,
        remaining: options.max - 1,
        resetTime: new Date(Date.now() + options.windowMs),
      };

      // Set rate limit headers if standardHeaders is true
      if (options.standardHeaders) {
        res.setHeader('RateLimit-Limit', mockRateLimitInfo.limit);
        res.setHeader('RateLimit-Remaining', mockRateLimitInfo.remaining);
        res.setHeader(
          'RateLimit-Reset',
          mockRateLimitInfo.resetTime.toISOString()
        );
      }

      // Check if should skip
      if (options.skip && options.skip(req)) {
        return next();
      }

      // Simulate rate limit exceeded
      if (req.simulateRateLimitExceeded) {
        res.status(429).json(options.message);
        // Don't call next() when rate limit is exceeded
        return;
      }

      next();
    });
  });
});

import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import { withRateLimit } from '../rateLimiter';
import { logger } from '@/lib/monitoring/logger';
import { getClientIp } from '@/utils/network';
import { environment } from '@/config/environment';
import { rateLimiters } from '../rate-limit-config';
import rateLimit from 'express-rate-limit';

describe('rateLimiter middleware', () => {
  const mockHandler = jest.fn(
    async (req: NextApiRequest, res: NextApiResponse) => {
      res.status(200).json({ success: true });
    }
  );

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment to default test state
    (environment as any).isTest = false;
    (environment as any).isDevelopment = false;
    (environment as any).isProduction = false;
  });

  describe('withRateLimit', () => {
    it('should skip rate limiting in test environment', async () => {
      (environment as any).isTest = true;

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
      const wrappedHandler = withRateLimit(mockHandler);

      await wrappedHandler(req, res);

      expect(mockHandler).toHaveBeenCalledWith(req, res);
      expect(rateLimit).not.toHaveBeenCalled();
    });

    it('should apply rate limiting with default numeric config', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
      const wrappedHandler = withRateLimit(mockHandler);

      await wrappedHandler(req, res);

      expect(rateLimit).toHaveBeenCalledWith({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: expect.any(Function),
        skip: expect.any(Function),
        message: { error: 'Too many requests, please try again later.' },
      });
      expect(mockHandler).toHaveBeenCalledWith(req, res);
    });

    it('should apply rate limiting with custom numeric config', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
      const wrappedHandler = withRateLimit(mockHandler, 50, 5 * 60 * 1000);

      await wrappedHandler(req, res);

      expect(rateLimit).toHaveBeenCalledWith({
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 50,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: expect.any(Function),
        skip: expect.any(Function),
        message: { error: 'Too many requests, please try again later.' },
      });
    });

    it('should apply rate limiting with object config', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
      const config = { requests: 10, windowMs: 60000 };
      const wrappedHandler = withRateLimit(mockHandler, config);

      await wrappedHandler(req, res);

      expect(rateLimit).toHaveBeenCalledWith({
        windowMs: 60000,
        max: 10,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: expect.any(Function),
        skip: expect.any(Function),
        message: { error: 'Too many requests, please try again later.' },
      });
    });

    it('should use preset rate limiter for string config', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
      const wrappedHandler = withRateLimit(mockHandler, 'auth');

      await wrappedHandler(req, res);

      expect(rateLimiters.auth).toHaveBeenCalled();
      expect(rateLimit).not.toHaveBeenCalled();
      expect(mockHandler).toHaveBeenCalledWith(req, res);
    });

    it('should fallback to api limiter for invalid preset', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
      const wrappedHandler = withRateLimit(mockHandler, 'invalid-preset');

      await wrappedHandler(req, res);

      expect(logger.warn).toHaveBeenCalledWith(
        "Invalid rate limit preset: invalid-preset, using default 'api' limiter"
      );
      expect(rateLimiters.api).toHaveBeenCalled();
      expect(mockHandler).toHaveBeenCalledWith(req, res);
    });

    it('should use client IP for rate limiting key', async () => {
      (getClientIp as jest.Mock).mockReturnValue('192.168.1.1');

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
      const wrappedHandler = withRateLimit(mockHandler);

      await wrappedHandler(req, res);

      // Get the keyGenerator function from the rateLimit call
      const rateLimitCall = (rateLimit as jest.Mock).mock.calls[0][0];
      const keyGenerator = rateLimitCall.keyGenerator;

      expect(keyGenerator(req)).toBe('192.168.1.1');
      expect(getClientIp).toHaveBeenCalledWith(req);
    });

    it('should use "unknown" when client IP cannot be determined', async () => {
      (getClientIp as jest.Mock).mockReturnValue(null);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
      const wrappedHandler = withRateLimit(mockHandler);

      await wrappedHandler(req, res);

      // Get the keyGenerator function from the rateLimit call
      const rateLimitCall = (rateLimit as jest.Mock).mock.calls[0][0];
      const keyGenerator = rateLimitCall.keyGenerator;

      expect(keyGenerator(req)).toBe('unknown');
    });

    it('should set rate limit headers', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
      const wrappedHandler = withRateLimit(mockHandler);

      await wrappedHandler(req, res);

      expect(res.getHeader('RateLimit-Limit')).toBeDefined();
      expect(res.getHeader('RateLimit-Remaining')).toBeDefined();
      expect(res.getHeader('RateLimit-Reset')).toBeDefined();
    });

    it('should handle rate limiter errors', async () => {
      // Mock the rate limiter to throw an error
      const errorLimiter = jest.fn((req, res, next) => {
        next(new Error('Rate limiter error'));
      });
      (rateLimit as jest.Mock).mockReturnValueOnce(errorLimiter);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
      const wrappedHandler = withRateLimit(mockHandler);

      await expect(wrappedHandler(req, res)).rejects.toThrow(
        'Rate limiter error'
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Rate limiting error:',
        expect.any(Error)
      );
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should test skip function behavior', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
      const wrappedHandler = withRateLimit(mockHandler);

      await wrappedHandler(req, res);

      // Get the skip function from the rateLimit call
      const rateLimitCall = (rateLimit as jest.Mock).mock.calls[0][0];
      const skipFunction = rateLimitCall.skip;

      // Test skip function returns false when not in test environment
      (environment as any).isTest = false;
      expect(skipFunction()).toBe(false);

      // Test skip function returns true when in test environment
      (environment as any).isTest = true;
      expect(skipFunction()).toBe(true);
    });

    it('should work with different preset types', async () => {
      const presets = ['api', 'auth', 'search', 'upload'] as const;

      for (const preset of presets) {
        jest.clearAllMocks();

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
        const wrappedHandler = withRateLimit(mockHandler, preset);

        await wrappedHandler(req, res);

        expect(
          rateLimiters[preset as keyof typeof rateLimiters]
        ).toHaveBeenCalled();
        expect(mockHandler).toHaveBeenCalledWith(req, res);
      }
    });
  });
});

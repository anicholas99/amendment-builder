import { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError, ZodSchema } from 'zod';
import { logger } from '@/lib/monitoring/logger';
import {
  AuthenticatedRequest,
  ApiHandler,
  ComposedHandler,
  InferSchemaType,
} from '@/types/middleware';

// DOMPurify is available but needs proper setup for Node.js
let DOMPurify: any;
if (typeof window !== 'undefined') {
  // Client-side
  DOMPurify = require('dompurify');
} else {
  // Server-side - use a basic implementation
  DOMPurify = {
    sanitize: (input: string) => {
      // Basic sanitization for server-side
      return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/data:text\/html/gi, '');
    }
  };
}

/**
 * Wrap a Next.js API handler with Zod validation on `req.body`.
 * If validation fails, responds with 400 and error details (flattened fieldErrors).
 */
export function withValidation<TSchema extends ZodSchema>(
  schema: TSchema
): (handler: ApiHandler) => ComposedHandler {
  return (handler: ApiHandler) =>
    async (req: NextApiRequest, res: NextApiResponse) => {
      const authReq = req as AuthenticatedRequest;

      try {
        // Validate request body
        // Some runtimes set req.body to undefined when there is no payload.
        // Zod.parse(undefined) will throw even when all fields are optional, so
        // default to an empty object in that case.
        const body = authReq.body ?? {};
        const validated = schema.parse(body);

        // Update request with validated body
        authReq.body = validated;

        // Call the handler with typed body
        return handler(
          authReq as AuthenticatedRequest & { body: InferSchemaType<TSchema> },
          res
        );
      } catch (error) {
        if (error instanceof ZodError) {
          logger.warn('Validation error', {
            errors: error.errors,
            path: authReq.url,
          });

          return res.status(400).json({
            error: 'Validation failed',
            details: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          });
        }

        logger.error('Unexpected validation error', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    };
}

/**
 * Sanitizes HTML input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  try {
    return DOMPurify.sanitize(input);
  } catch (error) {
    logger.error('Error sanitizing input', { error, input: input.substring(0, 100) });
    return '';
  }
}

/**
 * Validates file uploads for security
 */
export function validateFileUpload(file: {
  name: string;
  size: number;
  type: string;
}): { isValid: boolean; error?: string } {
  const { name, size, type } = file;
  
  // Check file size (10MB limit)
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  if (size > MAX_FILE_SIZE) {
    return { isValid: false, error: 'File size exceeds 10MB limit' };
  }
  
  // Check allowed file types
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];
  
  if (!ALLOWED_TYPES.includes(type)) {
    return { isValid: false, error: 'File type not allowed' };
  }
  
  // Check filename for malicious patterns
  const sanitizedName = sanitizeFilename(name);
  if (sanitizedName !== name) {
    return { isValid: false, error: 'Invalid filename characters' };
  }
  
  return { isValid: true };
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validates URL format and security
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    const parsedUrl = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }
    
    // Prevent localhost and private IP ranges in production
    if (process.env.NODE_ENV === 'production') {
      const hostname = parsedUrl.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname.startsWith('127.') ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)
      ) {
        return false;
      }
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitizes filename for security
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return '';
  }
  
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '') // Remove dangerous characters
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\.+$/, '') // Remove trailing dots
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 255); // Limit length
}

/**
 * Validates API key format
 */
export function validateApiKey(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  
  // API keys should be at least 32 characters and alphanumeric + some special chars
  const apiKeyRegex = /^[A-Za-z0-9_-]{32,}$/;
  return apiKeyRegex.test(apiKey);
}

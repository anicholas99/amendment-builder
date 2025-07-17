import { z } from 'zod';
import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { AuthenticatedRequest, ApiHandler } from '@/types/middleware';
import DOMPurify from 'isomorphic-dompurify';
import { isProduction } from '@/config/environment.client';

/**
 * Wrap a Next.js API handler with Zod validation on `req.body`.
 * If validation fails, responds with 400 and error details (flattened fieldErrors).
 */
export function withValidation<TSchema extends z.ZodSchema>(
  schema: TSchema
): (handler: ApiHandler) => NextApiHandler {
  return (handler: ApiHandler) =>
    async (req: NextApiRequest, res: NextApiResponse) => {
      const authReq = req as AuthenticatedRequest;

      try {
        // Validate request body
        // Some runtimes set req.body to undefined when there is no payload.
        // Zod.parse(undefined) will throw even when all fields are optional, so
        // default to an empty object in that case.
        const body: unknown = authReq.body ?? {};
        const validated = schema.parse(body) as z.infer<TSchema>;

        // Update request with validated body
        authReq.body = validated;

        // Call the handler with typed body
        return handler(
          authReq as AuthenticatedRequest & { body: z.infer<TSchema> },
          res
        );
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Warning logging removed for client compatibility

          return res.status(400).json({
            error: 'Validation failed',
            details: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          });
        }
        // Error logging removed for client compatibility
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
    // Error logging removed for client compatibility
    return '';
  }
}

/**
 * Validates file uploads for security
 */
export function validateFileUpload(
  filename: string,
  size: number,
  allowedTypes: string[],
  maxSize: number = 10 * 1024 * 1024
): boolean {
  // Check empty filename
  if (!filename || typeof filename !== 'string') {
    return false;
  }

  // Check file extension
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) {
    return false;
  }

  // Map extensions to MIME types
  const extensionToMimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    pdf: 'application/pdf',
    exe: 'application/x-msdownload',
    js: 'application/javascript',
    php: 'application/x-php',
  };

  const mimeType = extensionToMimeMap[ext];
  if (!mimeType || !allowedTypes.includes(mimeType)) {
    return false;
  }

  // Check file size
  if (size > maxSize) {
    return false;
  }

  return true;
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Basic email validation - not too strict to handle edge cases like user@localhost
  const emailRegex = /^[^\s@]+@[^\s@]+(\.[^\s@]+)?$/;

  // Check for double dots
  if (email.includes('..')) {
    return false;
  }

  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validates URL format and security
 */
export function isValidUrl(
  url: string,
  allowedProtocols: string[] = ['http', 'https']
): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsedUrl = new URL(url);

    // Check if protocol is allowed (remove the colon from protocol)
    const protocol = parsedUrl.protocol.slice(0, -1);
    if (!allowedProtocols.includes(protocol)) {
      return false;
    }

    // For http/https, prevent localhost and private IP ranges in production
    if (['http', 'https'].includes(protocol) && isProduction) {
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
    return 'untitled';
  }

  // Trim whitespace
  let sanitized = filename.trim();
  if (!sanitized) {
    return 'untitled';
  }

  // Windows reserved names
  const reservedNames = [
    'CON',
    'PRN',
    'AUX',
    'NUL',
    'COM1',
    'COM2',
    'COM3',
    'COM4',
    'COM5',
    'COM6',
    'COM7',
    'COM8',
    'COM9',
    'LPT1',
    'LPT2',
    'LPT3',
    'LPT4',
    'LPT5',
    'LPT6',
    'LPT7',
    'LPT8',
    'LPT9',
  ];
  const nameWithoutExt = sanitized.split('.')[0].toUpperCase();
  if (reservedNames.includes(nameWithoutExt)) {
    sanitized = '_' + sanitized;
  }

  // Remove dangerous characters and path separators
  sanitized = sanitized
    .replace(/[<>:"|?*\x00-\x1f]/g, '') // Remove dangerous characters
    .replace(/[\/\\]/g, '') // Remove path separators
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\.+$/, '') // Remove trailing dots
    .replace(/\s+/g, '_'); // Replace spaces with underscores

  // Limit length while preserving file extension
  if (sanitized.length > 255) {
    const lastDotIndex = sanitized.lastIndexOf('.');
    if (lastDotIndex > 0) {
      const ext = sanitized.substring(lastDotIndex);
      const name = sanitized.substring(0, lastDotIndex);
      sanitized = name.substring(0, 255 - ext.length) + ext;
    } else {
      sanitized = sanitized.substring(0, 255);
    }
  }

  return sanitized || 'untitled';
}

/**
 * Validates API key format
 */
export function validateApiKey(
  apiKey: string,
  requiredPrefix?: string,
  minLength: number = 8
): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  // Check prefix if required
  if (requiredPrefix && !apiKey.startsWith(requiredPrefix)) {
    return false;
  }

  // Common API key prefixes that should be excluded from length check
  const commonPrefixes = [
    'sk-',
    'pk-',
    'pk_',
    'sk_',
    'bearer_',
    'api_',
    'key_',
  ];
  let keyWithoutPrefix = apiKey;

  // Remove common prefix for length check
  for (const prefix of commonPrefixes) {
    if (apiKey.startsWith(prefix)) {
      keyWithoutPrefix = apiKey.substring(prefix.length);
      break;
    }
  }

  // Check minimum length (excluding prefix)
  if (keyWithoutPrefix.length < minLength) {
    return false;
  }

  // API keys should be alphanumeric + some special chars
  const apiKeyRegex = /^[A-Za-z0-9_-]+$/;
  return apiKeyRegex.test(apiKey);
}

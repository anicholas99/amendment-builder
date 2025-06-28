import { z } from 'zod';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/lib/monitoring/logger';

/**
 * Validates raw API response data against a Zod schema.
 * Throws a structured ApplicationError if validation fails.
 *
 * @template T - The Zod schema for validation.
 * @param {unknown} data - The raw data from the API response (e.g., from response.json()).
 * @param {T} schema - The Zod schema to validate against.
 * @returns {z.infer<T>} The validated and typed data.
 * @throws {ApplicationError} If validation fails.
 */
export function validateApiResponse<T extends z.ZodTypeAny>(
  data: unknown,
  schema: T
): z.infer<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return result.data;
  }

  // Log the detailed validation error for debugging purposes
  logger.error('API Response Validation Failed', {
    error: result.error.flatten(),
    rawData: data, // Be cautious with logging sensitive data in production
  });

  throw new ApplicationError(
    ErrorCode.VALIDATION_FAILED,
    'API response validation failed',
    400
  );
}

/**
 * Validates raw request body data against a Zod schema.
 * Throws a structured ApplicationError if validation fails.
 *
 * @template T - The Zod schema for validation.
 * @param {unknown} data - The raw data from the request body.
 * @param {T} schema - The Zod schema to validate against.
 * @returns {z.infer<T>} The validated and typed data.
 * @throws {ApplicationError} If validation fails.
 */
export function validateRequestBody<T extends z.ZodTypeAny>(
  data: unknown,
  schema: T
): z.infer<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return result.data;
  }

  // Log the detailed validation error for debugging purposes
  logger.error('Request Body Validation Failed', {
    error: result.error.flatten(),
    rawData: data, // Be cautious with logging sensitive data in production
  });

  throw new ApplicationError(
    ErrorCode.VALIDATION_FAILED,
    'Request body validation failed',
    400
  );
}

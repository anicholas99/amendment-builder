import { z } from 'zod';
import { ApplicationError, ErrorCode } from '@/lib/error';

/**
 * Formats Zod validation errors into a human-readable message
 */
function formatZodErrors(error: z.ZodError): string {
  const fieldErrors = error.errors.map(err => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });

  return fieldErrors.join(', ');
}

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

  const errorMessage = `API response validation failed: ${formatZodErrors(result.error)}`;

  throw new ApplicationError(ErrorCode.VALIDATION_FAILED, errorMessage, 400);
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

  const errorMessage = `Request body validation failed: ${formatZodErrors(result.error)}`;

  throw new ApplicationError(ErrorCode.VALIDATION_FAILED, errorMessage, 400);
}

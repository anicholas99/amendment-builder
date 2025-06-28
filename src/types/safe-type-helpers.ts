/**
 * Type-safe helpers to replace common type assertion patterns
 * These utilities provide safer type assertions with runtime validation
 */

import { Prisma } from '@prisma/client';

/**
 * Type guard for objects with specific properties
 * Useful for parsed JSON data from Prisma
 */
export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is { [P in K]: unknown } {
  return typeof obj === 'object' && obj !== null && key in obj;
}

/**
 * Type guard for array checking
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Safe JSON parsing with type validation
 */
export function parseJsonAs<T>(
  json: string | null | undefined,
  validator: (value: unknown) => value is T,
  defaultValue: T
): T {
  if (!json) return defaultValue;

  try {
    const parsed = JSON.parse(json);
    return validator(parsed) ? parsed : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Type-safe getter for nested properties
 */
export function getNestedProperty<T>(
  obj: unknown,
  path: string[],
  defaultValue: T
): T {
  let current: unknown = obj;

  for (const key of path) {
    if (!hasProperty(current, key)) {
      return defaultValue;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current as T;
}

/**
 * Type guard for error objects
 */
export function isErrorWithCode(error: unknown): error is {
  code: string;
  message: string;
} {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as Record<string, unknown>).code === 'string' &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

/**
 * Type guard for API errors
 */
export function isApiError(error: unknown): error is {
  status: number;
  body?: unknown;
} {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as Record<string, unknown>).status === 'number'
  );
}

/**
 * Safe type assertion for Prisma JSON fields
 */
export function assertPrismaJson<T>(
  value: Prisma.JsonValue,
  validator: (value: unknown) => value is T
): T | null {
  return validator(value) ? value : null;
}

/**
 * Type guard for objects with string index signatures
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Safe access to global objects
 */
export function getGlobalProperty<T>(property: string, defaultValue: T): T {
  if (typeof window !== 'undefined' && property in window) {
    return (window as unknown as Record<string, unknown>)[property] as T;
  }
  return defaultValue;
}

/**
 * Type-safe wrapper for Express-style middleware
 */
export type TypedHandler<TBody = unknown> = (
  req: { body: TBody } & Record<string, unknown>,
  res: Record<string, unknown>
) => void | Promise<void>;

/**
 * Helper to create typed handlers without as unknown
 */
export function createTypedHandler<TBody>(
  handler: TypedHandler<TBody>
): TypedHandler<TBody> {
  return handler;
}

/**
 * Type guard for search history entries with parsed elements
 */
export function hasExcludedReferences(
  data: unknown
): data is { excludedReferences: string[] } {
  return (
    isRecord(data) &&
    'excludedReferences' in data &&
    isArray(data.excludedReferences) &&
    data.excludedReferences.every(ref => typeof ref === 'string')
  );
}

/**
 * Type guard for project items with saved prior art
 */
export function isSavedPriorArtItem(item: unknown): item is {
  patentNumber?: string;
  savedAt?: string | Date;
  authors?: string;
  publicationDate?: string | Date;
  number?: string;
  dateAdded?: string | Date;
} {
  return isRecord(item);
}

/**
 * Safe error handler for async operations
 */
export function handleAsyncError<T>(
  promise: Promise<T>,
  errorHandler: (error: Error) => void
): void {
  promise.catch((error: unknown) => {
    const err = error instanceof Error ? error : new Error(String(error));
    errorHandler(err);
  });
}

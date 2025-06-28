export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}

export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is { [key in K]: unknown } {
  return isObject(obj) && key in obj;
}

export function isApiError(
  error: unknown
): error is { message: string; statusCode?: number } {
  return (
    isObject(error) && hasProperty(error, 'message') && isString(error.message)
  );
}

export function ensureError(value: unknown): Error {
  if (isError(value)) return value;
  if (isString(value)) return new Error(value);
  if (isApiError(value)) return new Error(value.message);
  return new Error('An unknown error occurred');
}

/**
 * Type utilities for casting and type safety
 */

/**
 * Type assertion function to safely cast an unknown value to a specific type
 * Use this instead of 'as' operator when type safety is uncertain
 *
 * @example
 * const userData = typeAssertion<UserData>(response.data);
 */
export function typeAssertion<T>(value: unknown): T {
  return value as T;
}

/**
 * Safe type guard to check if an object has a property
 *
 * @example
 * if (hasProperty(user, 'email')) {
 *   // TypeScript now knows user.email exists
 *   void 0; // Console statement suppressed
 * }
 */
export function hasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

/**
 * Type guard to check if a value is not null or undefined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard to check if a value is a plain object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard to check if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard to check if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard to check if a value is an array
 */
export function isArray<T = unknown>(value: unknown): value is Array<T> {
  return Array.isArray(value);
}

/**
 * Safely access potentially undefined nested properties
 *
 * @example
 * const email = safeGet(user, 'contact', 'email');
 */
export function safeGet<T, K1 extends keyof T>(obj: T, key1: K1): T[K1];
export function safeGet<T, K1 extends keyof T, K2 extends keyof T[K1]>(
  obj: T,
  key1: K1,
  key2: K2
): T[K1][K2];
export function safeGet<
  T,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
>(obj: T, key1: K1, key2: K2, key3: K3): T[K1][K2][K3];
export function safeGet(obj: unknown, ...keys: string[]): unknown {
  return keys.reduce<unknown>((acc, key) => {
    // Type check to ensure acc is an object with index signature
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

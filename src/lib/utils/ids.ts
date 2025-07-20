import { customAlphabet } from 'nanoid';

// Create a custom nanoid with URL-safe characters
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz', 21);

/**
 * Generate a unique ID
 * Uses nanoid for URL-safe, collision-resistant IDs
 */
export function generateId(): string {
  return nanoid();
}

/**
 * Generate a prefixed ID
 * Useful for identifying different types of entities
 */
export function generatePrefixedId(prefix: string): string {
  return `${prefix}_${nanoid()}`;
}
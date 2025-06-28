import { z } from 'zod';

/**
 * Authentication-related validation schemas
 * Provides consistent validation for auth-related fields across the codebase
 */

/**
 * Auth0 User ID Schema
 * Auth0 IDs follow the pattern: provider|id (e.g., "auth0|123abc", "google-oauth2|456def")
 * This schema validates the format while being flexible for different auth providers
 */
export const auth0UserIdSchema = z
  .string()
  .min(1, 'User ID is required')
  .regex(
    /^[a-zA-Z0-9-]+\|[a-zA-Z0-9-]+$/,
    'Invalid Auth0 user ID format. Expected format: provider|id'
  );

/**
 * Generic User ID Schema
 * Use this when the user ID could be either a UUID (from database) or Auth0 ID
 * This is useful for fields that might contain either format
 */
export const userIdSchema = z
  .string()
  .min(1, 'User ID is required')
  .refine(id => {
    // Check if it's a valid UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    // Check if it's a valid Auth0 ID
    const auth0Regex = /^[a-zA-Z0-9-]+\|[a-zA-Z0-9-]+$/;

    return uuidRegex.test(id) || auth0Regex.test(id);
  }, 'Invalid user ID format. Must be either a UUID or Auth0 ID (provider|id)');

/**
 * Optional User ID Schema
 * Same as userIdSchema but allows undefined/null
 */
export const optionalUserIdSchema = userIdSchema.optional();

/**
 * Auth0 Provider Schema
 * Validates known Auth0 provider types
 */
export const auth0ProviderSchema = z.enum([
  'auth0',
  'google-oauth2',
  'github',
  'linkedin',
  'microsoft',
  'twitter',
  'facebook',
]);

/**
 * Parse an Auth0 user ID to extract provider and ID parts
 * @param auth0Id The full Auth0 ID (e.g., "auth0|123abc")
 * @returns Object with provider and id, or null if invalid
 */
export function parseAuth0UserId(
  auth0Id: string
): { provider: string; id: string } | null {
  const parts = auth0Id.split('|');
  if (parts.length !== 2) {
    return null;
  }
  return {
    provider: parts[0],
    id: parts[1],
  };
}

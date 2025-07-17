/**
 * Client-side auth utilities
 *
 * These utilities provide a consistent interface for auth operations
 * regardless of the underlying auth provider.
 */

/**
 * Get the login URL
 * @param returnTo - Optional URL to return to after login
 */
export function getLoginUrl(returnTo?: string): string {
  // This matches the server-side auth manager logic
  return `/api/auth/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`;
}

/**
 * Get the logout URL
 * @param returnTo - Optional URL to return to after logout
 */
export function getLogoutUrl(returnTo?: string): string {
  // This matches the server-side auth manager logic
  return `/api/auth/logout${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`;
}

/**
 * Navigate to login page
 */
export function redirectToLogin(returnTo?: string): void {
  window.location.href = getLoginUrl(returnTo);
}

/**
 * Navigate to logout
 */
export function redirectToLogout(returnTo?: string): void {
  window.location.href = getLogoutUrl(returnTo);
}

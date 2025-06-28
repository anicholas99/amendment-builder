/**
 * Centralized auth redirect utilities
 * These will handle the transition from Auth0 to IPD Identity
 */

import { API_ROUTES } from '@/constants/apiRoutes';

// TODO: Remove when IPD Identity integration is complete
const USE_IPD_IDENTITY = process.env.NEXT_PUBLIC_USE_IPD_IDENTITY === 'true';
const IPD_IDENTITY_URL = 'https://ipdashboard.com';

/**
 * Redirect to login page
 * @param returnTo - Optional URL to return to after login
 */
export function redirectToLogin(returnTo?: string): void {
  if (USE_IPD_IDENTITY) {
    // IPD Identity login redirect
    const redirectUrl = returnTo || window.location.href;
    window.location.href = `${IPD_IDENTITY_URL}/login?redirect=${encodeURIComponent(redirectUrl)}`;
  } else {
    // Auth0 login redirect (current implementation)
    const loginUrl = new URL(API_ROUTES.AUTH.LOGIN, window.location.origin);
    if (returnTo) {
      loginUrl.searchParams.set('returnTo', returnTo);
    }
    window.location.href = loginUrl.toString();
  }
}

/**
 * Redirect to logout page
 * @param returnTo - Optional URL to return to after logout
 */
export function redirectToLogout(returnTo?: string): void {
  if (USE_IPD_IDENTITY) {
    // IPD Identity logout redirect
    window.location.href = `${IPD_IDENTITY_URL}/logout`;
  } else {
    // Auth0 logout redirect (current implementation)
    const logoutUrl = new URL(API_ROUTES.AUTH.LOGOUT, window.location.origin);
    if (returnTo) {
      logoutUrl.searchParams.set('returnTo', returnTo);
    }
    window.location.href = logoutUrl.toString();
  }
}

/**
 * Get login URL without redirecting
 * @param returnTo - Optional URL to return to after login
 */
export function getLoginUrl(returnTo?: string): string {
  if (USE_IPD_IDENTITY) {
    const redirectUrl = returnTo || window.location.href;
    return `${IPD_IDENTITY_URL}/login?redirect=${encodeURIComponent(redirectUrl)}`;
  } else {
    const loginUrl = new URL(API_ROUTES.AUTH.LOGIN, window.location.origin);
    if (returnTo) {
      loginUrl.searchParams.set('returnTo', returnTo);
    }
    return loginUrl.toString();
  }
}

/**
 * Get logout URL without redirecting
 * @param returnTo - Optional URL to return to after logout
 */
export function getLogoutUrl(returnTo?: string): string {
  if (USE_IPD_IDENTITY) {
    return `${IPD_IDENTITY_URL}/logout`;
  } else {
    const logoutUrl = new URL(API_ROUTES.AUTH.LOGOUT, window.location.origin);
    if (returnTo) {
      logoutUrl.searchParams.set('returnTo', returnTo);
    }
    return logoutUrl.toString();
  }
}

/**
 * IPD Integration Configuration
 *
 * This module contains configuration settings for integrating with
 * IPD's identity and authentication system.
 */

import { env } from './env';

export interface IPDConfig {
  baseUrl: string;
  apiUrl: string;
  cookieDomain: string;
  sessionCookieName: string;
  userCookieName: string;
  tenantCookieName: string;
  publicKey?: string; // For cookie validation
}

export const ipdConfig: IPDConfig = {
  baseUrl: env.IPD_BASE_URL,
  apiUrl: env.IPD_API_URL,
  cookieDomain: env.IPD_COOKIE_DOMAIN,
  sessionCookieName: env.IPD_SESSION_COOKIE_NAME,
  userCookieName: env.IPD_USER_COOKIE_NAME,
  tenantCookieName: env.IPD_TENANT_COOKIE_NAME,
  publicKey: env.IPD_PUBLIC_KEY, // For validating signed cookies
};

/**
 * IPD API endpoints that Patent Drafter will need to integrate with
 */
export const ipdEndpoints = {
  // Authentication
  login: `${ipdConfig.baseUrl}/login`,
  logout: `${ipdConfig.baseUrl}/logout`,
  validateSession: `${ipdConfig.apiUrl}/auth/validate`,
  refreshTokens: `${ipdConfig.apiUrl}/auth/refresh`,

  // User management
  userProfile: `${ipdConfig.apiUrl}/user/profile`,
  userPermissions: `${ipdConfig.apiUrl}/user/permissions`,

  // Tenant management
  switchTenant: `${ipdConfig.apiUrl}/tenant/switch`,
  userTenants: `${ipdConfig.apiUrl}/user/tenants`,

  // Integration
  validateCookies: `${ipdConfig.apiUrl}/integration/validate-cookies`,
} as const;

/**
 * Expected structure of IPD user claims
 * This will need to be updated based on actual IPD implementation
 */
export interface IPDUserClaims {
  userId: string;
  email: string;
  name: string;
  role: string;
  currentTenant: {
    id: string;
    name: string;
    slug: string;
  };
  permissions: string[];
  tokenExpiry: number; // Unix timestamp
  sessionId: string;
}

/**
 * Cookie validation methods that IPD might support
 */
export enum IPDCookieValidationMethod {
  PUBLIC_KEY = 'public_key', // Validate using IPD's public key
  API_ENDPOINT = 'api_endpoint', // Call IPD API to validate
  SHARED_SECRET = 'shared_secret', // Validate using shared secret
}

/**
 * Configuration for cookie validation
 */
export const cookieValidationConfig = {
  method: env.IPD_VALIDATION_METHOD,
  publicKey: env.IPD_PUBLIC_KEY || '',
  sharedSecret: env.IPD_SHARED_SECRET || '',
  validationEndpoint: ipdEndpoints.validateCookies,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

/**
 * Helper function to check if IPD integration is enabled
 */
export function isIPDEnabled(): boolean {
  return env.NEXT_PUBLIC_AUTH_TYPE === 'ipd';
}

/**
 * Helper function to get the appropriate login URL based on auth type
 */
export function getLoginUrl(returnTo?: string): string {
  if (isIPDEnabled()) {
    const url = new URL(ipdEndpoints.login);
    if (returnTo) {
      url.searchParams.set('returnTo', returnTo);
    }
    return url.toString();
  }

  // Default to Auth0 login
  return `/api/auth/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`;
}

/**
 * Helper function to get the appropriate logout URL based on auth type
 */
export function getLogoutUrl(returnTo?: string): string {
  if (isIPDEnabled()) {
    const url = new URL(ipdEndpoints.logout);
    if (returnTo) {
      url.searchParams.set('returnTo', returnTo);
    }
    return url.toString();
  }

  // Default to Auth0 logout
  return `/api/auth/logout${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`;
}

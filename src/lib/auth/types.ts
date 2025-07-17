/**
 * Auth Provider Abstraction Types
 *
 * These interfaces define the contract that all auth providers (Auth0, IPD, etc.) must implement.
 * This abstraction allows us to swap auth providers with minimal code changes.
 */

import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Normalized user representation used throughout the application
 */
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  role: string;
}

/**
 * Normalized tenant representation
 */
export interface AuthTenant {
  id: string;
  slug: string;
  name: string;
}

/**
 * Normalized session data returned to the application
 */
export interface AuthSession {
  user: AuthUser;
  currentTenant?: AuthTenant;
  permissions: string[];
  tenants: AuthTenant[];
  expiresAt?: Date;
}

/**
 * Result of authentication operations
 */
export interface AuthResult {
  success: boolean;
  error?: string;
  session?: AuthSession;
}

/**
 * Configuration for auth providers
 */
export interface AuthProviderConfig {
  // Provider-specific configuration goes here
  [key: string]: any;
}

/**
 * Main auth provider interface that all providers must implement
 */
export interface AuthProvider {
  /**
   * Provider name for logging and debugging
   */
  name: string;

  /**
   * Get the current session from the request
   */
  getSession(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<AuthSession | null>;

  /**
   * Handle login callback (OAuth callback, form submission, etc.)
   */
  handleCallback(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<AuthResult>;

  /**
   * Handle logout
   */
  handleLogout(req: NextApiRequest, res: NextApiResponse): Promise<void>;

  /**
   * Get login URL
   */
  getLoginUrl(returnTo?: string): string;

  /**
   * Get logout URL
   */
  getLogoutUrl(returnTo?: string): string;

  /**
   * Validate if a session is still valid
   */
  validateSession(session: AuthSession): Promise<boolean>;

  /**
   * Refresh session if needed (for token-based auth)
   */
  refreshSession?(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<AuthSession | null>;

  /**
   * Provider-specific initialization
   */
  initialize?(): Promise<void>;

  /**
   * Provider-specific cleanup
   */
  cleanup?(): Promise<void>;
}

/**
 * Factory function type for creating auth providers
 */
export type AuthProviderFactory = (config: AuthProviderConfig) => AuthProvider;

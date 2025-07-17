/**
 * Auth0 Provider Implementation
 *
 * This provider handles authentication using Auth0.
 * All Auth0-specific logic is encapsulated here.
 */

import {
  handleAuth,
  handleCallback,
  getSession as getAuth0Session,
  Session,
} from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import {
  AuthProvider,
  AuthSession,
  AuthResult,
  AuthProviderConfig,
  AuthUser,
  AuthTenant,
} from '../types';
import { upsertUser } from '@/repositories/userRepository';
import { auditAuthEvent } from '@/server/monitoring/audit-logger';
import { getClientIp } from '@/utils/network';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { environment } from '@/config/environment';

const apiLogger = createApiLogger('auth0-provider');

export class Auth0Provider implements AuthProvider {
  name = 'auth0';

  constructor(private config: AuthProviderConfig) {
    // Configuration can be passed here if needed
  }

  async getSession(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<AuthSession | null> {
    try {
      const session = await getAuth0Session(req, res);
      if (!session?.user) return null;

      // Normalize Auth0 session to our standard format
      const user: AuthUser = {
        id: session.user.sub!,
        email: session.user.email!,
        name: session.user.name || undefined,
        picture: session.user.picture || undefined,
        role: session.user.role || 'USER',
      };

      // Extract tenant information from Auth0 custom claims
      const currentTenant: AuthTenant | undefined = session.user[
        'https://patentdraft/tenant_id'
      ]
        ? {
            id: session.user['https://patentdraft/tenant_id'],
            slug: session.user['https://patentdraft/tenant_slug'] || '',
            name: session.user['https://patentdraft/tenant_name'] || '',
          }
        : undefined;

      // Extract permissions and tenants
      const permissions: string[] =
        session.user['https://patentdraft/permissions'] || [];
      const tenants: AuthTenant[] =
        session.user['https://patentdraft/tenants'] || [];

      return {
        user,
        currentTenant,
        permissions,
        tenants,
        expiresAt: session.expiresAt ? new Date(session.expiresAt) : undefined,
      };
    } catch (error) {
      apiLogger.debug('No Auth0 session found', { error });
      return null;
    }
  }

  async handleCallback(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<AuthResult> {
    try {
      // Handle the callback using Auth0's handleCallback directly
      await handleCallback(req, res, {
        afterCallback: this.createAfterCallbackHandler(),
      });

      const session = await this.getSession(req, res);

      if (!session) {
        return {
          success: false,
          error: 'Failed to establish session after callback',
        };
      }

      return {
        success: true,
        session,
      };
    } catch (error) {
      apiLogger.error('Auth0 callback error', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  async handleLogout(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    // For Auth0, we need to clear the session and redirect
    const returnTo = (req.query.returnTo as string) || '/';
    const logoutUrl = new URL(`${environment.auth.domain}/v2/logout`);
    logoutUrl.searchParams.set('client_id', environment.auth.clientId);
    logoutUrl.searchParams.set('returnTo', `${environment.appUrl}${returnTo}`);

    res.redirect(logoutUrl.toString());
  }

  getLoginUrl(returnTo?: string): string {
    return `/api/auth/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`;
  }

  getLogoutUrl(returnTo?: string): string {
    return `/api/auth/logout${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`;
  }

  async validateSession(session: AuthSession): Promise<boolean> {
    // Check if session has expired
    if (session.expiresAt && new Date() > session.expiresAt) {
      return false;
    }
    return true;
  }

  /**
   * Create the Auth0 afterCallback handler with our custom logic
   */
  private createAfterCallbackHandler() {
    return async (
      req: NextApiRequest,
      res: NextApiResponse,
      session: Session
    ) => {
      if (!session?.user?.sub) {
        apiLogger.error('No Auth0 user ID found in session');
        await auditAuthEvent(
          undefined,
          'failed_login',
          getClientIp(req),
          req.headers['user-agent'] as string,
          { reason: 'No Auth0 user ID in session' },
          false
        );
        return session;
      }

      const auth0UserId = session.user.sub;

      try {
        // Create or update user in database
        const uniqueId = randomUUID();
        const user = await this.withDatabaseRetry(async () => {
          return upsertUser(
            auth0UserId,
            {
              id: auth0UserId,
              email: session.user.email || '',
              name: session.user.name || '',
              role: 'USER',
              resetToken: `auth0-reset-${uniqueId}`,
              verificationToken: `auth0-verify-${uniqueId}`,
            },
            {
              lastLogin: new Date(),
            }
          );
        });

        // Audit successful login
        await auditAuthEvent(
          user.id,
          'login',
          getClientIp(req),
          req.headers['user-agent'] as string,
          {
            authProvider: 'auth0',
            email: user.email,
            firstLogin: user.createdAt.getTime() === user.updatedAt.getTime(),
          },
          true
        );

        // Enhance session with database user info
        session.user = {
          ...session.user,
          id: user.id,
          role: user.role,
          email: user.email,
          name: user.name || session.user.name,
        };

        return session;
      } catch (error) {
        apiLogger.error('Error processing Auth0 callback', { error });
        await auditAuthEvent(
          auth0UserId,
          'failed_login',
          getClientIp(req),
          req.headers['user-agent'] as string,
          {
            reason: 'Database error during user upsert',
            error: error instanceof Error ? error.message : String(error),
          },
          false
        );
        return session;
      }
    };
  }

  /**
   * Database retry helper
   */
  private async withDatabaseRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3
  ): Promise<T> {
    let retries = maxRetries;

    while (true) {
      try {
        return await operation();
      } catch (error) {
        if (retries <= 0) {
          apiLogger.error('Database operation failed after retries', { error });
          throw error;
        }

        retries--;
        apiLogger.warn('Database operation failed, retrying...', {
          retriesLeft: retries,
          error,
        });
        await new Promise<void>(resolve => {
          setTimeout(() => resolve(), 0);
        });
      }
    }
  }
}

import { NextApiRequest, NextApiResponse } from 'next';
// TODO: Remove when IPD Identity integration is complete - using wrapper instead
import { getSession } from '@/lib/auth/getSession';
// Remove direct PrismaClient import
// import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

// Import repository functions
import {
  findUserById,
  updateUser,
  createUser,
} from '../repositories/userRepository';
import {
  findTenantBySlug,
  ensureUserTenantAccess,
  getUserTenantRelationship,
  findTenantsByUserId,
} from '../repositories/tenantRepository';
import {
  updateSessionActivity,
  findActiveSessionByUserId,
  deleteSession,
} from '../repositories/sessionRepository';
import { CSRF_CONFIG } from '../config/security';
import { logger } from '@/server/logger';
import {
  AuthenticatedRequest,
  ApiHandler,
  ComposedHandler,
} from '@/types/middleware';
import { authenticateInternalService } from '@/lib/auth/internalServiceAuth';
import { environment } from '@/config/environment';
import { AuditService } from '@/server/services/audit.server-service';

// Extend NextApiRequest to include user
// declare module 'next' {
//   interface NextApiRequest {
//     user?: {
//       id: string;
//       email: string;
//       role: string;
//       tenantId?: string;
//     };
//     userId?: string;
//   }
// }

// Type guard function is no longer needed since we won't be using PrismaClient directly
// function isPrismaClient(value: unknown): value is PrismaClient {
//   return value !== null && value !== undefined && typeof value === 'object' && 'user' in value;
// }

// Session timeout configuration
const SESSION_TIMEOUT_MS =
  environment.security.sessionTimeoutMinutes * 60 * 1000; // Convert minutes to ms
const SESSION_ABSOLUTE_TIMEOUT_MS =
  environment.security.sessionAbsoluteTimeoutHours * 60 * 60 * 1000; // Convert hours to ms

/**
 * Consolidated authentication middleware for API routes using Auth0
 *
 * @param handler - The API request handler function
 * @param options - Configuration options
 */
export function withAuth<T = unknown>(
  handler: ApiHandler<T>,
  options: {
    requireAuth?: boolean;
    csrfCheck?: boolean;
  } = {}
): ComposedHandler {
  // Default options
  const { requireAuth = true, csrfCheck = true } = options;

  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Cast to AuthenticatedRequest for type safety
    const authReq = req as AuthenticatedRequest;

    try {
      // Skip auth check if not required
      if (!requireAuth) {
        // Properly type the handler call
        return (
          handler as (
            req: AuthenticatedRequest,
            res: NextApiResponse
          ) => void | Promise<void>
        )(req as AuthenticatedRequest, res);
      }

      // Check for internal service authentication (OAuth only)
      const internalAuth = await authenticateInternalService(req);
      if (internalAuth.isAuthenticated && internalAuth.serviceAccount) {
        // Handle OAuth service accounts
        authReq.user = {
          id: `service:${internalAuth.serviceAccount.clientId}`,
          email: `${internalAuth.serviceAccount.clientId}@service.internal`,
          role: 'INTERNAL_SERVICE',
          tenantId: internalAuth.serviceAccount.tenantId,
        };

        // Store service account info for permission checks
        (
          authReq as AuthenticatedRequest & {
            serviceAccount?: typeof internalAuth.serviceAccount;
          }
        ).serviceAccount = internalAuth.serviceAccount;

        // For internal services, tenant context is required for data operations
        if (
          !authReq.user.tenantId &&
          ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || '')
        ) {
          logger.warn('Internal service request missing tenant context', {
            path: req.url,
            method: req.method,
            isLegacy: internalAuth.isLegacy,
          });
          return res.status(400).json({
            error: 'Tenant context required for internal service operations',
          });
        }

        // Properly type the handler call
        return (
          handler as (
            req: AuthenticatedRequest,
            res: NextApiResponse
          ) => void | Promise<void>
        )(authReq, res);
      }

      // Check for session (supports both cookies and future Authorization header)
      // getSession internally handles both cookie-based and bearer token auth
      const session = await getSession(req, res);

      if (!session?.user) {
        logger.warn('Unauthorized access attempt', {
          path: req.url,
          method: req.method,
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        });
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check session timeout (only for non-service accounts)
      if (!internalAuth.isAuthenticated && session.user?.id) {
        // For Auth0 sessions, we track by user ID since we don't have direct access to session tokens
        const activeSession = await findActiveSessionByUserId(session.user.id);

        if (activeSession) {
          const now = new Date();
          const lastActivity = new Date(activeSession.lastActivity);
          const sessionCreated = new Date(activeSession.createdAt);

          // Check inactivity timeout
          const inactivityDuration = now.getTime() - lastActivity.getTime();
          if (inactivityDuration > SESSION_TIMEOUT_MS) {
            logger.warn('Session expired due to inactivity', {
              userId: session.user.id,
              sessionId: activeSession.id,
              lastActivity: lastActivity.toISOString(),
              inactivityMinutes: Math.floor(inactivityDuration / 60000),
            });

            // Clean up the expired session
            await deleteSession(activeSession.id);

            return res.status(401).json({
              error: 'Session expired due to inactivity',
              code: 'SESSION_TIMEOUT',
            });
          }

          // Check absolute session timeout
          const sessionAge = now.getTime() - sessionCreated.getTime();
          if (sessionAge > SESSION_ABSOLUTE_TIMEOUT_MS) {
            logger.warn('Session expired due to absolute timeout', {
              userId: session.user.id,
              sessionId: activeSession.id,
              created: sessionCreated.toISOString(),
              ageHours: Math.floor(sessionAge / 3600000),
            });

            // Clean up the expired session
            await deleteSession(activeSession.id);

            return res.status(401).json({
              error: 'Session expired',
              code: 'SESSION_ABSOLUTE_TIMEOUT',
            });
          }

          // Update last activity for non-GET requests or every 5 minutes for GET
          const shouldUpdateActivity =
            req.method !== 'GET' || inactivityDuration > 5 * 60 * 1000; // 5 minutes

          if (shouldUpdateActivity) {
            await updateSessionActivity(activeSession.id);
          }
        }
      }

      try {
        // First, check if the user exists using repository
        // Using user.id from normalized auth
        const existingUser = await findUserById(session.user.id);

        let userDbRecord;
        if (existingUser) {
          // Only update existing user using repository
          userDbRecord = await updateUser(session.user.id, {
            email: session.user.email || '',
            name: session.user.name || null,
            lastLogin: new Date(),
          });
        } else {
          // Generate unique tokens to avoid NULL uniqueness issues
          const uniqueId = randomUUID();

          // Create new user with unique tokens using repository
          userDbRecord = await createUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.name || null,
            role: 'USER',
            lastLogin: new Date(),
            resetToken: `reset-${uniqueId}`,
            verificationToken: `verify-${uniqueId}`,
          });
          logger.info('Created new user:', { userId: userDbRecord.id });

          // Audit log the new user creation
          await AuditService.logApiAction(req, {
            action: 'user.create',
            resourceType: 'user',
            resourceId: userDbRecord.id,
            metadata: {
              email: userDbRecord.email,
              source: 'auth0',
            },
            success: true,
          });

          // For new users, try to assign them to a default tenant
          let defaultTenant = await findTenantBySlug('default');

          // If no default tenant found, try to find by a test/demo tenant
          if (!defaultTenant) {
            defaultTenant = await findTenantBySlug('test-tenant');
          }

          if (defaultTenant) {
            // Assign the new user to the default tenant
            await ensureUserTenantAccess(
              userDbRecord.id,
              defaultTenant.id,
              'USER'
            );
            logger.info('Assigned new user to default tenant', {
              userId: userDbRecord.id,
              tenantId: defaultTenant.id,
            });
          } else {
            // New users don't get automatic tenant access - must be granted by admin
            logger.info(
              'New user created without tenant access - admin assignment required',
              {
                userId: userDbRecord.id,
                email: userDbRecord.email,
              }
            );
          }
        }

        let userTenantId: string | undefined = undefined;
        let userTenantEntry: { tenantId: string; role: string } | null = null;
        if (userDbRecord) {
          // Get tenant slug from headers
          const requestedTenantSlug = req.headers['x-tenant-slug'];

          // Get all tenants for the user
          const userTenants = await findTenantsByUserId(userDbRecord.id);

          if (userTenants.length > 0) {
            let selectedTenant;

            // If a specific tenant is requested via header, try to use that
            if (
              requestedTenantSlug &&
              typeof requestedTenantSlug === 'string'
            ) {
              selectedTenant = userTenants.find(
                t => t.slug === requestedTenantSlug
              );

              if (!selectedTenant) {
                logger.warn(
                  `User ${userDbRecord.id} requested tenant '${requestedTenantSlug}' but doesn't have access to it`
                );
              }
            }

            // If no specific tenant requested or user doesn't have access, use the first one
            if (!selectedTenant) {
              selectedTenant = userTenants[0];
              logger.debug(
                `Using default tenant '${selectedTenant.slug}' for user ${userDbRecord.id}`
              );
            }

            userTenantId = selectedTenant.id;

            // Get the role for this tenant
            const relationship = await getUserTenantRelationship(
              userDbRecord.id,
              selectedTenant.id
            );
            if (relationship) {
              userTenantEntry = {
                tenantId: relationship.tenantId,
                role: relationship.role,
              };
            }
          } else {
            logger.warn(
              `User ${userDbRecord.id} is not associated with any tenant in UserTenant table.`
            );
          }
        }

        // Add user to request
        authReq.user = {
          id: userDbRecord.id,
          email: userDbRecord.email,
          role: userTenantEntry?.role ?? userDbRecord.role,
          tenantId: userTenantId,
        };

        // Check CSRF token for mutation requests if enabled
        if (
          csrfCheck &&
          ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || '')
        ) {
          // Get the CSRF token from the request using configured names
          const csrfToken =
            req.headers[CSRF_CONFIG.HEADER_NAME] ||
            req.cookies[CSRF_CONFIG.COOKIE_NAME];
          const csrfFromSession = req.cookies[CSRF_CONFIG.COOKIE_NAME];

          // Simple CSRF validation
          if (!csrfToken || csrfToken !== csrfFromSession) {
            logger.warn('CSRF token validation failed', {
              path: req.url,
              method: req.method,
              hasToken: !!csrfToken,
              hasSessionToken: !!csrfFromSession,
            });

            // Always return 403 on failure, regardless of environment
            return res
              .status(403)
              .json({ error: 'CSRF token validation failed' });
          }
        }

        // Properly type the handler call
        return (
          handler as (
            req: AuthenticatedRequest,
            res: NextApiResponse
          ) => void | Promise<void>
        )(authReq, res);
      } catch (error) {
        logger.error('Auth middleware database error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    } catch (error) {
      logger.error('Auth middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

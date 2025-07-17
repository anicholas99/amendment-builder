/**
 * Session Security Middleware
 *
 * Provides comprehensive session management including:
 * - Session timeout enforcement
 * - Concurrent session limits
 * - Session invalidation on password change
 * - Activity tracking
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { Session } from '@prisma/client';

// Configuration constants
const SESSION_TIMEOUT_MINUTES = parseInt(
  process.env.SESSION_TIMEOUT_MINUTES || '30'
);
const MAX_CONCURRENT_SESSIONS = parseInt(
  process.env.MAX_CONCURRENT_SESSIONS || '5'
);
const ACTIVITY_UPDATE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

interface SessionData {
  userId: string;
  sessionToken: string;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Get client IP address from request
 */
function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

/**
 * Check if session has expired
 */
function isSessionExpired(lastActivity: Date): boolean {
  const now = new Date();
  const diffMinutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
  return diffMinutes > SESSION_TIMEOUT_MINUTES;
}

/**
 * Update session activity timestamp
 */
async function updateSessionActivity(
  sessionToken: string,
  prismaSession: Session | null
): Promise<void> {
  try {
    if (!prisma) {
      logger.warn('Prisma client not initialized');
      return;
    }

    const now = new Date();

    // Update in database less frequently
    if (prismaSession) {
      const lastUpdate = prismaSession.lastActivity;
      const timeSinceUpdate = now.getTime() - lastUpdate.getTime();

      if (timeSinceUpdate > ACTIVITY_UPDATE_INTERVAL_MS) {
        await prisma.session.update({
          where: { sessionToken },
          data: { lastActivity: now },
        });
      }
    }
  } catch (error) {
    logger.error('Failed to update session activity', { error, sessionToken });
  }
}

/**
 * Enforce concurrent session limits
 */
async function enforceSessionLimits(userId: string): Promise<void> {
  try {
    if (!prisma) {
      logger.warn('Prisma client not initialized');
      return;
    }

    // Get all active sessions for user
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expires: { gt: new Date() },
      },
      orderBy: { lastActivity: 'desc' },
    });

    // If over limit, expire oldest sessions
    if (sessions.length > MAX_CONCURRENT_SESSIONS) {
      const sessionsToExpire = sessions.slice(MAX_CONCURRENT_SESSIONS);
      const expiredDate = new Date(0); // Epoch

      await prisma.session.updateMany({
        where: {
          id: { in: sessionsToExpire.map(s => s.id) },
        },
        data: { expires: expiredDate },
      });

      logger.info('Expired sessions due to concurrent limit', {
        userId,
        expiredCount: sessionsToExpire.length,
      });
    }
  } catch (error) {
    logger.error('Failed to enforce session limits', { error, userId });
  }
}

/**
 * Session security middleware
 *
 * @param options - Configuration options
 * @returns Middleware function
 */
export function withSessionSecurity(
  options: {
    enforceTimeout?: boolean;
    enforceConcurrency?: boolean;
    trackActivity?: boolean;
  } = {}
) {
  const {
    enforceTimeout = true,
    enforceConcurrency = true,
    trackActivity = true,
  } = options;

  return (
    handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
  ) => {
    return async (req: AuthenticatedRequest, res: NextApiResponse) => {
      // Skip if no user (public endpoints)
      if (!req.user) {
        return handler(req, res);
      }

      const sessionToken =
        req.cookies?.['next-auth.session-token'] ||
        req.cookies?.['__Secure-next-auth.session-token'];

      if (!sessionToken) {
        logger.warn('Authenticated request without session token', {
          userId: req.user.id,
          path: req.url,
        });
        return res.status(401).json({ error: 'Invalid session' });
      }

      try {
        if (!prisma) {
          logger.error('Prisma client not initialized');
          return res.status(500).json({ error: 'Database connection error' });
        }

        // Get session from database
        const session = await prisma.session.findUnique({
          where: { sessionToken },
        });

        if (!session) {
          logger.warn('Session not found in database', {
            userId: req.user.id,
            sessionToken: sessionToken.substring(0, 8) + '...',
          });
          return res.status(401).json({ error: 'Session expired' });
        }

        // Check if session belongs to the authenticated user
        if (session.userId !== req.user.id) {
          logger.error('Session user mismatch', {
            sessionUserId: session.userId,
            requestUserId: req.user.id,
          });
          return res.status(401).json({ error: 'Invalid session' });
        }

        // Check session expiry in database
        if (session.expires < new Date()) {
          logger.info('Database session expired', {
            userId: req.user.id,
            expires: session.expires,
          });
          return res.status(401).json({ error: 'Session expired' });
        }

        // Check session timeout based on activity
        if (enforceTimeout) {
          const lastActivity = session.lastActivity;

          if (isSessionExpired(lastActivity)) {
            logger.info('Session timed out due to inactivity', {
              userId: req.user.id,
              lastActivity,
              timeoutMinutes: SESSION_TIMEOUT_MINUTES,
            });

            // Expire the session
            await prisma.session.update({
              where: { sessionToken },
              data: { expires: new Date(0) },
            });

            return res.status(401).json({ error: 'Session timed out' });
          }
        }

        // Enforce concurrent session limits
        if (enforceConcurrency) {
          await enforceSessionLimits(req.user.id);
        }

        // Track activity
        if (trackActivity) {
          // Update activity asynchronously to not block request
          updateSessionActivity(sessionToken, session).catch(error => {
            logger.error('Failed to update session activity', { error });
          });
        }

        // Add session info to request
        (req as AuthenticatedRequest & { session: SessionData }).session = {
          userId: session.userId,
          sessionToken: session.sessionToken,
          lastActivity: session.lastActivity,
          ipAddress: session.ipAddress || undefined,
          userAgent: session.userAgent || undefined,
        };

        // Continue to handler
        return handler(req, res);
      } catch (error) {
        logger.error('Session security middleware error', {
          error,
          userId: req.user.id,
          path: req.url,
        });

        // Don't expose internal errors
        return res.status(500).json({ error: 'Session validation failed' });
      }
    };
  };
}

/**
 * Invalidate all sessions for a user (e.g., on password change)
 */
export async function invalidateUserSessions(
  userId: string,
  exceptSessionToken?: string
): Promise<void> {
  try {
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database connection not available'
      );
    }

    logger.info('Invalidating user sessions', {
      userId,
      keepCurrent: !!exceptSessionToken,
    });

    // Get all active sessions
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expires: { gt: new Date() },
        ...(exceptSessionToken
          ? { sessionToken: { not: exceptSessionToken } }
          : {}),
      },
    });

    // Expire all sessions
    const expiredDate = new Date(0);
    await prisma.session.updateMany({
      where: {
        userId,
        ...(exceptSessionToken
          ? { sessionToken: { not: exceptSessionToken } }
          : {}),
      },
      data: { expires: expiredDate },
    });

    logger.info('User sessions invalidated', {
      userId,
      count: sessions.length,
    });
  } catch (error) {
    logger.error('Failed to invalidate user sessions', { error, userId });
    throw new ApplicationError(
      ErrorCode.INTERNAL_ERROR,
      'Failed to invalidate sessions'
    );
  }
}

/**
 * Get active sessions for a user
 */
export async function getUserActiveSessions(userId: string): Promise<{
  sessions: Array<{
    id: string;
    lastActivity: Date;
    ipAddress?: string;
    userAgent?: string;
    isCurrent?: boolean;
  }>;
  count: number;
}> {
  try {
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database connection not available'
      );
    }

    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expires: { gt: new Date() },
      },
      orderBy: { lastActivity: 'desc' },
    });

    const enrichedSessions = sessions.map(session => ({
      id: session.id,
      lastActivity: session.lastActivity,
      ipAddress: session.ipAddress || undefined,
      userAgent: session.userAgent || undefined,
    }));

    return {
      sessions: enrichedSessions,
      count: enrichedSessions.length,
    };
  } catch (error) {
    logger.error('Failed to get user sessions', { error, userId });
    throw new ApplicationError(
      ErrorCode.INTERNAL_ERROR,
      'Failed to retrieve sessions'
    );
  }
}

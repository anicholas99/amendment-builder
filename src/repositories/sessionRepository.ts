import { prisma } from '../lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { Session } from '@prisma/client';

/**
 * Find a session by its token
 * @param token The session token
 * @returns The session or null if not found
 */
export async function findSessionByToken(
  token: string
): Promise<Session | null> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    return await prisma.session.findUnique({
      where: { sessionToken: token },
    });
  } catch (error) {
    logger.error('Error finding session by token', { error });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      'Failed to find session'
    );
  }
}

/**
 * Update the lastActivity timestamp for a session
 * @param sessionId The session ID
 * @returns The updated session
 */
export async function updateSessionActivity(
  sessionId: string
): Promise<Session> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    return await prisma.session.update({
      where: { id: sessionId },
      data: { lastActivity: new Date() },
    });
  } catch (error) {
    logger.error('Error updating session activity', { sessionId, error });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      'Failed to update session activity'
    );
  }
}

/**
 * Find active session for a user
 * @param userId The user ID
 * @returns The most recent active session or null
 */
export async function findActiveSessionByUserId(
  userId: string
): Promise<Session | null> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() }, // Only check non-expired sessions
      },
      orderBy: { lastActivity: 'desc' },
      take: 1,
    });

    return sessions[0] || null;
  } catch (error) {
    logger.error('Error finding active session by user ID', { userId, error });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      'Failed to find active session'
    );
  }
}

/**
 * Delete a session
 * @param sessionId The session ID to delete
 * @returns The deleted session
 */
export async function deleteSession(sessionId: string): Promise<Session> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    return await prisma.session.delete({
      where: { id: sessionId },
    });
  } catch (error) {
    logger.error('Error deleting session', { sessionId, error });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      'Failed to delete session'
    );
  }
}

/**
 * Clean up expired sessions
 * @param inactivityMinutes Minutes of inactivity before expiration
 * @param absoluteHours Hours since creation before expiration
 * @returns Number of sessions deleted
 */
export async function cleanupExpiredSessions(
  inactivityMinutes: number = 30,
  absoluteHours: number = 8
): Promise<number> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  const now = new Date();
  const inactivityThreshold = new Date(
    now.getTime() - inactivityMinutes * 60 * 1000
  );
  const absoluteThreshold = new Date(
    now.getTime() - absoluteHours * 60 * 60 * 1000
  );

  try {
    const result = await prisma.session.deleteMany({
      where: {
        OR: [
          { lastActivity: { lt: inactivityThreshold } },
          { createdAt: { lt: absoluteThreshold } },
        ],
      },
    });

    if (result.count > 0) {
      logger.info('Cleaned up expired sessions', { count: result.count });
    }

    return result.count;
  } catch (error) {
    logger.error('Error cleaning up expired sessions', { error });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      'Failed to cleanup expired sessions'
    );
  }
}

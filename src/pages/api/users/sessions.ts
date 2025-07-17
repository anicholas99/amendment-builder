import { NextApiResponse } from 'next';
import { z } from 'zod';
import { AuthenticatedRequest } from '@/types/middleware';
import { SecurePresets } from '@/server/api/securePresets';
import {
  getUserActiveSessions,
  invalidateUserSessions,
} from '@/middleware/sessionSecurity';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';

// Schema for DELETE request body
const deleteSessionsSchema = z.object({
  action: z.enum(['invalidate-all', 'invalidate-others']),
});

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApplicationError(
      ErrorCode.AUTH_UNAUTHORIZED,
      'Authentication required'
    );
  }

  switch (req.method) {
    case 'GET':
      // Get all active sessions for the user
      try {
        const sessionData = await getUserActiveSessions(userId);

        logger.info('User sessions retrieved', {
          userId,
          sessionCount: sessionData.count,
        });

        return res.status(200).json({
          success: true,
          data: sessionData,
        });
      } catch (error) {
        logger.error('Failed to get user sessions', { error, userId });
        throw new ApplicationError(
          ErrorCode.INTERNAL_ERROR,
          'Failed to retrieve sessions'
        );
      }

    case 'DELETE':
      // Invalidate sessions based on action
      try {
        const { action } = req.body as z.infer<typeof deleteSessionsSchema>;

        const currentSessionToken =
          req.cookies?.['next-auth.session-token'] ||
          req.cookies?.['__Secure-next-auth.session-token'];

        if (action === 'invalidate-all') {
          // Invalidate all sessions including current
          await invalidateUserSessions(userId);
          logger.info('All user sessions invalidated', { userId });

          return res.status(200).json({
            success: true,
            data: {
              message:
                'All sessions have been invalidated. You will need to sign in again.',
            },
          });
        } else if (action === 'invalidate-others') {
          // Invalidate all sessions except current
          if (!currentSessionToken) {
            throw new ApplicationError(
              ErrorCode.INVALID_INPUT,
              'Current session token not found'
            );
          }

          await invalidateUserSessions(userId, currentSessionToken);
          logger.info('Other user sessions invalidated', { userId });

          return res.status(200).json({
            success: true,
            data: {
              message: 'All other sessions have been invalidated.',
            },
          });
        } else {
          throw new ApplicationError(
            ErrorCode.INVALID_INPUT,
            'Invalid action specified'
          );
        }
      } catch (error) {
        if (error instanceof ApplicationError) {
          throw error;
        }
        logger.error('Failed to invalidate sessions', { error, userId });
        throw new ApplicationError(
          ErrorCode.INTERNAL_ERROR,
          'Failed to invalidate sessions'
        );
      }

    default:
      res.setHeader('Allow', ['GET', 'DELETE']);
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// SECURITY: This endpoint allows users to manage their own sessions
// Session security is enforced by default
export default SecurePresets.userPrivate(handler, {
  validate: {
    body: deleteSessionsSchema,
    bodyMethods: ['DELETE'],
  },
  rateLimit: 'api',
});

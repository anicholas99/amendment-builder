// Note: This Auth0 handler will be replaced when migrating to IPD Identity
// This file handles Auth0 login callbacks and will be replaced by IPD Identity's OAuth flow

import { handleAuth, handleCallback } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { Session, AfterCallback } from '@auth0/nextjs-auth0';
import { randomUUID } from 'crypto';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { withEnhancedRateLimit } from '@/lib/security/enhancedRateLimit';
import {
  findUserById,
  createUser,
  updateUser,
  upsertUser,
} from '../../../repositories/userRepository';

const apiLogger = createApiLogger('auth/callback');

// Helper function for database retry logic
async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let retries = maxRetries;
  const RETRY_DELAY = 1000; // 1 second

  while (true) {
    try {
      return await operation();
    } catch (error: unknown) {
      if (retries <= 0) {
        apiLogger.error('Database operation failed after multiple retries', {
          error: error instanceof Error ? error : new Error(String(error)),
        });
        throw error;
      }

      retries--;
      apiLogger.warn(`Database operation failed, retrying...`, {
        retriesLeft: retries,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      await new Promise<void>(resolve => {
        setImmediate(() => resolve());
      });
    }
  }
}

// Wrap the callback handler to add our custom logic
const afterCallback: AfterCallback = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) => {
  apiLogger.info('Auth0 callback initiated', { sessionId: session?.idToken });

  if (!session?.user?.sub) {
    apiLogger.error('No Auth0 user ID (sub) found in session after callback');
    return session;
  }

  const auth0UserId = session.user.sub;
  apiLogger.info('Processing callback for user', { auth0UserId });

  try {
    const uniqueId = randomUUID();
    const email = session.user.email || '';
    const name = session.user.name || '';

    apiLogger.info('Attempting to upsert user in database', {
      auth0UserId,
      email,
    });

    const user = await withDatabaseRetry(async () => {
      return upsertUser(
        auth0UserId,
        // Create data if user doesn't exist
        {
          id: auth0UserId,
          email: email,
          name: name,
          role: 'USER',
          resetToken: `auth0-reset-${uniqueId}`,
          verificationToken: `auth0-verify-${uniqueId}`,
        },
        // Update data if user exists
        {
          lastLogin: new Date(),
        }
      );
    });

    apiLogger.info(`User upserted successfully`, {
      userId: user.id,
      email: user.email,
    });

    // Ensure session has all required fields from our DB record
    session.user = {
      ...session.user,
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name || session.user.name,
    };

    apiLogger.info('Session updated with user data from database', {
      userId: user.id,
    });

    return session;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    apiLogger.error('Error processing Auth0 callback and upserting user', {
      auth0UserId,
      error: err,
    });
    return session;
  }
};

// Apply rate limiting to the auth handler
const rateLimitedHandler = withEnhancedRateLimit('auth')(handleAuth({
  async callback(req: NextApiRequest, res: NextApiResponse) {
    apiLogger.info('Handling Auth0 callback request');
    try {
      await handleCallback(req, res, { afterCallback });
      apiLogger.info('Auth0 callback handled successfully by SDK');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      apiLogger.error('Critical error in Auth0 callback handler', {
        error: err,
      });
      if (!res.headersSent) {
        res
          .status(500)
          .end('Internal Server Error during authentication callback');
      }
    }
  },
}));

export default rateLimitedHandler;

// Note: This is an Auth0 OAuth handler endpoint that must remain public
// No RBAC or authentication middleware can be applied as this handles the authentication flow itself

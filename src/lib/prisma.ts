import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/monitoring/logger';
import { env } from '@/config/env';
import { environment } from '@/config/environment';
import { softDeleteMiddleware } from '@/lib/db/soft-delete-middleware';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-prisma-client-js-errors

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Check if we're on the server side
const isServer = typeof window === 'undefined';

// Track if we've already logged the Prisma client creation
let hasLoggedPrismaCreation = false;

// Create Prisma client with better logging
const createPrismaClient = () => {
  // Only log Prisma client creation once, unless in debug mode
  if (!hasLoggedPrismaCreation || environment.isDevelopment) {
    logger.debug('[PRISMA] Creating new Prisma Client:', {
      database_url_exists: !!env.DATABASE_URL,
      database_url_preview: env.DATABASE_URL
        ? env.DATABASE_URL.substring(0, 30) + '...'
        : 'NOT SET',
      node_env: env.NODE_ENV,
    });
    hasLoggedPrismaCreation = true;
  }

  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }

  const client = new PrismaClient({
    log: environment.isDevelopment ? ['error'] : ['error'],
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
  });

  // Add soft delete middleware
  client.$use(softDeleteMiddleware);

  return client;
};

// Initialize Prisma client
let prisma: PrismaClient | undefined;

if (isServer) {
  // Only initialize Prisma on the server side
  if (environment.isProduction) {
    prisma = createPrismaClient();
  } else {
    // In development, reuse the existing instance if available
    if (!global.prisma) {
      global.prisma = createPrismaClient();

      // Test the connection only when creating a new instance
      (async () => {
        try {
          await global.prisma!.$connect();
          logger.debug('Successfully connected to database');
        } catch (error: unknown) {
          logger.error('Failed to connect to database:', {
            error: error instanceof Error ? error : undefined,
          });
        }
      })();
    }
    prisma = global.prisma;
  }
}

// Export the single Prisma client instance
export { prisma };

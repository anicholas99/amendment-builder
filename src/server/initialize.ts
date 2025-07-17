/**
 * Server Initialization
 *
 * This module handles server startup tasks including environment validation.
 * It runs automatically when the server starts.
 */

import { validateEnvironment } from '@/config/environment-validation';
import { logger } from '@/server/logger';
import { initializeServerLogging } from '@/utils/serverLogging';
import { SessionCleanupService } from '@/server/services/sessionCleanupService';
import { isNodeRuntime, isTest, isProduction, isServer } from '@/utils/runtime';

// Track if initialization has run
let initialized = false;

/**
 * Initialize server components
 */
export async function initializeServer(): Promise<void> {
  if (initialized) {
    return;
  }

  try {
    logger.info('Starting server initialization...');

    // Step 1: Validate environment variables
    logger.info('Validating environment variables...');
    validateEnvironment();

    // Future initialization steps can be added here:
    // - Database connection validation
    // - External service health checks
    // - Cache warming
    // - etc.

    initialized = true;
    logger.info('Server initialization completed successfully');

    // Initialize logging first
    initializeServerLogging();

    // Start background services only in Node.js runtime
    if (!isTest() && isNodeRuntime()) {
      // Start session cleanup scheduler in non-test environments
      SessionCleanupService.startScheduler();
      logger.info('Background services started');

      // Note: Graceful shutdown handlers are not implemented to maintain
      // Edge Runtime compatibility. The session cleanup will stop automatically
      // when the process ends.
    } else if (!isNodeRuntime()) {
      logger.debug('Skipping background services - not in Node.js runtime');
    }
  } catch (error) {
    logger.error('Server initialization failed', { error });

    // In production, fail fast on initialization errors
    if (isProduction()) {
      // In Edge Runtime, we can't use process.exit() - throw instead
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(
        `Critical server initialization failure: ${errorMessage}`
      );
    }

    throw error;
  }
}

// Run initialization if this is imported in a server context
if (isServer()) {
  initializeServer().catch(error => {
    logger.error('Failed to initialize server', { error });
    if (isProduction()) {
      // In Edge Runtime, we can't use process.exit() - throw instead
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Server startup failure: ${errorMessage}`);
    }
    // In development, continue with degraded functionality
  });
}

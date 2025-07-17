import { cleanupExpiredSessions } from '@/repositories/sessionRepository';
import { logger } from '@/server/logger';
import { environment } from '@/config/environment';
import { isNodeRuntime } from '@/utils/runtime';

/**
 * Service for managing session cleanup
 *
 * NOTE: This service does not register process-level shutdown handlers (SIGTERM, SIGINT)
 * to maintain compatibility with Next.js Edge Runtime. The cleanup interval will be
 * automatically cleared when the process ends.
 *
 * For production deployments using Node.js runtime, you can add graceful shutdown
 * handling in your deployment scripts or process manager (e.g., PM2, Docker).
 */
export class SessionCleanupService {
  private static cleanupInterval: NodeJS.Timeout | null = null;
  private static shutdownHandlersRegistered = false;

  /**
   * Start the session cleanup scheduler
   */
  static startScheduler(): void {
    if (this.cleanupInterval) {
      logger.warn('Session cleanup scheduler already running');
      return;
    }

    // Run cleanup every hour
    const intervalMs = 60 * 60 * 1000; // 1 hour

    // Initial cleanup on startup
    this.runCleanup();

    // Schedule periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.runCleanup();
    }, intervalMs);

    logger.info('Session cleanup scheduler started', { intervalMs });

    // Register shutdown handlers once (only in Node.js runtime)
    if (!this.shutdownHandlersRegistered && isNodeRuntime()) {
      this.registerShutdownHandlers();
      this.shutdownHandlersRegistered = true;
    }
  }

  /**
   * Register graceful shutdown handlers (Node.js runtime only)
   */
  private static registerShutdownHandlers(): void {
    // Only register in Node.js runtime, not Edge Runtime
    if (!isNodeRuntime()) {
      logger.debug('Not in Node.js runtime - skipping shutdown handlers');
      return;
    }

    // Shutdown handlers are registered in server initialization
    // to avoid Edge Runtime compatibility issues
    logger.debug('Shutdown handling delegated to server initialization');
  }

  /**
   * Stop the session cleanup scheduler
   */
  static stopScheduler(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      logger.info('Session cleanup scheduler stopped');
    }
  }

  /**
   * Run session cleanup
   */
  private static async runCleanup(): Promise<void> {
    try {
      logger.debug('Starting session cleanup');

      const deletedCount = await cleanupExpiredSessions(
        environment.security.sessionTimeoutMinutes,
        environment.security.sessionAbsoluteTimeoutHours
      );

      if (deletedCount > 0) {
        logger.info('Session cleanup completed', {
          deletedSessions: deletedCount,
        });
      }
    } catch (error) {
      logger.error('Session cleanup failed', { error });
    }
  }

  /**
   * Manually trigger session cleanup (for testing or admin operations)
   */
  static async cleanupNow(): Promise<number> {
    logger.info('Manual session cleanup triggered');

    try {
      const deletedCount = await cleanupExpiredSessions(
        environment.security.sessionTimeoutMinutes,
        environment.security.sessionAbsoluteTimeoutHours
      );

      logger.info('Manual session cleanup completed', {
        deletedSessions: deletedCount,
      });

      return deletedCount;
    } catch (error) {
      logger.error('Manual session cleanup failed', { error });
      throw error;
    }
  }
}

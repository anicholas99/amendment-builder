/**
 * Job Processor Worker
 * 
 * Simple worker process that polls and executes background jobs
 * Run with: npm run worker
 */

import { logger } from '@/server/logger';
import { OfficeActionOrchestrationJob } from '@/server/jobs/office-action-orchestration.job';

// Graceful shutdown handling
let isShuttingDown = false;
let processingInterval: NodeJS.Timeout | null = null;

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

async function gracefulShutdown() {
  if (isShuttingDown) return;
  
  isShuttingDown = true;
  logger.info('[JobProcessor] Shutting down gracefully...');
  
  if (processingInterval) {
    clearInterval(processingInterval);
  }
  
  // Wait for current job to complete (max 30 seconds)
  setTimeout(() => {
    logger.info('[JobProcessor] Shutdown complete');
    process.exit(0);
  }, 30000);
}

/**
 * Main worker loop
 */
async function startWorker() {
  logger.info('[JobProcessor] Starting job processor worker');
  
  // Process jobs every 5 seconds
  const POLL_INTERVAL = 5000;
  
  processingInterval = setInterval(async () => {
    if (isShuttingDown) return;
    
    try {
      await OfficeActionOrchestrationJob.processPendingJobs();
    } catch (error) {
      logger.error('[JobProcessor] Error processing jobs', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, POLL_INTERVAL);
  
  // Run cleanup daily
  setInterval(async () => {
    if (isShuttingDown) return;
    
    try {
      await OfficeActionOrchestrationJob.cleanupOldJobs(30);
    } catch (error) {
      logger.error('[JobProcessor] Error cleaning up old jobs', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, 24 * 60 * 60 * 1000); // 24 hours
  
  // Process immediately on startup
  try {
    await OfficeActionOrchestrationJob.processPendingJobs();
  } catch (error) {
    logger.error('[JobProcessor] Initial job processing failed', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// Start the worker
startWorker().catch(error => {
  logger.error('[JobProcessor] Failed to start worker', {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
}); 
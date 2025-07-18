/**
 * Office Action Orchestration Job
 * 
 * Background job processor for office action analysis pipeline
 * Uses database-backed queue for reliability without external dependencies
 */

import { logger } from '@/server/logger';
import { prisma } from '@/lib/prisma';
import { ApplicationError, ErrorCode } from '@/lib/error';

// ============ JOB QUEUE TABLE (add to schema) ============
// model JobQueue {
//   id            String   @id @default(uuid())
//   type          String   // 'OFFICE_ACTION_ORCHESTRATION'
//   payload       String   @db.NVarChar(Max) // JSON payload
//   status        String   @default("PENDING") // PENDING, PROCESSING, COMPLETED, FAILED
//   attempts      Int      @default(0)
//   maxAttempts   Int      @default(3)
//   lastError     String?  @db.NVarChar(Max)
//   scheduledAt   DateTime @default(now())
//   startedAt     DateTime?
//   completedAt   DateTime?
//   createdAt     DateTime @default(now())
//   
//   @@index([type, status, scheduledAt])
//   @@map("job_queue")
// }

// ============ TYPES ============

export interface OrchestratorJobPayload {
  officeActionId: string;
  projectId: string;
  tenantId: string;
}

// ============ JOB QUEUE SERVICE ============

export class OfficeActionOrchestrationJob {
  private static readonly JOB_TYPE = 'OFFICE_ACTION_ORCHESTRATION';
  private static readonly LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
  
  /**
   * Queue a new orchestration job
   */
  static async enqueue(payload: OrchestratorJobPayload): Promise<string> {
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client is not initialized.'
      );
    }

    try {
      const job = await prisma.jobQueue.create({
        data: {
          type: this.JOB_TYPE,
          payload: JSON.stringify(payload),
          status: 'PENDING',
          maxAttempts: 3,
        },
      });

      logger.info('[OrchestrationJob] Job enqueued', {
        jobId: job.id,
        officeActionId: payload.officeActionId,
      });

      return job.id;
    } catch (error) {
      logger.error('[OrchestrationJob] Failed to enqueue job', {
        error: error instanceof Error ? error.message : String(error),
        payload,
      });
      throw new ApplicationError(
        ErrorCode.DB_QUERY_ERROR,
        'Failed to enqueue orchestration job'
      );
    }
  }

  /**
   * Process pending jobs (called by worker/cron)
   */
  static async processPendingJobs(): Promise<void> {
    if (!prisma) {
      return;
    }

    try {
      // Find and lock a pending job
      const job = await prisma.jobQueue.findFirst({
        where: {
          type: this.JOB_TYPE,
          status: 'PENDING',
          scheduledAt: { lte: new Date() },
          attempts: { lt: prisma.jobQueue.fields.maxAttempts },
        },
        orderBy: { scheduledAt: 'asc' },
      });

      if (!job) {
        return; // No pending jobs
      }

      // Update to PROCESSING with optimistic locking
      const updatedJob = await prisma.jobQueue.updateMany({
        where: {
          id: job.id,
          status: 'PENDING', // Ensure it's still pending
        },
        data: {
          status: 'PROCESSING',
          startedAt: new Date(),
          attempts: { increment: 1 },
        },
      });

      if (updatedJob.count === 0) {
        // Another worker grabbed it
        return;
      }

      logger.info('[OrchestrationJob] Processing job', {
        jobId: job.id,
        attempt: job.attempts + 1,
      });

      // Process the job
      try {
        const payload = JSON.parse(job.payload) as OrchestratorJobPayload;
        
        // Import orchestrator dynamically to avoid circular deps
        const { OfficeActionOrchestratorService } = await import('../services/office-action-orchestrator.server-service');
        
        const result = await OfficeActionOrchestratorService.orchestrateOfficeActionAnalysis(
          payload.officeActionId,
          payload.projectId,
          payload.tenantId
        );

        // Mark as completed
        await prisma.jobQueue.update({
          where: { id: job.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });

        logger.info('[OrchestrationJob] Job completed successfully', {
          jobId: job.id,
          stepsCompleted: result.stepsCompleted,
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        logger.error('[OrchestrationJob] Job processing failed', {
          jobId: job.id,
          error: errorMessage,
          attempt: job.attempts + 1,
        });

        // Check if we should retry
        const shouldRetry = job.attempts + 1 < job.maxAttempts;
        
        await prisma.jobQueue.update({
          where: { id: job.id },
          data: {
            status: shouldRetry ? 'PENDING' : 'FAILED',
            lastError: errorMessage,
            // Exponential backoff for retries
            scheduledAt: shouldRetry 
              ? new Date(Date.now() + Math.pow(2, job.attempts) * 60 * 1000)
              : undefined,
          },
        });
      }

    } catch (error) {
      logger.error('[OrchestrationJob] Failed to process jobs', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Clean up old completed/failed jobs
   */
  static async cleanupOldJobs(daysToKeep: number = 30): Promise<void> {
    if (!prisma) {
      return;
    }

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await prisma.jobQueue.deleteMany({
        where: {
          type: this.JOB_TYPE,
          status: { in: ['COMPLETED', 'FAILED'] },
          createdAt: { lt: cutoffDate },
        },
      });

      if (result.count > 0) {
        logger.info('[OrchestrationJob] Cleaned up old jobs', {
          deletedCount: result.count,
          daysToKeep,
        });
      }
    } catch (error) {
      logger.error('[OrchestrationJob] Failed to cleanup jobs', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Get job status
   */
  static async getJobStatus(jobId: string): Promise<{
    status: string;
    progress?: any;
    error?: string;
  } | null> {
    if (!prisma) {
      return null;
    }

    try {
      const job = await prisma.jobQueue.findUnique({
        where: { id: jobId },
      });

      if (!job) {
        return null;
      }

      // For completed orchestration jobs, get the OA status
      if (job.status === 'COMPLETED') {
        const payload = JSON.parse(job.payload) as OrchestratorJobPayload;
        const officeAction = await prisma.officeAction.findUnique({
          where: { id: payload.officeActionId },
          select: { 
            status: true,
            rejections: { select: { id: true } },
          },
        });

        return {
          status: 'COMPLETED',
          progress: {
            officeActionStatus: officeAction?.status,
            rejectionCount: officeAction?.rejections.length || 0,
          },
        };
      }

      return {
        status: job.status,
        error: job.lastError || undefined,
      };
    } catch (error) {
      logger.error('[OrchestrationJob] Failed to get job status', {
        error: error instanceof Error ? error.message : String(error),
        jobId,
      });
      return null;
    }
  }
} 
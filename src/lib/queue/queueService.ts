/**
 * Queue Service
 *
 * Manages background job queuing for reliable async processing.
 * This replaces dangerous fire-and-forget patterns with proper job management.
 */

import { environment } from '@/config/environment';
import { sendMessage } from './azureQueueService';
import { ApplicationError, ErrorCode } from '@/lib/error';

interface QueueMessage {
  type: string;
  payload: any;
  timestamp: Date;
}

// Queue configuration
const QUEUE_CONFIG = {
  connectionString: environment.azure.storageConnectionString,
  citationJobsQueue: 'citation-jobs-dev',
  externalCitationJobsQueue: 'external-citation-jobs',
};

export class QueueService {
  private isAzureConfigured: boolean = false;

  constructor() {
    // Check if Azure Queue Storage is configured
    this.isAzureConfigured = !!(
      environment.azure.storageConnectionString ||
      environment.azure.storageContainerName
    );

    if (!this.isAzureConfigured) {
      // Warning logging removed for client compatibility
    }
  }

  /**
   * Enqueue a job for background processing
   */
  async enqueue(jobType: string, payload: any): Promise<void> {
    const message: QueueMessage = {
      type: jobType,
      payload,
      timestamp: new Date(),
    };

    try {
      if (this.isAzureConfigured) {
        // Use the actual Azure Queue service
        const success = await sendMessage(jobType, message);

        if (success) {
          // Info logging removed for client compatibility
        } else {
          throw new ApplicationError(
            ErrorCode.INTERNAL_ERROR,
            'Failed to send message to queue service'
          );
        }
      } else {
        // Fallback: Log the job for manual processing
        // Info logging removed for client compatibility
      }
    } catch (error) {
      // Error logging removed for client compatibility
      throw new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        `Failed to enqueue ${jobType} job`
      );
    }
  }

  /**
   * Process jobs from the queue (for worker processes)
   */
  async processQueue(
    jobType: string,
    handler: (payload: any) => Promise<void>
  ): Promise<void> {
    // Info logging removed for client compatibility
    // TODO: Implement actual queue processing
    // This would poll Azure Queue Storage and process messages
    // Example implementation:
    // while (true) {
    //   const messages = await queueClient.receiveMessages({ numberOfMessages: 1 });
    //   for (const message of messages.receivedMessageItems) {
    //     try {
    //       const payload = JSON.parse(Buffer.from(message.messageText, 'base64').toString());
    //       await handler(payload);
    //       await queueClient.deleteMessage(message.messageId, message.popReceipt);
    //     } catch (error) {
    //
    // Error logging removed for client compatibility
    //     }
    //   }
    //   await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
    // }
  }
}

// REMOVED: Singleton export that could cause issues between requests
// Use request-scoped instances via ServiceContext instead

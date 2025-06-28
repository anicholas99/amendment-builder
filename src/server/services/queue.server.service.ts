import { QueueClient, QueueServiceClient } from '@azure/storage-queue';
import { logger } from '@/lib/monitoring/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { Buffer } from 'buffer';
import { environment } from '@/config/environment';

const AZURE_STORAGE_CONNECTION_STRING =
  environment.azure.storageConnectionString;
const CITATION_EXTRACTION_QUEUE_NAME = 'citation-extraction-jobs';

/**
 * Service for interacting with Azure Storage Queues.
 * Handles client initialization and message sending for background processing.
 */
class QueueServerService {
  private queueServiceClient: QueueServiceClient | null = null;

  /**
   * Initializes the Azure Queue Service Client.
   * Throws an error if the connection string is not configured.
   */
  private getQueueServiceClient(): QueueServiceClient {
    if (this.queueServiceClient) {
      return this.queueServiceClient;
    }

    if (!AZURE_STORAGE_CONNECTION_STRING) {
      logger.error(
        '[QueueServerService] AZURE_STORAGE_CONNECTION_STRING is not set.'
      );
      throw new ApplicationError(
        ErrorCode.ENV_VAR_MISSING,
        'Azure Storage connection string is not configured.'
      );
    }

    try {
      this.queueServiceClient = QueueServiceClient.fromConnectionString(
        AZURE_STORAGE_CONNECTION_STRING
      );
      logger.info(
        '[QueueServerService] Azure Queue Service Client initialized.'
      );
      return this.queueServiceClient;
    } catch (error) {
      logger.error('[QueueServerService] Failed to create QueueServiceClient', {
        error,
      });
      throw new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        'Failed to initialize Azure Queue Service.'
      );
    }
  }

  /**
   * Gets a client for a specific queue, creating it if it doesn't exist.
   * @param queueName - The name of the queue.
   */
  private async getQueueClient(queueName: string): Promise<QueueClient> {
    const serviceClient = this.getQueueServiceClient();
    const queueClient = serviceClient.getQueueClient(queueName);

    try {
      await queueClient.createIfNotExists();
      logger.debug(
        `[QueueServerService] Queue client for '${queueName}' is ready.`
      );
      return queueClient;
    } catch (error) {
      logger.error(
        `[QueueServerService] Failed to create or access queue '${queueName}'`,
        { error }
      );
      throw new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        `Failed to ensure queue '${queueName}' exists.`
      );
    }
  }

  /**
   * Sends a message to a specific Azure Storage Queue.
   * The message is base64 encoded as required by Azure Queues.
   * @param message - The message object to be queued.
   * @param queueName - The name of the queue to send the message to. Defaults to the main citation queue.
   */
  async sendMessage(
    message: { type: string; payload: any },
    queueName: string = CITATION_EXTRACTION_QUEUE_NAME
  ): Promise<void> {
    try {
      const queueClient = await this.getQueueClient(queueName);

      const messageString = JSON.stringify(message);
      // Azure Queues require the message to be base64 encoded
      const encodedMessage = Buffer.from(messageString).toString('base64');

      const response = await queueClient.sendMessage(encodedMessage);
      logger.info(
        `[QueueServerService] Message sent to queue '${queueName}' successfully.`,
        {
          messageId: response.messageId,
          requestId: response.requestId,
          messageType: message.type,
        }
      );
    } catch (error) {
      logger.error(
        `[QueueServerService] Failed to send message to queue '${queueName}'`,
        {
          error,
          message,
        }
      );

      // Rethrow as a standardized application error
      throw new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        `Failed to send message to queue: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export const queueService = new QueueServerService();

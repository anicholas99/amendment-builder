import { QueueServiceClient } from '@azure/storage-queue';
import { logger } from '@/lib/monitoring/logger';
import { env } from '@/config/env';

// Default connection string for local Azurite development
const DEFAULT_AZURITE_CONNECTION_STRING = env.AZURITE_CONNECTION_STRING || '';

const AZURE_STORAGE_CONNECTION_STRING =
  env.AZURE_STORAGE_CONNECTION_STRING ||
  (env.NODE_ENV === 'development' ? DEFAULT_AZURITE_CONNECTION_STRING : '');

if (!AZURE_STORAGE_CONNECTION_STRING && env.NODE_ENV !== 'development') {
  logger.warn(
    'Azure Storage Connection String is not set. Queue service will not be functional for actual Azure resources outside of local development.'
  );
}

// Use connection string directly
const queueServiceClient = AZURE_STORAGE_CONNECTION_STRING
  ? QueueServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING)
  : null;

async function ensureQueueExists(queueName: string) {
  if (!queueServiceClient) {
    logger.error(
      `QueueServiceClient not initialized. Cannot ensure queue ${queueName} exists.`
    );
    return null;
  }
  try {
    const queueClient = queueServiceClient.getQueueClient(queueName);
    await queueClient.createIfNotExists();
    logger.info(`Queue [${queueName}] ensured to exist.`);
    return queueClient;
  } catch (error) {
    logger.error(`Error ensuring queue ${queueName} exists:`, {
      error: error instanceof Error ? error : undefined,
    });
    return null;
  }
}

export async function sendMessage(
  queueName: string,
  message: unknown
): Promise<boolean> {
  if (!queueServiceClient) {
    logger.error(
      `QueueServiceClient not initialized. Cannot send message to ${queueName}.`
    );
    return false;
  }
  try {
    const queueClient = await ensureQueueExists(queueName);
    if (!queueClient) return false;

    // Messages must be strings. Azure SDK handles Base64 encoding for binary data if needed,
    // but for JSON, stringify it.
    const messageString = JSON.stringify(message);
    // Azure Queue storage expects messages to be Base64 encoded strings or binary.
    // Encoding the JSON string to Base64 is a common practice.
    const response = await queueClient.sendMessage(
      Buffer.from(messageString).toString('base64')
    );
    logger.info(
      `Message sent to queue [${queueName}]. Message ID: ${response.messageId}, Request ID: ${response.requestId}`
    );
    return true;
  } catch (error) {
    logger.error(`Error sending message to queue [${queueName}]:`, {
      error: error instanceof Error ? error : undefined,
    });
    return false;
  }
}

export interface ReceivedMessageItem {
  messageId: string;
  popReceipt: string;
  messageText: string; // This will be the Base64 decoded string
  dequeueCount: number;
}

export async function receiveMessages(
  queueName: string,
  maxMessages: number = 1
): Promise<ReceivedMessageItem[]> {
  if (!queueServiceClient) {
    logger.error(
      `QueueServiceClient not initialized. Cannot receive messages from ${queueName}.`
    );
    return [];
  }
  try {
    const queueClient = await ensureQueueExists(queueName);
    if (!queueClient) return [];

    const response = await queueClient.receiveMessages({
      numberOfMessages: maxMessages,
      // visibilityTimeout: 60 // seconds: how long the message is hidden before it reappears if not deleted
    });

    if (response.receivedMessageItems.length > 0) {
      logger.info(
        `Received ${response.receivedMessageItems.length} messages from queue [${queueName}]`
      );
    }
    return response.receivedMessageItems.map(msg => ({
      messageId: msg.messageId,
      popReceipt: msg.popReceipt, // Needed to delete the message
      messageText: Buffer.from(msg.messageText, 'base64').toString('utf-8'), // Decode from base64
      dequeueCount: msg.dequeueCount,
    }));
  } catch (error) {
    logger.error(`Error receiving messages from queue ${queueName}:`, {
      error: error instanceof Error ? error : undefined,
    });
    return [];
  }
}

export async function deleteMessage(
  queueName: string,
  messageId: string,
  popReceipt: string
): Promise<boolean> {
  if (!queueServiceClient) {
    logger.error(
      `QueueServiceClient not initialized. Cannot delete message from ${queueName}.`
    );
    return false;
  }
  try {
    const queueClient = queueServiceClient.getQueueClient(queueName); // Don't need ensureQueueExists here
    await queueClient.deleteMessage(messageId, popReceipt);
    logger.info(`Message ${messageId} deleted from queue [${queueName}].`);
    return true;
  } catch (error) {
    logger.error(
      `Error deleting message ${messageId} from queue ${queueName}:`,
      {
        error: error instanceof Error ? error : undefined,
      }
    );
    return false;
  }
}

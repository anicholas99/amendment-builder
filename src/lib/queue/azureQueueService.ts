import { QueueServiceClient } from '@azure/storage-queue';
import { env } from '@/config/env';

// Default connection string for local Azurite development
const DEFAULT_AZURITE_CONNECTION_STRING = env.AZURITE_CONNECTION_STRING || '';

const AZURE_STORAGE_CONNECTION_STRING =
  env.AZURE_STORAGE_CONNECTION_STRING ||
  (env.NODE_ENV === 'development' ? DEFAULT_AZURITE_CONNECTION_STRING : '');

if (!AZURE_STORAGE_CONNECTION_STRING && env.NODE_ENV !== 'development') {
  // Warning logging removed for client compatibility
}

// Lazy-load the queue service client to prevent initialization errors
let queueServiceClient: QueueServiceClient | null = null;

function getQueueServiceClient(): QueueServiceClient | null {
  if (!AZURE_STORAGE_CONNECTION_STRING) {
    return null;
  }

  if (!queueServiceClient) {
    try {
      queueServiceClient = QueueServiceClient.fromConnectionString(
        AZURE_STORAGE_CONNECTION_STRING
      );
      // Debug logging removed for client compatibility
    } catch (error) {
      // Error logging removed for client compatibility
      return null;
    }
  }

  return queueServiceClient;
}

async function ensureQueueExists(queueName: string) {
  const client = getQueueServiceClient();
  if (!client) {
    // Error logging removed for client compatibility
    return null;
  }
  try {
    const queueClient = client.getQueueClient(queueName);
    await queueClient.createIfNotExists();
    // Info logging removed for client compatibility
    return queueClient;
  } catch (error) {
    // Error logging removed for client compatibility
    return null;
  }
}

export async function sendMessage(
  queueName: string,
  message: unknown
): Promise<boolean> {
  const client = getQueueServiceClient();
  if (!client) {
    // Error logging removed for client compatibility
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
    // Info logging removed for client compatibility
    return true;
  } catch (error) {
    // Error logging removed for client compatibility
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
  const client = getQueueServiceClient();
  if (!client) {
    // Error logging removed for client compatibility
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
      // Info logging removed for client compatibility
    }
    return response.receivedMessageItems.map(msg => ({
      messageId: msg.messageId,
      popReceipt: msg.popReceipt, // Needed to delete the message
      messageText: Buffer.from(msg.messageText, 'base64').toString('utf-8'), // Decode from base64
      dequeueCount: msg.dequeueCount,
    }));
  } catch (error) {
    // Error logging removed for client compatibility
    return [];
  }
}

export async function deleteMessage(
  queueName: string,
  messageId: string,
  popReceipt: string
): Promise<boolean> {
  const client = getQueueServiceClient();
  if (!client) {
    // Error logging removed for client compatibility
    return false;
  }
  try {
    const queueClient = client.getQueueClient(queueName); // Don't need ensureQueueExists here
    await queueClient.deleteMessage(messageId, popReceipt);
    // Info logging removed for client compatibility
    return true;
  } catch (error) {
    // Error logging removed for client compatibility
    return false;
  }
}

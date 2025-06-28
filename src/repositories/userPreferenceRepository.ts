import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { logger } from '@/lib/monitoring/logger';

/**
 * Interface representing a user preference (key-value pair)
 */
export interface UserPreference {
  userId: string;
  key: string;
  value: string;
}

/**
 * Gets a user preference by user ID and key
 *
 * @param userId The ID of the user
 * @param key The preference key
 * @returns The preference value or null if not found
 */
export async function getUserPreference(
  userId: string,
  key: string
): Promise<string | null> {
  try {
    logger.debug(
      `Repository: Getting user preference for user ${userId}, key: ${key}`
    );

    const preference = await prisma!.userPreference.findUnique({
      where: {
        userId_key: {
          userId,
          key,
        },
      },
    });

    if (!preference) {
      logger.debug(
        `Repository: No preference found for user ${userId}, key: ${key}`
      );
      return null;
    }

    logger.debug(
      `Repository: Found preference for user ${userId}, key: ${key}`
    );
    return preference.value;
  } catch (error) {
    logger.error(
      `Repository error getting preference for user ${userId}, key: ${key}:`,
      error
    );
    // Return null on error to allow graceful degradation
    return null;
  }
}

/**
 * Sets (creates or updates) a user preference
 *
 * @param userId The ID of the user
 * @param key The preference key
 * @param value The preference value
 * @returns A boolean indicating success
 */
export async function setUserPreference(
  userId: string,
  key: string,
  value: string | null
): Promise<boolean> {
  try {
    const valueToStore = value ?? ''; // Convert null to empty string for storage

    logger.debug(
      `Repository: Setting user preference for user ${userId}, key: ${key}, value: ${valueToStore}`
    );

    await prisma!.userPreference.upsert({
      where: {
        userId_key: {
          userId,
          key,
        },
      },
      update: {
        value: valueToStore,
      },
      create: {
        userId,
        key,
        value: valueToStore,
      },
    });

    logger.debug(
      `Repository: Successfully set preference for user ${userId}, key: ${key}`
    );
    return true;
  } catch (error) {
    logger.error(
      `Repository error setting preference for user ${userId}, key: ${key}:`,
      error
    );
    return false;
  }
}

/**
 * Deletes a user preference
 *
 * @param userId The ID of the user
 * @param key The preference key
 * @returns A boolean indicating success
 */
export async function deleteUserPreference(
  userId: string,
  key: string
): Promise<boolean> {
  try {
    logger.debug(
      `Repository: Deleting user preference for user ${userId}, key: ${key}`
    );

    await prisma!.userPreference.delete({
      where: {
        userId_key: {
          userId,
          key,
        },
      },
    });

    logger.debug(
      `Repository: Successfully deleted preference for user ${userId}, key: ${key}`
    );
    return true;
  } catch (error) {
    // Check if it's a "Record not found" error, which we can consider a success
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      logger.debug(
        `Repository: No preference found to delete for user ${userId}, key: ${key}`
      );
      return true; // Consider it a success if the record didn't exist
    }

    logger.error(
      `Repository error deleting preference for user ${userId}, key: ${key}:`,
      error
    );
    return false;
  }
}

/**
 * AI Suggestions Operations
 *
 * This module contains operations related to AI suggestions for search history.
 */

import { Prisma } from '@prisma/client/index.js';
import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/monitoring/logger';
import {
  SuggestionInput,
  CreatedSuggestion,
  SaveSuggestionsResult,
  RawSuggestion,
} from './types';

/**
 * Save AI suggestions to database
 * @param searchId ID of the search history record
 * @param suggestions Array of suggestion objects to save
 * @returns Object containing created suggestions and any errors
 */
export async function saveAiSuggestions(
  searchId: string,
  suggestions: SuggestionInput[]
): Promise<SaveSuggestionsResult> {
  const createdSuggestions: CreatedSuggestion[] = [];
  const errors: { suggestion: SuggestionInput; error: string }[] = [];

  logger.info(
    `Repository: Beginning insertion of ${suggestions.length} suggestions into database for search ID: ${searchId}`
  );

  for (const suggestion of suggestions) {
    // Store the entire suggestion object as a JSON string in the 'content' field
    let fullSuggestionString: string;
    try {
      // Attempt to stringify the full suggestion object
      fullSuggestionString = JSON.stringify(suggestion);
    } catch (stringifyError) {
      const err =
        stringifyError instanceof Error
          ? stringifyError
          : new Error(String(stringifyError));
      logger.error(
        'Repository: Error stringifying suggestion object, attempting fallback:',
        {
          error: err,
        }
      );
      // Fallback: Stringify a minimal version if the full object fails
      fullSuggestionString = JSON.stringify({
        id: suggestion?.id || 'unknown',
        type: suggestion?.type || 'unknown',
        text: suggestion?.text || 'Error processing content',
      });
    }

    // Prepare metadata separately
    const metadata = {
      type: suggestion.type || 'claim',
      priority: suggestion.priority || 'medium',
    };
    const metadataString = JSON.stringify(metadata);

    try {
      logger.info(
        `Repository: Attempting to insert suggestion: type=${suggestion.type || 'unknown'}, searchHistoryId=${searchId}`
      );

      // Use Prisma ORM instead of raw SQL
      try {
        // Create the AISuggestion using the Prisma client
        const createdSuggestion = await prisma!.aISuggestion.create({
          data: {
            // Let Prisma handle ID generation with @default(uuid())
            searchHistoryId: String(searchId),
            content: fullSuggestionString,
            status: 'ACTIVE',
            metadata: metadataString,
            // Let Prisma handle createdAt and updatedAt with @default(now()) and @updatedAt
          },
        });

        logger.info(
          `Repository: Successfully inserted suggestion using Prisma ORM, ID: ${createdSuggestion.id}`
        );

        // Add a representation to the createdSuggestions array for the response
        createdSuggestions.push({
          id: createdSuggestion.id,
          searchHistoryId: String(searchId),
          content: suggestion, // Send back the original object, not the string
          metadata: metadata, // Send back the object
          status: 'ACTIVE',
        });
      } catch (prismaError) {
        // If Prisma create fails, fall back to raw SQL as a workaround
        const err =
          prismaError instanceof Error
            ? prismaError
            : new Error(String(prismaError));
        logger.warn(
          `Repository: Prisma create failed, falling back to raw SQL:`,
          { error: err }
        );

        // SECURITY FIX: Use Prisma.sql for safe parameterized query
        const result = await prisma!.$executeRaw(
          Prisma.sql`
            INSERT INTO ai_suggestions (id, searchHistoryId, content, status, metadata, createdAt, updatedAt)
            VALUES (NEWID(), ${String(searchId)}, ${fullSuggestionString}, 'ACTIVE', ${metadataString}, GETDATE(), GETDATE())
          `
        );

        logger.info(
          `Repository: Successfully inserted suggestion via raw SQL fallback, result: ${result}`
        );

        // Add a representation to the createdSuggestions array for the response
        createdSuggestions.push({
          searchHistoryId: String(searchId),
          content: suggestion, // Send back the original object, not the string
          metadata: metadata, // Send back the object
          status: 'ACTIVE',
        });
      }
    } catch (insertError) {
      const err =
        insertError instanceof Error
          ? insertError
          : new Error(String(insertError));
      logger.error(`Repository: Error inserting suggestion:`, { error: err });
      // Log more detailed error information
      if (insertError instanceof Error) {
        logger.error(
          `Repository: Error details: name=${insertError.name}, message=${insertError.message}, stack=${insertError.stack}`
        );
      }
      errors.push({
        suggestion: suggestion,
        error:
          insertError instanceof Error
            ? insertError.message
            : String(insertError),
      });
      // Continue with next suggestion even if this one fails
    }
  }

  return {
    createdSuggestions,
    errors,
  };
}

/**
 * Find all suggestions associated with an array of search history IDs.
 * Uses a raw SQL query to fetch suggestions from the ai_suggestions table.
 *
 * @param searchHistoryIds - Array of search history IDs to fetch suggestions for
 * @returns A promise resolving to an array of raw suggestion objects
 */
export async function findSuggestionsBySearchHistoryIds(
  searchHistoryIds: string[]
): Promise<RawSuggestion[]> {
  try {
    if (!searchHistoryIds.length) {
      logger.debug(
        'Repository: No search history IDs provided, returning empty array'
      );
      return [];
    }

    logger.debug(
      `Repository: Finding suggestions for ${searchHistoryIds.length} search history IDs`
    );

    // SECURITY FIX: Use Prisma.sql for safe parameterized query
    const rawSuggestions = await prisma!.$queryRaw<RawSuggestion[]>(
      Prisma.sql`
        SELECT id, searchHistoryId, content, status, metadata, createdAt, updatedAt
        FROM ai_suggestions
        WHERE searchHistoryId IN (${Prisma.join(searchHistoryIds)})
      `
    );

    // Ensure result is always an array
    const suggestions = Array.isArray(rawSuggestions) ? rawSuggestions : [];
    logger.debug(
      `Repository: Found ${suggestions.length} suggestions for the provided search history IDs`
    );

    return suggestions;
  } catch (error) {
    logger.error(
      `Repository error finding suggestions for search history IDs:`,
      error
    );
    // Return empty array on error for graceful degradation
    return [];
  }
}

/**
 * Find all suggestions for a project.
 * This is a higher-level function that combines finding search history IDs and then finding suggestions.
 *
 * @param projectId - The ID of the project
 * @returns A promise resolving to an array of raw suggestion objects
 */
export async function findSuggestionsByProjectId(
  projectId: string
): Promise<RawSuggestion[]> {
  try {
    logger.debug(
      `Repository: Finding all suggestions for project ID: ${projectId}`
    );

    // Import the function from searchHistory module to avoid circular dependency
    const { findSearchHistoryIdsByProjectId } = await import(
      './searchHistory.repository'
    );

    // Step 1: Get all search history IDs for this project
    const searchHistoryIds = await findSearchHistoryIdsByProjectId(projectId);

    if (searchHistoryIds.length === 0) {
      logger.debug(
        `Repository: No search history found for project ${projectId}, returning empty array`
      );
      return [];
    }

    // Step 2: Get all suggestions for these search history IDs
    const suggestions =
      await findSuggestionsBySearchHistoryIds(searchHistoryIds);

    logger.debug(
      `Repository: Found ${suggestions.length} total suggestions for project ${projectId}`
    );
    return suggestions;
  } catch (error) {
    logger.error(
      `Repository error finding suggestions for project ${projectId}:`,
      error
    );
    // Return empty array on error for graceful degradation
    return [];
  }
}

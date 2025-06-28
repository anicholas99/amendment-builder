/**
 * PatBase Family Service
 * Handles patent family operations and deduplication
 */

import { logger } from '@/lib/monitoring/logger';
import { authenticatePatbase, callPatbaseApi } from '../client';
import {
  PatentSearchResult,
  DeduplicatedResult,
  PatBaseQueryResponse,
  PatBaseFamilyResponse,
} from '../types';

// Family cache for deduplication
const familyCache: Map<string, string | null> = new Map();

/**
 * Clears the patent family cache
 */
export function clearFamilyCache(): void {
  logger.debug('[PatBase FamilyService] Clearing family cache');
  familyCache.clear();
}

/**
 * Helper function to generate patent number format variations
 */
export function generateReferenceFormats(patentNumber: string): string[] {
  const formats: string[] = [patentNumber];
  const normalized = patentNumber.replace(/[^a-zA-Z0-9]/g, '');

  if (!formats.includes(normalized)) {
    formats.push(normalized);
  }

  // Add hyphenated format for pattern like US12345A1
  if (normalized.match(/^([A-Z]{2})(\d+)([A-Z]\d*)$/)) {
    const hyphenated = normalized.replace(
      /^([A-Z]{2})(\d+)([A-Z]\d*)$/,
      '$1-$2-$3'
    );
    if (!formats.includes(hyphenated)) {
      formats.push(hyphenated);
    }
  }

  return formats;
}

/**
 * Get family ID for a patent number using PatBase API
 */
async function getFamilyIdForPatent(
  patentNumber: string,
  sessionToken: string
): Promise<string | null> {
  // Check cache first
  const cacheKey = patentNumber.toUpperCase();
  if (familyCache.has(cacheKey)) {
    const cached = familyCache.get(cacheKey);
    logger.debug(
      `[PatBase FamilyService] Using cached family ID for ${patentNumber}: ${cached}`
    );
    return cached || null;
  }

  // Try different patent number formats
  const formats = generateReferenceFormats(patentNumber);
  const limitedFormats = formats.slice(0, 3); // Try first 3 formats for speed

  for (const format of limitedFormats) {
    try {
      logger.debug(
        `[PatBase FamilyService] Trying to get family ID for format: ${format}`
      );

      // Step 1: Query to get QueryKey
      const queryParams = { query: `PN=${format}` };
      const queryResponse = await callPatbaseApi<PatBaseQueryResponse | string>(
        'query',
        queryParams,
        { sessionToken }
      );

      let queryKey: string | undefined;
      if (typeof queryResponse === 'object' && queryResponse?.QueryKey) {
        queryKey = queryResponse.QueryKey;
      } else {
        logger.debug(
          `[PatBase FamilyService] No QueryKey returned for format ${format}`
        );
        continue;
      }

      // Step 2: Use searchresultsFN to get family IDs
      const searchParams = { querykey: queryKey, from: '1', to: '1' };
      const familyResponse = await callPatbaseApi<
        PatBaseFamilyResponse | string
      >('searchresultsFN', searchParams, { sessionToken });

      if (typeof familyResponse === 'object' && familyResponse?.Families) {
        const familiesString = familyResponse.Families;
        if (familiesString && typeof familiesString === 'string') {
          const familyId = familiesString.split(',')[0].trim();
          logger.info(
            `[PatBase FamilyService] Found family ID ${familyId} for patent ${patentNumber} (format: ${format})`
          );
          familyCache.set(cacheKey, familyId);
          return familyId;
        }
      }
    } catch (error) {
      logger.debug(
        `[PatBase FamilyService] Error getting family ID for format ${format}:`,
        {
          error: (error as { message?: string })?.message,
        }
      );
      // Continue to next format
    }
  }

  // Cache null result to avoid repeated lookups
  logger.debug(
    `[PatBase FamilyService] No family ID found for patent ${patentNumber}`
  );
  familyCache.set(cacheKey, null);
  return null;
}

/**
 * Filters and deduplicates patents by family
 * Groups patents by their family ID and selects the best representative from each family
 */
export async function filterAndDeduplicateByFamily(
  results: PatentSearchResult[]
): Promise<DeduplicatedResult[]> {
  logger.info(
    `[PatBase FamilyService] Starting family deduplication for ${results.length} search results`
  );

  // If no results, return empty array
  if (!results || results.length === 0) {
    return [];
  }

  // Get session token
  let sessionToken: string;
  try {
    sessionToken = await authenticatePatbase();
  } catch (error) {
    logger.error(
      '[PatBase FamilyService] Failed to authenticate with PatBase',
      {
        error: error instanceof Error ? error.message : String(error),
      }
    );
    // Return results as-is if we can't authenticate
    return results.map(result => ({
      bestResult: result,
      otherFamilyMembersInSearch: [],
    }));
  }

  // Map to store family groups
  const familyGroups = new Map<string, PatentSearchResult[]>();
  const noFamilyResults: PatentSearchResult[] = [];

  // Process patents in batches for better performance
  const BATCH_SIZE = 5;
  const BATCH_DELAY = 100; // ms delay between batches

  for (let i = 0; i < results.length; i += BATCH_SIZE) {
    const batch = results.slice(i, i + BATCH_SIZE);

    // Process batch in parallel
    const batchPromises = batch.map(async (result, index) => {
      try {
        // Small delay within batch to avoid overwhelming the API
        if (index > 0) {
          await new Promise(resolve => setTimeout(resolve, 20 * index));
        }

        const patentNumber = result.number || result.patentNumber || '';
        const familyId = await getFamilyIdForPatent(patentNumber, sessionToken);

        return { result, familyId };
      } catch (error) {
        logger.warn(
          `[PatBase FamilyService] Failed to get family for patent ${result.number}`,
          { error: error instanceof Error ? error.message : String(error) }
        );
        return { result, familyId: null };
      }
    });

    // Wait for batch to complete
    const batchResults = await Promise.all(batchPromises);

    // Process batch results
    for (const { result, familyId } of batchResults) {
      if (familyId) {
        if (!familyGroups.has(familyId)) {
          familyGroups.set(familyId, []);
        }
        familyGroups.get(familyId)!.push(result);
      } else {
        noFamilyResults.push(result);
      }
    }

    // Add delay between batches (except for last batch)
    if (i + BATCH_SIZE < results.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
    }
  }

  // Build final results
  const finalResults: DeduplicatedResult[] = [];

  // Process family groups - convert to array to avoid iteration issues
  const familyEntries = Array.from(familyGroups.entries());
  for (const [familyId, members] of familyEntries) {
    // Sort by relevancy (descending) to get best member
    members.sort(
      (a: PatentSearchResult, b: PatentSearchResult) =>
        b.relevancy - a.relevancy
    );

    const bestMember = members[0];
    const otherMembers = members.slice(1);

    finalResults.push({
      bestResult: bestMember,
      otherFamilyMembersInSearch: otherMembers,
    });
  }

  // Add results without families
  for (const result of noFamilyResults) {
    finalResults.push({
      bestResult: result,
      otherFamilyMembersInSearch: [],
    });
  }

  // Sort final results by relevancy of best member
  finalResults.sort((a, b) => b.bestResult.relevancy - a.bestResult.relevancy);

  logger.info(
    `[PatBase FamilyService] Family deduplication complete: ${results.length} results -> ${finalResults.length} unique families/patents`
  );

  return finalResults;
}

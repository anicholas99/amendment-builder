/**
 * Interface representing a citation match from the database or API
 *
 * Contains all the information about a citation match, including
 * the reference number, citation text, score, status, and any metadata
 * about the reference and reasoning.
 */
import { logger } from '@/lib/monitoring/logger';
import { ProcessedCitationMatch } from '@/types/domain/citation';

export interface TableCitationMatch {
  /** Unique identifier for the citation match */
  id: string;
  /** ID of the search history entry that this match belongs to (optional) */
  searchHistoryId?: string;
  /** ID of the claim set version that this match is associated with (optional) */
  claimSetVersionId?: string;
  /** Job ID that created this citation match (optional) */
  jobId?: string | null;
  /** Patent/document reference number */
  referenceNumber: string;
  /** The extracted citation text */
  citation: string;
  /** Original paragraph context (optional) */
  paragraph?: string | null;
  /** Match score/confidence (optional) */
  score?: number | null;
  /** Status of location extraction: 'PENDING', 'PROCESSING', 'COMPLETED', or 'ERROR' (optional) */
  locationStatus?: string | null;
  /** JSON data containing location information (optional) */
  locationData?: string | null;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp (optional) */
  updatedAt?: string;
  /** Text of the claim element that this citation matches (optional) */
  parsedElementText?: string | null;

  /** Metadata: Title of the referenced patent/document (optional) */
  referenceTitle?: string | null;
  /** Metadata: Applicant of the referenced patent/document (optional) */
  referenceApplicant?: string | null;
  /** Metadata: Assignee of the referenced patent/document (optional) */
  referenceAssignee?: string | null;
  /** Metadata: Publication date of the referenced patent/document (optional) */
  referencePublicationDate?: string | null;

  /** ID of the location extraction job (optional) */
  locationJobId?: number | null;
  /** Error message from location extraction, if any (optional) */
  locationErrorMessage?: string | null;

  /** Status of reasoning extraction: 'PENDING', 'PROCESSING', 'COMPLETED', or 'ERROR' (optional) */
  reasoningStatus?: string | null;
  /** Relevance score from reasoning analysis (optional) */
  reasoningScore?: number | null;
  /** Summary of reasoning analysis (optional) */
  reasoningSummary?: string | null;
  /** Error message from reasoning extraction, if any (optional) */
  reasoningErrorMessage?: string | null;
}

/**
 * Interface representing a group of citation matches for the same claim element
 *
 * Used for displaying citations grouped by the claim element they match
 */
export interface GroupedCitationMatch {
  /** Text of the claim element that these citations match */
  elementText: string;
  /** Array of citation matches for this element */
  matches: ProcessedCitationMatch[];
}

/**
 * Get a display number for a search based on its position in the search history
 *
 * This function takes a search ID and search history array and returns a user-friendly
 * display number based on the position of the search in the history. The most recent
 * search will have the highest number.
 *
 * @param searchId - The ID of the search to get a display number for
 * @param searchHistory - The array of search history entries
 * @returns A string representation of the search number (e.g., "1", "2", etc.) or "N/A" if not found
 */
export function getSearchDisplayNumber(
  searchId: string | null,
  searchHistory: readonly { id: string | null }[]
): string {
  if (!searchId) return 'N/A';
  const index = searchHistory.findIndex(entry => entry.id === searchId);
  return index !== -1 ? `${searchHistory.length - index}` : 'Unknown';
}

/**
 * Groups and sorts citation matches by element text
 *
 * This function processes citation matches and organizes them for display:
 * 1. Filters matches by the selected reference (if one is provided)
 * 2. Groups matches by their claim element text
 * 3. Sorts matches within each group by score (highest first)
 * 4. Sorts the groups themselves by their original element order from the active search entry
 *
 * @param citationMatchesData - Array of citation matches from the API/database
 * @param selectedReference - Currently selected reference number (or null if none selected)
 * @param activeSearchEntry - The active search entry which may contain parsed elements for sorting
 * @param versionElementsArray - Optional array of version-specific elements for sorting
 * @returns An array of grouped citation matches sorted by original element order
 */
export function groupAndSortCitationMatches(
  citationMatchesData: ProcessedCitationMatch[] | undefined,
  selectedReference: string | null,
  activeSearchEntry: {
    parsedElements?: string | { text?: string }[];
    [key: string]: unknown;
  } | null,
  versionElementsArray?: { text: string }[]
): GroupedCitationMatch[] {
  if (!citationMatchesData) return [];

  // 1. Filter by selected reference (if one is selected)
  const matchesForSelectedRef = selectedReference
    ? citationMatchesData.filter(
        match => match.referenceNumber === selectedReference
      )
    : citationMatchesData;

  // 2. Group matches by element text
  const matchesGroupedByElement = new Map<string, ProcessedCitationMatch[]>();

  for (const match of matchesForSelectedRef) {
    // Use parsedElementText as the primary key for grouping
    const key = match.parsedElementText;

    // Skip matches if no valid key can be determined
    if (!key) {
      logger.warn(
        '[CitationUtils] Skipping match due to missing parsedElementText',
        {
          matchId: match.id,
        }
      );
      continue;
    }

    if (!matchesGroupedByElement.has(key)) {
      matchesGroupedByElement.set(key, []);
    }
    matchesGroupedByElement.get(key)?.push(match);
  }

  // 3. Sort matches *within* each group by score (descending)
  matchesGroupedByElement.forEach(matchesInGroup => {
    matchesInGroup.sort(
      (a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity)
    );
  });

  // 4. Convert map to array of groups
  const groupedMatchesArray: GroupedCitationMatch[] = Array.from(
    matchesGroupedByElement.entries()
  ).map(([elementText, matches]) => ({ elementText, matches }));

  // 5. Sort the groups by original element order
  // IMPORTANT: If matches have elementOrder, they're already properly ordered by the backend
  // Check if all matches have elementOrder field to determine if we should preserve backend ordering
  const hasElementOrder = matchesForSelectedRef.some(
    match => 'elementOrder' in match
  );

  if (hasElementOrder) {
    // Sort groups by the elementOrder of their first match
    groupedMatchesArray.sort((a, b) => {
      const aOrder = a.matches[0]?.elementOrder ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.matches[0]?.elementOrder ?? Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder;
    });
    logger.debug('[CitationUtils] Sorted groups by elementOrder');
    return groupedMatchesArray;
  }

  // Fall back to text-based sorting only if elementOrder is not available
  try {
    let originalElementTexts: string[] = [];

    // PRIORITY 1: Use the new versionElementsArray
    if (versionElementsArray && versionElementsArray.length > 0) {
      originalElementTexts = versionElementsArray
        .map(el => el.text) // Extracts the 'text' from each element object
        .filter((text): text is string => typeof text === 'string'); // Ensures we only have actual strings
      logger.debug('[CitationUtils] Sorted groups using versionElementsArray.');
    }
    // PRIORITY 2 (Fallback): Use activeSearchEntry.parsedElements
    else if (activeSearchEntry?.parsedElements) {
      const elements =
        typeof activeSearchEntry.parsedElements === 'string'
          ? JSON.parse(activeSearchEntry.parsedElements)
          : activeSearchEntry.parsedElements;
      if (Array.isArray(elements)) {
        originalElementTexts = elements
          .map(el =>
            typeof el === 'object' && el !== null ? el.text : undefined
          )
          .filter((text): text is string => typeof text === 'string');
        logger.debug(
          '[CitationUtils] Sorted groups using activeSearchEntry.parsedElements as fallback.'
        );
      }
    }

    if (originalElementTexts.length > 0) {
      groupedMatchesArray.sort((groupA, groupB) => {
        const indexA = originalElementTexts.indexOf(groupA.elementText || '');
        const indexB = originalElementTexts.indexOf(groupB.elementText || '');
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
      logger.debug('[CitationUtils] Sorted groups by original element order.');
    } else {
      logger.debug(
        '[CitationUtils] Could not find original element order for sorting groups. Using insertion order.'
      );
      // If original order fails, keep the order from the Map iteration (usually insertion order)
    }
  } catch (error) {
    logger.error(
      '[CitationUtils] Error sorting groups by element order. Using insertion order.',
      {
        error,
      }
    );
    // Fallback to insertion order on error
  }

  return groupedMatchesArray;
}

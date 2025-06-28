import { logger } from '@/lib/monitoring/logger';
import { callPatbaseApi, authenticatePatbase } from '@/lib/api/patbase';
import { delay } from '@/utils/delay';
import { UnifiedPriorArt } from '@/types/domain/priorArt.unified';

// Interface for the raw details fetched before mapping
interface PatbaseRawDetails {
  title?: string;
  publicationDate?: string;
  assignee?: string;
  applicant?: string;
  abstract?: string;
  // Add other raw fields as needed
}

// Interfaces for PatBase API responses
interface PatbaseQueryResponse {
  QueryKey?: string;
  [key: string]: unknown;
}

interface PatbaseBibResponse {
  Families?: Array<{
    Title?: string;
    Abstract?: string;
    assignee?: string;
    applicant?: string;
    Publications?: Array<{ PD?: string; [key: string]: unknown }>;
    Assignees?: Array<{ PA?: string; [key: string]: unknown }>;
    [key: string]: unknown;
  }>;
}

/**
 * Fetches additional metadata (publication date, assignee) for a list of patents.
 * Uses Promise.all for concurrent fetching.
 * @param patents The list of patents to enrich.
 * @returns A promise resolving to the list of patents with added metadata.
 */
export async function enrichPatentMetadata(
  patents: UnifiedPriorArt[]
): Promise<UnifiedPriorArt[]> {
  if (!patents || patents.length === 0) return [];

  const CONCURRENCY_DELAY_MS = 50;
  logger.info(
    `[Enrichment] Starting metadata enrichment for ${patents.length} patents.`
  );

  const enrichedPatents = await Promise.all(
    patents.map(async (patent, index) => {
      try {
        await delay(index * CONCURRENCY_DELAY_MS);
        const details = await getPatentDetails(patent.patentNumber);

        return {
          ...patent,
          year: details.publicationDate?.substring(0, 4) || patent.year,
          publicationDate: details.publicationDate || patent.publicationDate,
          authors: details.assignee ? [details.assignee] : patent.authors,
          title: details.title || patent.title,
          abstract: details.abstract || patent.abstract,
        };
      } catch (error) {
        logger.error(
          `[Enrichment] Error fetching details for patent ${patent.patentNumber}`,
          { error: error instanceof Error ? error.message : String(error) }
        );
        return patent; // Return original patent on error
      }
    })
  );

  return enrichedPatents;
}

/**
 * Fetches detailed patent information using various lookup methods.
 * Tries multiple formats and API calls.
 * @param patentNumber The patent number (PN or PNL format).
 * @returns A promise resolving to partial raw patent details or a minimal object on failure.
 */
export async function getPatentDetails(
  patentNumber: string
): Promise<Partial<PatbaseRawDetails>> {
  const referenceFormats = generateReferenceFormats(patentNumber);
  for (const format of referenceFormats) {
    try {
      const result = await tryPatentLookups(format);
      if (result) return result;
    } catch (error) {
      logger.warn(`Failed lookup with format ${format}`, { error });
    }
  }
  logger.warn(`All PatBase lookup methods failed for ${patentNumber}`);
  return { title: 'Patent information not available' };
}

/**
 * Generates different format variations of a patent number.
 * @param referenceNumber Original reference number
 * @returns Array of format variations
 */
function generateReferenceFormats(referenceNumber: string): string[] {
  const formats: string[] = [referenceNumber];

  // First, try without any special characters (most reliable)
  const normalized = referenceNumber.replace(/[^a-zA-Z0-9]/g, '');
  if (!formats.includes(normalized)) formats.push(normalized);

  // For US patents with hyphens, also try without hyphens early
  if (referenceNumber.includes('-')) {
    const withoutHyphens = referenceNumber.replace(/-/g, '');
    if (!formats.includes(withoutHyphens)) {
      // Add this as second format for faster success
      formats.splice(1, 0, withoutHyphens);
    }
  }

  // Add hyphenated format for pattern like US12345A1
  if (normalized.match(/^([A-Z]{2})(\d+)([A-Z]\d*)$/)) {
    const hyphenated = normalized.replace(
      /^([A-Z]{2})(\d+)([A-Z]\d*)$/,
      '$1-$2-$3'
    );
    if (!formats.includes(hyphenated)) formats.push(hyphenated);
  }

  // Try without country code
  if (normalized.match(/^[A-Z]{2}\d+[A-Z]\d*$/)) {
    const withoutCountry = normalized.replace(/^[A-Z]{2}/, '');
    if (!formats.includes(withoutCountry)) formats.push(withoutCountry);
  }

  // US-specific formats
  if (normalized.startsWith('US')) {
    const baseNumber = normalized.replace(/^(US\d+)[A-Z]\d*$/, '$1');
    if (baseNumber !== normalized && !formats.includes(baseNumber))
      formats.push(baseNumber);
    const withSpaces = normalized.replace(
      /^(US)(\d{4})(\d+)([A-Z]\d*)$/,
      '$1 $2 $3 $4'
    );
    if (withSpaces !== normalized && !formats.includes(withSpaces))
      formats.push(withSpaces);
  }

  return formats;
}

/**
 * Attempts to look up a patent using various PatBase API methods.
 * @param patentNumber Patent reference number in a specific format.
 * @returns A promise resolving to partial raw patent details if found, otherwise null.
 */
async function tryPatentLookups(
  patentNumber: string
): Promise<Partial<PatbaseRawDetails> | null> {
  try {
    const sessionToken = await authenticatePatbase();
    const queryParams = { query: `PN=${patentNumber}` };

    let queryResp: PatbaseQueryResponse | undefined;
    try {
      queryResp = await callPatbaseApi<PatbaseQueryResponse>(
        'query',
        queryParams,
        { sessionToken }
      );
    } catch (queryError) {
      // Log at debug level since we'll try other formats
      logger.debug(
        `[PatBase] Query failed for format ${patentNumber}, will try alternatives`,
        {
          error:
            queryError instanceof Error
              ? queryError.message
              : String(queryError),
        }
      );
      return null;
    }

    const queryKey = queryResp?.QueryKey;
    if (!queryKey) return null;

    const bibParams = { querykey: queryKey, from: '1', to: '1' };
    let bibResp: PatbaseBibResponse | undefined;

    try {
      bibResp = await callPatbaseApi<PatbaseBibResponse>(
        'searchresultsbib',
        bibParams,
        { sessionToken }
      );
    } catch (bibError) {
      logger.debug(`[PatBase] Bibliography lookup failed for ${patentNumber}`, {
        error: bibError instanceof Error ? bibError.message : String(bibError),
      });
      return null;
    }

    const family = bibResp?.Families?.[0];
    const publication = family?.Publications?.[0];
    const assignee = family?.Assignees?.[0];

    if (!family || !publication) return null;

    return {
      title: family.Title || '',
      abstract: family.Abstract || '',
      publicationDate: publication?.PD || '',
      assignee: assignee?.PA || '',
      applicant: assignee?.PA || '',
    };
  } catch (error) {
    // Only log unexpected errors at error level
    if (
      !error ||
      !(error instanceof Error) ||
      !error.message?.includes('400')
    ) {
      logger.error(
        `Unexpected error during patent lookup for ${patentNumber}`,
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
    return null;
  }
}

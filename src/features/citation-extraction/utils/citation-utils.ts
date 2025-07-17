import { ConsolidatedCitationResult } from '@/types/citationTypes';
import { safeJsonParse } from '@/utils/jsonUtils';
import { logger } from '@/utils/clientLogger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { PriorArtReference } from '@/types/claimTypes';
import { CITATION_THRESHOLDS } from '@/config/citationExtractionConfig';

// Type definitions for citation data
interface CitationItem {
  citation?: string;
  rankPercentage?: number;
  contextBefore?: string;
  contextAfter?: string;
  importance?: string;
  [key: string]: unknown; // Allow additional fields
}

interface ClaimItem {
  text?: string;
  [key: string]: unknown; // Allow additional fields
}

interface OptimizedCitationData {
  referenceNumber: string;
  title: string;
  abstract: string;
  key_citations: Array<{
    citation: string;
    rankPercentage: number;
  }>;
  main_claims?: string[];
}

/**
 * Parse citation data from a citation results string into structured results
 * This is now a pure function that only transforms data - no database access
 *
 * @param citationResultsString - The citation results string to parse
 * @param searchId - Optional search ID for logging context only
 * @returns Parsed citation results or null if parsing fails
 */
export function parseCitations(
  citationResultsString: string | null | undefined,
  searchId?: string | null
): ConsolidatedCitationResult[] | null {
  if (!citationResultsString) {
    logger.info(
      `[citation-utils] No citation results string provided${searchId ? ` for searchId: ${searchId}` : ''}`
    );
    return null;
  }

  logger.info(
    `[citation-utils] Parsing citation results${searchId ? ` for searchId: ${searchId}` : ''} (length: ${citationResultsString.length})`
  );

  // Split and parse the citation results
  const separator = '\n---CITATION_RESULT_SEPARATOR---\n';
  const individualJsonStrings = citationResultsString.split(separator);
  const parsedResults: ConsolidatedCitationResult[] = [];
  let successfulParses = 0;

  logger.info(
    `[citation-utils] Splitting citationResults by separator produced ${individualJsonStrings.length} potential JSON strings`
  );

  individualJsonStrings.forEach((jsonString, index) => {
    if (jsonString.trim() === '') return; // Skip empty strings

    try {
      const parsedData = safeJsonParse<Record<string, unknown>>(jsonString);
      if (parsedData === undefined) {
        throw new ApplicationError(
          ErrorCode.VALIDATION_INVALID_FORMAT,
          'Failed to parse JSON string'
        );
      }

      let refNum = `UnknownRef_${index}`;
      if (typeof parsedData === 'object' && parsedData !== null) {
        if (typeof parsedData.referenceNumber === 'string')
          refNum = parsedData.referenceNumber;
        else if (typeof parsedData.number === 'string')
          refNum = parsedData.number;
      }

      parsedResults.push({
        referenceNumber: refNum,
        data: parsedData,
      });
      successfulParses++;
    } catch (parseError) {
      logger.warn(
        `[citation-utils] Failed to parse individual JSON string at index ${index}. Error: ${parseError instanceof Error ? parseError.message : parseError}.`
      );
      parsedResults.push({
        referenceNumber: `ParseError_${index}`,
        data: {
          error: `Failed to parse original JSON: ${parseError instanceof Error ? parseError.message : parseError}`,
        },
        error: `Failed to parse original JSON: ${parseError instanceof Error ? parseError.message : parseError}`,
      });
    }
  });

  if (successfulParses > 0) {
    logger.info(
      `[citation-utils] Successfully parsed ${successfulParses} / ${individualJsonStrings.length} citation result items`
    );
    return parsedResults;
  } else {
    logger.warn(
      '[citation-utils] Failed to parse any individual JSON strings from citationResults'
    );
    return null;
  }
}

/**
 * Optimize citation data by extracting and summarizing the most relevant information
 * for suggestion generation, drastically reducing token count
 */
export function optimizeCitationData(
  citationData: ConsolidatedCitationResult[] | null
): ConsolidatedCitationResult[] | null {
  if (!citationData || citationData.length === 0) {
    logger.info('[citation-utils] No citation data to optimize');
    return null;
  }

  logger.info(
    `[citation-utils] Optimizing ${citationData.length} citation results for token efficiency`
  );

  const optimizedResults: ConsolidatedCitationResult[] = [];

  citationData.forEach((citation: ConsolidatedCitationResult) => {
    try {
      const { referenceNumber, data, error } = citation;

      if (error) {
        optimizedResults.push({ referenceNumber, data: { error }, error });
        return;
      }

      const optimizedData: OptimizedCitationData = {
        referenceNumber: referenceNumber,
        title: data.title && typeof data.title === 'string' ? data.title : '',
        abstract:
          data.abstract && typeof data.abstract === 'string'
            ? data.abstract
            : '',
        key_citations: [],
      };

      if (data.citations && Array.isArray(data.citations)) {
        // Log the original citations before filtering
        const originalCount = data.citations.length;
        const validCitations = data.citations.filter(
          (citation: CitationItem) =>
            citation.citation &&
            typeof citation.citation === 'string' &&
            citation.citation.trim() !== ''
        );

        logger.info(
          `[citation-utils] Reference ${referenceNumber}: ${originalCount} total citations, ${validCitations.length} with valid text`
        );

        // Log citations being filtered by threshold
        const beforeThreshold = validCitations.filter(
          (citation: CitationItem) =>
            citation.rankPercentage &&
            typeof citation.rankPercentage === 'number'
        );

        const afterThreshold = beforeThreshold.filter(
          (citation: CitationItem) =>
            citation.rankPercentage! >= CITATION_THRESHOLDS.filter
        );

        logger.info(
          `[citation-utils] Reference ${referenceNumber}: ${beforeThreshold.length} citations with scores, ${afterThreshold.length} above ${CITATION_THRESHOLDS.filter}% threshold`
        );

        // Log some examples of filtered citations
        const filteredOut = beforeThreshold.filter(
          (citation: CitationItem) =>
            citation.rankPercentage! < CITATION_THRESHOLDS.filter
        );

        if (filteredOut.length > 0) {
          logger.info(
            `[citation-utils] Reference ${referenceNumber}: Filtered out ${filteredOut.length} citations below ${CITATION_THRESHOLDS.filter}%`,
            {
              examples: filteredOut.slice(0, 3).map(c => ({
                score: c.rankPercentage,
                text: c.citation?.substring(0, 50) + '...',
              })),
            }
          );
        }

        optimizedData.key_citations = data.citations
          // Filter 1: Ensure citation field exists and is non-empty string
          .filter(
            (citation: CitationItem) =>
              citation.citation &&
              typeof citation.citation === 'string' &&
              citation.citation.trim() !== ''
          )
          // Filter 2: Keep only citations with rankPercentage >= filter threshold
          .filter(
            (citation: CitationItem) =>
              citation.rankPercentage &&
              typeof citation.rankPercentage === 'number' &&
              citation.rankPercentage >= CITATION_THRESHOLDS.filter
          )
          // .slice(0, 3) // Remove the arbitrary slice
          .map((citation: CitationItem) => ({
            // Extract the relevant snippet field
            citation: citation.citation!,
            // Preserve rankPercentage for context
            rankPercentage: citation.rankPercentage!,
            // Optionally include context if needed and available
            // contextBefore: citation.contextBefore?.substring(0, 50) || "",
            // contextAfter: citation.contextAfter?.substring(0, 50) || "",
            // importance: citation.importance || "unknown" // Use rankPercentage instead of importance now
          }));
      }

      if (data.claims && Array.isArray(data.claims)) {
        optimizedData.main_claims = data.claims
          .slice(0, 3)
          .map((claim: ClaimItem | string) =>
            typeof claim === 'string' ? claim : claim.text || ''
          );
      }

      // Type cast to match ConsolidatedCitationResult interface
      optimizedResults.push({
        referenceNumber,
        data: optimizedData as unknown as Record<string, unknown>,
      });
    } catch (optError) {
      logger.warn(
        `[citation-utils] Error optimizing citation ${citation.referenceNumber}:`,
        {
          error:
            optError instanceof Error ? optError.message : String(optError),
        }
      );
      optimizedResults.push(citation);
    }
  });

  const originalSize = JSON.stringify(citationData).length;
  const optimizedSize = JSON.stringify(optimizedResults).length;
  const reductionPercent =
    originalSize > 0
      ? (((originalSize - optimizedSize) / originalSize) * 100).toFixed(2)
      : 0;
  logger.info(
    `[citation-utils] Optimization complete. Reduced from ${originalSize} to ${optimizedSize} characters (${reductionPercent}% reduction)`
  );

  return optimizedResults;
}

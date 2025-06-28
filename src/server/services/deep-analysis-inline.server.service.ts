/**
 * Deep Analysis Inline Processing Service
 *
 * Processes deep analysis for citation jobs inline (not using queue workers).
 * This follows the same pattern as citation-extraction-inline for consistency.
 */

import { logger } from '@/lib/monitoring/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import {
  findById as getCitationJobById,
  update as updateCitationJob,
} from '@/repositories/citationJobRepository';
import {
  DeepAnalysisInput,
  parseCitationResults,
  getClaimElements,
  getClaimText,
  getPriorArtAbstract,
} from '@/repositories/citationUtils';
import { constructDeepAnalysisPrompt } from '@/server/prompts/deep-analysis.prompt';
import { processWithOpenAI } from '@/server/ai/aiService';
import { safeJsonParse } from '@/utils/json-utils';
import environment from '@/config/environment';
import { createCitationMatchesFromDeepAnalysis } from '@/repositories/citationMatchRepository';

// Constants
const PROCESSING_TIMEOUT_MS = environment.openai.deepAnalysisTimeout || 180000; // 3 minutes
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 5000;

// Helper function for delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Filter raw citation data to limit the number of citations per element
 * This prevents token limit issues with OpenAI
 */
function filterCitationData(
  rawDataJsonString: string,
  maxCitationsPerElement: number
): string {
  try {
    const parsed = safeJsonParse(rawDataJsonString);

    // Helper function to truncate citation text if too long
    const truncateCitation = (citation: Record<string, unknown>): Record<string, unknown> => {
      const MAX_CITATION_LENGTH = 300; // Reduced from 500 to save tokens

      if (citation && typeof citation === 'object') {
        const truncated = { ...citation };

        // Truncate citation text
        if (
          typeof truncated.citation === 'string' &&
          truncated.citation.length > MAX_CITATION_LENGTH
        ) {
          truncated.citation =
            truncated.citation.substring(0, MAX_CITATION_LENGTH) + '...';
        }

        // Truncate paragraph text
        if (
          typeof truncated.paragraph === 'string' &&
          truncated.paragraph.length > MAX_CITATION_LENGTH
        ) {
          truncated.paragraph =
            truncated.paragraph.substring(0, MAX_CITATION_LENGTH) + '...';
        }

        // Remove unnecessary fields to save tokens
        delete truncated.searchQuery;
        delete truncated.searchHistoryId;
        delete truncated.citationJobId;
        delete truncated.id;
        delete truncated.createdAt;
        delete truncated.updatedAt;

        return truncated;
      }

      return citation;
    };

    // Handle array of arrays structure [[...]]
    if (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      Array.isArray(parsed[0])
    ) {
      const filtered = parsed.map((elementCitations: Record<string, unknown>[]) => {
        // Sort by score/rankPercentage and take top N
        const sorted = elementCitations
          .filter((citation: unknown): citation is Record<string, unknown> => citation && typeof citation === 'object')
          .sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
            const scoreA = typeof (a.score ?? a.rankPercentage) === 'number' ? (a.score ?? a.rankPercentage) as number : 0;
            const scoreB = typeof (b.score ?? b.rankPercentage) === 'number' ? (b.score ?? b.rankPercentage) as number : 0;
            return scoreB - scoreA; // Higher scores first
          });

        return sorted.slice(0, maxCitationsPerElement).map(truncateCitation);
      });

      return JSON.stringify(filtered);
    }

    // Handle flat array structure [...]
    if (Array.isArray(parsed)) {
      // Group by parsedElementText if available
      const grouped = new Map<string, any[]>();

      parsed.forEach((citation: Record<string, unknown>) => {
        const element = typeof citation.parsedElementText === 'string' ? citation.parsedElementText : 'unknown';
        if (!grouped.has(element)) {
          grouped.set(element, []);
        }
        grouped.get(element)!.push(citation);
      });

      // Filter each group
      const filtered: any[] = [];
      grouped.forEach((citations, element) => {
        const sorted = citations
          .sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
            const scoreA = typeof (a.score ?? a.rankPercentage) === 'number' ? (a.score ?? a.rankPercentage) as number : 0;
            const scoreB = typeof (b.score ?? b.rankPercentage) === 'number' ? (b.score ?? b.rankPercentage) as number : 0;
            return scoreB - scoreA;
          })
          .slice(0, maxCitationsPerElement)
          .map(truncateCitation);

        filtered.push(...sorted);
      });

      return JSON.stringify(filtered);
    }

    // Return original if not an array
    return rawDataJsonString;
  } catch (error) {
    logger.warn(
      '[DeepAnalysis] Failed to filter citation data, using original',
      {
        error,
      }
    );
    return rawDataJsonString;
  }
}

export interface DeepAnalysisPayload {
  jobId: string;
}

/**
 * Process deep analysis for a citation job inline
 */
export async function processDeepAnalysisInline(
  payload: DeepAnalysisPayload
): Promise<void> {
  const { jobId } = payload;

  logger.info(`[DeepAnalysis] Starting inline processing for job ${jobId}`);

  try {
    // Update job status to indicate deep analysis is in progress
    await updateCitationJob(jobId, {
      lastCheckedAt: new Date(),
    });

    // Fetch the citation job with raw results
    const citationJob = await getCitationJobById(jobId);
    if (!citationJob) {
      throw new ApplicationError(
        ErrorCode.CITATION_JOB_NOT_FOUND,
        `Citation job ${jobId} not found`
      );
    }

    if (!citationJob.rawResultData) {
      throw new ApplicationError(
        ErrorCode.INVALID_INPUT,
        `No raw result data found for job ${jobId}`
      );
    }

    // Parse the raw results
    const parsedResults = parseCitationResults(citationJob.rawResultData);
    if (!parsedResults || parsedResults.length === 0) {
      throw new ApplicationError(
        ErrorCode.INVALID_INPUT,
        `No valid citations found in raw results for job ${jobId}`
      );
    }

    // Get claim elements and text
    const claimElements = await getClaimElements(citationJob.searchHistoryId);
    const claimText = await getClaimText(citationJob.searchHistoryId);

    if (!claimElements || claimElements.length === 0) {
      throw new ApplicationError(
        ErrorCode.INVALID_INPUT,
        `No claim elements found for job ${jobId}`
      );
    }

    // Get prior art abstract
    const priorArtAbstract = await getPriorArtAbstract(
      citationJob.searchHistoryId,
      citationJob.referenceNumber || ''
    );

    // Get reference metadata from the search history results
    let referenceTitle: string | null = null;
    let referenceApplicant: string | null = null;
    let referenceAssignee: string | null = null;
    let referencePublicationDate: string | null = null;

    // Try to get metadata from search history results
    try {
      const { findSearchHistoryById } = await import(
        '@/repositories/search/searchHistory.repository'
      );
      const searchHistory = await findSearchHistoryById(
        citationJob.searchHistoryId
      );
      if (searchHistory?.results && Array.isArray(searchHistory.results)) {
        const reference = searchHistory.results.find(
          (ref: any) => ref.number === citationJob.referenceNumber
        );
        if (reference) {
          referenceTitle =
            typeof reference.title === 'string' ? reference.title : null;
          referenceApplicant = Array.isArray(reference.authors)
            ? reference.authors.join(', ')
            : typeof reference.authors === 'string'
              ? reference.authors
              : null;
          referenceAssignee =
            typeof reference.assignee === 'string' ? reference.assignee : null;
          referencePublicationDate =
            typeof reference.publicationDate === 'string'
              ? reference.publicationDate
              : null;
        }
      }
    } catch (metadataError) {
      logger.warn(
        `[DeepAnalysis] Could not extract metadata for job ${jobId}`,
        {
          error: metadataError,
        }
      );
    }

    // Filter the raw citation data to limit tokens
    const maxCitationsPerElement =
      environment.openai.deepAnalysisMaxCitationsPerElement || 3;
    const filteredRawData = filterCitationData(
      citationJob.rawResultData,
      maxCitationsPerElement
    );

    // Construct the deep analysis prompt
    const prompt = constructDeepAnalysisPrompt(
      filteredRawData, // Use filtered data instead of raw data
      claimElements,
      claimText || 'Claim text not available',
      citationJob.referenceNumber || '',
      priorArtAbstract,
      referenceTitle,
      referenceApplicant,
      referenceAssignee,
      referencePublicationDate,
      maxCitationsPerElement
    );

    logger.debug(`[DeepAnalysis] Constructed prompt for job ${jobId}`, {
      promptLength: prompt.length,
      promptTokensEstimate: Math.ceil(prompt.length / 4), // Rough estimate
      claimElementsCount: claimElements.length,
      originalDataLength: citationJob.rawResultData.length,
      filteredDataLength: filteredRawData.length,
      maxCitationsPerElement,
    });

    // Process with GPT
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < MAX_RETRIES) {
      attempt++;

      try {
        logger.info(
          `[DeepAnalysis] Calling OpenAI API for job ${jobId} (attempt ${attempt}/${MAX_RETRIES})`
        );

        const response = await processWithOpenAI(
          prompt,
          'You are an experienced USPTO patent examiner evaluating prior art.',
          {
            temperature: 0.3,
            maxTokens: 16000,
            model:
              environment.openai.deepAnalysisModel || 'gpt-4-turbo-preview',
          }
        );

        // Parse and validate the response
        let analysisResult = safeJsonParse(response.content);
        if (!analysisResult || typeof analysisResult !== 'object') {
          if (response.content && response.content.length > 10000) {
            logger.warn(
              `[DeepAnalysis] Response appears truncated for job ${jobId}`,
              {
                responseLength: response.content.length,
                lastChars: response.content.slice(-100),
              }
            );

            const partialResult = safeJsonParse(response.content + '"}}}');
            if (partialResult && typeof partialResult === 'object') {
              logger.info(
                `[DeepAnalysis] Salvaged partial response for job ${jobId}`
              );
              analysisResult = partialResult;
            } else {
              throw new ApplicationError(
                ErrorCode.AI_INVALID_RESPONSE,
                'Response was truncated - consider reducing claim elements or citations per element'
              );
            }
          } else {
            throw new ApplicationError(
              ErrorCode.AI_INVALID_RESPONSE,
              'Invalid JSON response from OpenAI'
            );
          }
        }

        // Update the citation job with deep analysis results
        await updateCitationJob(jobId, {
          deepAnalysisJson: JSON.stringify(analysisResult),
          lastCheckedAt: new Date(),
        });

        // Create CitationMatch records from the enhanced deep analysis
        await createCitationMatchesFromDeepAnalysis(
          analysisResult,
          citationJob,
          claimElements,
          {
            title: referenceTitle,
            applicant: referenceApplicant,
            assignee: referenceAssignee,
            publicationDate: referencePublicationDate,
          }
        );

        logger.info(
          `[DeepAnalysis] Successfully completed deep analysis for job ${jobId}`,
          {
            tokensUsed: response.usage?.total_tokens,
          }
        );

        return; // Success!
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        logger.warn(
          `[DeepAnalysis] Attempt ${attempt} failed for job ${jobId}`,
          {
            error: lastError.message,
          }
        );

        if (attempt < MAX_RETRIES) {
          await delay(RETRY_DELAY_MS);
        }
      }
    }

    // All retries failed
    throw (
      lastError ||
      new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        'Failed to process deep analysis after all retries'
      )
    );
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));

    logger.error(`[DeepAnalysis] Failed to process job ${jobId}`, {
      error: err.message,
      stack: err.stack,
    });

    // Update job with error status
    try {
      await updateCitationJob(jobId, {
        errorMessage: `Deep analysis failed: ${err.message}`,
        lastCheckedAt: new Date(),
      });
    } catch (updateError) {
      logger.error(
        `[DeepAnalysis] Failed to update error status for job ${jobId}`,
        {
          error: updateError,
        }
      );
    }

    throw error;
  }
}

/**
 * Queue deep analysis for inline processing
 * This function starts the async processing without blocking
 */
export async function queueDeepAnalysisInline(
  payload: DeepAnalysisPayload
): Promise<void> {
  logger.info(
    `[DeepAnalysis] Queueing job ${payload.jobId} for inline processing`
  );

  // Process inline without blocking the main thread
  (async () => {
    try {
      // Create timeout promise
      const timeoutPromise = delay(PROCESSING_TIMEOUT_MS).then(() => {
        throw new ApplicationError(
          ErrorCode.API_TIMEOUT,
          `Deep analysis timeout after ${PROCESSING_TIMEOUT_MS / 1000}s`
        );
      });

      // Race between processing and timeout
      await Promise.race([processDeepAnalysisInline(payload), timeoutPromise]);
    } catch (error) {
      logger.error('[DeepAnalysis] Inline job failed', {
        error,
        jobId: payload.jobId,
      });

      // Ensure status is updated on timeout or other failures
      if (error instanceof ApplicationError) {
        try {
          await updateCitationJob(payload.jobId, {
            errorMessage: error.message,
            lastCheckedAt: new Date(),
          });
        } catch (dbError) {
          logger.error('[DeepAnalysis] Failed to update error status', dbError);
        }
      }
    }
  })();

  // Return immediately without waiting for processing
  logger.info(
    `[DeepAnalysis] Job ${payload.jobId} queued for inline processing`
  );
}

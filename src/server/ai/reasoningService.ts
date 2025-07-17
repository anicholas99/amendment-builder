import { logger } from '@/server/logger';
import { safeJsonParse } from '@/utils/jsonUtils';
import environment from '@/config/environment';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { OpenaiServerService } from '@/server/services/openai.server-service';
import { CitationMatch, Prisma, PrismaClient } from '.prisma/client/index.js';

// Define the interface for citation match input
interface CitationMatchInput {
  id: string;
  citation?: string; // Made optional, primary source should be citationSnippets
  citationSnippets?: string[]; // Snippets from the prior art
  parsedElementText?: string | null; // The specific element from user's Claim 1 being analyzed
  userClaimText?: string | null; // ADDED: Full text of the user's Claim 1
  userInventionSummary?: string | null; // ADDED: User's invention summary
  priorArtAbstract?: string | null; // ADDED: Abstract of the prior art reference
  referenceNumber: string;
  referenceTitle?: string | null;
  referenceApplicant?: string | null;
  referenceAssignee?: string | null;
  referencePublicationDate?: string | null;
}

// Define the result interface
interface ReasoningResult {
  success: boolean;
  score?: number;
  summary?: string;
  error?: string;
}

export class AIAnalysisService {
  /**
   * Analyzes citation match(es) with an LLM to determine relevance score and generate summary
   *
   * @param citationMatchInput The citation match data, potentially including multiple snippets
   * @returns A promise resolving to a ReasoningResult object
   */
  static async analyzeWithLLM(
    citationMatchInput: CitationMatchInput
  ): Promise<ReasoningResult> {
    const {
      id: citationMatchId, // Use the ID from the input
      citation,
      citationSnippets,
      parsedElementText, // Can be string | null | undefined here
      userClaimText,
      userInventionSummary,
      priorArtAbstract,
      referenceNumber,
      referenceTitle,
    } = citationMatchInput;

    try {
      logger.info('Starting LLM analysis of citation match', {
        citationMatchId: citationMatchId,
        referenceNumber: referenceNumber,
      });

      // Validate required inputs
      const snippetsToAnalyze =
        citationSnippets && citationSnippets.length > 0
          ? citationSnippets
          : citation
            ? [citation]
            : [];

      // parsedElementText is essential for meaningful analysis.
      if (snippetsToAnalyze.length === 0 || !parsedElementText) {
        // Check if parsedElementText is null, undefined, or empty string
        const missingFields = [];
        if (snippetsToAnalyze.length === 0)
          missingFields.push('citation/citationSnippets');
        if (!parsedElementText) missingFields.push('parsedElementText');

        logger.warn('Missing essential fields for LLM analysis', {
          citationMatchId: citationMatchId,
          missingFields,
        });
        return {
          success: false,
          error: `Missing essential fields for analysis: ${missingFields.join(', ')}`,
        };
      }

      // At this point, parsedElementText is guaranteed to be a non-empty string.
      // The type of parsedElementText passed to constructPrompt will be string,
      // which is compatible with constructPrompt's parameter type string | null.
      const prompt = AIAnalysisService.constructPrompt(
        snippetsToAnalyze,
        parsedElementText ?? null, // Convert undefined to null using nullish coalescing
        userClaimText ?? null, // Also convert undefined to null
        userInventionSummary ?? null, // Convert undefined to null
        priorArtAbstract ?? null, // Convert undefined to null
        referenceNumber,
        referenceTitle ?? null // Convert undefined to null
      );

      // The new OpenaiServerService handles its own API key validation.
      // Call the centralized OpenAI service
      const response = await OpenaiServerService.getChatCompletion({
        model: 'gpt-4.1',
        messages: [
          {
            role: 'system',
            content:
              'You are a patent analysis assistant that evaluates the relevance of citations to patent claims.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 300,
      });

      // Parse response
      const result = AIAnalysisService.parseResponse(response.content);

      logger.info('LLM analysis completed successfully', {
        citationMatchId: citationMatchId,
        score: result.score,
        summaryLength: result.summary?.length,
      });

      return {
        success: true,
        score: result.score,
        summary: result.summary,
      };
    } catch (error) {
      logger.error('Error during LLM analysis', {
        error: error instanceof Error ? error.message : String(error),
        citationMatchId: citationMatchId,
      });

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error during analysis',
      };
    }
  }

  /**
   * Constructs a prompt for the LLM to analyze citation relevance,
   * handling single or multiple citation snippets.
   */
  static constructPrompt(
    citationInput: string | string[], // Snippets from prior art
    parsedElementText: string | null, // Specific element from user's claim
    userClaimText: string | null, // Full text of user's claim (e.g., Claim 1)
    userInventionSummary: string | null, // User's invention summary
    priorArtAbstract: string | null, // Abstract of the prior art reference
    referenceNumber: string,
    referenceTitle?: string | null
  ): string {
    let citationSection = '';
    let instructions = ''; // Assuming 'instructions' for scoring and JSON output are defined elsewhere or are standard

    if (Array.isArray(citationInput) && citationInput.length > 1) {
      // Multiple snippets provided
      citationSection = citationInput
        .map(
          (snippet, index) => `CITATION SNIPPET ${index + 1}:\n"${snippet}"\n`
        )
        .join('\n');
      instructions = `Your task:
1. Analyze how relevant ALL the provided CITATION SNIPPETS are collectively to the specific claim element, considering the invention's context, the full claim text, and the prior art abstract. Rate on a scale of 0.0 to 1.0 (0.0 = irrelevant, 1.0 = highly relevant/exact match).
   - IMPORTANT: Be sure to consider the ABSTRACT of the prior art reference when determining relevance, especially for broader claim elements.

2. Provide a brief 1-2 sentence explanation of your reasoning, focusing on the *most relevant* information found across ANY of the snippets or the abstract. Synthesize the findings. 
`;
    } else {
      // Single snippet (or array with one item)
      const singleCitation = Array.isArray(citationInput)
        ? citationInput[0]
        : citationInput || '';
      citationSection = `CITATION SNIPPET: "${singleCitation}"`;
      instructions = `Your task:
1. Analyze how relevant this citation snippet is to the specific claim element, considering the invention's context, the full claim text, and the prior art abstract. Rate on a scale of 0.0 to 1.0, where:
   - IMPORTANT: Be sure to consider the ABSTRACT of the prior art reference when determining relevance, especially for broader claim elements.
   - 0.0 means completely irrelevant
   - 0.5 means somewhat relevant
   - 1.0 means highly relevant/exact match

2. Provide a brief 1-2 sentence explanation of your reasoning.
`;
    }

    // Clean up priorArtAbstract - remove HTML tags
    const cleanedPriorArtAbstract = priorArtAbstract
      ? priorArtAbstract.replace(/<[^>]*>?/gm, '')
      : 'Abstract not available.';

    return `You are an expert in patent analysis.

USER'S INVENTION:
Summary: "${userInventionSummary || 'No summary provided.'}"
Claim 1 (the claim under analysis): "${userClaimText || 'Claim 1 text not provided.'}"

PRIOR ART REFERENCE:
Document: ${referenceNumber}${referenceTitle ? ` (${referenceTitle})` : ''}
Abstract: "${cleanedPriorArtAbstract}"

TASK:
Evaluate the relevance of the following CITATION SNIPPET(S) from the PRIOR ART REFERENCE to the SPECIFIC CLAIM ELEMENT (highlighted from the user's Claim 1).

SPECIFIC CLAIM ELEMENT FOR ANALYSIS: "${parsedElementText || 'Element text not provided.'}"

CITATION SNIPPET(S):
${citationSection}

${instructions}
Respond ONLY in JSON format with exactly two fields:
{
  "score": [your score as a number between 0.0 and 1.0],
  "summary": [your brief explanation as a string]
}`;
  }

  /**
   * Parses the LLM response to extract score and summary
   */
  static parseResponse(responseText: string): {
    score: number;
    summary: string;
  } {
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;

      // Parse the JSON
      const parsed = safeJsonParse<{ score: number; summary: string }>(
        jsonString
      );

      if (parsed === undefined) {
        throw new ApplicationError(
          ErrorCode.AI_INVALID_RESPONSE,
          'Failed to parse JSON response'
        );
      }

      // Validate the parsed response
      if (
        typeof parsed.score !== 'number' ||
        typeof parsed.summary !== 'string'
      ) {
        throw new ApplicationError(
          ErrorCode.AI_INVALID_RESPONSE,
          'Invalid response format: missing score or summary'
        );
      }

      // Ensure score is between 0 and 1
      const score = Math.max(0, Math.min(1, parsed.score));

      return {
        score,
        summary: parsed.summary,
      };
    } catch (error) {
      logger.error('Error parsing LLM response', {
        error: error instanceof Error ? error.message : String(error),
        responseText,
      });

      // Fallback: extract any number that looks like a score and use the whole text as summary
      const scoreMatch = responseText.match(/score[^\d]*(0\.\d+|1\.0|1)/i);
      const fallbackScore = scoreMatch ? parseFloat(scoreMatch[1]) : 0.5;

      return {
        score: Math.max(0, Math.min(1, fallbackScore)),
        summary:
          'Failed to parse structured response. Please check the raw LLM output.',
      };
    }
  }

  /**
   * Process a reasoning job directly without going through the API
   * This function can be called from backend services that need to process reasoning
   * @param citationMatch The citation match to process reasoning for
   */
  static async processReasoningJobDirect(citationMatch: {
    id: string;
    citation: string;
    parsedElementText?: string | null;
    referenceNumber: string | null;
    searchHistoryId: string;
    referenceTitle?: string | null;
    referenceApplicant?: string | null;
    referenceAssignee?: string | null;
    referencePublicationDate?: string | null;
  }) {
    const N_CITATIONS = 3;
    const {
      id: triggeringMatchId,
      parsedElementText,
      referenceNumber,
      searchHistoryId,
    } = citationMatch;

    let allMatchIdsInGroup: string[] = [triggeringMatchId];

    try {
      logger.info('Starting direct reasoning job processing', {
        citationMatchId: triggeringMatchId,
      });

      if (!parsedElementText || !referenceNumber || !searchHistoryId) {
        logger.error(
          'Missing parsedElementText, referenceNumber, or searchHistoryId for reasoning',
          { citationMatchId: triggeringMatchId }
        );
        const { updateCitationMatchReasoningFailure } = await import(
          '../../repositories/citationRepository'
        );
        await updateCitationMatchReasoningFailure(
          triggeringMatchId,
          'Missing required data for context query'
        );
        return;
      }

      // Import repository functions
      const {
        updateCitationMatchReasoningStatus,
        findTopCitationMatchesForReasoning,
        getSearchHistoryForReasoning,
        updateCitationMatchReasoningSuccess,
        updateCitationMatchReasoningFailure,
      } = await import('../../repositories/citationRepository');

      // Set status to PROCESSING
      try {
        await updateCitationMatchReasoningStatus(
          triggeringMatchId,
          'PROCESSING'
        );
        logger.info(
          'Updated triggering citation match reasoning status to PROCESSING',
          {
            citationMatchId: triggeringMatchId,
          }
        );
      } catch (statusError: unknown) {
        const statusErr =
          statusError instanceof Error
            ? statusError
            : new Error(String(statusError));
        logger.warn('Failed to update triggering match status to PROCESSING', {
          citationMatchId: triggeringMatchId,
          error: statusErr.message,
        });
      }

      // Fetch Top N Citation Matches from DB
      let topCitationSnippets: string[] = [];
      let topMatchesFromDb: { id: string; citation: string }[] = [];

      try {
        topMatchesFromDb = await findTopCitationMatchesForReasoning(
          searchHistoryId,
          referenceNumber,
          parsedElementText,
          N_CITATIONS
        );

        if (topMatchesFromDb.length > 0) {
          topCitationSnippets = topMatchesFromDb.map(match => match.citation);
          allMatchIdsInGroup = topMatchesFromDb.map(match => match.id);
          logger.info(
            `Found ${topMatchesFromDb.length} top citation matches in DB for element`,
            {
              citationMatchId: triggeringMatchId,
              parsedElementText,
            }
          );
          if (!allMatchIdsInGroup.includes(triggeringMatchId)) {
            allMatchIdsInGroup.push(triggeringMatchId);
          }
        } else {
          logger.warn(
            'Could not find any citation matches in DB for reasoning',
            {
              citationMatchId: triggeringMatchId,
              parsedElementText,
            }
          );
          topCitationSnippets = [citationMatch.citation];
          allMatchIdsInGroup = [triggeringMatchId];
        }
      } catch (dbError: unknown) {
        const dbErr =
          dbError instanceof Error ? dbError : new Error(String(dbError));
        logger.error('Error fetching top N citation matches from DB', {
          citationMatchId: triggeringMatchId,
          error: dbErr,
        });
        topCitationSnippets = [citationMatch.citation];
        allMatchIdsInGroup = [triggeringMatchId];
      }

      // Fetch Additional Context
      let userClaimText: string | null = null;
      let userInventionSummary: string | null = null;
      let priorArtAbstract: string | null = null;

      // Define types for parsed data
      interface ClaimDataType {
        [claimNumber: string]: string;
      }

      interface PriorArtResult {
        number?: string;
        abstract?: string;
        [key: string]: unknown;
      }

      try {
        const searchHistory =
          await getSearchHistoryForReasoning(searchHistoryId);

        if (searchHistory?.projectId) {
          // Fetch invention data and claims from the new system
          try {
            const { InventionDataService } = await import(
              '@/server/services/invention-data.server-service'
            );
            const inventionDataService = new InventionDataService();
            const inventionData = await inventionDataService.getInventionData(
              searchHistory.projectId
            );
            if (inventionData && typeof inventionData === 'object') {
              userInventionSummary = (inventionData as any).summary || null;
            }

            // Fetch claim 1 text from the new Claim model
            const { ClaimRepository } = await import(
              '@/repositories/claimRepository'
            );
            const { prisma } = await import('@/lib/prisma');

            if (!prisma) {
              logger.warn('Prisma client not available');
              userClaimText = null;
            } else {
              const inventionResult = await prisma.invention.findUnique({
                where: { projectId: searchHistory.projectId },
                select: { id: true },
              });

              if (inventionResult) {
                const claims = await ClaimRepository.findByInventionId(
                  inventionResult.id
                );
                const claim1 = claims.find(
                  (c: { number: number }) => c.number === 1
                );
                if (claim1) {
                  userClaimText = claim1.text;
                }
              }
            }
          } catch (inventionError) {
            logger.warn('Failed to get invention data or claims', {
              citationMatchId: triggeringMatchId,
              error: inventionError,
            });
            userInventionSummary = null;
          }
        }

        if (searchHistory?.results) {
          const priorArtResults = safeJsonParse<PriorArtResult[]>(
            searchHistory.results
          );
          if (priorArtResults === undefined) {
            logger.warn('Failed to parse prior art results - invalid JSON', {
              citationMatchId: triggeringMatchId,
              dataPreview: searchHistory.results.substring(0, 100),
            });
          } else if (Array.isArray(priorArtResults)) {
            const relevantPriorArt = priorArtResults.find(
              (ref: PriorArtResult) => ref.number === referenceNumber
            );
            if (relevantPriorArt?.abstract) {
              priorArtAbstract = relevantPriorArt.abstract.replace(
                /<[^>]*>?/gm,
                ''
              );
            }
          }
        }
        logger.info('Fetched additional context for reasoning', {
          citationMatchId: triggeringMatchId,
          hasUserClaim: !!userClaimText,
          hasUserSummary: !!userInventionSummary,
          hasPriorArtAbstract: !!priorArtAbstract,
        });
      } catch (contextError: unknown) {
        const contextErr =
          contextError instanceof Error
            ? contextError
            : new Error(String(contextError));
        logger.error('Error fetching additional context for reasoning', {
          citationMatchId: triggeringMatchId,
          error: contextErr.message,
        });
      }

      // Call LLM with multiple snippets
      const result = await AIAnalysisService.analyzeWithLLM({
        id: triggeringMatchId,
        parsedElementText: parsedElementText,
        referenceNumber: referenceNumber,
        referenceTitle: citationMatch.referenceTitle,
        referenceApplicant: citationMatch.referenceApplicant,
        referenceAssignee: citationMatch.referenceAssignee,
        referencePublicationDate: citationMatch.referencePublicationDate,
        citationSnippets: topCitationSnippets,
        userClaimText: userClaimText,
        userInventionSummary: userInventionSummary,
        priorArtAbstract: priorArtAbstract,
      });

      logger.info('Reasoning analysis completed', {
        citationMatchId: triggeringMatchId,
        success: result.success,
        matchesUpdatedCount: allMatchIdsInGroup.length,
      });

      // Update DB with results
      for (const matchId of allMatchIdsInGroup) {
        if (result.success) {
          try {
            await updateCitationMatchReasoningSuccess(
              matchId,
              result.score as number,
              result.summary as string
            );
          } catch (updateError: unknown) {
            const updateErr =
              updateError instanceof Error
                ? updateError
                : new Error(String(updateError));
            logger.warn(
              `Failed to update match ${matchId} with successful results`,
              {
                triggeringMatchId,
                error: updateErr.message,
              }
            );
          }
        } else {
          try {
            await updateCitationMatchReasoningFailure(
              matchId,
              result.error || 'Unknown error during reasoning analysis'
            );
          } catch (updateError: unknown) {
            const updateErr =
              updateError instanceof Error
                ? updateError
                : new Error(String(updateError));
            logger.warn(
              `Failed to update match ${matchId} with error results`,
              {
                triggeringMatchId,
                originalError: result.error,
                updateError: updateErr.message,
              }
            );
          }
        }
      }
      logger.info(
        `Finished updating DB for ${allMatchIdsInGroup.length} matches related to element`,
        { triggeringMatchId, parsedElementText }
      );

      return result;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Unhandled error in reasoning job processing', {
        error: err,
        citationMatchId: triggeringMatchId,
      });

      // Try to update the record(s) with the error
      try {
        const { updateCitationMatchReasoningFailure } = await import(
          '../../repositories/citationRepository'
        );
        const errorMsg = 'Unhandled error during reasoning analysis';
        for (const matchId of allMatchIdsInGroup) {
          try {
            await updateCitationMatchReasoningFailure(matchId, errorMsg);
          } catch (innerUpdateError: unknown) {
            const innerUpdateErr =
              innerUpdateError instanceof Error
                ? innerUpdateError
                : new Error(String(innerUpdateError));
            logger.warn(
              `Failed to update match ${matchId} with unhandled error`,
              {
                triggeringMatchId,
                updateError: innerUpdateErr.message,
              }
            );
          }
        }
      } catch (updateError: unknown) {
        const updateErr =
          updateError instanceof Error
            ? updateError
            : new Error(String(updateError));
        logger.error(
          'Error importing repository function during final error handling',
          {
            updateError: updateErr,
          }
        );
      }
    }
  }
}

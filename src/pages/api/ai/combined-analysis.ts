import { NextApiResponse } from 'next';
import { AuthenticatedRequest, RequestWithServices } from '@/types/middleware';
import { z } from 'zod';
import { findDeepAnalysisByIds as getCitationJobsDeepAnalysisByIds } from '@/repositories/citationJobRepository';
import * as combinedAnalysisRepository from '@/repositories/combinedExaminerAnalysisRepository';
import { findSearchHistoryById } from '@/repositories/search/searchHistory.repository';
import { prisma } from '@/lib/prisma';
import { CustomApiRequest } from '@/types/api';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { processWithOpenAI } from '@/server/ai/aiService';
import { logger } from '@/server/logger';
import {
  COMBINED_ANALYSIS_PROMPT_V2,
  COMBINED_ANALYSIS_SYSTEM_MESSAGE_V2,
  COMBINED_ANALYSIS_JSON_STRUCTURE_V2,
  COMBINED_ANALYSIS_JSON_EXAMPLE_V2,
} from '@/server/prompts/prompts/templates/combinedAnalysis';
import { renderPromptTemplate } from '@/server/prompts/prompts/utils';
import { safeJsonParse } from '@/utils/jsonUtils';
import {
  generateClaimHash,
  CURRENT_PARSER_VERSION,
} from '@/utils/claimVersioning';
import { CitationRefreshService } from '@/server/services/citation-refresh.server-service';
import { environment } from '@/config/environment';

import { StructuredCombinedAnalysis } from '@/client/services/patent/patentability/combined-analysis.client-service';
import { InventionData } from '@/types/invention';

// Type for deep analysis data that could be JSON string or parsed object
type DeepAnalysisData = string | Record<string, unknown>;

interface ReferenceMetadata {
  referenceNumber: string;
  applicant?: string | null;
  assignee?: string | null;
  title?: string | null;
}

/**
 * Format company names intelligently - abbreviate common suffixes and handle CJK names
 */
function formatCompanyName(name: string | null | undefined): string | null {
  if (!name) return null;

  // Common translations for well-known companies
  const commonTranslations: Record<string, string> = {
    トヨタ自動車株式会社: 'TOYOTA',
    'LG 电子株式会社': 'LG ELECTRONICS',
    海尔智家股份有限公司: 'HAIER',
    サムスン電子株式会社: 'SAMSUNG',
    ソニー株式会社: 'SONY',
    松下電器産業株式会社: 'PANASONIC',
    三菱電機株式会社: 'MITSUBISHI',
  };

  // Check for exact translation match first
  if (commonTranslations[name]) {
    return commonTranslations[name];
  }

  // Handle common company suffixes
  let formatted = name
    .replace(/株式会社/g, '') // Japanese "Kabushiki Kaisha" (Co., Ltd.)
    .replace(/有限公司/g, '') // Chinese "Limited Company"
    .replace(/股份有限公司/g, '') // Chinese "Corporation"
    .replace(
      /\s*(CORPORATION|CORP\.?|INCORPORATED|INC\.?|LIMITED|LTD\.?|LLC|L\.L\.C\.|COMPANY|CO\.?)\s*$/gi,
      ''
    )
    .replace(
      /\s*(TECHNOLOGIES?|TECH\.?|SYSTEMS?|ELECTRONICS?|ELECTRIC)\s*$/gi,
      ''
    )
    .trim();

  // If still has CJK characters and is long, try to extract Latin letters or abbreviate
  if (/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/.test(formatted)) {
    // Extract any Latin letters (like "LG" from "LG 电子")
    const latinMatch = formatted.match(/[A-Z][A-Z\s]+/);
    if (latinMatch) {
      formatted = latinMatch[0].trim();
    } else if (formatted.length > 15) {
      // If too long and no Latin letters, just use first part
      formatted = formatted.substring(0, 10) + '...';
    }
  }

  // Final length check for any name
  if (formatted.length > 20) {
    // Try to abbreviate intelligently
    const words = formatted.split(/\s+/);
    if (words.length > 2) {
      // Keep first word and abbreviate rest
      formatted =
        words[0] +
        ' ' +
        words
          .slice(1)
          .map(w => w[0])
          .join('');
    } else {
      formatted = formatted.substring(0, 17) + '...';
    }
  }

  return formatted.toUpperCase();
}

interface CombinedDeepAnalysisInput {
  claim1Text: string;
  deepAnalyses: DeepAnalysisData[];
  referenceIds: string[];
  referenceMetadata: ReferenceMetadata[];
  inventionData?: InventionData | null;
  allClaims?: Array<{ number: number; text: string; id?: string }> | null;
}

/**
 * Runs a combined deep analysis using the provided claim and deep analysis JSONs.
 * This is a server-side only function.
 */
async function runCombinedDeepAnalysis({
  claim1Text,
  deepAnalyses,
  referenceIds,
  referenceMetadata,
  inventionData,
  allClaims,
}: CombinedDeepAnalysisInput): Promise<StructuredCombinedAnalysis> {
  const referencesSection = deepAnalyses
    .map((analysis, idx) => {
      let analysisContent = '';
      if (typeof analysis === 'string') {
        try {
          const parsed = safeJsonParse<Record<string, unknown>>(analysis);
          if (parsed !== undefined) {
            analysisContent = JSON.stringify(parsed, null, 2);
          } else {
            analysisContent = analysis;
          }
        } catch (e) {
          analysisContent = analysis;
        }
      } else if (typeof analysis === 'object' && analysis !== null) {
        analysisContent = JSON.stringify(analysis, null, 2);
      } else {
        analysisContent = 'Deep analysis data is not in a readable format.';
      }

      // Format reference with applicant/assignee
      const metadata = referenceMetadata[idx];
      const applicantInfo = metadata?.applicant || metadata?.assignee;
      const formattedCompany = formatCompanyName(applicantInfo);
      const formattedRef = formattedCompany
        ? `${referenceIds[idx]} (${formattedCompany})`
        : referenceIds[idx];

      logger.debug(`Formatting reference ${idx}:`, {
        referenceId: referenceIds[idx],
        originalApplicant: metadata?.applicant,
        formattedCompany,
        formattedRef,
      });

      return `Reference ${formattedRef} Deep Analysis:\n${analysisContent}`;
    })
    .join('\n\n---\n\n');

  const desiredJsonStructureString = JSON.stringify(
    COMBINED_ANALYSIS_JSON_EXAMPLE_V2,
    null,
    2
  );

  // Format invention context if available
  let inventionContext = '';
  if (inventionData) {
    inventionContext = '\n\nINVENTION CONTEXT:\n';
    if (inventionData.title) {
      inventionContext += `Title: ${inventionData.title}\n`;
    }
    if (inventionData.summary) {
      inventionContext += `Summary: ${inventionData.summary}\n`;
    }
    if (inventionData.features && inventionData.features.length > 0) {
      inventionContext += `Key Features:\n${inventionData.features.map(f => `- ${f}`).join('\n')}\n`;
    }
    if (inventionData.advantages && inventionData.advantages.length > 0) {
      inventionContext += `Technical Advantages:\n${inventionData.advantages.map(a => `- ${a}`).join('\n')}\n`;
    }
    if (inventionData.technicalField) {
      inventionContext += `Technical Field: ${inventionData.technicalField}\n`;
    }
    if (inventionData.problemStatement) {
      inventionContext += `Problem Solved: ${inventionData.problemStatement}\n`;
    }
    if (inventionData.solutionSummary) {
      inventionContext += `Solution: ${inventionData.solutionSummary}\n`;
    }
  }

  // Add current claims context
  if (allClaims && allClaims.length > 0) {
    inventionContext += '\n\nCURRENT CLAIMS:\n';
    allClaims.forEach(claim => {
      inventionContext += `${claim.number}. ${claim.text}\n`;
    });
    inventionContext +=
      '\nIMPORTANT: When suggesting dependent claims, match the preamble format of the existing claims above.\n';
  }

  const prompt = renderPromptTemplate(COMBINED_ANALYSIS_PROMPT_V2, {
    claimText: claim1Text,
    referencesSection,
    desiredJsonStructure: desiredJsonStructureString,
    inventionContext,
    referenceCount: referenceIds.length,
  });

  const systemMessage = COMBINED_ANALYSIS_SYSTEM_MESSAGE_V2.template;

  const aiResult = await processWithOpenAI(prompt, systemMessage, {
    maxTokens: 3000,
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  try {
    let parsedResult: StructuredCombinedAnalysis;
    if (typeof aiResult.content === 'string') {
      const cleanedJsonString = aiResult.content.replace(
        /```json\s*|```$/g,
        ''
      );
      const parsed =
        safeJsonParse<StructuredCombinedAnalysis>(cleanedJsonString);
      if (parsed === undefined) {
        throw new ApplicationError(
          ErrorCode.AI_INVALID_RESPONSE,
          'Failed to parse AI response as JSON'
        );
      }
      parsedResult = parsed;
    } else if (
      typeof aiResult.content === 'object' &&
      aiResult.content !== null
    ) {
      parsedResult = aiResult.content as StructuredCombinedAnalysis;
    } else {
      throw new ApplicationError(
        ErrorCode.AI_INVALID_RESPONSE,
        'AI response content is not a string or a valid object'
      );
    }

    if (
      !parsedResult.patentabilityDetermination ||
      !Array.isArray(parsedResult.combinedReferences) ||
      !parsedResult.rejectionJustification ||
      !Array.isArray(parsedResult.strategicRecommendations) ||
      !parsedResult.rejectionJustification.fullNarrative
    ) {
      logger.error(
        'Parsed AI response is missing critical fields or has incorrect types:',
        parsedResult
      );
      throw new ApplicationError(
        ErrorCode.AI_INVALID_RESPONSE,
        'Parsed AI response is missing critical fields for structured combined analysis or has incorrect types'
      );
    }
    return parsedResult;
  } catch (error) {
    logger.error('Failed to parse AI response for combined analysis:', {
      error: error instanceof Error ? error : new Error(String(error)),
    });
    throw new ApplicationError(
      ErrorCode.AI_GENERATION_FAILED,
      'Failed to parse structured combined analysis from AI'
    );
  }
}

// Define request body type
interface CombinedAnalysisBody {
  claim1Text: string;
  referenceIds: string[];
  referenceNumbers?: string[];
  searchHistoryId: string;
  allClaims?: Array<{ number: number; text: string; id?: string }>;
}

// Zod schema for request validation
const bodySchema = z.object({
  claim1Text: z.string().min(10),
  referenceIds: z.array(z.string().min(1)).min(2),
  referenceNumbers: z.array(z.string()).optional(),
  searchHistoryId: z.string().min(1),
  allClaims: z
    .array(
      z.object({
        number: z.number(),
        text: z.string(),
        id: z.string().optional(),
      })
    )
    .optional(),
});

const handler = async (
  req: CustomApiRequest<CombinedAnalysisBody> & AuthenticatedRequest,
  res: NextApiResponse
) => {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res
        .status(405)
        .json({ error: `Method ${req.method} not allowed` });
    }
    const {
      claim1Text,
      referenceIds,
      referenceNumbers: providedRefNumbers,
      searchHistoryId,
      allClaims,
    } = req.body;
    const userId = req.user?.id || null; // Get user ID from authenticated request

    logger.info('Combined analysis request started', {
      searchHistoryId,
      referenceCount: referenceIds?.length,
      hasProvidedRefNumbers: !!providedRefNumbers,
      userId,
    });

    // Get request-scoped service
    const { inventionService } = (req as RequestWithServices).services;

    // Extract projectId from searchHistoryId to fetch invention data
    const searchHistory = await findSearchHistoryById(searchHistoryId);
    const projectId = searchHistory?.projectId;

    // Fetch invention data if we have a projectId
    let inventionData: InventionData | null = null;
    if (projectId) {
      try {
        inventionData = await inventionService.getInventionData(projectId);
      } catch (error) {
        logger.warn('Failed to fetch invention data for combined analysis', {
          error,
          projectId,
        });
        // Continue without invention data - it's optional
      }
    }

    // Fetch deepAnalysisJson for all selected references
    logger.debug('Fetching deep analysis jobs', { referenceIds });
    const deepAnalysisJobs =
      await getCitationJobsDeepAnalysisByIds(referenceIds);
    if (!deepAnalysisJobs || deepAnalysisJobs.length !== referenceIds.length) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'One or more references not found or missing deep analysis.'
      );
    }

    // Check for stale analyses and refresh if needed
    if (projectId && prisma) {
      try {
        // Get parsed elements for current claim
        const invention = await prisma.invention.findUnique({
          where: { projectId },
          select: { parsedClaimElementsJson: true },
        });

        const parsedElements = invention?.parsedClaimElementsJson
          ? (JSON.parse(invention.parsedClaimElementsJson) as string[])
          : [];

        if (parsedElements.length > 0) {
          // Fetch full job details to check staleness
          const fullJobDetails = (await prisma.citationJob.findMany({
            where: {
              id: { in: referenceIds },
            },
            select: {
              id: true,
              referenceNumber: true,
              // @ts-ignore - Fields exist after migration 20250714182540
              claim1Hash: true,
              // @ts-ignore - Fields exist after migration 20250714182540
              parserVersionUsed: true,
              searchHistoryId: true,
            },
          })) as any as Array<{
            id: string;
            referenceNumber: string | null;
            claim1Hash: string | null;
            parserVersionUsed: string | null;
            searchHistoryId: string;
          }>;

          // Check and refresh stale analyses
          const refreshedJobMap =
            await CitationRefreshService.refreshStaleAnalyses(
              fullJobDetails,
              claim1Text,
              parsedElements,
              projectId
            );

          // If any jobs were refreshed, fetch the updated deep analyses
          if (refreshedJobMap.size > 0) {
            logger.info('[CombinedAnalysis] Refreshed stale analyses', {
              refreshedCount: refreshedJobMap.size,
              refreshedRefs: Array.from(refreshedJobMap.entries()).map(
                ([oldId, newId]) => ({
                  oldId,
                  newId,
                })
              ),
            });

            // Replace the old job IDs with new ones and re-fetch
            const updatedReferenceIds = referenceIds.map(
              (id: string) => refreshedJobMap.get(id) || id
            );

            const updatedDeepAnalysisJobs =
              await getCitationJobsDeepAnalysisByIds(updatedReferenceIds);

            if (
              updatedDeepAnalysisJobs &&
              updatedDeepAnalysisJobs.length === referenceIds.length
            ) {
              // Use the refreshed analyses
              deepAnalysisJobs.splice(
                0,
                deepAnalysisJobs.length,
                ...updatedDeepAnalysisJobs
              );
            }
          }
        }
      } catch (error) {
        logger.warn('[CombinedAnalysis] Failed to refresh stale analyses', {
          error,
          projectId,
        });
        // Continue with existing analyses - don't block the combined analysis
      }
    }

    // Use provided reference numbers if available, otherwise extract from jobs
    const referenceNumbers =
      providedRefNumbers && providedRefNumbers.length === referenceIds.length
        ? providedRefNumbers
        : deepAnalysisJobs
            .map(job => job.referenceNumber)
            .filter((ref): ref is string => ref !== null);

    logger.debug('Reference numbers extracted', { referenceNumbers });

    // Fetch applicant/assignee data from citation matches
    const referenceMetadata: ReferenceMetadata[] = await Promise.all(
      referenceNumbers.map(async (refNum: string) => {
        try {
          if (!prisma) {
            logger.warn('Prisma not available for metadata fetch');
            return {
              referenceNumber: refNum,
              applicant: null,
              assignee: null,
              title: null,
            };
          }

          // Handle both formats - with and without hyphens
          const cleanRefNum = refNum.replace(/-/g, '');
          // Add hyphens in standard format: US-12345678-A1
          const hyphenatedRefNum = cleanRefNum.replace(
            /^([A-Z]{2})(\d+)([A-Z]\d*)$/,
            '$1-$2-$3'
          );

          logger.debug(`Fetching metadata for reference ${refNum}`, {
            searchHistoryId,
            cleanRefNum,
            hyphenatedRefNum,
          });

          // Try to find a citation match - check all possible formats
          const match = await prisma.citationMatch.findFirst({
            where: {
              searchHistoryId,
              OR: [
                { referenceNumber: refNum }, // As provided
                { referenceNumber: cleanRefNum }, // Without hyphens
                { referenceNumber: hyphenatedRefNum }, // With standard hyphens
              ],
            },
            select: {
              id: true,
              referenceApplicant: true,
              referenceAssignee: true,
              referenceTitle: true,
              referenceNumber: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          });

          if (match) {
            logger.info(`Found match for ${refNum}:`, {
              matchId: match.id,
              dbRefNumber: match.referenceNumber,
              hasApplicant: !!match.referenceApplicant,
              applicantPreview: match.referenceApplicant?.substring(0, 30),
            });
          } else {
            logger.warn(
              `No match found for ${refNum} in searchHistory ${searchHistoryId}`,
              {
                triedFormats: [refNum, cleanRefNum, hyphenatedRefNum],
              }
            );
          }

          return {
            referenceNumber: refNum,
            applicant: match?.referenceApplicant || null,
            assignee: match?.referenceAssignee || null,
            title: match?.referenceTitle || null,
          };
        } catch (error) {
          logger.error(`Failed to fetch metadata for reference ${refNum}`, {
            error: error instanceof Error ? error.message : String(error),
            searchHistoryId,
            refNum,
          });
          // Return empty metadata instead of throwing
          return {
            referenceNumber: refNum,
            applicant: null,
            assignee: null,
            title: null,
          };
        }
      })
    );

    logger.info('Reference metadata fetched', {
      metadata: referenceMetadata.map(m => ({
        ref: m.referenceNumber,
        applicant: m.applicant,
        assignee: m.assignee,
        hasApplicant: !!m.applicant,
        hasAssignee: !!m.assignee,
      })),
    });

    // Extract just the deepAnalysisJson strings, ensuring they are valid
    const deepAnalyses = deepAnalysisJobs.map(job => {
      if (!job.deepAnalysisJson) {
        throw new ApplicationError(
          ErrorCode.VALIDATION_FAILED,
          `Deep analysis JSON is missing for reference job ID: ${job.id} (Ref: ${
            job.referenceNumber || 'Unknown'
          })`
        );
      }
      return job.deepAnalysisJson;
    });

    const result: StructuredCombinedAnalysis = await runCombinedDeepAnalysis({
      claim1Text,
      deepAnalyses, // Pass the array of deepAnalysisJson strings
      referenceIds: referenceNumbers, // Pass the human-readable reference numbers to the AI
      referenceMetadata,
      inventionData,
      allClaims,
    });

    // ============================================================================
    // PHASE 3: MULTI-REFERENCE VALIDATION (Optional - Feature Flag Controlled)
    // ============================================================================
    let enhancedResult = result;
    
    // Check feature flag for multi-reference validation
    const enableMultiReferenceValidation = environment.features.enableMultiReferenceValidation || false;
    
    if (enableMultiReferenceValidation && result.strategicRecommendations && result.strategicRecommendations.length > 0) {
      logger.info('[CombinedAnalysis] Starting Phase 3: Multi-reference validation', {
        suggestionCount: result.strategicRecommendations.length,
        referenceCount: referenceNumbers.length,
      });

      try {
        // Import validation service dynamically to avoid circular dependencies
        const { SuggestionValidationService } = await import('@/server/services/suggestion-validation.server-service');
        
        // Transform strategic recommendations to potential amendments format
        const potentialAmendments = result.strategicRecommendations.map(rec => ({
          suggestionText: rec.suggestedAmendmentLanguage,
          reasoning: rec.recommendation,
          addressesRejections: ['combined_prior_art'],
          priority: 'high' as const,
        }));

        // Run multi-reference validation
        const validationResults = await SuggestionValidationService.validateSuggestionsMultiReference(
          potentialAmendments,
          referenceNumbers,
          claim1Text
        );

        // Enhance strategic recommendations with validation data
        const enhancedRecommendations = result.strategicRecommendations.map(rec => {
          const validation = validationResults[rec.suggestedAmendmentLanguage];
          
          return {
            ...rec,
            // Add validation fields
            validation: validation ? {
              isValidated: true,
              isDisclosedInAny: validation.isDisclosedInAny,
              recommendation: validation.recommendation,
              validationScore: validation.overallValidationScore,
              disclosingReferences: validation.disclosingReferences,
              validationSummary: validation.validationSummary,
              disclosureByReference: validation.disclosureByReference,
            } : {
              isValidated: false,
              isDisclosedInAny: false,
              recommendation: 'keep' as const,
              validationScore: 0,
              disclosingReferences: [],
              validationSummary: 'Validation not performed',
              disclosureByReference: {},
            }
          };
        });

        // Create enhanced result with validation data
        enhancedResult = {
          ...result,
          strategicRecommendations: enhancedRecommendations,
          // Add validation summary to the result
          validationSummary: {
            totalSuggestions: result.strategicRecommendations.length,
            validatedSuggestions: Object.keys(validationResults).length,
            disclosedCount: Object.values(validationResults).filter(v => v.isDisclosedInAny).length,
            keepCount: Object.values(validationResults).filter(v => v.recommendation === 'keep').length,
            validationEnabled: true,
            referenceCount: referenceNumbers.length,
            referenceNumbers: referenceNumbers,
          }
        };

        logger.info('[CombinedAnalysis] Phase 3 validation complete', {
          totalSuggestions: result.strategicRecommendations.length,
          disclosedCount: Object.values(validationResults).filter(v => v.isDisclosedInAny).length,
          keepCount: Object.values(validationResults).filter(v => v.recommendation === 'keep').length,
        });

      } catch (validationError) {
        logger.error('[CombinedAnalysis] Phase 3 validation failed', {
          error: validationError,
          suggestionCount: result.strategicRecommendations.length,
        });
        
        // Add validation failure info but don't break the analysis
                 enhancedResult = {
           ...result,
           validationSummary: {
             totalSuggestions: result.strategicRecommendations.length,
             validatedSuggestions: 0,
             disclosedCount: 0,
             keepCount: 0,
             validationEnabled: true,
             validationError: 'Validation failed - suggestions not validated against prior art',
             referenceCount: referenceNumbers.length,
             referenceNumbers: referenceNumbers,
           }
         };
      }
    } else {
      // Add validation summary indicating validation was not performed
             enhancedResult = {
         ...result,
         validationSummary: {
           totalSuggestions: result.strategicRecommendations?.length || 0,
           validatedSuggestions: 0,
           disclosedCount: 0,
           keepCount: 0,
           validationEnabled: false,
           referenceCount: referenceNumbers.length,
           referenceNumbers: referenceNumbers,
         }
       };
      
      if (enableMultiReferenceValidation) {
        logger.info('[CombinedAnalysis] Phase 3 validation skipped - no suggestions to validate');
      }
    }

    // Generate claim hash for tracking
    const claim1Hash = generateClaimHash(claim1Text);

    // Prepare data for saving with version tracking
    const analysisData: any = {
      searchHistoryId,
      userId,
      referenceNumbers,
      analysisJson: JSON.stringify(enhancedResult),
      claim1Text,
    };

    // Add tracking fields if migration has been applied
    if (prisma) {
      try {
        await prisma.$executeRaw`
          INSERT INTO combined_examiner_analyses (
            id, searchHistoryId, userId, referenceNumbers, analysisJson, 
            claim1Text, createdAt, updatedAt,
            claim1Hash, citationJobIds, parserVersionUsed
          ) VALUES (
            ${require('crypto').randomUUID()},
            ${searchHistoryId},
            ${userId},
            ${JSON.stringify(referenceNumbers)},
            ${JSON.stringify(enhancedResult)},
            ${claim1Text},
            ${new Date()},
            ${new Date()},
            ${claim1Hash},
            ${JSON.stringify(referenceIds)},
            ${CURRENT_PARSER_VERSION}
          )
        `;

        logger.info('Saved combined analysis with version tracking', {
          searchHistoryId,
          referenceCount: referenceNumbers.length,
          claim1Hash,
        });

        return res.status(200).json({
          success: true,
          data: { analysis: enhancedResult },
        });
      } catch (error) {
        logger.warn('Could not save with version tracking, falling back', {
          error,
        });
        // Fall back to regular save
      }
    }

    // Fallback: Save the analysis to the database without tracking
    const savedAnalysis =
      await combinedAnalysisRepository.createCombinedAnalysis(analysisData);

    logger.info('Saved combined analysis', {
      analysisId: savedAnalysis.id,
      searchHistoryId,
      referenceCount: referenceNumbers.length,
    });

    return res.status(200).json({
      success: true,
      data: { analysis: enhancedResult },
    }); // Send the structured analysis back
  } catch (error) {
    logger.error('Combined analysis failed', {
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      searchHistoryId: req.body?.searchHistoryId,
      referenceIds: req.body?.referenceIds,
    });

    if (error instanceof ApplicationError) {
      return res.status(400).json({
        error: error.message,
        code: error.code,
      });
    }

    return res.status(500).json({
      error: 'Failed to generate combined analysis',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Use the new secure preset
export default SecurePresets.tenantProtected(
  TenantResolvers.fromUser,
  handler,
  {
    validate: {
      body: bodySchema,
    },
  }
);

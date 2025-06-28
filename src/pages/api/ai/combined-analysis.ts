import { NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { findDeepAnalysisByIds as getCitationJobsDeepAnalysisByIds } from '@/repositories/citationJobRepository';
import * as combinedAnalysisRepository from '@/repositories/combinedExaminerAnalysisRepository';
import { findSearchHistoryById } from '@/repositories/search/searchHistory.repository';
import { CustomApiRequest } from '@/types/api';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';
import { processWithOpenAI } from '@/server/ai/aiService';
import { logger } from '@/lib/monitoring/logger';
import {
  COMBINED_ANALYSIS_PROMPT_V2,
  COMBINED_ANALYSIS_SYSTEM_MESSAGE_V2,
  COMBINED_ANALYSIS_JSON_STRUCTURE_V2,
} from '@/server/prompts/prompts/templates/combinedAnalysis';
import { renderPromptTemplate } from '@/server/prompts/prompts/utils';
import { safeJsonParse } from '@/utils/json-utils';
import { inventionDataService } from '@/server/services/invention-data.server-service';

import { StructuredCombinedAnalysis } from '@/client/services/patent/patentability/combinedAnalysisService';
import { InventionData } from '@/types/invention';

// Type for deep analysis data that could be JSON string or parsed object
type DeepAnalysisData = string | Record<string, unknown>;

interface CombinedDeepAnalysisInput {
  claim1Text: string;
  deepAnalyses: DeepAnalysisData[];
  referenceIds: string[];
  inventionData?: InventionData | null;
}

/**
 * Runs a combined deep analysis using the provided claim and deep analysis JSONs.
 * This is a server-side only function.
 */
async function runCombinedDeepAnalysis({
  claim1Text,
  deepAnalyses,
  referenceIds,
  inventionData,
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
      return `Reference ${referenceIds[idx]} Deep Analysis:\n${analysisContent}`;
    })
    .join('\n\n---\n\n');

  const desiredJsonStructureString = JSON.stringify(
    COMBINED_ANALYSIS_JSON_STRUCTURE_V2,
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

  const prompt = renderPromptTemplate(COMBINED_ANALYSIS_PROMPT_V2, {
    claimText: claim1Text,
    referencesSection,
    desiredJsonStructure: desiredJsonStructureString,
    inventionContext,
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
}

// Zod schema for request validation
const bodySchema = z.object({
  claim1Text: z.string().min(10),
  referenceIds: z.array(z.string().min(1)).min(2),
  referenceNumbers: z.array(z.string()).optional(),
  searchHistoryId: z.string().min(1),
});

const handler = async (
  req: CustomApiRequest<CombinedAnalysisBody> & AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
  const {
    claim1Text,
    referenceIds,
    referenceNumbers: providedRefNumbers,
    searchHistoryId,
  } = req.body;
  const userId = req.user?.id || null; // Get user ID from authenticated request

  // Extract projectId from searchHistoryId to fetch invention data
  const searchHistory = await findSearchHistoryById(searchHistoryId);
  const projectId = searchHistory?.projectId;

  // Fetch invention data if we have a projectId
  let inventionData: InventionData | null = null;
  if (projectId) {
    try {
      inventionData = await inventionDataService.getInventionData(projectId);
    } catch (error) {
      logger.warn('Failed to fetch invention data for combined analysis', {
        error,
        projectId,
      });
      // Continue without invention data - it's optional
    }
  }

  // Fetch deepAnalysisJson for all selected references
  const deepAnalysisJobs = await getCitationJobsDeepAnalysisByIds(referenceIds);
  if (!deepAnalysisJobs || deepAnalysisJobs.length !== referenceIds.length) {
    throw new ApplicationError(
      ErrorCode.DB_RECORD_NOT_FOUND,
      'One or more references not found or missing deep analysis.'
    );
  }

  // Use provided reference numbers if available, otherwise extract from jobs
  const referenceNumbers =
    providedRefNumbers && providedRefNumbers.length === referenceIds.length
      ? providedRefNumbers
      : deepAnalysisJobs
          .map(job => job.referenceNumber)
          .filter((ref): ref is string => ref !== null);

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
    inventionData,
  });

  // Save the analysis to the database
  const savedAnalysis = await combinedAnalysisRepository.createCombinedAnalysis(
    {
      searchHistoryId,
      userId,
      referenceNumbers,
      analysisJson: JSON.stringify(result),
      claim1Text,
    }
  );

  logger.info('Saved combined analysis', {
    analysisId: savedAnalysis.id,
    searchHistoryId,
    referenceCount: referenceNumbers.length,
  });

  res.status(200).json({ analysis: result }); // Send the structured analysis back
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

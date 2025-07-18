/**
 * Rejection Analysis API Service
 * 
 * Client-side service for analyzing Office Action rejections
 * Follows existing API service patterns for consistency
 */

import { z } from 'zod';
import { apiFetch } from '@/lib/api/apiClient';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/utils/clientLogger';
import type {
  RejectionAnalysisResult,
  StrategyRecommendation,
  AnalyzeOfficeActionResponse,
} from '@/types/domain/rejection-analysis';

// ============ RESPONSE SCHEMAS ============

const RejectionAnalysisResultSchema = z.object({
  rejectionId: z.string(),
  strength: z.enum(['STRONG', 'MODERATE', 'WEAK', 'FLAWED']),
  confidenceScore: z.number(),
  examinerReasoningGaps: z.array(z.string()),
  claimChart: z.array(z.object({
    claimElement: z.string(),
    priorArtDisclosure: z.string(),
    isDisclosed: z.boolean(),
    notes: z.string(),
  })).optional(),
  recommendedStrategy: z.enum(['ARGUE', 'AMEND', 'COMBINATION']),
  strategyRationale: z.string(),
  argumentPoints: z.array(z.string()),
  amendmentSuggestions: z.array(z.string()),
  analyzedAt: z.union([
    z.string().transform(str => new Date(str)),
    z.date(),
    z.string().datetime(),
  ]).transform(val => val instanceof Date ? val : new Date(val)),
});

const StrategyRecommendationSchema = z.object({
  primaryStrategy: z.enum(['ARGUE', 'AMEND', 'COMBINATION']),
  alternativeStrategies: z.array(z.string()),
  confidence: z.number(),
  reasoning: z.string(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  keyConsiderations: z.array(z.string()),
});

const AnalyzeOfficeActionResponseSchema = z.object({
  success: z.boolean(),
  analyses: z.array(RejectionAnalysisResultSchema),
  overallStrategy: StrategyRecommendationSchema,
});

// ============ SERVICE CLASS ============

export class RejectionAnalysisApiService {
  /**
   * Analyze all rejections for an Office Action
   */
  static async analyzeOfficeActionRejections(
    projectId: string,
    officeActionId: string,
    options?: {
      includeClaimCharts?: boolean;
    }
  ): Promise<{
    analyses: RejectionAnalysisResult[];
    overallStrategy: StrategyRecommendation;
  }> {
    logger.info('[RejectionAnalysisApiService] Analyzing Office Action rejections', {
      projectId,
      officeActionId,
      options,
    });

    try {
      const response = await apiFetch(
        `/api/projects/${projectId}/office-actions/${officeActionId}/analyze-rejections`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            includeClaimCharts: options?.includeClaimCharts ?? true,
          }),
        },
        {
          timeout: 120000, // 2 minutes for rejection analysis
        }
      );

      const rawData = await response.json();
      
      // Unwrap the data if it's wrapped by apiResponse.ok()
      const data = rawData.data || rawData;
      
      // Log the raw response for debugging
      logger.debug('[RejectionAnalysisApiService] Raw API response', {
        projectId,
        officeActionId,
        rawResponseKeys: Object.keys(rawData),
        unwrappedResponseKeys: Object.keys(data),
        wasWrapped: 'data' in rawData,
        hasAnalyses: 'analyses' in data,
        hasOverallStrategy: 'overallStrategy' in data,
        hasSuccess: 'success' in data,
        analysesType: Array.isArray(data.analyses) ? 'array' : typeof data.analyses,
        analysesLength: Array.isArray(data.analyses) ? data.analyses.length : 'N/A',
        overallStrategyKeys: data.overallStrategy ? Object.keys(data.overallStrategy) : 'null',
        dataPreview: JSON.stringify(data).substring(0, 300) + '...',
      });
      
      const validated = AnalyzeOfficeActionResponseSchema.parse(data);

      logger.info('[RejectionAnalysisApiService] Analysis completed successfully', {
        projectId,
        officeActionId,
        rejectionCount: validated.analyses.length,
        overallStrategy: validated.overallStrategy.primaryStrategy,
      });

      return {
        analyses: validated.analyses,
        overallStrategy: validated.overallStrategy,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error('[RejectionAnalysisApiService] Validation error details', {
          projectId,
          officeActionId,
          zodErrors: error.errors,
          fullErrorMessage: error.message,
        });
        
        throw new ApplicationError(
          ErrorCode.VALIDATION_FAILED,
          `Invalid response from server: ${error.message}`
        );
      }

      logger.error('[RejectionAnalysisApiService] Failed to analyze rejections', {
        projectId,
        officeActionId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        `Failed to analyze rejections: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Analyze a single rejection
   */
  static async analyzeRejection(
    projectId: string,
    officeActionId: string,
    rejectionId: string,
    options?: {
      includeClaimChart?: boolean;
      includePriorArtFullText?: boolean;
    }
  ): Promise<RejectionAnalysisResult> {
    logger.info('[RejectionAnalysisApiService] Analyzing single rejection', {
      projectId,
      officeActionId,
      rejectionId,
      options,
    });

    try {
      const response = await apiFetch(
        `/api/projects/${projectId}/office-actions/${officeActionId}/rejections/${rejectionId}/analyze`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(options || {}),
        },
        {
          timeout: 120000, // 2 minutes for rejection analysis
        }
      );

      const rawData = await response.json();
      
      // Unwrap the data if it's wrapped by apiResponse.ok()
      const data = rawData.data || rawData;
      
      const validated = RejectionAnalysisResultSchema.parse(data);

      logger.info('[RejectionAnalysisApiService] Rejection analyzed successfully', {
        rejectionId,
        strength: validated.strength,
        strategy: validated.recommendedStrategy,
      });

      return validated;
    } catch (error) {
      logger.error('[RejectionAnalysisApiService] Failed to analyze rejection', {
        rejectionId,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof z.ZodError) {
        throw new ApplicationError(
          ErrorCode.VALIDATION_FAILED,
          'Invalid response from server'
        );
      }

      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        `Failed to analyze rejection: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
} 
/**
 * Rejection Analysis Hook
 * 
 * Fetches rejection analysis data from the new structured tables
 * Follows existing React Query patterns
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/apiClient';
import { logger } from '@/utils/clientLogger';
import { z } from 'zod';
import type {
  RejectionAnalysisResult,
  StrategyRecommendation,
  OfficeActionAnalysis,
} from '@/types/domain/rejection-analysis';

// ============ LEGACY TYPES - Keep for backward compatibility ============

export interface RejectionAnalysis {
  rejectionId: string;
  strengthScore: number;
  suggestedStrategy: 'ARGUE' | 'AMEND' | 'COMBINATION';
  priorArtMapping: Record<string, string[]>;
  reasoning: string;
  confidenceScore: number;
  modelVersion: string;
  agentVersion: string;
}

export interface OfficeActionSummary {
  summaryText: string;
  keyIssues: string[];
  examinerTone: 'FAVORABLE' | 'NEUTRAL' | 'HOSTILE';
  responseComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
  claimImpactMap: Record<string, string>;
  strategyHint: string;
  num102Rejections: number;
  num103Rejections: number;
  num101Rejections: number;
  num112Rejections: number;
  totalClaimsRejected: number;
}

// ============ VALIDATION SCHEMAS ============

const RejectionAnalysisSchema = z.object({
  rejectionId: z.string(),
  strengthScore: z.number(),
  suggestedStrategy: z.enum(['ARGUE', 'AMEND', 'COMBINATION']),
  priorArtMapping: z.record(z.array(z.string())),
  reasoning: z.string(),
  confidenceScore: z.number(),
  modelVersion: z.string(),
  agentVersion: z.string(),
});

const OfficeActionSummarySchema = z.object({
  summaryText: z.string(),
  keyIssues: z.array(z.string()),
  examinerTone: z.enum(['FAVORABLE', 'NEUTRAL', 'HOSTILE']),
  responseComplexity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  claimImpactMap: z.record(z.string()),
  strategyHint: z.string(),
  num102Rejections: z.number(),
  num103Rejections: z.number(),
  num101Rejections: z.number(),
  num112Rejections: z.number(),
  totalClaimsRejected: z.number(),
});

const StrategyRecommendationSchema = z.object({
  overallStrategy: z.enum(['ARGUE_ALL', 'AMEND_NARROW', 'MIXED_APPROACH', 'FILE_CONTINUATION']),
  priorityActions: z.array(z.string()),
  estimatedDifficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  successProbability: z.number(),
  keyArguments: z.record(z.string()),
  amendmentFocus: z.record(z.array(z.string())),
  alternativeOptions: z.array(z.string()),
  reasoning: z.string(),
});

// ============ QUERY KEYS ============

export const rejectionAnalysisQueryKeys = {
  all: ['rejectionAnalysis'] as const,
  byRejection: (rejectionId: string) => ['rejectionAnalysis', 'rejection', rejectionId] as const,
  byOfficeAction: (officeActionId: string) => ['rejectionAnalysis', 'officeAction', officeActionId] as const,
  summary: (officeActionId: string) => ['rejectionAnalysis', 'summary', officeActionId] as const,
  strategy: (officeActionId: string) => ['rejectionAnalysis', 'strategy', officeActionId] as const,
};

// ============ HOOKS ============

/**
 * Fetch rejection analysis for a specific rejection
 */
export function useRejectionAnalysis(rejectionId: string) {
  return useQuery({
    queryKey: rejectionAnalysisQueryKeys.byRejection(rejectionId),
    queryFn: async () => {
      logger.debug('[useRejectionAnalysis] Fetching analysis', { rejectionId });
      
      const response = await apiFetch(`/api/rejections/${rejectionId}/analysis`);
      const data = await response.json();
      
      if (!data) {
        return null;
      }
      
      return RejectionAnalysisSchema.parse(data);
    },
    enabled: !!rejectionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch all rejection analyses for an office action
 * Returns the enhanced RejectionAnalysisResult array from domain types
 */
export function useOfficeActionAnalyses(officeActionId: string, projectId?: string) {
  return useQuery<RejectionAnalysisResult[]>({
    queryKey: rejectionAnalysisQueryKeys.byOfficeAction(officeActionId),
    queryFn: async () => {
      logger.debug('[useOfficeActionAnalyses] Fetching analyses', { officeActionId, projectId });
      
      if (!projectId) {
        logger.warn('[useOfficeActionAnalyses] No projectId provided, cannot fetch analyses');
        return [];
      }
      
      const response = await apiFetch(
        `/api/projects/${projectId}/office-actions/${officeActionId}/analyze-rejections`
      );
      const data = await response.json();
      
      // Handle the wrapped response format from apiResponse.ok()
      // Response structure: { data: { success: true, analyses: [...], overallStrategy: {...} } }
      const responseData = data.data || data;
      
      if (!responseData || !responseData.success) {
        logger.warn('[useOfficeActionAnalyses] No successful response data', { responseData });
        return [];
      }
      
      const analyses = responseData.analyses || [];
      logger.debug('[useOfficeActionAnalyses] Successfully parsed analyses', { 
        analysisCount: analyses.length,
        officeActionId,
        projectId 
      });
      
      return analyses;
    },
    enabled: !!officeActionId && !!projectId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch office action summary
 */
export function useOfficeActionSummary(officeActionId: string) {
  return useQuery({
    queryKey: rejectionAnalysisQueryKeys.summary(officeActionId),
    queryFn: async () => {
      logger.debug('[useOfficeActionSummary] Fetching summary', { officeActionId });
      
      const response = await apiFetch(`/api/office-actions/${officeActionId}/summary`);
      const data = await response.json();
      
      if (!data) {
        return null;
      }
      
      return OfficeActionSummarySchema.parse(data);
    },
    enabled: !!officeActionId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch strategy recommendation
 * Returns the enhanced StrategyRecommendation from domain types
 */
export function useStrategyRecommendation(officeActionId: string, projectId?: string) {
  return useQuery<StrategyRecommendation | null>({
    queryKey: rejectionAnalysisQueryKeys.strategy(officeActionId),
    queryFn: async () => {
      logger.debug('[useStrategyRecommendation] Fetching strategy', { officeActionId, projectId });
      
      if (!projectId) {
        logger.warn('[useStrategyRecommendation] No projectId provided, cannot fetch strategy');
        return null;
      }
      
      const response = await apiFetch(
        `/api/projects/${projectId}/office-actions/${officeActionId}/analyze-rejections`
      );
      const data = await response.json();
      
      // Handle the wrapped response format from apiResponse.ok()
      // Response structure: { data: { success: true, analyses: [...], overallStrategy: {...} } }
      const responseData = data.data || data;
      
      if (!responseData || !responseData.success) {
        logger.warn('[useStrategyRecommendation] No successful response data', { responseData });
        return null;
      }
      
      const strategy = responseData.overallStrategy || null;
      logger.debug('[useStrategyRecommendation] Successfully parsed strategy', { 
        hasStrategy: !!strategy,
        primaryStrategy: strategy?.primaryStrategy,
        officeActionId,
        projectId 
      });
      
      return strategy;
    },
    enabled: !!officeActionId && !!projectId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch orchestration job status
 */
export function useOrchestrationStatus(jobId: string | null) {
  return useQuery({
    queryKey: ['orchestrationJob', jobId],
    queryFn: async () => {
      if (!jobId) return null;
      
      logger.debug('[useOrchestrationStatus] Fetching job status', { jobId });
      
      const response = await apiFetch(`/api/jobs/${jobId}/status`);
      const data = await response.json();
      
      return data;
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      // Poll while processing
      const data = query.state.data;
      if (data?.status === 'PROCESSING' || data?.status === 'PENDING') {
        return 2000; // 2 seconds
      }
      return false;
    },
  });
} 
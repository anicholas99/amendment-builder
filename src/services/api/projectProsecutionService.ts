/**
 * Project Prosecution Service
 * 
 * Aggregates comprehensive prosecution data for enhanced Amendment UI
 * Provides attorney-focused intelligence including timelines, examiner analytics,
 * and strategic insights following established service patterns
 */

import { apiFetch } from '@/lib/api/apiClient';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/utils/clientLogger';
import { z } from 'zod';

// ============ VALIDATION SCHEMAS ============

const ProsecutionTimelineEventSchema = z.object({
  id: z.string(),
  type: z.enum(['FILING', 'OFFICE_ACTION', 'RESPONSE', 'NOTICE_OF_ALLOWANCE', 'FINAL_REJECTION', 'RCE']),
  date: z.string().datetime(),
  title: z.string(),
  description: z.string().optional(),
  status: z.string(),
  daysFromPrevious: z.number().optional(),
});

const ExaminerAnalyticsSchema = z.object({
  examiner: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    artUnit: z.string().optional(),
  }),
  statistics: z.object({
    allowanceRate: z.number(),
    averageOAsToAllowance: z.number(),
    appealSuccessRate: z.number(),
    averageResponseTime: z.number(), // in days
    finalRejectionRate: z.number(),
  }),
  patterns: z.object({
    commonRejectionTypes: z.array(z.object({
      type: z.string(),
      frequency: z.number(),
      percentage: z.number(),
    })),
    priorArtPreferences: z.array(z.object({
      source: z.string(),
      frequency: z.number(),
    })),
    argumentSuccessRates: z.array(z.object({
      argument: z.string(),
      successRate: z.number(),
    })),
  }),
});

const ApplicationMetadataSchema = z.object({
  applicationNumber: z.string().optional(),
  title: z.string().optional(),
  filingDate: z.string().datetime().optional(),
  publicationDate: z.string().datetime().optional(),
  inventors: z.array(z.string()).optional(),
  assignee: z.string().optional(),
  artUnit: z.string().optional(),
  confirmationNumber: z.string().optional(),
  prosecutionStatus: z.enum(['PRE_FILING', 'PENDING_RESPONSE', 'ACTIVE', 'ALLOWED', 'ABANDONED', 'ISSUED']),
});

const ClaimChangesSummarySchema = z.object({
  totalAmendedClaims: z.number(),
  newClaims: z.number(),
  cancelledClaims: z.number(),
  lastAmendmentDate: z.string().datetime().optional(),
  pendingValidation: z.boolean(),
  highRiskAmendments: z.number(),
});

const ProsecutionOverviewSchema = z.object({
  applicationMetadata: ApplicationMetadataSchema,
  prosecutionTimeline: z.array(ProsecutionTimelineEventSchema),
  examinerAnalytics: ExaminerAnalyticsSchema.optional(),
  currentOfficeAction: z.object({
    id: z.string(),
    type: z.enum(['NON_FINAL', 'FINAL', 'NOTICE_OF_ALLOWANCE', 'OTHER']),
    dateIssued: z.string().datetime(),
    daysToRespond: z.number(),
    responseDeadline: z.string().datetime(),
    rejectionSummary: z.object({
      total: z.number(),
      byType: z.record(z.number()),
      claimsAffected: z.array(z.string()),
      riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    }),
    aiStrategy: z.object({
      primaryApproach: z.enum(['ARGUE', 'AMEND', 'COMBINATION']),
      confidence: z.number(),
      reasoning: z.string(),
    }).optional(),
  }).optional(),
  responseStatus: z.object({
    draft: z.number(),
    inReview: z.number(),
    readyToFile: z.number(),
    filed: z.number(),
  }),
  claimChanges: ClaimChangesSummarySchema,
  alerts: z.array(z.object({
    id: z.string(),
    type: z.enum(['DEADLINE', 'VALIDATION', 'STRATEGY', 'RISK']),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    title: z.string(),
    message: z.string(),
    actionRequired: z.boolean(),
    dueDate: z.string().datetime().optional(),
  })),
  prosecutionStatistics: z.object({
    totalOfficeActions: z.number(),
    totalResponses: z.number(),
    prosecutionDuration: z.number(), // in days
    averageResponseTime: z.number(),
    nextMilestone: z.string().optional(),
  }),
});

// ============ PROCESSED TYPES ============

export interface ProsecutionOverview {
  applicationMetadata: {
    applicationNumber?: string;
    title?: string;
    filingDate?: Date;
    publicationDate?: Date;
    inventors?: string[];
    assignee?: string;
    artUnit?: string;
    confirmationNumber?: string;
    prosecutionStatus: 'PRE_FILING' | 'PENDING_RESPONSE' | 'ACTIVE' | 'ALLOWED' | 'ABANDONED' | 'ISSUED';
  };
  prosecutionTimeline: Array<{
    id: string;
    type: 'FILING' | 'OFFICE_ACTION' | 'RESPONSE' | 'NOTICE_OF_ALLOWANCE' | 'FINAL_REJECTION' | 'RCE';
    date: Date;
    title: string;
    description?: string;
    status: string;
    daysFromPrevious?: number;
  }>;
  examinerAnalytics?: {
    examiner: {
      id?: string;
      name?: string;
      artUnit?: string;
    };
    statistics: {
      allowanceRate: number;
      averageOAsToAllowance: number;
      appealSuccessRate: number;
      averageResponseTime: number;
      finalRejectionRate: number;
    };
    patterns: {
      commonRejectionTypes: Array<{
        type: string;
        frequency: number;
        percentage: number;
      }>;
      priorArtPreferences: Array<{
        source: string;
        frequency: number;
      }>;
      argumentSuccessRates: Array<{
        argument: string;
        successRate: number;
      }>;
    };
  };
  currentOfficeAction?: {
    id: string;
    type: 'NON_FINAL' | 'FINAL' | 'NOTICE_OF_ALLOWANCE' | 'OTHER';
    dateIssued: Date;
    daysToRespond: number;
    responseDeadline: Date;
    rejectionSummary: {
      total: number;
      byType: Record<string, number>;
      claimsAffected: string[];
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    };
    aiStrategy?: {
      primaryApproach: 'ARGUE' | 'AMEND' | 'COMBINATION';
      confidence: number;
      reasoning: string;
    };
  };
  responseStatus: {
    draft: number;
    inReview: number;
    readyToFile: number;
    filed: number;
  };
  claimChanges: {
    totalAmendedClaims: number;
    newClaims: number;
    cancelledClaims: number;
    lastAmendmentDate?: Date;
    pendingValidation: boolean;
    highRiskAmendments: number;
  };
  alerts: Array<{
    id: string;
    type: 'DEADLINE' | 'VALIDATION' | 'STRATEGY' | 'RISK';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    message: string;
    actionRequired: boolean;
    dueDate?: Date;
  }>;
  prosecutionStatistics: {
    totalOfficeActions: number;
    totalResponses: number;
    prosecutionDuration: number;
    averageResponseTime: number;
    nextMilestone?: string;
  };
}

// ============ SERVICE CLASS ============

export class ProjectProsecutionService {
  /**
   * Get comprehensive prosecution overview for a project
   */
  static async getProsecutionOverview(projectId: string): Promise<ProsecutionOverview> {
    logger.debug('[ProjectProsecutionService] Fetching prosecution overview', { projectId });

    try {
      const response = await apiFetch(`/api/projects/${projectId}/prosecution-overview`);
      const rawData = await response.json();
      
      // Handle wrapped response data
      const data = rawData.data || rawData;
      
      const validated = ProsecutionOverviewSchema.parse(data);
      
      // Transform to processed types with proper date parsing
      const prosecutionOverview: ProsecutionOverview = {
        applicationMetadata: {
          applicationNumber: validated.applicationMetadata.applicationNumber,
          title: validated.applicationMetadata.title,
          filingDate: validated.applicationMetadata.filingDate ? new Date(validated.applicationMetadata.filingDate) : undefined,
          publicationDate: validated.applicationMetadata.publicationDate ? new Date(validated.applicationMetadata.publicationDate) : undefined,
          inventors: validated.applicationMetadata.inventors,
          assignee: validated.applicationMetadata.assignee,
          artUnit: validated.applicationMetadata.artUnit,
          confirmationNumber: validated.applicationMetadata.confirmationNumber,
          prosecutionStatus: validated.applicationMetadata.prosecutionStatus,
        },
        prosecutionTimeline: validated.prosecutionTimeline.map(event => ({
          id: event.id,
          type: event.type,
          date: new Date(event.date),
          title: event.title,
          description: event.description,
          status: event.status,
          daysFromPrevious: event.daysFromPrevious,
        })),
        examinerAnalytics: validated.examinerAnalytics ? {
          examiner: validated.examinerAnalytics.examiner,
          statistics: validated.examinerAnalytics.statistics,
          patterns: validated.examinerAnalytics.patterns,
        } : undefined,
        currentOfficeAction: validated.currentOfficeAction ? {
          id: validated.currentOfficeAction.id,
          type: validated.currentOfficeAction.type,
          dateIssued: new Date(validated.currentOfficeAction.dateIssued),
          daysToRespond: validated.currentOfficeAction.daysToRespond,
          responseDeadline: new Date(validated.currentOfficeAction.responseDeadline),
          rejectionSummary: validated.currentOfficeAction.rejectionSummary,
          aiStrategy: validated.currentOfficeAction.aiStrategy,
        } : undefined,
        responseStatus: validated.responseStatus,
        claimChanges: {
          totalAmendedClaims: validated.claimChanges.totalAmendedClaims,
          newClaims: validated.claimChanges.newClaims,
          cancelledClaims: validated.claimChanges.cancelledClaims,
          lastAmendmentDate: validated.claimChanges.lastAmendmentDate ? new Date(validated.claimChanges.lastAmendmentDate) : undefined,
          pendingValidation: validated.claimChanges.pendingValidation,
          highRiskAmendments: validated.claimChanges.highRiskAmendments,
        },
        alerts: validated.alerts.map(alert => ({
          id: alert.id,
          type: alert.type,
          severity: alert.severity,
          title: alert.title,
          message: alert.message,
          actionRequired: alert.actionRequired,
          dueDate: alert.dueDate ? new Date(alert.dueDate) : undefined,
        })),
        prosecutionStatistics: validated.prosecutionStatistics,
      };

      logger.info('[ProjectProsecutionService] Prosecution overview retrieved successfully', {
        projectId,
        hasCurrentOA: !!prosecutionOverview.currentOfficeAction,
        timelineEvents: prosecutionOverview.prosecutionTimeline.length,
        alertCount: prosecutionOverview.alerts.length,
      });

      return prosecutionOverview;
    } catch (error) {
      logger.error('[ProjectProsecutionService] Failed to fetch prosecution overview', {
        projectId,
        error: error instanceof Error ? error.message : String(error),
      });
      
      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        `Failed to fetch prosecution overview: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get examiner analytics for a specific examiner (cross-project)
   */
  static async getExaminerAnalytics(examinerId: string): Promise<ProsecutionOverview['examinerAnalytics']> {
    logger.debug('[ProjectProsecutionService] Fetching examiner analytics', { examinerId });

    try {
      const response = await apiFetch(`/api/examiners/${examinerId}/analytics`);
      const rawData = await response.json();
      
      const data = rawData.data || rawData;
      const validated = ExaminerAnalyticsSchema.parse(data);
      
      return {
        examiner: validated.examiner,
        statistics: validated.statistics,
        patterns: validated.patterns,
      };
    } catch (error) {
      logger.error('[ProjectProsecutionService] Failed to fetch examiner analytics', {
        examinerId,
        error: error instanceof Error ? error.message : String(error),
      });
      
      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        `Failed to fetch examiner analytics: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get prosecution timeline for a project
   */
  static async getProsecutionTimeline(projectId: string): Promise<ProsecutionOverview['prosecutionTimeline']> {
    logger.debug('[ProjectProsecutionService] Fetching prosecution timeline', { projectId });

    try {
      const response = await apiFetch(`/api/projects/${projectId}/prosecution-timeline`);
      const rawData = await response.json();
      
      const data = rawData.data || rawData;
      const validated = z.array(ProsecutionTimelineEventSchema).parse(data);
      
      return validated.map(event => ({
        id: event.id,
        type: event.type,
        date: new Date(event.date),
        title: event.title,
        description: event.description,
        status: event.status,
        daysFromPrevious: event.daysFromPrevious,
      }));
    } catch (error) {
      logger.error('[ProjectProsecutionService] Failed to fetch prosecution timeline', {
        projectId,
        error: error instanceof Error ? error.message : String(error),
      });
      
      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        `Failed to fetch prosecution timeline: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Calculate days remaining to respond to current Office Action
   */
  static calculateDaysToRespond(responseDeadline: Date): number {
    const now = new Date();
    const diffTime = responseDeadline.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Determine urgency level based on days remaining
   */
  static getUrgencyLevel(daysToRespond: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (daysToRespond < 0) return 'CRITICAL';
    if (daysToRespond <= 14) return 'HIGH';
    if (daysToRespond <= 30) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Format prosecution status for display
   */
  static formatProsecutionStatus(status: ProsecutionOverview['applicationMetadata']['prosecutionStatus']): string {
    const statusMap = {
      'PRE_FILING': 'Pre-Filing',
      'PENDING_RESPONSE': 'Pending Response',
      'ACTIVE': 'Active Prosecution',
      'ALLOWED': 'Notice of Allowance',
      'ABANDONED': 'Abandoned',
      'ISSUED': 'Patent Issued',
    };
    return statusMap[status] || status;
  }
} 
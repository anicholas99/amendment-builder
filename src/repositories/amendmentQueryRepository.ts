/**
 * Amendment Query Repository
 * 
 * Advanced queries for amendment intelligence and cross-case analysis
 * Enables queries like "all §103 rejections where we argued and won"
 */

import { prisma } from '@/lib/prisma';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/server/logger';

// ============ TYPES ============

export interface RejectionOutcome {
  rejectionId: string;
  officeActionId: string;
  type: string;
  strategy: string;
  outcome: 'WITHDRAWN' | 'MAINTAINED' | 'MODIFIED' | 'PENDING';
  responseDate?: Date;
  subsequentOAId?: string;
}

export interface ArgumentPattern {
  argumentText: string;
  rejectionType: string;
  successRate: number;
  usageCount: number;
  examples: Array<{
    projectId: string;
    officeActionId: string;
    outcome: string;
  }>;
}

export interface ExaminerPattern {
  examinerId: string;
  examinerName: string;
  totalRejections: number;
  favorableRate: number;
  commonRejectionTypes: Record<string, number>;
  responseStrategies: Record<string, { count: number; successRate: number }>;
}

// ============ CROSS-CASE QUERIES ============

/**
 * Find all rejections of a specific type with their outcomes
 * e.g., "all §103 rejections where we argued and won"
 */
export async function findRejectionsByTypeAndOutcome(
  tenantId: string,
  rejectionType: string,
  strategy?: 'ARGUE' | 'AMEND' | 'COMBINATION',
  outcome?: 'WITHDRAWN' | 'MAINTAINED'
): Promise<RejectionOutcome[]> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    // This query would need to join rejections with their analysis results
    // and track outcomes from subsequent office actions
    const query = `
      SELECT 
        r.id as rejectionId,
        r.officeActionId,
        r.type,
        rar.suggestedStrategy as strategy,
        CASE 
          WHEN next_oa.id IS NULL THEN 'PENDING'
          WHEN next_r.id IS NULL THEN 'WITHDRAWN'
          WHEN next_r.type = r.type AND next_r.claimNumbers = r.claimNumbers THEN 'MAINTAINED'
          ELSE 'MODIFIED'
        END as outcome,
        ap.filedDate as responseDate,
        next_oa.id as subsequentOAId
      FROM Rejection r
      INNER JOIN OfficeAction oa ON r.officeActionId = oa.id
      LEFT JOIN RejectionAnalysisResult rar ON r.id = rar.rejectionId
      LEFT JOIN AmendmentProject ap ON oa.id = ap.officeActionId
      LEFT JOIN OfficeAction next_oa ON oa.projectId = next_oa.projectId 
        AND next_oa.createdAt > oa.createdAt
        AND ap.filedDate IS NOT NULL
        AND next_oa.createdAt > ap.filedDate
      LEFT JOIN Rejection next_r ON next_oa.id = next_r.officeActionId
        AND next_r.type = r.type
        AND next_r.claimNumbers LIKE '%' + r.claimNumbers + '%'
      WHERE oa.tenantId = @p0
        AND r.type = @p1
        ${strategy ? 'AND rar.suggestedStrategy = @p2' : ''}
        ${outcome ? 'AND CASE WHEN next_oa.id IS NULL THEN \'PENDING\' WHEN next_r.id IS NULL THEN \'WITHDRAWN\' ELSE \'MAINTAINED\' END = @p3' : ''}
      ORDER BY oa.createdAt DESC
    `;

    const params: any[] = [tenantId, rejectionType];
    if (strategy) params.push(strategy);
    if (outcome) params.push(outcome);

    // Note: In production, this would use Prisma's raw query capabilities
    // For now, return empty array as the models aren't generated yet
    logger.info('[AmendmentQueryRepository] Query would execute', {
      rejectionType,
      strategy,
      outcome,
    });

    return [];
  } catch (error) {
    logger.error('[AmendmentQueryRepository] Failed to find rejections by type and outcome', {
      error,
      tenantId,
      rejectionType,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to query rejections: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Find successful argument patterns for specific rejection types
 */
export async function findSuccessfulArgumentPatterns(
  tenantId: string,
  rejectionType: string,
  minSuccessRate: number = 0.7
): Promise<ArgumentPattern[]> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    // This would analyze amendment project files and their outcomes
    logger.info('[AmendmentQueryRepository] Finding successful argument patterns', {
      tenantId,
      rejectionType,
      minSuccessRate,
    });

    // Placeholder implementation
    return [];
  } catch (error) {
    logger.error('[AmendmentQueryRepository] Failed to find argument patterns', {
      error,
      tenantId,
      rejectionType,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to find argument patterns: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Analyze examiner patterns across cases
 */
export async function analyzeExaminerPatterns(
  tenantId: string,
  examinerId?: string
): Promise<ExaminerPattern[]> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    logger.info('[AmendmentQueryRepository] Analyzing examiner patterns', {
      tenantId,
      examinerId,
    });

    // This would aggregate data across office actions and outcomes
    // Placeholder implementation
    return [];
  } catch (error) {
    logger.error('[AmendmentQueryRepository] Failed to analyze examiner patterns', {
      error,
      tenantId,
      examinerId,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to analyze examiner patterns: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get amendment response history for similar rejections
 */
export async function getSimilarRejectionResponses(
  tenantId: string,
  rejectionType: string,
  citedPriorArt: string[],
  limit: number = 10
): Promise<Array<{
  rejectionId: string;
  projectName: string;
  responseStrategy: string;
  outcome: string;
  argumentSummary?: string;
}>> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    logger.info('[AmendmentQueryRepository] Finding similar rejection responses', {
      tenantId,
      rejectionType,
      citedPriorArt,
    });

    // This would find rejections with similar prior art and type
    // Then retrieve the response strategies and outcomes
    return [];
  } catch (error) {
    logger.error('[AmendmentQueryRepository] Failed to find similar responses', {
      error,
      tenantId,
      rejectionType,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to find similar responses: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get claim amendment patterns that succeeded
 */
export async function getSuccessfulClaimAmendments(
  tenantId: string,
  elementType?: string // e.g., "wireless communication", "database query"
): Promise<Array<{
  originalClaim: string;
  amendedClaim: string;
  addedLimitations: string[];
  outcome: string;
  projectId: string;
}>> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    logger.info('[AmendmentQueryRepository] Finding successful claim amendments', {
      tenantId,
      elementType,
    });

    // This would compare claim versions and their outcomes
    return [];
  } catch (error) {
    logger.error('[AmendmentQueryRepository] Failed to find claim amendments', {
      error,
      tenantId,
      elementType,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to find claim amendments: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get prosecution timeline analytics
 */
export async function getProsecutionTimeline(
  projectId: string
): Promise<{
  events: Array<{
    date: Date;
    type: 'OA_RECEIVED' | 'RESPONSE_FILED' | 'CLAIMS_AMENDED' | 'ALLOWANCE';
    description: string;
    metadata?: any;
  }>;
  averageResponseTime: number;
  totalRejections: number;
  rejectionTypesOverTime: Record<string, number[]>;
}> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    logger.info('[AmendmentQueryRepository] Building prosecution timeline', {
      projectId,
    });

    // This would aggregate all prosecution events for a project
    return {
      events: [],
      averageResponseTime: 0,
      totalRejections: 0,
      rejectionTypesOverTime: {},
    };
  } catch (error) {
    logger.error('[AmendmentQueryRepository] Failed to build timeline', {
      error,
      projectId,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to build prosecution timeline: ${error instanceof Error ? error.message : String(error)}`
    );
  }
} 
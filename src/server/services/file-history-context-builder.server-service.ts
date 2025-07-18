/**
 * File History Context Builder Service
 * 
 * Main service for building comprehensive file history context for AI agents
 * Orchestrates repository calls, provides caching, optimization, and context enrichment
 * Enables patent attorney-level reasoning by aggregating all historical data
 * 
 * Follows established patterns: service layer orchestration, error handling, performance optimization
 */

import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { 
  buildFileHistoryContext,
  getFileHistorySummary,
  validateFileHistoryCompleteness 
} from '@/repositories/fileHistoryRepository';
import type {
  FileHistoryContext,
  FileHistoryContextOptions,
  ContextBuildResult,
  ContextQualityMetrics,
  AIAgentContext,
  CurrentApplicationState,
  StrategicGuidance,
  RiskAssessment,
} from '@/types/domain/file-history-context';

// ============ CONTEXT CACHE ============

interface CacheEntry {
  context: FileHistoryContext;
  timestamp: Date;
  options: FileHistoryContextOptions;
  buildTime: number;
}

// Simple in-memory cache with TTL
class FileHistoryContextCache {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL_MS = 15 * 60 * 1000; // 15 minutes
  private readonly MAX_ENTRIES = 100;

  private getCacheKey(projectId: string, options: FileHistoryContextOptions): string {
    // Create cache key based on project and relevant options
    const optionsKey = JSON.stringify({
      maxHistoryDepth: options.maxHistoryDepth,
      includeClaimEvolution: options.includeClaimEvolution,
      includeExaminerAnalysis: options.includeExaminerAnalysis,
      includePriorArtHistory: options.includePriorArtHistory,
      includeFullText: options.includeFullText,
    });
    return `${projectId}:${Buffer.from(optionsKey).toString('base64')}`;
  }

  get(projectId: string, options: FileHistoryContextOptions): CacheEntry | null {
    const key = this.getCacheKey(projectId, options);
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp.getTime() > this.TTL_MS) {
      this.cache.delete(key);
      return null;
    }
    
    return entry;
  }

  set(projectId: string, options: FileHistoryContextOptions, context: FileHistoryContext, buildTime: number): void {
    const key = this.getCacheKey(projectId, options);
    
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.MAX_ENTRIES) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    this.cache.set(key, {
      context,
      timestamp: new Date(),
      options,
      buildTime,
    });
  }

  invalidate(projectId: string): void {
    // Remove all cache entries for a project
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${projectId}:`)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; maxSize: number; ttlMs: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_ENTRIES,
      ttlMs: this.TTL_MS,
    };
  }
}

const contextCache = new FileHistoryContextCache();

// ============ MAIN SERVICE CLASS ============

export class FileHistoryContextBuilder {
  /**
   * Build comprehensive file history context with caching and optimization
   */
  static async buildContext(
    projectId: string,
    options: FileHistoryContextOptions
  ): Promise<ContextBuildResult> {
    const startTime = Date.now();

    try {
      logger.debug('[FileHistoryContextBuilder] Building context', {
        projectId,
        tenantId: options.tenantId,
        cacheEnabled: options.cacheResults,
      });

      // Check cache first if enabled
      let cacheHit = false;
      if (options.cacheResults) {
        const cached = contextCache.get(projectId, options);
        if (cached) {
          logger.debug('[FileHistoryContextBuilder] Cache hit', { projectId });
          return {
            context: cached.context,
            buildTime: cached.buildTime,
            cacheHit: true,
            warnings: [],
            dataQuality: await this.assessDataQuality(cached.context),
          };
        }
      }

      // Validate project has sufficient data
      const completenessCheck = await validateFileHistoryCompleteness(projectId, options.tenantId);
      const warnings: string[] = [];
      
      if (!completenessCheck.isComplete) {
        warnings.push(`Missing data: ${completenessCheck.missingComponents.join(', ')}`);
        warnings.push(...completenessCheck.recommendations);
      }

      // Build context from repositories
      const context = await buildFileHistoryContext(projectId, options);
      const buildTime = Date.now() - startTime;

      // Cache the result if enabled
      if (options.cacheResults) {
        contextCache.set(projectId, options, context, buildTime);
      }

      // Assess data quality
      const dataQuality = await this.assessDataQuality(context);

      logger.info('[FileHistoryContextBuilder] Context built successfully', {
        projectId,
        tenantId: options.tenantId,
        buildTime,
        cacheHit,
        fileCount: context.fileHistory.length,
        claimCount: context.claimEvolution.claims.length,
        examinerInteractions: context.examinerContext.history.length,
        dataQualityScore: dataQuality.completeness,
      });

      return {
        context,
        buildTime,
        cacheHit,
        warnings,
        dataQuality,
      };
    } catch (error) {
      logger.error('[FileHistoryContextBuilder] Failed to build context', {
        projectId,
        tenantId: options.tenantId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new ApplicationError(
        ErrorCode.DB_QUERY_ERROR,
        `Failed to build file history context: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Build AI-ready context with strategic guidance and risk assessment
   */
  static async buildAIAgentContext(
    projectId: string,
    options: FileHistoryContextOptions
  ): Promise<AIAgentContext> {
    try {
      logger.debug('[FileHistoryContextBuilder] Building AI agent context', { projectId });

      // Build base file history context
      const contextResult = await this.buildContext(projectId, options);
      const fileHistory = contextResult.context;

      // Build current application state
      const currentState = await this.buildCurrentApplicationState(projectId, options.tenantId, fileHistory);

      // Generate strategic guidance
      const strategicGuidance = await this.generateStrategicGuidance(fileHistory, currentState);

      // Assess risks
      const riskAssessment = await this.assessProsecutionRisks(fileHistory, currentState);

      const aiContext: AIAgentContext = {
        fileHistory,
        currentState,
        strategicGuidance,
        riskAssessment,
      };

      logger.info('[FileHistoryContextBuilder] AI agent context built', {
        projectId,
        openRejections: currentState.openRejections.length,
        pendingDeadlines: currentState.pendingDeadlines.length,
        riskLevel: riskAssessment.overallRiskLevel,
      });

      return aiContext;
    } catch (error) {
      logger.error('[FileHistoryContextBuilder] Failed to build AI agent context', {
        projectId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Invalidate cache for a project (call when project data changes)
   */
  static invalidateProjectCache(projectId: string): void {
    contextCache.invalidate(projectId);
    logger.debug('[FileHistoryContextBuilder] Cache invalidated', { projectId });
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; maxSize: number; ttlMs: number } {
    return contextCache.getStats();
  }

  // ============ PRIVATE HELPER METHODS ============

  private static async assessDataQuality(context: FileHistoryContext): Promise<ContextQualityMetrics> {
    let completeness = 0;
    let recency = 0;
    let consistency = 1;
    const missingDataAreas: string[] = [];

    // Assess completeness
    if (context.fileHistory.length > 0) completeness += 0.3;
    else missingDataAreas.push('file_history');

    if (context.claimEvolution.claims.length > 0) completeness += 0.3;
    else missingDataAreas.push('claim_evolution');

    if (context.examinerContext.history.length > 0) completeness += 0.2;
    else missingDataAreas.push('examiner_context');

    if (context.metadata.totalOfficeActions > 0) completeness += 0.2;
    else missingDataAreas.push('prosecution_history');

    // Assess recency (how recent is the latest data)
    const latestFileDate = context.fileHistory.length > 0 
      ? Math.max(...context.fileHistory.map(f => f.fileDate.getTime()))
      : 0;
    
    if (latestFileDate > 0) {
      const daysSinceLatest = (Date.now() - latestFileDate) / (1000 * 60 * 60 * 24);
      recency = Math.max(0, 1 - (daysSinceLatest / 365)); // Decay over a year
    }

    // Basic consistency check (could be enhanced)
    const claimNumbers = new Set(context.claimEvolution.claims.map(c => c.claimNumber));
    const fileClaimNumbers = new Set(
      context.fileHistory
        .flatMap(f => f.metadata.rejectionSummary?.claimsAffected || [])
    );
    
    // Check if claim numbers in files match current claims
    if (claimNumbers.size > 0 && fileClaimNumbers.size > 0) {
      const intersection = new Set([...claimNumbers].filter(x => fileClaimNumbers.has(x)));
      consistency = intersection.size / Math.max(claimNumbers.size, fileClaimNumbers.size);
    }

    return {
      completeness,
      recency,
      consistency,
      missingDataAreas,
    };
  }

  private static async buildCurrentApplicationState(
    projectId: string,
    tenantId: string,
    fileHistory: FileHistoryContext
  ): Promise<CurrentApplicationState> {
    // Extract open rejections from latest office action
    const latestOA = fileHistory.fileHistory
      .filter(f => f.type === 'OFFICE_ACTION')
      .sort((a, b) => b.fileDate.getTime() - a.fileDate.getTime())[0];

    const openRejections = latestOA?.metadata.rejectionSummary 
      ? latestOA.metadata.rejectionSummary.types.map((type, index) => ({
          id: `${latestOA.id}-${index}`,
          type,
          claimsAffected: latestOA.metadata.rejectionSummary?.claimsAffected || [],
          priorArtCited: latestOA.metadata.rejectionSummary?.priorArtCited || [],
          examinerReasoning: '', // Would extract from parsed text
          suggestedStrategy: [], // Would be AI-generated
          confidenceLevel: 0.8,
        }))
      : [];

    // Get pending deadlines
    const pendingDeadlines = fileHistory.metadata.nextDeadline
      ? [{
          type: 'Response Deadline',
          date: fileHistory.metadata.nextDeadline,
          description: 'USPTO response deadline',
          criticality: 'HIGH' as const,
        }]
      : [];

    // Map current claims status
    const currentClaimsStatus = fileHistory.claimEvolution.claims.map(claim => ({
      claimNumber: claim.claimNumber,
      status: 'PENDING' as const, // Would be determined from prosecution history
      rejectionHistory: [], // Would be extracted from file history
      amendmentHistory: claim.versions.map(v => v.changeReason),
      strategicImportance: claim.claimNumber === 1 ? 'CORE' as const : 'IMPORTANT' as const,
    }));

    // Generate recommended actions based on current state
    const nextRecommendedActions = openRejections.length > 0
      ? [{
          type: 'ARGUE_REJECTION' as const,
          priority: 1,
          description: 'Address pending office action rejections',
          rationale: 'Multiple rejections require response before deadline',
          estimatedSuccessRate: 0.7,
        }]
      : [];

    return {
      pendingDeadlines,
      openRejections,
      currentClaimsStatus,
      nextRecommendedActions,
    };
  }

  private static async generateStrategicGuidance(
    fileHistory: FileHistoryContext,
    currentState: CurrentApplicationState
  ): Promise<StrategicGuidance> {
    // Analyze file history to generate strategic guidance
    const rejectionTypes = new Set(
      currentState.openRejections.map(r => r.type)
    );

    let overallStrategy = 'Respond to pending rejections';
    const keyMessages: string[] = [];
    const argumentsToEmphasize: string[] = [];
    const argumentsToAvoid: string[] = [];
    const claimScopeRecommendations: string[] = [];

    // Strategy based on rejection types
    if (rejectionTypes.has('§103')) {
      overallStrategy = 'Focus on non-obviousness arguments and claim differentiation';
      keyMessages.push('Emphasize unexpected results and technical advantages');
      argumentsToEmphasize.push('Unexpected technical benefits');
      argumentsToEmphasize.push('Structural and functional differences');
    }

    if (rejectionTypes.has('§102')) {
      overallStrategy = 'Challenge anticipation with detailed claim element analysis';
      keyMessages.push('Perform element-by-element comparison');
      argumentsToEmphasize.push('Missing claim elements in prior art');
    }

    // Learn from examiner patterns
    const commonRejectionTypes = fileHistory.examinerContext.patterns.commonRejectionTypes;
    if (commonRejectionTypes.length > 0) {
      const mostCommon = commonRejectionTypes[0];
      argumentsToAvoid.push(`Previous ${mostCommon.type} arguments that were unsuccessful`);
    }

    // Claim scope recommendations
    if (fileHistory.claimEvolution.claims.length > 0) {
      const claim1 = fileHistory.claimEvolution.claims.find(c => c.claimNumber === 1);
      if (claim1 && claim1.totalAmendments > 2) {
        claimScopeRecommendations.push('Consider filing continuation with broader claims');
      }
    }

    return {
      overallStrategy,
      keyMessages,
      argumentsToEmphasize,
      argumentsToAvoid,
      claimScopeRecommendations,
    };
  }

  private static async assessProsecutionRisks(
    fileHistory: FileHistoryContext,
    currentState: CurrentApplicationState
  ): Promise<RiskAssessment> {
    const prosecutionRisks = [];
    const claimScopeRisks = [];
    const priorArtRisks = [];
    let overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

    // Assess prosecution timeline risks
    if (fileHistory.metadata.currentRoundNumber >= 3) {
      prosecutionRisks.push({
        type: 'Final Rejection Risk',
        description: 'Application in multiple rounds of prosecution',
        likelihood: 0.7,
        impact: 0.8,
        mitigationStrategies: ['Consider RCE or appeal strategy', 'Strong technical arguments needed'],
      });
      overallRiskLevel = 'HIGH';
    }

    // Assess deadline risks
    const nearDeadlines = currentState.pendingDeadlines.filter(d => {
      const daysUntil = (d.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysUntil < 30;
    });

    if (nearDeadlines.length > 0) {
      prosecutionRisks.push({
        type: 'Deadline Risk',
        description: 'Approaching response deadline',
        likelihood: 1.0,
        impact: 0.9,
        mitigationStrategies: ['Prioritize response preparation', 'Consider extension if needed'],
      });
      if (overallRiskLevel === 'LOW') overallRiskLevel = 'MEDIUM';
    }

    // Assess claim scope risks
    const heavilyAmendedClaims = fileHistory.claimEvolution.claims.filter(c => c.totalAmendments > 3);
    if (heavilyAmendedClaims.length > 0) {
      claimScopeRisks.push({
        type: 'Scope Narrowing Risk',
        description: 'Claims have been significantly amended',
        likelihood: 0.6,
        impact: 0.7,
        mitigationStrategies: ['Consider continuation application', 'Evaluate alternative claim strategies'],
      });
    }

    // Assess prior art risks
    const strongPriorArt = fileHistory.examinerContext.patterns.priorArtPreferences
      .filter(p => p.frequency > 1);
    if (strongPriorArt.length > 0) {
      priorArtRisks.push({
        type: 'Strong Prior Art Risk',
        description: 'Examiner has cited strong prior art references',
        likelihood: 0.8,
        impact: 0.6,
        mitigationStrategies: ['Detailed technical differentiation needed', 'Consider claim amendments'],
      });
    }

    return {
      prosecutionRisks,
      claimScopeRisks,
      priorArtRisks,
      overallRiskLevel,
    };
  }
}

// ============ UTILITY FUNCTIONS ============

/**
 * Create default context options
 */
export function createDefaultContextOptions(
  tenantId: string,
  overrides?: Partial<FileHistoryContextOptions>
): FileHistoryContextOptions {
  return {
    includeFullText: false,
    maxHistoryDepth: 10,
    includeDraftResponses: true,
    includeExaminerAnalysis: true,
    includeClaimEvolution: true,
    includePriorArtHistory: true,
    includeRelatedApplications: false,
    cacheResults: true,
    tenantId,
    ...overrides,
  };
}

/**
 * Create lightweight context options for quick analysis
 */
export function createLightweightContextOptions(
  tenantId: string
): FileHistoryContextOptions {
  return {
    includeFullText: false,
    maxHistoryDepth: 3,
    includeDraftResponses: false,
    includeExaminerAnalysis: true,
    includeClaimEvolution: false,
    includePriorArtHistory: false,
    includeRelatedApplications: false,
    cacheResults: true,
    tenantId,
  };
}

/**
 * Create comprehensive context options for detailed analysis
 */
export function createComprehensiveContextOptions(
  tenantId: string
): FileHistoryContextOptions {
  return {
    includeFullText: true,
    maxHistoryDepth: undefined, // Include all history
    includeDraftResponses: true,
    includeExaminerAnalysis: true,
    includeClaimEvolution: true,
    includePriorArtHistory: true,
    includeRelatedApplications: true,
    cacheResults: false, // Don't cache comprehensive builds
    tenantId,
  };
} 
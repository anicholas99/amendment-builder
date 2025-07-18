/**
 * Office Action Orchestrator Service
 * 
 * Orchestrates the complete agent workflow pipeline after OA upload:
 * 1. Enhanced parsing and extraction
 * 2. Summary generation
 * 3. Claim snapshot creation
 * 4. Rejection analysis
 * 5. Strategy aggregation
 * 6. Amendment draft initialization
 * 
 * This service ensures all structured data is captured for AI traversal
 * and provides queryable intelligence for future analysis.
 */

import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { prisma } from '@/lib/prisma';
import { SimpleOfficeActionParserService } from './simple-office-action-parser.server-service';
import { ClaimSnapshotService } from './claim-snapshot.server-service';
import { processWithOpenAI } from '@/server/ai/aiService';
import { safeJsonParse } from '@/utils/jsonUtils';
import type { 
  OfficeAction, 
  ParsedOfficeActionData,
  DetailedAnalysis 
} from '@/types/amendment';

// ============ TYPES ============

interface OrchestrationResult {
  success: boolean;
  stepsCompleted: string[];
  errors: string[];
  summary?: {
    rejectionCount: number;
    strategyRecommendation?: string;
    responseComplexity?: string;
  };
}

interface RejectionAnalysis {
  rejectionId: string;
  strengthScore: number;
  suggestedStrategy: 'ARGUE' | 'AMEND' | 'COMBINATION';
  priorArtMapping: Record<string, string[]>;
  reasoning: string;
}

// ============ ORCHESTRATOR CLASS ============

export class OfficeActionOrchestratorService {
  /**
   * Main orchestration method - runs the complete agent pipeline
   */
  static async orchestrateOfficeActionAnalysis(
    officeActionId: string,
    projectId: string,
    tenantId: string
  ): Promise<OrchestrationResult> {
    const stepsCompleted: string[] = [];
    const errors: string[] = [];
    
    logger.info('[OA Orchestrator] Starting comprehensive analysis pipeline', {
      officeActionId,
      projectId,
      tenantId,
    });

    try {
      // Step 0: Ensure patent application entity exists
      const patentApp = await this.ensurePatentApplication(projectId);
      stepsCompleted.push('PATENT_APPLICATION_SETUP');

      // Step 1: Get the parsed OA data
      if (!prisma) {
        throw new ApplicationError(
          ErrorCode.DB_CONNECTION_ERROR,
          'Database client is not initialized.'
        );
      }
      
      const officeAction = await prisma.officeAction.findUnique({
        where: { id: officeActionId },
        include: { rejections: true },
      });

      if (!officeAction || !officeAction.parsedJson) {
        throw new ApplicationError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          'Office Action not found or not parsed'
        );
      }

      const parsedData = JSON.parse(officeAction.parsedJson) as ParsedOfficeActionData;

      // Step 2: Generate OA Summary
      const summary = await this.generateOfficeActionSummary(
        officeActionId,
        parsedData,
        officeAction.rejections
      );
      stepsCompleted.push('SUMMARY_GENERATION');

      // Step 3: Create claim snapshot
      const claimVersion = await ClaimSnapshotService.createSnapshot(
        patentApp.id,
        'OFFICE_ACTION_SNAPSHOT',
        projectId,
        officeActionId
      );
      if (claimVersion) {
        stepsCompleted.push('CLAIM_SNAPSHOT');
      }

      // Step 4: Analyze each rejection
      const rejectionAnalyses: RejectionAnalysis[] = [];
      for (const rejection of officeAction.rejections) {
        try {
          const analysis = await this.analyzeRejection(
            rejection,
            claimVersion,
            parsedData
          );
          rejectionAnalyses.push(analysis);
          
          // Store analysis result
          await this.storeRejectionAnalysis(analysis, officeActionId);
        } catch (error) {
          logger.error('[OA Orchestrator] Rejection analysis failed', {
            rejectionId: rejection.id,
            error: error instanceof Error ? error.message : String(error),
          });
          errors.push(`Rejection ${rejection.id} analysis failed`);
        }
      }
      stepsCompleted.push('REJECTION_ANALYSIS');

      // Step 5: Generate overall strategy
      const strategy = await this.generateStrategyRecommendation(
        officeActionId,
        patentApp.id,
        rejectionAnalyses,
        summary
      );
      stepsCompleted.push('STRATEGY_GENERATION');

      // Step 6: Initialize amendment draft structure
      await this.initializeAmendmentDraft(
        officeActionId,
        projectId,
        strategy,
        rejectionAnalyses
      );
      stepsCompleted.push('DRAFT_INITIALIZATION');

      // Update OA status
      if (!prisma) {
        throw new ApplicationError(
          ErrorCode.DB_CONNECTION_ERROR,
          'Database client is not initialized.'
        );
      }
      
      await prisma.officeAction.update({
        where: { id: officeActionId },
        data: { status: 'COMPLETED' },
      });

      logger.info('[OA Orchestrator] Pipeline completed successfully', {
        officeActionId,
        stepsCompleted,
        rejectionCount: officeAction.rejections.length,
      });

      return {
        success: true,
        stepsCompleted,
        errors,
        summary: {
          rejectionCount: officeAction.rejections.length,
          strategyRecommendation: strategy.overallStrategy,
          responseComplexity: summary.responseComplexity,
        },
      };

    } catch (error) {
      logger.error('[OA Orchestrator] Pipeline failed', {
        officeActionId,
        error: error instanceof Error ? error.message : String(error),
        stepsCompleted,
      });

      // Update OA status to error
      if (prisma) {
        await prisma.officeAction.update({
          where: { id: officeActionId },
          data: { status: 'ERROR' },
        }).catch(() => {}); // Ignore update errors
      }

      return {
        success: false,
        stepsCompleted,
        errors: [...errors, error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Ensure patent application entity exists for the project
   */
  private static async ensurePatentApplication(projectId: string) {
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client is not initialized.'
      );
    }
    
    let patentApp = await prisma.patentApplication.findUnique({
      where: { projectId },
    });

    if (!patentApp) {
      // Create patent application from project data
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { invention: true },
      });

      if (!project) {
        throw new ApplicationError(
          ErrorCode.PROJECT_NOT_FOUND,
          'Project not found'
        );
      }

      patentApp = await prisma.patentApplication.create({
        data: {
          projectId,
          title: project.invention?.title || project.name,
          status: 'PENDING',
        },
      });

      logger.info('[OA Orchestrator] Created patent application entity', {
        projectId,
        patentAppId: patentApp.id,
      });
    }

    return patentApp;
  }

  /**
   * Generate comprehensive OA summary using AI
   */
  private static async generateOfficeActionSummary(
    officeActionId: string,
    parsedData: ParsedOfficeActionData,
    rejections: any[]
  ) {
    const prompt = `Analyze this Office Action and provide a strategic summary:

Office Action Data:
${JSON.stringify(parsedData, null, 2)}

Rejections:
${JSON.stringify(rejections.map(r => ({
  type: r.type,
  claims: JSON.parse(r.claimNumbers || '[]'),
  examinerText: r.examinerText,
})), null, 2)}

Provide a JSON response with:
{
  "summaryText": "2-3 paragraph strategic summary for attorneys",
  "keyIssues": ["list of key issues to address"],
  "examinerTone": "FAVORABLE|NEUTRAL|HOSTILE",
  "responseComplexity": "LOW|MEDIUM|HIGH",
  "claimImpactMap": {
    "1": "HIGH - core functionality rejected",
    "2": "MEDIUM - dependent on claim 1",
    ...
  },
  "strategyHint": "Brief overall strategy suggestion"
}`;

    const response = await processWithOpenAI(
      prompt,
      'You are a patent prosecution expert analyzing Office Actions.',
      {
        temperature: 0.3,
        maxTokens: 2000,
        response_format: { type: 'json_object' },
      }
    );

    const summaryData = safeJsonParse(response.content);
    
    // Count rejections by type
    const rejectionCounts = rejections.reduce((acc, r) => {
      const type = `num${r.type}Rejections`;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Store in database
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client is not initialized.'
      );
    }
    
    const summary = await prisma.officeActionSummary.create({
      data: {
        officeActionId,
        summaryText: summaryData.summaryText,
        keyIssues: JSON.stringify(summaryData.keyIssues),
        rejectionBreakdown: JSON.stringify(
          rejections.reduce((acc, r) => {
            acc[r.type] = (acc[r.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ),
        totalClaimsRejected: rejections.reduce((total, r) => 
          total + JSON.parse(r.claimNumbers || '[]').length, 0
        ),
        examinerTone: summaryData.examinerTone,
        responseComplexity: summaryData.responseComplexity,
        claimImpactMap: JSON.stringify(summaryData.claimImpactMap),
        strategyHint: summaryData.strategyHint,
        // Populate numeric fields for efficient querying
        num102Rejections: rejectionCounts.num102Rejections || 0,
        num103Rejections: rejectionCounts.num103Rejections || 0,
        num101Rejections: rejectionCounts.num101Rejections || 0,
        num112Rejections: rejectionCounts.num112Rejections || 0,
        numOtherRejections: rejections.filter(r => !['102', '103', '101', '112'].includes(r.type)).length,
      },
    });

    return summary;
  }

  /**
   * Create claim version snapshot at OA point
   */
  private static async createClaimSnapshot(
    applicationId: string,
    officeActionId: string,
    projectId: string
  ) {
    // Now using the ClaimSnapshotService
    return await ClaimSnapshotService.createSnapshot(
      applicationId,
      'OFFICE_ACTION_SNAPSHOT',
      projectId,
      officeActionId
    );
  }

  /**
   * Analyze individual rejection using AI
   */
  private static async analyzeRejection(
    rejection: any,
    claimVersion: any,
    parsedData: ParsedOfficeActionData
  ): Promise<RejectionAnalysis> {
    const claims = JSON.parse(claimVersion.claimsJson);
    const rejectedClaimNumbers = JSON.parse(rejection.claimNumbers || '[]');
    const citedPriorArt = JSON.parse(rejection.citedPriorArt || '[]');
    
    const prompt = `Analyze this patent rejection:

Rejection Type: ${rejection.type}
Rejected Claims: ${rejectedClaimNumbers.join(', ')}
Examiner's Reasoning: ${rejection.examinerText}
Cited Prior Art: ${citedPriorArt.join(', ')}

Claims Text:
${claims.filter((c: any) => rejectedClaimNumbers.includes(String(c.number)))
  .map((c: any) => `Claim ${c.number}: ${c.text}`).join('\n\n')}

Prior Art Details:
${parsedData.citedReferences
  .filter(ref => citedPriorArt.includes(ref.patentNumber))
  .map(ref => `${ref.patentNumber}: ${ref.title || 'Unknown'}`)
  .join('\n')}

Provide analysis as JSON:
{
  "strengthScore": 0.0-1.0 (how strong is this rejection),
  "suggestedStrategy": "ARGUE|AMEND|COMBINATION",
  "priorArtMapping": {
    "element1": ["US123", "US456"],
    "element2": ["US123"]
  },
  "reasoning": "Detailed analysis of why this strategy is recommended"
}`;

    const response = await processWithOpenAI(
      prompt,
      'You are a patent examiner and attorney analyzing rejection strength.',
      {
        temperature: 0.2,
        maxTokens: 1500,
        response_format: { type: 'json_object' },
      }
    );

    const analysis = safeJsonParse(response.content);
    
    return {
      rejectionId: rejection.id,
      strengthScore: analysis.strengthScore,
      suggestedStrategy: analysis.suggestedStrategy,
      priorArtMapping: analysis.priorArtMapping,
      reasoning: analysis.reasoning,
    };
  }

  /**
   * Store rejection analysis in database
   */
  private static async storeRejectionAnalysis(
    analysis: RejectionAnalysis,
    officeActionId: string
  ) {
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client is not initialized.'
      );
    }
    
    await prisma.rejectionAnalysisResult.create({
      data: {
        rejectionId: analysis.rejectionId,
        officeActionId,
        analysisType: 'COMPREHENSIVE',
        strengthScore: analysis.strengthScore,
        priorArtMapping: JSON.stringify(analysis.priorArtMapping),
        suggestedStrategy: analysis.suggestedStrategy,
        reasoning: analysis.reasoning,
        confidenceScore: 0.85, // Default confidence
        modelVersion: 'gpt-4.1',
        agentVersion: '1.0.0', // Track agent version
        model: 'gpt-4.1', // Track model used
      },
    });
  }

  /**
   * Generate overall strategy recommendation
   */
  private static async generateStrategyRecommendation(
    officeActionId: string,
    applicationId: string,
    rejectionAnalyses: RejectionAnalysis[],
    summary: any
  ) {
    const prompt = `Generate overall response strategy based on rejection analyses:

Summary: ${summary.summaryText}
Examiner Tone: ${summary.examinerTone}
Response Complexity: ${summary.responseComplexity}

Individual Rejection Analyses:
${JSON.stringify(rejectionAnalyses, null, 2)}

Provide strategic recommendation as JSON:
{
  "overallStrategy": "ARGUE_ALL|AMEND_NARROW|MIXED_APPROACH|FILE_CONTINUATION",
  "priorityActions": ["action1", "action2", ...],
  "estimatedDifficulty": "EASY|MEDIUM|HARD",
  "successProbability": 0.0-1.0,
  "keyArguments": {
    "rejection1": "argument approach",
    "rejection2": "argument approach"
  },
  "amendmentFocus": {
    "claim1": ["add limitation X", "clarify Y"],
    "claim5": ["narrow scope"]
  },
  "alternativeOptions": ["option1", "option2"],
  "reasoning": "Detailed strategic reasoning"
}`;

    const response = await processWithOpenAI(
      prompt,
      'You are a senior patent attorney developing prosecution strategy.',
      {
        temperature: 0.3,
        maxTokens: 2000,
        response_format: { type: 'json_object' },
      }
    );

    const strategyData = safeJsonParse(response.content);
    
    // Store in database
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client is not initialized.'
      );
    }
    
    const strategy = await prisma.strategyRecommendation.create({
      data: {
        officeActionId,
        applicationId,
        overallStrategy: strategyData.overallStrategy,
        priorityActions: JSON.stringify(strategyData.priorityActions),
        estimatedDifficulty: strategyData.estimatedDifficulty,
        successProbability: strategyData.successProbability,
        keyArguments: JSON.stringify(strategyData.keyArguments),
        amendmentFocus: JSON.stringify(strategyData.amendmentFocus),
        alternativeOptions: JSON.stringify(strategyData.alternativeOptions),
        reasoning: strategyData.reasoning,
      },
    });

    return strategy;
  }

  /**
   * Initialize amendment draft with AI suggestions
   */
  private static async initializeAmendmentDraft(
    officeActionId: string,
    projectId: string,
    strategy: any,
    rejectionAnalyses: RejectionAnalysis[]
  ) {
    // Check if amendment project already exists
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client is not initialized.'
      );
    }
    
    let amendmentProject = await prisma.amendmentProject.findFirst({
      where: {
        officeActionId,
        projectId,
      },
    });

    if (!amendmentProject) {
      const officeAction = await prisma.officeAction.findUnique({
        where: { id: officeActionId },
        select: { tenantId: true, project: { select: { userId: true } } },
      });

      if (!officeAction) {
        throw new ApplicationError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          'Office Action not found'
        );
      }

      // Create amendment project
      amendmentProject = await prisma.amendmentProject.create({
        data: {
          officeActionId,
          projectId,
          tenantId: officeAction.tenantId,
          userId: officeAction.project.userId,
          name: `Response to Office Action - ${new Date().toLocaleDateString()}`,
          status: 'DRAFT',
          responseType: strategy.overallStrategy === 'FILE_CONTINUATION' ? 'CONTINUATION' : 'AMENDMENT',
        },
      });
    }

    // Create initial draft structure
    const draftContent = {
      strategy: strategy.overallStrategy,
      priorityActions: JSON.parse(strategy.priorityActions),
      rejectionResponses: rejectionAnalyses.map(analysis => ({
        rejectionId: analysis.rejectionId,
        strategy: analysis.suggestedStrategy,
        reasoning: analysis.reasoning,
      })),
      initialized: true,
      generatedAt: new Date().toISOString(),
    };

    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client is not initialized.'
      );
    }
    
    await prisma.draftDocument.create({
      data: {
        projectId,
        amendmentProjectId: amendmentProject.id,
        type: 'AMENDMENT_STRATEGY',
        content: JSON.stringify(draftContent),
      },
    });

    logger.info('[OA Orchestrator] Initialized amendment draft', {
      amendmentProjectId: amendmentProject.id,
      strategy: strategy.overallStrategy,
    });
  }
} 
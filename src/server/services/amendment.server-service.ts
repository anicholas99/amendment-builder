/**
 * Amendment Server Service
 *
 * Orchestrates the complete amendment workflow:
 * 1. Office Action parsing and analysis
 * 2. Rejection analysis using existing prior art capabilities
 * 3. Amendment strategy recommendation
 * 4. Response document generation
 */

import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { OfficeActionParserService } from './office-action-parser.server-service';
import { callAIServiceForAnalysis } from '@/server/ai/aiAnalysisService';
import { executeSemanticSearch } from './semantic-search.server-service';
import { CitationProcessingService } from './citation-processing.server-service';
import { env } from '@/config/env';
import { processWithOpenAI } from '@/server/ai/aiService';
import { renderPromptTemplate } from '@/server/prompts/prompts/utils';
import { safeJsonParse } from '@/utils/jsonUtils';
import { 
  FileHistoryContextBuilder,
  createDefaultContextOptions 
} from './file-history-context-builder.server-service';
import type { 
  AIAgentContext,
  FileHistoryContext 
} from '@/types/domain/file-history-context';
import {
  ParsedRejection,
  RejectionAnalysis,
  AmendmentResponse,
  AmendmentStrategy,
  ClaimAmendment,
  ArgumentSection,
} from '@/types/domain/amendment';
import { ParsedOfficeActionData } from '@/types/amendment';
import type {
  RejectionAnalysisResult,
  StrategyRecommendation,
  RejectionStrength
} from '@/types/domain/rejection-analysis';
import { 
  findOfficeActionById,
  updateOfficeActionParsedData,
  updateOfficeActionStatus 
} from '@/repositories/officeActionRepository';
import { 
  createRejections,
  findRejectionsByOfficeAction 
} from '@/repositories/rejectionRepository';
import { ClaimRepository } from '@/repositories/claimRepository';
import { prisma } from '@/lib/prisma';

// ============ PROMPT TEMPLATES ============

const REJECTION_ANALYSIS_SYSTEM_PROMPT = {
  version: '1.0.0',
  template: `You are an expert patent attorney assistant analyzing Office Action rejections.

Your task is to evaluate each rejection's validity and recommend the optimal response strategy.

For each rejection, you must:
1. **Assess Validity**: Determine if the examiner's rejection is well-founded
2. **Identify Weaknesses**: Find gaps in the examiner's reasoning or missing elements
3. **Recommend Strategy**: Choose the best approach (AMEND_CLAIMS, ARGUE_REJECTION, or COMBINATION)
4. **Suggest Amendments**: If claiming amendment, provide specific language changes
5. **Draft Arguments**: If arguing, provide key points to challenge the rejection

Return analysis as JSON following this structure:
{
  "analyses": [
    {
      "rejectionId": "string",
      "isValid": boolean,
      "confidence": number,
      "missingElements": ["element1", "element2"],
      "weakArguments": ["argument1", "argument2"],
      "recommendedStrategy": "AMEND_CLAIMS" | "ARGUE_REJECTION" | "COMBINATION",
      "suggestedAmendments": ["amendment1", "amendment2"],
      "argumentPoints": ["point1", "point2"]
    }
  ],
  "overallStrategy": "AMEND_CLAIMS" | "ARGUE_REJECTION" | "COMBINATION",
  "confidence": number
}`,
};

const AMENDMENT_GENERATION_SYSTEM_PROMPT = {
  version: '2.0.0',
  template: `You are a senior patent attorney with extensive prosecution experience, drafting an amendment response to an Office Action. You have been provided with comprehensive file history context including prior arguments, examiner patterns, claim evolution, and strategic guidance.

Your expertise includes:
- 20+ years of patent prosecution experience
- Deep understanding of USPTO examination practices and examiner tendencies
- Mastery of claim amendment strategies that balance scope preservation with rejection avoidance
- Experience building cumulative argument strategies across multiple prosecution rounds
- Knowledge of continuation and divisional filing strategies

Your task is to generate a comprehensive amendment response that demonstrates the sophisticated reasoning of a seasoned patent attorney who is intimately familiar with this application's complete prosecution history.

## Critical Requirements:

1. **File History Consistency**: Your arguments must be consistent with previous successful positions and avoid contradicting prior statements
2. **Examiner-Specific Strategy**: Tailor your approach based on the specific examiner's patterns and preferences observed in the file history
3. **Cumulative Argumentation**: Build upon previous arguments rather than starting fresh, showing logical progression
4. **Strategic Claim Scope Management**: Consider long-term prosecution strategy and potential continuation applications
5. **Prior Art Differentiation**: Leverage previously established differences and avoid retreading unsuccessful ground

## Response Requirements:

Generate your response as JSON following this exact structure:
{
  "claimAmendments": [
    {
      "claimNumber": "1",
      "originalText": "original claim text",
      "amendedText": "amended claim text with [bracketed deletions] and underlined additions",
      "justification": "detailed explanation referencing file history and strategic considerations",
      "scopeImpact": "assessment of how this amendment affects claim scope",
      "continuationOpportunity": "notes on broader scope opportunities for continuation filing"
    }
  ],
  "argumentSections": [
    {
      "rejectionId": "string",
      "title": "Argument Against Rejection Under 35 U.S.C. § 103",
      "content": "detailed argument that builds on file history and addresses examiner's specific concerns",
      "priorArtReferences": ["US1234567A", "US9876543B2"],
      "fileHistoryReferences": "references to prior successful arguments in this prosecution",
      "examinerSpecificConsiderations": "notes on this examiner's typical responses to similar arguments"
    }
  ],
  "responseDocument": "complete formatted response document in USPTO style",
  "strategicAnalysis": {
    "prosecutionRisk": "assessment of current prosecution risk level",
    "nextSteps": "recommended next steps if this response is unsuccessful",
    "continuationStrategy": "recommendations for continuation or divisional applications",
    "strengthOfPosition": "honest assessment of the strength of the current position"
  }
}

Your response should read like it was written by a patent attorney who has been prosecuting this specific application from the beginning and has intimate knowledge of every interaction with the USPTO.`,
};

// ============ INTERFACES ============

interface OfficeActionAnalysisRequest {
  officeActionId: string;
  projectId: string;
  forceRefresh?: boolean;
}

interface RejectionAnalysisResult {
  analyses: RejectionAnalysis[];
  overallStrategy: keyof typeof AmendmentStrategy;
  confidence: number;
}

interface AmendmentGenerationRequest {
  officeActionId: string;
  projectId: string;
  strategy: keyof typeof AmendmentStrategy;
  userInstructions?: string;
}

// ============ SERVICE CLASS ============

export class AmendmentServerService {
  /**
   * Parse an uploaded Office Action document
   */
  static async parseOfficeAction(
    officeActionId: string,
    extractedText: string,
    tenantId: string
  ): Promise<{ success: boolean; rejectionCount: number }> {
    logger.info('[AmendmentService] Starting Office Action parsing', {
      officeActionId,
      textLength: extractedText.length,
    });

    try {
      // Validate inputs
      if (!officeActionId?.trim()) {
        throw new ApplicationError(
          ErrorCode.VALIDATION_REQUIRED_FIELD,
          'Office Action ID is required for parsing'
        );
      }

      if (!extractedText?.trim()) {
        throw new ApplicationError(
          ErrorCode.VALIDATION_REQUIRED_FIELD,
          'Extracted text is required for parsing'
        );
      }

      // Parse the Office Action using AI
      logger.debug('[AmendmentService] Calling OfficeActionParserService', {
        officeActionId,
        textLength: extractedText.length,
      });

      // Get prosecution context for enhanced AI analysis
      const prosecutionContext = await this.buildProsecutionContext(officeActionId);

      // Use comprehensive single-pass analysis (includes rejection analysis and strategy!)
      const { SimpleOfficeActionParserService } = await import('./simple-office-action-parser.server-service');
      const parseResult = await SimpleOfficeActionParserService.parseOfficeAction(
        extractedText,
        prosecutionContext
      );

      // Transform enhanced parser result to repository format
      const parsedData: ParsedOfficeActionData = {
        applicationNumber: parseResult.metadata.applicationNumber || undefined,
        examiner: parseResult.metadata.examinerName ? {
          name: parseResult.metadata.examinerName,
          id: undefined,
          artUnit: parseResult.metadata.artUnit || undefined,
        } : undefined,
        dateIssued: parseResult.metadata.mailingDate || undefined,
        responseDeadline: undefined,
        rejections: parseResult.rejections.map(rejection => ({
          type: rejection.type.replace('§', '') as '102' | '103' | '101' | '112', // Remove § symbol for DB
          claimNumbers: rejection.claims,
          reasoning: rejection.examinerReasoning,
          citedReferences: rejection.priorArtReferences,
          elements: [],
        })),
        citedReferences: parseResult.rejections.flatMap(rejection => 
          rejection.priorArtReferences.map((ref: string) => ({
            patentNumber: ref,
            title: undefined,
            inventors: undefined,
            assignee: undefined,
          }))
        ),
        // Store the AI-generated user-friendly summary in examinerRemarks
        examinerRemarks: parseResult.summary.userFriendlySummary || undefined,
        // Store detailed analysis if available
        detailedAnalysis: parseResult.summary.detailedAnalysis || undefined,
      };

      // Update the Office Action with parsed data
      await updateOfficeActionParsedData(
        officeActionId,
        tenantId,
        parsedData,
        'COMPLETED' // Mark as COMPLETED since we have comprehensive analysis
      );

      // Create rejection records if any rejections were found
      let rejectionCount = 0;
      if (parsedData.rejections?.length > 0) {
        const rejectionCreateData = parsedData.rejections.map((rejection, index) => ({
          officeActionId,
          type: rejection.type,
          claimNumbers: rejection.claimNumbers,
          citedPriorArt: rejection.citedReferences || [],
          examinerText: rejection.reasoning,
          parsedElements: rejection.elements ? { elements: rejection.elements } : undefined,
          displayOrder: index,
        }));
        
        const createdRejections = await createRejections(rejectionCreateData);
        rejectionCount = parsedData.rejections.length;

        // Map AI analysis results to real database rejection IDs
        const mappedAnalyses = this.mapAnalysesToRealRejectionIds(
          parseResult.rejectionAnalyses,
          createdRejections,
          parsedData.rejections
        );

        // NEW: Store comprehensive rejection analysis results in database
        await this.storeRejectionAnalysisResults(
          officeActionId,
          mappedAnalyses,
          parseResult.overallStrategy,
          tenantId
        );
      }

      logger.info('[AmendmentService] Office Action parsing completed', {
        officeActionId,
        rejectionCount,
        hasDetailedAnalysis: !!parsedData.detailedAnalysis,
      });

      // Orchestration is no longer needed - comprehensive analysis is complete!
      logger.info('[AmendmentService] Comprehensive analysis completed - skipping orchestration', {
        officeActionId,
        rejectionCount,
        hasRejectionAnalysis: parseResult.rejectionAnalyses?.length > 0,
        overallStrategy: parseResult.overallStrategy?.primaryStrategy,
      });

      return {
        success: true,
        rejectionCount,
      };

    } catch (error) {
      logger.error('[AmendmentService] Failed to parse Office Action', {
        officeActionId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Update status to ERROR
      try {
        await updateOfficeActionStatus(officeActionId, tenantId, 'ERROR');
      } catch (statusError) {
        logger.error('[AmendmentService] Failed to update Office Action status to ERROR', {
          officeActionId,
          statusError: statusError instanceof Error ? statusError.message : String(statusError),
        });
      }

      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError(
        ErrorCode.AI_SERVICE_ERROR,
        `Failed to parse Office Action: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Analyze rejections using existing prior art analysis capabilities
   */
  static async analyzeRejections(
    request: OfficeActionAnalysisRequest
  ): Promise<RejectionAnalysisResult> {
    logger.info('[AmendmentService] Starting rejection analysis', {
      officeActionId: request.officeActionId,
      projectId: request.projectId,
    });

         try {
       // Get office action and rejections from repositories
       const officeAction = await findOfficeActionById(request.officeActionId, 'tenant-placeholder');
       if (!officeAction) {
         throw new ApplicationError(
           ErrorCode.DB_RECORD_NOT_FOUND,
           `Office Action ${request.officeActionId} not found`
         );
       }

       const rejections = await findRejectionsByOfficeAction(request.officeActionId);
       if (rejections.length === 0) {
         throw new ApplicationError(
           ErrorCode.INVALID_INPUT,
           'No rejections found for analysis'
         );
       }

      // Get current claims from project (leverage existing claim repository)
      const currentClaim1 = await this.getCurrentClaim1Text(request.projectId);
      if (!currentClaim1) {
        throw new ApplicationError(
          ErrorCode.INVALID_INPUT,
          'No current Claim 1 found for analysis'
        );
      }

      // Analyze each rejection using prior art analysis
      const analyses: RejectionAnalysis[] = [];

      for (const rejection of rejections) {
        const priorArtRefs = JSON.parse(rejection.citedPriorArt || '[]');
        
        if (priorArtRefs.length > 0) {
          // Use existing semantic search to gather prior art details
          const priorArtAnalysis = await this.analyzePriorArtForRejection(
            rejection,
            priorArtRefs,
            currentClaim1,
            request.projectId
          );

          analyses.push(priorArtAnalysis);
        } else {
          // Handle rejections without prior art (e.g., §101, §112)
          const nonPriorArtAnalysis = await this.analyzeNonPriorArtRejection(
            rejection,
            currentClaim1
          );

          analyses.push(nonPriorArtAnalysis);
        }
      }

      // Determine overall strategy
      const overallStrategy = this.determineOverallStrategy(analyses);
      const overallConfidence = this.calculateOverallConfidence(analyses);

      logger.info('[AmendmentService] Successfully analyzed rejections', {
        officeActionId: request.officeActionId,
        rejectionCount: analyses.length,
        overallStrategy,
      });

      return {
        analyses,
        overallStrategy,
        confidence: overallConfidence,
      };

    } catch (error) {
      logger.error('[AmendmentService] Failed to analyze rejections', {
        officeActionId: request.officeActionId,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError(
        ErrorCode.AI_SERVICE_ERROR,
        `Failed to analyze rejections: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate amendment response based on analysis with comprehensive file history context
   */
  static async generateAmendmentResponse(
    request: AmendmentGenerationRequest & { tenantId: string }
  ): Promise<AmendmentResponse> {
    logger.info('[AmendmentService] Starting amendment generation with file history context', {
      officeActionId: request.officeActionId,
      strategy: request.strategy,
      projectId: request.projectId,
    });

    try {
      // Get office action and analysis data from repositories  
      const officeAction = await findOfficeActionById(request.officeActionId, request.tenantId);
      if (!officeAction) {
        throw new ApplicationError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          `Office Action ${request.officeActionId} not found`
        );
      }

      const rejections = await findRejectionsByOfficeAction(request.officeActionId);
      const currentClaim1 = await this.getCurrentClaim1Text(request.projectId);

      // Build comprehensive file history context for AI agent
      logger.debug('[AmendmentService] Building file history context', { projectId: request.projectId });
      const contextOptions = createDefaultContextOptions(request.tenantId, {
        includeFullText: true, // Include full text for detailed analysis
        maxHistoryDepth: 5, // Include last 5 rounds of prosecution
        includeExaminerAnalysis: true,
        includeClaimEvolution: true,
        includePriorArtHistory: true,
      });

      const aiContext = await FileHistoryContextBuilder.buildAIAgentContext(
        request.projectId,
        contextOptions
      );

      // Generate amendment using AI with enhanced context
      const systemPrompt = renderPromptTemplate(AMENDMENT_GENERATION_SYSTEM_PROMPT, {});
      const userPrompt = this.buildEnhancedAmendmentGenerationPrompt(
        officeAction,
        rejections,
        currentClaim1,
        request.strategy,
        aiContext,
        request.userInstructions
      );

       const aiResponse = await processWithOpenAI(systemPrompt, userPrompt, {
         maxTokens: 8000,
         temperature: 0.3,
       });

       const amendmentData = safeJsonParse(aiResponse.content, {}) as {
         claimAmendments?: ClaimAmendment[];
         argumentSections?: ArgumentSection[];
         responseDocument?: string;
       };

       // Create amendment response object
       const amendmentResponse: AmendmentResponse = {
         id: `amendment-${Date.now()}`,
         officeActionId: request.officeActionId,
         projectId: request.projectId,
         status: 'COMPLETE',
         strategy: request.strategy,
         claimAmendments: amendmentData.claimAmendments || [],
         argumentSections: amendmentData.argumentSections || [],
         responseDocument: amendmentData.responseDocument,
         createdAt: new Date(),
         updatedAt: new Date(),
       };

      logger.info('[AmendmentService] Successfully generated amendment response with file history context', {
        officeActionId: request.officeActionId,
        claimAmendmentCount: amendmentResponse.claimAmendments.length,
        argumentSectionCount: amendmentResponse.argumentSections.length,
        fileHistoryContextUsed: true,
        prosecutionRound: aiContext.fileHistory.metadata.currentRoundNumber,
        riskLevel: aiContext.riskAssessment.overallRiskLevel,
      });

      // Invalidate context cache for this project since we've generated a new response
      FileHistoryContextBuilder.invalidateProjectCache(request.projectId);

      return amendmentResponse;

    } catch (error) {
      logger.error('[AmendmentService] Failed to generate amendment', {
        officeActionId: request.officeActionId,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError(
        ErrorCode.AI_SERVICE_ERROR,
        `Failed to generate amendment: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // ============ PRIVATE HELPER METHODS ============

  /**
   * Get current Claim 1 text from project
   */
  private static async getCurrentClaim1Text(projectId: string): Promise<string | null> {
    logger.debug('[AmendmentService] Getting current Claim 1 text', { projectId });
    
    try {
      if (!prisma) {
        throw new ApplicationError(
          ErrorCode.DB_CONNECTION_ERROR,
          'Database client not initialized'
        );
      }

      // First get the invention ID from the project
      const invention = await prisma.invention.findUnique({
        where: { projectId },
        select: { id: true },
      });

      if (!invention) {
        logger.warn('[AmendmentService] No invention found for project', { projectId });
        return null;
      }

      // Get claims for this invention
      const claims = await ClaimRepository.findByInventionId(invention.id);
      
      // Find claim 1
      const claim1 = claims.find(claim => claim.number === 1);
      
      if (!claim1) {
        logger.warn('[AmendmentService] No Claim 1 found for invention', { 
          projectId, 
          inventionId: invention.id 
        });
        return null;
      }

      logger.info('[AmendmentService] Found Claim 1', { 
        projectId, 
        inventionId: invention.id,
        claimLength: claim1.text.length 
      });

      return claim1.text;
    } catch (error) {
      logger.error('[AmendmentService] Error getting Claim 1 text', {
        projectId,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Analyze prior art rejection using existing capabilities
   */
  private static async analyzePriorArtForRejection(
    rejection: any,
    priorArtRefs: string[],
    currentClaim: string,
    projectId: string
  ): Promise<RejectionAnalysis> {
    logger.error('[AmendmentService] Prior art analysis not implemented', {
      rejectionId: rejection.id,
      priorArtCount: priorArtRefs.length,
    });

    throw new ApplicationError(
      ErrorCode.NOT_IMPLEMENTED,
      'Prior art rejection analysis is not yet implemented. Please use the comprehensive analysis instead.'
    );
  }

  /**
   * Analyze non-prior art rejections (§101, §112)
   */
  private static async analyzeNonPriorArtRejection(
    rejection: any,
    currentClaim: string
  ): Promise<RejectionAnalysis> {
    logger.error('[AmendmentService] Non-prior art analysis not implemented', {
      rejectionId: rejection.id,
      type: rejection.type,
    });

    throw new ApplicationError(
      ErrorCode.NOT_IMPLEMENTED,
      'Non-prior art rejection analysis is not yet implemented. Please use the comprehensive analysis instead.'
    );
  }

  /**
   * Determine overall strategy from individual analyses
   */
  private static determineOverallStrategy(
    analyses: RejectionAnalysis[]
  ): keyof typeof AmendmentStrategy {
    const strategies = analyses.map(a => a.recommendedStrategy);
    
    // If any require amendment, use combination strategy
    if (strategies.includes(AmendmentStrategy.AMEND_CLAIMS)) {
      return AmendmentStrategy.COMBINATION;
    }
    
    // If all are argue, use argue strategy
    if (strategies.every(s => s === AmendmentStrategy.ARGUE_REJECTION)) {
      return AmendmentStrategy.ARGUE_REJECTION;
    }
    
    // Default to combination
    return AmendmentStrategy.COMBINATION;
  }

  /**
   * Calculate overall confidence score
   */
  private static calculateOverallConfidence(analyses: RejectionAnalysis[]): number {
    if (analyses.length === 0) return 0;
    
    const avgConfidence = analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length;
    return Math.round(avgConfidence * 100) / 100;
  }

  /**
   * Build enhanced prompt for amendment generation with comprehensive file history context
   */
  private static buildEnhancedAmendmentGenerationPrompt(
    officeAction: any,
    rejections: any[],
    currentClaim: string | null,
    strategy: keyof typeof AmendmentStrategy,
    aiContext: AIAgentContext,
    userInstructions?: string
  ): string {
    const fileHistory = aiContext.fileHistory;
    const currentState = aiContext.currentState;
    const strategicGuidance = aiContext.strategicGuidance;
    const riskAssessment = aiContext.riskAssessment;

    return `
You are an experienced patent attorney drafting an amendment response to an Office Action. You have access to the complete file history and prosecution context for this application.

## CURRENT OFFICE ACTION CONTEXT
Strategy: ${strategy}
Current Claim 1: ${currentClaim || 'Not available'}

### Rejections to Address:
${rejections.map((r, i) => `
${i + 1}. Type: ${r.type}
   Claims: ${JSON.parse(r.claimNumbers || '[]').join(', ')}
   Prior Art: ${JSON.parse(r.citedPriorArt || '[]').join(', ')}
   Examiner Text: ${r.examinerText}
`).join('\n')}

## FILE HISTORY CONTEXT

### Prosecution History Summary:
- Total Office Actions: ${fileHistory.metadata.totalOfficeActions}
- Total Responses: ${fileHistory.metadata.totalResponses}
- Current Round: ${fileHistory.metadata.currentRoundNumber}
- Prosecution Duration: ${fileHistory.metadata.prosecutionDuration} days
${fileHistory.metadata.lastResponseDate ? `- Last Response: ${fileHistory.metadata.lastResponseDate.toLocaleDateString()}` : ''}

### Examiner Context:
- Examiner: ${fileHistory.examinerContext.current.name || 'Unknown'}
- Art Unit: ${fileHistory.examinerContext.current.artUnit || 'Unknown'}
- Interaction History: ${fileHistory.examinerContext.history.length} previous interactions

#### Examiner Patterns Observed:
${fileHistory.examinerContext.patterns.commonRejectionTypes.map(pattern => 
  `- ${pattern.type}: ${pattern.frequency} times`
).join('\n')}

### Claim Evolution History:
${fileHistory.claimEvolution.claims.map(claim => `
- Claim ${claim.claimNumber}: ${claim.totalAmendments} amendments
  Current: ${claim.currentText}
`).join('\n')}

### Prior Argument History:
#### Previous §103 Arguments (${fileHistory.priorArgumentHistory.byRejectionType.section103.length}):
${fileHistory.priorArgumentHistory.byRejectionType.section103.slice(0, 3).map(arg => 
  `- ${arg.date.toLocaleDateString()}: ${arg.argumentText.substring(0, 200)}...`
).join('\n')}

#### Previous §102 Arguments (${fileHistory.priorArgumentHistory.byRejectionType.section102.length}):
${fileHistory.priorArgumentHistory.byRejectionType.section102.slice(0, 3).map(arg => 
  `- ${arg.date.toLocaleDateString()}: ${arg.argumentText.substring(0, 200)}...`
).join('\n')}

### Current Application State:
#### Open Rejections: ${currentState.openRejections.length}
${currentState.openRejections.map(rejection => 
  `- ${rejection.type} affecting claims ${rejection.claimsAffected.join(', ')}`
).join('\n')}

#### Pending Deadlines: ${currentState.pendingDeadlines.length}
${currentState.pendingDeadlines.map(deadline => 
  `- ${deadline.type}: ${deadline.date.toLocaleDateString()} (${deadline.criticality} priority)`
).join('\n')}

## STRATEGIC GUIDANCE

### Overall Strategy: ${strategicGuidance.overallStrategy}

### Key Messages to Emphasize:
${strategicGuidance.keyMessages.map(msg => `- ${msg}`).join('\n')}

### Arguments to Emphasize:
${strategicGuidance.argumentsToEmphasize.map(arg => `- ${arg}`).join('\n')}

### Arguments to Avoid (based on file history):
${strategicGuidance.argumentsToAvoid.map(arg => `- ${arg}`).join('\n')}

### Claim Scope Recommendations:
${strategicGuidance.claimScopeRecommendations.map(rec => `- ${rec}`).join('\n')}

## RISK ASSESSMENT

### Overall Risk Level: ${riskAssessment.overallRiskLevel}

### Prosecution Risks:
${riskAssessment.prosecutionRisks.map(risk => 
  `- ${risk.type}: ${risk.description} (Likelihood: ${(risk.likelihood * 100).toFixed(0)}%, Impact: ${(risk.impact * 100).toFixed(0)}%)`
).join('\n')}

### Claim Scope Risks:
${riskAssessment.claimScopeRisks.map(risk => 
  `- ${risk.type}: ${risk.description}`
).join('\n')}

## INSTRUCTIONS

${userInstructions ? `### Additional User Instructions:
${userInstructions}

` : ''}

### Required Response Structure:
1. **Claim Amendments**: Provide specific, surgical amendments that overcome rejections while maintaining broad scope
2. **Argument Sections**: Craft detailed arguments that build on successful patterns and avoid previous failures
3. **Response Document**: Generate a professional, USPTO-compliant response

### Critical Requirements:
- **Consistency**: Ensure arguments are consistent with previous successful positions in this file history
- **Learning**: Build upon what has worked before and avoid what has failed with this examiner
- **Strategic**: Consider the long-term prosecution strategy and potential continuation applications
- **Contextual**: Reference specific prior art differences already established in the file history
- **Professional**: Use appropriate legal language and USPTO formatting

Generate a comprehensive amendment response that demonstrates the deep understanding of a seasoned patent attorney familiar with this application's complete prosecution history.
    `;
  }

  /**
   * Legacy method for backward compatibility
   */
  private static buildAmendmentGenerationPrompt(
    officeAction: any,
    rejections: any[],
    currentClaim: string | null,
    strategy: keyof typeof AmendmentStrategy,
    userInstructions?: string
  ): string {
    return `
      Generate an amendment response for this Office Action:
      
      Strategy: ${strategy}
      Current Claim 1: ${currentClaim || 'Not available'}
      
      Rejections:
      ${rejections.map((r, i) => `
        ${i + 1}. Type: ${r.type}
           Claims: ${JSON.parse(r.claimNumbers || '[]').join(', ')}
           Prior Art: ${JSON.parse(r.citedPriorArt || '[]').join(', ')}
           Examiner Text: ${r.examinerText}
      `).join('\n')}
      
      ${userInstructions ? `Additional Instructions: ${userInstructions}` : ''}
      
      Generate a comprehensive amendment response following USPTO guidelines.
    `;
  }

  /**
   * Get project ID for an office action
   */
  private static async getProjectIdForOfficeAction(officeActionId: string): Promise<string> {
    const officeAction = await prisma?.officeAction.findUnique({
      where: { id: officeActionId },
      select: { projectId: true },
    });
    
    if (!officeAction) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'Office Action not found'
      );
    }
    
    return officeAction.projectId;
  }

  /**
   * Build prosecution context for enhanced AI analysis
   */
  private static async buildProsecutionContext(officeActionId: string): Promise<{
    projectId: string;
    applicationNumber?: string;
    prosecutionRound?: number;
    previousOfficeActions?: string[];
  }> {
    try {
      // Get the office action and related project info
      const officeAction = await findOfficeActionById(officeActionId);
      if (!officeAction) {
        logger.warn('[AmendmentService] Office Action not found for prosecution context', {
          officeActionId,
        });
        return { projectId: '' };
      }

      // Get project and application info
      const project = await prisma?.project.findUnique({
        where: { id: officeAction.projectId },
        include: {
          patentApplication: true,
          officeActions: {
            where: {
              id: { not: officeActionId }, // Exclude current OA
            },
            orderBy: { createdAt: 'asc' },
            select: { id: true, dateIssued: true, status: true },
          },
        },
      });

      if (!project) {
        return { projectId: officeAction.projectId };
      }

      // Build context
      const context = {
        projectId: project.id,
        applicationNumber: project.patentApplication?.applicationNumber || undefined,
        prosecutionRound: (project.officeActions?.length || 0) + 1, // Current round
        previousOfficeActions: project.officeActions?.map(oa => oa.id) || [],
      };

      logger.debug('[AmendmentService] Built prosecution context', {
        officeActionId,
        context,
      });

      return context;

    } catch (error) {
      logger.warn('[AmendmentService] Failed to build prosecution context', {
        officeActionId,
        error: error instanceof Error ? error.message : String(error),
      });

      // Return minimal context on error
      return { projectId: '' };
    }
  }

  /**
   * Map risk level to difficulty for database storage
   */
  private static mapRiskLevelToDifficulty(riskLevel?: string): string {
    switch (riskLevel?.toUpperCase()) {
      case 'LOW':
        return 'EASY';
      case 'MEDIUM':
        return 'MEDIUM';
      case 'HIGH':
        return 'HARD';
      default:
        return 'MEDIUM';
    }
  }

  /**
   * Map AI-generated analysis results to real database rejection IDs
   */
  private static mapAnalysesToRealRejectionIds(
    aiAnalyses: RejectionAnalysisResult[],
    createdRejections: any[],
    parsedRejections: any[]
  ): RejectionAnalysisResult[] {
    return aiAnalyses.map((analysis, index) => {
      // Map by index since rejections are created in the same order as parsed
      const realRejectionId = createdRejections[index]?.id;
      
      if (!realRejectionId) {
        logger.warn('[AmendmentService] Could not map analysis to real rejection ID', {
          analysisIndex: index,
          originalRejectionId: analysis.rejectionId,
        });
        return analysis; // Return original if mapping fails
      }

      return {
        ...analysis,
        rejectionId: realRejectionId, // Replace with real database ID
      };
    });
  }

  /**
   * Store comprehensive rejection analysis results in database
   */
  private static async storeRejectionAnalysisResults(
    officeActionId: string,
    rejectionAnalyses: RejectionAnalysisResult[],
    overallStrategy: StrategyRecommendation,
    tenantId: string
  ): Promise<void> {
    try {
      logger.info('[AmendmentService] Storing comprehensive analysis results', {
        officeActionId,
        analysisCount: rejectionAnalyses.length,
        strategy: overallStrategy.primaryStrategy,
      });

      // Store rejection analysis results
      for (const analysis of rejectionAnalyses) {
        try {
          await prisma?.rejectionAnalysisResult.create({
            data: {
              rejectionId: analysis.rejectionId,
              officeActionId,
              analysisType: 'COMPREHENSIVE',
              strengthScore: this.mapStrengthToScore(analysis.strength),
              priorArtMapping: JSON.stringify({
                examinerReasoningGaps: analysis.examinerReasoningGaps,
                argumentPoints: analysis.argumentPoints,
                amendmentSuggestions: analysis.amendmentSuggestions,
              }),
              suggestedStrategy: analysis.recommendedStrategy,
              reasoning: analysis.strategyRationale,
              confidenceScore: analysis.confidenceScore,
              modelVersion: 'gpt-4-comprehensive',
              agentVersion: '2.0.0',
              model: 'gpt-4',
            },
          });
        } catch (rejectionError) {
          logger.warn('[AmendmentService] Failed to store rejection analysis', {
            rejectionId: analysis.rejectionId,
            error: rejectionError instanceof Error ? rejectionError.message : String(rejectionError),
          });
        }
      }

      // Store overall strategy recommendation  
      try {
        // Get the application ID from the office action's project
        const officeActionWithProject = await prisma?.officeAction.findUnique({
          where: { id: officeActionId },
          include: {
            project: {
              include: {
                patentApplications: {
                  select: { id: true },
                  take: 1
                }
              }
            }
          }
        });

        const applicationId = officeActionWithProject?.project?.patentApplications?.[0]?.id;
        
        if (!applicationId) {
          logger.warn('[AmendmentService] No patent application found for strategy recommendation', {
            officeActionId,
          });
          return; // Skip strategy creation if no application found
        }

        await prisma?.strategyRecommendation.create({
          data: {
            officeActionId,
            applicationId,
            overallStrategy: overallStrategy.primaryStrategy,
            priorityActions: JSON.stringify(overallStrategy.alternativeStrategies),
            estimatedDifficulty: this.mapRiskLevelToDifficulty(overallStrategy.riskLevel),
            reasoning: overallStrategy.reasoning,
            successProbability: overallStrategy.confidence,
          },
        });
      } catch (strategyError) {
        logger.warn('[AmendmentService] Failed to store strategy recommendation', {
          officeActionId,
          error: strategyError instanceof Error ? strategyError.message : String(strategyError),
        });
      }

      logger.info('[AmendmentService] Successfully stored comprehensive analysis results', {
        officeActionId,
        analysisCount: rejectionAnalyses.length,
      });

    } catch (error) {
      logger.error('[AmendmentService] Failed to store rejection analysis results', {
        officeActionId,
        error: error instanceof Error ? error.message : String(error),
      });
      
      // Don't throw - this is a storage optimization, not critical
      // The comprehensive analysis is still available in memory and can be used
    }
  }

  /**
   * Map rejection strength to numeric score for database storage
   */
  private static mapStrengthToScore(strength: RejectionStrength): number {
    const strengthMap: Record<RejectionStrength, number> = {
      'STRONG': 0.9,
      'MODERATE': 0.7,
      'WEAK': 0.4,
      'FLAWED': 0.1,
    };
    
    return strengthMap[strength] || 0.8;
  }
} 
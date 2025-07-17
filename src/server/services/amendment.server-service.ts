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
  ParsedRejection,
  RejectionAnalysis,
  AmendmentResponse,
  AmendmentStrategy,
  ClaimAmendment,
  ArgumentSection,
} from '@/types/domain/amendment';
import { 
  findOfficeActionById,
  updateOfficeActionParsedData,
  updateOfficeActionStatus 
} from '@/repositories/officeActionRepository';
import { 
  createRejections,
  findRejectionsByOfficeAction 
} from '@/repositories/rejectionRepository';

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
  version: '1.0.0',
  template: `You are an expert patent attorney drafting an amendment response to an Office Action.

Your task is to generate a comprehensive amendment response including:
1. **Claim Amendments**: Specific changes to overcome rejections while maintaining broad scope
2. **Argument Sections**: Detailed arguments against invalid rejections
3. **Response Structure**: Professional formatting following USPTO guidelines

Return the response as JSON following this structure:
{
  "claimAmendments": [
    {
      "claimNumber": "1",
      "originalText": "original claim text",
      "amendedText": "amended claim text with changes",
      "justification": "explanation of why this amendment overcomes the rejection"
    }
  ],
  "argumentSections": [
    {
      "rejectionId": "string",
      "title": "Argument Against Rejection Under 35 U.S.C. § 103",
      "content": "detailed argument text",
      "priorArtReferences": ["US1234567A", "US9876543B2"]
    }
  ],
  "responseDocument": "complete formatted response document text"
}`,
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
    extractedText: string
  ): Promise<{ success: boolean; rejectionCount: number }> {
    logger.info('[AmendmentService] Starting Office Action parsing', {
      officeActionId,
      textLength: extractedText.length,
    });

    try {
      // Parse the Office Action using AI
      const parseResult = await OfficeActionParserService.parseOfficeAction(extractedText);

             // TODO: Update the office action with parsed data - integrate with repository
       // await updateOfficeActionParsedData(officeActionId, JSON.stringify(parseResult));

       // TODO: Create rejection records - integrate with repository
       // if (parseResult.rejections.length > 0) {
       //   const rejectionData = parseResult.rejections.map(rejection => ({
       //     officeActionId,
       //     type: rejection.type,
       //     claimNumbers: rejection.claims,
       //     citedPriorArt: rejection.priorArtReferences,
       //     examinerText: rejection.examinerReasoning,
       //     parsedElements: undefined,
       //     displayOrder: parseResult.rejections.indexOf(rejection),
       //   }));
       //   await createRejections(rejectionData);
       // }

       // TODO: Update status to parsed - integrate with repository
       // await updateOfficeActionStatus(officeActionId, 'PARSED');

      logger.info('[AmendmentService] Successfully parsed Office Action', {
        officeActionId,
        rejectionCount: parseResult.rejections.length,
        priorArtCount: parseResult.allPriorArtReferences.length,
      });

      return {
        success: true,
        rejectionCount: parseResult.rejections.length,
      };

         } catch (error) {
       logger.error('[AmendmentService] Failed to parse Office Action', {
         officeActionId,
         error: error instanceof Error ? error.message : String(error),
       });

       // TODO: Update status to error - integrate with repository
       // await updateOfficeActionStatus(officeActionId, 'ERROR');

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
       // TODO: Get office action and rejections - integrate with repository
       // const officeAction = await findOfficeActionById(request.officeActionId);
       // if (!officeAction) {
       //   throw new ApplicationError(
       //     ErrorCode.DB_RECORD_NOT_FOUND,
       //     `Office Action ${request.officeActionId} not found`
       //   );
       // }

       // const rejections = await findRejectionsByOfficeAction(request.officeActionId);
       // if (rejections.length === 0) {
       //   throw new ApplicationError(
       //     ErrorCode.INVALID_INPUT,
       //     'No rejections found for analysis'
       //   );
       // }

       // Placeholder for demonstration - TODO: integrate with actual repositories
       const rejections = [] as any[];

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
   * Generate amendment response based on analysis
   */
  static async generateAmendmentResponse(
    request: AmendmentGenerationRequest
  ): Promise<AmendmentResponse> {
    logger.info('[AmendmentService] Starting amendment generation', {
      officeActionId: request.officeActionId,
      strategy: request.strategy,
    });

         try {
       // TODO: Get office action and analysis data - integrate with repository  
       // const officeAction = await findOfficeActionById(request.officeActionId);
       // if (!officeAction) {
       //   throw new ApplicationError(
       //     ErrorCode.DB_RECORD_NOT_FOUND,
       //     `Office Action ${request.officeActionId} not found`
       //   );
       // }

       // const rejections = await findRejectionsByOfficeAction(request.officeActionId);
       const currentClaim1 = await this.getCurrentClaim1Text(request.projectId);

       // Placeholder data - TODO: integrate with actual repositories
       const officeAction = {} as any;
       const rejections = [] as any[];

       // Generate amendment using AI
       const systemPrompt = renderPromptTemplate(AMENDMENT_GENERATION_SYSTEM_PROMPT, {});
       const userPrompt = this.buildAmendmentGenerationPrompt(
         officeAction,
         rejections,
         currentClaim1,
         request.strategy,
         request.userInstructions
       );

       const aiResponse = await processWithOpenAI(systemPrompt, userPrompt, {
         maxTokens: 8000,
         temperature: 0.3,
         model: 'gpt-4o',
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

      logger.info('[AmendmentService] Successfully generated amendment response', {
        officeActionId: request.officeActionId,
        claimAmendmentCount: amendmentResponse.claimAmendments.length,
        argumentSectionCount: amendmentResponse.argumentSections.length,
      });

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
    // This would integrate with existing claim repository
    // For now, return a placeholder - this should be implemented to use existing claim retrieval
    logger.debug('[AmendmentService] Getting current Claim 1 text', { projectId });
    
    // TODO: Integrate with existing claimRepository.findByProjectId()
    // const claims = await claimRepository.findByProjectId(projectId);
    // return claims?.['1'] || null;
    
    return null; // Placeholder - implement with existing claim repository
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
    // Leverage existing prior art analysis system
    // This would integrate with the existing callAIServiceForAnalysis function
    
    logger.debug('[AmendmentService] Analyzing prior art rejection', {
      rejectionId: rejection.id,
      priorArtCount: priorArtRefs.length,
    });

    // TODO: Implement using existing prior art analysis
    // const analysis = await callAIServiceForAnalysis(currentClaim, priorArtReferences);
    
    // For now, return a basic analysis structure
    return {
      rejectionId: rejection.id,
      isValid: true, // TODO: Determine from analysis
      confidence: 0.8, // TODO: Calculate from analysis
      missingElements: [], // TODO: Extract from analysis
      weakArguments: [], // TODO: Extract from analysis
      recommendedStrategy: AmendmentStrategy.COMBINATION,
      suggestedAmendments: [], // TODO: Generate from analysis
      argumentPoints: [], // TODO: Generate from analysis
    };
  }

  /**
   * Analyze non-prior art rejections (§101, §112)
   */
  private static async analyzeNonPriorArtRejection(
    rejection: any,
    currentClaim: string
  ): Promise<RejectionAnalysis> {
    logger.debug('[AmendmentService] Analyzing non-prior art rejection', {
      rejectionId: rejection.id,
      type: rejection.type,
    });

    // Analyze rejections that don't involve prior art
    const systemPrompt = renderPromptTemplate(REJECTION_ANALYSIS_SYSTEM_PROMPT, {});
    const userPrompt = `
      Analyze this rejection that does not involve prior art:
      
      Type: ${rejection.type}
      Examiner Reasoning: ${rejection.examinerText}
      Current Claim: ${currentClaim}
      
      Provide analysis focusing on the specific statutory requirements.
    `;

    const aiResponse = await processWithOpenAI(systemPrompt, userPrompt, {
      maxTokens: 2000,
      temperature: 0.2,
      model: 'gpt-4o',
    });

         const analysisData = safeJsonParse(aiResponse.content, {}) as {
       analyses?: RejectionAnalysis[];
     };
     
     return analysisData?.analyses?.[0] || {
      rejectionId: rejection.id,
      isValid: false,
      confidence: 0.6,
      missingElements: [],
      weakArguments: [],
      recommendedStrategy: AmendmentStrategy.ARGUE_REJECTION,
      suggestedAmendments: [],
      argumentPoints: [],
    };
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
   * Build prompt for amendment generation
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
} 
/**
 * Rejection Analysis Server Service
 * 
 * Analyzes Office Action rejections to assess examiner reasoning strength,
 * generates claim charts, and provides strategic recommendations.
 * Follows existing service patterns for consistency and security.
 */

import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { processWithOpenAI } from '@/server/ai/aiService';
import { renderPromptTemplate } from '@/server/prompts/prompts/utils';
import { safeJsonParse } from '@/utils/jsonUtils';
import { prisma } from '@/lib/prisma';
import { 
  findRejectionById,
  updateRejectionAnalysis 
} from '@/repositories/rejectionRepository';
import { findOfficeActionWithRelationsById } from '@/repositories/officeActionRepository';
import { ClaimRepository } from '@/repositories/claimRepository';
import type { 
  RejectionStrength,
  RejectionAnalysisResult,
  ClaimChartRow,
  StrategyRecommendation 
} from '@/types/domain/rejection-analysis';

// ============ PROMPT TEMPLATES ============

const REJECTION_ANALYSIS_SYSTEM_PROMPT = {
  version: '1.0.0',
  template: `You are an expert USPTO patent attorney analyzing Office Action rejections to determine their strength and merit.

Your expertise includes:
- Deep understanding of patent law (35 U.S.C. §§ 102, 103, 101, 112)
- Ability to identify gaps in examiner reasoning
- Experience with successful argument strategies
- Knowledge of when to argue vs. amend claims

Analyze rejections objectively and provide actionable strategic guidance.`,
};

const REJECTION_ANALYSIS_USER_PROMPT = {
  version: '1.0.0',
  template: `Analyze this Office Action rejection for strength and validity:

REJECTION TYPE: {{rejectionType}}
CLAIMS AFFECTED: {{claimNumbers}}
CITED PRIOR ART: {{citedReferences}}

EXAMINER'S REASONING:
{{examinerReasoning}}

CURRENT CLAIM TEXT:
{{claimText}}

PRIOR ART DETAILS:
{{priorArtDetails}}

Perform the following analysis:

1. **Examiner Reasoning Assessment**: Is the examiner's application of law correct? Are all claim elements properly addressed?

2. **Prior Art Mapping**: Create a claim chart showing which elements are disclosed vs. missing in the cited art.

3. **Strength Assessment**: Rate the rejection strength:
   - STRONG: All elements clearly disclosed, proper legal reasoning
   - MODERATE: Most elements disclosed, minor gaps in reasoning
   - WEAK: Significant elements missing or flawed reasoning
   - FLAWED: Clear examiner error or misreading

4. **Strategic Recommendation**: Based on strength, recommend:
   - ARGUE: Rejection has clear weaknesses to exploit
   - AMEND: Rejection is solid, amendment needed
   - COMBINATION: Argue some points while amending others

Return JSON with this structure:
{
  "strength": "STRONG|MODERATE|WEAK|FLAWED",
  "confidenceScore": 0.0-1.0,
  "examinerReasoningGaps": ["gap1", "gap2"],
  "claimChart": [
    {
      "claimElement": "element text",
      "priorArtDisclosure": "quoted text from prior art",
      "isDisclosed": true/false,
      "notes": "analysis notes"
    }
  ],
  "recommendedStrategy": "ARGUE|AMEND|COMBINATION",
  "strategyRationale": "explanation of why this strategy",
  "argumentPoints": ["point1", "point2"] // if ARGUE or COMBINATION
  "amendmentSuggestions": ["suggestion1", "suggestion2"] // if AMEND or COMBINATION
}`,
};

// ============ SERVICE CLASS ============

export class RejectionAnalysisServerService {
  /**
   * Analyzes a specific rejection for strength and strategic options
   */
  static async analyzeRejection(
    rejectionId: string,
    tenantId: string,
    options?: {
      includeClaimChart?: boolean;
      includePriorArtFullText?: boolean;
    }
  ): Promise<RejectionAnalysisResult> {
    logger.info('[RejectionAnalysis] Starting rejection analysis', {
      rejectionId,
      options,
    });

    try {
      // 1. Get rejection and validate tenant access
      const rejection = await findRejectionById(rejectionId);
      if (!rejection) {
        throw new ApplicationError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          `Rejection ${rejectionId} not found`
        );
      }

      // Validate tenant access through office action
      if (rejection.officeAction.tenantId !== tenantId) {
        throw new ApplicationError(
          ErrorCode.TENANT_ACCESS_DENIED,
          'Access denied to this rejection'
        );
      }

      // 2. Get current claim text
      const claimNumbers = typeof rejection.claimNumbers === 'string' 
        ? JSON.parse(rejection.claimNumbers) 
        : rejection.claimNumbers;
      
      const claimTexts = await this.getClaimTexts(
        rejection.officeAction.projectId,
        claimNumbers
      );

      // 3. Get prior art details if needed
      const citedReferences = typeof rejection.citedPriorArt === 'string'
        ? JSON.parse(rejection.citedPriorArt || '[]')
        : (rejection.citedPriorArt || []);

      let priorArtDetails = '';
      if (citedReferences.length > 0 && options?.includePriorArtFullText) {
        priorArtDetails = await this.fetchPriorArtDetails(citedReferences);
      }

      // 4. Prepare AI analysis
      const systemPrompt = renderPromptTemplate(REJECTION_ANALYSIS_SYSTEM_PROMPT, {});
      const userPrompt = renderPromptTemplate(REJECTION_ANALYSIS_USER_PROMPT, {
        rejectionType: rejection.type,
        claimNumbers: claimNumbers.join(', '),
        citedReferences: citedReferences.join(', '),
        examinerReasoning: rejection.examinerText,
        claimText: claimTexts.join('\n\n'),
        priorArtDetails,
      });

      // 5. Call AI for analysis
      const aiResponse = await processWithOpenAI(systemPrompt, userPrompt, {
        maxTokens: 4000,
        temperature: 0.2, // Low temperature for consistent analysis
      });

      const analysisResult = safeJsonParse<any>(aiResponse.content);
      if (!analysisResult) {
        throw new ApplicationError(
          ErrorCode.AI_INVALID_RESPONSE,
          'Failed to parse AI analysis response'
        );
      }

      // 6. Structure the result
      const result: RejectionAnalysisResult = {
        rejectionId,
        strength: analysisResult.strength as RejectionStrength,
        confidenceScore: analysisResult.confidenceScore,
        examinerReasoningGaps: analysisResult.examinerReasoningGaps || [],
        claimChart: options?.includeClaimChart ? analysisResult.claimChart : undefined,
        recommendedStrategy: analysisResult.recommendedStrategy,
        strategyRationale: analysisResult.strategyRationale,
        argumentPoints: analysisResult.argumentPoints || [],
        amendmentSuggestions: analysisResult.amendmentSuggestions || [],
        analyzedAt: new Date(),
      };

      // 7. Save analysis to database
      await updateRejectionAnalysis(rejectionId, {
        strength: result.strength,
        analysisData: result,
      });

      logger.info('[RejectionAnalysis] Analysis completed', {
        rejectionId,
        strength: result.strength,
        strategy: result.recommendedStrategy,
      });

      return result;

    } catch (error) {
      logger.error('[RejectionAnalysis] Analysis failed', {
        rejectionId,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        'Failed to analyze rejection'
      );
    }
  }

  /**
   * Fetches saved rejection analysis for an Office Action
   */
  static async getSavedOfficeActionAnalysis(
    officeActionId: string,
    tenantId: string
  ): Promise<{
    analyses: RejectionAnalysisResult[];
    overallStrategy: StrategyRecommendation;
  } | null> {
    logger.info('[RejectionAnalysis] Fetching saved analysis for Office Action', {
      officeActionId,
    });

    try {
      // Get office action with rejections
      const officeAction = await findOfficeActionWithRelationsById(officeActionId, tenantId);
      if (!officeAction) {
        throw new ApplicationError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          `Office Action ${officeActionId} not found`
        );
      }

      if (!officeAction.rejections || officeAction.rejections.length === 0) {
        logger.info('[RejectionAnalysis] No rejections found for Office Action', {
          officeActionId,
        });
        return null;
      }

      // Check if any rejections have saved analysis
      const savedAnalyses: RejectionAnalysisResult[] = [];
      let hasSavedAnalysis = false;

      for (const rejection of officeAction.rejections) {
        if (rejection.parsedElements && rejection.status) {
          try {
            const savedAnalysisData = JSON.parse(rejection.parsedElements);
            
            // Reconstruct the analysis result
            const analysisResult: RejectionAnalysisResult = {
              rejectionId: rejection.id,
              strength: rejection.status as RejectionStrength,
              confidenceScore: savedAnalysisData.confidenceScore || 0.8,
              examinerReasoningGaps: savedAnalysisData.examinerReasoningGaps || [],
              claimChart: savedAnalysisData.claimChart,
              recommendedStrategy: savedAnalysisData.recommendedStrategy || 'COMBINATION',
              strategyRationale: savedAnalysisData.strategyRationale || 'Analysis based on saved data',
              argumentPoints: savedAnalysisData.argumentPoints || [],
              amendmentSuggestions: savedAnalysisData.amendmentSuggestions || [],
              analyzedAt: savedAnalysisData.analyzedAt ? new Date(savedAnalysisData.analyzedAt) : new Date(),
            };

            savedAnalyses.push(analysisResult);
            hasSavedAnalysis = true;
          } catch (error) {
            logger.warn('[RejectionAnalysis] Failed to parse saved analysis data', {
              rejectionId: rejection.id,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      }

      if (!hasSavedAnalysis) {
        logger.info('[RejectionAnalysis] No saved analysis found for Office Action', {
          officeActionId,
        });
        return null;
      }

      // Generate overall strategy from saved analyses
      const overallStrategy = this.generateOverallStrategy(savedAnalyses);

      logger.info('[RejectionAnalysis] Retrieved saved analysis successfully', {
        officeActionId,
        rejectionCount: savedAnalyses.length,
        overallStrategy: overallStrategy.primaryStrategy,
      });

      return {
        analyses: savedAnalyses,
        overallStrategy,
      };

    } catch (error) {
      logger.error('[RejectionAnalysis] Failed to fetch saved Office Action analysis', {
        officeActionId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * Analyzes all rejections for an Office Action
   */
  static async analyzeOfficeActionRejections(
    officeActionId: string,
    tenantId: string
  ): Promise<{
    analyses: RejectionAnalysisResult[];
    overallStrategy: StrategyRecommendation;
  }> {
    logger.info('[RejectionAnalysis] Analyzing all rejections for Office Action', {
      officeActionId,
    });

    try {
      // Get office action with rejections
      const officeAction = await findOfficeActionWithRelationsById(officeActionId, tenantId);
      if (!officeAction) {
        throw new ApplicationError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          `Office Action ${officeActionId} not found`
        );
      }

      if (!officeAction.rejections || officeAction.rejections.length === 0) {
        throw new ApplicationError(
          ErrorCode.VALIDATION_REQUIRED_FIELD,
          'No rejections found for this Office Action'
        );
      }

      // Analyze each rejection
      const analyses: RejectionAnalysisResult[] = [];
      for (const rejection of officeAction.rejections) {
        const analysis = await this.analyzeRejection(rejection.id, tenantId, {
          includeClaimChart: true,
        });
        analyses.push(analysis);
      }

      // Generate overall strategy
      const overallStrategy = this.generateOverallStrategy(analyses);

      return {
        analyses,
        overallStrategy,
      };

    } catch (error) {
      logger.error('[RejectionAnalysis] Failed to analyze Office Action rejections', {
        officeActionId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * Generate overall prosecution strategy based on all rejection analyses
   */
  private static generateOverallStrategy(
    analyses: RejectionAnalysisResult[]
  ): StrategyRecommendation {
    const strongCount = analyses.filter(a => a.strength === 'STRONG').length;
    const weakCount = analyses.filter(a => a.strength === 'WEAK' || a.strength === 'FLAWED').length;
    const totalCount = analyses.length;

    let primaryStrategy: 'ARGUE' | 'AMEND' | 'COMBINATION';
    let confidence: number;
    let reasoning: string;

    if (weakCount >= totalCount * 0.7) {
      // Most rejections are weak
      primaryStrategy = 'ARGUE';
      confidence = 0.8;
      reasoning = 'Majority of rejections have significant weaknesses that can be successfully argued.';
    } else if (strongCount >= totalCount * 0.7) {
      // Most rejections are strong
      primaryStrategy = 'AMEND';
      confidence = 0.8;
      reasoning = 'Majority of rejections are well-founded and require claim amendments.';
    } else {
      // Mixed bag
      primaryStrategy = 'COMBINATION';
      confidence = 0.7;
      reasoning = 'Mixed rejection strengths suggest arguing weak rejections while amending for strong ones.';
    }

    const riskLevel = strongCount > weakCount ? 'HIGH' : weakCount > strongCount ? 'LOW' : 'MEDIUM';

    return {
      primaryStrategy,
      alternativeStrategies: this.getAlternativeStrategies(primaryStrategy),
      confidence,
      reasoning,
      riskLevel,
      keyConsiderations: this.extractKeyConsiderations(analyses),
    };
  }

  /**
   * Get claim texts for analysis
   * For now, use invention claims as fallback
   */
  private static async getClaimTexts(
    projectId: string,
    claimNumbers: string[]
  ): Promise<string[]> {
    const claimTexts: string[] = [];
    
    try {
      // Try to get claims from invention
      if (!prisma) {
        logger.warn('[RejectionAnalysis] Prisma client not initialized');
        return ['[Claim text not available]'];
      }
      
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { invention: { include: { claims: true } } },
      });

      if (project?.invention?.claims) {
        for (const claimNumber of claimNumbers) {
          const claim = project.invention.claims.find(
            (c: any) => c.claimNumber === claimNumber
          );
          if (claim) {
            claimTexts.push(`Claim ${claimNumber}: ${claim.text}`);
          }
        }
      }
    } catch (error) {
      logger.warn('[RejectionAnalysis] Failed to get claim texts', {
        projectId,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return claimTexts.length > 0 ? claimTexts : ['[Claim text not available]'];
  }

  /**
   * Fetch prior art details for analysis
   * For now, return empty string as we'll add prior art fetching later
   */
  private static async fetchPriorArtDetails(
    references: string[]
  ): Promise<string> {
    // TODO: Implement prior art fetching when prior art service is available
    return `[Prior art details for ${references.join(', ')} would be fetched here]`;
  }

  private static getAlternativeStrategies(
    primary: string
  ): string[] {
    const strategies = ['ARGUE', 'AMEND', 'COMBINATION'];
    return strategies.filter(s => s !== primary);
  }

  private static extractKeyConsiderations(
    analyses: RejectionAnalysisResult[]
  ): string[] {
    const considerations: string[] = [];
    
    // Add key points from each analysis
    analyses.forEach(analysis => {
      if (analysis.examinerReasoningGaps.length > 0) {
        considerations.push(`Examiner gaps in ${analysis.rejectionId}: ${analysis.examinerReasoningGaps[0]}`);
      }
    });

    return considerations.slice(0, 5); // Top 5 considerations
  }
} 
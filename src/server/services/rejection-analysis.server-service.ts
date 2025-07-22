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
  StrategyRecommendation,
  RecommendedStrategy
} from '@/types/domain/rejection-analysis';
import type { AmendmentContextBundle } from './amendment-context.server-service';

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
        // Enhanced tracking fields
        modelVersion: 'gpt-4',
        agentVersion: '2.0.0',
        contextualInsights: [
          {
            type: 'OCR_UTILIZATION',
            description: 'Analysis performed using raw Office Action text from OCR parsing',
            confidence: 0.95,
            source: 'Office Action OCR'
          }
        ]
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

      // First, try to get analysis from the new RejectionAnalysisResult table
      let rejectionAnalysisResults: any[] = [];
      try {
        if (prisma && 'rejectionAnalysisResult' in prisma) {
          rejectionAnalysisResults = await (prisma as any).rejectionAnalysisResult.findMany({
            where: {
              officeActionId,
            },
            include: {
              rejection: true,
            },
          });
        }
      } catch (error) {
        logger.warn('[RejectionAnalysis] Failed to query new analysis table', {
          officeActionId,
          error: error instanceof Error ? error.message : String(error),
        });
      }

      const savedAnalyses: RejectionAnalysisResult[] = [];
      let hasSavedAnalysis = false;

      // Process new format analysis results first
      if (rejectionAnalysisResults && rejectionAnalysisResults.length > 0) {
        logger.info('[RejectionAnalysis] Found new format analysis results', {
          officeActionId,
          count: rejectionAnalysisResults.length,
        });

        for (const result of rejectionAnalysisResults) {
          try {
            // Parse priorArtMapping if it exists
            let examinerReasoningGaps: string[] = [];
            let argumentPoints: string[] = [];
            let amendmentSuggestions: string[] = [];
            
            if (result.priorArtMapping) {
              try {
                const mappingData = JSON.parse(result.priorArtMapping);
                examinerReasoningGaps = mappingData.examinerReasoningGaps || [];
                argumentPoints = mappingData.argumentPoints || [];
                amendmentSuggestions = mappingData.amendmentSuggestions || [];
              } catch (parseError) {
                logger.warn('[RejectionAnalysis] Failed to parse priorArtMapping', {
                  rejectionId: result.rejectionId,
                  error: parseError instanceof Error ? parseError.message : String(parseError),
                });
              }
            }

            const analysisResult: RejectionAnalysisResult = {
              rejectionId: result.rejectionId,
              strength: this.mapScoreToStrength(result.strengthScore || 0.8),
              confidenceScore: result.confidenceScore || 0.8,
              examinerReasoningGaps,
              claimChart: [], // Claim chart not stored in new format yet
              recommendedStrategy: (result.suggestedStrategy as RecommendedStrategy) || 'COMBINATION',
              strategyRationale: result.reasoning || 'Comprehensive analysis completed',
              argumentPoints,
              amendmentSuggestions,
              analyzedAt: result.createdAt,
              modelVersion: result.modelVersion,
              agentVersion: result.agentVersion,
            };

            savedAnalyses.push(analysisResult);
            hasSavedAnalysis = true;
          } catch (error) {
            logger.warn('[RejectionAnalysis] Failed to process new format analysis', {
              rejectionId: result.rejectionId,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      }

      // If no new format analysis found, fall back to legacy format
      if (!hasSavedAnalysis) {
        logger.info('[RejectionAnalysis] No new format analysis found, checking legacy format', {
          officeActionId,
        });

        for (const rejection of officeAction.rejections) {
          if (rejection.parsedElements && rejection.status) {
            try {
              const savedAnalysisData = JSON.parse(rejection.parsedElements);
              
              // Reconstruct the analysis result from legacy format
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
              logger.warn('[RejectionAnalysis] Failed to parse legacy analysis data', {
                rejectionId: rejection.id,
                error: error instanceof Error ? error.message : String(error),
              });
            }
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
        source: rejectionAnalysisResults && rejectionAnalysisResults.length > 0 ? 'new-format' : 'legacy-format',
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
   * Analyzes all rejections for an Office Action with comprehensive OCR context
   */
  static async analyzeOfficeActionRejections(
    officeActionId: string,
    tenantId: string
  ): Promise<{
    analyses: RejectionAnalysisResult[];
    overallStrategy: StrategyRecommendation;
  }> {
    logger.info('[RejectionAnalysis] Starting comprehensive rejection analysis with OCR context', {
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

      // Get comprehensive amendment context with all OCR'd documents
      const { AmendmentContextService } = await import('./amendment-context.server-service');
      const amendmentContext = await AmendmentContextService.getAmendmentDraftingContext(
        officeAction.projectId,
        tenantId
      );

      logger.info('[RejectionAnalysis] Retrieved amendment context', {
        contextComplete: amendmentContext.metadata.contextComplete,
        ocrDocuments: amendmentContext.metadata.ocrDocuments,
        missingDocs: amendmentContext.metadata.missingDocuments,
      });

      // Enhanced analysis with full context
      const analyses: RejectionAnalysisResult[] = [];
      for (const rejection of officeAction.rejections) {
        const analysis = await this.analyzeRejectionWithContext(
          rejection,
          amendmentContext,
          tenantId
        );
        analyses.push(analysis);
      }

      // Generate comprehensive strategy with context
      const overallStrategy = this.generateOverallStrategyWithContext(analyses, amendmentContext);

      logger.info('[RejectionAnalysis] Completed comprehensive analysis', {
        analysisCount: analyses.length,
        strategy: overallStrategy.primaryStrategy,
        contextUtilized: amendmentContext.metadata.contextComplete,
      });

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
   */
  private static async getClaimTexts(
    projectId: string,
    claimNumbers: string[]
  ): Promise<string[]> {
    const claimTexts: string[] = [];
    
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client is not initialized.'
      );
    }
    
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { invention: { include: { claims: true } } },
    });

    if (!project?.invention?.claims || project.invention.claims.length === 0) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        `No claims found for project ${projectId}. Claims are required for rejection analysis.`
      );
    }

    for (const claimNumber of claimNumbers) {
      const claim = project.invention.claims.find(
        (c: any) => c.claimNumber === claimNumber
      );
      if (claim) {
        claimTexts.push(`Claim ${claimNumber}: ${claim.text}`);
      } else {
        throw new ApplicationError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          `Claim ${claimNumber} not found for project ${projectId}`
        );
      }
    }

    return claimTexts;
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

  /**
   * Enhanced rejection analysis with comprehensive OCR context
   */
  private static async analyzeRejectionWithContext(
    rejection: any,
    amendmentContext: AmendmentContextBundle,
    tenantId: string
  ): Promise<RejectionAnalysisResult> {
    logger.info('[RejectionAnalysis] Analyzing rejection with OCR context', {
      rejectionId: rejection.id,
      rejectionType: rejection.type,
      contextComplete: amendmentContext.metadata.contextComplete,
    });

    try {
      // Build comprehensive context from OCR documents
      const contextualPrompt = this.buildContextualAnalysisPrompt(rejection, amendmentContext);

      // Enhanced AI analysis with full context
      const aiResponse = await processWithOpenAI(
        this.buildEnhancedSystemPrompt(),
        contextualPrompt,
        {
          maxTokens: 6000, // Increased for comprehensive analysis
          temperature: 0.2,
        }
      );

      const analysisResult = safeJsonParse<any>(aiResponse.content);
      if (!analysisResult) {
        throw new ApplicationError(
          ErrorCode.AI_INVALID_RESPONSE,
          'Failed to parse enhanced AI analysis response'
        );
      }

      // Structure enhanced result
      const result: RejectionAnalysisResult = {
        rejectionId: rejection.id,
        strength: analysisResult.strength as RejectionStrength,
        confidenceScore: analysisResult.confidenceScore,
        examinerReasoningGaps: analysisResult.examinerReasoningGaps || [],
        claimChart: analysisResult.claimChart || [],
        recommendedStrategy: analysisResult.recommendedStrategy,
        strategyRationale: analysisResult.strategyRationale,
        argumentPoints: analysisResult.argumentPoints || [],
        amendmentSuggestions: analysisResult.amendmentSuggestions || [],
        analyzedAt: new Date(),
        // Enhanced tracking and context
        modelVersion: 'gpt-4',
        agentVersion: '2.0.0', 
        contextualInsights: this.buildContextualInsights(
          amendmentContext,
          analysisResult.contextualInsights || []
        )
      };

      // Save enhanced analysis
      await updateRejectionAnalysis(rejection.id, {
        strength: result.strength,
        analysisData: result,
      });

      logger.info('[RejectionAnalysis] Enhanced analysis completed', {
        rejectionId: rejection.id,
        strength: result.strength,
        strategy: result.recommendedStrategy,
        contextUtilized: amendmentContext.metadata.contextComplete,
      });

      return result;

    } catch (error) {
      logger.error('[RejectionAnalysis] Enhanced analysis failed', {
        rejectionId: rejection.id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Build comprehensive contextual analysis prompt using OCR documents
   */
  private static buildContextualAnalysisPrompt(
    rejection: any,
    context: AmendmentContextBundle
  ): string {
    const claimNumbers = typeof rejection.claimNumbers === 'string' 
      ? JSON.parse(rejection.claimNumbers) 
      : rejection.claimNumbers;
    
    const citedReferences = typeof rejection.citedPriorArt === 'string'
      ? JSON.parse(rejection.citedPriorArt || '[]')
      : (rejection.citedPriorArt || []);

    return `EXPERT PATENT ATTORNEY REJECTION ANALYSIS

You are analyzing this Office Action rejection with comprehensive context from all available documents.

═══ REJECTION TO ANALYZE ═══
TYPE: ${rejection.type}
AFFECTED CLAIMS: ${claimNumbers.join(', ')}
CITED PRIOR ART: ${citedReferences.join(', ')}

EXAMINER'S REASONING:
${rejection.examinerText}

═══ FULL OFFICE ACTION CONTEXT ═══
${context.officeAction ? `
OFFICE ACTION (${context.officeAction.docCode}, ${context.officeAction.date.toLocaleDateString()}):
${context.officeAction.text}

═══════════════════════════════════════
` : 'Office Action text not available in OCR context.'}

═══ CURRENT CLAIMS CONTEXT ═══
${context.claims ? `
CURRENT CLAIMS (${context.claims.docCode}, ${context.claims.date.toLocaleDateString()}):
${context.claims.text}

═══════════════════════════════════════
` : 'Current claims not available in OCR context.'}

═══ SPECIFICATION CONTEXT ═══
${context.specification ? `
SPECIFICATION (${context.specification.docCode}):
${context.specification.text.substring(0, 8000)}${context.specification.text.length > 8000 ? '...[TRUNCATED]' : ''}

═══════════════════════════════════════
` : 'Specification not available in OCR context.'}

═══ PREVIOUS RESPONSE CONTEXT ═══
${context.lastResponse ? `
LAST APPLICANT RESPONSE (${context.lastResponse.docCode}, ${context.lastResponse.date.toLocaleDateString()}):
${context.lastResponse.text}

═══════════════════════════════════════
` : 'No previous response available in OCR context.'}

═══ ADDITIONAL CONTEXT ═══
${context.extras.examinerSearch ? `
EXAMINER SEARCH NOTES:
${context.extras.examinerSearch.text}
` : ''}
${context.extras.interview ? `
INTERVIEW SUMMARY:
${context.extras.interview.text}
` : ''}

═══ ANALYSIS REQUIREMENTS ═══

Perform expert-level analysis considering ALL available context:

1. **COMPREHENSIVE STRENGTH ASSESSMENT**:
   - Cross-reference examiner reasoning with actual claim language
   - Identify specific claim elements not properly addressed
   - Compare with previous response arguments (if available)
   - Assess legal reasoning quality

2. **DETAILED CLAIM CHART ANALYSIS**:
   - Map each claim element to cited prior art
   - Identify missing elements or improper combinations
   - Note any changes since previous response

3. **STRATEGIC RECOMMENDATION**:
   - Consider prosecution history from previous response
   - Evaluate amendment vs. argument options
   - Account for specification support for amendments

4. **CONTEXT-AWARE INSIGHTS**:
   - Leverage examiner search strategy insights
   - Consider interview discussions (if available)
   - Build on successful previous arguments

Return comprehensive JSON analysis:

{
  "strength": "STRONG|MODERATE|WEAK|FLAWED",
  "confidenceScore": 0.95,
  "examinerReasoningGaps": [
    "Examiner failed to address claim element X in the prior art mapping",
    "Improper combination rationale - no teaching or motivation shown"
  ],
  "claimChart": [
    {
      "claimElement": "exact claim language",
      "priorArtDisclosure": "quoted prior art text or 'NOT DISCLOSED'",
      "isDisclosed": true/false,
      "notes": "analysis of disclosure quality"
    }
  ],
  "recommendedStrategy": "ARGUE|AMEND|COMBINATION",
  "strategyRationale": "Detailed explanation considering prosecution history and context",
  "argumentPoints": [
    "Specific argument leveraging context and prior responses",
    "Reference to specification support for claim interpretation"
  ],
  "amendmentSuggestions": [
    "Specific claim amendment with specification support cited",
    "Alternative amendment option with prosecution strategy"
  ],
  "contextualInsights": [
    "Key insights from examiner search strategy",
    "Connections to previous response arguments",
    "Specification passages that support arguments"
  ]
}`;
  }

  /**
   * Build enhanced system prompt for contextual analysis
   */
  private static buildEnhancedSystemPrompt(): string {
    return `You are a senior USPTO patent attorney with 20+ years of prosecution experience, specializing in comprehensive Office Action response strategy.

Your expertise includes:
- Deep understanding of 35 U.S.C. §§ 101, 102, 103, 112 law and MPEP guidance
- Advanced claim chart analysis with element-by-element prior art mapping
- Strategic prosecution planning considering file history and examiner patterns
- Specification mining for claim support and amendment options
- Cost-effective response strategies balancing argument vs. amendment approaches

ANALYSIS STANDARDS:
- Examine every claim element against cited prior art with precision
- Identify subtle examiner reasoning flaws and missing legal requirements
- Consider prosecution history to avoid estoppel issues
- Recommend strategies that maximize claim scope while ensuring allowability
- Provide actionable insights that directly support attorney decision-making

You have access to the complete OCR'd file history including:
- Full Office Action text with examiner reasoning
- Current claim language and dependencies  
- Complete specification for amendment support
- Previous response arguments and prosecution strategy
- Examiner search notes and interview summaries

Provide thorough, expert-level analysis that leverages ALL available context for optimal response strategy.`;
  }

  /**
   * Generate comprehensive strategy considering amendment context
   */
  private static generateOverallStrategyWithContext(
    analyses: RejectionAnalysisResult[],
    context: AmendmentContextBundle
  ): StrategyRecommendation {
    if (analyses.length === 0) {
      throw new ApplicationError(
        ErrorCode.INVALID_INPUT,
        'Cannot generate strategy without analyses'
      );
    }

    // Enhanced strategy calculation with context
    const strategyCounts = analyses.reduce((acc, analysis) => {
      acc[analysis.recommendedStrategy] = (acc[analysis.recommendedStrategy] || 0) + 1;
      return acc;
    }, {} as Record<RecommendedStrategy, number>);

    const primaryStrategy = Object.entries(strategyCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))[0][0] as RecommendedStrategy;

    const confidence = strategyCounts[primaryStrategy] / analyses.length;

    // Enhanced reasoning considering context
    const strongRejections = analyses.filter(a => a.strength === 'STRONG').length;
    const weakRejections = analyses.filter(a => ['WEAK', 'FLAWED'].includes(a.strength)).length;
    const hasSpecification = !!context.specification;
    const hasPreviousResponse = !!context.lastResponse;

    let reasoning: string;
    if (primaryStrategy === 'ARGUE') {
      reasoning = `Most rejections have identifiable weaknesses (${weakRejections} weak vs ${strongRejections} strong). `;
      if (hasPreviousResponse) {
        reasoning += `Previous response arguments can be strengthened with additional evidence. `;
      }
      reasoning += `Arguments should focus on examiner reasoning gaps and prior art deficiencies.`;
    } else if (primaryStrategy === 'AMEND') {
      reasoning = `Strong rejections require claim amendments (${strongRejections} strong rejections). `;
      if (hasSpecification) {
        reasoning += `Specification provides adequate support for distinctive amendments. `;
      }
      reasoning += `Focus on adding elements that clearly distinguish over cited art.`;
    } else {
      reasoning = `Mixed rejection strengths suggest hybrid approach. `;
      reasoning += `Argue weak rejections while amending for strong ones. `;
      if (context.metadata.contextComplete) {
        reasoning += `Complete context enables targeted strategy for each rejection.`;
      }
    }

    const riskLevel = strongRejections > weakRejections ? 'HIGH' : context.metadata.contextComplete ? 'LOW' : 'MEDIUM';

    return {
      primaryStrategy,
      alternativeStrategies: this.getAlternativeStrategies(primaryStrategy),
      confidence,
      reasoning,
      riskLevel,
      keyConsiderations: [
        ...this.extractKeyConsiderations(analyses),
        context.metadata.contextComplete ? 'Complete OCR context available for comprehensive analysis' : 'Limited context - some documents missing from OCR',
        hasSpecification ? 'Specification available for amendment support' : 'No specification context for amendments',
        hasPreviousResponse ? 'Previous response arguments available for reference' : 'No prosecution history available',
      ],
    };
  }

  /**
   * Build contextual insights based on OCR documents and AI analysis
   */
  private static buildContextualInsights(
    context: AmendmentContextBundle,
    existingInsights: any[]
  ): any[] {
    const insights: any[] = [];

    // OCR document utilization insights
    if (context.officeAction) {
      insights.push({
        type: 'OCR_UTILIZATION',
        description: `Analysis leveraged full Office Action text (${context.officeAction.docCode}) from OCR parsing for comprehensive understanding.`,
        confidence: 0.95,
        source: 'Office Action OCR'
      });
    }

    if (context.claims) {
      insights.push({
        type: 'SPECIFICATION_REFERENCE',
        description: `Current claims document (${context.claims.docCode}) analyzed for element-by-element mapping.`,
        confidence: 0.90,
        source: 'Claims OCR'
      });
    }

    if (context.specification) {
      insights.push({
        type: 'SPECIFICATION_REFERENCE',
        description: `Specification text analyzed to identify potential amendment support for claim limitations.`,
        confidence: 0.85,
        source: 'Specification OCR'
      });
    }

    if (context.lastResponse) {
      insights.push({
        type: 'PROSECUTION_HISTORY',
        description: `Previous response (${context.lastResponse.docCode}) reviewed to avoid inconsistent arguments and build on prior positions.`,
        confidence: 0.88,
        source: 'Previous Response OCR'
      });
    }

    if (context.extras.examinerSearch) {
      insights.push({
        type: 'OCR_UTILIZATION',
        description: `Examiner search notes analyzed to understand search strategy and art universe considered.`,
        confidence: 0.80,
        source: 'Examiner Search Notes'
      });
    }

    if (context.extras.interview) {
      insights.push({
        type: 'PROSECUTION_HISTORY',
        description: `Interview summary reviewed to understand examiner's position and any informal guidance provided.`,
        confidence: 0.75,
        source: 'Interview Summary'
      });
    }

    // Add comprehensive context indicator
    if (context.metadata.contextComplete) {
      insights.push({
        type: 'OCR_UTILIZATION',
        description: `Complete prosecution file history available and utilized for expert-level analysis.`,
        confidence: 0.98,
        source: 'Complete File History'
      });
    }

    // Add existing insights from AI analysis
    insights.push(...existingInsights);

    // Return unique insights sorted by confidence
    return insights
      .filter((insight, index, self) => 
        index === self.findIndex(i => i.description === insight.description)
      )
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Maps a numeric strength score to a RejectionStrength enum value
   * This is the inverse of the mapStrengthToScore function
   */
  private static mapScoreToStrength(score: number): RejectionStrength {
    if (score >= 0.8) return 'STRONG';
    if (score >= 0.6) return 'MODERATE';
    if (score >= 0.3) return 'WEAK';
    return 'FLAWED';
  }
} 
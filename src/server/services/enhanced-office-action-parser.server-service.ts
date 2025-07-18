/**
 * Enhanced Office Action Parser Service
 * 
 * Comprehensive multi-pass analysis system for Office Action documents.
 * Uses up to $0.50 per document to ensure zero details are missed.
 * 
 * Analysis Pipeline:
 * 1. Document Structure & Metadata Analysis
 * 2. Deep Rejection Analysis  
 * 3. Prior Art & Citation Extraction
 * 4. Cross-Validation & Completeness Check
 */

import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { processWithOpenAI } from '@/server/ai/aiService';
import { safeJsonParse } from '@/utils/jsonUtils';
import { estimateTokens } from '@/utils/textUtils';
import { renderPromptTemplate } from '@/server/prompts/prompts/utils';
import { ParsedRejection, RejectionType, RejectionTypeValue } from '@/types/domain/amendment';
import { v4 as uuidv4 } from 'uuid';

// ============ TYPES ============

interface EnhancedOfficeActionAnalysis {
  metadata: {
    applicationNumber: string | null;
    mailingDate: string | null;
    examinerName: string | null;
    artUnit: string | null;
    confirmationNumber: string | null;
    documentType: string; // "Non-Final Rejection", "Final Rejection", "Notice", etc.
    totalPages: number;
    analysisConfidence: number;
  };
  rejections: ParsedRejection[];
  allPriorArtReferences: string[];
  summary: {
    totalRejections: number;
    rejectionTypes: string[];
    totalClaimsRejected: number;
    uniquePriorArtCount: number;
    hasObjections: boolean;
    hasRestrictions: boolean;
    hasElections: boolean;
  };
  analysisDetails: {
    totalTokensUsed: number;
    totalCost: number;
    passesCompleted: string[];
    confidenceScores: Record<string, number>;
    warnings: string[];
  };
}

interface AnalysisPass {
  name: string;
  prompt: any;
  maxTokens: number;
  temperature: number;
}

// ============ CONCISE PROMPT TEMPLATES ============

const DOCUMENT_STRUCTURE_ANALYSIS_PROMPT = {
  version: '2.0.0',
  template: `You are a USPTO patent examiner analyzing an Office Action document.

Extract metadata and document structure. Return valid JSON only.

{
  "documentType": "Non-Final Office Action|Final Office Action|Notice of Allowance|Advisory Action|Other",
  "confidence": 0.95,
  "metadata": {
    "applicationNumber": "string or null",
    "mailingDate": "string or null",
    "examinerName": "string or null", 
    "artUnit": "string or null",
    "confirmationNumber": "string or null",
    "inventionTitle": "string or null"
  },
  "structure": {
    "hasRejections": boolean,
    "hasObjections": boolean,
    "hasRestrictions": boolean
  }
}

OFFICE ACTION TEXT:
{{officeActionText}}`,
};

const DEEP_REJECTION_ANALYSIS_PROMPT = {
  version: '2.0.0', 
  template: `You are a USPTO examiner extracting rejections from an Office Action.

This may be either:
1. A detailed Office Action with full rejection text, or  
2. An Office Action Summary page with checkboxes showing rejected claims

FOR DETAILED REJECTIONS: Find ALL rejections with complete examiner reasoning.
FOR SUMMARY PAGES: Extract information from checkboxes and forms.

REJECTION TYPE IDENTIFICATION:
- Look for "35 U.S.C. § 102" or "Section 102" → type: "102"
- Look for "35 U.S.C. § 103" or "Section 103" → type: "103" 
- Look for "35 U.S.C. § 101" or "Section 101" → type: "101"
- Look for "35 U.S.C. § 112" or "Section 112" → type: "112"
- Look for patterns like "Claims X-Y are rejected under 35 U.S.C. § 112"
- Check for subject matter eligibility issues → type: "101"
- Check for obviousness rejections → type: "103"
- Check for anticipation rejections → type: "102"
- Check for written description, enablement, indefiniteness → type: "112"

CLAIM PARSING:
- "1-7,9 and 13-45" → ["1","2","3","4","5","6","7","9","13","14",...,"45"]
- Parse ranges and individual claims correctly
- Handle "and" and "," separators

Return valid JSON only:

{
  "rejections": [
    {
      "id": "uuid",
      "type": "102|103|101|112|OTHER",
      "claims": ["1", "2", "3"],
      "priorArtReferences": ["US1,234,567", "US20200123456A1"],
      "examinerReasoning": "complete examiner text or summary page indication",
      "rawText": "full rejection section text or checkbox text",
      "confidence": 0.95,
      "isFromSummary": true
    }
  ],
  "objections": [
    {
      "type": "claim_objection|specification_objection|drawing_objection",
      "description": "objection text",
      "claims": ["1", "2"]
    }
  ],
  "summaryInfo": {
    "isSummaryPage": true,
    "pendingClaims": ["list of pending claims if shown"],
    "rejectedClaims": ["list of rejected claims from checkboxes"],
    "allowedClaims": ["list of allowed claims if any"]
  }
}

OFFICE ACTION TEXT:
{{officeActionText}}`,
};

const PRIOR_ART_CITATION_ANALYSIS_PROMPT = {
  version: '2.0.0',
  template: `You are a patent specialist extracting ALL prior art references from an Office Action.

Find every patent, publication, and non-patent literature reference. Handle OCR errors in patent numbers.

Return valid JSON only:

{
  "priorArtReferences": [
    {
      "id": "uuid",
      "originalCitation": "text as it appears",
      "normalizedCitation": "US1234567B2",
      "type": "us_patent|us_publication|foreign_patent|npl",
      "relevanceScore": 0.85
    }
  ],
  "citationAnalysis": {
    "totalReferences": number,
    "patentReferences": number,
    "nplReferences": number
  }
}

OFFICE ACTION TEXT:
{{officeActionText}}`,
};

const CROSS_VALIDATION_ANALYSIS_PROMPT = {
  version: '2.0.0',
  template: `You are validating Office Action analysis for completeness.

Previous analysis found:
Metadata: {{metadata}}
Rejections: {{rejections}}  
Prior Art: {{priorArt}}

Search the office action text for any missed rejections, citations, or important details.

Return valid JSON only:

{
  "validationResults": {
    "completenessScore": 0.95,
    "confidenceScore": 0.92
  },
  "missedDetails": [
    {
      "type": "rejection|citation|metadata",
      "description": "what was missed",
      "importance": "critical|important|minor"
    }
  ]
}

OFFICE ACTION TEXT:
{{officeActionText}}`,
};

// ============ ENHANCED PARSER SERVICE ============

export class EnhancedOfficeActionParserService {
  private static readonly MAX_BUDGET_DOLLARS = 0.50;
  private static readonly GPT4_COST_PER_1K_INPUT_TOKENS = 0.03;
  private static readonly GPT4_COST_PER_1K_OUTPUT_TOKENS = 0.06;

  /**
   * Comprehensive multi-pass Office Action analysis
   */
  static async parseOfficeAction(
    officeActionText: string,
    options: {
      maxBudget?: number;
      forceFullAnalysis?: boolean;
    } = {}
  ): Promise<EnhancedOfficeActionAnalysis> {
    const startTime = Date.now();
    const maxBudget = options.maxBudget || this.MAX_BUDGET_DOLLARS;
    let totalCost = 0;
    let totalTokensUsed = 0;
    const passesCompleted: string[] = [];
    const confidenceScores: Record<string, number> = {};
    const warnings: string[] = [];

    logger.info('[EnhancedOfficeActionParser] Starting comprehensive analysis', {
      textLength: officeActionText.length,
      estimatedTokens: estimateTokens(officeActionText),
      maxBudget,
    });

    // DEBUG: Log the actual OCR text being analyzed
    logger.info('[EnhancedOfficeActionParser] DEBUG: OCR Text Analysis', {
      textLength: officeActionText.length,
      textPreview: officeActionText.substring(0, 2000) + (officeActionText.length > 2000 ? '...[TRUNCATED]' : ''),
      containsRejection: officeActionText.toLowerCase().includes('rejection'),
      containsClaim: officeActionText.toLowerCase().includes('claim'),
      containsPriorArt: officeActionText.toLowerCase().includes('prior art') || officeActionText.toLowerCase().includes('reference'),
      containsSection102: officeActionText.includes('102') || officeActionText.includes('§ 102'),
      containsSection103: officeActionText.includes('103') || officeActionText.includes('§ 103'),
      containsUSPatent: officeActionText.toLowerCase().includes('us') && (officeActionText.includes('patent') || officeActionText.includes('pub')),
      fullText: officeActionText // Log the complete text for debugging
    });

    if (!officeActionText?.trim()) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Office Action text is required for parsing'
      );
    }

    try {
      // Define analysis passes
      const analysisPasses: AnalysisPass[] = [
        {
          name: 'Document Structure Analysis',
          prompt: DOCUMENT_STRUCTURE_ANALYSIS_PROMPT,
          maxTokens: 1500,
          temperature: 0.1,
        },
        {
          name: 'Deep Rejection Analysis', 
          prompt: DEEP_REJECTION_ANALYSIS_PROMPT,
          maxTokens: 3000,
          temperature: 0.05,
        },
        {
          name: 'Prior Art Citation Analysis',
          prompt: PRIOR_ART_CITATION_ANALYSIS_PROMPT,
          maxTokens: 2000,
          temperature: 0.1,
        },
      ];

      // Execute analysis passes
      let structureResults: any = null;
      let rejectionResults: any = null;
      let priorArtResults: any = null;

      for (const pass of analysisPasses) {
        // Check budget before each pass
        const estimatedCost = this.estimatePassCost(officeActionText, pass.maxTokens);
        if (totalCost + estimatedCost > maxBudget && !options.forceFullAnalysis) {
          warnings.push(`Budget limit reached, skipping ${pass.name}`);
          logger.warn('[EnhancedOfficeActionParser] Budget limit reached', {
            passName: pass.name,
            totalCost,
            estimatedCost,
            maxBudget,
          });
          break;
        }

        logger.info('[EnhancedOfficeActionParser] Executing analysis pass', {
          passName: pass.name,
          estimatedCost,
          budgetRemaining: maxBudget - totalCost,
        });

        try {
          const passResult = await this.executeAnalysisPass(
            officeActionText,
            pass,
            structureResults,
            rejectionResults,
            priorArtResults
          );

          // Track costs and tokens
          totalCost += passResult.cost;
          totalTokensUsed += passResult.tokensUsed;
          passesCompleted.push(pass.name);
          confidenceScores[pass.name] = passResult.confidence;

          // Store results for next passes
          if (pass.name === 'Document Structure Analysis') {
            structureResults = passResult.data;
          } else if (pass.name === 'Deep Rejection Analysis') {
            rejectionResults = passResult.data;
          } else if (pass.name === 'Prior Art Citation Analysis') {
            priorArtResults = passResult.data;
          }

        } catch (error) {
          logger.error('[EnhancedOfficeActionParser] Analysis pass failed', {
            passName: pass.name,
            error: error instanceof Error ? error.message : String(error),
          });
          warnings.push(`${pass.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Cross-validation pass (if budget allows)
      let validationResults: any = null;
      const validationCost = this.estimatePassCost(officeActionText, 1000);
      if (totalCost + validationCost <= maxBudget && (rejectionResults || priorArtResults)) {
        try {
          logger.info('[EnhancedOfficeActionParser] Executing cross-validation pass');
          
          const validationPass = await this.executeCrossValidation(
            officeActionText,
            structureResults,
            rejectionResults,
            priorArtResults
          );

          totalCost += validationPass.cost;
          totalTokensUsed += validationPass.tokensUsed;
          passesCompleted.push('Cross-Validation');
          confidenceScores['Cross-Validation'] = validationPass.confidence;
          validationResults = validationPass.data;

        } catch (error) {
          logger.error('[EnhancedOfficeActionParser] Cross-validation failed', {
            error: error instanceof Error ? error.message : String(error),
          });
          warnings.push(`Cross-validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Combine and structure final results
      const finalResults = this.combineAnalysisResults(
        officeActionText,
        structureResults,
        rejectionResults,
        priorArtResults,
        validationResults
      );

      const processingTime = Date.now() - startTime;

      logger.info('[EnhancedOfficeActionParser] Analysis completed', {
        totalCost,
        totalTokensUsed,
        passesCompleted,
        processingTime,
        totalRejections: finalResults.rejections.length,
        priorArtCount: finalResults.allPriorArtReferences.length,
      });

      return {
        ...finalResults,
        analysisDetails: {
          totalTokensUsed,
          totalCost,
          passesCompleted,
          confidenceScores,
          warnings,
        },
      };

    } catch (error) {
      logger.error('[EnhancedOfficeActionParser] Analysis failed', {
        error: error instanceof Error ? error.message : String(error),
        totalCost,
        passesCompleted,
      });

      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError(
        ErrorCode.AI_SERVICE_ERROR,
        `Office Action analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Execute a single analysis pass with debugging
   */
  private static async executeAnalysisPass(
    officeActionText: string,
    pass: AnalysisPass,
    structureResults?: any,
    rejectionResults?: any,
    priorArtResults?: any
  ): Promise<{
    data: any;
    cost: number;
    tokensUsed: number;
    confidence: number;
  }> {
    const userPrompt = renderPromptTemplate(pass.prompt, {
      officeActionText,
      metadata: structureResults ? JSON.stringify(structureResults.metadata, null, 2) : 'Not yet analyzed',
      rejections: rejectionResults ? JSON.stringify(rejectionResults.rejections, null, 2) : 'Not yet analyzed',
      priorArt: priorArtResults ? JSON.stringify(priorArtResults.priorArtReferences, null, 2) : 'Not yet analyzed',
    });

    const inputTokens = estimateTokens(userPrompt);
    
    // DEBUG: Log the text being analyzed for Deep Rejection Analysis
    if (pass.name === 'Deep Rejection Analysis') {
      logger.info('[EnhancedOfficeActionParser] DEBUG: Starting Deep Rejection Analysis', {
        passName: pass.name,
        textLength: officeActionText.length,
        textPreview: officeActionText.substring(0, 500) + '...',
        promptLength: userPrompt.length
      });
    }
    
    const aiResponse = await processWithOpenAI(
      'You are an expert USPTO patent examiner. Analyze the provided Office Action text carefully and return only valid JSON as requested.',
      userPrompt,
      {
        maxTokens: pass.maxTokens,
        temperature: pass.temperature,
        response_format: { type: 'json_object' },
      }
    );

    const outputTokens = estimateTokens(aiResponse.content);
    const cost = this.calculateCost(inputTokens, outputTokens);
    const tokensUsed = inputTokens + outputTokens;

    // DEBUG: Log AI response for Deep Rejection Analysis
    if (pass.name === 'Deep Rejection Analysis') {
      logger.info('[EnhancedOfficeActionParser] DEBUG: Deep Rejection Analysis AI Response', {
        passName: pass.name,
        responseLength: aiResponse.content.length,
        responsePreview: aiResponse.content.substring(0, 1000),
        fullResponse: aiResponse.content
      });
    }

    const parsedResult = safeJsonParse(aiResponse.content);
    if (!parsedResult) {
      throw new ApplicationError(
        ErrorCode.AI_INVALID_RESPONSE,
        `Failed to parse ${pass.name} response`
      );
    }

    // DEBUG: Log parsed result for Deep Rejection Analysis
    if (pass.name === 'Deep Rejection Analysis') {
      logger.info('[EnhancedOfficeActionParser] DEBUG: Deep Rejection Analysis Parsed Result', {
        passName: pass.name,
        hasRejections: !!parsedResult.rejections,
        rejectionCount: parsedResult.rejections?.length || 0,
        rejections: parsedResult.rejections || [],
        fullParsedResult: parsedResult
      });
    }

    const confidence = parsedResult.confidence || parsedResult.validationResults?.confidenceScore || 0.8;

    return {
      data: parsedResult,
      cost,
      tokensUsed,
      confidence,
    };
  }

  /**
   * Execute cross-validation analysis
   */
  private static async executeCrossValidation(
    officeActionText: string,
    structureResults: any,
    rejectionResults: any,
    priorArtResults: any
  ): Promise<{
    data: any;
    cost: number;
    tokensUsed: number;
    confidence: number;
  }> {
    return this.executeAnalysisPass(
      officeActionText,
      {
        name: 'Cross-Validation Analysis',
        prompt: CROSS_VALIDATION_ANALYSIS_PROMPT,
        maxTokens: 1000,
        temperature: 0.1,
      },
      structureResults,
      rejectionResults,
      priorArtResults
    );
  }

  /**
   * Combine results from all analysis passes
   */
  private static combineAnalysisResults(
    officeActionText: string,
    structureResults: any,
    rejectionResults: any,
    priorArtResults: any,
    validationResults: any
  ): Omit<EnhancedOfficeActionAnalysis, 'analysisDetails'> {
    // Default structure if analysis failed
    const defaultResults = {
      metadata: {
        applicationNumber: null,
        mailingDate: null,
        examinerName: null,
        artUnit: null,
        confirmationNumber: null,
        documentType: 'Unknown',
        totalPages: 1,
        analysisConfidence: 0.5,
      },
      rejections: [],
      allPriorArtReferences: [],
      summary: {
        totalRejections: 0,
        rejectionTypes: [],
        totalClaimsRejected: 0,
        uniquePriorArtCount: 0,
        hasObjections: false,
        hasRestrictions: false,
        hasElections: false,
      },
    };

    // Combine metadata
    const metadata = {
      ...defaultResults.metadata,
      ...(structureResults?.metadata || {}),
      documentType: structureResults?.documentType || defaultResults.metadata.documentType,
      analysisConfidence: structureResults?.confidence || defaultResults.metadata.analysisConfidence,
    };

    // Combine rejections
    const rejections: ParsedRejection[] = [];
    if (rejectionResults?.rejections) {
      for (const rejection of rejectionResults.rejections) {
        rejections.push({
          id: rejection.id || uuidv4(),
          type: rejection.type as RejectionTypeValue, // Type will be validated by the parsing logic
          claims: Array.isArray(rejection.claims) ? rejection.claims : [],
          priorArtReferences: Array.isArray(rejection.priorArtReferences) ? rejection.priorArtReferences : [],
          examinerReasoning: rejection.examinerReasoning || '',
          rawText: rejection.rawText || '',
          startIndex: rejection.startIndex || 0,
          endIndex: rejection.endIndex || 0,
        });
      }
    }

    // Handle summary page data if no detailed rejections were found
    if (rejections.length === 0 && rejectionResults?.summaryInfo?.rejectedClaims?.length > 0) {
      logger.info('[EnhancedOfficeActionParser] Creating rejection from summary page data', {
        rejectedClaims: rejectionResults.summaryInfo.rejectedClaims,
        isSummaryPage: rejectionResults.summaryInfo.isSummaryPage
      });

      // Intelligently detect rejection type from OCR text
      let rejectionType: RejectionTypeValue = RejectionType.OTHER; // Default fallback
      const textLower = officeActionText.toLowerCase();
      
      if (textLower.includes('§ 112') || textLower.includes('section 112') || textLower.includes('35 u.s.c. § 112')) {
        rejectionType = RejectionType.SECTION_112;
      } else if (textLower.includes('§ 103') || textLower.includes('section 103') || textLower.includes('35 u.s.c. § 103')) {
        rejectionType = RejectionType.SECTION_103;
      } else if (textLower.includes('§ 102') || textLower.includes('section 102') || textLower.includes('35 u.s.c. § 102')) {
        rejectionType = RejectionType.SECTION_102;
      } else if (textLower.includes('§ 101') || textLower.includes('section 101') || textLower.includes('35 u.s.c. § 101')) {
        rejectionType = RejectionType.SECTION_101;
      }

      logger.info('[EnhancedOfficeActionParser] Detected rejection type from text', {
        detectedType: rejectionType,
        containsSection112: textLower.includes('§ 112') || textLower.includes('section 112'),
        containsSection103: textLower.includes('§ 103') || textLower.includes('section 103'),
        containsSection102: textLower.includes('§ 102') || textLower.includes('section 102'),
        containsSection101: textLower.includes('§ 101') || textLower.includes('section 101')
      });

      // Create a rejection from summary page checkbox data
      rejections.push({
        id: uuidv4(),
        type: rejectionType,
        claims: this.parseClaimRange(rejectionResults.summaryInfo.rejectedClaims.join(', ')),
        priorArtReferences: [],
        examinerReasoning: `Claims rejected as indicated on Office Action Summary page. Detailed rejection reasoning would be found on subsequent pages of the Office Action document.`,
        rawText: `Disposition of Claims: Claim(s) ${rejectionResults.summaryInfo.rejectedClaims.join(', ')} is/are rejected.`,
        startIndex: 0,
        endIndex: 0,
      });
    }

    // Combine prior art references
    const allPriorArtReferences: string[] = [];
    
    // From rejection analysis
    if (rejectionResults?.rejections) {
      for (const rejection of rejectionResults.rejections) {
        if (rejection.priorArtReferences) {
          allPriorArtReferences.push(...rejection.priorArtReferences);
        }
      }
    }

    // From prior art analysis
    if (priorArtResults?.priorArtReferences) {
      for (const ref of priorArtResults.priorArtReferences) {
        if (ref.normalizedCitation) {
          allPriorArtReferences.push(ref.normalizedCitation);
        }
      }
    }

    // Remove duplicates
    const uniquePriorArt = [...new Set(allPriorArtReferences)].filter(Boolean);

    // Calculate summary
    const rejectionTypes = [...new Set(rejections.map(r => r.type))];
    const totalClaimsRejected = [...new Set(rejections.flatMap(r => r.claims))].length;

    const summary = {
      totalRejections: rejections.length,
      rejectionTypes,
      totalClaimsRejected,
      uniquePriorArtCount: uniquePriorArt.length,
      hasObjections: rejectionResults?.objections?.length > 0 || false,
      hasRestrictions: structureResults?.structure?.hasRestrictions || false,
      hasElections: structureResults?.structure?.hasElections || false,
    };

    return {
      metadata,
      rejections,
      allPriorArtReferences: uniquePriorArt,
      summary,
    };
  }

  /**
   * Estimate cost for a single pass
   */
  private static estimatePassCost(text: string, maxOutputTokens: number): number {
    const inputTokens = estimateTokens(text) + 500; // Add prompt overhead
    const outputTokens = maxOutputTokens;
    return this.calculateCost(inputTokens, outputTokens);
  }

  /**
   * Calculate cost based on token usage
   */
  private static calculateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1000) * this.GPT4_COST_PER_1K_INPUT_TOKENS;
    const outputCost = (outputTokens / 1000) * this.GPT4_COST_PER_1K_OUTPUT_TOKENS;
    return inputCost + outputCost;
  }

  /**
   * Parse claim range strings like "1-7,9 and 13-45" into individual claim numbers
   */
  private static parseClaimRange(claimString: string): string[] {
    if (!claimString) return [];
    
    const claims: string[] = [];
    
    // Clean up the string and split by common separators
    const parts = claimString
      .replace(/\band\b/g, ',') // Replace "and" with comma
      .split(/[,\s]+/) // Split by comma or whitespace
      .filter(part => part.trim()); // Remove empty parts
    
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      
      // Check if it's a range (e.g., "1-7" or "13-45")
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(n => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            claims.push(i.toString());
          }
        }
      } else {
        // Single claim number
        const num = parseInt(trimmed, 10);
        if (!isNaN(num)) {
          claims.push(num.toString());
        }
      }
    }
    
    // Remove duplicates and sort numerically
    return [...new Set(claims)].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  }
} 
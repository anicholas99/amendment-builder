/**
 * Simple Office Action Parser Service
 * 
 * ENHANCED VERSION: Now preserves GPT's nuanced legal analysis while maintaining structure
 * 
 * Key Improvements:
 * - Preserves raw GPT classifications alongside standardized types for UI filtering
 * - Captures specific legal subcategories (e.g., "indefiniteness" vs generic "§112")
 * - Stores GPT's legal reasoning insights about examiner errors
 * - Maintains confidence scoring and human review flags
 * - Allows nuanced document type classification
 * 
 * Example Enhanced Output:
 * {
 *   "rejections": [{
 *     "type": "§112",              // Standardized for UI filtering
 *     "rawType": "§112(b) indefiniteness",  // GPT's specific classification
 *     "rejectionCategory": "indefiniteness", // Specific subcategory
 *     "legalBasis": "35 U.S.C. § 112(b)",   // Full legal citation
 *     "reasoningInsights": [       // GPT's legal analysis
 *       "Examiner overlooked claim limitation X",
 *       "Missing antecedent basis argument is weak"
 *     ],
 *     "classificationConfidence": 0.95,
 *     "requiresHumanReview": false
 *   }],
 *   "rejectionAnalyses": [{
 *     "strength": "MODERATE",      // Standardized classification
 *     "rawStrengthAssessment": "Moderate rejection with questionable claim interpretation",
 *     "recommendedStrategy": "ARGUE", // Standardized strategy
 *     "rawRecommendedStrategy": "Focus on antecedent basis arguments while preparing fallback amendments"
 *   }]
 * }
 * 
 * This approach gives us:
 * ✅ Rich legal analysis for attorney review
 * ✅ Standardized types for UI filtering and sorting
 * ✅ Confidence metrics for quality control
 * ✅ Nuanced strategic recommendations
 * ✅ Specific legal subcategorization
 * 
 * Sends the full OCR text to GPT with one comprehensive prompt that includes:
 * - Rejection parsing and prior art extraction
 * - Rejection strength analysis and strategic recommendations
 * - Prosecution context awareness
 * - Complete summary generation
 * 
 * This eliminates 2-3 redundant AI calls by doing everything in one pass.
 */

import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { processWithOpenAI } from '@/server/ai/aiService';
import { safeJsonParse } from '@/utils/jsonUtils';
import { ParsedRejection, RejectionTypeValue } from '@/types/domain/amendment';
import { DetailedAnalysis } from '@/types/amendment';
import { 
  RejectionAnalysisResult, 
  StrategyRecommendation, 
  RejectionStrength, 
  RecommendedStrategy 
} from '@/types/domain/rejection-analysis';
import { v4 as uuidv4 } from 'uuid';

export interface ComprehensiveOfficeActionAnalysis {
  metadata: {
    applicationNumber: string | null;
    mailingDate: string | null;
    examinerName: string | null;
    artUnit: string | null;
    confirmationNumber: string | null;
    documentType: string;
    analysisConfidence: number;
  };
  rejections: ParsedRejection[];
  // NEW: Comprehensive rejection analysis included in single call
  rejectionAnalyses: RejectionAnalysisResult[];
  overallStrategy: StrategyRecommendation;
  summary: {
    totalRejections: number;
    rejectionTypes: string[];
    totalClaimsRejected: number;
    uniquePriorArtCount: number;
    userFriendlySummary: string; // Human-readable summary for UI
    detailedAnalysis?: DetailedAnalysis; // Comprehensive structured analysis
  };
}

// Legacy interface for backward compatibility
export interface SimpleOfficeActionAnalysis extends ComprehensiveOfficeActionAnalysis {}

const COMPREHENSIVE_OFFICE_ACTION_PROMPT = `You are a USPTO patent examiner and experienced patent attorney analyzing an Office Action document. Extract ALL rejection information, metadata, prior art references, AND perform comprehensive rejection analysis in a SINGLE comprehensive analysis.

**TASK**: Parse this Office Action and provide:
1. Complete rejection parsing with metadata
2. Strength analysis for each rejection  
3. Strategic recommendations
4. Overall response strategy
5. Prosecution context awareness

**REJECTION TYPE CLASSIFICATION**:
Primary categories for filtering:
- "35 U.S.C. § 102" or "Section 102" or "anticipated" → type: "§102"
- "35 U.S.C. § 103" or "Section 103" or "obvious" → type: "§103" 
- "35 U.S.C. § 101" or "Section 101" or "eligible subject matter" → type: "§101"
- "35 U.S.C. § 112" or "Section 112" or "written description" or "enablement" or "indefinite" → type: "§112"
- If unclear → type: "OTHER"

However, ALSO provide:
- **rawType**: Your exact classification (e.g., "§112(b) indefiniteness", "double patenting", "restriction requirement")
- **rejectionCategory**: Specific subcategory (e.g., "enablement", "written description", "indefiniteness", "obviousness combination")
- **legalBasis**: Full legal citation (e.g., "35 U.S.C. § 112(b)", "35 U.S.C. § 103(a)")

**DOCUMENT TYPE CLASSIFICATION**:
Be specific about document type:
- "Non-Final Office Action"
- "Final Office Action" 
- "Advisory Action"
- "Restriction Requirement"
- "Election of Species"
- "Notice of Allowance"
- "Examiner's Amendment"
- Other specific types you identify

**CLAIM PARSING**:
- "Claims 1-7, 9 and 13-45" → ["1","2","3","4","5","6","7","9","13","14",...,"45"]
- Parse ranges and individual claims correctly
- Handle "and", "," separators

**PRIOR ART EXTRACTION**:
- US Patent numbers: "US1,234,567", "US 1,234,567", "1,234,567"
- Published applications: "US20200123456A1", "US 2020/0123456 A1"
- Foreign patents: "EP1234567", "WO2020123456"
- Non-patent literature: papers, books, websites

**REJECTION STRENGTH ANALYSIS**:
For each rejection, assess and provide BOTH:
- **strength**: Standard category (STRONG/MODERATE/WEAK/FLAWED)
- **rawStrengthAssessment**: Your detailed strength description

Consider:
- **STRONG**: Clear prior art mapping, solid examiner reasoning, difficult to overcome
- **MODERATE**: Good prior art basis but some gaps in reasoning or mapping
- **WEAK**: Significant gaps in examiner reasoning or prior art mapping
- **FLAWED**: Major legal or factual errors in examiner's position

But also explain nuances like:
- "Strong combination but weak obviousness rationale"
- "Moderate rejection with questionable claim interpretation"
- "Weak enablement argument based on outdated precedent"

**STRATEGIC RECOMMENDATIONS**:
For each rejection provide BOTH:
- **recommendedStrategy**: Standard category (ARGUE/AMEND/COMBINATION)
- **rawRecommendedStrategy**: Your specific strategic description

Consider:
- **ARGUE**: When examiner has clear errors or weak reasoning
- **AMEND**: When prior art is strong but amendments can avoid it
- **COMBINATION**: When both arguments and amendments are needed

**LEGAL REASONING INSIGHTS**:
For **reasoningInsights**, identify specific issues like:
- "Examiner overlooked claim limitation X in prior art analysis"
- "Cited combination lacks proper motivation"
- "Missing disclosure of specific technical feature Y"
- "Examiner misinterpreted specification support for term Z"
- "Prior art teaches away from claimed invention"

**CONFIDENCE AND HUMAN REVIEW**:
- Set **classificationConfidence** (0.0-1.0) for each rejection
- Set **requiresHumanReview** to true if:
  - Classification is ambiguous
  - Legal basis is complex or novel
  - Multiple valid interpretations exist
  - Document quality issues affect analysis

**PROSECUTION CONTEXT AWARENESS**:
Analyze within context of:
- Document type (Non-Final vs Final vs Advisory Action)
- Examiner tone and approach
- Previously withdrawn rejections (positive sign)
- Continuation of previous rejections (concerning pattern)
- Timeline pressure (Final = more urgent)

**RETURN VALID JSON ONLY**:

{
  "metadata": {
    "applicationNumber": "extract from document or null",
    "mailingDate": "extract mailing date or null", 
    "examinerName": "extract examiner name or null",
    "artUnit": "extract art unit or null",
    "confirmationNumber": "extract confirmation number or null",
    "documentType": "your specific classification (e.g., 'Non-Final Office Action')",
    "rawDocumentType": "include if you have additional classification details",
    "analysisConfidence": 0.95
  },
  "rejections": [
    {
      "id": "generate-uuid-here",
      "type": "§102|§103|§101|§112|OTHER",
      "rawType": "your exact classification",
      "rejectionCategory": "specific subcategory",
      "legalBasis": "full legal citation",
      "claims": ["1", "2", "3"],
      "priorArtReferences": ["US1,234,567", "US20200123456A1"],
      "examinerReasoning": "Full examiner reasoning text explaining the rejection",
      "reasoningInsights": ["Specific legal insight 1", "Specific legal insight 2"],
      "rawText": "Complete raw text of the rejection section",
      "classificationConfidence": 0.95,
      "requiresHumanReview": false
    }
  ],
  "rejectionAnalyses": [
    {
      "rejectionId": "same-id-as-rejection-above",
      "strength": "STRONG|MODERATE|WEAK|FLAWED",
      "rawStrengthAssessment": "your detailed strength description",
      "confidenceScore": 0.85,
      "examinerReasoningGaps": ["Missing element X", "Unclear mapping of Y"],
      "recommendedStrategy": "ARGUE|AMEND|COMBINATION",
      "rawRecommendedStrategy": "your specific strategic recommendation",
      "strategyRationale": "Detailed explanation of why this strategy is recommended",
      "argumentPoints": ["Point 1: Prior art doesn't teach X", "Point 2: Missing disclosure of Y"],
      "amendmentSuggestions": ["Add limitation Z to claim 1", "Clarify term Y in claim 2"],
      "analyzedAt": "current-iso-date",
      "contextualInsights": [
        {
          "type": "OCR_UTILIZATION",
          "description": "Analysis performed using complete Office Action OCR text",
          "confidence": 0.95,
          "source": "Office Action OCR"
        }
      ]
    }
  ],
  "overallStrategy": {
    "primaryStrategy": "ARGUE|AMEND|COMBINATION",
    "alternativeStrategies": ["Alternative approach 1", "Alternative approach 2"],
    "confidence": 0.8,
    "reasoning": "Overall strategic reasoning considering all rejections",
    "riskLevel": "LOW|MEDIUM|HIGH",
    "keyConsiderations": ["Timeline is non-final", "Examiner seems reasonable", "Strong arguments available"]
  },
  "summary": {
    "totalRejections": 1,
    "rejectionTypes": ["§103"],
    "totalClaimsRejected": 3,
    "uniquePriorArtCount": 2,
    "userFriendlySummary": "This Office Action contains rejections under 35 U.S.C. § 112 for indefiniteness affecting multiple claims. The Examiner identified insufficient antecedent basis and ambiguous phrasing issues. Several formal objections require amendments but are not substantive rejections. Previous § 101 rejections have been withdrawn.",
    "detailedAnalysis": {
      "overview": "Non-Final Office Action with primary § 112 indefiniteness issues",
      "rejectionBreakdown": [
        {
          "type": "§112",
          "title": "Written Description / Enablement / Indefiniteness", 
          "claims": ["1", "4", "5", "17", "22"],
          "issues": [
            "Insufficient antecedent basis for 'the delivery', 'the user', 'the driver entity'",
            "Ambiguous phrasing in claim 20: 'sending a purchase notification the promotional product'",
            "Unclear distinction between 'a first business' and 'a second business'"
          ]
        }
      ],
      "objections": [
        {
          "type": "Formal/Grammatical",
          "claims": ["1", "13", "20"],
          "issues": ["Use of 'the' instead of 'a'", "Missing geographical qualifier", "Formatting corrections needed"]
        }
      ],
      "withdrawn": [
        {
          "type": "§101",
          "claims": ["1-7", "13-45"],
          "reason": "Applicant's arguments were found persuasive"
        }
      ],
      "strategicImplications": {
        "difficulty": "Medium",
        "timeToRespond": "3 months (non-final)",
        "recommendedApproach": "Focus on claim amendments to address antecedent basis issues. Formal objections are easily correctable.",
        "positives": ["§101 withdrawal shows examiner is reasonable", "No prior art rejections to overcome"],
        "concerns": ["Multiple indefiniteness issues require careful claim reconstruction"]
      }
    }
  }
}

**OFFICE ACTION TEXT**:
{{officeActionText}}`;

export class SimpleOfficeActionParserService {
  /**
   * Parse Office Action with comprehensive single GPT call
   * NEW: Includes rejection analysis and strategic recommendations
   */
  static async parseOfficeAction(
    officeActionText: string,
    prosecutionContext?: {
      projectId: string;
      applicationNumber?: string;
      prosecutionRound?: number;
      previousOfficeActions?: string[];
    }
  ): Promise<ComprehensiveOfficeActionAnalysis> {
    const startTime = Date.now();
    
    logger.info('[SimpleOfficeActionParser] Starting comprehensive analysis with prosecution context', {
      textLength: officeActionText.length,
      estimatedTokens: Math.ceil(officeActionText.length / 4),
      hasContext: !!prosecutionContext,
      prosecutionRound: prosecutionContext?.prosecutionRound,
    });

    try {
      // Build enhanced prompt with prosecution context
      let enhancedPrompt = COMPREHENSIVE_OFFICE_ACTION_PROMPT.replace('{{officeActionText}}', officeActionText);
      
      if (prosecutionContext) {
        const contextSection = `

**PROSECUTION CONTEXT**:
- Application Number: ${prosecutionContext.applicationNumber || 'Unknown'}
- Prosecution Round: ${prosecutionContext.prosecutionRound || 1}
- Previous Office Actions: ${prosecutionContext.previousOfficeActions?.length || 0}

Consider this context when analyzing rejections and formulating strategy. If this is a later round, look for patterns of examiner behavior and repeated rejections.`;

        enhancedPrompt = enhancedPrompt.replace('**OFFICE ACTION TEXT**:', contextSection + '\n\n**OFFICE ACTION TEXT**:');
      }

      const systemMessage = 'You are a USPTO patent examiner and experienced patent attorney that analyzes Office Action documents. Provide comprehensive structured JSON analysis including rejection parsing, strength assessment, and strategic recommendations in a single response.';
      
      // Token pricing constants (GPT-4.1 - April 2025)
      const TOKEN_PRICING = {
        INPUT_PER_1K: 0.002,   // $2.00 per million
        OUTPUT_PER_1K: 0.008,  // $8.00 per million
      };

      // Calculate input tokens for cost estimation
      const estimateTokens = (text: string): number => Math.ceil(text.length / 4);
      const estimatedInputTokens = estimateTokens(enhancedPrompt + systemMessage);
      const maxOutputTokens = 8000;

      // Calculate estimated cost
      const estimatedInputCost = (estimatedInputTokens / 1000) * TOKEN_PRICING.INPUT_PER_1K;
      const estimatedOutputCost = (maxOutputTokens / 1000) * TOKEN_PRICING.OUTPUT_PER_1K;
      const estimatedTotalCost = estimatedInputCost + estimatedOutputCost;

      logger.info('[SimpleOfficeActionParser] 💰 PRE-ANALYSIS COST ESTIMATE 💰', {
        model: 'gpt-4.1',
        estimatedInputTokens,
        maxOutputTokens,
        estimatedInputCost: `$${estimatedInputCost.toFixed(4)}`,
        estimatedOutputCost: `$${estimatedOutputCost.toFixed(4)}`,
        estimatedTotalCost: `$${estimatedTotalCost.toFixed(4)}`,
        officeActionTextLength: officeActionText.length,
        hasContext: !!prosecutionContext,
      });
      
      logger.debug('[SimpleOfficeActionParser] Sending enhanced request to AI', {
        textLength: officeActionText.length,
        estimatedTokens: Math.ceil(officeActionText.length / 4),
        hasContext: !!prosecutionContext,
      });
      
      const aiResponse = await processWithOpenAI(
        enhancedPrompt,
        systemMessage,
        {
          temperature: 0.1, // Low temperature for consistent analysis
          maxTokens: maxOutputTokens,
          response_format: { type: 'json_object' },
          model: 'gpt-4.1', // Ensure correct model
        }
      );

      // Calculate actual cost based on real usage
      const actualInputTokens = aiResponse.usage?.prompt_tokens || estimatedInputTokens;
      const actualOutputTokens = aiResponse.usage?.completion_tokens || maxOutputTokens;
      
      const actualInputCost = (actualInputTokens / 1000) * TOKEN_PRICING.INPUT_PER_1K;
      const actualOutputCost = (actualOutputTokens / 1000) * TOKEN_PRICING.OUTPUT_PER_1K;
      const actualTotalCost = actualInputCost + actualOutputCost;

      logger.info('[SimpleOfficeActionParser] 💰 ACTUAL "NEW RESPONSE" COST TRACKING 💰', {
        model: 'gpt-4.1',
        // === ACTUAL COST BREAKDOWN ===
        actualCost: `$${actualTotalCost.toFixed(4)}`,
        inputCost: `$${actualInputCost.toFixed(4)} (${actualInputTokens} tokens)`,
        outputCost: `$${actualOutputCost.toFixed(4)} (${actualOutputTokens} tokens)`,
        // === TOKEN USAGE ===
        totalTokens: actualInputTokens + actualOutputTokens,
        inputTokens: actualInputTokens,
        outputTokens: actualOutputTokens,
        // === ANALYSIS DETAILS ===
        officeActionTextLength: officeActionText.length,
        enhancedPromptLength: enhancedPrompt.length,
        systemMessageLength: systemMessage.length,
        hasContext: !!prosecutionContext,
        prosecutionRound: prosecutionContext?.prosecutionRound || 1,
        // === COST COMPARISON ===
        estimatedCost: `$${estimatedTotalCost.toFixed(4)}`,
        costDifference: `$${(actualTotalCost - estimatedTotalCost).toFixed(4)}`,
        estimationAccuracy: `${((1 - Math.abs(actualTotalCost - estimatedTotalCost) / estimatedTotalCost) * 100).toFixed(1)}%`,
      });

      if (!aiResponse.content) {
        throw new ApplicationError(
          ErrorCode.AI_SERVICE_ERROR,
          'No response from AI service'
        );
      }

      // Parse the JSON response
      const parsedResult = safeJsonParse(aiResponse.content);
      if (!parsedResult) {
        logger.error('[SimpleOfficeActionParser] Failed to parse AI response', {
          response: aiResponse.content.substring(0, 500),
        });
        throw new ApplicationError(
          ErrorCode.FILE_PROCESSING_ERROR,
          'Invalid JSON response from AI service'
        );
      }

      // Validate and clean up the response
      const analysis = this.validateAndCleanupComprehensiveResponse(parsedResult);
      
      const processingTime = Date.now() - startTime;
      
      logger.info('[SimpleOfficeActionParser] Comprehensive analysis completed successfully', {
        rejectionCount: analysis.rejections.length,
        analysisCount: analysis.rejectionAnalyses.length,
        claimsRejected: analysis.summary.totalClaimsRejected,
        priorArtCount: analysis.summary.uniquePriorArtCount,
        overallStrategy: analysis.overallStrategy.primaryStrategy,
        processingTime,
        documentType: analysis.metadata.documentType,
      });

      return analysis;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      logger.error('[SimpleOfficeActionParser] Comprehensive analysis failed', {
        error: error instanceof Error ? error.message : String(error),
        textLength: officeActionText.length,
        processingTime,
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
   * Validate and cleanup the AI response (legacy method)
   */
  private static validateAndCleanupResponse(rawResponse: any): SimpleOfficeActionAnalysis {
    // Use the comprehensive validation but return legacy format for backward compatibility
    return this.validateAndCleanupComprehensiveResponse(rawResponse);
  }

  /**
   * Validate and cleanup the comprehensive AI response
   */
  private static validateAndCleanupComprehensiveResponse(rawResponse: any): ComprehensiveOfficeActionAnalysis {
    // Ensure required structure exists
    const analysis: ComprehensiveOfficeActionAnalysis = {
      metadata: {
        applicationNumber: rawResponse.metadata?.applicationNumber || null,
        mailingDate: rawResponse.metadata?.mailingDate || null,
        examinerName: rawResponse.metadata?.examinerName || null,
        artUnit: rawResponse.metadata?.artUnit || null,
        confirmationNumber: rawResponse.metadata?.confirmationNumber || null,
        documentType: rawResponse.metadata?.documentType || 'Other',
        analysisConfidence: rawResponse.metadata?.analysisConfidence || 0.8,
      },
      rejections: [],
      rejectionAnalyses: [],
      overallStrategy: {
        primaryStrategy: 'ARGUE', // Default to ARGUE
        alternativeStrategies: [],
        confidence: 0.8,
        reasoning: 'Default reasoning',
        riskLevel: 'LOW',
        keyConsiderations: [],
      },
      summary: {
        totalRejections: 0,
        rejectionTypes: [],
        totalClaimsRejected: 0,
        uniquePriorArtCount: 0,
        userFriendlySummary: '', // Initialize user-friendly summary
      },
    };

    // Process rejections
    if (Array.isArray(rawResponse.rejections)) {
      const uniquePriorArt = new Set<string>();
      let totalClaimsRejected = 0;
      const rejectionTypes = new Set<string>();

      for (const rejection of rawResponse.rejections) {
        // Ensure required fields with enhanced data preservation
        const processedRejection: ParsedRejection = {
          id: rejection.id || uuidv4(),
          type: this.validateRejectionType(rejection.type),
          // NEW: Preserve GPT's raw outputs
          rawType: rejection.rawType || rejection.type, // Fallback to original type if no rawType
          rejectionCategory: rejection.rejectionCategory,
          legalBasis: rejection.legalBasis,
          claims: Array.isArray(rejection.claims) ? rejection.claims : [],
          priorArtReferences: Array.isArray(rejection.priorArtReferences) ? rejection.priorArtReferences : [],
          examinerReasoning: rejection.examinerReasoning || '',
          // NEW: Preserve GPT's legal insights
          reasoningInsights: Array.isArray(rejection.reasoningInsights) ? rejection.reasoningInsights : undefined,
          rawText: rejection.rawText || '',
          // NEW: Confidence and human review indicators
          classificationConfidence: rejection.classificationConfidence || 0.8,
          requiresHumanReview: rejection.requiresHumanReview || false,
        };

        // Count unique claims
        totalClaimsRejected += processedRejection.claims.length;
        
        // Track rejection types (use standardized type for counting)
        rejectionTypes.add(processedRejection.type);
        
        // Track unique prior art
        processedRejection.priorArtReferences.forEach(ref => uniquePriorArt.add(ref));

        analysis.rejections.push(processedRejection);
      }

      // Update summary
      analysis.summary.totalRejections = analysis.rejections.length;
      analysis.summary.rejectionTypes = Array.from(rejectionTypes);
      analysis.summary.totalClaimsRejected = totalClaimsRejected;
      analysis.summary.uniquePriorArtCount = uniquePriorArt.size;

      // Generate user-friendly summary (enhanced with raw type awareness)
      const rejectionTypeNames: { [key: string]: string } = {
        '§102': 'anticipation (§102)',
        '§103': 'obviousness (§103)',
        '§101': 'subject matter eligibility (§101)',
        '§112': 'written description/enablement (§112)',
        'OTHER': 'other rejection',
      };

      const rejectionDescriptions = analysis.summary.rejectionTypes
        .map(type => rejectionTypeNames[type] || type);
      
      let summaryText = `This ${analysis.metadata.documentType} contains `;
      
      if (analysis.summary.totalRejections === 0) {
        summaryText += 'no rejections.';
      } else if (analysis.summary.totalRejections === 1) {
        const firstRejection = analysis.rejections[0];
        // Use more specific description if available
        const specificType = firstRejection.rejectionCategory || rejectionDescriptions[0];
        summaryText += `1 rejection based on ${specificType}`;
      } else {
        summaryText += `${analysis.summary.totalRejections} rejections including ${rejectionDescriptions.join(', ')}`;
      }

      if (analysis.summary.totalClaimsRejected > 0) {
        summaryText += `, affecting ${analysis.summary.totalClaimsRejected} claim${analysis.summary.totalClaimsRejected > 1 ? 's' : ''}`;
      }

      if (analysis.summary.uniquePriorArtCount > 0) {
        summaryText += `. The examiner cited ${analysis.summary.uniquePriorArtCount} prior art reference${analysis.summary.uniquePriorArtCount > 1 ? 's' : ''}`;
      }

      summaryText += '.';

      // Add specific rejection details if available (enhanced with raw types)
      if (analysis.rejections.length > 0) {
        const mainRejection = analysis.rejections[0];
        const specificCategory = mainRejection.rejectionCategory || mainRejection.rawType;
        
        if (mainRejection.type === '§103' && mainRejection.priorArtReferences.length > 1) {
          summaryText += ` The main issue appears to be the combination of ${mainRejection.priorArtReferences.slice(0, 2).join(' and ')}.`;
        } else if (mainRejection.type === '§102' && mainRejection.priorArtReferences.length > 0) {
          summaryText += ` The examiner believes ${mainRejection.priorArtReferences[0]} anticipates the claimed invention.`;
        } else if (mainRejection.type === '§101') {
          summaryText += ' The examiner questions whether the claims are directed to patent-eligible subject matter.';
        } else if (mainRejection.type === '§112') {
          if (specificCategory) {
            summaryText += ` The examiner has concerns about ${specificCategory}.`;
          } else {
            summaryText += ' The examiner has concerns about the written description or claim clarity.';
          }
        }

        // Add insight about reasoning quality if available
        if (mainRejection.reasoningInsights && mainRejection.reasoningInsights.length > 0) {
          summaryText += ` Key issues include: ${mainRejection.reasoningInsights.slice(0, 2).join(', ')}.`;
        }
      }

      // Add metadata if available
      if (analysis.metadata.examinerName) {
        summaryText += ` Examiner: ${analysis.metadata.examinerName}.`;
      }

      if (analysis.metadata.mailingDate) {
        summaryText += ` Mailed: ${analysis.metadata.mailingDate}.`;
      }

      // Use AI-generated summary if available, otherwise use our enhanced generated summary
      analysis.summary.userFriendlySummary = rawResponse.summary?.userFriendlySummary || summaryText;
      
      // Process rejection analyses (enhanced)
      if (Array.isArray(rawResponse.rejectionAnalyses)) {
        const rejectionAnalyses: RejectionAnalysisResult[] = [];
        for (const analysisResult of rawResponse.rejectionAnalyses) {
          const rejectionAnalysis: RejectionAnalysisResult = {
            rejectionId: analysisResult.rejectionId || uuidv4(), // Ensure a unique ID
            strength: this.validateRejectionStrength(analysisResult.strength),
            confidenceScore: analysisResult.confidenceScore || 0.8,
            examinerReasoningGaps: Array.isArray(analysisResult.examinerReasoningGaps) ? analysisResult.examinerReasoningGaps : [],
            recommendedStrategy: this.validateRecommendedStrategy(analysisResult.recommendedStrategy),
            strategyRationale: analysisResult.strategyRationale || 'No specific rationale provided.',
            argumentPoints: Array.isArray(analysisResult.argumentPoints) ? analysisResult.argumentPoints : [],
            amendmentSuggestions: Array.isArray(analysisResult.amendmentSuggestions) ? analysisResult.amendmentSuggestions : [],
            analyzedAt: analysisResult.analyzedAt || new Date().toISOString(),
            contextualInsights: Array.isArray(analysisResult.contextualInsights) ? analysisResult.contextualInsights : [],
            
            // NEW: Enhanced analysis data preservation
            rawStrengthAssessment: analysisResult.rawStrengthAssessment,
            rawRecommendedStrategy: analysisResult.rawRecommendedStrategy,
          };
          rejectionAnalyses.push(rejectionAnalysis);
        }
        analysis.rejectionAnalyses = rejectionAnalyses;
      }

      // Process overall strategy (preserve raw data)
      if (rawResponse.overallStrategy) {
        analysis.overallStrategy = {
          primaryStrategy: this.validateRecommendedStrategy(rawResponse.overallStrategy.primaryStrategy),
          alternativeStrategies: Array.isArray(rawResponse.overallStrategy.alternativeStrategies) ? rawResponse.overallStrategy.alternativeStrategies : [],
          confidence: rawResponse.overallStrategy.confidence || 0.8,
          reasoning: rawResponse.overallStrategy.reasoning || 'No specific reasoning provided.',
          riskLevel: this.validateRiskLevel(rawResponse.overallStrategy.riskLevel),
          keyConsiderations: Array.isArray(rawResponse.overallStrategy.keyConsiderations) ? rawResponse.overallStrategy.keyConsiderations : [],
        };
      }

      // Preserve detailed analysis from AI response
      // Check both locations where AI might put the detailed analysis
      if (rawResponse.summary?.detailedAnalysis) {
        analysis.summary.detailedAnalysis = rawResponse.summary.detailedAnalysis;
      } else if (rawResponse.detailedAnalysis) {
        // AI might put it at the top level instead of in summary
        analysis.summary.detailedAnalysis = rawResponse.detailedAnalysis;
      }
    }

    return analysis;
  }

  /**
   * Validate rejection type
   */
  private static validateRejectionType(type: string): RejectionTypeValue {
    const validTypes: RejectionTypeValue[] = ['§101', '§102', '§103', '§112', 'OTHER'];
    return validTypes.includes(type as RejectionTypeValue) ? (type as RejectionTypeValue) : 'OTHER';
  }

  /**
   * Validate rejection strength
   */
  private static validateRejectionStrength(strength: string): RejectionStrength {
    const validStrengths: RejectionStrength[] = ['STRONG', 'MODERATE', 'WEAK', 'FLAWED'];
    return validStrengths.includes(strength as RejectionStrength) ? (strength as RejectionStrength) : 'STRONG'; // Default to STRONG
  }

  /**
   * Validate recommended strategy
   */
  private static validateRecommendedStrategy(strategy: string): RecommendedStrategy {
    const validStrategies: RecommendedStrategy[] = ['ARGUE', 'AMEND', 'COMBINATION'];
    return validStrategies.includes(strategy as RecommendedStrategy) ? (strategy as RecommendedStrategy) : 'ARGUE'; // Default to ARGUE
  }

  /**
   * Validate risk level
   */
  private static validateRiskLevel(level: string): StrategyRecommendation['riskLevel'] {
    const validLevels: StrategyRecommendation['riskLevel'][] = ['LOW', 'MEDIUM', 'HIGH'];
    return validLevels.includes(level as StrategyRecommendation['riskLevel']) ? (level as StrategyRecommendation['riskLevel']) : 'LOW'; // Default to LOW
  }
} 
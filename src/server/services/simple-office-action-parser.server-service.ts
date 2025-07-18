/**
 * Simple Office Action Parser Service
 * 
 * Sends the full OCR text to GPT with one comprehensive prompt.
 * Replaces the overly complex multi-pass system.
 */

import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { processWithOpenAI } from '@/server/ai/aiService';
import { safeJsonParse } from '@/utils/jsonUtils';
import { ParsedRejection, RejectionTypeValue } from '@/types/domain/amendment';
import { DetailedAnalysis } from '@/types/amendment';
import { v4 as uuidv4 } from 'uuid';

export interface SimpleOfficeActionAnalysis {
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
  summary: {
    totalRejections: number;
    rejectionTypes: string[];
    totalClaimsRejected: number;
    uniquePriorArtCount: number;
    userFriendlySummary: string; // Human-readable summary for UI
    detailedAnalysis?: DetailedAnalysis; // Comprehensive structured analysis
  };
}

const COMPREHENSIVE_OFFICE_ACTION_PROMPT = `You are a USPTO patent examiner analyzing an Office Action document. Extract ALL rejection information, metadata, and prior art references in a single comprehensive analysis.

**TASK**: Parse this Office Action and extract every detail about rejections, claims, prior art, and document metadata.

**REJECTION TYPE IDENTIFICATION**:
- "35 U.S.C. § 102" or "Section 102" or "anticipated" → type: "§102"
- "35 U.S.C. § 103" or "Section 103" or "obvious" → type: "§103" 
- "35 U.S.C. § 101" or "Section 101" or "eligible subject matter" → type: "§101"
- "35 U.S.C. § 112" or "Section 112" or "written description" or "enablement" or "indefinite" → type: "§112"
- If unclear → type: "OTHER"

**CLAIM PARSING**:
- "Claims 1-7, 9 and 13-45" → ["1","2","3","4","5","6","7","9","13","14",...,"45"]
- Parse ranges and individual claims correctly
- Handle "and", "," separators

**PRIOR ART EXTRACTION**:
- US Patent numbers: "US1,234,567", "US 1,234,567", "1,234,567"
- Published applications: "US20200123456A1", "US 2020/0123456 A1"
- Foreign patents: "EP1234567", "WO2020123456"
- Non-patent literature: papers, books, websites

**COMPREHENSIVE LEGAL SUMMARY**:
Generate a detailed, structured summary that attorneys can use for strategy. Include:

1. **OVERVIEW**: Document type, main rejection pattern, overall tone
2. **REJECTIONS BY TYPE**: Break down each § 102/103/101/112 with specific issues
3. **DETAILED ISSUES**: Specific problems (antecedent basis, claim clarity, etc.)
4. **OBJECTIONS**: Formal issues that require amendment but aren't rejections
5. **WITHDRAWN/ALLOWED**: What the examiner conceded or withdrew
6. **PRIOR ART ANALYSIS**: Key references and how they're being used
7. **STRATEGIC IMPLICATIONS**: Response difficulty, timeline, recommended approach
8. **SUMMARY TABLE**: Quick reference with rejection types, affected claims, issues

Format with clear section headers and structured organization:
- Rejections (substantive issues)
- Objections (formal issues)
- Withdrawn/Allowed items
- Prior art analysis
- Strategic implications

**DETAILED ANALYSIS INSTRUCTIONS**:

For § 112 rejections, identify:
- Antecedent basis issues ("the X" without prior "a X")
- Ambiguous phrasing or confusing claim language
- Written description/enablement problems
- Indefiniteness issues

For § 102/103 rejections, identify:
- Specific prior art combinations
- Key claim elements being mapped
- Examiner's obviousness rationale
- Missing elements or gaps in prior art

For objections vs rejections:
- Objections = formal issues (grammar, formatting) - easily fixed
- Rejections = substantive issues - require argument or amendment

For withdrawn items:
- What was previously rejected but now withdrawn
- Examiner's stated reason for withdrawal
- Positive implications for response strategy

For strategic implications:
- Response difficulty (Easy/Medium/Hard)
- Timeline and deadlines
- Recommended approach (Argue/Amend/Combination)
- Positive aspects to highlight
- Main concerns to address

**RETURN VALID JSON ONLY**:

{
  "metadata": {
    "applicationNumber": "extract from document or null",
    "mailingDate": "extract mailing date or null", 
    "examinerName": "extract examiner name or null",
    "artUnit": "extract art unit or null",
    "confirmationNumber": "extract confirmation number or null",
    "documentType": "Non-Final Office Action|Final Office Action|Notice of Allowance|Other",
    "analysisConfidence": 0.95
  },
  "rejections": [
    {
      "id": "generate-uuid-here",
      "type": "§102|§103|§101|§112|OTHER",
      "claims": ["1", "2", "3"],
      "priorArtReferences": ["US1,234,567", "US20200123456A1"],
      "examinerReasoning": "Full examiner reasoning text explaining the rejection",
      "rawText": "Complete raw text of the rejection section",
      "confidence": 0.95
    }
  ],
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
   * Parse Office Action with single comprehensive GPT call
   */
  static async parseOfficeAction(
    officeActionText: string
  ): Promise<SimpleOfficeActionAnalysis> {
    const startTime = Date.now();
    
    logger.info('[SimpleOfficeActionParser] Starting comprehensive analysis', {
      textLength: officeActionText.length,
      estimatedTokens: Math.ceil(officeActionText.length / 4),
    });

    try {
      // Send full text to GPT with comprehensive prompt
      const userPrompt = COMPREHENSIVE_OFFICE_ACTION_PROMPT.replace('{{officeActionText}}', officeActionText);
      const systemMessage = 'You are a USPTO patent examiner assistant that analyzes Office Action documents. Provide structured JSON analysis of rejections and prior art.';
      
      // Debug log what we're sending to GPT
      logger.info('[SimpleOfficeActionParser] Sending to GPT', {
        textLength: officeActionText.length,
        estimatedTokens: Math.ceil(officeActionText.length / 4),
      });
      
      const aiResponse = await processWithOpenAI(
        userPrompt,
        systemMessage,
        {
          temperature: 0.1, // Low temperature for consistent parsing
          maxTokens: 4000,
          response_format: { type: 'json_object' },
        }
      );

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
      const analysis = this.validateAndCleanupResponse(parsedResult);
      
      const processingTime = Date.now() - startTime;
      
      logger.info('[SimpleOfficeActionParser] Analysis completed successfully', {
        rejectionCount: analysis.rejections.length,
        claimsRejected: analysis.summary.totalClaimsRejected,
        priorArtCount: analysis.summary.uniquePriorArtCount,
        processingTime,
        documentType: analysis.metadata.documentType,
      });

      return analysis;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      logger.error('[SimpleOfficeActionParser] Analysis failed', {
        error: error instanceof Error ? error.message : String(error),
        processingTime,
        textLength: officeActionText.length,
      });

      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError(
        ErrorCode.FILE_PROCESSING_ERROR,
        `Office Action parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate and cleanup the AI response
   */
  private static validateAndCleanupResponse(rawResponse: any): SimpleOfficeActionAnalysis {
    // Ensure required structure exists
    const analysis: SimpleOfficeActionAnalysis = {
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
        // Ensure required fields
        const processedRejection: ParsedRejection = {
          id: rejection.id || uuidv4(),
          type: this.validateRejectionType(rejection.type),
          claims: Array.isArray(rejection.claims) ? rejection.claims : [],
          priorArtReferences: Array.isArray(rejection.priorArtReferences) ? rejection.priorArtReferences : [],
          examinerReasoning: rejection.examinerReasoning || '',
          rawText: rejection.rawText || '',
        };

        // Count unique claims
        totalClaimsRejected += processedRejection.claims.length;
        
        // Track rejection types
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

      // Generate user-friendly summary
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
        summaryText += `1 rejection based on ${rejectionDescriptions[0]}`;
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

      // Add specific rejection details if available
      if (analysis.rejections.length > 0) {
        const mainRejection = analysis.rejections[0];
        if (mainRejection.type === '§103' && mainRejection.priorArtReferences.length > 1) {
          summaryText += ` The main issue appears to be the combination of ${mainRejection.priorArtReferences.slice(0, 2).join(' and ')}.`;
        } else if (mainRejection.type === '§102' && mainRejection.priorArtReferences.length > 0) {
          summaryText += ` The examiner believes ${mainRejection.priorArtReferences[0]} anticipates the claimed invention.`;
        } else if (mainRejection.type === '§101') {
          summaryText += ' The examiner questions whether the claims are directed to patent-eligible subject matter.';
        } else if (mainRejection.type === '§112') {
          summaryText += ' The examiner has concerns about the written description or claim clarity.';
        }
      }

      // Add metadata if available
      if (analysis.metadata.examinerName) {
        summaryText += ` Examiner: ${analysis.metadata.examinerName}.`;
      }

      if (analysis.metadata.mailingDate) {
        summaryText += ` Mailed: ${analysis.metadata.mailingDate}.`;
      }

      // Use AI-generated summary if available, otherwise use our generated summary
      analysis.summary.userFriendlySummary = rawResponse.summary?.userFriendlySummary || summaryText;
      
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
} 
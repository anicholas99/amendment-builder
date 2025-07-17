import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { OpenaiServerService } from '@/server/services/openai.server-service';
import { findProjectByIdAndTenant } from '@/repositories/project/core.repository';
import { ClaimRepository } from '@/repositories/claimRepository';

export interface ClaimEligibility101Result {
  eligible: boolean;
  verdict: '§101 Eligible' | 'Risk of §101 Rejection' | '§101 Ineligible';
  issue?: string;
  recommendation?: string;
  confidence: number; // 0-100
  analysis: {
    isAbstractIdea: boolean;
    abstractIdeaCategory?: 'mathematical_concepts' | 'mental_processes' | 'organizing_human_activity';
    hasSignificantlyMore: boolean;
    technicalImprovement?: string;
    practicalApplication?: string;
  };
}

/**
 * Checks claim eligibility under 35 U.S.C. §101 using Alice/Mayo test
 * 
 * This tool:
 * 1. Analyzes if the claim is directed to an abstract idea
 * 2. If yes, checks for "significantly more" (technical improvement)
 * 3. Provides verdict and actionable recommendations
 * 4. Uses structured prompt for consistent results
 * 
 * SECURITY: Always validates tenant ownership before accessing data
 */
export async function checkClaimEligibility101(
  projectId: string,
  tenantId: string,
  claimText: string
): Promise<ClaimEligibility101Result> {
  logger.info('[CheckClaimEligibility101] Starting eligibility check', {
    projectId,
    tenantId,
    claimLength: claimText?.length,
  });

  try {
    // Verify tenant ownership
    const project = await findProjectByIdAndTenant(projectId, tenantId);
    
    if (!project) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Project not found or access denied'
      );
    }

    // Validate claim text
    if (!claimText || claimText.trim().length < 10) {
      throw new ApplicationError(
        ErrorCode.INVALID_INPUT,
        'Invalid claim text provided'
      );
    }

    // Create structured prompt for §101 analysis
    const systemPrompt = `You are a senior USPTO patent examiner evaluating software and method claims for eligibility under 35 U.S.C. §101. Use the Alice/Mayo two-step framework:

Step 1: Is the claim directed to an abstract idea?
- Mathematical concepts (formulas, calculations, algorithms)
- Certain methods of organizing human activity (economic practices, commercial interactions)
- Mental processes (concepts performed in the human mind)

Step 2: If yes to Step 1, does the claim include "significantly more"?
- Technical improvement to computer functionality
- Use of a particular machine integral to the claim
- Transformation of matter
- More than well-understood, routine, conventional activities

Respond ONLY with valid JSON matching this exact format:
{
  "eligible": true/false,
  "verdict": "§101 Eligible" | "Risk of §101 Rejection" | "§101 Ineligible",
  "issue": "specific issue if ineligible",
  "recommendation": "specific actionable fix",
  "confidence": 0-100,
  "analysis": {
    "isAbstractIdea": true/false,
    "abstractIdeaCategory": "mathematical_concepts" | "mental_processes" | "organizing_human_activity" | null,
    "hasSignificantlyMore": true/false,
    "technicalImprovement": "description if any" | null,
    "practicalApplication": "description if any" | null
  }
}`;

    const userPrompt = `Analyze this claim for §101 eligibility:

"${claimText}"

Provide your analysis in the specified JSON format.`;

    // Call OpenAI for analysis
    const response = await OpenaiServerService.getChatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1, // Low temperature for consistent analysis
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    // Parse and validate response
    let result: ClaimEligibility101Result;
    try {
      result = JSON.parse(response.content);
      
      // Validate required fields
      if (
        typeof result.eligible !== 'boolean' ||
        !result.verdict ||
        typeof result.confidence !== 'number' ||
        !result.analysis
      ) {
        throw new Error('Invalid response format from AI');
      }
    } catch (parseError) {
      logger.error('[CheckClaimEligibility101] Failed to parse AI response', {
        projectId,
        error: parseError,
        response: response.content,
      });
      
      // Fallback result
      result = {
        eligible: false,
        verdict: 'Risk of §101 Rejection',
        issue: 'Analysis error - claim may be too abstract',
        recommendation: 'Consider adding specific technical implementation details',
        confidence: 50,
        analysis: {
          isAbstractIdea: true,
          hasSignificantlyMore: false,
        },
      };
    }

    // Log result for analytics
    logger.info('[CheckClaimEligibility101] Analysis completed', {
      projectId,
      eligible: result.eligible,
      verdict: result.verdict,
      confidence: result.confidence,
    });

    return result;
  } catch (error) {
    logger.error('[CheckClaimEligibility101] Check failed', {
      projectId,
      error,
    });
    throw error;
  }
}

/**
 * Batch check multiple claims for §101 eligibility
 */
export async function batchCheckClaimEligibility101(
  projectId: string,
  tenantId: string,
  claimIds?: string[]
): Promise<{ claimNumber: number; text: string; result: ClaimEligibility101Result }[]> {
  logger.info('[BatchCheckClaimEligibility101] Starting batch check', {
    projectId,
    tenantId,
    claimIds,
  });

  try {
    // Verify tenant ownership
    const project = await findProjectByIdAndTenant(projectId, tenantId);
    
    if (!project) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Project not found or access denied'
      );
    }

    // Get claims
    let claims;
    if (claimIds && claimIds.length > 0) {
      claims = await ClaimRepository.findByIds(claimIds, tenantId);
    } else if (project.invention) {
      claims = await ClaimRepository.findByInventionId(project.invention.id);
    } else {
      return [];
    }

    // Check each claim
    const results = await Promise.all(
      claims.map(async claim => {
        const result = await checkClaimEligibility101(
          projectId,
          tenantId,
          claim.text
        );
        
        return {
          claimNumber: claim.number,
          text: claim.text,
          result,
        };
      })
    );

    return results;
  } catch (error) {
    logger.error('[BatchCheckClaimEligibility101] Batch check failed', {
      projectId,
      error,
    });
    throw error;
  }
} 
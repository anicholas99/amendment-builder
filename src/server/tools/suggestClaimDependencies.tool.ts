import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { ClaimRepository } from '@/repositories/claimRepository';
import { inventionRepository } from '@/repositories/inventionRepository';
import { OpenaiServerService } from '@/server/services/openai.server-service';
import { findProjectByIdAndTenant } from '@/repositories/project/core.repository';

interface ClaimDependencySuggestion {
  claimNumber: number;
  suggestedDependencies: number[];
  reasoning: string;
  isIndependent: boolean;
}

/**
 * Analyze claims and suggest proper dependency structure
 * This helps users create well-structured claim sets with proper dependencies
 *
 * SECURITY: Always validates tenant ownership before accessing data
 */
export async function suggestClaimDependencies(
  projectId: string,
  tenantId: string
): Promise<{
  success: boolean;
  suggestions: ClaimDependencySuggestion[];
  summary: string;
  message: string;
}> {
  logger.info('[SuggestClaimDependenciesTool] Analyzing claim dependencies', {
    projectId,
  });

  try {
    // Verify project and tenant ownership
    const project = await findProjectByIdAndTenant(projectId, tenantId);
    if (!project) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Project not found or access denied'
      );
    }

    // Get invention first
    const invention = await inventionRepository.findByProjectId(projectId);
    if (!invention) {
      return {
        success: true,
        suggestions: [],
        summary: 'No invention found',
        message:
          'Please create an invention before analyzing claim dependencies',
      };
    }

    // Get all claims for the invention
    const claims = await ClaimRepository.findByInventionId(invention.id);

    if (!claims || claims.length === 0) {
      return {
        success: true,
        suggestions: [],
        summary: 'No claims found to analyze',
        message: 'Please add claims before analyzing dependencies',
      };
    }

    // Prepare claims for AI analysis
    const claimsText = claims
      .sort((a: any, b: any) => a.number - b.number)
      .map((c: any) => `Claim ${c.number}:\n${c.text}`)
      .join('\n\n');

    // Use AI to analyze dependencies
    const systemPrompt = `You are an expert patent attorney analyzing claim dependencies.
Your task is to suggest proper dependency structures for patent claims.

Rules for claim dependencies:
1. Independent claims (usually 1-3 claims) should NOT depend on any other claim
2. Dependent claims must depend on a claim with a lower number
3. Group related features under the same independent claim
4. Avoid circular dependencies
5. Consider claim type consistency (method depends on method, system on system)
6. Dependent claims should add limitations or features to their parent claim

Analyze the claims and suggest an optimal dependency structure.`;

    const userPrompt = `Analyze these claims and suggest proper dependencies:

${claimsText}

For each claim, indicate:
1. Whether it should be independent or dependent
2. If dependent, which claim(s) it should depend on
3. Brief reasoning for the suggestion

Return a JSON array with this structure:
[
  {
    "claimNumber": 1,
    "suggestedDependencies": [],
    "reasoning": "Independent claim - defines the core system",
    "isIndependent": true
  },
  {
    "claimNumber": 2,
    "suggestedDependencies": [1],
    "reasoning": "Adds specific feature X to claim 1",
    "isIndependent": false
  }
]`;

    const response = await OpenaiServerService.getChatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    // Parse AI response
    let suggestions: ClaimDependencySuggestion[] = [];
    try {
      const parsed = JSON.parse(response.content);
      suggestions = Array.isArray(parsed) ? parsed : parsed.suggestions || [];
    } catch (error) {
      logger.error(
        '[SuggestClaimDependenciesTool] Failed to parse AI response',
        {
          error,
          response: response.content,
        }
      );
      throw new ApplicationError(
        ErrorCode.AI_INVALID_RESPONSE,
        'Failed to analyze claim dependencies'
      );
    }

    // Validate suggestions
    suggestions = suggestions.filter(s => {
      const claim = claims.find(c => c.number === s.claimNumber);
      if (!claim) return false;

      // Ensure no forward dependencies
      s.suggestedDependencies = s.suggestedDependencies.filter(
        dep => dep < s.claimNumber
      );

      return true;
    });

    // Generate summary
    const independentCount = suggestions.filter(s => s.isIndependent).length;
    const dependentCount = suggestions.filter(s => !s.isIndependent).length;

    const summary = `Suggested structure: ${independentCount} independent claim${independentCount !== 1 ? 's' : ''} and ${dependentCount} dependent claim${dependentCount !== 1 ? 's' : ''}`;

    return {
      success: true,
      suggestions,
      summary,
      message:
        'Dependency analysis complete. Review suggestions and apply as needed.',
    };
  } catch (error) {
    logger.error(
      '[SuggestClaimDependenciesTool] Failed to analyze dependencies',
      {
        projectId,
        error,
      }
    );

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCode.AI_SERVICE_ERROR,
      'Failed to analyze claim dependencies'
    );
  }
}

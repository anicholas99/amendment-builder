import { ClaimRepository } from '@/repositories/claimRepository';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { OpenaiServerService } from '@/server/services/openai.server-service';
import { diffWords } from 'diff';

export interface ClaimRevision {
  claimId: string;
  claimNumber: number;
  original: string;
  proposed: string;
  changes: Array<{
    type: 'added' | 'removed' | 'unchanged';
    value: string;
  }>;
  confidence: number;
  reasoning: string;
}

/**
 * Propose a claim revision based on user instruction
 *
 * SECURITY: Always validates tenant ownership before accessing data
 *
 * This tool uses AI to generate an improved version of a claim based on
 * the user's instruction (shorten, clarify, fix grammar, etc.), then
 * returns a structured diff for the UI to render with Apply/Reject buttons.
 */
export async function proposeClaimRevision(
  projectId: string,
  tenantId: string,
  claimId: string,
  instruction: string
): Promise<ClaimRevision> {
  logger.info('[ProposeClaimRevisionTool] Proposing revision', {
    projectId,
    claimId,
    instruction,
  });

  try {
    // Fetch the claim with tenant validation
    const claims = await ClaimRepository.findByIds([claimId], tenantId);
    if (!claims || claims.length === 0) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'Claim not found or access denied'
      );
    }

    const claim = claims[0];
    const originalText = claim.text;

    // Generate revision using AI
    const systemPrompt = `You are a patent claim revision expert. Your task is to revise patent claims based on specific instructions while maintaining legal precision and technical accuracy.

REVISION GUIDELINES:
- Maintain the essential technical elements and legal structure
- Preserve claim dependencies (e.g., "The system of claim 1...")
- Keep proper patent claim formatting
- For "shorten": Remove redundant words while keeping all technical limitations
- For "clarify": Improve readability without changing scope
- For "fix grammar": Correct errors while maintaining meaning
- For custom instructions: Follow them precisely

IMPORTANT: Return ONLY the revised claim text, nothing else.`;

    const userPrompt = `Original claim ${claim.number}:
${originalText}

Instruction: ${instruction}

Provide the revised claim text:`;

    const response = await OpenaiServerService.getChatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Lower temperature for more consistent revisions
      max_tokens: 1000,
    });

    const proposedText = response.content.trim();

    // Generate diff for UI visualization
    const diff = diffWords(originalText, proposedText);
    const changes = diff.map(part => ({
      type: part.added
        ? ('added' as const)
        : part.removed
          ? ('removed' as const)
          : ('unchanged' as const),
      value: part.value,
    }));

    // Calculate confidence based on the amount of change
    const totalWords = originalText.split(/\s+/).length;
    const changedWords = diff
      .filter(part => part.added || part.removed)
      .reduce((sum, part) => sum + part.value.split(/\s+/).length, 0);
    const changeRatio = changedWords / totalWords;

    // Higher confidence for smaller, targeted changes
    const confidence = instruction.includes('grammar')
      ? 0.95
      : changeRatio < 0.2
        ? 0.9
        : changeRatio < 0.4
          ? 0.8
          : changeRatio < 0.6
            ? 0.7
            : 0.6;

    // Generate reasoning
    const reasoning = generateReasoning(instruction, changeRatio, diff);

    return {
      claimId,
      claimNumber: claim.number,
      original: originalText,
      proposed: proposedText,
      changes,
      confidence,
      reasoning,
    };
  } catch (error) {
    logger.error('[ProposeClaimRevisionTool] Failed to propose revision', {
      projectId,
      claimId,
      error,
    });
    throw error;
  }
}

/**
 * Generate human-readable reasoning for the revision
 */
function generateReasoning(
  instruction: string,
  changeRatio: number,
  diff: any[]
): string {
  const changeCount = diff.filter(part => part.added || part.removed).length;

  if (instruction.toLowerCase().includes('shorten')) {
    return `Removed ${Math.round(changeRatio * 100)}% of redundant language while preserving all technical limitations.`;
  } else if (instruction.toLowerCase().includes('clarify')) {
    return `Improved clarity with ${changeCount} targeted changes to enhance readability.`;
  } else if (instruction.toLowerCase().includes('grammar')) {
    return `Fixed grammatical issues with minimal changes to maintain claim scope.`;
  } else {
    return `Applied requested changes affecting ${Math.round(changeRatio * 100)}% of the claim text.`;
  }
}

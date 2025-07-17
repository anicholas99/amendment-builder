import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { OpenaiServerService } from './openai.server-service';
import { ClaimRepository } from '@/repositories/claimRepository';
import { Claim } from '@prisma/client';
import { renderPromptTemplate } from '@/server/prompts/prompts/utils';
import {
  CLAIM_MIRROR_SYSTEM_PROMPT_V1,
  CLAIM_MIRROR_USER_PROMPT_V1,
} from '@/server/prompts/prompts/templates/claimMirroring';

export type ClaimType = 'system' | 'method' | 'apparatus' | 'process' | 'crm';

interface MirrorClaimsInput {
  projectId: string;
  claimIds: string[];
  targetType: ClaimType;
  tenantId: string;
}

interface MirroredClaim {
  originalNumber: number;
  newNumber: number;
  text: string;
  dependsOn?: number;
}

const TYPE_GUIDANCE = {
  system:
    'Start with "A system comprising..." and focus on structural components and their interconnections.',
  method:
    'Start with "A method comprising..." and focus on steps/actions performed.',
  apparatus:
    'Start with "An apparatus comprising..." and focus on physical components.',
  process:
    'Start with "A process for..." and focus on the sequence of operations.',
  crm: 'Start with "A non-transitory computer-readable medium storing instructions that when executed cause a processor to..." and focus on the stored instructions.',
};

export class ClaimMirroringService {
  /**
   * Mirror claims to a different claim type
   */
  static async mirrorClaims(input: MirrorClaimsInput): Promise<Claim[]> {
    const { projectId, claimIds, targetType, tenantId } = input;

    logger.info('[ClaimMirroringService] Starting claim mirroring', {
      projectId,
      claimCount: claimIds.length,
      targetType,
    });

    try {
      // Fetch existing claims
      const existingClaims = await ClaimRepository.findByIds(
        claimIds,
        tenantId
      );

      if (existingClaims.length === 0) {
        throw new ApplicationError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          'No claims found with the provided IDs'
        );
      }

      // Get all claims for the project to determine next claim number
      const invention = existingClaims[0].inventionId;
      const allClaims = await ClaimRepository.findByInventionId(invention);
      const maxClaimNumber = Math.max(
        ...allClaims.map((c: Claim) => c.number),
        0
      );

      // Sort claims by number for consistent processing
      const sortedClaims = existingClaims.sort(
        (a: Claim, b: Claim) => a.number - b.number
      );

      // Build claim text for prompt
      const claimsText = sortedClaims
        .map((c: Claim) => `${c.number}. ${c.text}`)
        .join('\n\n');

      // Call AI to transform claims
      const mirroredClaimsData = await this.transformClaimsWithAI(
        claimsText,
        targetType
      );

      // Create number mapping for dependencies
      const numberMapping = new Map<number, number>();
      mirroredClaimsData.forEach((mirrored, index) => {
        numberMapping.set(mirrored.originalNumber, maxClaimNumber + index + 1);
      });

      // Prepare claims for database
      const claimsToCreate = mirroredClaimsData.map((mirrored, index) => {
        const originalClaim = sortedClaims.find(
          (c: Claim) => c.number === mirrored.originalNumber
        );

        // Handle dependencies
        if (
          originalClaim &&
          originalClaim.text.toLowerCase().includes('claim')
        ) {
          // Extract dependency from original claim
          const depMatch = originalClaim.text.match(/claim\s+(\d+)/i);
          if (depMatch) {
            const originalDep = parseInt(depMatch[1]);
            const newDep = numberMapping.get(originalDep);
            if (newDep) {
              // Update dependency reference in the text
              const updatedText = mirrored.text.replace(
                /claim\s+\d+/i,
                `claim ${newDep}`
              );
              return {
                number: maxClaimNumber + index + 1,
                text: updatedText,
              };
            }
          }
        }

        return {
          number: maxClaimNumber + index + 1,
          text: mirrored.text,
        };
      });

      // Create claims in database
      const result = await ClaimRepository.createClaimsForInvention(
        invention,
        claimsToCreate
      );

      logger.info(
        '[ClaimMirroringService] Successfully created mirrored claims',
        {
          projectId,
          createdCount: result.count,
        }
      );

      return result.claims;
    } catch (error) {
      logger.error('[ClaimMirroringService] Failed to mirror claims', {
        projectId,
        error,
      });
      throw error;
    }
  }

  /**
   * Transform claims using AI
   */
  private static async transformClaimsWithAI(
    claimsText: string,
    targetType: ClaimType
  ): Promise<Array<{ originalNumber: number; text: string }>> {
    const typeGuidance = TYPE_GUIDANCE[targetType] || '';

    const userPrompt = renderPromptTemplate(CLAIM_MIRROR_USER_PROMPT_V1, {
      claims: claimsText,
      targetType,
      typeGuidance,
    });

    logger.debug('[ClaimMirroringService] Calling AI for transformation', {
      targetType,
      claimLength: claimsText.length,
    });

    const response = await OpenaiServerService.getChatCompletion({
      messages: [
        { role: 'system', content: CLAIM_MIRROR_SYSTEM_PROMPT_V1.template },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    try {
      const result = JSON.parse(response.content);

      if (!result.mirroredClaims || !Array.isArray(result.mirroredClaims)) {
        throw new ApplicationError(
          ErrorCode.AI_INVALID_RESPONSE,
          'Invalid response format from AI'
        );
      }

      return result.mirroredClaims;
    } catch (error) {
      logger.error('[ClaimMirroringService] Failed to parse AI response', {
        error,
        response: response.content,
      });
      throw new ApplicationError(
        ErrorCode.AI_INVALID_RESPONSE,
        'Failed to parse claim transformation response'
      );
    }
  }
}

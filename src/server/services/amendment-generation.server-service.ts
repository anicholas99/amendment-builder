import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { RequestContext } from '@/types/request';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/server/logger';
import { OpenaiServerService } from './openai.server-service';
import { AmendmentRepository } from '@/repositories/amendmentRepository';

// Types
export interface ClaimAmendment {
  claimNumber: number;
  originalText: string;
  amendedText: string;
  changes: Array<{
    type: 'addition' | 'deletion' | 'modification';
    text: string;
    position?: number;
  }>;
  changeReason: string;
}

export interface AmendmentGenerationResult {
  claims: ClaimAmendment[];
  summary: string;
  generatedAt: Date;
}

// Validation schema
const generateAmendmentsSchema = z.object({
  projectId: z.string().cuid(),
});

export class AmendmentGenerationService {
  /**
   * Generate amendments based on rejection analysis and previous claims
   */
  static async generateAmendments(
    projectId: string,
    context: RequestContext
  ): Promise<AmendmentGenerationResult> {
    logger.info('[AmendmentGeneration] Starting amendment generation', {
      projectId,
      userId: context.userId,
    });

    try {
      // Check database connection
      if (!prisma) {
        throw new ApplicationError(
          ErrorCode.DB_CONNECTION_ERROR,
          'Database connection not available'
        );
      }

      // 1. Get the most recent claims document (OCR'd from prosecution history)
      const recentClaimsDoc = await prisma.projectDocument.findFirst({
        where: {
          projectId,
          tenantId: context.tenantId,
          documentType: 'CLAIMS',
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!recentClaimsDoc?.ocrText) {
        throw new ApplicationError(
          ErrorCode.NOT_FOUND,
          'No claims document found. Please upload claims from prosecution history.'
        );
      }

      // 2. Get the latest Office Action analysis
      const officeAction = await prisma.officeAction.findFirst({
        where: {
          projectId,
          tenantId: context.tenantId,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          rejections: true,
        },
      });

      if (!officeAction) {
        throw new ApplicationError(
          ErrorCode.NOT_FOUND,
          'No Office Action found. Please upload and analyze an Office Action first.'
        );
      }

      // 3. Get any existing amendment recommendations
      const recommendations = await prisma.amendmentRecommendation.findMany({
        where: {
          officeActionId: officeAction.id,
          tenantId: context.tenantId,
          deletedAt: null,
        },
      });

      // 4. Prepare the prompt for GPT
      const prompt = this.buildAmendmentPrompt(
        recentClaimsDoc.ocrText,
        officeAction,
        recommendations
      );

      // 5. Generate amendments using AI
      const aiResponse = await OpenaiServerService.getChatCompletion({
        messages: [
          {
            role: 'system',
            content: 'You are a patent attorney assistant specializing in USPTO claim amendments. Provide responses in valid JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent legal drafting
        max_tokens: 16000,
        model: 'gpt-4-turbo-preview',
        response_format: { type: 'json_object' },
      });

      const result = this.parseAIResponse(aiResponse.content);

      // 6. Store the generated amendments
      await this.storeAmendments(projectId, officeAction.id, result, context);

      logger.info('[AmendmentGeneration] Amendment generation completed', {
        projectId,
        claimCount: result.claims.length,
      });

      return result;
    } catch (error) {
      logger.error('[AmendmentGeneration] Error generating amendments', {
        projectId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Build the prompt for amendment generation
   */
  private static buildAmendmentPrompt(
    claimsText: string,
    officeAction: any,
    recommendations: any[]
  ): string {
    const recommendationText = recommendations.length > 0
      ? recommendations.map(r => `- ${r.recommendation}`).join('\n')
      : 'No specific recommendations provided.';

    return `You are a patent attorney assistant specializing in responding to USPTO Office Actions.

TASK: Generate claim amendments that address the rejections while maintaining claim scope as much as possible.

PREVIOUS CLAIMS (from prosecution history):
${claimsText}

OFFICE ACTION ANALYSIS:
${officeAction.examinerRemarks || officeAction.parsedJson || 'No analysis available'}

EXAMINER'S RECOMMENDATIONS:
${recommendationText}

REJECTIONS TO ADDRESS:
${officeAction.rejections.map((r: any) => `
Claim ${r.claimNumbers}: ${r.type}
Examiner Text: ${r.examinerText}
Prior Art: ${r.citedPriorArt || 'N/A'}
`).join('\n')}

INSTRUCTIONS:
1. Parse each claim from the OCR text carefully
2. For rejected claims, draft amendments that address the specific rejections
3. Maintain claim dependencies (if claim 1 is amended, dependent claims may need updates)
4. Use proper patent claim formatting and language
5. Provide clear reasoning for each change

Return a JSON response with this EXACT structure:
{
  "claims": [
    {
      "claimNumber": 1,
      "originalText": "The exact original claim text...",
      "amendedText": "The amended claim text with changes...",
      "changes": [
        {
          "type": "addition",
          "text": "wherein the processor is configured to...",
          "position": 150
        },
        {
          "type": "deletion",
          "text": "the device",
          "position": 45
        }
      ],
      "changeReason": "Added structural limitation to distinguish over Smith reference"
    }
  ],
  "summary": "Brief summary of overall amendment strategy"
}

IMPORTANT:
- Preserve exact formatting from original claims
- Only amend claims that were rejected
- Ensure all amendments are technically and legally sound
- Maintain antecedent basis throughout`;
  }

  /**
   * Parse and validate AI response
   */
  private static parseAIResponse(aiResponse: string): AmendmentGenerationResult {
    try {
      const parsed = JSON.parse(aiResponse);
      
      // Validate structure
      if (!parsed.claims || !Array.isArray(parsed.claims)) {
        throw new Error('Invalid response structure');
      }

      // Validate each claim
      const validatedClaims = parsed.claims.map((claim: any) => ({
        claimNumber: Number(claim.claimNumber),
        originalText: String(claim.originalText).trim(),
        amendedText: String(claim.amendedText).trim(),
        changes: Array.isArray(claim.changes) ? claim.changes : [],
        changeReason: String(claim.changeReason || ''),
      }));

      return {
        claims: validatedClaims,
        summary: parsed.summary || 'Amendments generated to address Office Action rejections.',
        generatedAt: new Date(),
      };
    } catch (error) {
      logger.error('[AmendmentGeneration] Failed to parse AI response', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ApplicationError(
        ErrorCode.AI_SERVICE_ERROR,
        'Failed to generate valid amendments'
      );
    }
  }

  /**
   * Store generated amendments in database
   */
  private static async storeAmendments(
    projectId: string,
    officeActionId: string,
    result: AmendmentGenerationResult,
    context: RequestContext
  ): Promise<void> {
    const amendmentData = result.claims.map(claim => ({
      projectId,
      officeActionId,
      tenantId: context.tenantId,
      claimNumber: claim.claimNumber,
      originalText: claim.originalText,
      amendedText: claim.amendedText,
      changes: claim.changes,
      changeReason: claim.changeReason,
      aiGenerated: true,
      version: 1,
      status: 'DRAFT',
    }));

    await AmendmentRepository.createMany(amendmentData);
  }

  /**
   * Get existing amendments for a project
   */
  static async getAmendments(
    projectId: string,
    context: RequestContext
  ): Promise<AmendmentGenerationResult> {
    const amendments = await AmendmentRepository.findByProject(
      projectId,
      context.tenantId
    );

    if (amendments.length === 0) {
      throw new ApplicationError(
        ErrorCode.NOT_FOUND,
        'No amendments found. Generate amendments first.'
      );
    }

    // Group by claim number and get latest version
    const latestAmendments = amendments.reduce((acc, amendment) => {
      if (!acc[amendment.claimNumber] || acc[amendment.claimNumber].version < amendment.version) {
        acc[amendment.claimNumber] = amendment;
      }
      return acc;
    }, {} as Record<number, typeof amendments[0]>);

    const claims = Object.values(latestAmendments).map(amendment => ({
      claimNumber: amendment.claimNumber,
      originalText: amendment.originalText,
      amendedText: amendment.amendedText,
      changes: amendment.changes as ClaimAmendment['changes'],
      changeReason: amendment.changeReason,
    }));

    return {
      claims: claims.sort((a, b) => a.claimNumber - b.claimNumber),
      summary: 'Retrieved existing amendments',
      generatedAt: amendments[0].createdAt,
    };
  }

  /**
   * Update a specific claim amendment
   */
  static async updateAmendment(
    projectId: string,
    claimNumber: number,
    amendedText: string,
    context: RequestContext
  ): Promise<void> {
    const existing = await AmendmentRepository.findByClaimNumber(
      projectId,
      claimNumber,
      context.tenantId
    );

    if (!existing) {
      throw new ApplicationError(
        ErrorCode.NOT_FOUND,
        `No amendment found for claim ${claimNumber}`
      );
    }

    // Create new version with updated text
    await AmendmentRepository.createNewVersion(existing, amendedText);
  }
}
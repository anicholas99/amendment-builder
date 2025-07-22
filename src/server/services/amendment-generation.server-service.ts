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
    context: RequestContext,
    officeActionId?: string
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

      // Get the specific Office Action or the latest one for this project
      let officeAction;
      
      if (officeActionId) {
        // Use the specific office action requested
        const officeActions = await prisma.$queryRaw`
          SELECT * FROM office_actions 
          WHERE id = ${officeActionId} AND projectId = ${projectId} AND tenantId = ${context.tenantId}
        ` as any[];
        
        if (!officeActions || officeActions.length === 0) {
          throw new ApplicationError(
            ErrorCode.VALIDATION_FAILED,
            'Specified Office Action not found or access denied.'
          );
        }
        
        officeAction = officeActions[0];
      } else {
        // Fall back to the latest office action
        const officeActions = await prisma.$queryRaw`
          SELECT TOP 1 * FROM office_actions 
          WHERE projectId = ${projectId} AND tenantId = ${context.tenantId}
          ORDER BY createdAt DESC
        ` as any[];

        if (!officeActions || officeActions.length === 0) {
          throw new ApplicationError(
            ErrorCode.VALIDATION_FAILED,
            'No Office Action found. Please upload and analyze an Office Action first.'
          );
        }

        officeAction = officeActions[0];
      }

      // Get rejections for this office action
      const rejections = await prisma.$queryRaw`
        SELECT * FROM rejections 
        WHERE officeActionId = ${officeAction.id}
        ORDER BY displayOrder
      ` as any[];

      if (!rejections || rejections.length === 0) {
        throw new ApplicationError(
          ErrorCode.VALIDATION_FAILED,
          'No rejections found for this Office Action.'
        );
      }

      // Generate sample amendments for now (we can enhance this with AI later)
      const sampleAmendments = rejections.map((rejection: any, index: number) => {
        const claimNumbers = Array.isArray(rejection.claimNumbers) 
          ? rejection.claimNumbers 
          : JSON.parse(rejection.claimNumbers || '["1"]');
        
        return claimNumbers.map((claimNum: string) => ({
          claimNumber: parseInt(claimNum),
          originalText: `Original text for claim ${claimNum}`,
          amendedText: `Amended text for claim ${claimNum} to address ${rejection.type} rejection`,
          changes: [
            {
              type: 'addition',
              text: 'wherein the processor is configured to',
              position: 100
            }
          ],
          changeReason: `Added limitation to address ${rejection.type} rejection based on examiner comments`
        }));
      }).flat();

      const result: AmendmentGenerationResult = {
        claims: sampleAmendments,
        summary: `Generated ${sampleAmendments.length} claim amendments to address ${rejections.length} rejections`,
        generatedAt: new Date(),
      };

      // Store the amendments in the database
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
   * Store generated amendments in database (simplified version)
   */
  private static async storeAmendments(
    projectId: string,
    officeActionId: string,
    result: AmendmentGenerationResult,
    context: { tenantId: string; userId: string }
  ): Promise<void> {
    try {
      // Use raw SQL to avoid TypeScript issues for now
      for (const claim of result.claims) {
        await prisma.$executeRaw`
          INSERT INTO claim_amendments (
            id, projectId, officeActionId, tenantId, claimNumber, 
            originalText, amendedText, changes, changeReason, 
            aiGenerated, version, status, createdAt, updatedAt
          ) VALUES (
            NEWID(), ${projectId}, ${officeActionId}, ${context.tenantId}, ${claim.claimNumber},
            ${claim.originalText}, ${claim.amendedText}, ${JSON.stringify(claim.changes)}, ${claim.changeReason},
            1, 1, 'DRAFT', GETDATE(), GETDATE()
          )
        `;
      }
      
      logger.info('[AmendmentGeneration] Successfully stored amendments', {
        projectId,
        count: result.claims.length,
      });
    } catch (error) {
      logger.error('[AmendmentGeneration] Failed to store amendments', {
        projectId,
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't throw here - we still want to return the generated result
    }
  }

  /**
   * Get existing amendments for a project and office action
   */
  static async getAmendments(
    projectId: string,
    context: RequestContext,
    officeActionId?: string
  ): Promise<AmendmentGenerationResult> {
    let amendments;
    
    if (officeActionId) {
      // Get amendments for specific office action
      amendments = await AmendmentRepository.findByProjectAndOfficeAction(
        projectId,
        officeActionId,
        context.tenantId
      );
    } else {
      // Fall back to all project amendments
      amendments = await AmendmentRepository.findByProject(
        projectId,
        context.tenantId
      );
    }

    if (amendments.length === 0) {
      // Return empty result instead of throwing error
      return {
        claims: [],
        summary: 'No amendments found. Generate amendments first.',
        generatedAt: new Date(),
      };
    }

    // Group by claim number and get latest version
    const latestAmendments = amendments.reduce((acc, amendment) => {
      if (!acc[amendment.claimNumber] || acc[amendment.claimNumber].version < amendment.version) {
        acc[amendment.claimNumber] = amendment;
      }
      return acc;
    }, {} as Record<number, typeof amendments[0]>);

    const claims = Object.values(latestAmendments).map(amendment => {
      // Parse changes from JSON string to array
      let parsedChanges: ClaimAmendment['changes'] = [];
      try {
        parsedChanges = typeof amendment.changes === 'string' 
          ? JSON.parse(amendment.changes) 
          : amendment.changes || [];
      } catch (error) {
        logger.warn('[AmendmentGeneration] Failed to parse changes JSON', {
          claimNumber: amendment.claimNumber,
          changes: amendment.changes,
        });
        parsedChanges = [];
      }

      return {
        claimNumber: amendment.claimNumber,
        originalText: amendment.originalText,
        amendedText: amendment.amendedText,
        changes: parsedChanges,
        changeReason: amendment.changeReason,
      };
    });

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
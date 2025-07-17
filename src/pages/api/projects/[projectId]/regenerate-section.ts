import { NextApiResponse } from 'next';
import { CustomApiRequest } from '@/types/api';
import { z } from 'zod';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { AuthenticatedRequest, RequestWithServices } from '@/types/middleware';
import { InventionDataService } from '@/server/services/invention-data.server-service';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { ClaimRepository } from '@/repositories/claimRepository';
import { flexibleJsonParse } from '@/utils/jsonUtils';
import { figureRepository } from '@/repositories/figure';
import { processWithOpenAI, TokenUsage } from '@/server/ai/aiService';
import {
  SYSTEM_MESSAGE_V1,
  FIELD_SECTION_PROMPT_V1,
  BACKGROUND_SECTION_PROMPT_V1,
  SUMMARY_SECTION_PROMPT_V1,
  DRAWINGS_SECTION_PROMPT_V1,
  DETAILED_DESCRIPTION_PROMPT_V1,
  ABSTRACT_SECTION_PROMPT_V1,
} from '@/server/prompts/prompts/templates/applicationSections';
import { renderPromptTemplate } from '@/server/prompts/prompts/utils';
import { findDraftDocumentByType } from '@/repositories/project/draft.repository';
import { PatentServerService } from '@/server/services/patent.server-service';
import {
  getAffectedSections,
  DataChangeType,
} from '@/features/patent-application/utils/patent-sections/sectionDependencies';

const bodySchema = z.object({
  section: z.string().optional(),
  changeTypes: z
    .array(
      z.enum(['invention_details', 'figures', 'claims', 'prior_art', 'title'])
    )
    .optional(),
  selectedRefs: z.array(z.string()).optional(),
  preview: z.boolean().default(true), // If true, returns diff without saving
});

type RegenerateSectionBody = z.infer<typeof bodySchema>;

// Section prompt mapping
// Note: There is no CLAIMS section here because claims are managed separately
// through the claims editor. When claims change, other sections that reference
// claims (like SUMMARY and DETAILED_DESCRIPTION) will be regenerated instead.
const SECTION_PROMPTS: Record<string, any> = {
  FIELD: FIELD_SECTION_PROMPT_V1,
  BACKGROUND: BACKGROUND_SECTION_PROMPT_V1,
  SUMMARY: SUMMARY_SECTION_PROMPT_V1,
  BRIEF_DESCRIPTION_OF_THE_DRAWINGS: DRAWINGS_SECTION_PROMPT_V1,
  DETAILED_DESCRIPTION: DETAILED_DESCRIPTION_PROMPT_V1,
  ABSTRACT: ABSTRACT_SECTION_PROMPT_V1,
};

async function getFiguresText(projectId: string): Promise<string> {
  try {
    const figuresWithElements =
      await figureRepository.getFiguresWithElements(projectId);

    if (!figuresWithElements || figuresWithElements.length === 0) {
      return '';
    }

    return figuresWithElements
      .filter(fig => fig.figureKey)
      .map(fig => {
        const elements = fig.elements
          .map(el => `  - ${el.elementKey}: ${el.elementName}`)
          .join('\n');

        return `${fig.figureKey}: ${fig.title || fig.description || 'No description'}\n${elements}`;
      })
      .join('\n\n');
  } catch (error) {
    logger.error('Failed to fetch figures for regeneration', {
      error,
      projectId,
    });
    return '';
  }
}

async function generateSection(
  sectionKey: string,
  invention: any,
  projectId: string,
  inventionService: InventionDataService,
  priorArtContext?: string
): Promise<{ content: string; usage?: TokenUsage }> {
  // Special handling for CLAIMS section - sync from database
  if (sectionKey === 'CLAIMS') {
    try {
      const claims = await ClaimRepository.findByInventionId(invention.id);
      if (!claims || claims.length === 0) {
        return {
          content: 'What is claimed is:\n\n[No claims have been defined yet]',
          usage: undefined,
        };
      }

      // Format claims in standard patent format
      const formattedClaims = claims
        .sort((a, b) => a.number - b.number)
        .map(claim => `${claim.number}. ${claim.text}`)
        .join('\n\n');

      return {
        content: `What is claimed is:\n\n${formattedClaims}`,
        usage: undefined, // No AI tokens used for direct sync
      };
    } catch (error) {
      logger.error('Failed to sync claims from database', { error, projectId });
      throw new ApplicationError(
        ErrorCode.DB_QUERY_ERROR,
        'Failed to retrieve claims from database'
      );
    }
  }

  const promptTemplate = SECTION_PROMPTS[sectionKey];
  if (!promptTemplate) {
    throw new ApplicationError(
      ErrorCode.VALIDATION_REQUIRED_FIELD,
      `Unknown section: ${sectionKey}`
    );
  }

  let prompt = '';

  if (sectionKey === 'BRIEF_DESCRIPTION_OF_THE_DRAWINGS') {
    // Special handling for drawings section
    let hasFigures = false;
    let figuresList = '';

    try {
      const figuresWithElements =
        await figureRepository.getFiguresWithElements(projectId);
      hasFigures = figuresWithElements && figuresWithElements.length > 0;

      if (hasFigures) {
        figuresList = figuresWithElements
          .filter(fig => fig.figureKey)
          .map(
            fig =>
              `${fig.figureKey}: ${fig.title || fig.description || 'Description not provided'}`
          )
          .join('\n');
      }
    } catch (error) {
      logger.error('Failed to fetch figures for drawings prompt', {
        error,
        projectId,
      });
    }

    prompt = renderPromptTemplate(promptTemplate, { hasFigures, figuresList });
  } else {
    // All other sections use invention data
    const figuresText = await getFiguresText(projectId);
    prompt = renderPromptTemplate(promptTemplate, {
      fullInventionData: inventionService.getFullInventionDataString(
        invention,
        figuresText
      ),
    });
  }

  // Add prior art context if provided (except for drawings)
  if (priorArtContext && sectionKey !== 'BRIEF_DESCRIPTION_OF_THE_DRAWINGS') {
    prompt += `\n\n--- PRIOR ART CONTEXT (USER SELECTED) ---\n${priorArtContext}\n`;
  }

  const response = await processWithOpenAI(SYSTEM_MESSAGE_V1.template, prompt, {
    temperature: 0.7,
    maxTokens: 2000,
  });

  return {
    content: response.content.trim(),
    usage: response.usage,
  };
}

async function handler(
  req: CustomApiRequest<RegenerateSectionBody>,
  res: NextApiResponse
) {
  const { inventionService } = (req as RequestWithServices).services;
  const { projectId } = req.query as { projectId: string };
  const { id: userId, tenantId } = (req as AuthenticatedRequest).user!;
  const { section, changeTypes, selectedRefs, preview = true } = req.body;

  // Get invention data
  const invention = await inventionService.getInventionData(String(projectId));
  if (!invention) {
    throw new ApplicationError(
      ErrorCode.DB_RECORD_NOT_FOUND,
      'Invention data not found. Please analyze your invention first.'
    );
  }

  // Attach claims to invention
  try {
    const claimRecords = await ClaimRepository.findByInventionId(invention.id);
    if (claimRecords && claimRecords.length > 0) {
      invention.claims = claimRecords.reduce<Record<number, string>>(
        (acc, c) => {
          acc[c.number] = c.text;
          return acc;
        },
        {}
      );
    }
  } catch (error) {
    logger.error('Failed to fetch claims from repository', { error });
  }

  // Determine which sections to regenerate
  let sectionsToRegenerate: string[] = [];

  if (section) {
    // Regenerate specific section
    sectionsToRegenerate = [section];
  } else if (changeTypes && changeTypes.length > 0) {
    // Regenerate all affected sections based on change types
    sectionsToRegenerate = getAffectedSections(changeTypes as DataChangeType[]);
  } else {
    throw new ApplicationError(
      ErrorCode.VALIDATION_REQUIRED_FIELD,
      'Must specify either section or changeTypes'
    );
  }

  // Build prior art context if needed
  const priorArtContext = '';
  if (selectedRefs && selectedRefs.length > 0) {
    // Similar logic to generate-application-sections for prior art
    // ... (implement prior art fetching logic)
  }

  const results: Array<{
    section: string;
    oldContent: string | null;
    newContent: string;
    hasChanged: boolean;
    usage?: TokenUsage;
  }> = [];

  // Generate new content for each section
  for (const sectionKey of sectionsToRegenerate) {
    logger.info(`Regenerating section: ${sectionKey}`);

    // Get current content
    const currentDraft = await findDraftDocumentByType(
      String(projectId),
      sectionKey
    );
    const oldContent = currentDraft?.content || null;

    // Generate new content
    const { content: newContent, usage } = await generateSection(
      sectionKey,
      invention,
      String(projectId),
      inventionService,
      priorArtContext
    );

    // Check if content has changed
    const hasChanged = oldContent !== newContent;

    results.push({
      section: sectionKey,
      oldContent,
      newContent,
      hasChanged,
      usage,
    });

    // Save if not preview mode
    if (!preview && hasChanged) {
      const { upsertDraftDocument } = await import(
        '@/repositories/project/draft.repository'
      );
      await upsertDraftDocument(String(projectId), sectionKey, newContent);

      logger.info(`Updated draft document for section: ${sectionKey}`);
    }
  }

  res.status(200).json({
    success: true,
    preview,
    sections: results,
    summary: {
      total: results.length,
      changed: results.filter(r => r.hasChanged).length,
      unchanged: results.filter(r => !r.hasChanged).length,
    },
  });
}

// Security setup
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler
);

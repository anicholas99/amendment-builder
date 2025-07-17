import { NextApiResponse } from 'next';
import { z } from 'zod';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { findProjectById } from '@/repositories/project/core.repository';
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
import { AuthenticatedRequest, RequestWithServices } from '@/types/middleware';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { ClaimRepository } from '@/repositories/claimRepository';
import { flexibleJsonParse } from '@/utils/jsonUtils';
import { PatentServerService } from '@/server/services/patent.server-service';
import { addProjectPriorArt } from '@/repositories/project/priorArt.repository';
import { figureRepository } from '@/repositories/figure';
import { secureUpdateProject } from '@/repositories/project/security.repository';
import { InventionData } from '@/types/invention';
import { SavedPriorArt } from '@/types/domain/priorArt';
import type { SavedPriorArt as PrismaSavedPriorArt } from '@prisma/client';

const bodySchema = z.object({
  versionName: z.string().optional().nullable(),
  selectedRefs: z.array(z.string()).optional(),
});

function cleanText(text: string): string {
  return text.replace(/^#+ |^#+ /gm, '').replace(/["']/g, '');
}

async function getFiguresText(projectId: string): Promise<string> {
  let figuresText = 'No figures provided';
  try {
    const figuresWithElements =
      await figureRepository.getFiguresWithElements(projectId);
    if (figuresWithElements && figuresWithElements.length > 0) {
      figuresText = figuresWithElements
        .map(figure => {
          if (!figure.figureKey) return '';
          const elementLines = figure.elements
            .map(
              elem =>
                `  (${elem.elementKey}) ${elem.elementName || elem.calloutDescription || ''}`
            )
            .join('\n');
          return `FIG. ${figure.figureKey} - ${figure.title || figure.description || 'No description'}\n${elementLines}`;
        })
        .filter(Boolean)
        .join('\n\n');
    }
  } catch (error) {
    logger.error('Failed to fetch figures text', { error, projectId });
  }
  return figuresText;
}

// NOTE: This function was moved to inventionService and is no longer used here
// Keeping for reference only
/*
async function getFullInventionDataString(
  invention: InventionData,
  projectId: string
): Promise<string> {
  const features = parseJson<string[]>(invention.featuresJson, []);
  const advantages = parseJson<string[]>(invention.advantagesJson, []);
  const useCases = parseJson<string[]>(invention.useCasesJson, []);
  const processSteps = parseJson<string[]>(invention.processStepsJson, []);
  const claims = invention.claims ?? {};
  const technicalImpl = parseJson<Record<string, unknown>>(invention.technicalImplementationJson, {});

  // Fetch figures from normalized tables
  let figuresText = 'No figures provided';
  try {
    const figuresWithElements =
      await figureRepository.getFiguresWithElements(projectId);
    if (figuresWithElements && figuresWithElements.length > 0) {
      figuresText = figuresWithElements
        .map(figure => {
          if (!figure.figureKey) return '';
          const elementLines = figure.elements
            .map(
              elem =>
                `  (${elem.elementKey}) ${elem.elementName || elem.calloutDescription || ''}`
            )
            .join('\n');
          return `FIG. ${figure.figureKey} - ${figure.title || figure.description || 'No description'}\n${elementLines}`;
        })
        .filter(Boolean)
        .join('\n\n');
    }
  } catch (error) {
    logger.error('Failed to fetch figures for invention data string', {
      error,
      projectId,
    });
  }

  return `
    Full Invention Data:
    Title: ${invention.title || 'Untitled Invention'}
    Summary: ${invention.summary || 'No summary provided'}
    Technical Field: ${invention.technicalField || 'No technical field provided'}
    Problem Statement: ${invention.problemStatement || 'No problem statement provided'}
    Solution Summary: ${invention.solutionSummary || 'No solution summary provided'}
    Background: ${invention.background || 'No background provided'}
    Features: ${features.join(', ') || 'No features provided'}
    Advantages: ${advantages.join(', ') || 'No advantages provided'}
    Use Cases: ${useCases.join(', ') || 'No use cases provided'}
    Novelty: ${invention.noveltyStatement || 'No novelty provided'}
    System Architecture: ${invention.systemArchitecture || 'No system architecture provided'}
    Implementation Notes: ${invention.implementationNotes || 'No implementation notes provided'}
    Claims: ${
      typeof claims === 'object' && !Array.isArray(claims)
        ? Object.entries(claims)
            .map(([num, text]) => `Claim ${num}: ${text}`)
            .join('\n')
        : Array.isArray(claims)
          ? claims.map((text, i) => `Claim ${i + 1}: ${text}`).join('\n')
          : 'No claims provided'
    }
    Figures: ${figuresText}
    Technical Implementation - Preferred Embodiment: ${technicalImpl.preferred_embodiment || invention.systemArchitecture || 'No preferred embodiment provided'}
    Technical Implementation - Alternative Embodiments: ${Array.isArray(technicalImpl.alternative_embodiments) ? technicalImpl.alternative_embodiments.join('; ') : 'No alternative embodiments provided'}
    Process Steps: ${processSteps.join(' → ') || invention.dataFlow || 'No process steps provided'}
  `;
}
*/

const prompts = {
  field: async (
    invention: InventionData,
    projectId: string,
    inventionService: {
      getFullInventionDataString: (
        invention: InventionData,
        figures: string
      ) => string;
    }
  ) => {
    const figuresText = await getFiguresText(projectId);
    return renderPromptTemplate(FIELD_SECTION_PROMPT_V1, {
      fullInventionData: inventionService.getFullInventionDataString(
        invention,
        figuresText
      ),
    });
  },
  background: async (
    invention: InventionData,
    projectId: string,
    inventionService: {
      getFullInventionDataString: (
        invention: InventionData,
        figures: string
      ) => string;
    }
  ) => {
    const figuresText = await getFiguresText(projectId);
    return renderPromptTemplate(BACKGROUND_SECTION_PROMPT_V1, {
      fullInventionData: inventionService.getFullInventionDataString(
        invention,
        figuresText
      ),
    });
  },
  summary: async (
    invention: InventionData,
    projectId: string,
    inventionService: {
      getFullInventionDataString: (
        invention: InventionData,
        figures: string
      ) => string;
    }
  ) => {
    const figuresText = await getFiguresText(projectId);
    return renderPromptTemplate(SUMMARY_SECTION_PROMPT_V1, {
      fullInventionData: inventionService.getFullInventionDataString(
        invention,
        figuresText
      ),
    });
  },
  drawings: async (
    invention: InventionData,
    projectId: string,
    _inventionService: {
      getFullInventionDataString: (
        invention: InventionData,
        figures: string
      ) => string;
    }
  ) => {
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

    return renderPromptTemplate(DRAWINGS_SECTION_PROMPT_V1, {
      hasFigures,
      figuresList,
    });
  },
  detailed_description: async (
    invention: InventionData,
    projectId: string,
    inventionService: {
      getFullInventionDataString: (
        invention: InventionData,
        figures: string
      ) => string;
    }
  ) => {
    let hasFigures = false;

    try {
      const figuresWithElements =
        await figureRepository.getFiguresWithElements(projectId);
      hasFigures = figuresWithElements && figuresWithElements.length > 0;
    } catch (error) {
      logger.error('Failed to fetch figures for detailed description', {
        error,
        projectId,
      });
    }

    const figuresText = await getFiguresText(projectId);

    return renderPromptTemplate(DETAILED_DESCRIPTION_PROMPT_V1, {
      hasFigures,
      fullInventionData: inventionService.getFullInventionDataString(
        invention,
        figuresText
      ),
    });
  },
  abstract: async (
    invention: InventionData,
    projectId: string,
    inventionService: {
      getFullInventionDataString: (
        invention: InventionData,
        figures: string
      ) => string;
    }
  ) => {
    const figuresText = await getFiguresText(projectId);
    return renderPromptTemplate(ABSTRACT_SECTION_PROMPT_V1, {
      fullInventionData: inventionService.getFullInventionDataString(
        invention,
        figuresText
      ),
    });
  },
};

async function generateTextWithService(
  prompt: string,
  section: string
): Promise<{ text: string; usage: TokenUsage | null }> {
  try {
    logger.info(`Calling AI service for section: ${section}`);
    const { content, usage } = await processWithOpenAI(
      prompt,
      SYSTEM_MESSAGE_V1.template,
      {
        model: 'gpt-4.1',
        temperature: 0.3,
        maxTokens: 2000,
        response_format: { type: 'text' },
      }
    );
    logger.info(`Token usage for ${section}:`, { usage });
    return { text: content || '', usage };
  } catch (error) {
    logger.error(
      `Error generating text for section ${section} using AI service:`,
      error
    );
    return { text: '', usage: null };
  }
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { inventionService } = (req as RequestWithServices).services;
  const { projectId } = req.query;
  // User is guaranteed by SecurePresets middleware
  const { id: userId, tenantId } = req.user!;
  const { versionName, selectedRefs } = req.body;
  const finalVersionName = versionName === undefined ? null : versionName;

  // Get invention data with figures and elements
  const invention = await inventionService.getInventionData(String(projectId));
  if (!invention) {
    throw new ApplicationError(
      ErrorCode.DB_RECORD_NOT_FOUND,
      'Invention data not found. Please analyze your invention first.'
    );
  }

  // Fetch claims and attach to the invention object for the prompts
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

  logger.info(
    `Starting patent generation for project: ${projectId} by user: ${userId}`
  );

  let priorArtContext = '';
  if (Array.isArray(selectedRefs) && selectedRefs.length > 0) {
    if (!tenantId) {
      throw new ApplicationError(
        ErrorCode.AUTH_UNAUTHORIZED,
        'Tenant ID not found'
      );
    }
    const project = await findProjectById(String(projectId), tenantId);

    // Type guard for savedPriorArtItems
    if (!project || !Array.isArray(project.savedPriorArtItems)) {
      priorArtContext = '';
    } else {
      const savedPriorArtItems =
        project.savedPriorArtItems as PrismaSavedPriorArt[];
      const matchingRefs = savedPriorArtItems.filter(r =>
        selectedRefs.includes(r.id)
      );

      // Enrich references that are missing claim1 or summary
      if (matchingRefs.length > 0) {
        logger.info(
          `Enriching ${matchingRefs.length} selected prior art references`
        );

        // Process references in parallel for efficiency
        const enrichmentPromises = matchingRefs.map(async ref => {
          const patentNumber = ref.patentNumber;

          // Check if we need to fetch claim1 or summary
          if (patentNumber && (!ref.claim1 || !ref.summary)) {
            logger.info(`Fetching missing data for ${patentNumber}`, {
              hasClaim1: !!ref.claim1,
              hasSummary: !!ref.summary,
            });

            try {
              const { claim1, summary } =
                await PatentServerService.fetchClaim1AndSummary(patentNumber);

              // Update the reference object with fetched data
              if (claim1 && !ref.claim1) {
                ref.claim1 = claim1;
              }
              if (summary && !ref.summary) {
                ref.summary = summary;
              }

              // Update the database to cache this data for future use
              if (claim1 || summary) {
                await addProjectPriorArt(String(projectId), {
                  patentNumber,
                  title: ref.title || undefined,
                  abstract: ref.abstract || undefined,
                  url: undefined,
                  notes: ref.notes || undefined,
                  authors: ref.authors || undefined,
                  publicationDate: ref.publicationDate || undefined,
                  claim1: ref.claim1 || undefined,
                  summary: ref.summary || undefined,
                });

                logger.info(
                  `Updated database with enriched data for ${patentNumber}`
                );
              }
            } catch (error) {
              logger.error(`Failed to enrich prior art ${patentNumber}:`, {
                error:
                  error instanceof Error ? error : new Error(String(error)),
              });
              // Continue with original data if enrichment fails
            }
          }

          return ref;
        });

        // Wait for all enrichments to complete
        await Promise.all(enrichmentPromises);

        // Build the prior art context with enriched data
        priorArtContext = matchingRefs
          .map(ref => {
            const lines: string[] = [];
            lines.push(
              `Ref ${ref.patentNumber || ref.id} – ${ref.title || 'Untitled'}`
            );
            if (ref.abstract) lines.push(`Abstract: ${ref.abstract}`);
            if (ref.summary) lines.push(`Summary: ${ref.summary}`);
            if (ref.claim1) lines.push(`Main Claim: ${ref.claim1}`);
            if (ref.authors) lines.push(`Authors: ${ref.authors}`);
            if (ref.publicationDate) lines.push(`Year: ${ref.publicationDate}`);
            if (ref.notes) lines.push(`Notes: ${ref.notes}`);
            return lines.join('\n');
          })
          .join('\n\n');
      }
    }
  }

  // Define sections to generate in order
  const sectionsToGenerate = [
    { key: 'FIELD', promptFn: prompts.field },
    { key: 'BACKGROUND', promptFn: prompts.background },
    { key: 'SUMMARY', promptFn: prompts.summary },
    { key: 'BRIEF_DESCRIPTION_OF_THE_DRAWINGS', promptFn: prompts.drawings },
    { key: 'DETAILED_DESCRIPTION', promptFn: prompts.detailed_description },
    { key: 'ABSTRACT', promptFn: prompts.abstract },
  ];

  const generatedSections: { [key: string]: string } = {};
  const allUsageData: TokenUsage[] = [];

  // Add title first - this ensures it's at the beginning
  if (invention.title) {
    generatedSections['TITLE'] = invention.title;
  }

  // Generate sections sequentially to maintain order
  for (const sectionInfo of sectionsToGenerate) {
    logger.info(`Starting generation for section: ${sectionInfo.key}`);
    let prompt = await sectionInfo.promptFn(
      invention,
      String(projectId),
      inventionService
    );

    // Only add prior art context if it's not the drawings section
    // This prevents the drawings section from being contaminated with extra info
    if (
      priorArtContext &&
      sectionInfo.key !== 'BRIEF_DESCRIPTION_OF_THE_DRAWINGS'
    ) {
      prompt += `\n\n--- PRIOR ART CONTEXT (USER SELECTED) ---\n${priorArtContext}\n`;
    }

    const { text, usage } = await generateTextWithService(
      prompt,
      sectionInfo.key
    );
    generatedSections[sectionInfo.key] = cleanText(text);

    if (usage) {
      allUsageData.push(usage);
    }
  }

  // Add claims
  const claims = flexibleJsonParse(invention.claims, {});
  generatedSections['CLAIMS'] =
    typeof claims === 'object' && !Array.isArray(claims)
      ? Object.entries(claims)
          .sort(([numA], [numB]) => parseInt(numA, 10) - parseInt(numB, 10))
          .map(([num, text]) => `${num}. ${text}`)
          .join('\n\n')
      : Array.isArray(claims)
        ? claims.map((text, i) => `${i + 1}. ${text}`).join('\n\n')
        : '';

  // Log generated sections for debugging
  logger.info(`Patent generation sections complete for project: ${projectId}`, {
    projectId,
    sectionsGenerated: Object.keys(generatedSections),
    sectionCount: Object.keys(generatedSections).length,
    sectionsPreview: Object.entries(generatedSections)
      .slice(0, 3)
      .map(([type, content]) => ({
        type,
        contentLength: content?.length || 0,
        hasContent: !!(content && content.trim().length > 0),
        contentPreview: content?.substring(0, 100) + '...',
      })),
    allSectionsHaveContent: Object.values(generatedSections).every(
      content => content && content.trim().length > 0
    ),
  });

  // Initialize draft documents with generated sections
  const { initializeDraftDocumentsWithSections } = await import(
    '@/repositories/project'
  );

  logger.info(`About to initialize draft documents for project: ${projectId}`, {
    projectId,
    sectionKeys: Object.keys(generatedSections),
    sectionsToSave: Object.entries(generatedSections).map(
      ([type, content]) => ({
        type,
        contentLength: content?.length || 0,
        hasContent: !!(content && content.trim().length > 0),
      })
    ),
  });

  const draftCount = await initializeDraftDocumentsWithSections(
    String(projectId),
    generatedSections
  );

  logger.info(
    `Draft document initialization complete for project: ${projectId}`,
    {
      projectId,
      draftCount,
      expectedCount: Object.keys(generatedSections).length,
      success: draftCount > 0,
    }
  );

  // Update the project to indicate it has patent content
  if (draftCount > 0) {
    if (!tenantId) {
      throw new ApplicationError(
        ErrorCode.AUTH_UNAUTHORIZED,
        'Tenant ID not found'
      );
    }
    await secureUpdateProject(String(projectId), tenantId, userId, {
      hasPatentContent: true,
    });
    logger.info(`Updated hasPatentContent flag for project: ${projectId}`);
  }

  // Optionally create a version if versionName was provided
  let versionData = null;
  if (finalVersionName) {
    const { createApplicationVersionFromDraft } = await import(
      '@/repositories/project'
    );

    const newVersion = await createApplicationVersionFromDraft(
      String(projectId),
      userId,
      finalVersionName
    );

    versionData = {
      id: newVersion.id,
      name: newVersion.name,
      createdAt: newVersion.createdAt,
      projectId: newVersion.projectId,
      userId: newVersion.userId,
      documents: newVersion.documents,
    };
  }

  res.status(201).json({
    success: true,
    message: 'Patent application sections generated successfully',
    draftDocuments: draftCount,
    version: versionData,
    sections: generatedSections,
  });
}

// SECURITY: This endpoint is tenant-protected using project-based resolution
// Users can only generate application sections for projects within their own tenant
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      body: bodySchema,
      bodyMethods: ['POST'],
    },
    rateLimit: 'api', // Using standard API rate limit
  }
);

import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { getInventionContextForChat } from '@/repositories/chatRepository';
import { createFigureSlot, addFigureElement } from './figureOperations.tool';
import { updateInventionDetails } from './updateInventionDetails.tool';
import { OpenaiServerService } from '@/server/services/openai.server-service';
import { figureRepository } from '@/repositories/figure';
import { findProjectByIdAndTenant } from '@/repositories/project/core.repository';

interface FigureSuggestion {
  figureKey: string;
  title: string;
  description: string;
  elements: Array<{
    number: string;
    description: string;
  }>;
}

interface AnalysisResult {
  suggestedFigures: FigureSuggestion[];
  inventionUpdateSummary: string;
  consistencyNotes: string[];
}

/**
 * Analyze invention and suggest appropriate figures with reference numerals
 *
 * SECURITY: Always validates tenant ownership before accessing data
 */
export async function analyzeAndSuggestFigures(
  projectId: string,
  tenantId: string
): Promise<{
  success: boolean;
  figuresCreated: number;
  elementsAdded: number;
  analysis: AnalysisResult;
  message: string;
}> {
  logger.info('[AnalyzeAndSuggestFigures] Starting analysis', {
    projectId,
    tenantId,
  });

  try {
    // Load invention context
    const inventionContext = await getInventionContextForChat(
      projectId,
      tenantId
    );

    if (!inventionContext || !inventionContext.invention) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'No invention data found to analyze'
      );
    }

    // Get full project details
    const project = await findProjectByIdAndTenant(projectId, tenantId);
    if (!project) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Project not found or access denied'
      );
    }

    // Get existing figures with full details to check for content
    const figuresWithDetails =
      await figureRepository.getFiguresWithElements(projectId);

    // Only consider figures with actual content as "existing"
    // Empty figures (no title, no elements, no image) should be available for use
    const existingFigureKeys = new Set(
      figuresWithDetails
        .filter(fig => {
          // Figure has content if it has:
          // - An image (fileName not empty)
          // - A meaningful title (not just "Figure FIG. X")
          // - A description
          // - Elements
          const hasImage = !!fig.fileName;
          const hasCustomTitle =
            fig.title && !fig.title.match(/^Figure FIG\.\s*\d+[A-Z]?$/);
          const hasDescription = !!fig.description;
          const hasElements = fig.elements && fig.elements.length > 0;

          // Consider figure as "existing" only if it has actual content
          return hasImage || hasCustomTitle || hasDescription || hasElements;
        })
        .map(f => f.figureKey)
        .filter((key): key is string => key !== null && key !== undefined)
    );

    logger.info('[AnalyzeAndSuggestFigures] Found existing figures', {
      projectId,
      totalFigures: figuresWithDetails.length,
      figuresWithContent: Array.from(existingFigureKeys),
      emptyFigures: figuresWithDetails
        .filter(f => f.figureKey && !existingFigureKeys.has(f.figureKey))
        .map(f => ({
          figureKey: f.figureKey,
          hasImage: !!f.fileName,
          hasTitle: !!f.title,
          hasDescription: !!f.description,
          elementCount: f.elements?.length || 0,
        })),
    });

    // Analyze invention and suggest figures using AI
    const analysis = await analyzeInventionForFigures(
      inventionContext,
      existingFigureKeys,
      figuresWithDetails
    );

    logger.info('[AnalyzeAndSuggestFigures] AI analysis complete', {
      projectId,
      suggestedFiguresCount: analysis.suggestedFigures.length,
    });

    // Create figure slots and add elements
    let figuresCreated = 0;
    let elementsAdded = 0;
    const createdFigures: string[] = [];

    for (const suggestion of analysis.suggestedFigures) {
      try {
        // Create figure slot
        const figureResult = await createFigureSlot(
          projectId,
          tenantId,
          suggestion.figureKey,
          suggestion.title,
          suggestion.description
        );

        if (figureResult.success) {
          // Only count as created if it was actually new
          if (figureResult.message.includes('Successfully created')) {
            figuresCreated++;
            createdFigures.push(suggestion.figureKey);
          }

          // Add reference numerals for this figure
          for (const element of suggestion.elements) {
            try {
              await addFigureElement(
                projectId,
                tenantId,
                suggestion.figureKey,
                element.number,
                element.description
              );
              elementsAdded++;
            } catch (elementError) {
              logger.warn('[AnalyzeAndSuggestFigures] Failed to add element', {
                figureKey: suggestion.figureKey,
                elementNumber: element.number,
                error: elementError,
              });
            }
          }
        }
      } catch (figureError) {
        logger.warn('[AnalyzeAndSuggestFigures] Failed to create figure', {
          figureKey: suggestion.figureKey,
          error: figureError,
        });
      }
    }

    // Update invention data to reflect new figures and reference numerals
    if (createdFigures.length > 0) {
      const updateDetails = formatInventionUpdate(analysis, createdFigures);

      await updateInventionDetails(projectId, tenantId, updateDetails);
    }

    const message =
      figuresCreated > 0
        ? `Successfully created ${figuresCreated} new figures with ${elementsAdded} reference numerals`
        : elementsAdded > 0
          ? `Added ${elementsAdded} reference numerals to existing figures`
          : 'No new figures were needed - all suggested figures already exist';

    return {
      success: true,
      figuresCreated,
      elementsAdded,
      analysis,
      message,
    };
  } catch (error) {
    logger.error(
      '[AnalyzeAndSuggestFigures] Failed to analyze and suggest figures',
      {
        projectId,
        error,
      }
    );
    throw error;
  }
}

/**
 * Use AI to analyze invention and suggest appropriate figures
 */
async function analyzeInventionForFigures(
  inventionContext: any,
  existingFigureKeys: Set<string>,
  figuresWithDetails: Array<{
    id: string;
    status: string;
    figureKey: string | null;
    title: string | null;
    description: string | null;
    displayOrder: number | null;
    fileName: string;
    blobName: string;
    mimeType: string;
    elements: Array<{
      elementKey: string;
      elementName: string;
      calloutDescription: string | null;
    }>;
  }>
): Promise<AnalysisResult> {
  const invention = inventionContext.invention;

  // Build comprehensive invention summary
  const inventionSummary = `
Title: ${invention.title || 'Untitled'}
Technical Field: ${invention.technicalField || 'Not specified'}
Summary: ${invention.summary || 'No summary'}

Key Features:
${invention.features?.map((f: string) => `- ${f}`).join('\n') || 'No features listed'}

Technical Implementation:
${JSON.stringify(invention.technicalImplementation || {}, null, 2)}

Claims:
${
  inventionContext.claims
    ?.slice(0, 3)
    .map((c: any) => `${c.number}. ${c.text}`)
    .join('\n') || 'No claims'
}
  `;

  const existingFiguresList = Array.from(existingFigureKeys).join(', ');
  const emptyFiguresList = figuresWithDetails
    .filter(f => f.figureKey && !existingFigureKeys.has(f.figureKey))
    .map(f => f.figureKey)
    .join(', ');

  const prompt = `You are a patent figure specialist. Analyze this invention and suggest appropriate patent figures with reference numerals.

INVENTION:
${inventionSummary}

EXISTING FIGURES WITH CONTENT: ${existingFiguresList || 'None'}
EMPTY FIGURE SLOTS AVAILABLE: ${emptyFiguresList || 'None'}

Based on this invention, suggest 2-4 patent figures that would best illustrate the invention.

IMPORTANT RULES:
1. USE EMPTY FIGURE SLOTS FIRST (e.g., if FIG. 1 is empty, use it for your first suggestion)
2. Only create new figure numbers if all empty slots are filled
3. DO NOT suggest figures that already have content

For each figure:
1. Provide a figure key (e.g., "FIG. 1", "FIG. 2")
2. Give a descriptive title
3. Write a brief description of what the figure shows
4. List 3-6 reference numerals with descriptions for key elements

Also provide:
- A summary of how these figures enhance the invention disclosure
- Any consistency notes between figures, claims, and invention description

Respond in JSON format:
{
  "suggestedFigures": [
    {
      "figureKey": "FIG. 1",
      "title": "Overall System Architecture",
      "description": "Shows the complete system with all major components",
      "elements": [
        {"number": "10", "description": "main housing"},
        {"number": "12", "description": "processing unit"}
      ]
    }
  ],
  "inventionUpdateSummary": "Brief summary of updates needed in invention text",
  "consistencyNotes": ["Note 1", "Note 2"]
}`;

  const response = await OpenaiServerService.getChatCompletion({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'You are a patent figure specialist. Always respond with valid JSON. Never suggest figures that already exist.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.content);

  // Filter out any figures that might have been suggested despite instructions
  const filteredFigures =
    result.suggestedFigures?.filter(
      (fig: FigureSuggestion) => !existingFigureKeys.has(fig.figureKey)
    ) || [];

  // Validate and clean the response
  return {
    suggestedFigures: filteredFigures,
    inventionUpdateSummary: result.inventionUpdateSummary || '',
    consistencyNotes: result.consistencyNotes || [],
  };
}

/**
 * Format invention update text based on created figures
 */
function formatInventionUpdate(
  analysis: AnalysisResult,
  createdFigures: string[]
): string {
  const figureReferences = createdFigures
    .map(fig => {
      const suggestion = analysis.suggestedFigures.find(
        s => s.figureKey === fig
      );
      if (!suggestion) return '';

      const elementRefs = suggestion.elements
        .map(el => `reference numeral ${el.number} (${el.description})`)
        .join(', ');

      return `${fig} shows ${suggestion.description}. Key elements include ${elementRefs}.`;
    })
    .filter(Boolean)
    .join(' ');

  return `The invention is illustrated in the accompanying figures. ${figureReferences} ${analysis.inventionUpdateSummary}`;
}

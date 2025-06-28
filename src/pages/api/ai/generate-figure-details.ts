import { NextApiResponse } from 'next';
import { logger } from '@/lib/monitoring/logger';
import { processWithOpenAI } from '@/server/ai/aiService';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { renderPromptTemplate } from '@/server/prompts/prompts/utils';
import {
  FIGURE_GENERATION_SYSTEM_MESSAGE_V1,
  FIGURE_SUGGESTION_PROMPT_V1,
} from '@/server/prompts/prompts/templates/figureGeneration';
import { CustomApiRequest } from '@/types/api';
import { safeJsonParse } from '@/utils/json-utils';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

/**
 * Expected request body structure
 */
interface FigureInputData {
  description?: string;
  image?: string; // URL or base64
  type?: 'image' | 'mermaid' | 'reactflow';
  content?: string; // For mermaid or reactflow
  elements?: Record<string, string>;
}

// Request: Send current state + context
interface GenerateFigureSuggestionsRequestBody {
  currentFigures: Record<string, FigureInputData>;
  inventionContext: {
    title?: string;
    summary?: string;
    preferredEmbodiment?: string;
    features?: string[];
    // Add other relevant fields from analyzedInvention as needed
  };
}

interface GeneratedFigureDetail {
  description: string;
  elements: Record<string, string>;
  // AI might suggest type/content, but image is less likely
  type?: 'image' | 'mermaid' | 'reactflow';
  content?: string;
}

interface GenerateFigureSuggestionsResponse {
  suggestedFigureUpdates: Record<string, GeneratedFigureDetail>;
}

/**
 * Error response structure
 */
interface ErrorResponse {
  error: string;
  details?: unknown;
}

// Validation schema for request body
const requestSchema = z.object({
  currentFigures: z.record(
    z.object({
      description: z.string().optional(),
      image: z.string().optional(),
      type: z.enum(['image', 'mermaid', 'reactflow']).optional(),
      content: z.string().optional(),
      elements: z.record(z.string()).optional(),
    })
  ),
  inventionContext: z.object({
    title: z.string().optional(),
    summary: z.string().optional(),
    preferredEmbodiment: z.string().optional(),
    features: z.array(z.string()).optional(),
  }),
});

/**
 * --- AI Prompt Generation (Suggest additions/updates) ---
 * This section would contain the logic to construct a detailed prompt
 * for the AI service based on the input data.
 */
const constructFigureSuggestionPrompt = (
  currentFigures: Record<string, FigureInputData>,
  inventionContext: GenerateFigureSuggestionsRequestBody['inventionContext']
): string => {
  const existingFiguresString = JSON.stringify(currentFigures, null, 2);

  // ✅ Tech Debt Tracker item cleared: Extract inline prompt from generate-figure-details.ts
  const prompt = renderPromptTemplate(FIGURE_SUGGESTION_PROMPT_V1, {
    title: inventionContext.title || 'N/A',
    summary: inventionContext.summary || 'N/A',
    features: inventionContext.features?.join(', ') || 'N/A',
    preferredEmbodiment: inventionContext.preferredEmbodiment || 'N/A',
    existingFiguresString,
  });

  return prompt;
};

/**
 * --- AI Service Call (Get suggestions) ---
 * This section would contain the logic to call the actual AI service (e.g., OpenAI GPT)
 */
const callAIServiceForSuggestions = async (
  currentFigures: Record<string, FigureInputData>,
  inventionContext: GenerateFigureSuggestionsRequestBody['inventionContext']
): Promise<GenerateFigureSuggestionsResponse> => {
  const prompt = constructFigureSuggestionPrompt(
    currentFigures,
    inventionContext
  );
  const systemMessage = FIGURE_GENERATION_SYSTEM_MESSAGE_V1.template;

  logger.log(`Attempting to generate figure suggestions via AI service.`);

  const aiResponse = await processWithOpenAI(prompt, systemMessage, {
    response_format: { type: 'json_object' },
  });

  if (aiResponse.content) {
    const parsedContent = safeJsonParse<Record<string, GeneratedFigureDetail>>(
      aiResponse.content
    );

    if (parsedContent === undefined) {
      throw new ApplicationError(
        ErrorCode.AI_INVALID_RESPONSE,
        'Invalid JSON response from AI service'
      );
    }

    // Validate response structure
    if (!parsedContent || typeof parsedContent !== 'object') {
      throw new ApplicationError(
        ErrorCode.AI_INVALID_RESPONSE,
        'AI service returned invalid response structure'
      );
    }

    if (!parsedContent.elements || !Array.isArray(parsedContent.elements)) {
      throw new ApplicationError(
        ErrorCode.AI_INVALID_RESPONSE,
        'AI service returned empty response'
      );
    }

    logger.log(
      `Successfully generated and parsed figure suggestions. Cost: $${aiResponse.usage.estimated_cost.toFixed(5)}`
    );

    return { suggestedFigureUpdates: parsedContent };
  } else {
    logger.error('Error: AI suggestions response has no content.');
    throw new ApplicationError(
      ErrorCode.AI_INVALID_RESPONSE,
      'AI service returned empty response'
    );
  }
};

/**
 * API Route Handler
 */
async function handler(
  req: CustomApiRequest<GenerateFigureSuggestionsRequestBody>,
  res: NextApiResponse<GenerateFigureSuggestionsResponse | ErrorResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    throw new ApplicationError(
      ErrorCode.VALIDATION_FAILED,
      `Method ${req.method} Not Allowed`
    );
  }

  // Validation is now handled by withValidation middleware
  const { currentFigures, inventionContext } = req.body;

  // 1. Call the AI service to get suggestions
  const result = await callAIServiceForSuggestions(
    currentFigures,
    inventionContext
  );

  // 2. Return the suggested updates (could be an empty object)
  return res.status(200).json(result);
}

// Use the new secure preset
export default SecurePresets.tenantProtected(
  TenantResolvers.fromUser,
  handler,
  {
    validate: {
      body: requestSchema,
    },
  }
);

import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { withTenantGuard } from '@/middleware/authorization';
import { withAuth } from '@/middleware/auth';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import type { AuthenticatedRequest } from '@/types/api';
import { findOfficeActionWithRelationsById } from '@/repositories/officeActionRepository';
import { processWithOpenAI } from '@/server/ai/aiService';
import { safeJsonParse } from '@/utils/jsonUtils';
import { prisma } from '@/lib/prisma';

// Request validation schema
const generateResponseSchema = z.object({
  officeActionId: z.string().uuid(),
  userInstructions: z.string().optional(),
});

interface ClaimAmendmentResult {
  claimNumber: string;
  originalText: string;
  amendedText: string;
  wasAmended: boolean;
  amendmentReason: string;
}

interface GenerateResponseResult {
  claims: ClaimAmendmentResult[];
  summary: string;
  officeActionId: string;
  generatedAt: string;
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projectId } = req.query;
    const { user } = req;
    
    if (!projectId || typeof projectId !== 'string') {
      throw new ApplicationError(
        ErrorCode.VALIDATION_FAILED,
        'Project ID is required'
      );
    }

    if (!user?.tenantId) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_FAILED,
        'User tenant ID is required'
      );
    }

    const requestData = generateResponseSchema.parse(req.body);
    const { officeActionId, userInstructions } = requestData;

    logger.info('[GenerateResponse] Starting simplified amendment response generation', {
      projectId,
      officeActionId,
      userId: user?.id,
    });

    // 1. Get the office action with rejections
    const officeAction = await findOfficeActionWithRelationsById(officeActionId, user.tenantId);

    if (!officeAction) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'Office Action not found'
      );
    }

    // Verify project matches
    if (officeAction.projectId !== projectId) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_FAILED,
        'Office Action does not belong to this project'
      );
    }

    // 2. Get OCR claims text from office action or project documents
    const claimsText = await getOCRClaimsText(projectId, user.tenantId);
    
    if (!claimsText) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_FAILED,
        'No previous claims text found. Please ensure claims document is uploaded.'
      );
    }

    logger.info('[GenerateResponse] Found OCR claims text', {
      claimsTextLength: claimsText.length,
      rejectionsCount: officeAction.rejections?.length || 0,
    });

    // 3. Generate amendments using AI
    const amendmentResult = await generateAllClaimAmendments(
      claimsText,
      officeAction,
      userInstructions
    );

    // 4. Store the result in database
    await storeAmendmentResult(projectId, officeActionId, amendmentResult, user.tenantId);

    logger.info('[GenerateResponse] Amendment response generated successfully', {
      projectId,
      officeActionId,
      claimsCount: amendmentResult.claims.length,
      amendedCount: amendmentResult.claims.filter(c => c.wasAmended).length,
    });

    return res.status(200).json(amendmentResult);

  } catch (error) {
    logger.error('[GenerateResponse] Failed to generate amendment response', {
      error: error instanceof Error ? error.message : String(error),
      projectId: req.query.projectId,
    });

    if (error instanceof ApplicationError) {
      return res.status(error.statusCode || 400).json({
        error: error.code,
        message: error.message,
      });
    }

    return res.status(500).json({
      error: ErrorCode.INTERNAL_ERROR,
      message: 'Failed to generate amendment response',
    });
  }
}

/**
 * Get OCR claims text from office action or project documents
 */
async function getOCRClaimsText(projectId: string, tenantId: string): Promise<string | null> {
  try {
    if (!prisma) {
      logger.error('[GenerateResponse] Prisma client not available');
      return null;
    }

    // Try to get claims from project documents (patent applications)
    const claimsDocument = await prisma.projectDocument.findFirst({
      where: {
        projectId,
        fileType: {
          in: ['application/pdf', 'text/plain'], // PDF or text documents
        },
        extractedText: {
          not: null,
        },
      },
      orderBy: {
        createdAt: 'desc', // Get most recent
      },
    });

    if (claimsDocument?.extractedText) {
      // Try to extract claims section from the document
      const claimsFromDoc = extractClaimsFromText(claimsDocument.extractedText);
      if (claimsFromDoc) {
        logger.info('[GenerateResponse] Found claims from project document', {
          fileName: claimsDocument.fileName,
          textLength: claimsFromDoc.length,
        });
        return claimsFromDoc;
      }

      // If no specific claims section found, return the full text as it may contain claims
      logger.info('[GenerateResponse] Using full document text for claims', {
        fileName: claimsDocument.fileName,
        textLength: claimsDocument.extractedText.length,
      });
      return claimsDocument.extractedText;
    }

    // Fallback: try to extract claims from office action text itself
    if (!prisma) return null;
    
    const officeActionWithText = await prisma.officeAction.findFirst({
      where: {
        projectId,
        tenantId,
        extractedText: {
          not: null,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (officeActionWithText?.extractedText) {
      // Try to extract claims section from office action
      const claimsFromOA = extractClaimsFromText(officeActionWithText.extractedText);
      if (claimsFromOA) {
        logger.info('[GenerateResponse] Extracted claims from office action text', {
          textLength: claimsFromOA.length,
        });
        return claimsFromOA;
      }
    }

    return null;
  } catch (error) {
    logger.error('[GenerateResponse] Failed to get OCR claims text', { error });
    return null;
  }
}

/**
 * Extract claims section from text
 */
function extractClaimsFromText(text: string): string | null {
  try {
    // Look for claims section in the text
    const claimsPattern = new RegExp('(?:claims?|applicant(?:\'s)?\\s+claims?|the\\s+following\\s+claims?)[:\\s]*\\n\\n?(.+?)(?:\\n\\n(?:prior\\s+art|rejection|examiner|background|field|summary)|$)', 'is');
    const match = text.match(claimsPattern);
    
    if (match && match[1]) {
      return match[1].trim();
    }

    // Alternative pattern for claims listing
    const alternativePattern = new RegExp('claim\\s+1[.\\s]+(.+?)(?:\\n\\n|\\n(?:claim\\s+\\d+|prior\\s+art|rejection|examiner))', 'is');
    const altMatch = text.match(alternativePattern);
    
    if (altMatch && altMatch[0]) {
      return altMatch[0].trim();
    }

    return null;
  } catch (error) {
    logger.error('[GenerateResponse] Failed to extract claims from text', { error });
    return null;
  }
}

/**
 * Generate all claim amendments using AI
 */
async function generateAllClaimAmendments(
  claimsText: string,
  officeAction: any,
  userInstructions?: string
): Promise<GenerateResponseResult> {
  
  // Build rejection context
  const rejections = officeAction.rejections || [];
  const rejectionsContext = rejections.map((r: any) => {
    let claimNumbers: string[] = [];
    let citedPriorArt: string[] = [];
    
    try {
      claimNumbers = Array.isArray(r.claimNumbers) 
        ? r.claimNumbers 
        : JSON.parse(r.claimNumbers || '[]');
    } catch (e) {
      claimNumbers = [];
    }
    
    try {
      citedPriorArt = Array.isArray(r.citedPriorArt)
        ? r.citedPriorArt
        : JSON.parse(r.citedPriorArt || '[]');
    } catch (e) {
      citedPriorArt = [];
    }
    
    return `
Type: ${r.type}
Rejected Claims: ${claimNumbers.join(', ')}
Prior Art: ${citedPriorArt.join(', ')}
Examiner Reasoning: ${r.examinerText}
`;
  }).join('\n---\n');

  const systemPrompt = `You are an expert patent attorney drafting amendments to respond to an Office Action. 

Your task is to analyze the previous claims and office action rejections, then provide amendments for ALL claims (both rejected and non-rejected).

For each claim:
- If rejected: Provide an amended version that addresses the rejection
- If not rejected: Keep the claim unchanged but still show it for completeness
- Always provide clear reasoning for your decision

Return your response as valid JSON only:

{
  "claims": [
    {
      "claimNumber": "1",
      "originalText": "exact original claim text",
      "amendedText": "amended text (same as original if no amendment needed)", 
      "wasAmended": true/false,
      "amendmentReason": "Detailed reason for amendment or 'No amendment needed - claim not rejected'"
    }
  ],
  "summary": "Overall summary of amendment strategy"
}`;

  const userPrompt = `PREVIOUS CLAIMS TEXT:
${claimsText}

OFFICE ACTION REJECTIONS:
${rejectionsContext}

${userInstructions ? `ADDITIONAL INSTRUCTIONS: ${userInstructions}` : ''}

Please analyze all claims in the claims text and provide amendments for rejected claims while preserving non-rejected claims. Show ALL claims for completeness.`;

  // Token pricing constants (GPT-4.1 - April 2025)
  const TOKEN_PRICING = {
    INPUT_PER_1K: 0.002,   // $2.00 per million
    OUTPUT_PER_1K: 0.008,  // $8.00 per million
  };

  // Calculate input tokens for cost estimation
  const estimateTokens = (text: string): number => Math.ceil(text.length / 4);
  const estimatedInputTokens = estimateTokens(systemPrompt + userPrompt);
  const maxOutputTokens = 8000;

  // Calculate estimated cost
  const estimatedInputCost = (estimatedInputTokens / 1000) * TOKEN_PRICING.INPUT_PER_1K;
  const estimatedOutputCost = (maxOutputTokens / 1000) * TOKEN_PRICING.OUTPUT_PER_1K;
  const estimatedTotalCost = estimatedInputCost + estimatedOutputCost;

  logger.info('[GenerateResponse] 💰 PRE-GENERATION COST ESTIMATE 💰', {
    model: 'gpt-4.1',
    estimatedInputTokens,
    maxOutputTokens,
    estimatedInputCost: `$${estimatedInputCost.toFixed(4)}`,
    estimatedOutputCost: `$${estimatedOutputCost.toFixed(4)}`,
    estimatedTotalCost: `$${estimatedTotalCost.toFixed(4)}`,
    claimsTextLength: claimsText.length,
    rejectionsCount: rejections.length,
  });

  try {
    const aiResponse = await processWithOpenAI(
      systemPrompt,
      userPrompt,
      {
        maxTokens: maxOutputTokens,
        temperature: 0.2,
        model: 'gpt-4.1', // Ensure correct model
      }
    );

    // Calculate actual cost based on real usage
    const actualInputTokens = aiResponse.usage?.prompt_tokens || estimatedInputTokens;
    const actualOutputTokens = aiResponse.usage?.completion_tokens || maxOutputTokens;
    
    const actualInputCost = (actualInputTokens / 1000) * TOKEN_PRICING.INPUT_PER_1K;
    const actualOutputCost = (actualOutputTokens / 1000) * TOKEN_PRICING.OUTPUT_PER_1K;
    const actualTotalCost = actualInputCost + actualOutputCost;

    logger.info('[GenerateResponse] 💰 ACTUAL "NEW RESPONSE" COST TRACKING 💰', {
      officeActionId: officeAction.id,
      model: 'gpt-4.1',
      // === ACTUAL COST BREAKDOWN ===
      actualCost: `$${actualTotalCost.toFixed(4)}`,
      inputCost: `$${actualInputCost.toFixed(4)} (${actualInputTokens} tokens)`,
      outputCost: `$${actualOutputCost.toFixed(4)} (${actualOutputTokens} tokens)`,
      // === TOKEN USAGE ===
      totalTokens: actualInputTokens + actualOutputTokens,
      inputTokens: actualInputTokens,
      outputTokens: actualOutputTokens,
      // === CONTEXT DETAILS ===
      claimsTextLength: claimsText.length,
      systemPromptLength: systemPrompt.length,
      userPromptLength: userPrompt.length,
      rejectionsProcessed: rejections.length,
      // === COST COMPARISON ===
      estimatedCost: `$${estimatedTotalCost.toFixed(4)}`,
      costDifference: `$${(actualTotalCost - estimatedTotalCost).toFixed(4)}`,
      estimationAccuracy: `${((1 - Math.abs(actualTotalCost - estimatedTotalCost) / estimatedTotalCost) * 100).toFixed(1)}%`,
    });

    const result = safeJsonParse(aiResponse.content);
    
    if (!result || !result.claims || !Array.isArray(result.claims)) {
      throw new Error('Invalid AI response format');
    }

    return {
      claims: result.claims,
      summary: result.summary || 'Amendment response generated successfully',
      officeActionId: officeAction.id,
      generatedAt: new Date().toISOString(),
    };

  } catch (error) {
    logger.error('[GenerateResponse] AI generation failed', { error });
    throw new ApplicationError(
      ErrorCode.AI_SERVICE_ERROR,
      'Failed to generate claim amendments'
    );
  }
}

/**
 * Store amendment result in database
 */
async function storeAmendmentResult(
  projectId: string,
  officeActionId: string,
  result: GenerateResponseResult,
  tenantId: string
): Promise<void> {
  try {
    if (!prisma) {
      logger.warn('[GenerateResponse] Prisma not available for storing result');
      return;
    }

    // Store as draft document
    await prisma.draftDocument.upsert({
      where: {
        projectId_type: {
          projectId,
          type: 'AMENDMENT_RESPONSE',
        },
      },
      update: {
        content: JSON.stringify(result),
        updatedAt: new Date(),
      },
      create: {
        projectId,
        type: 'AMENDMENT_RESPONSE',
        content: JSON.stringify(result),
      },
    });

    logger.info('[GenerateResponse] Amendment result stored successfully', {
      projectId,
      officeActionId,
    });
  } catch (error) {
    logger.error('[GenerateResponse] Failed to store amendment result', { error });
    // Don't throw - storage failure shouldn't fail the generation
  }
}

// Apply tenant guard
const resolveTenantId = async (req: NextApiRequest): Promise<string | null> => {
  const { projectId } = req.query;
  if (!prisma) return null;
  
  const project = await prisma.project.findUnique({
    where: { id: String(projectId) },
    select: { tenantId: true }
  });
  return project?.tenantId || null;
};

const guardedHandler = withTenantGuard(resolveTenantId)(handler);
export default withAuth(guardedHandler); 
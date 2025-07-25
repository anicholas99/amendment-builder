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
import { AmendmentContextService } from '@/server/services/amendment-context.server-service';

// Request validation schema
const generateResponseSchema = z.object({
  officeActionId: z.string().uuid(),
  userInstructions: z.string().optional(),
  budget: z.number().min(0.10).max(5.0).optional(), // Budget in dollars (10 cents to $5)
});

// Token pricing constants (GPT-4.1 - April 2025)
const TOKEN_PRICING = {
  INPUT_PER_1K: 0.002,        // $2.00 per million
  CACHED_INPUT_PER_1K: 0.0005, // $0.50 per million
  OUTPUT_PER_1K: 0.008,       // $8.00 per million
} as const;

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
    const { officeActionId, userInstructions, budget = 0.50 } = requestData;

    logger.info('[GenerateResponse] Starting enhanced amendment response generation', {
      projectId,
      officeActionId,
      userId: user?.id,
      budget: `$${budget}`,
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

    // 2. Calculate token budget for full context  
    const maxOutputTokens = 16000; // Increased for complex amendments
    const outputBudget = (maxOutputTokens / 1000) * TOKEN_PRICING.OUTPUT_PER_1K;
    const inputBudget = budget - outputBudget;
    
    if (inputBudget <= 0) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_FAILED,
        `Budget too low. Output tokens alone cost $${outputBudget.toFixed(3)}, but budget is $${budget}`
      );
    }
    
    const maxInputTokens = Math.floor((inputBudget / TOKEN_PRICING.INPUT_PER_1K) * 1000);

    logger.info('[GenerateResponse] Token budget calculated', {
      totalBudget: `$${budget}`,
      maxInputTokens,
      maxOutputTokens,
      inputBudget: `$${inputBudget.toFixed(3)}`,
      outputBudget: `$${outputBudget.toFixed(3)}`,
    });

    // 3. Get comprehensive document context using AmendmentContextService
    const documentBundle = await AmendmentContextService.getAmendmentDraftingContext(
      projectId,
      user.tenantId
    );

    if (!documentBundle.officeAction) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_FAILED,
        'No Office Action text found'
      );
    }

    // 4. Generate AI prompt with budget-optimized context
    const amendmentResult = await generateAmendmentWithFullContext(
      documentBundle,
      officeAction,
      userInstructions,
      maxInputTokens,
      maxOutputTokens
    );

    // 5. Store the result in database
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

**CRITICAL: DO NOT include paragraph numbers in amendmentReason or summary fields**
- ❌ BAD: "Added feature from [00032] to distinguish..."
- ❌ BAD: "Based on paragraph [00045] disclosure..."
- ✅ GOOD: "Added feature from specification to distinguish..."
- ✅ GOOD: "Based on specification disclosure..."

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
 * Generate amendment with full document context using budget-optimized approach
 */
async function generateAmendmentWithFullContext(
  documentBundle: any,
  officeAction: any,
  userInstructions: string | undefined,
  maxInputTokens: number,
  maxOutputTokens: number
): Promise<GenerateResponseResult> {
  
  // Helper to estimate tokens
  const estimateTokens = (text: string): number => Math.ceil(text.length / 4);
  
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

  // Build system prompt
  const systemPrompt = `You are a senior patent attorney with deep USPTO prosecution experience. Your task is to draft **surgical amendments** to claims rejected or objected to in a Non-Final Office Action, while preserving claim scope and avoiding unnecessary estoppel.

📌 MISSION:
Generate only the minimum necessary amendments to address the specific objections or rejections raised in the provided Office Action.

⚖️ STRATEGIC RULES:
1. **MINIMALISM IS MANDATORY**: Make only the smallest changes required. If a one-word fix suffices, use it.
2. **DO NOT MODIFY CLAIMS THAT WERE NOT OBJECTED OR REJECTED**.
3. **DEPENDENT CLAIM RULE**:
   - Only amend dependent claims if:
     a) They are explicitly rejected or objected to; OR
     b) They rely on a modified independent claim and would otherwise break (e.g. due to antecedent basis).
4. **AVOID UNNECESSARY REWORDING**: Preserve the original structure and style of each claim.
5. **DO NOT INTRODUCE NEW TERMS** unless directly necessary to resolve a cited rejection or objection.
6. **PRESERVE CLAIM SCOPE**: Your edits must not narrow the claim unnecessarily.

🧠 OUTPUT FORMAT (JSON):

{
  "claims": [
    {
      "claimNumber": "1",
      "originalText": "exact original claim text",
      "amendedText": "amended text (same as original if no amendment needed)", 
      "wasAmended": true/false,
      "wasRejected": true/false,
      "rejectionAddressed": "35 U.S.C. § 112(b) — ambiguous antecedent basis for 'delivery entity'",
      "changeSummary": "Inserted 'a delivery entity' before first mention to establish antecedent basis",
      "minimalChangeJustification": "Only inserted missing term to match examiner instruction; no other change required.",
      "amendmentReason": "Surgical fix to address specific examiner objection"
    }
  ],
  "summary": "Surgical amendments address only specific rejections with minimal changes to preserve claim scope",
  "strategicAnalysis": {
    "overallChangeLevel": "minimal",
    "nonRejectedClaimsModified": false,
    "riskOfEstoppel": "low"
  }
}`;

  // Build user prompt with smart document prioritization
  const basePrompt = `OFFICE ACTION REJECTIONS:
${rejectionsContext}

${userInstructions ? `ADDITIONAL INSTRUCTIONS: ${userInstructions}` : ''}

Please analyze all claims and provide amendments that address rejections using the full context provided.`;

  // Document priority for token allocation
  const documentPriority = [
    'officeAction',
    'claims', 
    'lastResponse',
    'specification',
    'examinerSearch',
    'searchStrategy',
    'interview'
  ];

  // Calculate base prompt tokens
  const basePromptTokens = estimateTokens(systemPrompt + basePrompt);
  const availableTokens = maxInputTokens - basePromptTokens - 500; // Reserve 500 tokens for safety

  if (availableTokens <= 0) {
    throw new ApplicationError(
      ErrorCode.VALIDATION_FAILED,
      'Token budget too low for basic prompts'
    );
  }

  // Build document context with smart truncation
  let documentContext = '';
  let tokenCount = 0;

  for (const docType of documentPriority) {
    let doc = null;
    let label = '';

    if (docType === 'officeAction' && documentBundle.officeAction) {
      doc = documentBundle.officeAction;
      label = 'OFFICE ACTION';
    } else if (docType === 'claims' && documentBundle.claims) {
      doc = documentBundle.claims;
      label = 'CURRENT CLAIMS';
    } else if (docType === 'lastResponse' && documentBundle.lastResponse) {
      doc = documentBundle.lastResponse;
      label = 'PREVIOUS RESPONSE';
    } else if (docType === 'specification' && documentBundle.specification) {
      doc = documentBundle.specification;
      label = 'SPECIFICATION';
    } else if (docType === 'examinerSearch' && documentBundle.extras?.examinerSearch) {
      doc = documentBundle.extras.examinerSearch;
      label = 'EXAMINER SEARCH';
    } else if (docType === 'searchStrategy' && documentBundle.extras?.searchStrategy) {
      doc = documentBundle.extras.searchStrategy;
      label = 'SEARCH STRATEGY';
    } else if (docType === 'interview' && documentBundle.extras?.interview) {
      doc = documentBundle.extras.interview;
      label = 'INTERVIEW SUMMARY';
    }

    if (!doc) continue;

    const docText = `=== ${label} ===\n${doc.text}\n\n`;
    const docTokens = estimateTokens(docText);

    if (tokenCount + docTokens <= availableTokens) {
      documentContext += docText;
      tokenCount += docTokens;
    } else {
      // Try to include a truncated version
      const remainingTokens = availableTokens - tokenCount;
      if (remainingTokens > 500) { // Only truncate if we have decent space
        const maxChars = (remainingTokens - 100) * 4; // Leave some buffer
        const truncatedText = doc.text.substring(0, maxChars) + '\n[...TRUNCATED FOR TOKEN LIMIT...]';
        documentContext += `=== ${label} (TRUNCATED) ===\n${truncatedText}\n\n`;
        break; // Stop adding more documents
      } else {
        break; // No space for more
      }
    }
  }

  const fullUserPrompt = `${documentContext}${basePrompt}`;

  // Calculate final cost estimation
  const finalInputTokens = estimateTokens(systemPrompt + fullUserPrompt);
  const estimatedCost = (finalInputTokens / 1000 * TOKEN_PRICING.INPUT_PER_1K) + 
                       (maxOutputTokens / 1000 * TOKEN_PRICING.OUTPUT_PER_1K);

  logger.info('[GenerateResponse] 💰 ENHANCED CONTEXT PRE-GENERATION ESTIMATE 💰', {
    model: 'gpt-4.1',
    finalInputTokens,
    maxOutputTokens,
    estimatedCost: `$${estimatedCost.toFixed(4)}`,
    documentsIncluded: {
      officeAction: !!documentBundle.officeAction,
      claims: !!documentBundle.claims,
      lastResponse: !!documentBundle.lastResponse,
      specification: !!documentBundle.specification,
      extras: Object.keys(documentBundle.extras || {}).filter(k => documentBundle.extras?.[k]),
    },
    contextLength: documentContext.length,
    tokenUtilization: `${((finalInputTokens / maxInputTokens) * 100).toFixed(1)}%`,
  });

  try {
    const aiResponse = await processWithOpenAI(
      systemPrompt,
      fullUserPrompt,
      {
        maxTokens: maxOutputTokens,
        temperature: 0.2,
        model: 'gpt-4.1',
      }
    );

    // Calculate actual cost
    const actualInputTokens = aiResponse.usage?.prompt_tokens || finalInputTokens;
    const actualOutputTokens = aiResponse.usage?.completion_tokens || maxOutputTokens;
    
    const actualInputCost = (actualInputTokens / 1000) * TOKEN_PRICING.INPUT_PER_1K;
    const actualOutputCost = (actualOutputTokens / 1000) * TOKEN_PRICING.OUTPUT_PER_1K;
    const actualTotalCost = actualInputCost + actualOutputCost;

    logger.info('[GenerateResponse] 💰 ACTUAL ENHANCED "NEW RESPONSE" COST 💰', {
      officeActionId: officeAction.id,
      model: 'gpt-4.1',
      actualCost: `$${actualTotalCost.toFixed(4)}`,
      inputCost: `$${actualInputCost.toFixed(4)} (${actualInputTokens} tokens)`,
      outputCost: `$${actualOutputCost.toFixed(4)} (${actualOutputTokens} tokens)`,
      totalTokens: actualInputTokens + actualOutputTokens,
      documentsProcessed: Object.keys(documentBundle).filter(k => documentBundle[k]),
      contextQuality: 'ENHANCED_FULL_CONTEXT',
      costDifference: `$${(actualTotalCost - estimatedCost).toFixed(4)}`,
    });

    const result = safeJsonParse(aiResponse.content);
    
    if (!result || !result.claims || !Array.isArray(result.claims)) {
      throw new Error('Invalid AI response format');
    }

    return {
      claims: result.claims,
      summary: result.summary || 'Enhanced amendment response generated with full context',
      officeActionId: officeAction.id,
      generatedAt: new Date().toISOString(),
    };

  } catch (error) {
    logger.error('[GenerateResponse] Enhanced AI generation failed', { error });
    throw new ApplicationError(
      ErrorCode.AI_SERVICE_ERROR,
      'Failed to generate enhanced claim amendments'
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
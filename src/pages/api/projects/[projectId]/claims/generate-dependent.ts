import type { NextApiRequest, NextApiResponse } from 'next';
import { processWithOpenAI, TokenUsage } from '@/lib/ai/openAIClient';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { AuthenticatedRequest } from '@/types/middleware';
import { CustomApiRequest } from '@/types/api';
import { z } from 'zod';
import { safeJsonParse } from '@/utils/jsonUtils';
import { logger } from '@/server/logger';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';

const apiLogger = createApiLogger('generate-dependent-claims');

// Define Zod schema for request body validation
const bodySchema = z.object({
  targetClaim: z.object({
    text: z.string().min(1, 'Target claim text is required'),
    number: z.union([z.string(), z.number()]).transform(val => String(val)),
  }),
  existingDependentClaims: z
    .array(
      z.object({
        text: z.string(),
      })
    )
    .optional()
    .default([]),
  title: z.string().optional().default(''),
  technical_field: z.string().optional().default(''),
  features: z.array(z.string()).optional().default([]),
  novelty: z.string().optional().default(''),
});

// Define request body type from schema
type GenerateDependentClaimsBody = z.infer<typeof bodySchema>;

// Define the expected structure of the AI response
interface DependentClaimsResponse {
  claims: Record<string, string>;
}

async function handler(
  req: CustomApiRequest<GenerateDependentClaimsBody>,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  apiLogger.logRequest(req);

  const {
    targetClaim, // The "main" claim we typically reference
    existingDependentClaims = [], // Any existing dependent claims
    title = '',
    technical_field = '',
    features = [],
    novelty = '',
  } = req.body;

  apiLogger.info('Generating dependent claims', {
    targetClaimNumber: targetClaim.number,
    existingClaimsCount: existingDependentClaims.length,
  });

  // Build a friendly list of existing dependent claims for the prompt
  const existingDependentsText = existingDependentClaims.length
    ? existingDependentClaims
        .map((claim: { text: string }) => claim.text)
        .join('\n\n')
    : 'None';

  const prompt = `
You are a U.S. patent attorney expert at drafting dependent claims.

===========================
INDEPENDENT CLAIM (TARGET)
===========================
${targetClaim.text}

===========================
EXISTING DEPENDENT CLAIMS
===========================
${existingDependentsText}

===========================
INVENTION CONTEXT
===========================
Title: ${title}
Technical Field: ${technical_field}
Key Features: ${Array.isArray(features) ? features.join(', ') : 'None provided'}
Novelty: ${novelty}

===========================
TASK
===========================
Generate 3-5 new dependent claims related to claim ${targetClaim.number}.
- By default, each claim can reference claim ${targetClaim.number} directly.
- However, if you see a logical narrower limitation or improvement that should chain from an existing dependent claim, you may reference one of those existing claims instead (e.g., "The [type] of claim 2, wherein...").
- The type (method/system/etc.) must match the same type as claim ${targetClaim.number}.

Each new dependent claim should:
1. Begin with either:
   - "The [type] of claim ${targetClaim.number}, wherein..."
   - "The [type] of claim ${targetClaim.number}, further comprising..."
   OR, if chaining from another dependent claim, use:
   - "The [type] of claim X, wherein..."
   - "The [type] of claim X, further comprising..."
   (where X is the claim number you're building on)

2. Add meaningful limitations that:
   - Further define elements from the referenced claim
   - Add specific implementations or configurations
   - Describe important variations or alternatives
   - Add optional but valuable features

3. Maintain consistent terminology with the referenced claim.
4. Avoid purely functional limitations without structure.
5. Avoid trivial limitations.

===========================
OUTPUT FORMAT
===========================
Return ONLY valid JSON in this format:

{
  "claims": {
    "next_number": "The [type] of claim X, wherein...",
    "next_number+1": "The [type] of claim X, wherein...",
    ...
  }
}
`;

  const systemMessage =
    'You are a specialized patent attorney who drafts dependent claims. Return only valid JSON in the exact format requested.';

  apiLogger.info('Calling AI service to generate dependent claims');

  const { content: rawText, usage } = await processWithOpenAI(
    prompt,
    systemMessage,
    {
      model: 'gpt-4-0125-preview',
      temperature: 0.3,
      responseFormat: { type: 'json_object' }, // Expecting JSON
    }
  );

  apiLogger.debug('AI service call completed', {
    used_fallback: usage.used_fallback,
    model: usage.model,
    prompt_tokens: usage.prompt_tokens,
    completion_tokens: usage.completion_tokens,
    total_tokens: usage.total_tokens,
  });

  let content = rawText.trim();
  // If the response is wrapped in ```json blocks, strip them
  if (content.includes('```json')) {
    apiLogger.debug('Stripping ```json block from AI response');
    content = content.split('```json')[1]?.split('```')[0] || content;
  }
  content = content.trim();

  const parsedResponse = safeJsonParse<DependentClaimsResponse>(content);

  if (parsedResponse === undefined) {
    apiLogger.error(
      'Failed to parse AI JSON response for dependent claims - invalid JSON',
      {
        snippet: content.slice(0, 500),
      }
    );
    throw new ApplicationError(
      ErrorCode.AI_INVALID_RESPONSE,
      'Failed to parse AI response as JSON'
    );
  }

  const generatedCount = Object.keys(parsedResponse?.claims || {}).length;
  apiLogger.info('Successfully parsed AI JSON response', {
    generatedClaimsCount: generatedCount,
  });

  // Add usage info to the response
  const responsePayload = {
    ...parsedResponse,
    usage: {
      prompt_tokens: usage.prompt_tokens,
      completion_tokens: usage.completion_tokens,
      total_tokens: usage.total_tokens,
      estimated_cost: usage.estimated_cost,
      used_fallback: usage.used_fallback,
    },
  };
  apiLogger.logResponse(200, { generatedClaimsCount: generatedCount });
  return res.status(200).json({
    success: true,
    data: responsePayload,
  });
}

// Use the new secure preset for tenant protection and validation
export default SecurePresets.tenantProtected(
  TenantResolvers.fromUser,
  handler,
  {
    validate: {
      body: bodySchema,
    },
  }
);

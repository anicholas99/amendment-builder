import type { NextApiRequest, NextApiResponse } from 'next';
// import { TenantServerService } from '@/server/services/tenant.server.service';
// import { InventionDataService } from '@/server/services/invention-data.server-service';
import { OpenaiServerService } from '@/server/services/openai.server-service';
import { AuthenticatedRequest } from '@/types/middleware';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/lib/monitoring/logger';
import { analyzeInventionPrompt } from '@/server/prompts/prompts/analyzeInvention';
import { InventionData } from '@/types/invention';
import { ClaimRepository } from '@/repositories/claimRepository';
import { findProjectById } from '@/repositories/project';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';
import { inventionRepository } from '@/repositories/inventionRepository';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';

const apiLogger = createApiLogger('process-invention');

// Validation schema for request body
const bodySchema = z.object({
  textInput: z
    .string()
    .min(10, 'Text input must be at least 10 characters')
    .max(100000, 'Text input is too long (max 100,000 characters)') // ~25 pages of text
    .trim(),
});

// Query validation schema
const querySchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectId } = req.query as z.infer<typeof querySchema>;
  const { textInput } = req.body as z.infer<typeof bodySchema>;

  // Validation is now handled by SecurePresets, but we keep the checks for clarity
  if (!projectId || typeof projectId !== 'string') {
    throw new ApplicationError(
      ErrorCode.VALIDATION_REQUIRED_FIELD,
      'Project ID is required'
    );
  }

  if (!textInput || typeof textInput !== 'string') {
    throw new ApplicationError(
      ErrorCode.VALIDATION_REQUIRED_FIELD,
      'Text content is required'
    );
  }

  const userTenantId = req.user?.tenantId;
  if (!userTenantId) {
    return res.status(401).json({ error: 'User tenant context required' });
  }

  try {
    // Step 1: Analyze the invention text
    apiLogger.info('Processing invention disclosure', {
      projectId,
      textLength: textInput.length,
    });

    const prompt = analyzeInventionPrompt(textInput);
    const aiResponse = await OpenaiServerService.getChatCompletion({
      messages: [
        {
          role: 'system',
          content:
            'You are an expert patent attorney analyzing invention disclosures. Return only valid JSON without any markdown formatting or code blocks.',
        },
        { role: 'user', content: prompt },
      ],
      model: 'gpt-4.1',
      temperature: 0.1,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    // Save raw GPT response to file for debugging
    try {
      const debugDir = path.join(process.cwd(), 'debug-outputs');
      if (!fs.existsSync(debugDir)) {
        fs.mkdirSync(debugDir, { recursive: true });
      }

      const timestamp = new Date()
        .toISOString()
        .replace(/:/g, '-')
        .replace(/\./g, '-');
      const debugFilePath = path.join(
        debugDir,
        `gpt-invention-response-${timestamp}.txt`
      );

      const debugContent = `=== GPT Invention Analysis Response ===
Project ID: ${projectId}
Timestamp: ${new Date().toISOString()}
Model: gpt-4
Temperature: 0.1

=== RAW RESPONSE ===
${aiResponse.content}

=== PRETTY PRINTED JSON ===
${(() => {
  try {
    let content = aiResponse.content.trim();
    if (content.startsWith('```json')) {
      content = content.slice(7);
    } else if (content.startsWith('```')) {
      content = content.slice(3);
    }
    if (content.endsWith('```')) {
      content = content.slice(0, -3);
    }
    const parsed = JSON.parse(content);
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    return (
      'Failed to parse JSON: ' + (e instanceof Error ? e.message : String(e))
    );
  }
})()}

=== ORIGINAL TEXT INPUT ===
${textInput}
`;

      fs.writeFileSync(debugFilePath, debugContent, 'utf8');
      apiLogger.info('Saved GPT response to debug file', { debugFilePath });
    } catch (debugError) {
      apiLogger.error('Failed to save debug file', { error: debugError });
      // Don't throw - this is just for debugging
    }

    // Step 2: Parse the response
    let inventionData: InventionData;
    try {
      // Strip markdown code block formatting if present
      let content = aiResponse.content.trim();
      if (content.startsWith('```json')) {
        content = content.slice(7); // Remove ```json
      } else if (content.startsWith('```')) {
        content = content.slice(3); // Remove ```
      }
      if (content.endsWith('```')) {
        content = content.slice(0, -3); // Remove trailing ```
      }

      inventionData = JSON.parse(content);

      apiLogger.info('Successfully parsed invention data', {
        projectId,
        hasTitle: !!inventionData.title,
        claimCount: inventionData.claims
          ? Array.isArray(inventionData.claims)
            ? inventionData.claims.length
            : Object.keys(inventionData.claims).length
          : 0,
        hasStructuredFigures: !!inventionData.structuredFigures,
        structuredFiguresCount: inventionData.structuredFigures?.length || 0,
      });
    } catch (error) {
      logger.error('Failed to parse AI response', {
        error,
        response: aiResponse.content,
      });
      throw new ApplicationError(
        ErrorCode.AI_INVALID_RESPONSE,
        'Failed to parse AI response'
      );
    }

    // Step 3: Store the invention data and claims in a transaction
    const claimsToCreate: { number: number; text: string }[] = [];

    if (inventionData.claims) {
      if (Array.isArray(inventionData.claims)) {
        // Handle array format
        inventionData.claims.forEach((claimText, index) => {
          if (typeof claimText === 'string' && claimText.trim()) {
            claimsToCreate.push({
              number: index + 1,
              text: claimText.trim(),
            });
          }
        });
      } else if (typeof inventionData.claims === 'object') {
        // Handle object format (e.g., { "1": "claim text", "2": "claim text" })
        Object.entries(inventionData.claims).forEach(([key, claimText]) => {
          const claimNumber = parseInt(key, 10);
          if (
            !isNaN(claimNumber) &&
            typeof claimText === 'string' &&
            claimText.trim()
          ) {
            claimsToCreate.push({
              number: claimNumber,
              text: claimText.trim(),
            });
          }
        });
      }
    }

    // Extract claims from inventionData before storing
    const { claims, ...inventionDataWithoutClaims } = inventionData;

    // Store invention and claims in a single transaction
    const invention = await inventionRepository.storeInventionAndClaims(
      projectId,
      userTenantId,
      inventionDataWithoutClaims,
      claimsToCreate
    );

    apiLogger.info('Successfully created invention and claims', {
      projectId,
      inventionId: invention.id,
      claimCount: claimsToCreate.length,
    });

    // Fetch the actual created claims with their database IDs
    const createdClaims = await ClaimRepository.findByInventionId(invention.id);

    res.status(200).json({
      success: true,
      inventionId: invention.id,
      message: 'Invention processed successfully',
      // Return the actual claims with their database IDs
      claims: createdClaims,
    });
  } catch (error) {
    apiLogger.error('Error processing invention', { error, projectId });
    throw error;
  }
}

// SECURITY: This endpoint is tenant-protected using project-based resolution
// Users can only process invention data for projects within their own tenant
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: querySchema,
      body: bodySchema,
    },
    rateLimit: 'api',
  }
);

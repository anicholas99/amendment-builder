import type { NextApiRequest, NextApiResponse } from 'next';
// import { TenantServerService } from '@/server/services/tenant.server.service';
// import { InventionDataService } from '@/server/services/invention-data.server-service';
import { OpenaiServerService } from '@/server/services/openai.server-service';
import { AuthenticatedRequest } from '@/types/middleware';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/server/logger';
import { analyzeInventionPrompt } from '@/server/prompts/prompts/analyzeInvention';
import { InventionData } from '@/types/invention';
import { ClaimRepository } from '@/repositories/claimRepository';
import { findProjectById } from '@/repositories/project';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { inventionRepository } from '@/repositories/inventionRepository';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const apiLogger = createApiLogger('process-invention');

// Validation schema for request body
const bodySchema = z.object({
  textInput: z.string().min(1, 'Text input is required'),
  uploadedFigures: z
    .array(
      z.object({
        id: z.string(),
        assignedNumber: z.union([z.number(), z.string()]), // Accept both numbers and strings for backward compatibility
        url: z.string(),
        fileName: z.string(),
      })
    )
    .optional(),
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
  let body: {
    textInput: string;
    uploadedFigures?: Array<{
      id: string;
      assignedNumber: number | string;
      url: string;
      fileName: string;
    }>;
  };
  try {
    body = bodySchema.parse(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      apiLogger.warn('Request validation failed', {
        errors: error.errors,
      });
      throw new ApplicationError(
        ErrorCode.VALIDATION_FAILED,
        'Invalid request: ' + error.errors.map(e => e.message).join(', ')
      );
    }
    throw error;
  }

  const { textInput } = body;

  // DEBUG: Log the incoming request body to see if uploadedFigures are being passed
  apiLogger.info('DEBUG: Processing invention request', {
    projectId,
    textInputLength: textInput.length,
    hasUploadedFigures: !!body.uploadedFigures,
    uploadedFiguresCount: body.uploadedFigures?.length || 0,
    uploadedFiguresData:
      body.uploadedFigures?.map(f => ({
        id: f.id,
        assignedNumber: f.assignedNumber,
        fileName: f.fileName,
        url: f.url,
      })) || [],
  });

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

  const userId = req.user!.id;

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
      max_tokens: 8000,
      response_format: { type: 'json_object' },
    });

    // Save raw GPT response to file for debugging (development only)
    if (process.env.NODE_ENV === 'development') {
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
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to parse AI response', {
        error: errorMessage,
        response: aiResponse.content.substring(0, 500) + '...', // Log first 500 chars
        responseLength: aiResponse.content.length,
      });
      throw new ApplicationError(
        ErrorCode.AI_INVALID_RESPONSE,
        `Failed to parse AI response: ${errorMessage}`
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

    // Auto-assign uploaded figures to figure slots
    if (body.uploadedFigures && body.uploadedFigures.length > 0) {
      apiLogger.info('Auto-assigning uploaded figures to figure slots', {
        projectId,
        uploadedFigureCount: body.uploadedFigures.length,
      });

      const { bulkAssignFiguresToSlots } = await import(
        '@/repositories/figure'
      );

      // Build assignment mapping based on user's order - don't wait for AI structured figures
      // First pass: collect all assigned numbers and find duplicates
      // Convert string figure numbers to their numeric base for duplicate detection
      const assignedNumbers = body.uploadedFigures.map(f => {
        if (typeof f.assignedNumber === 'string') {
          // Extract numeric part from strings like "1A", "2B", etc.
          const match = f.assignedNumber.match(/^(\d+)/);
          return match ? parseInt(match[1], 10) : 1;
        }
        return f.assignedNumber;
      });

      const numberCounts = new Map<number, number>();

      // Count occurrences of each assigned number
      assignedNumbers.forEach(num => {
        numberCounts.set(num, (numberCounts.get(num) || 0) + 1);
      });

      // Find the highest assigned number to start placing duplicates after
      const maxAssignedNumber = Math.max(...assignedNumbers);
      let nextAvailableNumber = maxAssignedNumber + 1;

      // Track which numbers have been used for the first occurrence
      const usedNumbers = new Set<number>();

      const assignments = body.uploadedFigures
        .map(uploadedFigure => {
          let targetFigureKey: string;

          // Convert the assigned number to numeric for duplicate detection
          const numericAssignedNumber =
            typeof uploadedFigure.assignedNumber === 'string'
              ? parseInt(
                  uploadedFigure.assignedNumber.match(/^(\d+)/)?.[0] || '1',
                  10
                )
              : uploadedFigure.assignedNumber;

          // If this is the first occurrence of this numeric base, use the original format
          if (!usedNumbers.has(numericAssignedNumber)) {
            // Use the original assigned number format (preserve "1A", "1B", etc.)
            targetFigureKey = `FIG. ${uploadedFigure.assignedNumber}`;
            usedNumbers.add(numericAssignedNumber);
          } else {
            // This is a duplicate, assign it to the next available number at the end
            targetFigureKey = `FIG. ${nextAvailableNumber++}`;
          }

          // Extract the figure ID from the URL pattern
          const match = uploadedFigure.url.match(
            /figures\/([a-zA-Z0-9-]+)\/download/
          );
          const uploadedFigureId = match?.[1];

          apiLogger.info(
            'DEBUG: Processing uploaded figure for direct assignment',
            {
              uploadedFigure: {
                id: uploadedFigure.id,
                assignedNumber: uploadedFigure.assignedNumber,
                fileName: uploadedFigure.fileName,
                url: uploadedFigure.url,
              },
              targetFigureKey,
              extractedFigureId: uploadedFigureId,
              isDuplicate:
                targetFigureKey !== `FIG. ${uploadedFigure.assignedNumber}`,
              preservedAlphanumeric:
                typeof uploadedFigure.assignedNumber === 'string',
            }
          );

          if (!uploadedFigureId) {
            apiLogger.warn('Could not extract figure ID from URL', {
              url: uploadedFigure.url,
              assignedNumber: uploadedFigure.assignedNumber,
            });
            return null;
          }

          return {
            uploadedFigureId,
            targetFigureKey,
            originalNumber: uploadedFigure.assignedNumber,
            finalFigureKey: targetFigureKey,
          };
        })
        .filter(Boolean) as Array<{
        uploadedFigureId: string;
        targetFigureKey: string;
        originalNumber: string | number;
        finalFigureKey: string;
      }>;

      // Log any duplicate assignments that were resolved
      const duplicateAdjustments = assignments.filter(
        assignment =>
          assignment.targetFigureKey !== `FIG. ${assignment.originalNumber}`
      );

      if (duplicateAdjustments.length > 0) {
        apiLogger.info(
          'Resolved duplicate figure key assignments - moved to end of sequence',
          {
            projectId,
            duplicateCount: duplicateAdjustments.length,
            maxOriginalNumber: maxAssignedNumber,
            adjustments: duplicateAdjustments.map(assignment => ({
              originalKey: `FIG. ${assignment.originalNumber}`,
              adjustedKey: assignment.targetFigureKey,
              reason: 'Duplicate - moved to end',
            })),
          }
        );
      }

      apiLogger.info('DEBUG: Direct assignments to process', {
        projectId,
        assignmentsCount: assignments.length,
        assignments: assignments.map(a => ({
          targetFigureKey: a.targetFigureKey,
          uploadedFigureId: a.uploadedFigureId,
        })),
      });

      if (assignments.length > 0) {
        try {
          const assignedFigures = await bulkAssignFiguresToSlots(
            assignments,
            userId,
            userTenantId,
            projectId
          );

          apiLogger.info('Successfully bulk assigned figures to slots', {
            projectId,
            assignedCount: assignedFigures.length,
            totalSubmitted: assignments.length,
            assignments: assignments.map(a => ({
              targetFigureKey: a.targetFigureKey,
              uploadedFigureId: a.uploadedFigureId,
            })),
          });
        } catch (error) {
          apiLogger.error('Failed to bulk assign figures', {
            projectId,
            assignments,
            error,
          });
          // Don't fail the entire request if figure assignment fails
        }
      } else {
        apiLogger.warn('DEBUG: No valid assignments to process', {
          projectId,
          originalUploadedFiguresCount: body.uploadedFigures!.length,
        });
      }
    } else {
      apiLogger.info('DEBUG: No uploaded figures to process', {
        projectId,
        hasUploadedFigures: !!body.uploadedFigures,
        uploadedFiguresLength: body.uploadedFigures?.length || 0,
      });
    }

    // Fetch the actual created claims with their database IDs
    const createdClaims = await ClaimRepository.findByInventionId(invention.id);

    // Update the project to indicate it has processed invention
    if (prisma) {
      await prisma.project.update({
        where: { id: projectId },
        data: { hasProcessedInvention: true },
      });
      apiLogger.info('Updated hasProcessedInvention flag to true', {
        projectId,
      });
    }

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

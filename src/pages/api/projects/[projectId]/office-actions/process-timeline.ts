/**
 * Process Timeline Office Action API Endpoint
 * 
 * Creates an Office Action record from a ProjectDocument and initiates processing
 * for amendment response workflow.
 */

import { NextApiResponse } from 'next';
import { z } from 'zod';
import { promises as fs } from 'fs';
import { BlobServiceClient } from '@azure/storage-blob';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { AuthenticatedRequest } from '@/types/middleware';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { apiResponse } from '@/utils/api/responses';
import { logger } from '@/server/logger';
import { prisma } from '@/lib/prisma';
import { env } from '@/config/env';
import { StorageServerService } from '@/server/services/storage.server-service';
import { AmendmentServerService } from '@/server/services/amendment.server-service';

// ============ VALIDATION SCHEMAS ============

const requestSchema = z.object({
  projectDocumentId: z.string().uuid('Invalid project document ID'),
});

// ============ HANDLER ============

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  logger.info('[process-timeline] Processing timeline office action', {
    method: req.method,
    projectId: req.query.projectId,
  });

  if (req.method !== 'POST') {
    throw new ApplicationError(
      ErrorCode.VALIDATION_FAILED,
      `Method ${req.method} not allowed`
    );
  }

  try {
    const { projectId } = req.query as { projectId: string };
    const { projectDocumentId } = requestSchema.parse(req.body);
    const { id: userId, tenantId } = req.user!;

    if (!tenantId) {
      throw new ApplicationError(
        ErrorCode.TENANT_NOT_FOUND,
        'Tenant context is required'
      );
    }

    logger.info('[process-timeline] Starting office action creation from project document', {
      projectId,
      projectDocumentId,
    });

    // 1. Get the ProjectDocument with minimal fields to avoid type issues
    const projectDocument = await prisma?.projectDocument.findFirst({
      where: {
        id: projectDocumentId,
        projectId,
      },
    });

    if (!projectDocument) {
      throw new ApplicationError(
        ErrorCode.INVALID_INPUT,
        'Project document not found'
      );
    }

    // 2. Extract blob name from storage URL
    const urlParts = projectDocument.storageUrl.split('/');
    const blobName = urlParts[urlParts.length - 1];

    // 3. Create Office Action record (use any to bypass type issues for now)
    const officeAction = await (prisma as any)?.officeAction.create({
      data: {
        projectId,
        tenantId,
        applicationNumber: (projectDocument as any).applicationNumber || null,
        blobName: blobName,
        originalFileName: projectDocument.originalName,
        mimeType: 'application/pdf',
        status: 'UPLOADED',
        extractedText: projectDocument.extractedText,
        parsedJson: JSON.stringify({
          source: 'timeline',
          projectDocumentId: projectDocument.id,
        }),
      },
    });

    logger.info('[process-timeline] Created Office Action record', {
      officeActionId: officeAction.id,
      hasExistingText: !!projectDocument.extractedText,
    });

    // 4. Extract text if needed using fallback method
    let extractedText = projectDocument.extractedText || '';
    
    if (!extractedText || extractedText.trim().length < 50) {
      logger.info('[process-timeline] Extracting text from PDF', {
        officeActionId: officeAction.id,
      });

      try {
        // Download from blob storage
        const blobServiceClient = BlobServiceClient.fromConnectionString(
          env.AZURE_STORAGE_CONNECTION_STRING!
        );
        const containerClient = blobServiceClient.getContainerClient('office-actions-private');
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Download to temp file
        const tempFilePath = `/tmp/oa-${officeAction.id}-${Date.now()}.pdf`;
        await blockBlobClient.downloadToFile(tempFilePath);
        
        // Create a formidable-like file object for the existing extraction service
        const fileObject = {
          filepath: tempFilePath,
          originalFilename: projectDocument.originalName,
          mimetype: 'application/pdf',
          size: 0,
        } as any;
        
        // Extract text using the robust existing service
        extractedText = await StorageServerService.extractTextFromFile(fileObject);
        
        // Clean up
        await fs.unlink(tempFilePath);

        // Update both records with extracted text
        await Promise.all([
          (prisma as any).officeAction.update({
            where: { id: officeAction.id },
            data: { extractedText },
          }),
          (prisma as any).projectDocument.update({
            where: { id: projectDocumentId },
            data: { extractedText },
          }),
        ]);
      } catch (extractionError) {
        logger.warn('[process-timeline] Text extraction failed, continuing with placeholder', {
          error: extractionError instanceof Error ? extractionError.message : String(extractionError),
        });
        extractedText = '[Text extraction failed - manual review required]';
      }
    }

    // 5. Trigger parsing
    logger.info('[process-timeline] Triggering Office Action parsing', {
      officeActionId: officeAction.id,
      textLength: extractedText.length,
    });

    try {
      await AmendmentServerService.parseOfficeAction(
        officeAction.id,
        extractedText,
        tenantId
      );
    } catch (parseError) {
      // Don't fail the whole process if parsing fails
      logger.warn('[process-timeline] Office Action parsing failed', {
        officeActionId: officeAction.id,
        error: parseError instanceof Error ? parseError.message : String(parseError),
      });
    }

    // 6. Create amendment project directly
    logger.info('[process-timeline] Creating amendment project', {
      officeActionId: officeAction.id,
      projectId,
    });

    const amendmentProject = await (prisma as any).amendmentProject.create({
      data: {
        officeActionId: officeAction.id,
        projectId,
        tenantId,
        userId,
        name: `Response to Office Action - ${new Date().toLocaleDateString()}`,
        status: 'DRAFT',
        responseType: 'AMENDMENT',
      },
    });

    logger.info('[process-timeline] Office Action processing completed', {
      officeActionId: officeAction.id,
      amendmentProjectId: amendmentProject.id,
    });

    return apiResponse.ok(res, {
      success: true,
      officeActionId: officeAction.id,
      amendmentProjectId: amendmentProject.id,
      processed: true,
    });

  } catch (error) {
    logger.error('[process-timeline] Failed to process office action', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    if (error instanceof ApplicationError) {
      throw error;
    }
    
    throw new ApplicationError(
      ErrorCode.INTERNAL_ERROR,
      'Failed to process timeline Office Action'
    );
  }
}

// ============ EXPORT WITH SECURITY ============

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    rateLimit: 'standard' as any,
    validate: {
      body: requestSchema,
    },
  }
);
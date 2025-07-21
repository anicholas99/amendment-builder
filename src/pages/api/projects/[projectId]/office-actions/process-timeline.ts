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
import { AuthenticatedRequest } from '@/types/api';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { apiResponse } from '@/utils/api/responses';
import { logger } from '@/server/logger';
import { prisma } from '@/lib/prisma';
import { env } from '@/config/env';
import { EnhancedTextExtractionService } from '@/server/services/enhanced-text-extraction.server-service';
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

    // 1. Get the ProjectDocument
    const projectDocument = await prisma.projectDocument.findFirst({
      where: {
        id: projectDocumentId,
        projectId,
      },
      select: {
        id: true,
        storageUrl: true,
        fileName: true,
        originalName: true,
        applicationNumber: true,
        extractedText: true,
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

    // 3. Create Office Action record
    const officeAction = await prisma.officeAction.create({
      data: {
        projectId,
        tenantId,
        applicationNumber: projectDocument.applicationNumber,
        blobName: blobName,
        originalFileName: projectDocument.originalName,
        mimeType: 'application/pdf',
        status: 'UPLOADED',
        extractedText: projectDocument.extractedText, // Use existing text if available
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

    // 4. Extract text if not already done
    let extractedText = projectDocument.extractedText || '';
    
    if (!extractedText || extractedText.trim().length < 50) {
      logger.info('[process-timeline] Extracting text from PDF', {
        officeActionId: officeAction.id,
      });

      // Download from blob storage
      const blobServiceClient = BlobServiceClient.fromConnectionString(
        env.AZURE_STORAGE_CONNECTION_STRING!
      );
      const containerClient = blobServiceClient.getContainerClient('uspto-documents-private');
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Download to temp file
      const tempFilePath = `/tmp/oa-${officeAction.id}-${Date.now()}.pdf`;
      await blockBlobClient.downloadToFile(tempFilePath);
      
      // Extract text
      extractedText = await EnhancedTextExtractionService.extractTextFromFile({
        filepath: tempFilePath,
        originalFilename: projectDocument.originalName,
        mimetype: 'application/pdf',
        size: 0,
        newFilename: `oa-${officeAction.id}.pdf`,
      } as any);
      
      // Clean up
      await fs.unlink(tempFilePath);

      // Update both records with extracted text
      await Promise.all([
        prisma.officeAction.update({
          where: { id: officeAction.id },
          data: { extractedText },
        }),
        prisma.projectDocument.update({
          where: { id: projectDocumentId },
          data: { extractedText },
        }),
      ]);
    }

    // 5. Trigger parsing
    logger.info('[process-timeline] Triggering Office Action parsing', {
      officeActionId: officeAction.id,
      textLength: extractedText.length,
    });

    await AmendmentServerService.parseOfficeAction(
      officeAction.id,
      extractedText,
      tenantId
    );

    // 6. Wait for or create amendment project
    let amendmentProject = null;
    let attempts = 0;
    const maxAttempts = 20; // 20 seconds max wait
    
    while (!amendmentProject && attempts < maxAttempts) {
      amendmentProject = await prisma.amendmentProject.findFirst({
        where: {
          officeActionId: officeAction.id,
          projectId,
        },
        select: {
          id: true,
          status: true,
        },
      });

      if (!amendmentProject) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }
    }

    // If no amendment project after waiting, create one
    if (!amendmentProject) {
      logger.info('[process-timeline] Creating amendment project directly', {
        officeActionId: officeAction.id,
        projectId,
      });

      amendmentProject = await prisma.amendmentProject.create({
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
    }

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
    rateLimit: {
      max: 20,
      windowMs: 5 * 60 * 1000, // 5 minutes
    },
    validate: {
      body: requestSchema,
    },
  }
);
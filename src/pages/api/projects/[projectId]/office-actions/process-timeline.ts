/**
 * Process Timeline Office Action API Endpoint
 * 
 * Handles processing of USPTO-synced Office Actions from timeline:
 * - Downloads PDF from USPTO if not already downloaded
 * - Performs OCR if text not extracted
 * - Triggers parsing and orchestration
 * - Returns amendment project ID for navigation
 */

import { NextApiResponse } from 'next';
import { z } from 'zod';
import { promises as fs } from 'fs';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { AuthenticatedRequest } from '@/types/api';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { apiResponse } from '@/utils/api/responses';
import { logger } from '@/server/logger';
import { prisma } from '@/lib/prisma';
import { EnhancedTextExtractionService } from '@/server/services/enhanced-text-extraction.server-service';
import { AmendmentServerService } from '@/server/services/amendment.server-service';
import { StorageServerService } from '@/server/services/storage.server-service';


// ============ VALIDATION SCHEMAS ============

const requestSchema = z.object({
  officeActionId: z.string().uuid('Invalid office action ID'),
  timelineEventId: z.string().optional(), // Optional timeline event ID for additional context
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
    const { officeActionId, timelineEventId } = requestSchema.parse(req.body);
    const { id: userId, tenantId } = req.user!;

    if (!tenantId) {
      throw new ApplicationError(
        ErrorCode.TENANT_NOT_FOUND,
        'Tenant context is required'
      );
    }

    logger.info('[process-timeline] Processing timeline office action', {
      projectId,
      officeActionId,
      timelineEventId,
    });

    // 1. Check if Office Action exists and needs processing
    const officeAction = await prisma.officeAction.findUnique({
      where: { id: officeActionId },
      select: {
        id: true,
        extractedText: true,
        parsedJson: true,
        status: true,
        blobName: true,
        tenantId: true,
        projectId: true,
      },
    });

    if (!officeAction) {
      // Create Office Action record from timeline data if it doesn't exist
      logger.info('[process-timeline] Office Action not found, creating from timeline data', {
        officeActionId,
      });

      // Check if there's already a ProjectDocument for this office action
      const projectDocument = await prisma.projectDocument.findFirst({
        where: {
          projectId,
          id: timelineEventId, // Timeline events use document ID
        },
        select: {
          id: true,
          blobName: true,
          fileName: true,
          originalName: true,
          mimeType: true,
          sizeBytes: true,
          applicationNumber: true,
        },
      });

      if (!projectDocument?.blobName) {
        throw new ApplicationError(
          ErrorCode.INVALID_INPUT,
          'Office Action document not found in project storage'
        );
      }

      // Create Office Action record linked to existing document
      const newOfficeAction = await prisma.officeAction.create({
        data: {
          id: officeActionId,
          projectId,
          tenantId,
          applicationNumber: projectDocument.applicationNumber,
          blobName: projectDocument.blobName,
          originalFileName: projectDocument.originalName,
          mimeType: projectDocument.mimeType || 'application/pdf',
          sizeBytes: projectDocument.sizeBytes || 0,
          status: 'UPLOADED',
          parsedJson: JSON.stringify({
            source: 'timeline',
            projectDocumentId: projectDocument.id,
          }),
        },
      });
      
      logger.info('[process-timeline] Created Office Action record from timeline', {
        officeActionId: newOfficeAction.id,
        projectDocumentId: projectDocument.id,
      });
    }

    // 2. Check if text extraction is needed
    let needsProcessing = false;
    let extractedText = officeAction?.extractedText || '';

    if (!officeAction?.extractedText || officeAction.extractedText.trim().length < 50) {
      needsProcessing = true;
      logger.info('[process-timeline] Office Action needs text extraction', {
        officeActionId,
        currentTextLength: officeAction?.extractedText?.length || 0,
      });

      // Download PDF from USPTO if needed
      if (!officeAction?.blobName) {
        const parsedData = officeAction?.parsedJson ? 
          JSON.parse(officeAction.parsedJson as string) : {};
        
        const pdfUrl = parsedData.pdfUrl;
        if (!pdfUrl) {
          throw new ApplicationError(
            ErrorCode.INVALID_INPUT,
            'No PDF URL available for USPTO download'
          );
        }

        logger.info('[process-timeline] Downloading Office Action from USPTO', {
          officeActionId,
          pdfUrl,
        });

        // Download PDF from USPTO
        const pdfResponse = await fetch(pdfUrl, {
          headers: {
            'User-Agent': 'PatentDrafterAI/1.0',
          },
        });

        if (!pdfResponse.ok) {
          throw new ApplicationError(
            ErrorCode.EXTERNAL_SERVICE_ERROR,
            `Failed to download from USPTO: ${pdfResponse.statusText}`
          );
        }

        const pdfBuffer = await pdfResponse.arrayBuffer();
        const pdfFile = {
          filepath: `/tmp/oa-${officeActionId}.pdf`,
          originalFilename: `office-action-${parsedData.documentId}.pdf`,
          mimetype: 'application/pdf',
          size: pdfBuffer.byteLength,
          newFilename: `oa-${officeActionId}.pdf`,
        } as any;

        // Write buffer to temp file for processing
        await fs.writeFile(pdfFile.filepath, Buffer.from(pdfBuffer));

        // Upload to blob storage
        const uploadResult = await StorageServerService.uploadOfficeActionDocument(
          pdfFile,
          { userId, tenantId }
        );

        // Update Office Action with blob info
        await prisma.officeAction.update({
          where: { id: officeActionId },
          data: {
            blobName: uploadResult.blobName,
            originalFileName: uploadResult.fileName,
            mimeType: uploadResult.mimeType,
            sizeBytes: uploadResult.size,
          },
        });

        // Extract text using enhanced OCR
        extractedText = await EnhancedTextExtractionService.extractTextFromFile(pdfFile);
        
        // Clean up temp file
        await fs.unlink(pdfFile.filepath);

      } else {
        // File exists in storage, just extract text
        const tempFile = await StorageServerService.downloadToTempFile(
          officeAction.blobName,
          'office-action'
        );
        
        extractedText = await EnhancedTextExtractionService.extractTextFromFile({
          filepath: tempFile.path,
          originalFilename: tempFile.originalName,
          mimetype: 'application/pdf',
          size: 0,
          newFilename: tempFile.filename,
        } as any);
        
        // Clean up temp file
        await fs.unlink(tempFile.path);
      }

      // Update Office Action with extracted text
      await prisma.officeAction.update({
        where: { id: officeActionId },
        data: {
          extractedText,
          status: 'UPLOADED',
        },
      });
    }

    // 3. Trigger parsing if needed
    if (needsProcessing || officeAction?.status === 'UPLOADED') {
      logger.info('[process-timeline] Triggering Office Action parsing', {
        officeActionId,
        textLength: extractedText.length,
      });

      await AmendmentServerService.parseOfficeAction(
        officeActionId,
        extractedText,
        tenantId
      );
    }

    // 4. Wait for amendment project to be created (orchestration runs async)
    let amendmentProject = null;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max wait
    
    while (!amendmentProject && attempts < maxAttempts) {
      amendmentProject = await prisma.amendmentProject.findFirst({
        where: {
          officeActionId,
          projectId,
        },
        select: {
          id: true,
          status: true,
        },
      });

      if (!amendmentProject) {
        // Wait 1 second before checking again
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }
    }

    // If no amendment project after waiting, create one directly
    if (!amendmentProject) {
      logger.info('[process-timeline] Creating amendment project directly', {
        officeActionId,
        projectId,
      });

      amendmentProject = await prisma.amendmentProject.create({
        data: {
          officeActionId,
          projectId,
          tenantId,
          userId,
          name: `Response to Office Action - ${new Date().toLocaleDateString()}`,
          status: 'DRAFT',
          responseType: 'AMENDMENT',
        },
      });
    }

    logger.info('[process-timeline] Timeline Office Action processed successfully', {
      officeActionId,
      amendmentProjectId: amendmentProject.id,
      processed: needsProcessing,
    });

    return apiResponse.ok(res, {
      success: true,
      amendmentProjectId: amendmentProject.id,
      processed: needsProcessing,
    });

  } catch (error) {
    logger.error('[process-timeline] Timeline Office Action processing failed', {
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
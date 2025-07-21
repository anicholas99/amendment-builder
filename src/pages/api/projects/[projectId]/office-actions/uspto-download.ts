import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { AuthenticatedRequest } from '@/types/api';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { USPTO_CONFIG } from '@/config/uspto';
import { StorageServerService } from '@/server/services/storage.server-service';
import { prisma } from '@/lib/prisma';

const requestSchema = z.object({
  documentId: z.string().min(1),
  documentCode: z.string().min(1),
  mailRoomDate: z.string(),
  documentDescription: z.string().optional(),
});

type RequestBody = z.infer<typeof requestSchema>;

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { documentId, documentCode, mailRoomDate, documentDescription } = req.body as RequestBody;
    const { projectId } = req.query as { projectId: string };
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;

    // Find the existing document record by USPTO document ID
    const existingDoc = await prisma.projectDocument.findFirst({
      where: {
        projectId,
        OR: [
          { extractedMetadata: { contains: `"documentId":"${documentId}"` } },
          { extractedMetadata: { contains: `"usptoDocumentId":"${documentId}"` } },
          { extractedMetadata: { contains: `"documentIdentifier":"${documentId}"` } }
        ]
      }
    });

    if (!existingDoc) {
      throw new ApplicationError(
        ErrorCode.NOT_FOUND,
        'Document record not found. Please sync USPTO data first.',
        404
      );
    }

    // Check if already has a storage URL (already downloaded)
    if (existingDoc.storageUrl && existingDoc.storageUrl.startsWith('/api/')) {
      logger.info('[USPTO Download] Document already downloaded', { 
        projectId,
        documentId,
        storageUrl: existingDoc.storageUrl
      });
      return res.status(200).json({ 
        message: 'Document already downloaded',
        document: existingDoc 
      });
    }

    // Get applicationNumber from patent application
    const patentApp = await prisma.patentApplication.findUnique({
      where: { projectId },
      select: { applicationNumber: true }
    });

    if (!patentApp || !patentApp.applicationNumber) {
      // Try to get from an existing USPTO document
      const usptoDoc = await prisma.projectDocument.findFirst({
        where: {
          projectId,
          fileType: 'uspto-document',
          applicationNumber: { not: null }
        },
        select: {
          applicationNumber: true
        }
      });

      if (!usptoDoc || !usptoDoc.applicationNumber) {
        throw new ApplicationError(
          ErrorCode.INVALID_INPUT,
          'No USPTO application number found for this project. Please sync USPTO data first.',
          400
        );
      }
    }

    const applicationNumber = patentApp?.applicationNumber || 
      (await prisma.projectDocument.findFirst({
        where: {
          projectId,
          fileType: 'uspto-document',
          applicationNumber: { not: null }
        },
        select: {
          applicationNumber: true
        }
      }))?.applicationNumber;

    if (!applicationNumber) {
      throw new ApplicationError(
        ErrorCode.INVALID_INPUT,
        'Application number not found for project',
        400
      );
    }

    // Clean application number for USPTO API (remove formatting)
    const cleanAppNumber = applicationNumber.replace(/[^0-9]/g, '');
    
    // Debug API key configuration
    logger.info('[USPTO Download] API Key check', {
      hasApiKey: !!USPTO_CONFIG.API_KEY,
      apiKeyLength: USPTO_CONFIG.API_KEY?.length || 0,
      apiKeyFirstChars: USPTO_CONFIG.API_KEY?.substring(0, 4) || 'none',
      envVarExists: !!process.env.USPTO_ODP_API_KEY,
      envVarLength: process.env.USPTO_ODP_API_KEY?.length || 0
    });
    
    // Download PDF from USPTO
    logger.info('[USPTO Download] Downloading document', { 
      applicationNumber, 
      cleanAppNumber,
      documentId,
      projectId 
    });
    
    const downloadUrl = `https://api.uspto.gov/api/v1/download/applications/${cleanAppNumber}/${documentId}.pdf`;
    // Log the exact request being made
    logger.info('[USPTO Download] Making request', {
      url: downloadUrl,
      hasApiKey: !!USPTO_CONFIG.API_KEY,
      apiKeyValue: USPTO_CONFIG.API_KEY ? `${USPTO_CONFIG.API_KEY.substring(0, 4)}...` : 'missing'
    });
    
    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'X-API-KEY': USPTO_CONFIG.API_KEY,
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      logger.error('[USPTO Download] USPTO API error', {
        status: response.status,
        statusText: response.statusText,
        url: downloadUrl,
        hasApiKey: !!USPTO_CONFIG.API_KEY,
        apiKeyLength: USPTO_CONFIG.API_KEY?.length || 0
      });
      
      if (response.status === 403) {
        throw new ApplicationError(
          ErrorCode.EXTERNAL_SERVICE_ERROR,
          'USPTO API access denied. Please check API key configuration.'
        );
      }
      
      throw new ApplicationError(
        ErrorCode.EXTERNAL_SERVICE_ERROR,
        `Failed to download USPTO document: ${response.status}`
      );
    }

    const contentLength = response.headers.get('content-length');
    const fileBuffer = Buffer.from(await response.arrayBuffer());
    
    // Generate filename
    const fileName = `USPTO_${documentCode}_${mailRoomDate.replace(/\//g, '-')}_${documentId}.pdf`;
    
    // Upload to Azure Blob Storage
    logger.info('[USPTO Download] Uploading to blob storage', { 
      fileName, 
      size: fileBuffer.length,
      projectId 
    });
    
    // Save to a temporary file for the storage service
    const os = await import('os');
    const path = await import('path');
    const tmpDir = os.tmpdir();
    const tmpFilePath = path.join(tmpDir, `uspto-${Date.now()}-${fileName}`);
    const fs = await import('fs').then(m => m.promises);
    await fs.writeFile(tmpFilePath, fileBuffer);
    
    // Create a formidable.File object
    const fileObject = {
      filepath: tmpFilePath,
      originalFilename: fileName,
      mimetype: 'application/pdf',
      size: fileBuffer.length,
    } as any;
    
    let uploadResult;
    try {
      uploadResult = await StorageServerService.uploadOfficeActionDocument(
        fileObject,
        {
          userId,
          tenantId,
        }
      );
    } finally {
      // Clean up temp file
      try {
        await fs.unlink(tmpFilePath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    
    // Create the proper view URL for the document
    const storageUrl = `/api/projects/${projectId}/documents/${existingDoc.id}/view`;

    // Update the existing document record with the downloaded PDF info
    const projectDocument = await prisma.projectDocument.update({
      where: { id: existingDoc.id },
      data: {
        storageUrl,
        fileName,
        // Merge the existing metadata with download info
        extractedMetadata: JSON.stringify({
          ...JSON.parse(existingDoc.extractedMetadata || '{}'),
          downloadedAt: new Date().toISOString(),
          blobName: uploadResult.blobName,
          fileSize: uploadResult.size,
          source: 'USPTO_API_DOWNLOAD'
        }),
        // Store the blob name separately for the view endpoint
        originalName: fileName,
        // Mark the actual blob location
        extractedText: `blob:${uploadResult.blobName}`, // Temporary storage of blob reference
        updatedAt: new Date(),
      },
    });

    logger.info('[USPTO Download] Document downloaded successfully', { 
      documentId: projectDocument.id,
      usptoDocumentId: documentId,
      projectId 
    });

    return res.status(200).json({
      message: 'Document downloaded successfully',
      document: projectDocument
    });

  } catch (error) {
    logger.error('[USPTO Download] Error downloading document', {
      error,
      projectId: req.query.projectId,
      documentId: req.body?.documentId
    });
    
    if (error instanceof ApplicationError) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ 
      error: 'Failed to download USPTO document' 
    });
  }
}

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  { 
    rateLimit: 'standard',
    validate: { body: requestSchema }
  }
);
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { AuthenticatedRequest } from '@/types/api';
import { projectDocumentRepository } from '@/repositories/projectDocumentRepository';
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

    // Check if document already exists
    const existingDoc = await projectDocumentRepository.findByUSPTOIdentifier(projectId, documentId);
    if (existingDoc) {
      logger.info('[USPTO Download] Document already downloaded', { 
        projectId,
        documentId 
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
    
    // Create a File-like object for the storage service
    const fileObject = {
      originalname: fileName,
      mimetype: 'application/pdf',
      buffer: fileBuffer,
      size: fileBuffer.length,
    } as Express.Multer.File;
    
    const uploadResult = await StorageServerService.uploadOfficeActionDocument(
      fileObject,
      {
        userId,
        tenantId,
      }
    );
    
    const storageUrl = uploadResult.url;

    // Create ProjectDocument record
    const projectDocument = await projectDocumentRepository.create({
      project: { connect: { id: projectId } },
      fileName,
      originalName: fileName,
      fileType: 'office-action',
      storageUrl,
      applicationNumber,
      extractedMetadata: JSON.stringify({
        usptoDocumentId: documentId,
        usptoApplicationNumber: applicationNumber,
        documentCode,
        mailRoomDate,
        documentDescription,
        downloadedAt: new Date().toISOString(),
        source: 'USPTO_API'
      }),
      uploader: { connect: { id: userId } },
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
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { SecurePresets } from '@/middleware/securePresets';
import { TenantResolvers } from '@/middleware/tenantResolvers';
import { createServiceContext } from '@/lib/serviceContext';
import { StorageService } from '@/services/storage.service';
import { projectDocumentRepository } from '@/repositories/projectDocumentRepository';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { USPTO_CONFIG } from '@/config/uspto';

const requestSchema = z.object({
  applicationNumber: z.string().min(1),
  documentId: z.string().min(1),
  documentCode: z.string().min(1),
  mailRoomDate: z.string(),
  documentDescription: z.string().optional(),
});

type RequestBody = z.infer<typeof requestSchema>;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { applicationNumber, documentId, documentCode, mailRoomDate, documentDescription } = req.body as RequestBody;
    const { projectId } = req.query as { projectId: string };
    const context = await createServiceContext(req, res);
    
    // Initialize services
    const storageService = new StorageService(context);

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

    // Download PDF from USPTO
    logger.info('[USPTO Download] Downloading document', { 
      applicationNumber, 
      documentId,
      projectId 
    });
    
    const downloadUrl = `https://api.uspto.gov/api/v1/download/applications/${applicationNumber}/${documentId}.pdf`;
    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'X-API-KEY': USPTO_CONFIG.API_KEY,
      },
      redirect: 'follow',
    });

    if (!response.ok) {
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
    
    const storageUrl = await storageService.uploadOfficeAction(
      projectId,
      fileName,
      fileBuffer,
      'application/pdf'
    );

    // Create ProjectDocument record
    const projectDocument = await projectDocumentRepository.create({
      project: { connect: { id: projectId } },
      fileName,
      originalName: fileName,
      fileType: 'office-action',
      storageUrl,
      extractedMetadata: JSON.stringify({
        usptoDocumentId: documentId,
        usptoApplicationNumber: applicationNumber,
        documentCode,
        mailRoomDate,
        documentDescription,
        downloadedAt: new Date().toISOString(),
        source: 'USPTO_API'
      }),
      uploader: { connect: { id: context.userId! } },
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
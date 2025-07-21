import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { AuthenticatedRequest } from '@/types/api';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { prisma } from '@/lib/prisma';
import { BlobServiceClient } from '@azure/storage-blob';
import { environment } from '@/config/environment';

const querySchema = z.object({
  projectId: z.string().uuid(),
  documentId: z.string().uuid(),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projectId, documentId } = querySchema.parse(req.query);
    const { tenantId } = req.user!;

    // Get the document
    const document = await prisma.projectDocument.findFirst({
      where: {
        id: documentId,
        projectId,
      },
    });

    if (!document) {
      throw new ApplicationError(
        ErrorCode.NOT_FOUND,
        'Document not found',
        404
      );
    }

    // Check if document has been downloaded
    if (!document.extractedText || !document.extractedText.startsWith('blob:')) {
      throw new ApplicationError(
        ErrorCode.NOT_FOUND,
        'Document has not been downloaded yet',
        404
      );
    }

    // Extract blob name from extractedText (temporary storage)
    const blobName = document.extractedText.replace('blob:', '');
    
    logger.info('[Document View] Serving document', {
      documentId,
      projectId,
      blobName,
    });

    // Get blob from storage
    const connectionString = environment.azure.storageConnectionString;
    if (!connectionString) {
      throw new ApplicationError(
        ErrorCode.CONFIG_MISSING,
        'Storage configuration missing'
      );
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient('office-actions-private');
    const blobClient = containerClient.getBlobClient(blobName);

    // Check if blob exists
    const exists = await blobClient.exists();
    if (!exists) {
      throw new ApplicationError(
        ErrorCode.NOT_FOUND,
        'Document file not found in storage',
        404
      );
    }

    // Get blob properties
    const properties = await blobClient.getProperties();
    
    // Set headers for inline PDF viewing
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${document.fileName}"`);
    if (properties.contentLength) {
      res.setHeader('Content-Length', properties.contentLength.toString());
    }
    
    // Cache headers
    res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour
    
    // Stream the PDF
    const downloadResponse = await blobClient.download();
    if (downloadResponse.readableStreamBody) {
      downloadResponse.readableStreamBody.pipe(res);
    } else {
      throw new ApplicationError(
        ErrorCode.EXTERNAL_SERVICE_ERROR,
        'Failed to stream document'
      );
    }

  } catch (error) {
    logger.error('[Document View] Error serving document', {
      error,
      projectId: req.query.projectId,
      documentId: req.query.documentId,
    });

    if (error instanceof ApplicationError) {
      return res.status(error.statusCode || 400).json({ error: error.message });
    }

    return res.status(500).json({ 
      error: 'Failed to load document' 
    });
  }
}

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  { 
    rateLimit: 'resource',
    validate: { query: querySchema }
  }
);
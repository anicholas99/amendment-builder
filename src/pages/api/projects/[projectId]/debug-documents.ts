import { NextApiRequest, NextApiResponse } from 'next';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const querySchema = z.object({
  projectId: z.string().uuid('Invalid project ID format'),
});

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectId } = querySchema.parse(req.query);

  try {
    // Get all USPTO documents for this project
    const documents = await prisma.projectDocument.findMany({
      where: {
        projectId,
        fileType: 'uspto-document',
      },
      take: 10,
    });

    // Parse metadata to show what's actually stored
    const parsedDocs = documents.map(doc => {
      let metadata = {};
      try {
        metadata = JSON.parse(doc.extractedMetadata || '{}');
      } catch (e) {
        // ignore
      }
      return {
        id: doc.id,
        fileName: doc.fileName,
        applicationNumber: doc.applicationNumber,
        metadata: {
          documentId: metadata.documentId,
          usptoDocumentId: metadata.usptoDocumentId,
          documentIdentifier: metadata.documentIdentifier,
          documentCode: metadata.documentCode,
          mailDate: metadata.mailDate,
        },
      };
    });

    return res.status(200).json({
      success: true,
      documents: parsedDocs,
      count: documents.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch documents',
    });
  }
}

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  { 
    rateLimit: 'standard',
    validate: { query: querySchema }
  }
);
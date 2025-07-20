import { NextApiRequest, NextApiResponse } from 'next';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';
import { isTimelineMilestone } from '@/constants/usptoDocumentCodes';
import { getDocumentDisplayConfig } from '@/features/amendment/config/prosecutionDocuments';

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
    // Get all USPTO documents for the project
    const documents = await prisma.projectDocument.findMany({
      where: {
        projectId,
        fileType: 'uspto-document',
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
    });

    // Parse and categorize documents
    const timeline = [];
    const filesDrawer = [];

    for (const doc of documents) {
      try {
        const metadata = JSON.parse(doc.extractedMetadata || '{}');
        const documentCode = metadata.documentCode || doc.originalName;
        const config = getDocumentDisplayConfig(documentCode);
        
        const docData = {
          id: doc.id,
          documentCode,
          title: config?.label || doc.extractedText || metadata.description || doc.originalName,
          date: metadata.mailDate ? new Date(metadata.mailDate) : doc.createdAt,
          category: metadata.category || config?.category,
          pdfUrl: doc.storageUrl,
          pageCount: metadata.pageCount,
          metadata: {
            ...metadata,
            description: config?.description || metadata.description,
          },
        };

        if (metadata.isTimelineMilestone || isTimelineMilestone(metadata.documentCode)) {
          timeline.push({
            ...docData,
            eventType: metadata.eventType,
          });
        } else {
          filesDrawer.push(docData);
        }
      } catch (parseError) {
        logger.warn('Failed to parse document metadata', {
          documentId: doc.id,
          error: parseError,
        });
      }
    }

    // Sort timeline by date
    timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Get office actions for additional context
    const officeActions = await prisma.officeAction.findMany({
      where: {
        projectId,
      },
      include: {
        summary: true,
        rejections: true,
      },
      orderBy: {
        dateIssued: 'asc',
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        timeline,
        filesDrawer,
        officeActions,
        stats: {
          totalDocuments: documents.length,
          timelineEvents: timeline.length,
          officeActionCount: officeActions.length,
        },
      },
    });
  } catch (error) {
    logger.error('Failed to fetch USPTO timeline', {
      projectId,
      error: error instanceof Error ? error.message : String(error),
    });
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch USPTO timeline',
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
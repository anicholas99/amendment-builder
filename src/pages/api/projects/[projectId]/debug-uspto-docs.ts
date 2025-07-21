import { NextApiRequest, NextApiResponse } from 'next';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
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
    // Get all USPTO documents for this project
    const documents = await prisma.projectDocument.findMany({
      where: {
        projectId,
        fileType: 'uspto-document',
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
    });

    // Debug each document
    const debugInfo = documents.map(doc => {
      let metadata = {};
      try {
        metadata = JSON.parse(doc.extractedMetadata || '{}');
      } catch (e) {
        metadata = { parseError: true };
      }

      const documentCode = metadata.documentCode || doc.originalName;
      const config = getDocumentDisplayConfig(documentCode);
      const isTimelineMilestoneCheck = isTimelineMilestone(documentCode);
      const metadataFlag = metadata.isTimelineMilestone;

      return {
        id: doc.id,
        fileName: doc.fileName,
        originalName: doc.originalName,
        documentCode,
        extractedText: doc.extractedText?.substring(0, 100) + '...',
        metadata: {
          documentCode: metadata.documentCode,
          mailDate: metadata.mailDate,
          isTimelineMilestone: metadata.isTimelineMilestone,
          documentId: metadata.documentId,
        },
        config: {
          hasConfig: !!config,
          label: config?.label,
          isTimeline: config?.isTimeline,
        },
        timelineChecks: {
          functionCheck: isTimelineMilestoneCheck,
          metadataFlag: metadataFlag,
          shouldShowInTimeline: metadataFlag || isTimelineMilestoneCheck,
        },
        isSpec: documentCode === 'SPEC',
      };
    });

    // Filter out SPEC documents specifically
    const specDocs = debugInfo.filter(doc => doc.isSpec);
    const timelineDocs = debugInfo.filter(doc => doc.timelineChecks.shouldShowInTimeline);

    return res.status(200).json({
      success: true,
      debug: {
        totalDocuments: documents.length,
        specDocuments: specDocs,
        timelineDocuments: timelineDocs.length,
        allDocuments: debugInfo,
      },
      summary: {
        hasSpecDocs: specDocs.length > 0,
        specDocsOnTimeline: specDocs.filter(doc => doc.timelineChecks.shouldShowInTimeline).length,
        functionWorksForSpec: isTimelineMilestone('SPEC'),
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to debug USPTO documents',
      details: error.message,
    });
  }
}

export default SecurePresets(TenantResolvers.fromProjectId())(handler); 
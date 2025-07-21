import { NextApiRequest, NextApiResponse } from 'next';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/server/logger';
import { fetchProsecutionHistory } from '@/lib/api/uspto/services/prosecutionHistoryService';
import { AuthenticatedRequest, RequestWithServices } from '@/types/middleware';
import { 
  isTimelineMilestone, 
  getEventType, 
  getDocumentCategory,
  ProsecutionEventType 
} from '@/constants/usptoDocumentCodes';

const SyncUSPTOSchema = z.object({
  applicationNumber: z.string().trim().min(1, 'Application number is required'),
});

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { projectId } = req.query;
  const authReq = req as AuthenticatedRequest & RequestWithServices;
  const { tenantId } = authReq.user!;
  
  if (typeof projectId !== 'string') {
    throw new ApplicationError(ErrorCode.INVALID_INPUT, 'Invalid project ID', 400);
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are accepted.',
    });
  }

  try {
    const { applicationNumber } = SyncUSPTOSchema.parse(req.body);
    
    logger.info('Starting USPTO sync', { 
      projectId, 
      applicationNumber,
      tenantId 
    });

    // First ensure we have a PatentApplication record
    const patentApp = await prisma.patentApplication.findUnique({
      where: { projectId }
    });

    if (!patentApp || patentApp.applicationNumber !== applicationNumber) {
      throw new ApplicationError(
        ErrorCode.PROJECT_NOT_FOUND,
        'Patent application not found or number mismatch', 
        404
      );
    }

    // Clean application number for USPTO API (remove formatting)
    const cleanAppNumber = applicationNumber.replace(/[^0-9]/g, '');
    
    // Fetch prosecution history from USPTO
    const prosecutionData = await fetchProsecutionHistory(cleanAppNumber);
    
    if (!prosecutionData || !prosecutionData.documents) {
      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        'Failed to fetch USPTO data', 
        500
      );
    }

    const { documents } = prosecutionData;
    
    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update patent application with basic info if available
      if (prosecutionData.applicationData) {
        await tx.patentApplication.update({
          where: { projectId },
          data: {
            title: prosecutionData.applicationData.title || patentApp.title,
            filingDate: prosecutionData.applicationData.filingDate 
              ? new Date(prosecutionData.applicationData.filingDate)
              : patentApp.filingDate,
            status: prosecutionData.applicationData.status || patentApp.status,
            updatedAt: new Date(),
          }
        });
      }

      // Store ALL documents in ProjectDocument table - this is the source of truth
      const storedDocuments = [];
      const timelineEvents = [];
      
      // Get all existing USPTO documents for this project in one query
      const existingDocs = await tx.projectDocument.findMany({
        where: {
          projectId,
          fileType: 'uspto-document',
        },
        select: {
          originalName: true,
          extractedMetadata: true,
        }
      });
      
      // Create a Set for faster lookups
      const existingDocSet = new Set(
        existingDocs.map(doc => {
          try {
            const metadata = JSON.parse(doc.extractedMetadata || '{}');
            return `${doc.originalName}_${metadata.documentId || metadata.mailDate || ''}`;
          } catch {
            return doc.originalName;
          }
        })
      );
      
      for (const doc of documents) {
        // Check if document already exists using the Set
        const docKey = `${doc.documentCode}_${doc.documentId || doc.mailDate || ''}`;
        
        if (!existingDocSet.has(docKey)) {
          // Store document with categorization
          const storedDoc = await tx.projectDocument.create({
            data: {
              projectId,
              fileName: `${doc.documentCode}_${doc.mailDate || 'undated'}.json`,
              originalName: doc.documentCode,
              fileType: 'uspto-document',
              storageUrl: doc.pdfUrl || '',
              extractedText: doc.description || '',
              extractedMetadata: JSON.stringify({
                documentId: doc.documentId,
                documentCode: doc.documentCode,
                category: getDocumentCategory(doc.documentCode),
                isTimelineMilestone: isTimelineMilestone(doc.documentCode),
                mailDate: doc.mailDate,
                pageCount: doc.pageCount,
                importance: doc.importance,
                usptoApplicationNumber: applicationNumber,
                rawData: doc,
              }),
              applicationNumber,
              uploadedBy: authReq.user!.id,
            }
          });
          storedDocuments.push(storedDoc);

          // Track timeline milestones for UI display
          if (isTimelineMilestone(doc.documentCode)) {
            const eventType = getEventType(doc.documentCode);
            if (eventType) {
              timelineEvents.push({
                documentId: storedDoc.id,
                documentCode: doc.documentCode,
                eventType,
                eventDate: doc.mailDate ? new Date(doc.mailDate) : new Date(),
                title: doc.description || doc.documentCode,
              });
            }
          }
        }
      }

      // Note: We store prosecution history in ProjectDocument records, not in the Project model
      // The timeline will read from ProjectDocument table as the source of truth

      return {
        documentsStored: storedDocuments.length,
        timelineEvents: timelineEvents.length,
        totalDocuments: documents.length,
      };
    }, {
      timeout: 30000, // 30 seconds timeout for large USPTO syncs
      maxWait: 30000, // Maximum time to wait for transaction to start
    });

    logger.info('USPTO sync completed', { 
      projectId, 
      applicationNumber,
      cleanAppNumber,
      documentsStored: result.documentsStored,
      timelineEvents: result.timelineEvents,
      totalDocuments: result.totalDocuments,
    });

    res.status(200).json({
      success: true,
      message: 'USPTO data synced successfully',
      stats: {
        documentsStored: result.documentsStored,
        timelineEvents: result.timelineEvents,
        totalDocuments: result.totalDocuments,
      }
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error in USPTO sync', {
      error: err,
      projectId,
    });
    throw error;
  }
}

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      body: SyncUSPTOSchema,
      method: 'POST',
    },
  }
);
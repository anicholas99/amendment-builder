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
    
    // Separate documents into categories
    const officeActionCodes = ['CTNF', 'CTFR', 'CTAV', 'CTSP', 'MCTNF'];
    const officeActions = documents.filter(doc => 
      doc.category === 'office-action' || 
      officeActionCodes.includes(doc.documentCode)
    );

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

      // Step 1: Store ALL documents in ProjectDocument table with categorization
      const storedDocuments = [];
      const timelineEvents = [];
      
      for (const doc of documents) {
        // Check if document already exists
        const existingDoc = await tx.projectDocument.findFirst({
          where: {
            projectId,
            originalName: doc.documentCode,
            fileType: 'uspto-document',
            extractedMetadata: {
              contains: doc.documentId || doc.mailDate || '',
            },
          }
        });

        if (!existingDoc) {
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
                rawData: doc,
              }),
              uploadedBy: authReq.user!.id,
            }
          });
          storedDocuments.push(storedDoc);

          // Track timeline milestones
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

      // Step 2: Create OfficeAction records for backward compatibility
      const createdOAs = [];
      for (const oaDoc of officeActions) {
        const existingOA = await tx.officeAction.findFirst({
          where: {
            projectId,
            oaNumber: oaDoc.documentCode,
            dateIssued: oaDoc.mailDate ? new Date(oaDoc.mailDate) : undefined,
          }
        });

        if (!existingOA) {
          const newOA = await tx.officeAction.create({
            data: {
              projectId,
              tenantId,
              oaNumber: oaDoc.documentCode,
              dateIssued: oaDoc.mailDate ? new Date(oaDoc.mailDate) : new Date(),
              originalFileName: oaDoc.description,
              status: 'COMPLETED',
              examinerRemarks: `${oaDoc.description} - ${oaDoc.documentCode}`,
              parsedJson: JSON.stringify({
                usptoDocument: oaDoc,
                category: oaDoc.category,
                importance: oaDoc.importance,
              }),
            }
          });
          createdOAs.push(newOA);

          // Create summary for the office action
          await tx.officeActionSummary.create({
            data: {
              officeActionId: newOA.id,
              summaryText: oaDoc.description || 'USPTO Office Action',
              keyIssues: JSON.stringify([]),
              rejectionBreakdown: JSON.stringify({}),
              totalClaimsRejected: 0,
              examinerTone: 'NEUTRAL',
              responseComplexity: 'MEDIUM',
            }
          });
        }
      }

      return {
        documentsStored: storedDocuments.length,
        timelineEvents: timelineEvents.length,
        officeActionsCreated: createdOAs.length,
        totalDocuments: documents.length,
      };
    });

    logger.info('USPTO sync completed', { 
      projectId, 
      applicationNumber,
      cleanAppNumber,
      documentsStored: result.documentsStored,
      timelineEvents: result.timelineEvents,
      officeActionsCreated: result.officeActionsCreated,
      totalDocuments: result.totalDocuments,
    });

    res.status(200).json({
      success: true,
      message: 'USPTO data synced successfully',
      stats: {
        documentsStored: result.documentsStored,
        timelineEvents: result.timelineEvents,
        officeActionsCreated: result.officeActionsCreated,
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
/**
 * USPTO Sync Service
 * Focused on data needed for AI-powered amendment automation
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { fetchProsecutionHistory } from '@/lib/api/uspto/services/prosecutionHistoryService';
import { 
  isMilestoneEvent, 
  getEventType,
  ProsecutionEventType 
} from '@/lib/api/uspto/types/prosecution-events';
import { StorageServerService } from './storage.server-service';
import { generateId } from '@/lib/utils/ids';

interface USPTODocument {
  documentId: string;
  documentCode: string;
  description: string;
  mailDate?: string;
  pageCount?: number;
  pdfUrl?: string;
  category?: string;
  importance?: string;
}

interface SyncResult {
  eventsCreated: number;
  officeActionsCreated: number;
  documentsStored: number;
  totalDocuments: number;
}

export class USPTOSyncService {

  /**
   * Sync USPTO data for a project
   * Only stores what's needed for AI automation
   */
  async syncUSPTOData(
    projectId: string,
    applicationNumber: string,
    tenantId: string,
    userId: string
  ): Promise<SyncResult> {
    try {
      // Clean application number
      const cleanAppNumber = applicationNumber.replace(/[^0-9]/g, '');
      
      // Fetch prosecution history
      const prosecutionData = await fetchProsecutionHistory(cleanAppNumber);
      
      if (!prosecutionData || !prosecutionData.documents) {
        throw new ApplicationError(
          ErrorCode.API_NETWORK_ERROR,
          'Failed to fetch USPTO data',
          500
        );
      }

      const { documents } = prosecutionData;
      
      return await prisma.$transaction(async (tx) => {
        let eventsCreated = 0;
        let officeActionsCreated = 0;
        let documentsStored = 0;

        // Get or ensure patent application exists
        const patentApp = await tx.patentApplication.findUnique({
          where: { projectId }
        });

        if (!patentApp) {
          throw new ApplicationError(
            ErrorCode.PROJECT_NOT_FOUND,
            'Patent application not found',
            404
          );
        }

        // Process each document
        for (const doc of documents) {
          const docId = generateId();
          
          // Step 1: Store document metadata in S3 (not in DB)
          if (doc.pdfUrl) {
            const s3Key = `uspto/${tenantId}/${projectId}/${doc.documentCode}_${doc.documentId}.json`;
            await StorageServerService.uploadJson(s3Key, {
              ...doc,
              syncedAt: new Date().toISOString(),
              projectId,
              applicationNumber,
            });
            documentsStored++;
          }

          // Step 2: Check if this is a milestone event
          if (isMilestoneEvent(doc.documentCode)) {
            const eventType = getEventType(doc.documentCode);
            if (eventType) {
              // Check if event already exists
              const existingEvent = await tx.prosecutionEvent.findFirst({
                where: {
                  applicationId: patentApp.id,
                  eventType,
                  eventDate: doc.mailDate ? new Date(doc.mailDate) : undefined,
                }
              });

              if (!existingEvent) {
                await tx.prosecutionEvent.create({
                  data: {
                    id: docId,
                    applicationId: patentApp.id,
                    eventType,
                    eventDate: doc.mailDate ? new Date(doc.mailDate) : new Date(),
                    title: doc.description || doc.documentCode,
                    documentId: doc.documentId,
                    metadata: {
                      documentCode: doc.documentCode,
                      s3Key: `uspto/${tenantId}/${projectId}/${doc.documentCode}_${doc.documentId}.json`,
                    },
                  }
                });
                eventsCreated++;
              }
            }
          }

          // Step 3: Create OfficeAction records for OA-specific processing
          if (['CTNF', 'CTFR', 'CTAV'].includes(doc.documentCode)) {
            const existingOA = await tx.officeAction.findFirst({
              where: {
                projectId,
                oaNumber: doc.documentCode,
                dateIssued: doc.mailDate ? new Date(doc.mailDate) : undefined,
              }
            });

            if (!existingOA) {
              const oaType = doc.documentCode === 'CTFR' ? 'FINAL' : 'NON_FINAL';
              
              await tx.officeAction.create({
                data: {
                  projectId,
                  tenantId,
                  oaNumber: doc.documentCode,
                  dateIssued: doc.mailDate ? new Date(doc.mailDate) : new Date(),
                  originalFileName: doc.description,
                  status: 'COMPLETED',
                  examinerRemarks: doc.description || 'USPTO Office Action',
                  parsedJson: JSON.stringify({
                    oaType,
                    documentId: doc.documentId,
                    pdfUrl: doc.pdfUrl,
                    s3Key: `uspto/${tenantId}/${projectId}/${doc.documentCode}_${doc.documentId}.json`,
                  }),
                }
              });
              officeActionsCreated++;

              // Create empty summary for AI to fill later
              await tx.officeActionSummary.create({
                data: {
                  officeActionId: (await tx.officeAction.findFirst({
                    where: { 
                      projectId,
                      oaNumber: doc.documentCode,
                      dateIssued: doc.mailDate ? new Date(doc.mailDate) : undefined,
                    },
                    select: { id: true }
                  }))!.id,
                  summaryText: 'Pending AI analysis',
                  keyIssues: JSON.stringify([]),
                  rejectionBreakdown: JSON.stringify({}),
                  totalClaimsRejected: 0,
                  examinerTone: 'NEUTRAL',
                  responseComplexity: 'MEDIUM',
                }
              });
            }
          }
        }

        // Update patent application with latest info
        if (prosecutionData.applicationData) {
          await tx.patentApplication.update({
            where: { projectId },
            data: {
              title: prosecutionData.applicationData.title || patentApp.title,
              filingDate: prosecutionData.applicationData.filingDate 
                ? new Date(prosecutionData.applicationData.filingDate)
                : patentApp.filingDate,
              status: prosecutionData.applicationData.status || patentApp.status,
              examiner: prosecutionData.applicationData.examiner,
              artUnit: prosecutionData.applicationData.artUnit,
              updatedAt: new Date(),
            }
          });
        }

        logger.info('USPTO sync completed', {
          projectId,
          applicationNumber,
          eventsCreated,
          officeActionsCreated,
          documentsStored,
          totalDocuments: documents.length,
        });

        return {
          eventsCreated,
          officeActionsCreated,
          documentsStored,
          totalDocuments: documents.length,
        };
      });
    } catch (error) {
      logger.error('USPTO sync failed', {
        projectId,
        applicationNumber,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get USPTO documents for a project
   * Returns both timeline events and file drawer contents
   */
  async getUSPTODocuments(
    projectId: string,
    tenantId: string
  ): Promise<{
    timeline: any[];
    documents: any[];
  }> {
    // Get patent application
    const patentApp = await prisma.patentApplication.findUnique({
      where: { projectId },
      include: {
        prosecutionEvents: {
          orderBy: { eventDate: 'asc' },
        },
      },
    });

    if (!patentApp) {
      return { timeline: [], documents: [] };
    }

    // Get all stored documents from S3
    const s3Prefix = `uspto/${tenantId}/${projectId}/`;
    const documentsList = await StorageServerService.listObjects(s3Prefix);
    
    // Build timeline from prosecution events
    const timeline = patentApp.prosecutionEvents.map(event => ({
      id: event.id,
      type: event.eventType,
      date: event.eventDate,
      title: event.title,
      documentId: event.documentId,
      metadata: event.metadata,
    }));

    // Build documents list from S3
    const documents = await Promise.all(
      documentsList.map(async (key) => {
        const data = await StorageServerService.getJson(key);
        return {
          ...data,
          s3Key: key,
          isTimelineEvent: isMilestoneEvent(data.documentCode),
        };
      })
    );

    return { timeline, documents };
  }
}
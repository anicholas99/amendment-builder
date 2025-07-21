/**
 * USPTO Sync Service
 * Focused on storing USPTO documents in ProjectDocument table only
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
import { ProsecutionTimelineService } from './prosecutionTimeline.server-service';

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
  documentsStored: number;
  totalDocuments: number;
}

export class USPTOSyncService {

  /**
   * Sync USPTO data for a project
   * Only stores documents in ProjectDocument table
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

        // Build timeline to determine document status
        const timeline = ProsecutionTimelineService.buildTimelineSequence(documents);

        // Process each document - store in ProjectDocument only
        for (const doc of documents) {
          const docId = generateId();
          
          // Check if document already exists
          const existingDoc = await tx.projectDocument.findFirst({
            where: {
              projectId,
              fileType: 'uspto-document',
              originalName: doc.documentCode,
              extractedMetadata: {
                contains: doc.documentId
              }
            }
          });

          if (!existingDoc) {
            // Store document in ProjectDocument table
            await tx.projectDocument.create({
              data: {
                id: docId,
                projectId,
                fileName: `${doc.documentCode}_${doc.mailDate || 'undated'}.json`,
                originalName: doc.documentCode,
                fileType: 'uspto-document',
                storageUrl: doc.pdfUrl || '',
                extractedText: doc.description || '',
                extractedMetadata: JSON.stringify({
                  documentId: doc.documentId,
                  documentCode: doc.documentCode,
                  category: doc.category,
                  mailDate: doc.mailDate,
                  pageCount: doc.pageCount,
                  importance: doc.importance,
                  usptoApplicationNumber: applicationNumber,
                  rawData: doc,
                }),
                applicationNumber,
                uploadedBy: userId,
              }
            });
            documentsStored++;
          }

          // Track milestone events for timeline display (but don't create Office Actions)
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
                    id: generateId(),
                    applicationId: patentApp.id,
                    eventType,
                    eventDate: doc.mailDate ? new Date(doc.mailDate) : new Date(),
                    title: doc.description || doc.documentCode,
                    documentId: doc.documentId,
                    metadata: {
                      documentCode: doc.documentCode,
                      projectDocumentId: docId,
                    },
                  }
                });
                eventsCreated++;
              }
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
              metadata: {
                ...patentApp.metadata,
                lastUSPTOSync: new Date().toISOString(),
                totalDocuments: documents.length,
              }
            }
          });
        }

        // Note: We don't store prosecution history in the Project model
        // All prosecution data is stored in ProjectDocument records as the source of truth

        return {
          eventsCreated,
          documentsStored,
          totalDocuments: documents.length,
        };
      });

    } catch (error) {
      logger.error('[USPTOSyncService] Failed to sync USPTO data', {
        projectId,
        applicationNumber,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        `Failed to sync USPTO data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
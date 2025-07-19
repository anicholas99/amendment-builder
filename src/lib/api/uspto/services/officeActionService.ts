/**
 * USPTO Office Action Service
 * 
 * High-level service for fetching and processing Office Actions from USPTO
 * Integrates with existing OA processing pipeline
 */

import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { 
  getApplicationDocuments, 
  downloadDocument, 
  getApplicationData 
} from '../client';
import { 
  USPTODocument, 
  OFFICE_ACTION_CODES,
  OfficeActionCode 
} from '../types';

export interface OfficeActionDocument {
  documentId: string;
  documentCode: string;
  description: string;
  mailDate: string;
  pageCount?: number;
  isOfficeAction: boolean;
  pdfBuffer?: ArrayBuffer;
}

export interface ApplicationOfficeActions {
  applicationNumber: string;
  applicationData?: {
    title: string;
    examinerName?: string;
    artUnit?: string;
    status: string;
  };
  officeActions: OfficeActionDocument[];
  totalDocuments: number;
}

/**
 * Check if a document is an Office Action based on its code
 */
const isOfficeActionDocument = (documentCode: string): boolean => {
  return Object.values(OFFICE_ACTION_CODES).includes(documentCode as OfficeActionCode);
};

/**
 * Fetch all Office Actions for an application
 */
export const fetchApplicationOfficeActions = async (
  applicationNumber: string,
  options?: {
    includeDocumentContent?: boolean;
    filterCodes?: OfficeActionCode[];
  }
): Promise<ApplicationOfficeActions> => {
  try {
    logger.info('Fetching USPTO Office Actions', { applicationNumber });

    // Fetch application data and documents in parallel
    const [appDataResult, documentsResult] = await Promise.allSettled([
      getApplicationData(applicationNumber),
      getApplicationDocuments(applicationNumber),
    ]);

    // Handle application data
    let applicationData;
    if (appDataResult.status === 'fulfilled') {
      applicationData = {
        title: appDataResult.value.title,
        examinerName: appDataResult.value.examinerName,
        artUnit: appDataResult.value.artUnit,
        status: appDataResult.value.status,
      };
    } else {
      logger.warn('Failed to fetch application data', {
        applicationNumber,
        error: appDataResult.reason,
      });
    }

    // Handle documents
    if (documentsResult.status === 'rejected') {
      throw documentsResult.reason;
    }

    const documents = documentsResult.value.documents || [];
    
    // Filter for Office Actions
    let officeActionDocs = documents.filter(doc => isOfficeActionDocument(doc.documentCode));
    
    // Apply additional code filtering if specified
    if (options?.filterCodes && options.filterCodes.length > 0) {
      officeActionDocs = officeActionDocs.filter(doc => 
        options.filterCodes!.includes(doc.documentCode as OfficeActionCode)
      );
    }

    // Map to our format
    const officeActions: OfficeActionDocument[] = officeActionDocs.map(doc => ({
      documentId: doc.documentId,
      documentCode: doc.documentCode,
      description: doc.description,
      mailDate: doc.mailDate,
      pageCount: doc.pageCount,
      isOfficeAction: true,
    }));

    // Sort by mail date (most recent first)
    officeActions.sort((a, b) => 
      new Date(b.mailDate).getTime() - new Date(a.mailDate).getTime()
    );

    // Download PDFs if requested
    if (options?.includeDocumentContent && officeActions.length > 0) {
      logger.info('Downloading Office Action PDFs', {
        applicationNumber,
        count: officeActions.length,
      });

      // Download in parallel with concurrency limit
      const CONCURRENT_DOWNLOADS = 3;
      for (let i = 0; i < officeActions.length; i += CONCURRENT_DOWNLOADS) {
        const batch = officeActions.slice(i, i + CONCURRENT_DOWNLOADS);
        const downloadPromises = batch.map(async (oa) => {
          try {
            oa.pdfBuffer = await downloadDocument(oa.documentId);
            logger.debug('Downloaded Office Action PDF', {
              documentId: oa.documentId,
              size: oa.pdfBuffer.byteLength,
            });
          } catch (error) {
            logger.error('Failed to download Office Action PDF', {
              documentId: oa.documentId,
              error: error instanceof Error ? error.message : String(error),
            });
            // Don't fail the entire operation if one download fails
          }
        });
        await Promise.all(downloadPromises);
      }
    }

    logger.info('USPTO Office Actions fetched successfully', {
      applicationNumber,
      totalDocuments: documents.length,
      officeActionCount: officeActions.length,
    });

    return {
      applicationNumber,
      applicationData,
      officeActions,
      totalDocuments: documents.length,
    };
  } catch (error) {
    logger.error('Failed to fetch USPTO Office Actions', {
      applicationNumber,
      error: error instanceof Error ? error : undefined,
    });
    
    if (error instanceof ApplicationError) {
      throw error;
    }
    
    throw new ApplicationError(
      ErrorCode.API_NETWORK_ERROR,
      `Failed to fetch Office Actions: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

/**
 * Get the most recent Office Action for an application
 */
export const getMostRecentOfficeAction = async (
  applicationNumber: string,
  options?: {
    includeDocumentContent?: boolean;
  }
): Promise<OfficeActionDocument | null> => {
  const result = await fetchApplicationOfficeActions(applicationNumber, options);
  
  if (result.officeActions.length === 0) {
    return null;
  }
  
  return result.officeActions[0];
};

/**
 * Download a specific Office Action document
 */
export const downloadOfficeAction = async (
  documentId: string
): Promise<ArrayBuffer> => {
  try {
    logger.info('Downloading USPTO Office Action', { documentId });
    
    const buffer = await downloadDocument(documentId);
    
    logger.info('USPTO Office Action downloaded successfully', {
      documentId,
      size: buffer.byteLength,
    });
    
    return buffer;
  } catch (error) {
    logger.error('Failed to download USPTO Office Action', {
      documentId,
      error: error instanceof Error ? error : undefined,
    });
    throw error;
  }
};

/**
 * Check if an application has any Office Actions
 */
export const hasOfficeActions = async (
  applicationNumber: string
): Promise<boolean> => {
  try {
    const documents = await getApplicationDocuments(applicationNumber);
    return documents.documents.some(doc => isOfficeActionDocument(doc.documentCode));
  } catch (error) {
    logger.error('Failed to check for Office Actions', {
      applicationNumber,
      error: error instanceof Error ? error : undefined,
    });
    return false;
  }
};
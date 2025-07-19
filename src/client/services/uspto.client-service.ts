/**
 * USPTO Client Service
 * 
 * Client-side service for USPTO Open Data Portal API operations.
 * Handles fetching Office Actions and patent documents with proper
 * error handling and response validation.
 */

import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/utils/clientLogger';
import { z } from 'zod';
import { validateApiResponse } from '@/lib/validation/apiValidation';

// Response schemas
const USPTODocumentSchema = z.object({
  documentId: z.string(),
  documentCode: z.string(),
  description: z.string(),
  mailDate: z.string(),
  pageCount: z.number().optional(),
  isOfficeAction: z.boolean(),
});

const ApplicationDataSchema = z.object({
  title: z.string(),
  examinerName: z.string().optional(),
  artUnit: z.string().optional(),
  status: z.string(),
});

const ApplicationOfficeActionsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    applicationNumber: z.string(),
    applicationData: ApplicationDataSchema.optional(),
    officeActions: z.array(USPTODocumentSchema),
    totalDocuments: z.number(),
  }),
});

const OfficeActionDownloadResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    documentId: z.string(),
    filename: z.string(),
    contentType: z.string(),
    size: z.number(),
    downloadUrl: z.string(),
  }),
});

const OfficeActionStatusResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    hasOfficeActions: z.boolean(),
    lastChecked: z.string(),
    applicationNumber: z.string(),
  }),
});

const ProsecutionDocumentSchema = z.object({
  documentId: z.string().optional(), // May be missing in some documents
  documentIdentifier: z.string().optional(),
  documentCode: z.string(),
  description: z.string().optional(), // May be missing
  documentCodeDescriptionText: z.string().optional(),
  mailDate: z.string().optional(), // May be missing
  officialDate: z.string().optional(),
  pageCount: z.number().optional(),
  applicationNumber: z.string().optional(),
  patentNumber: z.string().optional(),
  category: z.enum(['office-action', 'response', 'claims', 'citations', 'examiner-notes', 'interview', 'notice', 'other']),
  importance: z.enum(['core', 'optional', 'low']),
  isDownloadable: z.boolean(),
  purpose: z.string().optional(),
  downloadOptionBag: z.array(z.object({
    mimeTypeIdentifier: z.string(),
    downloadUrl: z.string()
  })).optional(),
});

const ProsecutionHistoryResponseSchema = z.object({
  data: z.object({
    applicationNumber: z.string(),
    applicationData: z.object({
      title: z.string().optional(),
      filingDate: z.string().optional(),
      patentNumber: z.string().optional(),
      issueDate: z.string().optional(),
      examinerName: z.string().optional(),
      artUnit: z.string().optional(),
      status: z.string().optional(),
      inventorName: z.array(z.string()).optional(),
      applicantName: z.string().optional(),
      attorneyDocketNumber: z.string().optional(),
    }).optional().nullable(),
    documents: z.array(ProsecutionDocumentSchema),
    statistics: z.object({
      totalDocuments: z.number(),
      coreDocuments: z.number(),
      officeActions: z.number(),
      responses: z.number(),
      claims: z.number(),
      citations: z.number(),
      examinerNotes: z.number(),
      interviews: z.number(),
      notices: z.number(),
      other: z.number(),
    }),
    timeline: z.array(z.object({
      date: z.string(),
      type: z.enum(['office-action', 'response', 'claims', 'citations', 'examiner-notes', 'interview', 'notice', 'other']),
      title: z.string(),
      documentCode: z.string(),
      documentId: z.string(),
    })).optional(),
  }),
});

// Types
export type USPTODocument = z.infer<typeof USPTODocumentSchema>;
export type ApplicationOfficeActionsResponse = z.infer<typeof ApplicationOfficeActionsResponseSchema>;
export type OfficeActionDownloadResponse = z.infer<typeof OfficeActionDownloadResponseSchema>;
export type OfficeActionStatusResponse = z.infer<typeof OfficeActionStatusResponseSchema>;
export type ProsecutionDocument = z.infer<typeof ProsecutionDocumentSchema>;
export type ProsecutionHistoryResponse = z.infer<typeof ProsecutionHistoryResponseSchema>;

export interface FetchOfficeActionsOptions {
  includeDocumentContent?: boolean;
  filterCodes?: string[];
}

/**
 * USPTO Client Service for Office Action operations
 */
export class USPTOService {
  /**
   * Fetch all Office Actions for a patent application
   */
  static async fetchOfficeActions(
    applicationNumber: string,
    options?: FetchOfficeActionsOptions
  ): Promise<ApplicationOfficeActionsResponse['data']> {
    if (!applicationNumber) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Application number is required'
      );
    }

    try {
      logger.debug('Fetching USPTO Office Actions', { 
        applicationNumber,
        options 
      });

      const queryParams = new URLSearchParams();
      if (options?.includeDocumentContent) {
        queryParams.append('includeContent', 'true');
      }
      if (options?.filterCodes && options.filterCodes.length > 0) {
        queryParams.append('filterCodes', options.filterCodes.join(','));
      }

      const url = `${API_ROUTES.USPTO.OFFICE_ACTIONS(applicationNumber)}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;

      const response = await apiFetch(url);
      const data = await response.json();

      const validated = validateApiResponse(
        data, 
        ApplicationOfficeActionsResponseSchema
      );

      logger.debug('USPTO Office Actions fetched successfully', {
        applicationNumber,
        count: validated.data.officeActions.length,
      });

      return validated.data;
    } catch (error) {
      logger.error('Error fetching USPTO Office Actions', { 
        error, 
        applicationNumber 
      });
      
      throw error instanceof ApplicationError
        ? error
        : new ApplicationError(
            ErrorCode.API_NETWORK_ERROR,
            'Failed to fetch Office Actions from USPTO'
          );
    }
  }

  /**
   * Get the most recent Office Action for an application
   */
  static async getMostRecentOfficeAction(
    applicationNumber: string,
    includeContent = false
  ): Promise<USPTODocument | null> {
    const result = await this.fetchOfficeActions(applicationNumber, {
      includeDocumentContent: includeContent,
    });

    if (result.officeActions.length === 0) {
      return null;
    }

    return result.officeActions[0];
  }

  /**
   * Get download URL for a document
   * Note: With the new API, documents have direct download URLs
   */
  static async downloadOfficeAction(
    document: ProsecutionDocument | { documentId: string, downloadOptionBag?: any[] }
  ): Promise<OfficeActionDownloadResponse['data']> {
    // For new API, extract download URL from document
    if ('downloadOptionBag' in document && document.downloadOptionBag && document.downloadOptionBag.length > 0) {
      const pdfOption = document.downloadOptionBag.find(
        opt => opt.mimeTypeIdentifier.toLowerCase().includes('pdf')
      ) || document.downloadOptionBag[0];
      
      return {
        documentId: 'documentId' in document ? document.documentId : 'documentIdentifier' in document ? document.documentIdentifier : '',
        filename: `document_${document.documentId || 'unknown'}.pdf`,
        contentType: pdfOption.mimeTypeIdentifier,
        size: 0, // Size not provided by new API
        downloadUrl: pdfOption.downloadUrl,
      };
    }

    // Fallback to old API endpoint if no download options
    const documentId = 'documentId' in document ? document.documentId : '';
    
    if (!documentId) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Document ID is required'
      );
    }

    try {
      logger.debug('Downloading USPTO Office Action', { documentId });

      const response = await apiFetch(
        API_ROUTES.USPTO.DOWNLOAD_DOCUMENT(documentId)
      );
      const data = await response.json();

      const validated = validateApiResponse(
        data,
        OfficeActionDownloadResponseSchema
      );

      logger.debug('USPTO Office Action download initiated', {
        documentId,
        filename: validated.data.filename,
        size: validated.data.size,
      });

      return validated.data;
    } catch (error) {
      logger.error('Error downloading USPTO Office Action', { 
        error, 
        documentId 
      });
      
      throw error instanceof ApplicationError
        ? error
        : new ApplicationError(
            ErrorCode.API_NETWORK_ERROR,
            'Failed to download Office Action from USPTO'
          );
    }
  }

  /**
   * Check if an application has any Office Actions
   */
  static async checkOfficeActionStatus(
    applicationNumber: string
  ): Promise<boolean> {
    if (!applicationNumber) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Application number is required'
      );
    }

    try {
      logger.debug('Checking USPTO Office Action status', { 
        applicationNumber 
      });

      const response = await apiFetch(
        API_ROUTES.USPTO.CHECK_STATUS(applicationNumber)
      );
      const data = await response.json();

      const validated = validateApiResponse(
        data,
        OfficeActionStatusResponseSchema
      );

      return validated.data.hasOfficeActions;
    } catch (error) {
      logger.error('Error checking USPTO Office Action status', { 
        error, 
        applicationNumber 
      });
      
      throw error instanceof ApplicationError
        ? error
        : new ApplicationError(
            ErrorCode.API_NETWORK_ERROR,
            'Failed to check Office Action status'
          );
    }
  }

  /**
   * Process Office Action PDF for text extraction
   * This initiates server-side processing and returns a job ID
   */
  static async processOfficeActionPDF(
    documentId: string,
    projectId: string
  ): Promise<{ jobId: string }> {
    if (!documentId || !projectId) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Document ID and Project ID are required'
      );
    }

    try {
      logger.debug('Processing USPTO Office Action PDF', { 
        documentId,
        projectId 
      });

      const response = await apiFetch(
        API_ROUTES.USPTO.PROCESS_DOCUMENT,
        {
          method: 'POST',
          body: JSON.stringify({
            documentId,
            projectId,
          }),
        }
      );
      const data = await response.json();

      logger.debug('USPTO Office Action processing initiated', {
        documentId,
        projectId,
        jobId: data.jobId,
      });

      return { jobId: data.jobId };
    } catch (error) {
      logger.error('Error processing USPTO Office Action PDF', { 
        error, 
        documentId,
        projectId 
      });
      
      throw error instanceof ApplicationError
        ? error
        : new ApplicationError(
            ErrorCode.API_NETWORK_ERROR,
            'Failed to process Office Action PDF'
          );
    }
  }

  /**
   * Fetch complete prosecution history for an application
   */
  static async fetchProsecutionHistory(
    applicationNumber: string,
    includeTimeline = false
  ): Promise<ProsecutionHistoryResponse['data']> {
    if (!applicationNumber) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Application number is required'
      );
    }

    try {
      logger.debug('Fetching USPTO prosecution history', { 
        applicationNumber,
        includeTimeline 
      });

      const queryParams = new URLSearchParams();
      if (includeTimeline) {
        queryParams.append('includeTimeline', 'true');
      }

      const url = `${API_ROUTES.USPTO.PROSECUTION_HISTORY(applicationNumber)}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;

      const response = await apiFetch(url);
      const data = await response.json();

      // Log the actual response for debugging
      logger.debug('USPTO API raw response', {
        hasData: 'data' in data,
        dataKeys: data.data ? Object.keys(data.data) : [],
        documentCount: data.data?.documents?.length || 0,
        hasApplicationNumber: !!data.data?.applicationNumber,
        hasStatistics: !!data.data?.statistics,
        hasApplicationData: !!data.data?.applicationData,
        applicationDataKeys: data.data?.applicationData ? Object.keys(data.data.applicationData) : [],
      });

      const validated = validateApiResponse(
        data,
        ProsecutionHistoryResponseSchema
      );

      logger.debug('USPTO prosecution history fetched successfully', {
        applicationNumber,
        documentCount: validated.data.documents.length,
        statistics: validated.data.statistics,
      });

      return validated.data;
    } catch (error) {
      logger.error('Error fetching USPTO prosecution history', { 
        error, 
        applicationNumber 
      });
      
      throw error instanceof ApplicationError
        ? error
        : new ApplicationError(
            ErrorCode.API_NETWORK_ERROR,
            'Failed to fetch prosecution history from USPTO'
          );
    }
  }
}
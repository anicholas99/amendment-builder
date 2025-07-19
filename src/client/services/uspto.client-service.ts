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

// Types
export type USPTODocument = z.infer<typeof USPTODocumentSchema>;
export type ApplicationOfficeActionsResponse = z.infer<typeof ApplicationOfficeActionsResponseSchema>;
export type OfficeActionDownloadResponse = z.infer<typeof OfficeActionDownloadResponseSchema>;
export type OfficeActionStatusResponse = z.infer<typeof OfficeActionStatusResponseSchema>;

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
   * Download a specific Office Action document
   */
  static async downloadOfficeAction(
    documentId: string
  ): Promise<OfficeActionDownloadResponse['data']> {
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
}
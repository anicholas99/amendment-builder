/**
 * Amendment Client Service
 * 
 * Client-side service for amendment workflow operations:
 * - Office Action upload and management
 * - Rejection analysis
 * - Amendment generation and export
 * 
 * Follows existing client service patterns with proper error handling,
 * type safety, and API route consistency.
 */

import { apiFetch } from '@/lib/api/apiClient';
import { logger } from '@/utils/clientLogger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { API_ROUTES } from '@/constants/apiRoutes';
import {
  CreateOfficeActionRequest,
  CreateOfficeActionResponse,
  AnalyzeRejectionsRequest,
  AnalyzeRejectionsResponse,
  GenerateAmendmentRequest,
  GenerateAmendmentResponse,
  OfficeAction,
  AmendmentResponse,
} from '@/types/domain/amendment';

// ============ OFFICE ACTION OPERATIONS ============

export class AmendmentClientService {
  /**
   * Upload an Office Action document
   */
  static async uploadOfficeAction(
    projectId: string,
    file: File,
    metadata?: {
      applicationNumber?: string;
      mailingDate?: string;
      examinerName?: string;
    }
  ): Promise<CreateOfficeActionResponse> {
    try {
      logger.info('[AmendmentClientService] Uploading Office Action', {
        projectId,
        fileName: file.name,
        fileSize: file.size,
      });

      const formData = new FormData();
      formData.append('file', file);
      
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await apiFetch(
        API_ROUTES.AMENDMENTS.OFFICE_ACTIONS.UPLOAD(projectId),
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_NETWORK_ERROR,
          `Failed to upload Office Action: ${response.status}`
        );
      }

      const result = await response.json();

      logger.info('[AmendmentClientService] Office Action uploaded successfully', {
        officeActionId: result.officeAction?.id,
        fileName: result.officeAction?.fileName,
      });

      return result;
    } catch (error) {
      logger.error('[AmendmentClientService] Failed to upload Office Action', {
        error,
        projectId,
        fileName: file.name,
      });

      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get Office Action by ID
   */
  static async getOfficeAction(
    projectId: string,
    officeActionId: string
  ): Promise<OfficeAction> {
    try {
      logger.debug('[AmendmentClientService] Fetching Office Action', {
        projectId,
        officeActionId,
      });

      const response = await apiFetch(
        API_ROUTES.AMENDMENTS.OFFICE_ACTIONS.BY_ID(projectId, officeActionId)
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_NETWORK_ERROR,
          `Failed to fetch Office Action: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      logger.error('[AmendmentClientService] Failed to fetch Office Action', {
        error,
        projectId,
        officeActionId,
      });

      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        `Fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * List Office Actions for a project
   */
  static async listOfficeActions(projectId: string): Promise<OfficeAction[]> {
    try {
      logger.debug('[AmendmentClientService] Listing Office Actions', {
        projectId,
      });

      const response = await apiFetch(
        API_ROUTES.AMENDMENTS.OFFICE_ACTIONS.LIST(projectId)
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_NETWORK_ERROR,
          `Failed to list Office Actions: ${response.status}`
        );
      }

      const result = await response.json();
      return result.officeActions || [];
    } catch (error) {
      logger.error('[AmendmentClientService] Failed to list Office Actions', {
        error,
        projectId,
      });

      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        `List failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Parse an uploaded Office Action
   */
  static async parseOfficeAction(
    projectId: string,
    officeActionId: string
  ): Promise<{ success: boolean; rejectionCount: number }> {
    try {
      logger.info('[AmendmentClientService] Parsing Office Action', {
        projectId,
        officeActionId,
      });

      const response = await apiFetch(
        API_ROUTES.AMENDMENTS.OFFICE_ACTIONS.PARSE(projectId, officeActionId),
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_NETWORK_ERROR,
          `Failed to parse Office Action: ${response.status}`
        );
      }

      const result = await response.json();

      logger.info('[AmendmentClientService] Office Action parsed successfully', {
        officeActionId,
        rejectionCount: result.rejectionCount,
      });

      return result;
    } catch (error) {
      logger.error('[AmendmentClientService] Failed to parse Office Action', {
        error,
        projectId,
        officeActionId,
      });

      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        `Parse failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Process a timeline Office Action (create OA record, parse, and create amendment project)
   */
  static async processTimelineOfficeAction(
    projectId: string,
    projectDocumentId: string
  ): Promise<{ officeActionId: string; amendmentProjectId: string; processed: boolean }> {
    try {
      logger.info('[AmendmentClientService] Processing timeline Office Action', {
        projectId,
        projectDocumentId,
      });

      const response = await apiFetch(
        `${API_ROUTES.AMENDMENTS.OFFICE_ACTIONS.LIST(projectId)}/process-timeline`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectDocumentId,
          }),
        }
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_NETWORK_ERROR,
          `Failed to process timeline Office Action: ${response.status}`
        );
      }

      const result = await response.json();

      logger.info('[AmendmentClientService] Timeline Office Action processed successfully', {
        officeActionId: result.officeActionId,
        amendmentProjectId: result.amendmentProjectId,
        processed: result.processed,
      });

      return result;
    } catch (error) {
      logger.error('[AmendmentClientService] Failed to process timeline Office Action', {
        error,
        projectId,
        projectDocumentId,
      });

      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        `Process failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // ============ REJECTION ANALYSIS ============

  /**
   * Analyze rejections in an Office Action
   */
  static async analyzeRejections(
    request: AnalyzeRejectionsRequest
  ): Promise<AnalyzeRejectionsResponse> {
    try {
      logger.info('[AmendmentClientService] Analyzing rejections', {
        projectId: request.projectId,
        officeActionId: request.officeActionId,
      });

      const response = await apiFetch(
        API_ROUTES.AMENDMENTS.REJECTIONS.ANALYZE_ALL(
          request.projectId,
          request.officeActionId
        ),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            forceRefresh: request.forceRefresh,
          }),
        },
        {
          timeout: 120000, // 2 minutes for rejection analysis
        }
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_NETWORK_ERROR,
          `Failed to analyze rejections: ${response.status}`
        );
      }

      const rawResult = await response.json();
      
      // Unwrap the data if it's wrapped by apiResponse.ok()
      const result = rawResult.data || rawResult;

      logger.info('[AmendmentClientService] Rejections analyzed successfully', {
        officeActionId: request.officeActionId,
        analysisCount: result.analyses?.length || 0,
        overallStrategy: result.overallStrategy,
      });

      return result;
    } catch (error) {
      logger.error('[AmendmentClientService] Failed to analyze rejections', {
        error,
        request,
      });

      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // ============ AMENDMENT GENERATION ============

  /**
   * Generate amendment response
   */
  static async generateAmendment(
    request: GenerateAmendmentRequest
  ): Promise<GenerateAmendmentResponse> {
    try {
      logger.info('[AmendmentClientService] Generating amendment', {
        projectId: request.projectId,
        officeActionId: request.officeActionId,
        strategy: request.strategy,
      });

      const response = await apiFetch(
        API_ROUTES.AMENDMENTS.RESPONSES.GENERATE(
          request.projectId,
          request.officeActionId
        ),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            strategy: request.strategy,
            userInstructions: request.userInstructions,
          }),
        }
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_NETWORK_ERROR,
          `Failed to generate amendment: ${response.status}`
        );
      }

      const result = await response.json();

      logger.info('[AmendmentClientService] Amendment generated successfully', {
        officeActionId: request.officeActionId,
        amendmentId: result.amendment?.id,
        claimAmendmentCount: result.amendment?.claimAmendments?.length || 0,
      });

      return result;
    } catch (error) {
      logger.error('[AmendmentClientService] Failed to generate amendment', {
        error,
        request,
      });

      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get amendment response by ID
   */
  static async getAmendmentResponse(
    projectId: string,
    responseId: string
  ): Promise<AmendmentResponse> {
    try {
      logger.debug('[AmendmentClientService] Fetching amendment response', {
        projectId,
        responseId,
      });

      const response = await apiFetch(
        API_ROUTES.AMENDMENTS.RESPONSES.BY_ID(projectId, responseId)
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_NETWORK_ERROR,
          `Failed to fetch amendment response: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      logger.error('[AmendmentClientService] Failed to fetch amendment response', {
        error,
        projectId,
        responseId,
      });

      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        `Fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Export amendment response as document
   */
  static async exportAmendmentResponse(
    projectId: string,
    responseId: string,
    format: 'docx' | 'pdf' = 'docx'
  ): Promise<Blob> {
    try {
      logger.info('[AmendmentClientService] Exporting amendment response', {
        projectId,
        responseId,
        format,
      });

      const response = await apiFetch(
        `${API_ROUTES.AMENDMENTS.RESPONSES.EXPORT(projectId, responseId)}?format=${format}`
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_NETWORK_ERROR,
          `Failed to export amendment response: ${response.status}`
        );
      }

      const blob = await response.blob();

      logger.info('[AmendmentClientService] Amendment response exported successfully', {
        responseId,
        format,
        size: blob.size,
      });

      return blob;
    } catch (error) {
      logger.error('[AmendmentClientService] Failed to export amendment response', {
        error,
        projectId,
        responseId,
        format,
      });

      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // ============ UTILITY METHODS ============

  /**
   * Download exported file with proper filename
   */
  static downloadFile(blob: Blob, filename: string): void {
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      logger.info('[AmendmentClientService] File download initiated', {
        filename,
        size: blob.size,
      });
    } catch (error) {
      logger.error('[AmendmentClientService] Failed to download file', {
        error,
        filename,
      });

      throw new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate filename for exported amendment
   */
  static generateAmendmentFilename(
    officeActionName: string,
    format: 'docx' | 'pdf' = 'docx'
  ): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const cleanName = officeActionName
      .replace(/[^a-zA-Z0-9\-_]/g, '_')
      .substring(0, 50);
    
    return `Amendment_Response_${cleanName}_${timestamp}.${format}`;
  }
} 
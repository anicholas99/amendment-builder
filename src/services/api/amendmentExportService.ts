/**
 * Amendment Export Service
 * 
 * Client-side service for amendment document export operations.
 * Follows existing service patterns with proper error handling,
 * type safety, and API route consistency.
 */

import { apiFetch } from '@/lib/api/apiClient';
import { logger } from '@/utils/clientLogger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { API_ROUTES } from '@/constants/apiRoutes';

// ============ TYPES ============

export interface AmendmentExportRequest {
  projectId: string;
  officeActionId: string;
  content: {
    title: string;
    responseType: 'AMENDMENT' | 'CONTINUATION' | 'RCE';
    claimAmendments: Array<{
      id: string;
      claimNumber: string;
      status: 'CURRENTLY_AMENDED' | 'PREVIOUSLY_PRESENTED' | 'NEW' | 'CANCELLED';
      originalText: string;
      amendedText: string;
      reasoning: string;
    }>;
    argumentSections: Array<{
      id: string;
      title: string;
      content: string;
      type: string;
      rejectionId?: string;
    }>;
    includeASMB?: boolean; // Whether to include ASMB as first page
  };
  options?: {
    format?: 'docx' | 'pdf';
    includeMetadata?: boolean;
    firmName?: string;
    attorneyName?: string;
    docketNumber?: string;
    documentType?: 'FULL' | 'ASMB' | 'CLM' | 'REM'; // Type of document to export
  };
}

export interface AmendmentExportResponse {
  success: boolean;
  downloadUrl?: string;
  fileName: string;
  fileSize: number;
  format: 'docx' | 'pdf';
  generatedAt: string;
}

// ============ SERVICE CLASS ============

export class AmendmentExportService {
  /**
   * Export amendment response as USPTO-compliant document
   */
  static async exportAmendmentDocument(
    request: AmendmentExportRequest
  ): Promise<Blob> {
    logger.info('[AmendmentExportService] Starting document export', {
      projectId: request.projectId,
      officeActionId: request.officeActionId,
      format: request.options?.format || 'docx',
      claimCount: request.content.claimAmendments.length,
      argumentCount: request.content.argumentSections.length,
    });

    try {
      const response = await apiFetch(
        `/api/projects/${request.projectId}/office-actions/${request.officeActionId}/export`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: request.content,
            options: {
              format: 'docx',
              includeMetadata: true,
              ...request.options,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_NETWORK_ERROR,
          `Export failed: ${response.status} ${response.statusText}`
        );
      }

      const blob = await response.blob();

      logger.info('[AmendmentExportService] Document exported successfully', {
        projectId: request.projectId,
        officeActionId: request.officeActionId,
        fileSize: blob.size,
        format: request.options?.format || 'docx',
      });

      return blob;
    } catch (error) {
      logger.error('[AmendmentExportService] Export failed', {
        projectId: request.projectId,
        officeActionId: request.officeActionId,
        error: error instanceof Error ? error.message : String(error),
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

  /**
   * Generate filename for exported amendment
   */
  static generateExportFilename(
    officeActionInfo: {
      applicationNumber?: string;
      mailingDate?: string;
      examinerName?: string;
    },
    format: 'docx' | 'pdf' = 'docx'
  ): string {
    const timestamp = new Date().toISOString().split('T')[0];
    
    let baseName = 'Amendment_Response';
    
    if (officeActionInfo.applicationNumber) {
      baseName += `_${officeActionInfo.applicationNumber.replace(/[^a-zA-Z0-9]/g, '_')}`;
    }
    
    if (officeActionInfo.mailingDate) {
      const date = new Date(officeActionInfo.mailingDate).toISOString().split('T')[0];
      baseName += `_${date}`;
    }
    
    return `${baseName}_${timestamp}.${format}`;
  }

  /**
   * Export ASMB only document
   */
  static async exportASMBDocument(
    projectId: string,
    officeActionId: string,
    options?: {
      format?: 'docx' | 'pdf';
      submissionType?: 'AMENDMENT' | 'CONTINUATION' | 'RCE';
    }
  ): Promise<Blob> {
    logger.info('[AmendmentExportService] Starting ASMB export', {
      projectId,
      officeActionId,
      format: options?.format || 'docx',
    });

    try {
      const request: AmendmentExportRequest = {
        projectId,
        officeActionId,
        content: {
          title: 'Amendment Submission Boilerplate',
          responseType: options?.submissionType || 'AMENDMENT',
          claimAmendments: [], // Empty for ASMB-only export
          argumentSections: [], // Empty for ASMB-only export
          includeASMB: true,
        },
        options: {
          format: options?.format || 'docx',
          documentType: 'ASMB',
        },
      };

      return await this.exportAmendmentDocument(request);
    } catch (error) {
      logger.error('[AmendmentExportService] ASMB export failed', {
        projectId,
        officeActionId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        `ASMB export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Download exported file with proper filename
   */
  static downloadFile(
    blob: Blob, 
    filename: string,
    options?: {
      onDownloadStart?: () => void;
      onDownloadComplete?: () => void;
      onDownloadError?: (error: Error) => void;
    }
  ): void {
    try {
      options?.onDownloadStart?.();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      
      // Ensure the link is not visible
      a.style.display = 'none';
      document.body.appendChild(a);
      
      // Trigger download
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      logger.info('[AmendmentExportService] File download initiated', {
        filename,
        size: blob.size,
      });

      options?.onDownloadComplete?.();
    } catch (error) {
      const downloadError = error instanceof Error 
        ? error 
        : new Error('Unknown download error');

      logger.error('[AmendmentExportService] Download failed', {
        filename,
        error: downloadError.message,
      });

      options?.onDownloadError?.(downloadError);

      throw new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        `Download failed: ${downloadError.message}`
      );
    }
  }

  /**
   * Export and download amendment in one operation
   */
  static async exportAndDownload(
    request: AmendmentExportRequest,
    options?: {
      customFilename?: string;
      onExportStart?: () => void;
      onExportComplete?: () => void;
      onExportError?: (error: Error) => void;
    }
  ): Promise<void> {
    try {
      options?.onExportStart?.();

      // Export the document
      const blob = await this.exportAmendmentDocument(request);
      
      // Generate filename
      const filename = options?.customFilename || this.generateExportFilename(
        {
          applicationNumber: 'Unknown', // Will be enhanced when we have metadata
        },
        request.options?.format || 'docx'
      );

      // Download the file
      this.downloadFile(blob, filename, {
        onDownloadComplete: options?.onExportComplete,
        onDownloadError: options?.onExportError,
      });

    } catch (error) {
      const exportError = error instanceof Error 
        ? error 
        : new Error('Unknown export error');

      logger.error('[AmendmentExportService] Export and download failed', {
        projectId: request.projectId,
        officeActionId: request.officeActionId,
        error: exportError.message,
      });

      options?.onExportError?.(exportError);
      throw exportError;
    }
  }
} 
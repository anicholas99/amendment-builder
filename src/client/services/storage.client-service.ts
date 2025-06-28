/**
 * Client-side API service for storage operations.
 *
 * This service provides a clean interface for all storage-related API calls,
 * following the established client/server architecture pattern.
 */
import { apiFetch } from '@/lib/api/apiClient';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/lib/monitoring/logger';
import { API_ROUTES } from '@/constants/apiRoutes';

interface UploadFigureResponse {
  url: string;
  fileName: string;
  type: string | null;
}

class StorageClientService {
  /**
   * Upload a figure for a project.
   *
   * @param projectId - The project ID to associate the figure with
   * @param file - The file to upload
   * @param figureKey - Optional figure key to associate with the figure
   * @returns The upload response containing the URL and metadata
   */
  async uploadFigure(
    projectId: string,
    file: File,
    figureKey?: string
  ): Promise<UploadFigureResponse> {
    if (!projectId) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Project ID is required'
      );
    }

    if (!file) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'File is required'
      );
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);

    // Add figureKey if provided
    if (figureKey) {
      formData.append('figureKey', figureKey);
    }

    try {
      logger.debug('[StorageClientService] Uploading figure', {
        projectId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        figureKey,
      });

      const response = await apiFetch(
        API_ROUTES.PROJECTS.FIGURES.UPLOAD(projectId),
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.STORAGE_UPLOAD_FAILED,
          `Upload failed with status ${response.status}`
        );
      }

      const result = await response.json();

      logger.info('[StorageClientService] Figure uploaded successfully', {
        projectId,
        fileName: file.name,
        url: result.url,
        figureKey,
      });

      return result;
    } catch (error) {
      logger.error('[StorageClientService] Upload failed', {
        projectId,
        fileName: file.name,
        figureKey,
        error,
      });
      throw error;
    }
  }

  /**
   * Delete a figure by URL.
   *
   * @param projectId - The project ID the figure belongs to
   * @param figureId - The ID of the figure to delete
   */
  async deleteFigure(projectId: string, figureId: string): Promise<void> {
    if (!projectId) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Project ID is required'
      );
    }

    if (!figureId) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Figure ID is required'
      );
    }

    try {
      logger.debug('[StorageClientService] Deleting figure', {
        projectId,
        figureId,
      });

      const response = await apiFetch(
        API_ROUTES.PROJECTS.FIGURES.DELETE(projectId, figureId),
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to delete figure: ${response.status}`
        );
      }

      logger.info('[StorageClientService] Figure deleted successfully', {
        projectId,
        figureId,
      });
    } catch (error) {
      logger.error('[StorageClientService] Figure deletion failed', {
        projectId,
        figureId,
        error,
      });
      throw error;
    }
  }
}

// Export as singleton instance
export const storageClientService = new StorageClientService();

// Also export the class for testing purposes
export { StorageClientService };

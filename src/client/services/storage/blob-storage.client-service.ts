/**
 * Client-side service for Blob Storage operations.
 */
import { apiFetch } from '@/lib/api/apiClient';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/lib/monitoring/logger';

class BlobStorageClientService {
  /**
   * Uploads a file to blob storage.
   * @param file The file to upload.
   * @param containerName The name of the blob container.
   * @returns The URL of the uploaded file.
   */
  async uploadFile(
    file: File,
    containerName: string
  ): Promise<{ url: string; blobName: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('containerName', containerName);

    try {
      const response = await apiFetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.FILE_PROCESSING_ERROR,
          'Failed to upload file.'
        );
      }
      return await response.json();
    } catch (error) {
      logger.error('[BlobStorageClientService] File upload failed', { error });
      throw error;
    }
  }

  /**
   * Deletes a blob from storage.
   * @param blobName The name of the blob to delete.
   * @param containerName The name of the container where the blob resides.
   */
  async deleteBlob(blobName: string, containerName: string): Promise<void> {
    try {
      const response = await apiFetch('/api/storage/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blobName, containerName }),
      });

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          'Failed to delete blob.'
        );
      }
    } catch (error) {
      logger.error('[BlobStorageClientService] Blob deletion failed', {
        error,
      });
      throw error;
    }
  }
}

export const blobStorageClientService = new BlobStorageClientService();

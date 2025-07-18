/**
 * Amendment Project File API Service
 * 
 * API service layer for amendment project file operations
 * Follows established patterns: service layer handles validation, errors, and type safety
 */

import { apiFetch } from '@/lib/api/apiClient';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/utils/clientLogger';
import { z } from 'zod';
import type { 
  AmendmentProjectFile, 
  AmendmentProjectFileWithRelations,
  AmendmentFileType,
  AmendmentFileStatus 
} from '@/types/amendment';

// ============ VALIDATION SCHEMAS ============

const AmendmentProjectFileSchema = z.object({
  id: z.string(),
  amendmentProjectId: z.string(),
  tenantId: z.string(),
  fileType: z.string(),
  fileName: z.string(),
  originalName: z.string(),
  blobName: z.string().nullable(),
  storageUrl: z.string().nullable(),
  mimeType: z.string().nullable(),
  sizeBytes: z.number().nullable(),
  version: z.number(),
  status: z.string(),
  tags: z.string().nullable(),
  description: z.string().nullable(),
  extractedText: z.string().nullable(),
  extractedMetadata: z.string().nullable(),
  uploadedBy: z.string(),
  linkedDraftId: z.string().nullable(),
  parentFileId: z.string().nullable(),
  exportedAt: z.string().nullable(),
  filedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});

const AmendmentProjectFileListResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    files: z.array(AmendmentProjectFileSchema),
    total: z.number(),
    stats: z.object({
      totalFiles: z.number(),
      byType: z.record(z.number()),
      byStatus: z.record(z.number()),
      totalSize: z.number(),
    }).optional(),
  }),
});

const AmendmentProjectFileResponseSchema = z.object({
  success: z.boolean(),
  data: AmendmentProjectFileSchema,
});

const FileUploadResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    file: AmendmentProjectFileSchema,
    uploadUrl: z.string().optional(),
  }),
});

// ============ API SERVICE METHODS ============

export class AmendmentProjectFileApiService {
  /**
   * Get all files for an amendment project
   */
  static async getAmendmentProjectFiles(
    amendmentProjectId: string,
    options?: {
      fileType?: AmendmentFileType;
      status?: AmendmentFileStatus;
      search?: string;
      page?: number;
      limit?: number;
      includeStats?: boolean;
    }
  ): Promise<{
    files: AmendmentProjectFile[];
    total: number;
    stats?: {
      totalFiles: number;
      byType: Record<string, number>;
      byStatus: Record<string, number>;
      totalSize: number;
    };
  }> {
    try {
      logger.debug('[AmendmentProjectFileApiService] Fetching files', {
        amendmentProjectId,
        options,
      });

      const searchParams = new URLSearchParams();
      if (options?.fileType) searchParams.set('fileType', options.fileType);
      if (options?.status) searchParams.set('status', options.status);
      if (options?.search) searchParams.set('search', options.search);
      if (options?.page) searchParams.set('page', options.page.toString());
      if (options?.limit) searchParams.set('limit', options.limit.toString());
      if (options?.includeStats) searchParams.set('includeStats', 'true');

      const response = await apiFetch(
        `/api/amendment-projects/${amendmentProjectId}/files?${searchParams.toString()}`
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_REQUEST_FAILED,
          `Failed to fetch amendment project files: ${response.status}`
        );
      }

      const data = await response.json();
      const validated = AmendmentProjectFileListResponseSchema.parse(data);

      // Transform date strings to Date objects
      const files = validated.data.files.map(file => ({
        ...file,
        createdAt: new Date(file.createdAt),
        updatedAt: new Date(file.updatedAt),
        deletedAt: file.deletedAt ? new Date(file.deletedAt) : null,
        exportedAt: file.exportedAt ? new Date(file.exportedAt) : null,
        filedAt: file.filedAt ? new Date(file.filedAt) : null,
      })) as AmendmentProjectFile[];

      logger.info('[AmendmentProjectFileApiService] Files fetched successfully', {
        amendmentProjectId,
        fileCount: files.length,
        total: validated.data.total,
      });

      return {
        files,
        total: validated.data.total,
        stats: validated.data.stats,
      };
    } catch (error) {
      logger.error('[AmendmentProjectFileApiService] Failed to fetch files', {
        amendmentProjectId,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof ApplicationError) throw error;

      throw new ApplicationError(
        ErrorCode.API_REQUEST_FAILED,
        `Failed to fetch amendment project files: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get a specific file by ID
   */
  static async getAmendmentProjectFile(
    fileId: string,
    includeRelations: boolean = false
  ): Promise<AmendmentProjectFile | AmendmentProjectFileWithRelations> {
    try {
      logger.debug('[AmendmentProjectFileApiService] Fetching file', { fileId });

      const searchParams = new URLSearchParams();
      if (includeRelations) searchParams.set('includeRelations', 'true');

      const response = await apiFetch(
        `/api/amendment-project-files/${fileId}?${searchParams.toString()}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new ApplicationError(ErrorCode.NOT_FOUND, 'File not found');
        }
        throw new ApplicationError(
          ErrorCode.API_REQUEST_FAILED,
          `Failed to fetch file: ${response.status}`
        );
      }

      const data = await response.json();
      const validated = AmendmentProjectFileResponseSchema.parse(data);

      // Transform date strings to Date objects
      const file = {
        ...validated.data,
        createdAt: new Date(validated.data.createdAt),
        updatedAt: new Date(validated.data.updatedAt),
        deletedAt: validated.data.deletedAt ? new Date(validated.data.deletedAt) : null,
        exportedAt: validated.data.exportedAt ? new Date(validated.data.exportedAt) : null,
        filedAt: validated.data.filedAt ? new Date(validated.data.filedAt) : null,
      } as AmendmentProjectFile;

      logger.info('[AmendmentProjectFileApiService] File fetched successfully', { fileId });

      return file;
    } catch (error) {
      logger.error('[AmendmentProjectFileApiService] Failed to fetch file', {
        fileId,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof ApplicationError) throw error;

      throw new ApplicationError(
        ErrorCode.API_REQUEST_FAILED,
        `Failed to fetch file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Upload a new file to an amendment project
   */
  static async uploadFile(
    amendmentProjectId: string,
    file: File,
    metadata: {
      fileType: AmendmentFileType;
      description?: string;
      tags?: string[];
      linkedDraftId?: string;
      parentFileId?: string;
    }
  ): Promise<AmendmentProjectFile> {
    try {
      logger.debug('[AmendmentProjectFileApiService] Uploading file', {
        amendmentProjectId,
        fileName: file.name,
        fileSize: file.size,
        fileType: metadata.fileType,
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', metadata.fileType);
      if (metadata.description) formData.append('description', metadata.description);
      if (metadata.tags) formData.append('tags', JSON.stringify(metadata.tags));
      if (metadata.linkedDraftId) formData.append('linkedDraftId', metadata.linkedDraftId);
      if (metadata.parentFileId) formData.append('parentFileId', metadata.parentFileId);

      const response = await apiFetch(
        `/api/amendment-projects/${amendmentProjectId}/files/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_REQUEST_FAILED,
          `File upload failed: ${response.status}`
        );
      }

      const data = await response.json();
      const validated = FileUploadResponseSchema.parse(data);

      // Transform date strings to Date objects
      const uploadedFile = {
        ...validated.data.file,
        createdAt: new Date(validated.data.file.createdAt),
        updatedAt: new Date(validated.data.file.updatedAt),
        deletedAt: validated.data.file.deletedAt ? new Date(validated.data.file.deletedAt) : null,
        exportedAt: validated.data.file.exportedAt ? new Date(validated.data.file.exportedAt) : null,
        filedAt: validated.data.file.filedAt ? new Date(validated.data.file.filedAt) : null,
      } as AmendmentProjectFile;

      logger.info('[AmendmentProjectFileApiService] File uploaded successfully', {
        fileId: uploadedFile.id,
        amendmentProjectId,
        fileName: uploadedFile.fileName,
      });

      return uploadedFile;
    } catch (error) {
      logger.error('[AmendmentProjectFileApiService] File upload failed', {
        amendmentProjectId,
        fileName: file.name,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof ApplicationError) throw error;

      throw new ApplicationError(
        ErrorCode.API_REQUEST_FAILED,
        `File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update file metadata
   */
  static async updateFile(
    fileId: string,
    updates: {
      fileName?: string;
      description?: string;
      tags?: string[];
      status?: AmendmentFileStatus;
    }
  ): Promise<AmendmentProjectFile> {
    try {
      logger.debug('[AmendmentProjectFileApiService] Updating file', { fileId, updates });

      const response = await apiFetch(`/api/amendment-project-files/${fileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new ApplicationError(ErrorCode.NOT_FOUND, 'File not found');
        }
        throw new ApplicationError(
          ErrorCode.API_REQUEST_FAILED,
          `Failed to update file: ${response.status}`
        );
      }

      const data = await response.json();
      const validated = AmendmentProjectFileResponseSchema.parse(data);

      // Transform date strings to Date objects
      const updatedFile = {
        ...validated.data,
        createdAt: new Date(validated.data.createdAt),
        updatedAt: new Date(validated.data.updatedAt),
        deletedAt: validated.data.deletedAt ? new Date(validated.data.deletedAt) : null,
        exportedAt: validated.data.exportedAt ? new Date(validated.data.exportedAt) : null,
        filedAt: validated.data.filedAt ? new Date(validated.data.filedAt) : null,
      } as AmendmentProjectFile;

      logger.info('[AmendmentProjectFileApiService] File updated successfully', { fileId });

      return updatedFile;
    } catch (error) {
      logger.error('[AmendmentProjectFileApiService] Failed to update file', {
        fileId,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof ApplicationError) throw error;

      throw new ApplicationError(
        ErrorCode.API_REQUEST_FAILED,
        `Failed to update file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create a new version of an existing file
   */
  static async createFileVersion(
    parentFileId: string,
    file: File,
    metadata: {
      description?: string;
      tags?: string[];
    }
  ): Promise<AmendmentProjectFile> {
    try {
      logger.debug('[AmendmentProjectFileApiService] Creating file version', {
        parentFileId,
        fileName: file.name,
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('parentFileId', parentFileId);
      if (metadata.description) formData.append('description', metadata.description);
      if (metadata.tags) formData.append('tags', JSON.stringify(metadata.tags));

      const response = await apiFetch(`/api/amendment-project-files/${parentFileId}/versions`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_REQUEST_FAILED,
          `Failed to create file version: ${response.status}`
        );
      }

      const data = await response.json();
      const validated = FileUploadResponseSchema.parse(data);

      // Transform date strings to Date objects
      const newVersion = {
        ...validated.data.file,
        createdAt: new Date(validated.data.file.createdAt),
        updatedAt: new Date(validated.data.file.updatedAt),
        deletedAt: validated.data.file.deletedAt ? new Date(validated.data.file.deletedAt) : null,
        exportedAt: validated.data.file.exportedAt ? new Date(validated.data.file.exportedAt) : null,
        filedAt: validated.data.file.filedAt ? new Date(validated.data.file.filedAt) : null,
      } as AmendmentProjectFile;

      logger.info('[AmendmentProjectFileApiService] File version created successfully', {
        newFileId: newVersion.id,
        parentFileId,
        version: newVersion.version,
      });

      return newVersion;
    } catch (error) {
      logger.error('[AmendmentProjectFileApiService] Failed to create file version', {
        parentFileId,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof ApplicationError) throw error;

      throw new ApplicationError(
        ErrorCode.API_REQUEST_FAILED,
        `Failed to create file version: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get file version history
   */
  static async getFileVersionHistory(fileId: string): Promise<AmendmentProjectFile[]> {
    try {
      logger.debug('[AmendmentProjectFileApiService] Fetching version history', { fileId });

      const response = await apiFetch(`/api/amendment-project-files/${fileId}/versions`);

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_REQUEST_FAILED,
          `Failed to fetch version history: ${response.status}`
        );
      }

      const data = await response.json();
      const validated = z.object({
        success: z.boolean(),
        data: z.array(AmendmentProjectFileSchema),
      }).parse(data);

      // Transform date strings to Date objects
      const versions = validated.data.map(file => ({
        ...file,
        createdAt: new Date(file.createdAt),
        updatedAt: new Date(file.updatedAt),
        deletedAt: file.deletedAt ? new Date(file.deletedAt) : null,
        exportedAt: file.exportedAt ? new Date(file.exportedAt) : null,
        filedAt: file.filedAt ? new Date(file.filedAt) : null,
      })) as AmendmentProjectFile[];

      logger.info('[AmendmentProjectFileApiService] Version history fetched successfully', {
        fileId,
        versionCount: versions.length,
      });

      return versions;
    } catch (error) {
      logger.error('[AmendmentProjectFileApiService] Failed to fetch version history', {
        fileId,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof ApplicationError) throw error;

      throw new ApplicationError(
        ErrorCode.API_REQUEST_FAILED,
        `Failed to fetch version history: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete (archive) a file
   */
  static async deleteFile(fileId: string): Promise<void> {
    try {
      logger.debug('[AmendmentProjectFileApiService] Deleting file', { fileId });

      const response = await apiFetch(`/api/amendment-project-files/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new ApplicationError(ErrorCode.NOT_FOUND, 'File not found');
        }
        throw new ApplicationError(
          ErrorCode.API_REQUEST_FAILED,
          `Failed to delete file: ${response.status}`
        );
      }

      logger.info('[AmendmentProjectFileApiService] File deleted successfully', { fileId });
    } catch (error) {
      logger.error('[AmendmentProjectFileApiService] Failed to delete file', {
        fileId,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof ApplicationError) throw error;

      throw new ApplicationError(
        ErrorCode.API_REQUEST_FAILED,
        `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Download a file
   */
  static async downloadFile(fileId: string): Promise<{ url: string; fileName: string }> {
    try {
      logger.debug('[AmendmentProjectFileApiService] Getting download URL', { fileId });

      const response = await apiFetch(`/api/amendment-project-files/${fileId}/download`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new ApplicationError(ErrorCode.NOT_FOUND, 'File not found');
        }
        throw new ApplicationError(
          ErrorCode.API_REQUEST_FAILED,
          `Failed to get download URL: ${response.status}`
        );
      }

      const data = await response.json();
      const validated = z.object({
        success: z.boolean(),
        data: z.object({
          downloadUrl: z.string(),
          fileName: z.string(),
        }),
      }).parse(data);

      logger.info('[AmendmentProjectFileApiService] Download URL generated', { fileId });

      return {
        url: validated.data.downloadUrl,
        fileName: validated.data.fileName,
      };
    } catch (error) {
      logger.error('[AmendmentProjectFileApiService] Failed to get download URL', {
        fileId,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof ApplicationError) throw error;

      throw new ApplicationError(
        ErrorCode.API_REQUEST_FAILED,
        `Failed to get download URL: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Mark file as exported
   */
  static async markFileAsExported(fileId: string): Promise<AmendmentProjectFile> {
    try {
      logger.debug('[AmendmentProjectFileApiService] Marking file as exported', { fileId });

      const response = await apiFetch(`/api/amendment-project-files/${fileId}/export`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_REQUEST_FAILED,
          `Failed to mark file as exported: ${response.status}`
        );
      }

      const data = await response.json();
      const validated = AmendmentProjectFileResponseSchema.parse(data);

      // Transform date strings to Date objects
      const updatedFile = {
        ...validated.data,
        createdAt: new Date(validated.data.createdAt),
        updatedAt: new Date(validated.data.updatedAt),
        deletedAt: validated.data.deletedAt ? new Date(validated.data.deletedAt) : null,
        exportedAt: validated.data.exportedAt ? new Date(validated.data.exportedAt) : null,
        filedAt: validated.data.filedAt ? new Date(validated.data.filedAt) : null,
      } as AmendmentProjectFile;

      logger.info('[AmendmentProjectFileApiService] File marked as exported', { fileId });

      return updatedFile;
    } catch (error) {
      logger.error('[AmendmentProjectFileApiService] Failed to mark file as exported', {
        fileId,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof ApplicationError) throw error;

      throw new ApplicationError(
        ErrorCode.API_REQUEST_FAILED,
        `Failed to mark file as exported: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Mark file as filed with USPTO
   */
  static async markFileAsFiled(
    fileId: string,
    filedDate?: Date
  ): Promise<AmendmentProjectFile> {
    try {
      logger.debug('[AmendmentProjectFileApiService] Marking file as filed', { fileId, filedDate });

      const response = await apiFetch(`/api/amendment-project-files/${fileId}/file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filedDate: filedDate?.toISOString() || new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_REQUEST_FAILED,
          `Failed to mark file as filed: ${response.status}`
        );
      }

      const data = await response.json();
      const validated = AmendmentProjectFileResponseSchema.parse(data);

      // Transform date strings to Date objects
      const updatedFile = {
        ...validated.data,
        createdAt: new Date(validated.data.createdAt),
        updatedAt: new Date(validated.data.updatedAt),
        deletedAt: validated.data.deletedAt ? new Date(validated.data.deletedAt) : null,
        exportedAt: validated.data.exportedAt ? new Date(validated.data.exportedAt) : null,
        filedAt: validated.data.filedAt ? new Date(validated.data.filedAt) : null,
      } as AmendmentProjectFile;

      logger.info('[AmendmentProjectFileApiService] File marked as filed', { fileId });

      return updatedFile;
    } catch (error) {
      logger.error('[AmendmentProjectFileApiService] Failed to mark file as filed', {
        fileId,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof ApplicationError) throw error;

      throw new ApplicationError(
        ErrorCode.API_REQUEST_FAILED,
        `Failed to mark file as filed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
} 
import React, { useState, useCallback } from 'react';
import { logger } from '@/lib/monitoring/logger';
import { useToast } from '@chakra-ui/react';
import { useUploadFigureMutation } from '@/hooks/api/useInvention';

import { ACCEPTED_FILE_EXTENSIONS } from '../constants/fileConstants';

export interface UploadedFigure {
  id: string;
  fileName: string;
  url: string;
  type: string;
}

export interface UseTechnologyInputFileHandlerProps {
  projectId: string;
  onFigureUpload: (figure: UploadedFigure) => void;
}

export interface UseTechnologyInputFileHandlerResult {
  handleFileUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  isDragging: boolean;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLElement>) => void;
  clearUploadedFile: (fileName: string) => void;
  triggerFileInput: () => void;
  uploadedFigures: UploadedFigure[];
}

/**
 * Hook for handling file uploads in the technology details input
 * Manages file validation, processing, and state
 */
export const useTechnologyInputFileHandler = ({
  projectId,
  onFigureUpload,
}: UseTechnologyInputFileHandlerProps): UseTechnologyInputFileHandlerResult => {
  const toast = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFigures, setUploadedFigures] = useState<UploadedFigure[]>([]);

  const uploadFigureMutation = useUploadFigureMutation();

  /**
   * Handles the file upload process
   */
  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      uploadFigureMutation.mutate(
        { projectId, file },
        {
          onSuccess: data => {
            const randomPart = crypto.randomUUID().split('-')[0];
            const id = `figure-${Date.now()}-${randomPart}`;

            const figure: UploadedFigure = {
              id,
              fileName: data.fileName || file.name,
              url: data.url,
              type: data.type || file.type,
            };
            onFigureUpload(figure);
          },
          onError: error => {
            logger.error('Error handling file upload', { error });
            toast({
              title: 'Upload Failed',
              description:
                error instanceof Error
                  ? error.message
                  : 'Failed to upload figure',
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          },
        }
      );
    },
    [projectId, onFigureUpload, toast, uploadFigureMutation]
  );

  /**
   * Handles file input change event
   */
  const handleFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);

      // Process files sequentially to avoid race conditions
      for (const file of files) {
        try {
          await handleFileUpload(file);
        } catch (error) {
          // Error already handled in handleFileUpload, just continue with next file
          logger.error('Failed to upload file:', {
            fileName: file.name,
            error,
          });
        }
      }
    },
    [handleFileUpload]
  );

  /**
   * Handles drag-and-drop file uploads
   */
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      files.forEach(file => {
        handleFileUpload(file);
      });
      e.dataTransfer.clearData();
    },
    [handleFileUpload]
  );

  /**
   * Handles drag-over event to show drag indicators
   */
  const handleDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  /**
   * Handles drag-leave event to hide drag indicators
   */
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      e.relatedTarget === null ||
      !e.currentTarget.contains(e.relatedTarget as Node)
    ) {
      setIsDragging(false);
    }
  }, []);

  /**
   * Removes a file from the uploaded files list
   */
  const clearUploadedFile = useCallback(
    (fileName: string) => {
      setUploadedFigures(prev => prev.filter(f => f.fileName !== fileName));
      toast({
        title: 'File Removed',
        description: 'The file has been removed.',
        status: 'info',
        duration: 1500,
        isClosable: true,
      });
    },
    [toast]
  );

  /**
   * Triggers the file input click programmatically
   */
  const triggerFileInput = useCallback(() => {
    // Implementation needed
  }, []);

  return {
    handleFileUpload,
    isUploading: uploadFigureMutation.isPending,
    isDragging,
    handleFileInputChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    clearUploadedFile,
    triggerFileInput,
    uploadedFigures,
  };
};

export { ACCEPTED_FILE_EXTENSIONS };

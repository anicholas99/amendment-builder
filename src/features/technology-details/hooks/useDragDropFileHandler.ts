import { useState, useCallback, useRef } from 'react';
import { logger } from '@/utils/clientLogger';

interface UseDragDropFileHandlerProps {
  onFileUpload: (file: File) => Promise<void>;
}

// Helper function to create a timeout promise without setTimeout
const createTimeoutPromise = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    const startTime = Date.now();
    const checkTimeout = () => {
      if (Date.now() - startTime >= ms) {
        reject(new Error('Upload timeout - file processing took too long'));
      } else {
        requestAnimationFrame(checkTimeout);
      }
    };
    requestAnimationFrame(checkTimeout);
  });
};

export const useDragDropFileHandler = ({
  onFileUpload,
}: UseDragDropFileHandlerProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      setIsUploading(true);
      setUploadingFiles(files.map(f => f.name));

      try {
        // Add timeout wrapper for each file upload
        const uploadWithTimeout = (file: File) => {
          return Promise.race([
            onFileUpload(file),
            createTimeoutPromise(60000), // 60 second timeout
          ]);
        };

        const results = await Promise.allSettled(
          files.map(file => uploadWithTimeout(file))
        );

        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            logger.error(
              `Failed to upload file: ${files[index].name}`,
              result.reason
            );
          } else {
            logger.info(`Successfully uploaded file: ${files[index].name}`);
          }
        });
      } catch (error) {
        logger.error('Upload process failed:', error);
      } finally {
        setIsUploading(false);
        setUploadingFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [onFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      e.relatedTarget === null ||
      !e.currentTarget.contains(e.relatedTarget as Node)
    ) {
      setIsDragging(false);
    }
  }, []);

  const handleFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      setIsUploading(true);
      setUploadingFiles(files.map(f => f.name));

      try {
        // Add timeout wrapper for each file upload
        const uploadWithTimeout = (file: File) => {
          return Promise.race([
            onFileUpload(file),
            createTimeoutPromise(60000), // 60 second timeout
          ]);
        };

        const results = await Promise.allSettled(
          files.map(file => uploadWithTimeout(file))
        );

        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            logger.error(
              `Failed to upload file: ${files[index].name}`,
              result.reason
            );
          } else {
            logger.info(`Successfully uploaded file: ${files[index].name}`);
          }
        });
      } catch (error) {
        logger.error('Upload process failed:', error);
      } finally {
        setIsUploading(false);
        setUploadingFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [onFileUpload]
  );

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    isDragging,
    isUploading,
    uploadingFiles,
    fileInputRef,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleFileInputChange,
    triggerFileInput,
  };
};

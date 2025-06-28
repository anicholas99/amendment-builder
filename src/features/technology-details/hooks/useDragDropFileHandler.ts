import { useState, useCallback, useRef } from 'react';
import { logger } from '@/lib/monitoring/logger';

interface UseDragDropFileHandlerProps {
  onFileUpload: (file: File) => Promise<void>;
}

export const useDragDropFileHandler = ({
  onFileUpload,
}: UseDragDropFileHandlerProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      setIsUploading(true);
      setUploadingFiles(files.map(f => f.name));

      try {
        const results = await Promise.allSettled(
          files.map(file => onFileUpload(file))
        );

        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            logger.error(
              `Failed to upload file: ${files[index].name}`,
              result.reason
            );
          }
        });
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

  const handleDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

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

  const handleFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      setIsUploading(true);
      setUploadingFiles(files.map(f => f.name));

      try {
        const results = await Promise.allSettled(
          files.map(file => onFileUpload(file))
        );

        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            logger.error(
              `Failed to upload file: ${files[index].name}`,
              result.reason
            );
          }
        });
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

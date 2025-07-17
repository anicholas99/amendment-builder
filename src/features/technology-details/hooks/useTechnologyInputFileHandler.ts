import React, { useState, useCallback } from 'react';
import { logger } from '@/utils/clientLogger';
import { useToast } from '@/hooks/useToastWrapper';
import { useUploadFigureMutation } from '@/hooks/api/useInvention';
import {
  extractFigureNumber,
  reorderFigures,
  resetFigureNumbers,
} from '../utils/figureAssignment';

import { ACCEPTED_FILE_EXTENSIONS } from '../constants/fileConstants';

export interface UploadedFigure {
  id: string;
  fileName: string;
  url: string;
  type: string;
  assignedNumber: string;
  detectedNumber: string | null;
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
  reorderUploadedFigures: (fromIndex: number, toIndex: number) => void;
  resetFigureNumbering: () => void;
  updateFigureNumber: (figureId: string, newNumber: string) => void;
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
   * Get the next available figure number
   */
  const getNextFigureNumber = useCallback(() => {
    if (uploadedFigures.length === 0) return '1';

    // Extract numeric parts from figure numbers and find the highest
    const numbers = uploadedFigures
      .map(f => {
        const match = f.assignedNumber.match(/^(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => n > 0);

    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    return (maxNumber + 1).toString();
  }, [uploadedFigures]);

  /**
   * Get the next sequential figure number based on current figures array
   */
  const getNextSequentialNumber = useCallback(
    (currentFigures: UploadedFigure[]) => {
      if (currentFigures.length === 0) return '1';

      // Extract numeric parts from figure numbers and find the highest
      const numbers = currentFigures
        .map(f => {
          const match = f.assignedNumber.match(/^(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(n => n > 0);

      const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
      return (maxNumber + 1).toString();
    },
    []
  );

  /**
   * Handles the file upload process
   */
  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file) return;

      try {
        const data = await uploadFigureMutation.mutateAsync({
          projectId,
          file,
        });

        const randomPart = crypto.randomUUID().split('-')[0];
        const id = `figure-${Date.now()}-${randomPart}`;

        // Auto-detect figure number from filename
        const detectedNumber = extractFigureNumber(file.name);

        // Create the figure with assignment logic inside state update to avoid race conditions
        let newFigure: UploadedFigure;

        setUploadedFigures(prev => {
          // Check if detected number is already taken using current state
          const isNumberTaken =
            detectedNumber !== null &&
            prev.some(f => f.assignedNumber === detectedNumber);

          // Assign number: use detected if available and not taken, otherwise use next sequential
          const assignedNumber =
            !isNumberTaken && detectedNumber !== null
              ? detectedNumber
              : getNextSequentialNumber(prev);

          newFigure = {
            id,
            fileName: data.filename || file.name,
            url: data.url,
            type: file.type,
            assignedNumber,
            detectedNumber,
          };

          return [...prev, newFigure];
        });

        onFigureUpload(newFigure!);
      } catch (error) {
        logger.error('Error handling file upload', { error });
        toast({
          title: 'Upload Failed',
          description:
            error instanceof Error ? error.message : 'Failed to upload figure',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        throw error; // Re-throw to handle in the calling function
      }
    },
    [
      projectId,
      onFigureUpload,
      toast,
      uploadFigureMutation,
      getNextSequentialNumber,
    ]
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
    async (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);

      // Process files sequentially to match handleFileInputChange behavior
      for (const file of files) {
        try {
          await handleFileUpload(file);
        } catch (error) {
          logger.error('Failed to upload file:', {
            fileName: file.name,
            error,
          });
        }
      }

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
      setUploadedFigures(prev => {
        const filtered = prev.filter(f => f.fileName !== fileName);
        // Reset numbering after removal to avoid gaps - simple sequential numbering
        return filtered.map((figure, index) => ({
          ...figure,
          assignedNumber: (index + 1).toString(),
        }));
      });
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
   * Reorder figures and update their assigned numbers
   */
  const reorderUploadedFigures = useCallback(
    (fromIndex: number, toIndex: number) => {
      setUploadedFigures(prev => {
        const result = [...prev];
        const [movedItem] = result.splice(fromIndex, 1);
        result.splice(toIndex, 0, movedItem);

        // Reassign numbers based on new order
        return result.map((figure, index) => ({
          ...figure,
          assignedNumber: (index + 1).toString(),
        }));
      });
    },
    []
  );

  /**
   * Reset all figure numbers to sequential order
   */
  const resetFigureNumbering = useCallback(() => {
    setUploadedFigures(prev =>
      prev.map((figure, index) => ({
        ...figure,
        assignedNumber: (index + 1).toString(),
      }))
    );
    toast({
      title: 'Figures Renumbered',
      description: 'Figure numbers have been reset to sequential order.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  /**
   * Update a specific figure's assigned number
   */
  const updateFigureNumber = useCallback(
    (figureId: string, newNumber: string) => {
      // Validate the new number format (should be number optionally followed by letters)
      const isValid =
        /^\d+[A-Za-z]*$/.test(newNumber.trim()) && newNumber.trim().length <= 4;

      if (!isValid) {
        toast({
          title: 'Invalid Figure Number',
          description:
            'Figure number must be a number optionally followed by letters (e.g., 1, 1A, 2B).',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const formattedNumber = newNumber.trim().toUpperCase();

      setUploadedFigures(prev => {
        const updated = prev.map(figure => {
          if (figure.id === figureId) {
            return { ...figure, assignedNumber: formattedNumber };
          }
          return figure;
        });
        return updated;
      });

      toast({
        title: 'Figure Number Updated',
        description: `Figure number changed to ${formattedNumber}.`,
        status: 'success',
        duration: 2000,
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
    reorderUploadedFigures,
    resetFigureNumbering,
    updateFigureNumber,
  };
};

export { ACCEPTED_FILE_EXTENSIONS };

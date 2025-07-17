import { useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/utils/clientLogger';
import { useToast } from '@/hooks/useToastWrapper';
import { useFigureService } from '@/contexts/ClientServicesContext';
import { queryKeys } from '@/config/reactQueryConfig';
import type { FiguresWithIds, FigureWithId } from '@/hooks/api/useFigures';

interface UseFigureUploadOptions {
  projectId?: string;
  figures: FiguresWithIds;
  figureKeys: string[];
  currentIndex: number;
}

interface UseFigureUploadResult {
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileInput: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => Promise<void>;
  handleReplaceImage: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => Promise<void>;
  handleDroppedFile: (file: File) => Promise<void>;
  validateImageFile: (file: File) => { isValid: boolean; error?: string };
}

/**
 * Hook for handling figure upload operations
 * Manages file validation, upload to blob storage, and cache updates
 */
export function useFigureUpload({
  projectId,
  figures,
  figureKeys,
  currentIndex,
}: UseFigureUploadOptions): UseFigureUploadResult {
  const figureService = useFigureService();
  const toast = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File validation helper
  const validateImageFile = useCallback(
    (file: File): { isValid: boolean; error?: string } => {
      if (!file.type.startsWith('image/')) {
        return { isValid: false, error: 'Please select an image file' };
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return {
          isValid: false,
          error: 'Please select an image smaller than 10MB',
        };
      }

      return { isValid: true };
    },
    []
  );

  // Core upload logic used by all upload methods
  const uploadFigureFile = useCallback(
    async (file: File, figNum: string) => {
      if (!projectId) {
        toast({
          title: 'No project selected',
          description: 'Please select a project before uploading',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'bottom-right',
        });
        return false;
      }

      // Ensure the figure exists in our data before uploading
      if (!figures[figNum]) {
        logger.warn('Attempting to upload to non-existent figure', {
          figNum,
          figureKeys,
          availableFigures: Object.keys(figures),
        });

        // Check if this is the initial FIG. 1 that should be auto-created
        if (figNum === 'FIG. 1' && Object.keys(figures).length === 0) {
          toast({
            title: 'Setting up figure',
            description:
              'Your first figure is being created. Please try again in a moment.',
            status: 'info',
            duration: 3000,
            isClosable: true,
            position: 'bottom-right',
          });
        } else {
          toast({
            title: 'Figure not ready',
            description:
              'Please wait for the figure to be created before uploading',
            status: 'warning',
            duration: 3000,
            isClosable: true,
            position: 'bottom-right',
          });
        }
        return false;
      }

      logger.info('[useFigureUpload] Starting figure upload', {
        figNum,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        projectId,
      });

      const result = await figureService.uploadFigure(projectId, file, figNum);

      logger.info('[useFigureUpload] Upload response received', {
        figNum,
        result,
        resultUrl: result?.url,
        resultFileName: result?.fileName,
      });

      if (result && result.url) {
        // Optimistically update the figures cache immediately
        queryClient.setQueryData<FiguresWithIds>(
          queryKeys.projects.figures(projectId),
          old => {
            const draft: FiguresWithIds = structuredClone(old || {});
            const existingFigure = draft[figNum] || {
              description: '',
              type: 'image',
              content: '',
            };
            draft[figNum] = {
              ...existingFigure,
              type: 'image',
              // Set the image URL for immediate display
              image: `${result.url}?v=${Date.now()}`,
              _id: existingFigure._id, // Preserve the ID
            } as FigureWithId;
            return draft;
          }
        );

        toast({
          title: 'Image uploaded',
          status: 'success',
          duration: 2000,
          isClosable: true,
          position: 'bottom-right',
        });

        return true;
      }

      return false;
    },
    [projectId, figures, figureKeys, figureService, queryClient, toast]
  );

  // Handle file input change
  const handleFileInput = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      const validation = validateImageFile(file);

      if (!validation.isValid) {
        toast({
          title: 'Invalid file',
          description: validation.error,
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'bottom-right',
        });
        return;
      }

      try {
        const figNum = figureKeys[currentIndex] || 'FIG. 1';
        await uploadFigureFile(file, figNum);
      } catch (error) {
        logger.error('Error uploading file', { error });
        toast({
          title: 'Upload failed',
          description: 'There was an error uploading the image',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'bottom-right',
        });
      }
    },
    [currentIndex, figureKeys, validateImageFile, uploadFigureFile, toast]
  );

  // Handle replacing an existing image
  const handleReplaceImage = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files?.length || !projectId) return;

      const file = event.target.files[0];
      const figNum = figureKeys[currentIndex] || 'FIG. 1';

      logger.info(`Replacing image for ${figNum} with ${file.name}`);

      try {
        // Check if the current figure has an image to replace
        const currentFigure = figures[figNum];
        if (!currentFigure?.image) {
          toast({
            title: 'No image to replace',
            description: 'Please add an image first',
            status: 'warning',
            duration: 3000,
            isClosable: true,
            position: 'bottom-right',
          });
          return;
        }

        await uploadFigureFile(file, figNum);
      } catch (error) {
        logger.error('Error replacing image', { error });
        toast({
          title: 'Replace failed',
          description: 'There was an error replacing the image',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'bottom-right',
        });
      } finally {
        if (event.target) {
          event.target.value = '';
        }
      }
    },
    [currentIndex, figureKeys, figures, projectId, uploadFigureFile, toast]
  );

  // Handle dropped files
  const handleDroppedFile = useCallback(
    async (file: File) => {
      if (!projectId) return;

      const validation = validateImageFile(file);
      if (!validation.isValid) {
        toast({
          title: 'Invalid file type',
          description: validation.error,
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'bottom-right',
        });
        return;
      }

      try {
        const figNum = figureKeys[currentIndex] || 'FIG. 1';
        await uploadFigureFile(file, figNum);
      } catch (error) {
        logger.error('Error uploading dropped file', { error });
        toast({
          title: 'Upload failed',
          description: 'There was an error uploading the image',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'bottom-right',
        });
      }
    },
    [
      currentIndex,
      figureKeys,
      projectId,
      validateImageFile,
      uploadFigureFile,
      toast,
    ]
  );

  return {
    fileInputRef,
    handleFileInput,
    handleReplaceImage,
    handleDroppedFile,
    validateImageFile,
  };
}

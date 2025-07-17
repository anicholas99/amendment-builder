import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/useToastWrapper';
import { logger } from '@/utils/clientLogger';
import { useUploadPatentFile } from '@/hooks/api/useUploadPatentFile';
import { InventionClientService } from '@/client/services/invention.client-service';
import { apiFetch } from '@/lib/api/apiClient';

/**
 * Hook for managing text file uploads in technology details
 * Saves files as documents linked to the project
 * Manages extracted text display in the textarea for user review
 */
export const useFileManagement = (
  projectId?: string,
  textInput?: string,
  setTextInput?: (value: string | ((prev: string) => string)) => void
) => {
  const toast = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{
      id: string;
      name: string;
      includeInProcessing: boolean;
    }>
  >([]);
  const uploadPatentFileMutation = useUploadPatentFile();

  const handleTextFileUpload = useCallback(
    async (file: File) => {
      // Only handle non-image files
      if (file.type.startsWith('image/')) {
        return false; // Let the caller handle image uploads
      }

      if (!projectId) {
        logger.warn(
          '[useFileManagement] No project ID provided, cannot upload file'
        );
        toast({
          title: 'Upload Failed',
          description: 'No project selected',
          status: 'error',
          duration: 3000,
          position: 'bottom-right',
        });
        return false;
      }

      try {
        // Upload file and link to project (no text extraction yet)
        const result = await uploadPatentFileMutation.mutateAsync({
          projectId,
          file,
          linkToProject: true, // Always link to project
          fileType: 'uploaded-doc',
        });

        // Add to uploaded files list with default include = true
        const newFile = {
          id: result.file.id,
          name: file.name,
          includeInProcessing: true, // Default to included
        };

        setUploadedFiles(prev => [...prev, newFile]);

        // Auto-add extracted text to textarea since it's included by default
        if (projectId && setTextInput) {
          try {
            const extractedTexts =
              await InventionClientService.getExtractedTextFromFiles(
                projectId,
                [result.file.id]
              );

            const extractedData = extractedTexts[result.file.id];
            if (extractedData && extractedData.extractedText) {
              const separator = `\n\n--- ${extractedData.name} ---\n`;
              const textToAdd = `${separator}${extractedData.extractedText}`;

              setTextInput(prev => {
                const currentText = prev || '';
                return currentText.trim().length > 0
                  ? `${currentText}${textToAdd}`
                  : textToAdd.trim();
              });

              logger.info(
                '[useFileManagement] Added extracted text to textarea',
                {
                  fileName: extractedData.name,
                  textLength: extractedData.extractedText?.length || 0,
                }
              );
            }
          } catch (error) {
            logger.warn(
              '[useFileManagement] Failed to auto-add extracted text',
              {
                fileName: file.name,
                error: error instanceof Error ? error.message : String(error),
              }
            );
          }
        }

        toast({
          title: 'File Uploaded',
          description: `${file.name} uploaded successfully`,
          status: 'success',
          duration: 3000,
          position: 'bottom-right',
        });

        logger.info('[useFileManagement] File uploaded successfully', {
          fileName: file.name,
          fileId: result.file.id,
          projectId,
        });

        return true;
      } catch (error) {
        logger.error('[useFileManagement] Failed to upload file:', {
          fileName: file.name,
          projectId,
          error: error instanceof Error ? error.message : String(error),
        });

        toast({
          title: 'Upload Failed',
          description: `Failed to upload ${file.name}`,
          status: 'error',
          duration: 5000,
          position: 'bottom-right',
        });

        throw error;
      }
    },
    [uploadPatentFileMutation, toast, projectId, setTextInput]
  );

  const handleRemoveTextFile = useCallback(
    async (fileName: string) => {
      const fileToRemove = uploadedFiles.find(f => f.name === fileName);
      if (!fileToRemove || !projectId) return;

      try {
        // Delete the file from the database
        const response = await apiFetch(
          `/api/projects/${projectId}/documents/${fileToRemove.id}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to delete file from database');
        }

        // Remove from UI state
        setUploadedFiles(prev => prev.filter(f => f.name !== fileName));

        // Remove extracted text from textarea if it was included
        if (fileToRemove.includeInProcessing && setTextInput) {
          const fileMarker = `--- ${fileName} ---`;
          setTextInput(prev => {
            const lines = prev.split('\n');
            const startIdx = lines.findIndex(line => line.includes(fileMarker));
            if (startIdx === -1) return prev;

            // Find the end of this file's content (next file marker or end)
            let endIdx = lines.findIndex(
              (line, idx) =>
                idx > startIdx && line.includes('---') && line.includes('---')
            );
            if (endIdx === -1) endIdx = lines.length;

            // Remove the separator line and content
            const startRemoveIdx =
              startIdx > 0 && lines[startIdx - 1].trim() === ''
                ? startIdx - 1
                : startIdx;
            lines.splice(startRemoveIdx, endIdx - startRemoveIdx);

            return lines.join('\n').trim();
          });
        }

        toast({
          title: 'File Removed',
          description: `${fileName} has been removed`,
          status: 'info',
          duration: 2000,
          position: 'bottom-right',
        });

        logger.info('[useFileManagement] File removed successfully', {
          fileName,
          fileId: fileToRemove.id,
          projectId,
        });
      } catch (error) {
        logger.error('[useFileManagement] Failed to remove file', {
          fileName,
          fileId: fileToRemove.id,
          projectId,
          error: error instanceof Error ? error.message : String(error),
        });

        toast({
          title: 'Remove Failed',
          description: `Failed to remove ${fileName}`,
          status: 'error',
          duration: 3000,
          position: 'bottom-right',
        });
      }
    },
    [uploadedFiles, setTextInput, toast, projectId]
  );

  const toggleFileInProcessing = useCallback(
    async (fileName: string) => {
      const file = uploadedFiles.find(f => f.name === fileName);
      if (!file || !projectId) return;

      const newIncludeState = !file.includeInProcessing;

      // Update the file state
      setUploadedFiles(prev =>
        prev.map(f =>
          f.name === fileName
            ? { ...f, includeInProcessing: newIncludeState }
            : f
        )
      );

      // Add or remove extracted text from textarea
      if (setTextInput) {
        if (newIncludeState) {
          // Adding file - fetch and add extracted text
          try {
            const extractedTexts =
              await InventionClientService.getExtractedTextFromFiles(
                projectId,
                [file.id]
              );

            const extractedData = extractedTexts[file.id];
            if (extractedData && extractedData.extractedText) {
              const separator = `\n\n--- ${extractedData.name} ---\n`;
              const textToAdd = `${separator}${extractedData.extractedText}`;

              setTextInput(prev => {
                const currentText = prev || '';
                return currentText.trim().length > 0
                  ? `${currentText}${textToAdd}`
                  : textToAdd.trim();
              });

              logger.info(
                '[useFileManagement] Added extracted text to textarea',
                {
                  fileName: extractedData.name,
                  textLength: extractedData.extractedText.length,
                }
              );
            }
          } catch (error) {
            logger.error('[useFileManagement] Failed to add extracted text', {
              fileName: file.name,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        } else {
          // Removing file - remove extracted text
          const fileMarker = `--- ${file.name} ---`;
          setTextInput(prev => {
            const lines = prev.split('\n');
            const startIdx = lines.findIndex(line => line.includes(fileMarker));
            if (startIdx === -1) return prev;

            // Find the end of this file's content
            let endIdx = lines.findIndex(
              (line, idx) =>
                idx > startIdx && line.includes('---') && line.includes('---')
            );
            if (endIdx === -1) endIdx = lines.length;

            // Remove the separator line and content
            const startRemoveIdx =
              startIdx > 0 && lines[startIdx - 1].trim() === ''
                ? startIdx - 1
                : startIdx;
            lines.splice(startRemoveIdx, endIdx - startRemoveIdx);

            return lines.join('\n').trim();
          });

          logger.info(
            '[useFileManagement] Removed extracted text from textarea',
            {
              fileName: file.name,
            }
          );
        }
      }
    },
    [uploadedFiles, projectId, setTextInput]
  );

  const getFilesForProcessing = useCallback(() => {
    return uploadedFiles.filter(f => f.includeInProcessing);
  }, [uploadedFiles]);

  return {
    uploadedFiles,
    handleTextFileUpload,
    handleRemoveTextFile,
    toggleFileInProcessing,
    getFilesForProcessing,
  };
};

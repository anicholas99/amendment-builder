import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { logger } from '@/lib/monitoring/logger';
import { useExtractTextMutation } from '@/hooks/api/useInvention';

/**
 * Hook for managing text file uploads and removals in technology details
 * Handles the text extraction and content merging logic
 */
export const useFileManagement = (
  textInput: string,
  setTextInput: (value: string | ((prev: string) => string)) => void
) => {
  const toast = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const extractTextMutation = useExtractTextMutation();

  const handleTextFileUpload = useCallback(
    async (file: File) => {
      // Only handle non-image files
      if (file.type.startsWith('image/')) {
        return false; // Let the caller handle image uploads
      }

      setUploadedFiles(prev => [...prev, file.name]);

      try {
        const data = await extractTextMutation.mutateAsync(file);
        const separator = `\n\n--- ${file.name} ---\n`;
        const newText =
          textInput.trim().length > 0
            ? `${textInput}${separator}${data}`
            : `${separator}${data}`;
        setTextInput(newText);

        toast({
          title: 'Text Extracted',
          description: `Successfully extracted text from ${file.name}`,
          status: 'success',
          duration: 3000,
          position: 'bottom-right',
        });
        return true;
      } catch (error) {
        logger.error('Failed to extract text:', error);
        setUploadedFiles(prev => prev.filter(f => f !== file.name));
        toast({
          title: 'Extraction Failed',
          description: `Failed to extract text from ${file.name}`,
          status: 'error',
          duration: 5000,
          position: 'bottom-right',
        });
        throw error;
      }
    },
    [extractTextMutation, textInput, setTextInput, toast]
  );

  const handleRemoveTextFile = useCallback(
    (fileName: string) => {
      setUploadedFiles(prev => prev.filter(f => f !== fileName));
      const fileMarker = `--- ${fileName} ---`;
      setTextInput(prev => {
        const lines = prev.split('\n');
        const startIdx = lines.findIndex(line => line.includes(fileMarker));
        if (startIdx === -1) return prev;
        let endIdx = lines.findIndex(
          (line, idx) =>
            idx > startIdx && line.includes('---') && line.includes('---')
        );
        if (endIdx === -1) endIdx = lines.length;
        lines.splice(startIdx - 1, endIdx - startIdx + 1);
        return lines.join('\n').trim();
      });
      toast({
        title: 'File Removed',
        description: `${fileName} has been removed`,
        status: 'info',
        duration: 2000,
        position: 'bottom-right',
      });
    },
    [setTextInput, toast]
  );

  return {
    uploadedFiles,
    handleTextFileUpload,
    handleRemoveTextFile,
  };
};

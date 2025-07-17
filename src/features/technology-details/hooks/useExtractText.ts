/**
 * React Query hook for text extraction operations
 * Used in Technology Details feature for extracting text from uploaded files
 */
import { useToast } from '@/utils/toast';
import { logger } from '@/utils/clientLogger';
import { useExtractTextMutation as useApiExtractTextMutation } from '@/hooks/api/useInvention';

/**
 * Hook for extracting text from uploaded files (PDF, DOCX, etc.)
 */
export const useExtractText = () => {
  const toast = useToast();
  const extractTextMutation = useApiExtractTextMutation();

  const extract = (file: File) => {
    return extractTextMutation.mutate(file, {
      onSuccess: (data, variables) => {
        toast.success('Text extracted successfully');
        logger.info('Text extracted from file', {
          fileName: variables.name,
        });
      },
    });
  };

  return {
    ...extractTextMutation,
    extractText: extract,
    isExtracting: extractTextMutation.isPending,
  };
};

/**
 * Hook for extracting text with progress tracking
 * Useful for large files where extraction might take time
 */
export const useExtractTextWithProgress = () => {
  const baseMutation = useExtractText();

  return {
    ...baseMutation,
    extractTextAsync: baseMutation.mutateAsync,
    extractionError: baseMutation.error,
    extractedData: baseMutation.data,
    reset: baseMutation.reset,
  };
};

/**
 * React Hook for Patent PDF Retrieval
 * 
 * Provides functionality to retrieve and cache patent PDFs for examiner-cited prior art
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/apiClient';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/clientLogger';

export interface PatentPdfRetrievalRequest {
  projectId: string;
  patentNumbers: string[];
  fileType?: 'cited-reference' | 'examiner-citation';
  forceRefresh?: boolean;
}

export interface PatentPdfRetrievalResult {
  patentNumber: string;
  success: boolean;
  priorArtId?: string;
  source?: 'cache' | 'patbase' | 'uspto' | 'google_patents';
  error?: string;
}

export interface PatentPdfRetrievalResponse {
  success: boolean;
  results: PatentPdfRetrievalResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    fromCache: number;
    fromPatbase: number;
    fromUSPTO: number;
    fromGooglePatents: number;
  };
}

/**
 * Hook for retrieving patent PDFs
 */
export function usePatentPdfRetrieval() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (request: PatentPdfRetrievalRequest): Promise<PatentPdfRetrievalResponse> => {
      logger.info('[usePatentPdfRetrieval] Starting PDF retrieval', {
        projectId: request.projectId,
        patentCount: request.patentNumbers.length,
        fileType: request.fileType,
      });

      const response = await apiFetch(
        `/api/projects/${request.projectId}/retrieve-patent-pdf`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            patentNumbers: request.patentNumbers,
            fileType: request.fileType || 'examiner-citation',
            forceRefresh: request.forceRefresh || false,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to retrieve patent PDFs');
      }

      const data = await response.json();
      
      logger.info('[usePatentPdfRetrieval] PDF retrieval completed', {
        projectId: request.projectId,
        summary: data.summary,
      });

      return data;
    },

    onSuccess: (data, variables) => {
      // Invalidate related queries to refresh UI
      queryClient.invalidateQueries({
        queryKey: ['project-prior-art', variables.projectId],
      });
      
      queryClient.invalidateQueries({
        queryKey: ['saved-prior-art', variables.projectId],
      });

      // Show success toast
      const { summary } = data;
      if (summary.successful > 0) {
        let message = `Successfully retrieved ${summary.successful} patent PDF${summary.successful > 1 ? 's' : ''}`;
        
        if (summary.fromCache > 0) {
          message += ` (${summary.fromCache} from cache)`;
        }
        
        toast({
          title: 'Patent PDFs Retrieved',
          description: message,
          variant: 'default',
        });
      }

      if (summary.failed > 0) {
        toast({
          title: 'Some PDFs Could Not Be Retrieved',
          description: `${summary.failed} out of ${summary.total} patent PDFs could not be retrieved. Check the results for details.`,
          variant: 'destructive',
        });
      }
    },

    onError: (error, variables) => {
      logger.error('[usePatentPdfRetrieval] PDF retrieval failed', {
        projectId: variables.projectId,
        error: error instanceof Error ? error.message : String(error),
      });

      toast({
        title: 'Patent PDF Retrieval Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  const retrievePatentPdfs = (request: PatentPdfRetrievalRequest) => {
    return mutation.mutateAsync(request);
  };

  return {
    retrievePatentPdfs,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

/**
 * Hook for retrieving a single patent PDF
 */
export function useSinglePatentPdfRetrieval() {
  const retrieval = usePatentPdfRetrieval();

  const retrieveSinglePatentPdf = async (
    projectId: string,
    patentNumber: string,
    options: {
      fileType?: 'cited-reference' | 'examiner-citation';
      forceRefresh?: boolean;
    } = {}
  ) => {
    const result = await retrieval.retrievePatentPdfs({
      projectId,
      patentNumbers: [patentNumber],
      ...options,
    });

    // Return the single result
    return result.results[0];
  };

  return {
    retrieveSinglePatentPdf,
    isLoading: retrieval.isLoading,
    error: retrieval.error,
    reset: retrieval.reset,
  };
}

/**
 * Hook for bulk patent PDF retrieval (for office actions)
 */
export function useBulkPatentPdfRetrieval() {
  const retrieval = usePatentPdfRetrieval();

  const retrieveBulkPatentPdfs = async (
    projectId: string,
    patentNumbers: string[],
    options: {
      fileType?: 'cited-reference' | 'examiner-citation';
      forceRefresh?: boolean;
    } = {}
  ) => {
    // Process in chunks to avoid overwhelming the server
    const CHUNK_SIZE = 10;
    const chunks: string[][] = [];
    
    for (let i = 0; i < patentNumbers.length; i += CHUNK_SIZE) {
      chunks.push(patentNumbers.slice(i, i + CHUNK_SIZE));
    }

    logger.info('[useBulkPatentPdfRetrieval] Processing patents in chunks', {
      totalPatents: patentNumbers.length,
      chunkCount: chunks.length,
      chunkSize: CHUNK_SIZE,
    });

    const allResults: PatentPdfRetrievalResult[] = [];
    let totalSummary = {
      total: 0,
      successful: 0,
      failed: 0,
      fromCache: 0,
      fromPatbase: 0,
      fromUSPTO: 0,
      fromGooglePatents: 0,
    };

    // Process chunks sequentially to avoid rate limiting
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      logger.info('[useBulkPatentPdfRetrieval] Processing chunk', {
        chunkIndex: i + 1,
        chunkSize: chunk.length,
      });

      const chunkResult = await retrieval.retrievePatentPdfs({
        projectId,
        patentNumbers: chunk,
        ...options,
      });

      allResults.push(...chunkResult.results);
      
      // Aggregate summary
      totalSummary.total += chunkResult.summary.total;
      totalSummary.successful += chunkResult.summary.successful;
      totalSummary.failed += chunkResult.summary.failed;
      totalSummary.fromCache += chunkResult.summary.fromCache;
      totalSummary.fromPatbase += chunkResult.summary.fromPatbase;
      totalSummary.fromUSPTO += chunkResult.summary.fromUSPTO;
      totalSummary.fromGooglePatents += chunkResult.summary.fromGooglePatents;

      // Add delay between chunks if not the last chunk
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return {
      success: true,
      results: allResults,
      summary: totalSummary,
    };
  };

  return {
    retrieveBulkPatentPdfs,
    isLoading: retrieval.isLoading,
    error: retrieval.error,
    reset: retrieval.reset,
  };
} 
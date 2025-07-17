import { useState } from 'react';
import { logger } from '@/utils/clientLogger';
import { useToast } from '@/hooks/useToastWrapper';
import { useGenerateSuggestionsMutation } from '@/hooks/api/useAI';
import { InventionData } from '@/types/invention';
import { Suggestion } from '@/types/claimTypes';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { isDevelopment, isProduction } from '@/config/environment.client';

interface RequestParams {
  searchResults?: Array<{
    referenceNumber: string;
    title?: string;
    relevanceScore?: number;
  }>;
  parsedElements?: string[];
  claimText?: string;
  searchId?: string | null;
}

// Simple delay utility for demo purposes
const delay = (ms: number): Promise<void> =>
  new Promise(resolve => {
    const timer = window.setTimeout(resolve, ms);
    // Cleanup on unmount is handled by the component that uses this hook
    return timer as unknown as void;
  });

/**
 * Custom hook for API interactions
 */
export const useAPIInteractions = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const generateSuggestionsMutation = useGenerateSuggestionsMutation();

  /**
   * Analyze a patent disclosure
   * @returns The analyzed invention data
   */
  const analyzeDisclosure = async (): Promise<InventionData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate a delay to show loading state
      await delay(1500);

      // Create a mock invention as the response
      const mockInvention: InventionData = {
        title: 'Solar-Powered Agricultural Drone System',
        description:
          'A new drone system for agricultural monitoring with solar power capabilities.',
        summary:
          'This invention relates to a solar-powered drone system that can be used for agricultural monitoring purposes.',
        abstract:
          'A solar-powered drone system for agricultural monitoring with integrated charging system and crop analysis capabilities.',
        technical_field:
          'Drone systems, agricultural technology, renewable energy',
        features: [
          'Solar panel integration',
          'Lightweight frame',
          'Extended flight time',
          'Real-time crop monitoring',
          'Automated flight patterns',
        ],
        background:
          'Current agricultural drones have limited flight time due to battery constraints.',
        advantages: [
          'Extended flight time due to solar power',
          'Reduced operational costs',
          'Real-time data processing capabilities',
          'Environmental friendliness',
        ],
        claims: {
          '1': 'A solar-powered agricultural drone system comprising: a lightweight frame; solar panels integrated into wings; a power management system; a control unit; and agricultural monitoring sensors.',
          '2': 'The system of claim 1, wherein the solar panels are flexible thin-film panels.',
          '3': 'The system of claim 1, further comprising a data processing unit for real-time crop analysis.',
        },
      };

      setIsLoading(false);
      return mockInvention;
    } catch (err) {
      setIsLoading(false);
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);

      toast({
        title: 'Error analyzing disclosure',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      return null;
    }
  };

  /**
   * Generate AI suggestions for claims
   * @param analyzedInvention The analyzed invention data
   * @param claimNumber The claim number to generate suggestions for
   * @param requestParams Optional additional parameters including search results and parsed elements
   * @returns The suggestions
   */
  const generateSuggestions = async (
    analyzedInvention: InventionData,
    claimNumber: string,
    requestParams?: RequestParams
  ): Promise<Suggestion[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      if (
        requestParams &&
        requestParams.searchResults &&
        Array.isArray(requestParams.searchResults)
      ) {
        logger.info(
          `Using directly provided search results and parameters with ${requestParams.searchResults.length} results`
        );

        const data = await generateSuggestionsMutation.mutateAsync({
          parsedElements: (requestParams.parsedElements || []) as string[],
          searchResults: requestParams.searchResults || [],
          claimText:
            requestParams.claimText || getClaim1Text(analyzedInvention),
          inventionData: analyzedInvention,
          searchId: requestParams.searchId || null,
        });

        const suggestions = data.suggestions || [];

        setIsLoading(false);

        // Map the suggestions to the expected Suggestion type
        return suggestions.map((suggestion, index) => ({
          id: `sug_${Date.now()}_${index}`,
          type: (suggestion.type as Suggestion['type']) || 'other',
          text: suggestion.content,
          description: suggestion.content,
          claimNumber: claimNumber,
          priority: suggestion.priority || 'medium',
          applied: false,
          dismissed: false,
        }));
      }

      logger.warn(
        'No direct search parameters provided - this should not happen with the new workflow'
      );
      throw new ApplicationError(
        ErrorCode.VALIDATION_FAILED,
        'No search results provided. Please select a search and try again.'
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      logger.error('Error generating suggestions:', errorMessage);
      setError(errorMessage);
      setIsLoading(false);

      if (!isProduction) {
        logger.warn('Falling back to mock suggestions');
        return [
          {
            id: `sug_${Date.now()}`,
            type: 'narrowing',
            text: 'Consider clarifying the relationship between components.',
            description:
              'This would improve clarity and potentially overcome similar prior art.',
            claimNumber: claimNumber,
            priority: 'medium',
            applied: false,
            dismissed: false,
          },
        ];
      }

      return null;
    }
  };

  /**
   * Export the patent application
   * @param analyzedInvention The analyzed invention data
   * @param format The export format ('docx', 'pdf', 'json')
   * @returns The URL to download the exported file
   */
  const exportPatentApplication = async (
    analyzedInvention: InventionData,
    format: 'docx' | 'pdf' | 'json'
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      await delay(1500);

      const mockUrl = `/api/mock-export?format=${format}&timestamp=${Date.now()}`;

      setIsLoading(false);
      return mockUrl;
    } catch (err) {
      setIsLoading(false);
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);

      toast({
        title: 'Error exporting patent application',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      return null;
    }
  };

  return {
    isLoading,
    error,
    analyzeDisclosure,
    generateSuggestions,
    exportPatentApplication,
  };
};

export default useAPIInteractions;

const getClaim1Text = (invention: InventionData): string => {
  if (!invention || !invention.claims) return '';

  if (Array.isArray(invention.claims)) {
    return invention.claims[0] || '';
  }

  return invention.claims['1'] || '';
};

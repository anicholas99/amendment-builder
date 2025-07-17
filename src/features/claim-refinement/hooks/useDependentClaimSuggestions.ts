import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/useToastWrapper';
import { logger } from '@/utils/clientLogger';
import { FullAnalysisResponse } from '../../../types/priorArtAnalysisTypes';

interface UseDependentClaimSuggestionsOptions {
  analysisData: FullAnalysisResponse | null;
  onInsertClaim?: (
    afterClaimNumber: string,
    text: string,
    dependsOn: string
  ) => void;
}

/**
 * Custom hook for managing dependent claim suggestions
 * Extracts the complex suggestion logic from components
 */
export const useDependentClaimSuggestions = ({
  analysisData,
  onInsertClaim,
}: UseDependentClaimSuggestionsOptions) => {
  const toast = useToast();
  const [dismissedSuggestionIndexes, setDismissedSuggestionIndexes] = useState<
    number[]
  >([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSuggestionText, setEditingSuggestionText] = useState('');

  // Reset dismissed suggestions when analysis data changes
  useEffect(() => {
    if (analysisData) {
      setDismissedSuggestionIndexes([]);
    }
  }, [analysisData]);

  // Filter out dismissed suggestions
  const displayedSuggestions = useMemo(() => {
    if (!analysisData?.dependentClaimSuggestions) return [];

    // Handle type mismatch in API response
    const suggestions = analysisData.dependentClaimSuggestions as
      | string[]
      | string;

    // If it's a string, convert to array
    if (typeof suggestions === 'string') {
      return suggestions
        .split(/\n+/)
        .filter(line => !!line.trim())
        .filter((_, index) => !dismissedSuggestionIndexes.includes(index));
    }

    // If it's not an array either, return empty array
    if (!Array.isArray(suggestions)) {
      logger.warn(
        'dependentClaimSuggestions is neither string nor array:',
        suggestions
      );
      return [];
    }

    // Normal case - it's an array, filter it
    return suggestions.filter(
      (_, index) => !dismissedSuggestionIndexes.includes(index)
    );
  }, [analysisData?.dependentClaimSuggestions, dismissedSuggestionIndexes]);

  // Handler for inserting a dependent claim directly
  const handleInsertDependentClaim = (claimText: string) => {
    // Guard clause if onInsertClaim prop is not provided
    if (!onInsertClaim) {
      toast({
        title: 'Cannot add claim',
        description: 'Claim insertion function not available',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    // Parse the claim text
    const claimNumberMatch = claimText.match(/^(\d+)\.\s*(.*)/);
    let textWithoutNumber = claimNumberMatch ? claimNumberMatch[2] : claimText;

    // Check if the text already has a dependency statement
    const dependencyMatch = textWithoutNumber.match(
      /^(The\s+\w+\s+of\s+claim\s+\d+,\s+wherein\s+)(.*)/i
    );

    if (dependencyMatch) {
      // Text already has dependency phrasing, extract the actual claim text
      textWithoutNumber = dependencyMatch[2];

      // Try to extract the claim number it depends on
      const dependsOnMatch = dependencyMatch[1].match(/claim\s+(\d+)/i);
      const dependsOn = dependsOnMatch ? dependsOnMatch[1] : '1';

      // Insert with the extracted dependency
      onInsertClaim('1', textWithoutNumber, dependsOn);
    } else {
      // No dependency phrasing found, assume it should depend on claim 1
      onInsertClaim('1', textWithoutNumber, '1');
    }

    // Show success toast
    toast({
      title: 'Dependent claim added',
      description: 'The dependent claim has been added to your claim set',
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'bottom-right',
    });

    // If this suggestion was in the list, mark it as dismissed
    if (analysisData?.dependentClaimSuggestions) {
      const suggestions = analysisData.dependentClaimSuggestions as
        | string[]
        | string;
      let suggestionIndex = -1;

      if (typeof suggestions === 'string') {
        const suggestionsArray = suggestions
          .split(/\n+/)
          .filter(line => !!line.trim());
        suggestionIndex = suggestionsArray.findIndex(
          suggestion => suggestion === claimText
        );
      } else if (Array.isArray(suggestions)) {
        suggestionIndex = suggestions.findIndex(
          suggestion => suggestion === claimText
        );
      }

      if (suggestionIndex >= 0) {
        handleDismissSuggestion(suggestionIndex);
      }
    }

    // Switch to the main panel to see the new claim
    setTimeout(() => {
      const tabContainer = document.querySelector('[role="tablist"]');
      if (tabContainer) {
        const firstTab = tabContainer.querySelector('[role="tab"]');
        if (firstTab instanceof HTMLElement) {
          firstTab.click();
        }
      }
    }, 500);
  };

  // Handler for opening the edit modal
  const handleOpenEditModal = (suggestionText: string) => {
    setEditingSuggestionText(suggestionText);
    setIsEditModalOpen(true);
  };

  // Handler for saving edited claim text
  const handleSaveEditedClaim = (editedText: string) => {
    handleInsertDependentClaim(editedText);
  };

  // Handler for dismissing a suggestion
  const handleDismissSuggestion = (index: number) => {
    setDismissedSuggestionIndexes(prev => [...prev, index]);
  };

  return {
    displayedSuggestions,
    isEditModalOpen,
    editingSuggestionText,
    setIsEditModalOpen,
    handleInsertDependentClaim,
    handleOpenEditModal,
    handleSaveEditedClaim,
    handleDismissSuggestion,
  };
};

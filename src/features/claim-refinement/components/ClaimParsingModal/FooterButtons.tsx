import React from 'react';
import { Button } from '@/components/ui/button';
import { FiArrowRight, FiSearch } from 'react-icons/fi';
import { FooterButtonsProps } from './types';

const FooterButtons: React.FC<FooterButtonsProps> = ({
  currentStep,
  searchMode,
  isLoading,
  isGeneratingQueries,
  onClose,
  handleBack,
  generateQueries,
  handleExecuteWithEdited,
}) => {
  if (isLoading) {
    return null; // Don't show any buttons while loading
  }

  if (searchMode === 'basic') {
    // Basic mode now has same flow as advanced
    if (currentStep === 0) {
      return (
        <>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={generateQueries}
            variant="default"
            disabled={isGeneratingQueries}
          >
            {isGeneratingQueries ? (
              'Generating queries...'
            ) : (
              <>
                Generate Queries
                <FiArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </>
      );
    }

    if (currentStep === 1) {
      return (
        <>
          <Button onClick={handleBack} variant="outline">
            Back
          </Button>
          <Button onClick={handleExecuteWithEdited} variant="default">
            Execute Search
            <FiSearch className="ml-2 h-4 w-4" />
          </Button>
        </>
      );
    }

    if (currentStep === 2) {
      return (
        <Button onClick={onClose} variant="default">
          Close
        </Button>
      );
    }
  } else {
    // Advanced mode has multi-step flow
    if (currentStep === 0) {
      return (
        <>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={generateQueries}
            variant="default"
            disabled={isGeneratingQueries}
          >
            {isGeneratingQueries ? (
              'Generating queries...'
            ) : (
              <>
                Generate Queries
                <FiArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </>
      );
    }

    if (currentStep === 1) {
      return (
        <>
          <Button onClick={handleBack} variant="outline">
            Back
          </Button>
          <Button onClick={handleExecuteWithEdited} variant="default">
            Execute Search
            <FiSearch className="ml-2 h-4 w-4" />
          </Button>
        </>
      );
    }

    if (currentStep === 2) {
      return (
        <Button onClick={onClose} variant="default">
          Close
        </Button>
      );
    }
  }

  // Default return (should never reach here)
  return null;
};

export default FooterButtons;

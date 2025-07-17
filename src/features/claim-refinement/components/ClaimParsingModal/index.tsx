import React, { useState, useEffect } from 'react';
import { logger } from '@/utils/clientLogger';
import { useTemporaryState } from '@/hooks/useTemporaryState';
import { useToast } from '@/hooks/useToastWrapper';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';
import { CheckCircle, Circle } from 'lucide-react';

// Import components
import ElementSection from './ElementSection';
import QuerySection from './QuerySection';
import ConfirmationSection from './ConfirmationSection';
import FooterButtons from './FooterButtons';

// Import types and utilities
import { ClaimParsingModalProps, ParsedElement } from './types';
import {
  copyToClipboard,
  // generateSearchQueries,
  parseClaimText,
  saveParsedElements,
} from './utils';

/**
 * Modal component for parsing claims and generating search queries
 */
const ClaimParsingModal: React.FC<ClaimParsingModalProps> = ({
  isOpen,
  onClose,
  parsedElements: initialParsedElements,
  searchQueries: initialSearchQueries,
  isLoading,
  inventionData,
  searchMode,
  onExecuteSearch,
}) => {
  const { isDarkMode } = useThemeContext();

  // State for workflow steps
  const [currentStep, setCurrentStep] = useState(0);
  const steps =
    searchMode === 'advanced'
      ? ['Select Elements to Emphasize', 'Review Queries', 'Execute Search']
      : ['Select Elements', 'Review Queries', 'Execute Search'];

  // State for editable elements and queries
  const [editableParsedElements, setEditableParsedElements] = useState<
    ParsedElement[]
  >([]);
  const [editableSearchQueries, setEditableSearchQueries] = useState<string[]>(
    []
  );
  const [isGeneratingQueries, setIsGeneratingQueries] = useState(false);

  // State for tracking which query was copied using temporary state
  const [copiedQueryIndex, setCopiedQueryIndex] = useTemporaryState<
    number | null
  >(null, 2000);

  // Toast for feedback
  const toast = useToast();

  // Add state for warning dialog
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  // Reset editable content when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      logger.info('Modal opened with parsed elements:', {
        parsedElements: initialParsedElements,
      });
      logger.info('Modal opened with search queries:', {
        searchQueries: initialSearchQueries,
      });

      const elementsWithEmphasis = initialParsedElements.map(el => ({
        label: el.label,
        text: el.text,
        emphasized: el.emphasized !== undefined ? el.emphasized : true, // Default all elements to emphasized if not specified
      }));

      setEditableParsedElements(elementsWithEmphasis);
      setEditableSearchQueries([...initialSearchQueries]);
      setCopiedQueryIndex(null);
      setCurrentStep(0); // Always start at first step
    }
  }, [isOpen, initialParsedElements, initialSearchQueries, searchMode]);

  // Create a clipboard for all queries combined
  const allQueriesText = editableSearchQueries.join('\n\n');
  const [hasCopied, setHasCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(allQueriesText);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Copy failed',
        description: 'Could not copy text to clipboard',
        status: 'error',
        duration: 2000,
      });
    }
  };

  // Function to copy individual query
  const copyQuery = (index: number, text: string) => {
    copyToClipboard(text).then(
      () => {
        setCopiedQueryIndex(index); // Will automatically reset after 2 seconds
      },
      err => {
        toast({
          title: 'Copy failed',
          description: 'Could not copy text to clipboard',
          status: 'error',
          duration: 2000,
        });
      }
    );
  };

  // Handle element text change
  const handleElementTextChange = (index: number, newText: string) => {
    const updatedElements = [...editableParsedElements];
    updatedElements[index] = { ...updatedElements[index], text: newText };
    setEditableParsedElements(updatedElements);
  };

  // Handle element label change
  const handleElementLabelChange = (index: number, newLabel: string) => {
    const updatedElements = [...editableParsedElements];
    updatedElements[index] = { ...updatedElements[index], label: newLabel };
    setEditableParsedElements(updatedElements);
  };

  // Handle element emphasis change
  const handleElementEmphasisToggle = (index: number) => {
    const updatedElements = [...editableParsedElements];
    updatedElements[index] = {
      ...updatedElements[index],
      emphasized: !updatedElements[index].emphasized,
    };
    setEditableParsedElements(updatedElements);
  };

  // Handle query change
  const handleQueryChange = (index: number, newQuery: string) => {
    const updatedQueries = [...editableSearchQueries];
    updatedQueries[index] = newQuery;
    setEditableSearchQueries(updatedQueries);
  };

  // Generate queries based on emphasized elements
  const generateQueries = async () => {
    setIsGeneratingQueries(true);

    try {
      // const newQueries = await generateSearchQueries(
      //   editableParsedElements,
      //   inventionData
      // );
      const newQueries = ['placeholder query 1', 'placeholder query 2']; // Placeholder
      setEditableSearchQueries(newQueries);

      // Move to the next step
      setCurrentStep(1);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to regenerate search queries',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGeneratingQueries(false);
    }
  };

  // Execute search with edited content
  const handleExecuteWithEdited = () => {
    onExecuteSearch(editableParsedElements, editableSearchQueries);

    // In basic mode, we're done after executing
    if (searchMode === 'basic') {
      onClose();
    } else {
      // In advanced mode, show confirmation step
      setCurrentStep(2);
    }
  };

  // Go back to previous step
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Remove an element
  const handleRemoveElement = (index: number) => {
    const updatedElements = [...editableParsedElements];
    updatedElements.splice(index, 1);
    setEditableParsedElements(updatedElements);
  };

  // Handle close attempt
  const handleCloseAttempt = () => {
    // Always show warning dialog when trying to close, regardless of step or mode
    setIsWarningOpen(true);
  };

  // Handle warning dialog close
  const handleWarningClose = () => {
    setIsWarningOpen(false);
  };

  // Handle confirmed close
  const handleConfirmedClose = () => {
    setIsWarningOpen(false);
    onClose();
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ElementSection
            editableParsedElements={editableParsedElements}
            handleElementLabelChange={handleElementLabelChange}
            handleElementEmphasisToggle={handleElementEmphasisToggle}
            handleElementTextChange={handleElementTextChange}
            handleRemoveElement={handleRemoveElement}
          />
        );

      case 1:
        return (
          <QuerySection
            editableSearchQueries={editableSearchQueries}
            handleQueryChange={handleQueryChange}
            onCopy={onCopy}
            hasCopied={hasCopied}
            copyQuery={copyQuery}
            copiedQueryIndex={copiedQueryIndex}
          />
        );

      case 2:
        return (
          <ConfirmationSection
            emphasizedElementsCount={
              editableParsedElements.filter(el => el.emphasized).length
            }
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => handleCloseAttempt()}>
        <DialogContent className="max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {searchMode === 'advanced' ? 'Advanced Search' : 'Claim Analysis'}
            </DialogTitle>
          </DialogHeader>

          {searchMode === 'advanced' && (
            <div className="px-6 pt-2">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <React.Fragment key={index}>
                    <div className="flex items-center">
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full border-2',
                          index < currentStep
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : index === currentStep
                              ? 'border-blue-600 text-blue-600'
                              : 'border-gray-300 text-gray-400'
                        )}
                      >
                        {index < currentStep ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-medium">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <span
                        className={cn(
                          'ml-2 text-sm',
                          index <= currentStep ? 'font-medium' : 'text-gray-500'
                        )}
                      >
                        {step}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          'flex-1 mx-4 h-0.5',
                          index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                        )}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-6 py-6">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <p>Analyzing claim elements and generating search queries...</p>
                <Progress className="w-full" />
              </div>
            ) : (
              renderStepContent()
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <FooterButtons
              currentStep={currentStep}
              searchMode={searchMode}
              isLoading={isLoading}
              isGeneratingQueries={isGeneratingQueries}
              onClose={handleCloseAttempt}
              handleBack={handleBack}
              generateQueries={generateQueries}
              handleExecuteWithEdited={handleExecuteWithEdited}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Warning Dialog */}
      <AlertDialog open={isWarningOpen} onOpenChange={setIsWarningOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isLoading ? 'Search in Progress' : 'Cancel Search?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isLoading
                ? 'Please wait while we analyze your claim and prepare the search. This will only take a moment.'
                : 'Are you sure you want to cancel? Your progress will be lost.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleWarningClose}>
              {isLoading ? 'Wait' : 'Continue'}
            </AlertDialogCancel>
            {!isLoading && (
              <AlertDialogAction
                onClick={handleConfirmedClose}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                Cancel Search
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ClaimParsingModal;

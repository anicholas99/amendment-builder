import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/monitoring/logger';
import { useTemporaryState } from '@/hooks/useTemporaryState';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Box,
  Progress,
  VStack,
  Text,
  Stepper,
  Step,
  StepStatus,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  useClipboard,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react';

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
      logger.log('Modal opened with parsed elements:', {
        parsedElements: initialParsedElements,
      });
      logger.log('Modal opened with search queries:', {
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
  const { hasCopied, onCopy } = useClipboard(allQueriesText);

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
      <Modal
        isOpen={isOpen}
        onClose={handleCloseAttempt}
        size="xl"
        scrollBehavior="inside"
        closeOnOverlayClick={false}
        closeOnEsc={false}
      >
        <ModalOverlay />
        <ModalContent maxW="800px">
          <ModalHeader as="h3">
            {searchMode === 'advanced' ? 'Advanced Search' : 'Claim Analysis'}
          </ModalHeader>

          {searchMode === 'advanced' && (
            <Box px={6} pt={2}>
              <Stepper index={currentStep} colorScheme="blue" size="sm">
                {steps.map((step, index) => (
                  <Step key={index}>
                    <StepIndicator>
                      <StepStatus
                        complete={<StepIcon />}
                        incomplete={<StepNumber />}
                        active={<StepNumber />}
                      />
                    </StepIndicator>
                    <Box flexShrink="0">
                      <Text fontSize="sm">{step}</Text>
                    </Box>
                    <StepSeparator />
                  </Step>
                ))}
              </Stepper>
            </Box>
          )}

          <ModalBody pt={6}>
            {isLoading ? (
              <VStack spacing={4} py={8}>
                <Text>
                  Analyzing claim elements and generating search queries...
                </Text>
                <Progress
                  isIndeterminate
                  width="100%"
                  colorScheme="blue"
                  size="sm"
                  borderRadius="md"
                />
              </VStack>
            ) : (
              renderStepContent()
            )}
          </ModalBody>

          <ModalFooter>
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
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Warning Dialog */}
      <AlertDialog
        isOpen={isWarningOpen}
        leastDestructiveRef={cancelRef}
        onClose={handleWarningClose}
        motionPreset="slideInBottom"
      >
        <AlertDialogOverlay>
          <AlertDialogContent position="relative" zIndex="modal">
            <AlertDialogHeader
              fontSize="lg"
              fontWeight="bold"
              as="h3"
              pb={3}
              borderBottomWidth="1px"
            >
              {isLoading ? 'Search in Progress' : 'Cancel Search?'}
            </AlertDialogHeader>

            <AlertDialogBody pt={4}>
              {isLoading
                ? 'Please wait while we analyze your claim and prepare the search. This will only take a moment.'
                : 'Are you sure you want to cancel? Your progress will be lost.'}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={handleWarningClose}>
                {isLoading ? 'Wait' : 'Continue'}
              </Button>
              {!isLoading && (
                <Button colorScheme="red" onClick={handleConfirmedClose} ml={3}>
                  Cancel Search
                </Button>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default ClaimParsingModal;

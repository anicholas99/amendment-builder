import React from 'react';
import {
  Box,
  Heading,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Button,
  VStack,
  HStack,
  Progress,
} from '@chakra-ui/react';
import DeepAnalysisPanel from './DeepAnalysisPanel';
import ExaminerAnalysisPanel from './ExaminerAnalysisPanel';
import { ApplicationError, ErrorCode } from '@/lib/error';

interface CitationAnalysisPanelProps {
  type: 'deep' | 'examiner';
  selectedReference: string;
  onClose: () => void;
  isLoading: boolean;
  analysisData?: { highRelevanceElements?: Array<{ element: string; reasoning: string }>; overallAssessment?: { patentabilityScore?: number } } | null; // StructuredDeepAnalysis | StructuredExaminerAnalysis
  examinerAnalysis?: { examinerName?: string; citationCategories?: Array<{ category: string; citations: Array<string> }> } | null;
  onRunAnalysis: () => void;
  onApplyAmendmentToClaim1?: (original: string, revised: string) => void;
  error?: ApplicationError | Error | null;
  isExaminerAnalysisEnabled?: boolean;
  isRunningAnalysis?: boolean; // New prop to specifically track if analysis is being run
}

/**
 * Format reference number by removing dashes
 */
const formatReferenceNumber = (ref: string): string => {
  return ref.replace(/-/g, '');
};

/**
 * CitationAnalysisPanel - A unified component for displaying either deep analysis or examiner analysis
 * This reduces duplication and provides a consistent UI for both analysis types
 */
export const CitationAnalysisPanel: React.FC<CitationAnalysisPanelProps> = ({
  type,
  selectedReference,
  onClose,
  isLoading,
  analysisData,
  examinerAnalysis,
  onRunAnalysis,
  onApplyAmendmentToClaim1,
  error,
  isExaminerAnalysisEnabled = true,
  isRunningAnalysis = false,
}) => {
  const title = type === 'deep' ? 'Deep Analysis' : 'Examiner Perspective';
  const data = type === 'deep' ? analysisData : examinerAnalysis;

  // Determine if we're actively running a new analysis (not just loading existing data)
  // Only show running animation when explicitly running a new analysis
  const isActivelyRunning = isRunningAnalysis;

  return (
    <Box height="100%" display="flex" flexDirection="column" bg="bg.primary">
      {/* Scrollable content area */}
      <Box
        flex="1"
        overflowY="auto"
        pt={4}
        pr={4}
        pl={4}
        pb={0}
        className="custom-scrollbar"
      >
        {/* Only show running state when actively running analysis */}
        {isActivelyRunning && (
          <VStack spacing={4} py={8}>
            <HStack spacing={3}>
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="border.primary"
                color="blue.500"
                size="lg"
              />
              <Text fontSize="lg" fontWeight="medium" color="text.primary">
                Running Deep Analysis...
              </Text>
            </HStack>
            <VStack spacing={2} align="stretch" w="100%" maxW="400px">
              <Progress size="xs" isIndeterminate colorScheme="blue" />
              <Text fontSize="sm" color="text.secondary" textAlign="center">
                This may take up to a minute as we analyze the citation
                relevance for each claim element.
              </Text>
            </VStack>
            <Alert status="info" variant="subtle" maxW="400px">
              <AlertIcon />
              <Box>
                <AlertDescription fontSize="sm">
                  <strong>Tip:</strong> The analysis examines how this prior art
                  reference relates to your claim elements and provides USPTO
                  examiner-style feedback.
                </AlertDescription>
              </Box>
            </Alert>
          </VStack>
        )}

        {error && (
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Analysis Failed</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {/* Show loading state when fetching existing data */}
        {!isActivelyRunning && !data && !error && isLoading && (
          <VStack spacing={4} py={8}>
            <HStack spacing={3}>
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="border.primary"
                color="blue.500"
                size="lg"
              />
              <Text fontSize="lg" fontWeight="medium" color="text.primary">
                Loading Analysis Data...
              </Text>
            </HStack>
          </VStack>
        )}

        {/* Only show empty state when not loading */}
        {!isActivelyRunning && !data && !error && !isLoading && (
          <Alert status="info">
            <AlertIcon />
            <AlertDescription>
              <VStack align="start" spacing={2}>
                <Text>No analysis data available for this reference.</Text>
                <Button
                  size="sm"
                  onClick={onRunAnalysis}
                  colorScheme="blue"
                  loadingText="Starting analysis..."
                  isDisabled={isLoading}
                >
                  Run Analysis
                </Button>
              </VStack>
            </AlertDescription>
          </Alert>
        )}

        {data && type === 'deep' && !isActivelyRunning && (
          <DeepAnalysisPanel
            analysisData={data}
            onApplyAmendment={onApplyAmendmentToClaim1}
            referenceNumber={selectedReference}
            isLoading={false}
          />
        )}

        {data &&
          type === 'examiner' &&
          isExaminerAnalysisEnabled &&
          !isActivelyRunning && <ExaminerAnalysisPanel analysisResult={data} />}
      </Box>
    </Box>
  );
};

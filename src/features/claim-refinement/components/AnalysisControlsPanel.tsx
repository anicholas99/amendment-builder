import React from 'react';
import { Box, Button, Heading, Progress, Text, Stack } from '@chakra-ui/react';

interface AnalysisControlsPanelProps {
  isAnalyzing: boolean;
  analysisProgress: number;
  claim1Text: string;
  selectedSearchId: string | null;
  selectedReferenceNumbers: string[];
  hasAnalysisData: boolean;
  onAnalyze: () => void;
  onReAnalyze: () => void;
}

/**
 * Component for analysis controls and progress display
 */
export const AnalysisControlsPanel: React.FC<AnalysisControlsPanelProps> = ({
  isAnalyzing,
  analysisProgress,
  claim1Text,
  selectedSearchId,
  selectedReferenceNumbers,
  hasAnalysisData,
  onAnalyze,
  onReAnalyze,
}) => {
  const isDisabled =
    !selectedSearchId ||
    !claim1Text ||
    isAnalyzing ||
    selectedReferenceNumbers.length === 0;

  return (
    <Box>
      <Button
        colorScheme="blue"
        size="lg"
        onClick={onAnalyze}
        isLoading={isAnalyzing}
        isDisabled={isDisabled}
        mb={2}
      >
        Analyze Selected References ({selectedReferenceNumbers.length})
      </Button>

      {hasAnalysisData && (
        <Button
          colorScheme="gray"
          variant="outline"
          size="md"
          onClick={onReAnalyze}
          isLoading={isAnalyzing}
          isDisabled={isDisabled}
          ml={3}
        >
          Re-run Analysis
        </Button>
      )}

      {isAnalyzing ? (
        <Box>
          <Heading size="sm" mb={2}>
            Analyzing...
          </Heading>
          <Progress
            value={analysisProgress}
            hasStripe
            isAnimated
            colorScheme="blue"
            size="sm"
            mb={3}
          />
          <Text fontSize="sm" color="gray.500">
            This may take up to 30 seconds to complete analysis.
          </Text>
          <Stack direction="column" spacing={4} mt={4}>
            <Text fontSize="sm" color="gray.600">
              The analysis includes:
            </Text>
            <Text fontSize="sm" color="gray.500">
              • Novelty assessment against each reference
            </Text>
            <Text fontSize="sm" color="gray.500">
              • Non-obviousness evaluation (§103)
            </Text>
            <Text fontSize="sm" color="gray.500">
              • Risk profiling and mitigation strategies
            </Text>
          </Stack>
        </Box>
      ) : (
        (!claim1Text || selectedReferenceNumbers.length === 0) &&
        selectedSearchId && (
          <Text fontSize="sm" color="gray.500" mt={2}>
            {!claim1Text
              ? 'Please ensure Claim 1 is written before analysis'
              : 'Please select at least one reference to analyze'}
          </Text>
        )
      )}
    </Box>
  );
};

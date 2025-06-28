/**
 * Deep Analysis Panel
 *
 * Clean, focused component that orchestrates sub-components for deep analysis display.
 * Follows architectural blueprint: single responsibility, clear separation of concerns.
 *
 * Responsibilities:
 * - Data processing and validation
 * - Sub-component orchestration
 * - Loading and error state management
 */

import React from 'react';
import { logger } from '@/lib/monitoring/logger';
import { Box, Text, Heading, VStack, Divider } from '@chakra-ui/react';
import {
  DeepAnalysisPanelProps,
  ExaminerStructuredDeepAnalysis,
} from '../types/deepAnalysis';
import {
  calculateOverallRelevance,
  isExaminerStructuredFormat,
} from '../utils/deepAnalysisUtils';
import { OverallRelevanceSection } from './DeepAnalysis/OverallRelevanceSection';
import { ElementAnalysisAccordion } from './DeepAnalysis/ElementAnalysisAccordion';
import { HolisticAnalysisSection } from './DeepAnalysis/HolisticAnalysisSection';

/**
 * Component to display deep AI analysis of citation extraction data
 *
 * This component presents a holistic analysis of citation relevance for each claim element,
 * based on all extracted citation snippets for a reference. It includes patent examiner
 * perspectives on patentability under 35 U.S.C. 102 and 103.
 */
export const DeepAnalysisPanel: React.FC<DeepAnalysisPanelProps> = ({
  analysisData,
  referenceNumber,
  isLoading = false,
  onApplyAmendment,
}) => {
  // Comprehensive logging for debugging
  logger.debug('[DeepAnalysisPanel] Component rendering with props:', {
    hasAnalysisData: !!analysisData,
    analysisDataType: analysisData ? typeof analysisData : 'null',
    analysisKeys: analysisData ? Object.keys(analysisData) : [],
    referenceNumber,
    isLoading,
  });

  // Early returns for loading and no data states
  if (isLoading) {
    return (
      <Box width="100%">
        <Box p={4} bg="bg.secondary" borderRadius="md" textAlign="center">
          <Text color="text.tertiary">Loading analysis data...</Text>
        </Box>
      </Box>
    );
  }

  if (!analysisData) {
    logger.debug('[DeepAnalysisPanel] No analysis data available:', {
      analysisDataExists: !!analysisData,
      referenceNumber,
      isLoading,
    });

    return (
      <Box width="100%">
        <Box p={4} bg="bg.secondary" borderRadius="md" textAlign="center">
          <Text color="text.tertiary">
            No analysis data available for this reference.
          </Text>
        </Box>
      </Box>
    );
  }

  // Data processing and validation
  const isStructuredFormat = isExaminerStructuredFormat(analysisData);
  const examinerData = isStructuredFormat
    ? (analysisData as ExaminerStructuredDeepAnalysis)
    : null;

  const relevanceData =
    isStructuredFormat && examinerData
      ? calculateOverallRelevance(examinerData.overallAssessment)
      : null;

  return (
    <VStack spacing={6} align="stretch" width="100%" px={2}>
      {/* Header section */}
      <Box>
        <Heading
          size="md"
          color="gray.700"
          _dark={{ color: 'gray.200' }}
          mb={2}
        >
          USPTO Examiner Analysis
        </Heading>

        {isStructuredFormat && examinerData && (
          <Text
            fontSize="sm"
            color="gray.600"
            _dark={{ color: 'gray.400' }}
            lineHeight="tall"
          >
            {examinerData.overallAssessment.summary}
          </Text>
        )}
      </Box>

      {/* Overall Relevance Section */}
      <OverallRelevanceSection
        relevanceData={relevanceData}
        examinerData={examinerData}
        isStructuredFormat={isStructuredFormat}
      />

      <Divider borderColor="gray.200" _dark={{ borderColor: 'gray.600' }} />

      {/* Element-by-Element Analysis */}
      <ElementAnalysisAccordion
        analysisData={analysisData}
        examinerData={examinerData}
        isStructuredFormat={isStructuredFormat}
      />

      {/* Holistic Analysis Section */}
      {isStructuredFormat && examinerData && examinerData.holisticAnalysis && (
        <>
          <Divider borderColor="gray.200" _dark={{ borderColor: 'gray.600' }} />
          <HolisticAnalysisSection
            examinerData={examinerData}
            onApplyAmendment={onApplyAmendment}
          />
        </>
      )}
    </VStack>
  );
};

export default DeepAnalysisPanel;

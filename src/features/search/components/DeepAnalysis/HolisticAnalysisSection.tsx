/**
 * Holistic Analysis Section Component
 *
 * Displays holistic examiner analysis and claim amendment functionality.
 * Single responsibility: Holistic analysis display and claim amendment interaction.
 */

import React from 'react';
import { Box, Text, Heading, Flex, Icon, Button } from '@chakra-ui/react';
import { FiLayers, FiEdit3, FiCheck } from 'react-icons/fi';
import { diffWords } from 'diff';
import { ExaminerStructuredDeepAnalysis } from '../../types/deepAnalysis';
import { extractSuggestion } from '../../utils/deepAnalysisUtils';

interface HolisticAnalysisSectionProps {
  examinerData: ExaminerStructuredDeepAnalysis;
  onApplyAmendment?: (original: string, revised: string) => void;
}

export const HolisticAnalysisSection: React.FC<
  HolisticAnalysisSectionProps
> = ({ examinerData, onApplyAmendment }) => {
  // Word-level diff rendering for revised claim
  const renderWordDiff = (oldText: string, newText: string) => {
    const diff = diffWords(oldText, newText);
    return (
      <Text
        as="pre"
        fontFamily="mono"
        fontSize="sm"
        whiteSpace="pre-wrap"
        color="gray.700"
        _dark={{ color: 'gray.300' }}
      >
        {diff.map((part, idx) => {
          if (part.added) {
            return (
              <span
                key={idx}
                style={{
                  backgroundColor: '#d1fae5',
                  color: '#065f46',
                  fontWeight: 600,
                }}
              >
                {part.value}
              </span>
            );
          } else if (part.removed) {
            // Optionally show deletions as strikethrough in red
            return (
              <span
                key={idx}
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  textDecoration: 'line-through',
                  opacity: 0.7,
                }}
              >
                {part.value}
              </span>
            );
          } else {
            return <span key={idx}>{part.value}</span>;
          }
        })}
      </Text>
    );
  };

  const originalClaim =
    examinerData &&
    'originalClaim' in examinerData &&
    typeof examinerData.originalClaim === 'string'
      ? examinerData.originalClaim
      : undefined;

  const revisedClaim =
    examinerData &&
    'revisedClaim' in examinerData &&
    typeof examinerData.revisedClaim === 'string'
      ? examinerData.revisedClaim
      : undefined;

  const isAmended = revisedClaim && revisedClaim !== originalClaim;
  const suggestion = extractSuggestion(examinerData.holisticAnalysis);

  // Check if there's a rejection that requires amendment
  const hasRejection =
    examinerData.overallAssessment.overallRejection &&
    examinerData.overallAssessment.overallRejection !== 'Not Rejected';

  return (
    <Box>
      <Box mb={4}>
        <Heading
          size="sm"
          mb={1}
          color="gray.700"
          _dark={{ color: 'gray.200' }}
        >
          Holistic Examiner Analysis
        </Heading>
        <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }}>
          Overall assessment and recommendations for overcoming rejections
        </Text>
      </Box>

      <Box
        p={4}
        bg="white"
        _dark={{ bg: 'gray.800', borderColor: 'gray.600' }}
        borderRadius="lg"
        borderWidth="1px"
        borderColor="gray.200"
        boxShadow="sm"
        mb={4}
      >
        <Text
          fontSize="sm"
          color="gray.700"
          _dark={{ color: 'gray.300' }}
          lineHeight="tall"
        >
          {examinerData.holisticAnalysis}
        </Text>
      </Box>

      {/* Highlight actionable suggestion if present */}
      {suggestion && (
        <Box
          p={4}
          bg="blue.50"
          _dark={{ bg: 'blue.900' }}
          borderRadius="md"
          borderLeftWidth="4px"
          borderLeftColor="blue.400"
          mb={4}
        >
          <Flex alignItems="flex-start">
            <Icon
              as={FiEdit3}
              color="blue.500"
              mr={2}
              mt="2px"
              aria-hidden="true"
            />
            <Box>
              <Text
                fontWeight="semibold"
                color="blue.700"
                _dark={{ color: 'blue.300' }}
                fontSize="sm"
                mb={1}
              >
                Examiner Suggestion
              </Text>
              <Text
                color="gray.700"
                _dark={{ color: 'gray.300' }}
                fontSize="sm"
              >
                {suggestion}
              </Text>
            </Box>
          </Flex>
        </Box>
      )}

      {/* Before/After Claim 1 Section */}
      {originalClaim && (
        <Box mt={6}>
          <Heading
            size="sm"
            mb={2}
            color="gray.700"
            _dark={{ color: 'gray.200' }}
          >
            Claim 1{' '}
            {isAmended
              ? 'Before and After Amendment'
              : hasRejection
                ? '(Amendment Recommended)'
                : '(No Amendment Needed)'}
          </Heading>

          {isAmended ? (
            <Box>
              <Box
                p={4}
                bg="gray.50"
                _dark={{ bg: 'gray.700' }}
                borderRadius="md"
                mb={4}
              >
                <Text
                  fontWeight="semibold"
                  color="gray.700"
                  _dark={{ color: 'gray.300' }}
                  mb={2}
                  fontSize="sm"
                >
                  Original Claim 1
                </Text>
                <Text
                  as="pre"
                  fontFamily="mono"
                  fontSize="sm"
                  whiteSpace="pre-wrap"
                  color="gray.600"
                  _dark={{ color: 'gray.400' }}
                >
                  {originalClaim}
                </Text>
              </Box>

              <Box
                p={4}
                bg="green.50"
                _dark={{ bg: 'green.900' }}
                borderRadius="md"
                borderLeftWidth="4px"
                borderLeftColor="green.400"
                mb={4}
              >
                <Text
                  fontWeight="semibold"
                  color="green.700"
                  _dark={{ color: 'green.300' }}
                  mb={2}
                  fontSize="sm"
                >
                  Revised Claim 1 (Suggested Amendment)
                </Text>
                {renderWordDiff(originalClaim, revisedClaim)}
              </Box>

              <Button
                colorScheme="blue"
                mt={3}
                leftIcon={<FiCheck />}
                onClick={() => {
                  if (onApplyAmendment) {
                    onApplyAmendment(originalClaim, revisedClaim);
                  }
                }}
                isDisabled={!onApplyAmendment}
              >
                Apply Amendment to Claim 1
              </Button>
            </Box>
          ) : (
            <Box
              p={4}
              bg="gray.50"
              _dark={{ bg: 'gray.700' }}
              borderRadius="md"
            >
              <Text
                fontWeight="semibold"
                color="gray.700"
                _dark={{ color: 'gray.300' }}
                mb={2}
                fontSize="sm"
              >
                Original Claim 1
              </Text>
              <Text
                as="pre"
                fontFamily="mono"
                fontSize="sm"
                whiteSpace="pre-wrap"
                color="gray.600"
                _dark={{ color: 'gray.400' }}
                mb={3}
              >
                {originalClaim}
              </Text>
              <Box
                p={3}
                bg={hasRejection ? 'orange.50' : 'green.50'}
                _dark={{ bg: hasRejection ? 'orange.900' : 'green.900' }}
                borderRadius="md"
                borderLeftWidth="4px"
                borderLeftColor={hasRejection ? 'orange.400' : 'green.400'}
              >
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={hasRejection ? 'orange.700' : 'green.700'}
                  _dark={{ color: hasRejection ? 'orange.300' : 'green.300' }}
                >
                  {hasRejection
                    ? `Warning: ${examinerData.overallAssessment.overallRejection} identified but no specific amendment provided. Consider manual revision.`
                    : 'No amendment is needed. Claim 1 is patentable as written over this reference.'}
                </Text>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

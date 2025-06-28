/**
 * Amendment Section Component for Combined Analysis
 *
 * Displays strategic recommendations with amendment application functionality.
 * Follows the pattern established in HolisticAnalysisSection for deep analysis.
 */

import React, { useState } from 'react';
import {
  Box,
  Text,
  Heading,
  VStack,
  Button,
  Icon,
  Flex,
  useToast,
  Badge,
  Collapse,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FiCheck,
  FiEdit3,
  FiPlus,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import { diffWords } from 'diff';
import { useColorModeValue } from '@/hooks/useColorModeValue';

interface StrategicRecommendation {
  recommendation: string;
  suggestedAmendmentLanguage: string;
}

interface AmendmentSectionProps {
  recommendations: StrategicRecommendation[];
  claim1Text?: string;
  originalClaim?: string;
  revisedClaim?: string;
  onApplyAmendment?: (original: string, revised: string) => void;
  onAddDependent?: (dependentClaimText: string) => void;
}

export const AmendmentSection: React.FC<AmendmentSectionProps> = ({
  recommendations,
  claim1Text,
  originalClaim,
  revisedClaim,
  onApplyAmendment,
  onAddDependent,
}) => {
  const toast = useToast();
  const tertiaryBg = useColorModeValue('bg.secondary', 'bg.secondary');
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(
    new Set()
  );

  // Word-level diff rendering
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

  // Determine if recommendation is for a dependent claim
  const isDependent = (amendmentLanguage: string): boolean => {
    return (
      amendmentLanguage.toLowerCase().includes('dependent claim') ||
      amendmentLanguage.match(/^\d+\.\s+A\s+/) !== null ||
      amendmentLanguage.match(/claim\s+\d+/i) !== null
    );
  };

  // Extract claim number from dependent claim text
  const extractClaimNumber = (text: string): string | null => {
    const match = text.match(/^(\d+)\./);
    return match ? match[1] : null;
  };

  // Apply amendment to claim 1
  const handleApplyClaim1Amendment = (amendmentLanguage: string) => {
    if (!claim1Text || !onApplyAmendment) {
      toast({
        title: 'Cannot apply amendment',
        description: 'Claim 1 text or amendment handler not available',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Strategic recommendations are partial amendments, not complete claims
    // They typically suggest adding specific limitations to the existing claim
    // For now, we'll show a message that manual integration is needed
    toast({
      title: 'Manual Integration Required',
      description:
        'Strategic recommendations are partial amendments. Please manually integrate the suggested language into your claim.',
      status: 'info',
      duration: 5000,
      isClosable: true,
    });

    // Copy the amendment text to clipboard for easy integration
    navigator.clipboard.writeText(amendmentLanguage).then(() => {
      toast({
        title: 'Copied to clipboard',
        description:
          'The suggested amendment has been copied to your clipboard.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    });
  };

  // Add dependent claim
  const handleAddDependent = (amendmentLanguage: string) => {
    if (!onAddDependent) {
      toast({
        title: 'Cannot add dependent claim',
        description: 'Dependent claim handler not available',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    onAddDependent(amendmentLanguage);
    // Note: Success toast is handled by the parent component's mutation callback
  };

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <Box>
      {/* Show complete revised claim if available */}
      {originalClaim && revisedClaim && originalClaim !== revisedClaim && (
        <Box mb={6}>
          <Heading
            size="sm"
            mb={3}
            color="text.primary"
            className="flex-center"
          >
            <Icon as={FiEdit3} color="blue.500" className="mr-2" />
            Suggested Complete Claim 1 Amendment
          </Heading>

          <Box
            p={4}
            bg="blue.50"
            _dark={{ bg: 'blue.900' }}
            borderRadius="md"
            borderLeftWidth="4px"
            borderLeftColor="blue.400"
            mb={3}
          >
            <Text
              fontSize="sm"
              fontWeight="medium"
              color="blue.700"
              _dark={{ color: 'blue.300' }}
              mb={3}
            >
              Complete Revised Claim 1 (Addresses All Rejections)
            </Text>
            {renderWordDiff(originalClaim, revisedClaim)}

            <Button
              mt={3}
              size="sm"
              colorScheme="blue"
              leftIcon={<FiCheck />}
              onClick={() => {
                if (onApplyAmendment) {
                  onApplyAmendment(originalClaim, revisedClaim);
                }
              }}
              isDisabled={!onApplyAmendment}
            >
              Apply Complete Amendment to Claim 1
            </Button>
          </Box>
        </Box>
      )}

      <Flex justify="space-between" align="center" mb={3}>
        <Heading size="sm" color="text.primary" className="flex-center">
          <Icon as={FiEdit3} color="green.500" className="mr-2" />
          Additional Strategic Recommendations
        </Heading>

        {recommendations.length > 1 && (
          <Flex gap={2}>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => {
                const allIndices = new Set(recommendations.map((_, i) => i));
                setExpandedIndices(allIndices);
              }}
            >
              Expand All
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setExpandedIndices(new Set())}
            >
              Collapse All
            </Button>
          </Flex>
        )}
      </Flex>

      <VStack align="stretch" spacing={3}>
        {recommendations.map((rec, index) => {
          const isDependentClaim = isDependent(rec.suggestedAmendmentLanguage);
          const isExpanded = expandedIndices.has(index);

          return (
            <Box key={index} p={4} bg={tertiaryBg} borderRadius="md">
              {/* Recommendation header */}
              <Flex justify="space-between" align="flex-start" mb={2}>
                <Box flex="1">
                  <Text fontSize="sm" fontWeight="medium" color="text.primary">
                    {rec.recommendation}
                  </Text>
                </Box>
                <Badge
                  colorScheme={isDependentClaim ? 'purple' : 'blue'}
                  ml={2}
                  flexShrink={0}
                >
                  {isDependentClaim ? 'Dependent' : 'Claim 1'}
                </Badge>
              </Flex>

              {/* Amendment preview/details */}
              <Box>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const newExpanded = new Set(expandedIndices);
                    if (isExpanded) {
                      newExpanded.delete(index);
                    } else {
                      newExpanded.add(index);
                    }
                    setExpandedIndices(newExpanded);
                  }}
                  rightIcon={isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                  mb={2}
                >
                  {isExpanded ? 'Hide' : 'Show'} Amendment Details
                </Button>

                <Collapse in={isExpanded}>
                  <Box
                    p={3}
                    bg="gray.50"
                    _dark={{ bg: 'gray.800' }}
                    borderRadius="md"
                  >
                    <Text fontSize="xs" color="text.secondary" mb={2}>
                      Suggested Amendment:
                    </Text>

                    {/* Always show suggested amendment as plain text for strategic recommendations */}
                    <Text
                      fontSize="sm"
                      fontFamily="monospace"
                      color="text.primary"
                      mb={3}
                    >
                      {rec.suggestedAmendmentLanguage}
                    </Text>

                    {/* Action buttons - only show for dependent claims */}
                    {isDependentClaim && (
                      <Flex gap={2}>
                        <Button
                          size="sm"
                          colorScheme="purple"
                          leftIcon={<FiPlus />}
                          onClick={() =>
                            handleAddDependent(rec.suggestedAmendmentLanguage)
                          }
                          isDisabled={!onAddDependent}
                        >
                          Add as Dependent Claim
                        </Button>
                      </Flex>
                    )}
                  </Box>
                </Collapse>
              </Box>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};

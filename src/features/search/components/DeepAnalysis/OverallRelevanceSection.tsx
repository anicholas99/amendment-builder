/**
 * Overall Relevance Section Component
 *
 * Displays overall relevance metrics and rejection determination.
 * Single responsibility: Overall analysis summary display.
 */

import React from 'react';
import {
  Box,
  Text,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  List,
  ListItem,
  ListIcon,
  Progress,
  Badge,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { FiAlertCircle, FiEdit3, FiBookOpen } from 'react-icons/fi';
import {
  ExaminerStructuredDeepAnalysis,
  RelevanceCalculation,
} from '../../types/deepAnalysis';
import { getRejectionColor } from '../../utils/deepAnalysisUtils';

interface OverallRelevanceSectionProps {
  relevanceData: RelevanceCalculation | null;
  examinerData?: ExaminerStructuredDeepAnalysis | null;
  isStructuredFormat: boolean;
}

export const OverallRelevanceSection: React.FC<
  OverallRelevanceSectionProps
> = ({ relevanceData, examinerData, isStructuredFormat }) => {
  // Handle null relevanceData
  if (!relevanceData) {
    return (
      <Box mb={6}>
        <Text color="text.tertiary" fontSize="sm">
          No relevance data available
        </Text>
      </Box>
    );
  }

  const { score, level, color } = relevanceData;

  if (isStructuredFormat && examinerData) {
    return (
      <Box mb={6}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={5}>
          <Box
            bg="white"
            _dark={{ bg: 'gray.800', borderColor: 'gray.600' }}
            p={4}
            borderRadius="lg"
            borderWidth="1px"
            borderColor="gray.200"
            boxShadow="sm"
          >
            <Text
              fontSize="xs"
              fontWeight="medium"
              color="gray.500"
              _dark={{ color: 'gray.400' }}
              mb={1}
            >
              REJECTION DETERMINATION
            </Text>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color={getRejectionColor(
                examinerData.overallAssessment.overallRejection ||
                  'Not Rejected'
              )}
              mb={1}
            >
              {examinerData.overallAssessment.overallRejection ||
                'Not Rejected'}
            </Text>
            <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
              Patentability:{' '}
              {Math.round(
                examinerData.overallAssessment.patentabilityScore * 100
              )}
              %
            </Text>
          </Box>

          <Box
            bg="white"
            _dark={{ bg: 'gray.800', borderColor: 'gray.600' }}
            p={4}
            borderRadius="lg"
            borderWidth="1px"
            borderColor="gray.200"
            boxShadow="sm"
          >
            <Text
              fontSize="xs"
              fontWeight="medium"
              color="gray.500"
              _dark={{ color: 'gray.400' }}
              mb={3}
            >
              REJECTION BASIS
            </Text>
            <List spacing={2} fontSize="sm">
              {examinerData.overallAssessment.keyConcerns.map((concern, i) => (
                <ListItem
                  key={i}
                  color="gray.700"
                  _dark={{ color: 'gray.300' }}
                  display="flex"
                  alignItems="flex-start"
                >
                  <ListIcon as={FiAlertCircle} color="orange.500" mt="3px" />
                  <Text lineHeight="tall">{concern}</Text>
                </ListItem>
              ))}
            </List>
          </Box>

          <Box
            bg="white"
            _dark={{ bg: 'gray.800', borderColor: 'gray.600' }}
            p={4}
            borderRadius="lg"
            borderWidth="1px"
            borderColor="gray.200"
            boxShadow="sm"
          >
            <Text
              fontSize="xs"
              fontWeight="medium"
              color="gray.500"
              _dark={{ color: 'gray.400' }}
              mb={3}
            >
              STRATEGIC RECOMMENDATIONS
            </Text>
            <List spacing={2} fontSize="sm">
              {examinerData.overallAssessment.strategicRecommendations.map(
                (suggestion, i) => (
                  <ListItem
                    key={i}
                    color="gray.700"
                    _dark={{ color: 'gray.300' }}
                    display="flex"
                    alignItems="flex-start"
                  >
                    <ListIcon as={FiEdit3} color="blue.500" mt="3px" />
                    <Text lineHeight="tall">{suggestion}</Text>
                  </ListItem>
                )
              )}
            </List>
          </Box>
        </SimpleGrid>

        {/* Office Action Style Rejection Summary */}
        {examinerData.overallAssessment.rejectionSummary && (
          <Box
            mt={4}
            p={4}
            bg="gray.50"
            _dark={{ bg: 'gray.700' }}
            borderRadius="lg"
            borderLeftWidth="4px"
            borderLeftColor="blue.400"
          >
            <Flex alignItems="center" mb={2}>
              <Icon as={FiBookOpen} mr={2} color="blue.500" />
              <Text
                fontSize="sm"
                fontWeight="semibold"
                color="gray.700"
                _dark={{ color: 'gray.200' }}
              >
                USPTO Office Action Summary
              </Text>
            </Flex>
            <Text
              fontSize="sm"
              color="gray.600"
              _dark={{ color: 'gray.300' }}
              lineHeight="tall"
            >
              {examinerData.overallAssessment.rejectionSummary}
            </Text>
          </Box>
        )}
      </Box>
    );
  }

  // Legacy format display
  return (
    <Box mb={6}>
      <Heading size="xs" mb={3} color="text.primary">
        Overall Reference Relevance
      </Heading>
      <Flex align="center" mb={3}>
        <Box width="100%">
          <Progress
            value={score * 100}
            colorScheme={
              level === 'high' ? 'red' : level === 'medium' ? 'orange' : 'green'
            }
            height="8px"
            borderRadius="full"
          />
        </Box>
        <Box ml={4} minWidth="100px" textAlign="right">
          <Badge
            colorScheme={
              level === 'high' ? 'red' : level === 'medium' ? 'orange' : 'green'
            }
            fontSize="md"
            p={1}
          >
            {Math.round(score * 100)}% Match
          </Badge>
        </Box>
      </Flex>
    </Box>
  );
};

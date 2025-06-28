import React from 'react';
import {
  VStack,
  Card,
  CardHeader,
  CardBody,
  Flex,
  Heading,
  Button,
  Icon,
  Box,
  HStack,
  Text,
  Tag,
  Spinner,
} from '@chakra-ui/react';
import { FiFileText, FiClock, FiChevronRight } from 'react-icons/fi';
import { format } from 'date-fns';
import { StructuredCombinedAnalysis } from '@/client/services/patent/patentability/combinedAnalysisService';
import { useColorModeValue } from '@/hooks/useColorModeValue';

interface PastAnalysisEntry {
  id: string;
  createdAt: string;
  referenceNumbers: string[];
  analysis: StructuredCombinedAnalysis;
}

interface PastAnalysesListProps {
  isLoading: boolean;
  pastAnalyses: PastAnalysisEntry[] | undefined;
  onViewAnalysis: (analysis: StructuredCombinedAnalysis) => void;
  onCreateNew: () => void;
  getDeterminationColorScheme: (determination?: string) => string;
}

export const PastAnalysesList: React.FC<PastAnalysesListProps> = ({
  isLoading,
  pastAnalyses,
  onViewAnalysis,
  onCreateNew,
  getDeterminationColorScheme,
}) => {
  const cardHeaderBg = useColorModeValue('bg.secondary', 'bg.secondary');
  const tertiaryBg = useColorModeValue('bg.secondary', 'bg.secondary');

  if (isLoading) {
    return (
      <Flex justify="center" py={8}>
        <Spinner size="lg" />
      </Flex>
    );
  }

  if (!pastAnalyses || pastAnalyses.length === 0) {
    return (
      <Card borderWidth="1px" borderColor="border.primary">
        <CardBody>
          <VStack spacing={3} py={6}>
            <Text color="text.tertiary" fontSize="lg">
              No past analyses for this search
            </Text>
            <Button
              colorScheme="blue"
              onClick={onCreateNew}
              leftIcon={<Icon as={FiFileText} />}
            >
              Create First Analysis
            </Button>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card borderWidth="1px" borderColor="border.primary">
      <CardHeader bg={cardHeaderBg} py={3}>
        <Flex justify="space-between" align="center">
          <Heading size="md" color="text.primary">
            Past Analyses for This Search
          </Heading>
          <Button
            size="sm"
            colorScheme="blue"
            onClick={onCreateNew}
            leftIcon={<Icon as={FiFileText} />}
          >
            Create New Analysis
          </Button>
        </Flex>
      </CardHeader>
      <CardBody>
        <VStack spacing={3} align="stretch">
          {pastAnalyses.map(analysis => (
            <Box
              key={analysis.id}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              borderColor="border.primary"
              _hover={{ bg: tertiaryBg, cursor: 'pointer' }}
              onClick={() => onViewAnalysis(analysis.analysis)}
            >
              <Flex justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <HStack spacing={2}>
                    <Icon as={FiClock} color="text.tertiary" />
                    <Text fontSize="sm" color="text.secondary">
                      {format(
                        new Date(analysis.createdAt),
                        'MMM dd, yyyy h:mm a'
                      )}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="medium" color="text.primary">
                    References:{' '}
                    {analysis.referenceNumbers
                      .map(ref => ref.replace(/-/g, ''))
                      .join(', ')}
                  </Text>
                  <Tag
                    size="sm"
                    colorScheme={getDeterminationColorScheme(
                      analysis.analysis.patentabilityDetermination
                    )}
                  >
                    {analysis.analysis.patentabilityDetermination || 'Unknown'}
                  </Tag>
                </VStack>
                <Icon as={FiChevronRight} color="text.tertiary" />
              </Flex>
            </Box>
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
};

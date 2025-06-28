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
  Text,
  Tag,
  Stat,
  StatLabel,
  StatNumber,
  Divider,
  IconButton,
} from '@chakra-ui/react';
import {
  FiArrowLeft,
  FiClock,
  FiFileText,
  FiCopy,
  FiAlertCircle,
  FiEdit3,
  FiLayers,
} from 'react-icons/fi';
import { StructuredCombinedAnalysis } from '@/client/services/patent/patentability/combinedAnalysisService';
import { useColorModeValue } from '@/hooks/useColorModeValue';
import { AnalysisMarkdownViewer } from './AnalysisMarkdownViewer';
import { AmendmentSection } from './AmendmentSection';

interface CombinedAnalysisResultProps {
  result: StructuredCombinedAnalysis;
  isViewingPast: boolean;
  onBackToList?: () => void;
  onCreateNew: () => void;
  onClearResult?: () => void;
  onCopy: () => void;
  getDeterminationColorScheme: (determination?: string) => string;
  claim1Text?: string;
  onApplyAmendment?: (original: string, revised: string) => void;
  onAddDependent?: (dependentClaimText: string) => void;
}

export const CombinedAnalysisResult: React.FC<CombinedAnalysisResultProps> = ({
  result,
  isViewingPast,
  onBackToList,
  onCreateNew,
  onClearResult,
  onCopy,
  getDeterminationColorScheme,
  claim1Text,
  onApplyAmendment,
  onAddDependent,
}) => {
  const cardHeaderBg = useColorModeValue('bg.secondary', 'bg.secondary');
  const tertiaryBg = useColorModeValue('bg.secondary', 'bg.secondary');

  return (
    <VStack spacing={6} align="stretch">
      {isViewingPast && onBackToList && (
        <Flex justify="space-between" align="center" mb={2}>
          <Button
            size="sm"
            variant="ghost"
            onClick={onBackToList}
            leftIcon={<FiArrowLeft />}
          >
            Back to List
          </Button>
          <Button
            size="sm"
            colorScheme="blue"
            onClick={onCreateNew}
            leftIcon={<Icon as={FiFileText} />}
          >
            Create New Analysis
          </Button>
        </Flex>
      )}

      {/* Show create another button for new results */}
      {!isViewingPast && onClearResult && (
        <Flex justify="space-between" mb={2}>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearResult}
            leftIcon={<FiClock />}
          >
            View Past Analyses
          </Button>
          <Button
            size="sm"
            colorScheme="blue"
            onClick={onCreateNew}
            leftIcon={<Icon as={FiFileText} />}
          >
            Create Another Analysis
          </Button>
        </Flex>
      )}

      <Card borderWidth="1px" borderColor="border.primary">
        <CardHeader
          bg={cardHeaderBg}
          py={3}
          borderBottomWidth="1px"
          borderColor="border.primary"
        >
          <Heading size="md" color="blue.500">
            Patentability Assessment
          </Heading>
        </CardHeader>
        <CardBody>
          <VStack align="stretch" spacing={4}>
            <Stat>
              <StatLabel color="text.secondary">Determination</StatLabel>
              <StatNumber>
                <Tag
                  size="lg"
                  colorScheme={getDeterminationColorScheme(
                    result.patentabilityDetermination
                  )}
                >
                  {result.patentabilityDetermination}
                </Tag>
              </StatNumber>
            </Stat>

            {result.primaryReference && (
              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color="text.secondary"
                  mb={1}
                >
                  Anticipating Reference (§ 102):
                </Text>
                <Text fontSize="sm" color="text.primary">
                  {result.primaryReference.replace(/-/g, '')}
                </Text>
              </Box>
            )}

            {result.combinedReferences.length > 0 && (
              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color="text.secondary"
                  mb={1}
                >
                  Combined References:
                </Text>
                <Text fontSize="sm" color="text.primary">
                  {result.combinedReferences
                    .map(ref => ref.replace(/-/g, ''))
                    .join(', ')}
                </Text>
              </Box>
            )}

            {result.rejectionJustification?.motivationToCombine && (
              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color="text.secondary"
                  mb={1}
                >
                  Motivation to Combine:
                </Text>
                <Text fontSize="sm" color="text.primary">
                  {result.rejectionJustification.motivationToCombine}
                </Text>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>

      <Card borderWidth="1px" borderColor="border.primary">
        <CardHeader
          bg={cardHeaderBg}
          py={3}
          borderBottomWidth="1px"
          borderColor="border.primary"
        >
          <Flex justifyContent="space-between" align="center">
            <Heading size="md" color="blue.500">
              Analysis Details
            </Heading>
            <IconButton
              aria-label="Copy analysis narrative"
              icon={<FiCopy />}
              size="sm"
              variant="ghost"
              onClick={onCopy}
            />
          </Flex>
        </CardHeader>
        <CardBody>
          {/* Claim Element Mapping */}
          {result.rejectionJustification?.claimElementMapping &&
            result.rejectionJustification.claimElementMapping.length > 0 && (
              <Box mb={5}>
                <Heading
                  size="sm"
                  mb={2}
                  color="text.primary"
                  className="flex-center"
                >
                  <Icon
                    as={FiAlertCircle}
                    color="orange.500"
                    className="mr-2"
                  />{' '}
                  Claim Element Mapping
                </Heading>
                <VStack align="stretch" spacing={2}>
                  {result.rejectionJustification.claimElementMapping.map(
                    (mapping, index) => (
                      <Box key={index} p={3} bg={tertiaryBg} borderRadius="md">
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="text.primary"
                          mb={1}
                        >
                          {mapping.element}
                        </Text>
                        <Text fontSize="sm" color="text.secondary">
                          {mapping.taughtBy}
                        </Text>
                      </Box>
                    )
                  )}
                </VStack>
              </Box>
            )}

          {/* Amendment Section - New Feature */}
          <AmendmentSection
            recommendations={result.strategicRecommendations || []}
            claim1Text={claim1Text}
            originalClaim={result.originalClaim}
            revisedClaim={result.revisedClaim}
            onApplyAmendment={onApplyAmendment}
            onAddDependent={onAddDependent}
          />

          <Divider className="my-4" />

          <Heading
            size="sm"
            mb={3}
            color="text.primary"
            className="flex-center"
          >
            <Icon as={FiLayers} color="purple.500" className="mr-2" /> Full
            Analysis Narrative
          </Heading>
          <Box
            p={3}
            bg={tertiaryBg}
            borderRadius="md"
            borderWidth="1px"
            borderColor="border.primary"
            maxH="40vh"
            overflowY="auto"
          >
            <AnalysisMarkdownViewer
              markdownText={
                result.rejectionJustification?.fullNarrative ||
                'No narrative provided.'
              }
            />
          </Box>
        </CardBody>
      </Card>
    </VStack>
  );
};

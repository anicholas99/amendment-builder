import React, { useState } from 'react';
import { logger } from '@/lib/monitoring/logger';
import { environment } from '@/config/environment';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
  Badge,
  Alert,
  AlertIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  SimpleGrid,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  Select,
  FormControl,
  FormLabel,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { FiFileText, FiCheckCircle, FiClock } from 'react-icons/fi';
import { PriorArtReference } from '../../../types/claimTypes';
import { useQueueCitationExtraction } from '@/hooks/api/useCitationExtraction';

interface CitationExtractionPanelProps {
  parsedElements: string[];
  references: PriorArtReference[];
  claimSetVersionId?: string;
}

interface CitationResult {
  claimElement?: string;
  citation?: string;
  rankPercentage?: number;
}

interface ReferenceResult {
  reference: string;
  citations: CitationResult[];
}

/**
 * Component for displaying and managing citation extraction in a dedicated panel
 */
const CitationExtractionPanel: React.FC<CitationExtractionPanelProps> = ({
  parsedElements,
  references,
  claimSetVersionId = '',
}) => {
  const [selectedThreshold, setSelectedThreshold] = useState<number>(40);
  const [extractionCompleted] = useState<boolean>(false);
  const [citationResults] = useState<ReferenceResult[]>([]);

  const toast = useToast();
  const secondaryBg = useColorModeValue('bg.secondary', 'bg.secondary');
  const primaryBorder = useColorModeValue('border.primary', 'border.primary');

  // React Query mutation
  const queueCitationMutation = useQueueCitationExtraction({
    onSuccess: data => {
      if (!data.success) {
        // The hook already shows a toast, but we can add additional handling if needed
        logger.error('Citation extraction failed', data);
      }
    },
    onError: error => {
      // The hook already shows a toast, but we can add additional handling if needed
      logger.error('Citation extraction error:', error);
    },
  });

  // Derive states from mutation
  const isLoading = queueCitationMutation.isPending;
  const error = queueCitationMutation.error;
  const jobId = queueCitationMutation.data?.jobId
    ? String(queueCitationMutation.data.jobId)
    : null;
  const jobStatus: 'idle' | 'processing' | 'completed' | 'failed' =
    queueCitationMutation.isSuccess
      ? 'completed'
      : queueCitationMutation.isPending
        ? 'processing'
        : queueCitationMutation.isError
          ? 'failed'
          : 'idle';

  const handleExtractCitations = async () => {
    const topReferences = getTopReferences();
    if (topReferences.length === 0) {
      toast({
        title: 'No References',
        description: 'No references available for citation extraction',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const searchInputs = parsedElements;
    const referenceNumber = topReferences[0].number;

    queueCitationMutation.mutate({
      searchInputs,
      filterReferenceNumber: referenceNumber,
      threshold: selectedThreshold,
      searchHistoryId: '', // You may need to get this from somewhere
      claimSetVersionId: claimSetVersionId || '',
    });
  };

  const renderStatusBadge = () => {
    switch (jobStatus) {
      case 'processing':
        return <Badge colorScheme="purple">Processing</Badge>;
      case 'completed':
        return <Badge colorScheme="green">Completed</Badge>;
      case 'failed':
        return <Badge colorScheme="red">Failed</Badge>;
      default:
        return null;
    }
  };

  const getElementsForExtraction = () => {
    return parsedElements;
  };

  const getTopReferences = () => {
    return references.slice(0, 5);
  };

  return (
    <VStack spacing={6} align="stretch" width="100%">
      {/* Control Section */}
      <Card borderRadius="lg" variant="outline">
        <CardHeader bg={secondaryBg} borderTopRadius="lg" py={3}>
          <HStack justify="space-between">
            <Heading size="md">Citation Extraction Controls</Heading>
            {jobStatus !== 'idle' && renderStatusBadge()}
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Text>
              Extract specific citations from prior art references that match
              your claim elements. The system will analyze the top 5 references
              from your search results.
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel htmlFor="threshold">Relevance Threshold</FormLabel>
                <Select
                  id="threshold"
                  value={selectedThreshold}
                  onChange={e => setSelectedThreshold(parseInt(e.target.value))}
                  width="full"
                >
                  <option value={40}>
                    40% - More results, lower relevance
                  </option>
                  <option value={60}>60% - Balanced (Recommended)</option>
                  <option value={80}>
                    80% - Fewer results, higher relevance
                  </option>
                </Select>
              </FormControl>

              <Button
                leftIcon={isLoading ? <Spinner size="sm" /> : <FiFileText />}
                colorScheme="blue"
                onClick={handleExtractCitations}
                isLoading={isLoading}
                loadingText={
                  jobStatus === 'processing' ? 'Processing...' : 'Loading...'
                }
                isDisabled={
                  isLoading ||
                  parsedElements.length === 0 ||
                  references.length === 0
                }
                height="40px"
                alignSelf="flex-end"
              >
                Extract Citations
              </Button>
            </SimpleGrid>

            {/* Input Summary */}
            <Box mt={2}>
              <Heading size="sm" mb={2}>
                Extraction Inputs
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box
                  p={3}
                  borderWidth={1}
                  borderRadius="md"
                  borderColor={primaryBorder}
                >
                  <HStack mb={2}>
                    <Icon as={FiCheckCircle} color="green.500" />
                    <Text fontWeight="bold">Claim Elements:</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    {getElementsForExtraction().length} elements will be used
                    (all elements)
                  </Text>
                </Box>

                <Box
                  p={3}
                  borderWidth={1}
                  borderRadius="md"
                  borderColor={primaryBorder}
                >
                  <HStack mb={2}>
                    <Icon as={FiCheckCircle} color="green.500" />
                    <Text fontWeight="bold">References:</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    Top {getTopReferences().length} references will be analyzed
                  </Text>
                </Box>

                {jobId && (
                  <Box
                    p={3}
                    borderWidth={1}
                    borderRadius="md"
                    borderColor={primaryBorder}
                    gridColumn="span 2"
                  >
                    <HStack mb={2}>
                      <Icon as={FiClock} color="blue.500" />
                      <Text fontWeight="bold">Job ID:</Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      {jobId}
                    </Text>
                  </Box>
                )}
              </SimpleGrid>
            </Box>

            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <Box flex="1">
                  <Text fontWeight="bold">Error:</Text>
                  <Text>{error.message}</Text>
                  {environment.isDevelopment && (
                    <Box
                      mt={2}
                      p={2}
                      bg="red.50"
                      fontSize="xs"
                      fontFamily="monospace"
                      whiteSpace="pre-wrap"
                    >
                      <Text fontWeight="bold">Debug Info:</Text>
                      {JSON.stringify(error, null, 2)}
                    </Box>
                  )}
                  {/* Retry button for failed jobs */}
                  {jobStatus === 'failed' && (
                    <Button
                      mt={3}
                      size="sm"
                      colorScheme="orange"
                      onClick={() => {
                        queueCitationMutation.reset();
                        handleExtractCitations();
                      }}
                      leftIcon={<FiFileText />}
                    >
                      Retry Citation Extraction
                    </Button>
                  )}
                </Box>
              </Alert>
            )}

            {/* Waiting for results message */}
            {isLoading && jobStatus !== 'idle' && (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <HStack flex="1">
                  <Text fontWeight="bold">Processing citation extraction:</Text>
                  <Spinner size="sm" />
                  <Text>Analyzing references for relevant citations...</Text>
                </HStack>
              </Alert>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Results Section */}
      {(citationResults.length > 0 ||
        (jobStatus === 'completed' && extractionCompleted)) && (
        <Card borderRadius="lg" variant="outline">
          <CardHeader bg={secondaryBg} borderTopRadius="lg" py={3}>
            <Heading size="md">Citation Results</Heading>
          </CardHeader>
          <CardBody>
            {citationResults.length === 0 && jobStatus === 'completed' ? (
              <Alert status="info">
                <AlertIcon />
                Citations were processed successfully, but no results were
                found.
              </Alert>
            ) : (
              <Accordion allowMultiple defaultIndex={[0]}>
                {citationResults.map((referenceResult, refIndex) => (
                  <AccordionItem
                    key={refIndex}
                    mb={4}
                    borderWidth={1}
                    borderRadius="md"
                  >
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left" fontWeight="medium">
                          {referenceResult.reference}
                          <Badge ml={2} colorScheme="blue" fontSize="xs">
                            {referenceResult.citations.length} citations
                          </Badge>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      {referenceResult.citations.length === 0 ? (
                        <Text color="gray.500">
                          No citations found for this reference.
                        </Text>
                      ) : (
                        <>
                          <Text fontSize="sm" mb={3} color="gray.600">
                            Showing the highest relevancy citation match for
                            each element.
                          </Text>
                          <Table variant="simple" size="sm">
                            <Thead>
                              <Tr>
                                <Th width="30%">Element</Th>
                                <Th width="50%">Best Citation Match</Th>
                                <Th width="20%">Relevance</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {referenceResult.citations.map(
                                (
                                  citation: CitationResult,
                                  citIndex: number
                                ) => (
                                  <Tr key={citIndex}>
                                    <Td>
                                      <Text fontSize="sm" fontWeight="medium">
                                        {citation.claimElement ||
                                          'No element data available'}
                                      </Text>
                                    </Td>
                                    <Td>
                                      <Text fontSize="sm">
                                        {citation.citation ||
                                          'No citation text'}
                                      </Text>
                                    </Td>
                                    <Td>
                                      <Badge
                                        colorScheme={
                                          (citation.rankPercentage ?? 0) > 0.6
                                            ? 'green'
                                            : (citation.rankPercentage ?? 0) >
                                                0.4
                                              ? 'yellow'
                                              : 'red'
                                        }
                                      >
                                        {(
                                          (citation.rankPercentage ?? 0) * 100
                                        ).toFixed(2)}
                                        %
                                      </Badge>
                                    </Td>
                                  </Tr>
                                )
                              )}
                            </Tbody>
                          </Table>
                        </>
                      )}
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardBody>
        </Card>
      )}
    </VStack>
  );
};

export default CitationExtractionPanel;

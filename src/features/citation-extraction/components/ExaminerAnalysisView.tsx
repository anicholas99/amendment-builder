import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Divider,
  List,
  ListItem,
  ListIcon,
  Tag,
  TagLabel,
  Collapse,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiFileText,
  FiShield,
  FiTarget,
  FiEye,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import { ExaminerAnalysisResult } from '@/types/domain/citation';

interface ExaminerAnalysisViewProps {
  analysis: ExaminerAnalysisResult;
  referenceNumber: string;
  onClose?: () => void;
}

export const ExaminerAnalysisView: React.FC<ExaminerAnalysisViewProps> = ({
  analysis,
  referenceNumber,
  onClose,
}) => {
  const { isOpen: isStrategyOpen, onToggle: onStrategyToggle } = useDisclosure({
    defaultIsOpen: true,
  });
  const { isOpen: isElementsOpen, onToggle: onElementsToggle } = useDisclosure({
    defaultIsOpen: false,
  });

  // Determine rejection severity
  const getRejectionSeverity = (type: string) => {
    switch (type) {
      case '102 Anticipation':
        return { color: 'red', icon: FiAlertCircle };
      case '103 Obviousness':
        return { color: 'orange', icon: FiInfo };
      case 'No Rejection':
        return { color: 'green', icon: FiCheckCircle };
      default:
        return { color: 'gray', icon: FiInfo };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Box w="full" maxW="1200px" mx="auto" p={4}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Card>
          <CardHeader>
            <VStack align="start" spacing={2}>
              <HStack justify="space-between" w="full">
                <HStack spacing={3}>
                  <FiFileText size="24px" />
                  <Heading size="lg">USPTO Examiner Analysis</Heading>
                </HStack>
                <Badge colorScheme="blue" fontSize="md" p={2}>
                  {referenceNumber}
                </Badge>
              </HStack>
              <HStack spacing={4} fontSize="sm" color="gray.600">
                <Text>{analysis.referenceTitle}</Text>
                <Text>•</Text>
                <Text>Analysis Date: {formatDate(analysis.analysisDate)}</Text>
              </HStack>
            </VStack>
          </CardHeader>
        </Card>

        {/* Examiner Summary */}
        <Card>
          <CardHeader>
            <Heading size="md">Examiner Summary</Heading>
          </CardHeader>
          <CardBody>
            <Box
              fontSize="md"
              lineHeight="tall"
              whiteSpace="pre-wrap"
              color="gray.700"
            >
              {analysis.examinerSummary}
            </Box>
          </CardBody>
        </Card>

        {/* Key Rejection Points */}
        <Card>
          <CardHeader>
            <HStack>
              <FiShield size="20px" />
              <Heading size="md">Key Rejection Analysis</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {analysis.keyRejectionPoints.map((rejection, index) => {
                const severity = getRejectionSeverity(rejection.type);
                const Icon = severity.icon;

                return (
                  <Alert
                    key={index}
                    status={
                      rejection.type === 'No Rejection' ? 'success' : 'warning'
                    }
                    variant="left-accent"
                    borderRadius="md"
                  >
                    <AlertIcon as={Icon} />
                    <Box flex="1">
                      <AlertTitle>
                        <Badge colorScheme={severity.color} fontSize="sm">
                          {rejection.type}
                        </Badge>
                      </AlertTitle>
                      <AlertDescription mt={2}>
                        <VStack align="start" spacing={2}>
                          <Text fontSize="sm">{rejection.rationale}</Text>
                          {rejection.elements.length > 0 && (
                            <HStack wrap="wrap" spacing={2}>
                              <Text fontSize="xs" fontWeight="semibold">
                                Elements:
                              </Text>
                              {rejection.elements.map((element, i) => (
                                <Tag key={i} size="sm" colorScheme="blue">
                                  <TagLabel>{element}</TagLabel>
                                </Tag>
                              ))}
                            </HStack>
                          )}
                        </VStack>
                      </AlertDescription>
                    </Box>
                  </Alert>
                );
              })}
            </VStack>
          </CardBody>
        </Card>

        {/* Response Strategy */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <HStack>
                <FiTarget size="20px" />
                <Heading size="md">Response Strategy</Heading>
              </HStack>
              <IconButton
                aria-label="Toggle strategy"
                icon={isStrategyOpen ? <FiChevronUp /> : <FiChevronDown />}
                size="sm"
                variant="ghost"
                onClick={onStrategyToggle}
              />
            </HStack>
          </CardHeader>
          <Collapse in={isStrategyOpen}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {/* Primary Argument */}
                <Box>
                  <Heading size="sm" mb={2}>
                    Primary Argument
                  </Heading>
                  <Box
                    p={4}
                    bg="blue.50"
                    borderRadius="md"
                    borderLeft="4px solid"
                    borderLeftColor="blue.400"
                  >
                    <Text>{analysis.responseStrategy.primaryArgument}</Text>
                  </Box>
                </Box>

                {/* Amendment Suggestions */}
                {analysis.responseStrategy.amendmentSuggestions.length > 0 && (
                  <Box>
                    <Heading size="sm" mb={2}>
                      Recommended Amendments
                    </Heading>
                    <List spacing={2}>
                      {analysis.responseStrategy.amendmentSuggestions.map(
                        (amendment, i) => (
                          <ListItem key={i} fontSize="sm">
                            <HStack align="start">
                              <ListIcon
                                as={FiCheckCircle}
                                color="green.500"
                                mt={0.5}
                              />
                              <Text>{amendment}</Text>
                            </HStack>
                          </ListItem>
                        )
                      )}
                    </List>
                  </Box>
                )}

                {/* Key Distinctions */}
                {analysis.responseStrategy.distinctionPoints.length > 0 && (
                  <Box>
                    <Heading size="sm" mb={2}>
                      Key Distinctions
                    </Heading>
                    <List spacing={2}>
                      {analysis.responseStrategy.distinctionPoints.map(
                        (point, i) => (
                          <ListItem key={i} fontSize="sm">
                            <HStack align="start">
                              <ListIcon as={FiInfo} color="blue.500" mt={0.5} />
                              <Text>{point}</Text>
                            </HStack>
                          </ListItem>
                        )
                      )}
                    </List>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Collapse>
        </Card>

        {/* Element-by-Element Comparison */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <HStack>
                <FiEye size="20px" />
                <Heading size="md">Element-by-Element Analysis</Heading>
              </HStack>
              <IconButton
                aria-label="Toggle elements"
                icon={isElementsOpen ? <FiChevronUp /> : <FiChevronDown />}
                size="sm"
                variant="ghost"
                onClick={onElementsToggle}
              />
            </HStack>
          </CardHeader>
          <Collapse in={isElementsOpen}>
            <CardBody>
              <Accordion allowMultiple>
                {analysis.elementComparisons.map((comparison, index) => (
                  <AccordionItem key={index}>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <Text fontWeight="semibold" fontSize="sm">
                            {comparison.element}
                          </Text>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <VStack spacing={3} align="stretch">
                        {/* Examiner View */}
                        <Box>
                          <Text
                            fontSize="xs"
                            fontWeight="semibold"
                            color="gray.600"
                            mb={1}
                          >
                            Examiner's Assessment:
                          </Text>
                          <Text fontSize="sm">{comparison.examinerView}</Text>
                        </Box>

                        {/* Top Citations */}
                        {comparison.topCitations.length > 0 && (
                          <Box>
                            <Text
                              fontSize="xs"
                              fontWeight="semibold"
                              color="gray.600"
                              mb={2}
                            >
                              Supporting Citations:
                            </Text>
                            <VStack spacing={2} align="stretch">
                              {comparison.topCitations.map((citation, i) => (
                                <Box
                                  key={i}
                                  p={3}
                                  bg="gray.50"
                                  borderRadius="md"
                                  fontSize="sm"
                                >
                                  <HStack justify="space-between" mb={1}>
                                    <Badge colorScheme="purple" fontSize="xs">
                                      {citation.location}
                                    </Badge>
                                    <Badge colorScheme="green" fontSize="xs">
                                      {citation.relevance.toFixed(1)}% Match
                                    </Badge>
                                  </HStack>
                                  <Text fontSize="xs" fontStyle="italic">
                                    "{citation.text}"
                                  </Text>
                                </Box>
                              ))}
                            </VStack>
                          </Box>
                        )}
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardBody>
          </Collapse>
        </Card>
      </VStack>
    </Box>
  );
};

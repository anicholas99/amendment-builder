/**
 * Element Analysis Accordion Component
 *
 * Displays element-by-element rejection analysis in an accordion format.
 * Single responsibility: Element analysis display and interaction.
 */

import React, { useRef, useState } from 'react';
import {
  Box,
  Text,
  Heading,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Flex,
  HStack,
  Tag,
  TagLabel,
  TagLeftIcon,
  List,
  ListItem,
  ListIcon,
  Icon,
  Divider,
} from '@chakra-ui/react';
import {
  FiInfo,
  FiCheckCircle,
  FiFileText,
  FiCornerUpRight,
} from 'react-icons/fi';
import {
  ParsedDeepAnalysis,
  StructuredDeepAnalysis,
  ExaminerStructuredDeepAnalysis,
  ExaminerElementAnalysis,
} from '../../types/deepAnalysis';
import {
  extractKeyPhrases,
  getRejectionColor,
  getRejectionScheme,
  determineRejectionType,
  determineElementLevel,
} from '../../utils/deepAnalysisUtils';

interface ElementAnalysisAccordionProps {
  analysisData: ParsedDeepAnalysis | StructuredDeepAnalysis;
  examinerData?: ExaminerStructuredDeepAnalysis | null;
  isStructuredFormat: boolean;
  defaultExpanded?: boolean;
}

export const ElementAnalysisAccordion: React.FC<
  ElementAnalysisAccordionProps
> = ({
  analysisData,
  examinerData,
  isStructuredFormat,
  defaultExpanded = false,
}) => {
  // Get elements to display - either from structured or legacy format
  const elements = isStructuredFormat
    ? Object.keys((analysisData as StructuredDeepAnalysis).elementAnalysis)
    : Object.keys(analysisData as ParsedDeepAnalysis);

  // Create refs for each accordion item
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [expandedIndices, setExpandedIndices] = useState<number[]>(
    defaultExpanded ? [0] : []
  );

  // Handle accordion change to scroll expanded item into view within its container
  const handleAccordionChange = (newExpandedIndices: number[]) => {
    // Find which index was newly expanded
    const newlyExpanded = newExpandedIndices.find(
      index => !expandedIndices.includes(index)
    );

    if (newlyExpanded !== undefined && itemRefs.current[newlyExpanded]) {
      // Use setTimeout to ensure the accordion has finished expanding
      setTimeout(() => {
        const element = itemRefs.current[newlyExpanded];
        if (!element) return;

        // Find the scrollable parent container by checking computed styles
        let scrollableParent: HTMLElement | null = element.parentElement;
        while (scrollableParent) {
          const computedStyle = window.getComputedStyle(scrollableParent);
          if (
            computedStyle.overflowY === 'auto' ||
            computedStyle.overflowY === 'scroll' ||
            computedStyle.overflow === 'auto' ||
            computedStyle.overflow === 'scroll'
          ) {
            break;
          }
          scrollableParent = scrollableParent.parentElement;
        }

        if (!scrollableParent) return;

        // Calculate position relative to the scrollable container
        const elementRect = element.getBoundingClientRect();
        const containerRect = scrollableParent.getBoundingClientRect();

        // Calculate the element's position relative to the container
        const relativeTop =
          elementRect.top - containerRect.top + scrollableParent.scrollTop;

        // Calculate center position
        const scrollPosition =
          relativeTop - containerRect.height / 2 + elementRect.height / 2;

        // Smooth scroll within the container
        scrollableParent.scrollTo({
          top: Math.max(0, scrollPosition),
          behavior: 'smooth',
        });
      }, 150);
    }

    setExpandedIndices(newExpandedIndices);
  };

  return (
    <>
      <Box mb={4}>
        <Heading
          size="sm"
          mb={1}
          color="gray.700"
          _dark={{ color: 'gray.200' }}
        >
          Element-by-Element Rejection Analysis
        </Heading>
        <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }}>
          Click on any element to see detailed analysis and citations
        </Text>
      </Box>
      <Accordion
        allowMultiple
        {...(defaultExpanded && { defaultIndex: [0] })}
        width="100%"
        onChange={handleAccordionChange}
        index={expandedIndices}
      >
        {elements.map((element, index) => {
          // Get element analysis - either from structured or legacy format
          const elementData = isStructuredFormat
            ? (examinerData as ExaminerStructuredDeepAnalysis)?.elementAnalysis[
                element
              ]
            : null;

          const analysisText = elementData
            ? elementData.analysis
            : (analysisData as ParsedDeepAnalysis)[element];

          // For legacy format, try to extract some key phrases to simulate key findings
          const keyFindings = elementData
            ? elementData.keyFindings
            : extractKeyPhrases(analysisText);

          // Get rejection type if available
          const rejectionType =
            elementData &&
            (elementData as ExaminerElementAnalysis).rejectionType
              ? (elementData as ExaminerElementAnalysis).rejectionType
              : determineRejectionType(analysisText);

          // Generate a color based on the rejection type
          const elementColor = getRejectionColor(rejectionType);

          // Get primary citations
          const primaryCitations =
            elementData &&
            (elementData as ExaminerElementAnalysis).primaryCitations
              ? (elementData as ExaminerElementAnalysis).primaryCitations
              : [];

          return (
            <AccordionItem
              key={index}
              borderWidth="1px"
              borderRadius="lg"
              mb={3}
              borderColor="gray.200"
              _dark={{ borderColor: 'gray.600' }}
              boxShadow="sm"
              ref={el => {
                itemRefs.current[index] = el;
              }}
            >
              <AccordionButton
                _expanded={{
                  bg: 'blue.50',
                  _dark: { bg: 'gray.700' },
                }}
                _hover={{
                  bg: 'gray.50',
                  _dark: { bg: 'gray.700' },
                }}
                px={4}
                py={3}
                textAlign="left"
                borderRadius="lg"
              >
                <Flex
                  width="100%"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={3}
                >
                  <Text
                    fontWeight="semibold"
                    fontSize="sm"
                    color="gray.700"
                    _dark={{ color: 'gray.200' }}
                    flex="1"
                    minW="0"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    mr={2}
                    textAlign="left"
                  >
                    {element}
                  </Text>
                  <HStack spacing={2} flexShrink={0} alignItems="center">
                    {elementData && (
                      <Tag
                        size="sm"
                        variant="subtle"
                        colorScheme={getRejectionScheme(
                          rejectionType || 'Not Rejected'
                        )}
                        minW="max-content"
                        flexShrink={0}
                        px={2}
                      >
                        <TagLeftIcon as={FiInfo} boxSize="14px" />
                        <TagLabel fontSize="xs" whiteSpace="nowrap">
                          {rejectionType}
                          {elementData.relevanceScore !== undefined &&
                            ` (${Math.round(elementData.relevanceScore * 100)}%)`}
                        </TagLabel>
                      </Tag>
                    )}
                    <AccordionIcon flexShrink={0} />
                  </HStack>
                </Flex>
              </AccordionButton>
              <AccordionPanel pb={4} pt={4} px={4}>
                <VStack align="stretch" spacing={4}>
                  <Box>
                    <Text
                      fontSize="sm"
                      color="gray.700"
                      _dark={{ color: 'gray.300' }}
                      lineHeight="tall"
                    >
                      {analysisText}
                    </Text>
                  </Box>

                  {/* If we have rejection rationale, display it */}
                  {elementData &&
                    (elementData as ExaminerElementAnalysis)
                      .rejectionRationale &&
                    (elementData as ExaminerElementAnalysis)
                      .rejectionRationale !== analysisText && (
                      <Box
                        p={4}
                        bg="orange.50"
                        _dark={{ bg: 'orange.900' }}
                        borderRadius="md"
                        borderLeftWidth="4px"
                        borderLeftColor="orange.400"
                      >
                        <Text
                          fontWeight="semibold"
                          fontSize="sm"
                          mb={2}
                          color="orange.700"
                          _dark={{ color: 'orange.300' }}
                        >
                          Rejection Rationale
                        </Text>
                        <Text
                          fontSize="sm"
                          color="gray.700"
                          _dark={{ color: 'gray.300' }}
                          lineHeight="tall"
                        >
                          {
                            (elementData as ExaminerElementAnalysis)
                              .rejectionRationale
                          }
                        </Text>
                      </Box>
                    )}

                  {/* Display primary citations if available */}
                  {primaryCitations && primaryCitations.length > 0 && (
                    <Box>
                      <Text
                        fontWeight="semibold"
                        fontSize="sm"
                        mb={2}
                        color="gray.700"
                        _dark={{ color: 'gray.300' }}
                      >
                        Key Citations
                      </Text>
                      <VStack align="start" spacing={3}>
                        {primaryCitations.map((citation, i) => (
                          <Box
                            key={i}
                            bg="blue.50"
                            _dark={{ bg: 'blue.900', opacity: 0.2 }}
                            p={4}
                            borderRadius="md"
                            width="100%"
                            borderLeftWidth="3px"
                            borderLeftColor="blue.400"
                          >
                            <VStack align="start" spacing={2}>
                              <Text
                                fontSize="xs"
                                color="blue.600"
                                _dark={{ color: 'blue.300' }}
                                fontWeight="medium"
                              >
                                {citation.location}
                              </Text>
                              <Text
                                fontSize="sm"
                                fontStyle="italic"
                                color="gray.700"
                                _dark={{ color: 'gray.300' }}
                              >
                                "{citation.citationText}"
                              </Text>
                              {citation.reasoning && (
                                <Text
                                  fontSize="xs"
                                  color="gray.600"
                                  _dark={{ color: 'gray.400' }}
                                  mt={1}
                                >
                                  <Text as="span" fontWeight="medium">
                                    Relevance:
                                  </Text>{' '}
                                  {citation.reasoning}
                                </Text>
                              )}
                            </VStack>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  )}

                  {keyFindings && keyFindings.length > 0 && (
                    <Box>
                      <Text
                        fontWeight="semibold"
                        fontSize="sm"
                        mb={2}
                        color="gray.700"
                        _dark={{ color: 'gray.300' }}
                      >
                        Key Findings
                      </Text>
                      <List spacing={2}>
                        {keyFindings.map((finding, i) => (
                          <ListItem
                            key={i}
                            fontSize="sm"
                            display="flex"
                            alignItems="flex-start"
                          >
                            <Box mr={2} mt="1px">
                              <ListIcon
                                as={FiCheckCircle}
                                color={elementColor}
                              />
                            </Box>
                            <Text
                              color="gray.700"
                              _dark={{ color: 'gray.300' }}
                              lineHeight="tall"
                            >
                              {finding}
                            </Text>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {elementData?.recommendation && (
                    <Box
                      p={4}
                      bg="green.50"
                      _dark={{ bg: 'green.900' }}
                      borderRadius="md"
                      borderLeftWidth="4px"
                      borderLeftColor="green.400"
                    >
                      <Text
                        fontWeight="semibold"
                        fontSize="sm"
                        mb={2}
                        color="green.700"
                        _dark={{ color: 'green.300' }}
                      >
                        Amendment Recommendation
                      </Text>
                      <Flex alignItems="flex-start">
                        <Icon
                          as={FiCornerUpRight}
                          mr={2}
                          color="green.500"
                          mt="2px"
                        />
                        <Text
                          fontSize="sm"
                          color="gray.700"
                          _dark={{ color: 'gray.300' }}
                          lineHeight="tall"
                        >
                          {elementData.recommendation}
                        </Text>
                      </Flex>
                    </Box>
                  )}
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          );
        })}
      </Accordion>
    </>
  );
};

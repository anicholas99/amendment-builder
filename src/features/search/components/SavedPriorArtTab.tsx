import React, { useState } from 'react';
import { logger } from '@/lib/monitoring/logger';
import {
  Box,
  VStack,
  Text,
  HStack,
  Badge,
  Icon,
  Divider,
  Flex,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  IconButton,
  Collapse,
} from '@chakra-ui/react';
import {
  FiClock,
  FiExternalLink,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiRefreshCw,
} from 'react-icons/fi';
import { ProcessedSavedPriorArt } from '@/types/domain/priorArt';
import { format } from 'date-fns';
import { ExtractedPriorArtBadge } from '@/components/ui/ExtractedPriorArtBadge';

interface SavedPriorArtTabProps {
  savedPriorArt: ProcessedSavedPriorArt[];
  onRemovePriorArt: (index: number) => void;
  onOpenPriorArtDetails: (reference: unknown) => void;
  onRefreshList?: () => void;
}

/**
 * Component to display saved prior art in the claim refinement sidebar
 */
const SavedPriorArtTab: React.FC<SavedPriorArtTabProps> = ({
  savedPriorArt,
  onRemovePriorArt,
  onOpenPriorArtDetails,
  onRefreshList,
}) => {
  // Debug logging to understand the data
  // Only log when there's an actual error or unexpected data
  // React.useEffect(() => {
  //   logger.debug('[SavedPriorArtTab] Component rendered with data:', {
  //     savedPriorArtLength: savedPriorArt?.length || 0,
  //     hasSavedPriorArt: !!savedPriorArt,
  //     isArray: Array.isArray(savedPriorArt),
  //   });
  // }, [savedPriorArt]);

  // For delete confirmation dialog
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  // State to track the index of the expanded row, null if none
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Format patent number for Google Patents URL
  const formatPatentUrl = (patentNumber: string): string => {
    // Remove any dashes that might be in the patent number
    const cleanPatentNumber = patentNumber.replace(/-/g, '');
    return `https://patents.google.com/patent/${cleanPatentNumber}`;
  };

  // Handle remove button click
  const handleRemoveClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex(index);
    onOpen();
  };

  // Confirm removal
  const confirmRemove = () => {
    if (selectedIndex !== null) {
      onRemovePriorArt(selectedIndex);
      setSelectedIndex(null);
      onClose();
    }
  };

  // Function to toggle expansion for a row
  const handleToggleExpand = (index: number) => {
    setExpandedIndex(prevIndex => (prevIndex === index ? null : index));
  };

  if (!savedPriorArt || savedPriorArt.length === 0) {
    return (
      <Box
        height="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="text.tertiary">No saved prior art yet</Text>
      </Box>
    );
  }

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <HStack
        justify="space-between"
        align="center"
        px={4}
        py={3}
        flexShrink={0}
      >
        <Text fontWeight="medium" fontSize="lg" color="text.primary">
          Saved Prior Art
        </Text>
        {onRefreshList && (
          <Tooltip label="Refresh list">
            <IconButton
              aria-label="Refresh saved prior art list"
              icon={<Icon as={FiRefreshCw} />}
              size="sm"
              variant="ghost"
              onClick={onRefreshList}
            />
          </Tooltip>
        )}
      </HStack>

      <Box flex="1" overflow="hidden" position="relative">
        <Box height="100%" overflowY="auto" className="custom-scrollbar">
          <Table variant="simple" size="sm">
            <Thead bg="bg.secondary" position="sticky" top={0} zIndex={1}>
              <Tr>
                <Th px={4} color="text.primary">
                  REFERENCE
                </Th>
                <Th px={3} width="100px" color="text.primary">
                  DATE ADDED
                </Th>
                <Th px={3} width="70px" color="text.primary">
                  ACTIONS
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {savedPriorArt.map((reference, index) => {
                // Format the date if available, using savedAt
                const dateText = reference.savedAt
                  ? format(new Date(reference.savedAt), 'MMM d, yyyy')
                  : 'N/A';

                // Safely access patentNumber
                const patentNumber = reference.patentNumber;
                const displayPatentNumber =
                  typeof patentNumber === 'string'
                    ? patentNumber.replace(/-/g, '')
                    : 'Invalid Number';

                // Derive year from publicationDate if year field is missing or empty
                let displayYear = reference.priorArtData.year || 'N/A';
                if (
                  (!reference.priorArtData.year ||
                    reference.priorArtData.year === 'N/A') &&
                  reference.priorArtData.publicationDate &&
                  typeof reference.priorArtData.publicationDate === 'string' &&
                  reference.priorArtData.publicationDate.length >= 4
                ) {
                  displayYear =
                    reference.priorArtData.publicationDate.substring(0, 4);
                }

                // Extract saved citations information from the parsed array
                const savedCitations = reference.savedCitations || [];

                const elementTexts = savedCitations
                  .map(citation => citation.elementText?.trim())
                  .filter(Boolean);
                const uniqueElementTexts = Array.from(new Set(elementTexts));
                const citationCount = savedCitations.length;

                const isExpanded = expandedIndex === index;

                // Check if this reference was extracted from invention disclosure
                const isFromDisclosure =
                  reference.notes?.includes(
                    'Extracted from invention disclosure'
                  ) ?? false;
                let extractedContext: string | undefined;
                let extractedRelevance: string | undefined;
                let originalReference: string | undefined;

                if (isFromDisclosure && reference.notes) {
                  // Parse context, relevance, and original reference from notes
                  const contextMatch =
                    reference.notes.match(/Context: ([^.]+)\./);
                  const relevanceMatch =
                    reference.notes.match(/Relevance: ([^.]+)\./);
                  const originalMatch =
                    reference.notes.match(/Original: ([^.]+)$/);

                  extractedContext =
                    contextMatch?.[1] !== 'N/A' ? contextMatch?.[1] : undefined;
                  extractedRelevance =
                    relevanceMatch?.[1] !== 'N/A'
                      ? relevanceMatch?.[1]
                      : undefined;
                  originalReference = originalMatch?.[1];
                }

                return (
                  <React.Fragment key={index}>
                    <Tr
                      _hover={{ bg: 'bg.hover' }}
                      bg={index % 2 === 0 ? 'transparent' : 'bg.secondary'}
                      cursor={citationCount > 0 ? 'pointer' : 'default'}
                      onClick={() =>
                        citationCount > 0 && handleToggleExpand(index)
                      }
                      title={
                        citationCount > 0
                          ? 'Click to view citation details'
                          : undefined
                      }
                    >
                      <Td px={4}>
                        <HStack align="start" spacing={2}>
                          <Text
                            fontWeight="medium"
                            fontSize="xs"
                            color="text.primary"
                          >
                            {displayPatentNumber}
                          </Text>
                          {citationCount > 0 ? (
                            <>
                              <Badge colorScheme="blue" fontSize="xs">
                                {citationCount}{' '}
                                {citationCount === 1 ? 'citation' : 'citations'}
                              </Badge>
                              <Icon
                                as={isExpanded ? FiChevronUp : FiChevronDown}
                                boxSize="12px"
                                color="blue.500"
                                ml={1}
                              />
                            </>
                          ) : (
                            <Text fontSize="10px" color="text.tertiary">
                              No citations saved
                            </Text>
                          )}
                          {isFromDisclosure && (
                            <ExtractedPriorArtBadge
                              context={extractedContext}
                              relevance={extractedRelevance}
                              originalReference={originalReference}
                            />
                          )}
                        </HStack>
                        <VStack align="start" spacing={0}>
                          <Text
                            fontSize="xs"
                            noOfLines={1}
                            color="text.primary"
                          >
                            {reference.priorArtData.title}
                          </Text>
                          {reference.priorArtData.authors && (
                            <Text fontSize="10px" color="text.tertiary">
                              {reference.priorArtData.authors} ({displayYear})
                            </Text>
                          )}
                        </VStack>
                      </Td>
                      <Td px={3}>
                        <Text fontSize="xs" color="text.tertiary">
                          {dateText}
                        </Text>
                      </Td>
                      <Td px={3}>
                        <HStack spacing={1}>
                          <Tooltip label="View patent details">
                            <Button
                              size="xs"
                              variant="ghost"
                              colorScheme="blue"
                              p={1}
                              minW="auto"
                              h="auto"
                              onClick={e => {
                                e.stopPropagation();
                                window.open(
                                  formatPatentUrl(reference.patentNumber),
                                  '_blank'
                                );
                              }}
                              _hover={{
                                color: 'blue.600',
                                bg: 'blue.50',
                              }}
                            >
                              <Icon
                                as={FiExternalLink}
                                boxSize="0.9em"
                                color="blue.500"
                              />
                            </Button>
                          </Tooltip>
                          <Tooltip label="Remove from saved prior art">
                            <Button
                              size="xs"
                              variant="ghost"
                              colorScheme="red"
                              p={1}
                              minW="auto"
                              h="auto"
                              onClick={e => {
                                e.stopPropagation();
                                handleRemoveClick(index, e);
                              }}
                              _hover={{
                                color: 'red.600',
                                bg: 'red.50',
                              }}
                            >
                              <Icon
                                as={FiTrash2}
                                boxSize="0.9em"
                                color="red.500"
                              />
                            </Button>
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td
                        colSpan={3}
                        p={0}
                        borderBottomWidth={isExpanded ? '1px' : '0px'}
                        borderColor="border.light"
                      >
                        <Collapse in={isExpanded} animateOpacity>
                          <Box p={4} bg="bg.card">
                            <VStack align="stretch" spacing={3}>
                              {savedCitations.map((citation, citIndex) => (
                                <Box
                                  key={citIndex}
                                  pb={2}
                                  borderBottomWidth={
                                    citIndex < savedCitations.length - 1
                                      ? '1px'
                                      : '0px'
                                  }
                                  borderColor="border.light"
                                >
                                  <Text
                                    fontWeight="medium"
                                    fontSize="xs"
                                    mb={1}
                                    color="blue.500"
                                  >
                                    Element: {citation.elementText || 'N/A'}
                                  </Text>
                                  <Text
                                    fontSize="xs"
                                    mb={1}
                                    whiteSpace="pre-wrap"
                                    color="text.primary"
                                  >
                                    Citation: {citation.citation || 'N/A'}
                                  </Text>
                                  <Text fontSize="xs" color="text.tertiary">
                                    Location: {citation.location || 'N/A'}
                                  </Text>
                                </Box>
                              ))}
                            </VStack>
                          </Box>
                        </Collapse>
                      </Td>
                    </Tr>
                  </React.Fragment>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="bg.card" borderColor="border.primary">
            <AlertDialogHeader
              fontSize="lg"
              fontWeight="bold"
              color="text.primary"
            >
              Remove Prior Art
            </AlertDialogHeader>

            <AlertDialogBody color="text.primary">
              Are you sure you want to remove this prior art reference? This
              action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmRemove} ml={3}>
                Remove
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default SavedPriorArtTab;

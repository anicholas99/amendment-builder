import React, { useCallback, useRef } from 'react';
import { logger } from '@/lib/monitoring/logger';
import {
  Box,
  Text,
  HStack,
  VStack,
  Badge,
  Icon,
  Tooltip,
  Button,
  Collapse,
  Flex,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiChevronDown, FiChevronUp, FiFileText, FiUser } from 'react-icons/fi';
import {
  PriorArtReference,
  FamilyMemberReference,
} from '../../../types/claimTypes';
import {
  getRelevancyColor,
  formatRelevancePercentage,
  isValidRelevance,
  cleanAbstract,
} from '../utils/searchHistoryUtils';
import { ReferenceActionButtons } from './ReferenceActionButtons';
import { FamilyMemberItem } from './FamilyMemberItem';

// Define the props for the ReferenceCard component
interface ReferenceCardProps {
  reference: PriorArtReference;
  colors: {
    bg: string;
    borderColor: string;
    headerBg: string;
    textColor: string;
    mutedTextColor: string;
    hoverBg: string;
    queryBg: string;
    tableBg: string;
    tableHeaderBg: string;
    tableStripedBg: string;
  };
  isSaved: boolean;
  isExcluded: boolean;
  // Add checks for family member status passed from parent
  isFamilyMemberSaved?: (memberNumber: string) => boolean;
  isFamilyMemberExcluded?: (memberNumber: string) => boolean;
  // hasCitationJob: boolean; // We might need more granular status later
  getCitationIcon: (referenceNumber: string) => React.ReactNode; // Pass down the icon rendering logic
  onSave: (reference: PriorArtReference) => Promise<void> | void;
  onExclude: (reference: PriorArtReference) => void;
  // onViewCitations: (referenceNumber: string) => void; // Handled by getCitationIcon
  resultIndex?: number; // Optional index if needed for keys or logic
}

/**
 * Reusable component to display a single prior art reference card.
 */
const ReferenceCard: React.FC<ReferenceCardProps> = React.memo(
  ({
    reference,
    colors,
    isSaved,
    isExcluded,
    // Destructure new props
    isFamilyMemberSaved = (_mn: string) => false, // Default function if not provided
    isFamilyMemberExcluded = (_mn: string) => false, // Default function if not provided
    getCitationIcon,
    onSave,
    onExclude,
    resultIndex = 0, // Default index
  }) => {
    const { isOpen: isFamilyExpanded, onToggle: onFamilyToggle } =
      useDisclosure();
    const {
      isOpen: isConfirmOpen,
      onOpen: onConfirmOpen,
      onClose: onConfirmClose,
    } = useDisclosure();
    const { isOpen: isAbstractExpanded, onToggle: onAbstractToggle } =
      useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);

    // Central handler for the exclude button click
    const handleExcludeClick = useCallback(() => {
      // No need to pass refToExclude, use 'reference' prop
      const hasFamily =
        Array.isArray(reference.otherFamilyMembers) &&
        reference.otherFamilyMembers.length > 0;

      if (isExcluded) return; // Already excluded

      if (hasFamily) {
        onConfirmOpen(); // Open confirmation dialog for family
      } else {
        onExclude(reference); // Exclude single directly using the reference prop
      }
    }, [isExcluded, reference, onConfirmOpen, onExclude]);

    // Dialog confirmation actions
    const confirmExcludeFamily = useCallback(() => {
      onExclude(reference); // Exclude the main reference (parent handles family logic)
      onConfirmClose();
    }, [reference, onExclude, onConfirmClose]);

    const declineExcludeFamily = useCallback(() => {
      logger.warn(
        'Excluding only single reference after declining family exclusion. Ensure parent handler supports this.'
      );
      onExclude(reference); // Call parent handler for single exclusion
      onConfirmClose();
    }, [reference, onExclude, onConfirmClose]);

    // Click handlers with useCallback
    const handleAbstractToggle = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onAbstractToggle();
      },
      [onAbstractToggle]
    );

    const handleFamilyToggle = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onFamilyToggle();
      },
      [onFamilyToggle]
    );

    const handleSaveReference = useCallback(() => {
      onSave(reference);
    }, [reference, onSave]);

    const patentNumber = String(reference.number || '');
    const hasOtherFamilyMembers =
      Array.isArray(reference.otherFamilyMembers) &&
      reference.otherFamilyMembers.length > 0;
    const displayRelevanceValue = reference.relevance; // Read from prop

    // Check if abstract exists and has content
    const hasAbstract =
      reference.abstract && reference.abstract.trim().length > 0;

    return (
      <>
        <Box
          key={`${patentNumber}-${resultIndex}`} // Consider a more stable key if possible
          borderWidth="1px"
          borderRadius="md"
          p={1.5}
          bg={colors.tableBg}
          borderColor={colors.borderColor}
          _hover={{ bg: colors.hoverBg }}
        >
          <VStack align="stretch" spacing={0.5}>
            <Flex justify="space-between" align="center">
              <HStack spacing={2} align="center">
                <Text fontSize="sm" fontWeight="medium" title={reference.title}>
                  {patentNumber.replace(/-/g, '')}
                </Text>
                {isValidRelevance(displayRelevanceValue) ? (
                  (() => {
                    const validRelevance = displayRelevanceValue as number;
                    return (
                      <Badge
                        colorScheme={getRelevancyColor(validRelevance)}
                        variant="solid"
                        fontSize="2xs"
                        px={2}
                        py={0.5}
                      >
                        {formatRelevancePercentage(validRelevance)}
                      </Badge>
                    );
                  })()
                ) : (
                  <Text fontSize="2xs" color={colors.mutedTextColor}>
                    (N/A)
                  </Text>
                )}
                {reference.searchAppearanceCount &&
                  reference.searchAppearanceCount > 1 && (
                    <Badge
                      colorScheme="purple"
                      variant="solid"
                      fontSize="2xs"
                      px={2}
                      py={0.5}
                    >
                      {reference.searchAppearanceCount}x
                    </Badge>
                  )}
                {hasAbstract && (
                  <Button
                    size="xs"
                    fontSize="2xs"
                    variant="link"
                    colorScheme="blue"
                    leftIcon={<FiFileText />}
                    rightIcon={
                      isAbstractExpanded ? <FiChevronUp /> : <FiChevronDown />
                    }
                    onClick={handleAbstractToggle}
                    height="auto"
                    minHeight="auto"
                    p={1}
                    fontWeight="normal"
                  >
                    Abstract
                  </Button>
                )}
              </HStack>
              <ReferenceActionButtons
                referenceNumber={patentNumber}
                isSaved={isSaved}
                isExcluded={isExcluded}
                onSave={handleSaveReference}
                onExclude={handleExcludeClick}
                getCitationIcon={getCitationIcon}
              />
            </Flex>

            <Text
              fontSize="2xs"
              color={colors.textColor}
              noOfLines={1}
              title={reference.title}
              lineHeight="tight"
            >
              {reference.title || 'No title available'}
            </Text>

            {/* Abstract collapse section */}
            {hasAbstract && (
              <Collapse in={isAbstractExpanded} animateOpacity>
                <Box
                  bg={colors.queryBg}
                  p={2}
                  mt={2}
                  borderRadius="sm"
                  borderLeft="3px solid"
                  borderLeftColor="blue.300"
                >
                  <Text
                    fontSize="xs"
                    color={colors.textColor}
                    lineHeight="1.4"
                    whiteSpace="pre-wrap"
                  >
                    {cleanAbstract(reference.abstract!)}
                  </Text>
                </Box>
              </Collapse>
            )}

            <HStack
              justify="space-between"
              fontSize="2xs"
              color={colors.mutedTextColor}
            >
              <VStack align="start" spacing={1}>
                <HStack spacing={1} mt={1}>
                  <Icon as={FiUser} color={colors.textColor} />
                  <Text noOfLines={1} title={reference.authors?.join(', ')}>
                    {reference.authors?.join(', ') || 'N/A'}
                  </Text>
                </HStack>
                {hasOtherFamilyMembers && (
                  <Button
                    size="sm"
                    fontSize="xs"
                    variant="link"
                    colorScheme="blue"
                    leftIcon={
                      isFamilyExpanded ? <FiChevronUp /> : <FiChevronDown />
                    }
                    onClick={handleFamilyToggle}
                    mt={0}
                  >
                    {isFamilyExpanded ? 'Hide' : 'Show'} Family Members (
                    {(reference.otherFamilyMembers || []).length})
                  </Button>
                )}
              </VStack>
              <Text whiteSpace="nowrap">
                {/* Use reference.year as it exists on the type */}
                {reference.year || 'N/A'}
              </Text>
            </HStack>
          </VStack>

          {hasOtherFamilyMembers && (
            <Collapse in={isFamilyExpanded} animateOpacity>
              <VStack align="stretch" spacing={1} mt={2} pl={4}>
                {(reference.otherFamilyMembers || []).map((member, index) => {
                  const memberRef = member as FamilyMemberReference;
                  const memberNumber = memberRef.number;
                  if (!memberNumber) return null;

                  return (
                    <FamilyMemberItem
                      key={`${memberNumber}-${index}`}
                      member={memberRef}
                      index={index}
                      colors={{
                        textColor: colors.textColor,
                        hoverBg: colors.hoverBg,
                      }}
                      isSaved={isFamilyMemberSaved(memberNumber)}
                      isExcluded={isFamilyMemberExcluded(memberNumber)}
                      getCitationIcon={getCitationIcon}
                      onSave={onSave}
                      onExclude={onExclude}
                    />
                  );
                })}
              </VStack>
            </Collapse>
          )}
        </Box>

        {/* Confirmation Dialog for family exclusion */}
        <AlertDialog
          isOpen={isConfirmOpen}
          leastDestructiveRef={cancelRef}
          onClose={onConfirmClose}
          isCentered
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Exclude Family Members?
              </AlertDialogHeader>
              <AlertDialogBody>
                This reference has {reference.otherFamilyMembers?.length || 0}{' '}
                associated family member(s). Do you want to exclude the entire
                family?
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={declineExcludeFamily}
                  variant="outline"
                >
                  No, Exclude Only This
                </Button>
                <Button colorScheme="red" onClick={confirmExcludeFamily} ml={3}>
                  Yes, Exclude Family
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison to avoid unnecessary re-renders
    return (
      prevProps.reference.number === nextProps.reference.number &&
      prevProps.isSaved === nextProps.isSaved &&
      prevProps.isExcluded === nextProps.isExcluded &&
      prevProps.resultIndex === nextProps.resultIndex &&
      // Deep compare colors object
      JSON.stringify(prevProps.colors) === JSON.stringify(nextProps.colors)
    );
  }
);

ReferenceCard.displayName = 'ReferenceCard';

export default ReferenceCard;

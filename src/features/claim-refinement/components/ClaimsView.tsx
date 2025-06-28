import React, {
  Dispatch,
  SetStateAction,
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import {
  Box,
  Text,
  VStack,
  Heading,
  Divider,
  Flex,
  Button,
  ButtonGroup,
  useDisclosure,
  Tooltip,
  Icon,
  IconButton,
  HStack,
  Textarea,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiEdit2,
  FiPrinter,
  FiSearch,
  FiClock,
  FiDownload,
  FiSettings,
  FiTrash2,
  FiCopy,
} from 'react-icons/fi';
import { useRouter } from 'next/router';
import ViewHeader from '../../../components/common/ViewHeader';
import EditableClaim from './EditableClaim';
import { InventionData } from '@/types';
import { buttonStyles } from '../../../styles/buttonStyles';
import { sortClaimNumbers } from '../utils/validation';
import { useTimeout } from '@/hooks/useTimeout';
import { Claim } from '@prisma/client';
import { logger } from '@/lib/monitoring/logger';

interface ClaimsViewProps {
  claims: Claim[] | undefined;
  claimViewMode: 'box' | 'list';
  onClaimChange: (claimId: string, text: string) => void;
  onDeleteClaim: (claimId: string) => void;
  onInsertClaim: (afterClaimId: string) => void;
  onReorderClaim: (claimId: string, direction: 'up' | 'down') => void;
  lastAddedClaimNumber?: string;
}

// Separate component for editable list item to properly use hooks
const EditableListItem = React.memo(
  ({
    claimId,
    claimNumber,
    claimText,
    isDependentClaim,
    onClaimChange,
    onDeleteClaim,
    onInsertClaim,
  }: {
    claimId: string;
    claimNumber: string;
    claimText: string;
    isDependentClaim: boolean;
    onClaimChange: (claimId: string, text: string) => void;
    onDeleteClaim: (claimId: string) => void;
    onInsertClaim: (claimId: string) => void;
  }) => {
    const [currentText, setCurrentText] = useState(claimText);
    const [hasPendingChanges, setHasPendingChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const toast = useToast();

    // Dark mode colors
    const independentBg = useColorModeValue('blue.50', 'blue.900');
    const dependentBg = useColorModeValue('white', 'gray.800');

    // Function to adjust textarea height
    const adjustTextareaHeight = useCallback(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        // Temporarily reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, []);

    useEffect(() => {
      if (!hasPendingChanges && !isSaving) {
        setCurrentText(claimText);
        adjustTextareaHeight();
      }
    }, [claimText, adjustTextareaHeight, hasPendingChanges, isSaving]);

    useEffect(() => {
      if ((hasPendingChanges || isSaving) && claimText === currentText) {
        setHasPendingChanges(false);
        setIsSaving(false);
      }
    }, [claimText, currentText, hasPendingChanges, isSaving]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      setCurrentText(newText);
      setHasPendingChanges(true);
    };

    const handleBlur = () => {
      if (currentText !== claimText) {
        // Check if this is a temporary claim ID
        if (claimId.startsWith('temp-')) {
          logger.debug(
            '[EditableListItem] Skipping update for temporary claim ID',
            { claimId }
          );
          // Revert to original text for temporary claims
          setCurrentText(claimText);
          setHasPendingChanges(false);
          toast({
            title: 'Saving...',
            description: "Your claim will be saved once it's fully created.",
            status: 'info',
            duration: 2000,
            isClosable: true,
          });
          return;
        }

        setIsSaving(true);
        onClaimChange(claimId, currentText);
      } else {
        setHasPendingChanges(false);
      }
    };

    // Effect for initial height adjustment and subsequent text changes
    useEffect(() => {
      adjustTextareaHeight();
    }, [currentText, adjustTextareaHeight]);

    // Effect for handling resize events
    useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Adjust height initially
      adjustTextareaHeight();

      const resizeObserver = new ResizeObserver(() => {
        // Recalculate height when the element size changes
        adjustTextareaHeight();
      });

      resizeObserver.observe(textarea);

      // Cleanup observer on component unmount
      return () => {
        resizeObserver.disconnect();
      };
    }, [adjustTextareaHeight]); // Depend on the stable adjustTextareaHeight callback

    const handleCopyClaim = async () => {
      try {
        const fullClaimText = `${claimNumber}. ${currentText}`;
        await navigator.clipboard.writeText(fullClaimText);
        toast({
          title: 'Claim copied!',
          description: `Claim ${claimNumber} has been copied to clipboard`,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Copy failed',
          description: 'Failed to copy claim to clipboard',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    return (
      <Box
        mb={6}
        bg={!isDependentClaim ? independentBg : dependentBg}
        borderRadius="md"
        id={`claim-${claimNumber}`}
        scrollMarginTop="100px"
        transition="box-shadow 0.15s ease-out"
        _hover={{ boxShadow: 'sm' }}
        position="relative"
        role="group"
        overflow="visible"
      >
        <Box p={4} bg="transparent">
          <Flex align="baseline" width="100%">
            <Text as="span" fontWeight="bold" mr={2} flexShrink={0}>
              {claimNumber}.{' '}
            </Text>
            <Box flex="1" position="relative" minWidth={0}>
              <Textarea
                ref={textareaRef}
                value={currentText}
                onChange={handleTextChange}
                onBlur={handleBlur}
                variant="unstyled"
                size="md"
                pl={1}
                pt="1px"
                lineHeight="1.8"
                fontFamily="serif"
                overflowY="hidden"
                resize="none"
                minHeight="auto"
                height="auto"
                width="100%"
                display="block"
                bg="transparent"
                sx={{
                  '&:focus': {
                    boxShadow: 'none',
                    borderBottom: '2px solid #3182CE',
                    marginBottom: '-2px',
                  },
                  overflowY: 'hidden !important',
                }}
              />
            </Box>
          </Flex>

          <HStack
            position="absolute"
            top="0px"
            right="8px"
            opacity="0"
            _groupHover={{ opacity: 1 }}
            transition="opacity 0.2s"
            bg="transparent"
          >
            <Tooltip
              label="Copy claim to clipboard"
              placement="top"
              hasArrow
              openDelay={500}
            >
              <IconButton
                aria-label="Copy claim to clipboard"
                icon={<FiCopy />}
                size="icon"
                variant="ghost-primary"
                onClick={e => {
                  e.stopPropagation();
                  handleCopyClaim();
                }}
              />
            </Tooltip>
            <Tooltip
              label="Delete claim"
              placement="top"
              hasArrow
              openDelay={500}
            >
              <IconButton
                aria-label="Delete claim"
                icon={<FiTrash2 />}
                size="icon"
                variant="ghost-danger"
                onClick={e => {
                  e.stopPropagation();
                  onDeleteClaim(claimId);
                }}
              />
            </Tooltip>
            <Tooltip
              label={`Add new claim depending on claim ${claimNumber}`}
              placement="top"
              hasArrow
              openDelay={500}
            >
              <IconButton
                aria-label="Insert claim"
                icon={<FiPlus />}
                size="icon"
                variant="ghost-primary"
                onClick={e => {
                  e.stopPropagation();
                  onInsertClaim(claimId);
                }}
              />
            </Tooltip>
          </HStack>
        </Box>
      </Box>
    );
  },
  (prev, next) =>
    prev.claimId === next.claimId &&
    prev.claimText === next.claimText &&
    prev.isDependentClaim === next.isDependentClaim &&
    prev.claimNumber === next.claimNumber
);

const ClaimsView: React.FC<ClaimsViewProps> = ({
  claims,
  claimViewMode,
  onClaimChange,
  onDeleteClaim,
  onInsertClaim,
  onReorderClaim,
  lastAddedClaimNumber,
}) => {
  // Dark mode colors
  const independentBg = useColorModeValue('blue.50', 'blue.900');
  const dependentBg = useColorModeValue('white', 'gray.800');
  const independentBorder = useColorModeValue('blue.200', 'blue.600');
  const dependentBorder = useColorModeValue('gray.200', 'gray.600');
  const independentBorderHover = useColorModeValue('blue.300', 'blue.500');
  const dependentBorderHover = useColorModeValue('gray.300', 'gray.500');
  const highlightBg = useColorModeValue('green.50', 'green.900');

  // Add container ref for scrolling to claims
  const claimsContainerRef = useRef<HTMLDivElement>(null);
  const highlightElementRef = useRef<Element | null>(null);
  const [shouldRemoveHighlight, setShouldRemoveHighlight] = useState(false);

  // Auto-remove highlight class using useTimeout
  useTimeout(
    () => {
      if (highlightElementRef.current) {
        highlightElementRef.current.classList.remove('highlight-new-claim');
        highlightElementRef.current = null;
      }
      setShouldRemoveHighlight(false);
    },
    shouldRemoveHighlight ? 2000 : null
  );

  // Sort claims by number for display
  const sortedClaims = useMemo(() => {
    if (!claims) return [];
    return [...claims].sort((a, b) => a.number - b.number);
  }, [claims]);

  // Create a wrapper function for onInsertClaim
  const handleInsertClaim = (claimId: string) => {
    onInsertClaim(claimId);
  };

  // Effect to scroll to the newly added claim when lastAddedClaimNumber changes
  useEffect(() => {
    if (lastAddedClaimNumber && claimsContainerRef.current) {
      // Find the claim element by a data attribute
      const claimElement = claimsContainerRef.current.querySelector(
        `[data-claim-number="${lastAddedClaimNumber}"]`
      );

      if (claimElement) {
        claimElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });

        // Add highlight effect and schedule removal
        claimElement.classList.add('highlight-new-claim');
        highlightElementRef.current = claimElement;
        setShouldRemoveHighlight(true);
      }
    }
  }, [lastAddedClaimNumber]);

  return (
    <Box ref={claimsContainerRef}>
      {claimViewMode === 'box' ? (
        <VStack spacing={4} align="stretch">
          {sortedClaims.map(claim => {
            const isDependentClaim = claim.text.toLowerCase().includes('claim');

            return (
              <Box
                key={claim.id}
                data-claim-number={claim.number}
                className={
                  claim.number.toString() === lastAddedClaimNumber
                    ? 'new-claim'
                    : ''
                }
                width="100%"
                bg={!isDependentClaim ? independentBg : dependentBg}
                borderRadius="md"
                borderWidth="1px"
                borderColor={
                  !isDependentClaim ? independentBorder : dependentBorder
                }
                _hover={{
                  borderColor: !isDependentClaim
                    ? independentBorderHover
                    : dependentBorderHover,
                  boxShadow: 'sm',
                }}
                sx={{
                  '&.new-claim': {
                    borderColor: 'green.300',
                    boxShadow: '0 0 0 2px rgba(72, 187, 120, 0.3)',
                  },
                  '&.highlight-new-claim': {
                    backgroundColor: highlightBg,
                    transition: 'background-color 0.5s ease-in-out',
                  },
                }}
                overflow="hidden"
              >
                <EditableClaim
                  claimId={claim.id}
                  claimNumber={claim.number.toString()}
                  claimText={claim.text}
                  isIndependent={!isDependentClaim}
                  onChange={onClaimChange}
                  onDelete={onDeleteClaim}
                  onInsertAfter={handleInsertClaim}
                  onReorder={onReorderClaim}
                />
              </Box>
            );
          })}
        </VStack>
      ) : (
        <Box>
          {sortedClaims.map(claim => {
            const isDependentClaim = claim.text.toLowerCase().includes('claim');

            return (
              <Box
                key={claim.id}
                data-claim-number={claim.number}
                className={
                  claim.number.toString() === lastAddedClaimNumber
                    ? 'new-claim'
                    : ''
                }
                sx={{
                  '&.new-claim': {
                    borderColor: 'green.300',
                    boxShadow: '0 0 0 2px rgba(72, 187, 120, 0.3)',
                  },
                  '&.highlight-new-claim': {
                    backgroundColor: highlightBg,
                    transition: 'background-color 0.5s ease-in-out',
                  },
                }}
              >
                <EditableListItem
                  claimId={claim.id}
                  claimNumber={claim.number.toString()}
                  claimText={claim.text}
                  isDependentClaim={isDependentClaim}
                  onClaimChange={onClaimChange}
                  onDeleteClaim={onDeleteClaim}
                  onInsertClaim={handleInsertClaim}
                />
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default React.memo(ClaimsView);

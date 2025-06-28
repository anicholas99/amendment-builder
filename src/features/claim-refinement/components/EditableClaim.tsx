import React, {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  KeyboardEvent,
  useCallback,
} from 'react';
import { logger } from '@/lib/monitoring/logger';
import {
  Box,
  Text,
  HStack,
  IconButton,
  Badge,
  Flex,
  Textarea,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
  useDisclosure,
  Button,
  Icon,
  Tooltip,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FiTrash2,
  FiPlus,
  FiMoreVertical,
  FiArrowUp,
  FiArrowDown,
  FiCopy,
} from 'react-icons/fi';
import {
  FaCheck,
  FaTimes,
  FaEdit,
  FaTrash,
  FaPlus,
  FaUndo,
  FaRedo,
} from 'react-icons/fa';
import { EditableClaimProps } from '../../../types/claimTypes';
import { InventionData } from '@/types/invention';
import { validateClaimText } from '../utils/validation';
import { apiFetch } from '@/lib/api/apiClient';
import { useGenerateDependentClaims } from '../hooks/usePriorArtOperations';
import { useClaimUndoRedo } from '../hooks/useClaimUndoRedo';

// Redefine props for the new normalized structure
export interface NormalizedEditableClaimProps {
  claimId: string;
  claimNumber: string;
  claimText: string;
  isIndependent: boolean;
  onChange: (claimId: string, text: string) => void;
  onDelete: (claimId: string) => void;
  onInsertAfter: (claimId: string) => void;
  onReorder: (claimId: string, direction: 'up' | 'down') => void;
  // analyzedInvention and setAnalyzedInvention are removed as they are no longer needed
  // for claim-specific operations. Generation logic will be handled by a separate hook/service.
}

// Simple inline menu component instead of lazy loading
const SimpleActionsMenu = ({
  onGenerate,
  isLoading,
}: {
  onGenerate: () => void;
  isLoading: boolean;
}) => {
  const iconColor = useColorModeValue('gray.600', 'gray.400');
  const iconHoverBg = useColorModeValue('gray.100', 'gray.700');
  const menuBg = useColorModeValue('white', 'gray.800');
  const menuBorderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Menu placement="bottom-end">
      <MenuButton
        as={IconButton}
        aria-label="Claim actions"
        icon={<FiMoreVertical />}
        variant="ghost"
        size="xs"
        color={iconColor}
        _hover={{ bg: iconHoverBg }}
      />
      <MenuList fontSize="sm" bg={menuBg} borderColor={menuBorderColor}>
        <MenuItem icon={<FiPlus />} onClick={onGenerate} isDisabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Dependent Claims'}
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

const EditableClaim: React.FC<NormalizedEditableClaimProps> = ({
  claimId,
  claimNumber,
  claimText,
  isIndependent,
  onChange,
  onDelete,
  onInsertAfter,
  onReorder,
}: NormalizedEditableClaimProps) => {
  const [currentText, setCurrentText] = useState<string>(claimText || '');
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingDependents, setIsGeneratingDependents] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toast = useToast();

  // React Query hook for dependent claims generation
  const generateClaimsMutation = useGenerateDependentClaims(
    data => {
      toast({ title: 'Dependent claims generated!', status: 'success' });
    },
    error => {
      toast({
        title: 'Error generating claims',
        description: error.message,
        status: 'error',
      });
    }
  );

  // Undo/Redo functionality
  const { canUndo, canRedo, undo, redo } = useClaimUndoRedo({
    claimId,
    currentText,
    onTextChange: text => {
      setCurrentText(text);
      setHasPendingChanges(false);
      setIsSaving(false);
    },
  });

  // Dark mode color values
  const iconColor = useColorModeValue('gray.600', 'gray.400');
  const iconHoverBg = useColorModeValue('gray.100', 'gray.700');
  const deleteIconColor = useColorModeValue('red.600', 'red.400');
  const deleteIconHoverBg = useColorModeValue('red.50', 'red.900');

  // Function to adjust textarea height
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  // Update currentText when claimText changes - but only if we don't have pending changes
  useEffect(() => {
    if (!hasPendingChanges && !isSaving) {
      setCurrentText(claimText || '');
      adjustTextareaHeight();
    }
  }, [claimText, adjustTextareaHeight, hasPendingChanges, isSaving]);

  // Sync pending state: when external prop matches local text, clear pending & saving
  useEffect(() => {
    if ((hasPendingChanges || isSaving) && claimText === currentText) {
      setHasPendingChanges(false);
      setIsSaving(false);

      // Force update of text ref in undo/redo hook
      if (claimText.trim() !== '') {
        logger.debug('[EditableClaim] Claim saved successfully, text synced', {
          claimId,
        });
      }
    }
  }, [claimText, currentText, hasPendingChanges, isSaving, claimId]);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentText(e.target.value);
    setHasPendingChanges(true);
  };

  const handleBlur = () => {
    if (currentText !== claimText && currentText.trim() !== '') {
      // Check if this is a temporary claim ID
      if (claimId.startsWith('temp-')) {
        logger.debug('[EditableClaim] Skipping update for temporary claim ID', {
          claimId,
        });
        // Revert to original text for temporary claims
        setCurrentText(claimText || '');
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

      const validation = validateClaimText(currentText);
      if (!validation.valid) {
        toast({
          title: 'Validation Error',
          description: validation.issues[0] || 'Invalid claim text',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setHasPendingChanges(false);
        return;
      }
      setIsSaving(true);
      onChange(claimId, currentText);
    } else {
      setHasPendingChanges(false);
    }
  };

  // Effect for height adjustment when text content changes
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

  const handleGenerateDependentClaims = async () => {
    // This function needs to be refactored as it depends on the old
    // analyzedInvention structure. For now, we'll disable it to unblock the main
    // editing flow. A new hook `useGenerateDependentClaims` will need to be
    // created that works with the new normalized data structure.
    toast({
      title: 'Feature Temporarily Disabled',
      description:
        'Dependent claim generation is being updated to work with the new data model.',
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
  };

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
    <Box p={4} width="100%" bg="transparent" data-claim-id={claimId}>
      <Flex justify="space-between" mb={2}>
        <Badge colorScheme={isIndependent ? 'blue' : 'gray'}>
          CLAIM {claimNumber} {isIndependent ? '(INDEPENDENT)' : ''}
        </Badge>

        <HStack spacing={1}>
          <Tooltip
            label={`Undo (${window.navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+Z)`}
            placement="top"
            hasArrow
            openDelay={500}
          >
            <IconButton
              aria-label="Undo last change"
              icon={<FaUndo />}
              size="xs"
              variant="ghost"
              color={iconColor}
              _hover={{ bg: iconHoverBg }}
              isDisabled={!canUndo || claimId.startsWith('temp-')}
              onClick={e => {
                e.stopPropagation();
                undo();
              }}
            />
          </Tooltip>
          <Tooltip
            label={`Redo (${window.navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+Y)`}
            placement="top"
            hasArrow
            openDelay={500}
          >
            <IconButton
              aria-label="Redo"
              icon={<FaRedo />}
              size="xs"
              variant="ghost"
              color={iconColor}
              _hover={{ bg: iconHoverBg }}
              isDisabled={!canRedo || claimId.startsWith('temp-')}
              onClick={e => {
                e.stopPropagation();
                redo();
              }}
            />
          </Tooltip>
          <Box width="1px" height="20px" bg="gray.300" mx={1} />
          <Tooltip
            label="Move claim up"
            placement="top"
            hasArrow
            openDelay={500}
          >
            <IconButton
              aria-label="Move claim up"
              icon={<FiArrowUp />}
              size="xs"
              variant="ghost"
              color={iconColor}
              _hover={{ bg: iconHoverBg }}
              onClick={e => {
                e.stopPropagation();
                onReorder(claimId, 'up');
              }}
            />
          </Tooltip>
          <Tooltip
            label="Move claim down"
            placement="top"
            hasArrow
            openDelay={500}
          >
            <IconButton
              aria-label="Move claim down"
              icon={<FiArrowDown />}
              size="xs"
              variant="ghost"
              color={iconColor}
              _hover={{ bg: iconHoverBg }}
              onClick={e => {
                e.stopPropagation();
                onReorder(claimId, 'down');
              }}
            />
          </Tooltip>
          <Tooltip
            label="Copy claim to clipboard"
            placement="top"
            hasArrow
            openDelay={500}
          >
            <IconButton
              aria-label="Copy claim to clipboard"
              icon={<FiCopy />}
              size="xs"
              variant="ghost"
              color={iconColor}
              _hover={{ bg: iconHoverBg }}
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
              size="xs"
              variant="ghost"
              color={deleteIconColor}
              _hover={{ bg: deleteIconHoverBg, color: deleteIconColor }}
              onClick={() => onDelete(claimId)}
            />
          </Tooltip>
          {isIndependent && (
            <SimpleActionsMenu
              onGenerate={handleGenerateDependentClaims}
              isLoading={
                isGeneratingDependents || generateClaimsMutation.isPending
              }
            />
          )}
        </HStack>
      </Flex>

      <Flex align="baseline">
        <Text as="span" fontWeight="bold" mr={2} flexShrink={0} mt="2px">
          {claimNumber}.{' '}
        </Text>
        <Box flex="1">
          <Textarea
            ref={textareaRef}
            value={currentText}
            onChange={handleTextChange}
            onBlur={handleBlur}
            variant="unstyled"
            size="md"
            pl={1}
            lineHeight="1.8"
            resize="none"
            minHeight="auto"
            rows={1}
            whiteSpace="pre-wrap"
            width="100%"
            className="hide-scrollbar"
            sx={{
              border: 'none',
              padding: '0',
              background: 'transparent',
              boxSizing: 'border-box',
              overflow: 'hidden !important',
              '&:focus': {
                boxShadow: 'none',
                outline: 'none',
              },
            }}
          />
        </Box>
      </Flex>

      <HStack mt={2} justify="flex-end" spacing={2}>
        <Tooltip
          label={`Add new claim depending on claim ${claimNumber}`}
          placement="top"
          hasArrow
          openDelay={500}
        >
          <IconButton
            aria-label="Insert claim"
            icon={<FiPlus />}
            size="xs"
            variant="ghost"
            color={iconColor}
            _hover={{ bg: iconHoverBg }}
            onClick={() => onInsertAfter(claimId)}
          />
        </Tooltip>
      </HStack>
    </Box>
  );
};

// Custom comparison to avoid unnecessary re-renders when unrelated props
// (like the large analyzedInvention object reference) change. We only re-render
// when the text or claim meta actually changes.
export default React.memo(
  EditableClaim,
  (prev, next) =>
    prev.claimId === next.claimId &&
    prev.claimText === next.claimText &&
    prev.isIndependent === next.isIndependent &&
    prev.claimNumber === next.claimNumber
);

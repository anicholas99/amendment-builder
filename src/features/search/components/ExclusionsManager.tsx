import React, { useState, useMemo, useCallback } from 'react';
import { logger } from '@/lib/monitoring/logger';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Box,
  Flex,
  IconButton,
  Spinner,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  Alert,
  AlertIcon,
  Divider,
  useToast,
  FormControl,
  FormLabel,
  Heading,
  List as ChakraList,
  ListItem,
  HStack,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import {
  FiX,
  FiTrash2,
  FiSearch,
  FiPlus,
  FiFile,
  FiCalendar,
  FiUser,
} from 'react-icons/fi';
import {
  usePatentExclusions,
  useAddPatentExclusion,
  useRemovePatentExclusion,
} from '@/hooks/api/usePatentExclusions';
import { ProjectExclusion } from '@/client/services/patent-exclusions.client-service';
import {
  modalStyles,
  modalButtonStyles,
} from '@/components/common/ModalStyles';
import { FixedSizeList as List } from 'react-window';

interface ExclusionsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onExclusionChange?: () => void;
}

// Memoized exclusion item component for better performance
const ExclusionItem = React.memo<{
  exclusion: ProjectExclusion;
  onRemove: (patentNumber: string) => void;
  dateTextColor: string;
}>(({ exclusion, onRemove, dateTextColor }) => (
  <ListItem p={3}>
    <Flex justifyContent="space-between" alignItems="flex-start">
      <VStack align="start" spacing={1} flex={1}>
        <HStack>
          <Badge colorScheme="red" mr={2}>
            EXCLUDED
          </Badge>
          <Text fontWeight="bold">{exclusion.patentNumber}</Text>
        </HStack>

        <HStack spacing={1} color={dateTextColor}>
          <FiCalendar size={14} />
          <Text fontSize="sm">
            Excluded on {new Date(exclusion.createdAt).toLocaleDateString()}
          </Text>
        </HStack>
      </VStack>

      <IconButton
        aria-label="Remove exclusion"
        icon={<Icon as={FiTrash2} color="red.500" />}
        size="sm"
        variant="ghost"
        colorScheme="red"
        onClick={() => onRemove(exclusion.patentNumber)}
        _hover={{
          color: 'red.600',
          bg: 'red.50',
        }}
      />
    </Flex>
  </ListItem>
));

ExclusionItem.displayName = 'ExclusionItem';

const ExclusionsManager: React.FC<ExclusionsManagerProps> = ({
  isOpen,
  onClose,
  projectId,
  onExclusionChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newExclusion, setNewExclusion] = useState('');
  const toast = useToast();

  // Move theme colors outside of component render
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const emptyStateBg = useColorModeValue('gray.50', 'gray.800');
  const mutedTextColor = useColorModeValue('gray.500', 'gray.400');
  const iconColor = useColorModeValue('gray.300', 'gray.600');
  const dateTextColor = useColorModeValue('gray.600', 'gray.400');

  // Use the new, centralized React Query hook for fetching exclusions
  const {
    data: exclusions = [],
    isLoading,
    error,
  } = usePatentExclusions(projectId, {
    enabled: isOpen && !!projectId,
  });

  const { mutateAsync: addExclusionMutation } = useAddPatentExclusion();
  const { mutateAsync: removeExclusionMutation } = useRemovePatentExclusion();

  // Memoize filtered exclusions to prevent unnecessary recalculations
  const filteredExclusions = useMemo(() => {
    if (!searchTerm) return exclusions;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return exclusions.filter(item =>
      item.patentNumber.toLowerCase().includes(lowerSearchTerm)
    );
  }, [exclusions, searchTerm]);

  // Memoize callbacks to prevent unnecessary re-renders
  const handleRemoveExclusion = useCallback(
    async (patentNumber: string) => {
      try {
        await removeExclusionMutation({ projectId, patentNumber });
        toast({
          title: 'Exclusion removed',
          description: `Patent ${patentNumber} can now appear in search results.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        if (onExclusionChange) onExclusionChange();
      } catch (err) {
        logger.error('Error removing exclusion:', err);
        toast({
          title: 'Error removing exclusion',
          description: 'There was an error removing the exclusion.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [removeExclusionMutation, projectId, toast, onExclusionChange]
  );

  const handleAddExclusion = useCallback(async () => {
    if (!newExclusion.trim()) return;

    try {
      await addExclusionMutation({
        projectId,
        patentNumbers: [newExclusion],
        metadata: { source: 'ExclusionManagerUI' },
      });

      setNewExclusion('');

      toast({
        title: 'Exclusion added',
        description: `Patent ${newExclusion} will be excluded from search results.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      if (onExclusionChange) onExclusionChange();
    } catch (err) {
      logger.error('Error adding exclusion:', err);
      toast({
        title: 'Error adding exclusion',
        description: 'There was an error adding the exclusion.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [addExclusionMutation, projectId, newExclusion, toast, onExclusionChange]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && newExclusion.trim()) {
        handleAddExclusion();
      }
    },
    [newExclusion, handleAddExclusion]
  );

  // Render function for virtual list items
  const renderExclusionRow = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const exclusion = filteredExclusions[index];
      return (
        <div style={style}>
          {index > 0 && <Divider />}
          <ExclusionItem
            exclusion={exclusion}
            onRemove={handleRemoveExclusion}
            dateTextColor={dateTextColor}
          />
        </div>
      );
    },
    [filteredExclusions, handleRemoveExclusion, dateTextColor]
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay {...modalStyles.overlay} />
      <ModalContent>
        <ModalHeader {...modalStyles.header} borderColor={borderColor}>
          Manage Patent Exclusions
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody {...modalStyles.body}>
          <FormControl mb={4}>
            <FormLabel>Add Patent Number to Exclude</FormLabel>
            <HStack>
              <Input
                value={newExclusion}
                onChange={e => setNewExclusion(e.target.value)}
                placeholder="e.g., US1234567B2"
                onKeyPress={handleKeyPress}
              />
              <Button
                leftIcon={<FiPlus />}
                {...modalButtonStyles.primary}
                onClick={handleAddExclusion}
                isDisabled={!newExclusion.trim()}
              >
                Add
              </Button>
            </HStack>
          </FormControl>

          {exclusions.length > 0 && (
            <FormControl mb={4}>
              <FormLabel>Search Exclusions</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FiSearch color={iconColor} />
                </InputLeftElement>
                <Input
                  placeholder="Search by patent number..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </FormControl>
          )}

          <Heading size="sm" mb={3}>
            Current Exclusions{' '}
            {exclusions.length > 0 && `(${exclusions.length})`}
          </Heading>

          {isLoading ? (
            <Box textAlign="center" py={4}>
              <Spinner />
              <Text mt={2}>Loading exclusions...</Text>
            </Box>
          ) : error ? (
            <Alert status="error" mb={4}>
              <AlertIcon />
              <Text>
                {error.message ||
                  'Failed to load exclusions. Please try again.'}
              </Text>
            </Alert>
          ) : filteredExclusions.length === 0 ? (
            <Box py={4} textAlign="center" bg={emptyStateBg} borderRadius="md">
              <Text color={mutedTextColor}>
                {searchTerm
                  ? 'No matching exclusions found.'
                  : 'No exclusions added yet.'}
              </Text>
            </Box>
          ) : (
            <Box
              maxHeight="300px"
              overflowY="auto"
              borderWidth="1px"
              borderRadius="md"
              borderColor={borderColor}
            >
              {/* Use virtual scrolling for large lists */}
              {filteredExclusions.length > 20 ? (
                <List
                  height={300}
                  itemCount={filteredExclusions.length}
                  itemSize={80} // Approximate height of each exclusion item
                  width="100%"
                >
                  {renderExclusionRow}
                </List>
              ) : (
                <ChakraList spacing={0}>
                  {filteredExclusions.map((exclusion, index) => (
                    <React.Fragment key={exclusion.patentNumber || index}>
                      {index > 0 && <Divider />}
                      <ExclusionItem
                        exclusion={exclusion}
                        onRemove={handleRemoveExclusion}
                        dateTextColor={dateTextColor}
                      />
                    </React.Fragment>
                  ))}
                </ChakraList>
              )}
            </Box>
          )}
        </ModalBody>
        <ModalFooter {...modalStyles.footer} borderColor={borderColor}>
          <Button onClick={onClose} {...modalButtonStyles.secondary}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ExclusionsManager;

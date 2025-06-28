import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  HStack,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  Divider,
  Textarea,
  useToast,
  IconButton,
  Input,
  Card,
  CardBody,
  Badge,
  Tooltip,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react';
import { logger } from '@/lib/monitoring/logger';
import {
  FiRefreshCw,
  FiTrash2,
  FiEdit2,
  FiPlus,
  FiInfo,
  FiChevronDown,
} from 'react-icons/fi';
import {
  modalStyles,
  modalButtonStyles,
} from '@/components/common/ModalStyles';

// Simplified ParsedElement interface without type categorization
interface ParsedElement {
  text: string;
}

interface EditParsedClaimDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  parsedElements: ParsedElement[] | string[];
  searchQueries: string[];
  onSave: (data: {
    elements: ParsedElement[];
    queries: string[];
  }) => Promise<void>;
  onSaveAndResync: (data: {
    elements: ParsedElement[];
    queries: string[];
  }) => Promise<void>;
  onResyncElementsOnly?: () => Promise<void>;
  onResyncQueriesOnly?: (elements: ParsedElement[]) => Promise<void>;
}

export const EditParsedClaimDataModal: React.FC<
  EditParsedClaimDataModalProps
> = ({
  isOpen,
  onClose,
  parsedElements,
  searchQueries,
  onSave,
  onSaveAndResync,
  onResyncElementsOnly,
  onResyncQueriesOnly,
}) => {
  const [editedQueries, setEditedQueries] = useState<string[]>([]);
  const [editedElements, setEditedElements] = useState<ParsedElement[]>([]);
  const [editingElementIndex, setEditingElementIndex] = useState<number | null>(
    null
  );
  const [isAddingElement, setIsAddingElement] = useState(false);
  const [newElementText, setNewElementText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  // Theme colors
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.700');
  const addCardBg = useColorModeValue('blue.50', 'blue.900');
  const addCardBorder = useColorModeValue('blue.300', 'blue.600');

  // Convert string elements to ParsedElement objects if needed
  const convertToParsedElements = (
    elements: ParsedElement[] | string[]
  ): ParsedElement[] => {
    return elements.map(element => {
      if (typeof element === 'string') {
        return { text: element };
      }
      return element;
    });
  };

  useEffect(() => {
    if (isOpen) {
      setEditedQueries(searchQueries || []);
      setEditedElements(convertToParsedElements(parsedElements || []));
    }
  }, [isOpen, searchQueries, parsedElements]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        elements: editedElements.filter(el => el.text.trim()),
        queries: editedQueries.filter(q => q.trim()),
      });
      toast({
        title: 'Changes saved',
        description:
          'Elements and queries have been saved. Your next search will use these updated values.',
        status: 'success',
        duration: 4000,
      });
      onClose();
    } catch (error) {
      logger.error('Save failed in EditParsedClaimDataModal', { error });
      toast({
        title: 'Save failed',
        description:
          'Failed to save changes. Please check your connection and try again.',
        status: 'error',
        duration: 6000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResync = async () => {
    setIsSaving(true);
    try {
      await onSaveAndResync({
        elements: editedElements.filter(el => el.text.trim()),
        queries: editedQueries.filter(q => q.trim()),
      });
      toast({
        title: 'Saved & Resyncing',
        description:
          'Your changes have been saved and a resync is in progress.',
        status: 'success',
        duration: 4000,
      });
      onClose();
    } catch (error) {
      logger.error('Save and resync failed in EditParsedClaimDataModal', { error });
      toast({
        title: 'Operation failed',
        description: 'Could not save and resync. Please try again.',
        status: 'error',
        duration: 6000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResyncElementsOnly = async () => {
    if (!onResyncElementsOnly) return;

    setIsSaving(true);
    try {
      // First save the current queries
      await onSave({
        elements: editedElements.filter(el => el.text.trim()),
        queries: editedQueries.filter(q => q.trim()),
      });

      // Then resync elements
      await onResyncElementsOnly();

      toast({
        title: 'Elements Resynced',
        description:
          'Elements have been regenerated from claim text. Your custom queries are preserved.',
        status: 'success',
        duration: 4000,
      });
      onClose();
    } catch (error) {
      logger.error('Resync elements failed in EditParsedClaimDataModal', { error });
      toast({
        title: 'Resync failed',
        description: 'Could not resync elements. Please try again.',
        status: 'error',
        duration: 6000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResyncQueriesOnly = async () => {
    if (!onResyncQueriesOnly) return;

    setIsSaving(true);
    try {
      // Save current elements first
      await onSave({
        elements: editedElements.filter(el => el.text.trim()),
        queries: editedQueries.filter(q => q.trim()),
      });

      // Then regenerate queries from the edited elements
      await onResyncQueriesOnly(editedElements.filter(el => el.text.trim()));

      toast({
        title: 'Queries Regenerated',
        description: 'Search queries have been regenerated from your elements.',
        status: 'success',
        duration: 4000,
      });
      onClose();
    } catch (error) {
      logger.error('Resync queries failed in EditParsedClaimDataModal', { error });
      toast({
        title: 'Resync failed',
        description: 'Could not regenerate queries. Please try again.',
        status: 'error',
        duration: 6000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteElement = (index: number) => {
    const newElements = editedElements.filter((_, i) => i !== index);
    setEditedElements(newElements);
  };

  const handleEditElement = (index: number, value: string) => {
    const newElements = [...editedElements];
    newElements[index] = { text: value };
    setEditedElements(newElements);
  };

  const handleAddElement = () => {
    if (newElementText.trim()) {
      setEditedElements([...editedElements, { text: newElementText.trim() }]);
      setNewElementText('');
      setIsAddingElement(false);
    }
  };

  // Render the elements section
  const renderElementsSection = () => (
    <Box>
      <HStack justify="space-between" mb={3}>
        <HStack>
          <Text fontWeight="bold" fontSize="lg">
            Parsed Elements
          </Text>
          <Badge colorScheme="blue">{editedElements.length}</Badge>
        </HStack>
        <Button
          size="sm"
          leftIcon={<FiPlus />}
          onClick={() => setIsAddingElement(true)}
          colorScheme="blue"
          variant="ghost"
        >
          Add Element
        </Button>
      </HStack>

      <VStack align="stretch" spacing={3}>
        {editedElements.map((element, index) => (
          <Card key={index} variant="outline" bg={cardBg}>
            <CardBody py={2}>
              {editingElementIndex === index ? (
                <VStack align="stretch" spacing={2}>
                  <Input
                    value={element.text}
                    onChange={e => handleEditElement(index, e.target.value)}
                    placeholder="Enter element text"
                    size="md"
                  />
                  <HStack>
                    <Button
                      size="sm"
                      onClick={() => setEditingElementIndex(null)}
                      colorScheme="blue"
                    >
                      Done
                    </Button>
                  </HStack>
                </VStack>
              ) : (
                <HStack justify="space-between" align="center">
                  <Text fontSize="md">{element.text}</Text>
                  <HStack>
                    <IconButton
                      aria-label="Edit element"
                      icon={<FiEdit2 />}
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingElementIndex(index)}
                    />
                    <IconButton
                      aria-label="Delete element"
                      icon={<FiTrash2 />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDeleteElement(index)}
                    />
                  </HStack>
                </HStack>
              )}
            </CardBody>
          </Card>
        ))}

        {isAddingElement && (
          <Card
            variant="outline"
            borderStyle="dashed"
            borderColor={addCardBorder}
            bg={addCardBg}
          >
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <Input
                  placeholder="Enter element text"
                  value={newElementText}
                  onChange={e => setNewElementText(e.target.value)}
                  size="md"
                />
                <HStack>
                  <Button
                    colorScheme="blue"
                    onClick={handleAddElement}
                    isDisabled={!newElementText.trim()}
                    size="sm"
                  >
                    Add
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsAddingElement(false);
                      setNewElementText('');
                    }}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );

  // Render the queries section
  const renderQueriesSection = () => (
    <Box>
      <HStack justify="space-between" mb={3}>
        <HStack>
          <Text fontWeight="bold" fontSize="lg">
            Search Queries
          </Text>
          <Badge colorScheme="green">{editedQueries.length}</Badge>
          <Tooltip label="These queries are used to find relevant prior art. Each query approaches the search from a different angle.">
            <IconButton
              aria-label="Query info"
              icon={<FiInfo />}
              size="sm"
              variant="ghost"
            />
          </Tooltip>
        </HStack>
        <Button
          size="sm"
          leftIcon={<FiPlus />}
          onClick={() => setEditedQueries([...editedQueries, ''])}
          colorScheme="green"
          variant="ghost"
        >
          Add Query
        </Button>
      </HStack>

      <VStack align="stretch" spacing={4}>
        {editedQueries.map((query, index) => (
          <Card key={index} variant="outline" bg={cardBg}>
            <CardBody py={3}>
              <VStack align="stretch" spacing={2}>
                <HStack justify="space-between">
                  <Badge colorScheme="green">Query {index + 1}</Badge>
                  <IconButton
                    aria-label="Delete query"
                    icon={<FiTrash2 />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => {
                      setEditedQueries(
                        editedQueries.filter((_, i) => i !== index)
                      );
                    }}
                  />
                </HStack>
                <Textarea
                  value={query}
                  onChange={e => {
                    const newQueries = [...editedQueries];
                    newQueries[index] = e.target.value;
                    setEditedQueries(newQueries);
                  }}
                  minH="80px"
                  resize="vertical"
                  fontSize="md"
                  placeholder="Enter search query text..."
                />
              </VStack>
            </CardBody>
          </Card>
        ))}
      </VStack>
    </Box>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay {...modalStyles.overlay} />
      <ModalContent maxH="85vh">
        <ModalHeader {...modalStyles.header} borderColor={borderColor}>
          <Text>Edit Parsed Claim Data</Text>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody {...modalStyles.body}>
          <Tabs variant="enclosed" colorScheme="blue" isLazy>
            <TabList>
              <Tab>
                <HStack spacing={2}>
                  <Text>Elements</Text>
                  <Badge colorScheme="blue" variant="solid">
                    {editedElements.length}
                  </Badge>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Text>Search Queries</Text>
                  <Badge colorScheme="green" variant="solid">
                    {editedQueries.length}
                  </Badge>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0}>{renderElementsSection()}</TabPanel>
              <TabPanel px={0}>{renderQueriesSection()}</TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter {...modalStyles.footer} borderColor={borderColor}>
          <HStack spacing={3}>
            <Button onClick={onClose} {...modalButtonStyles.secondary}>
              Cancel
            </Button>
            <Menu>
              <MenuButton
                as={Button}
                leftIcon={<FiRefreshCw />}
                rightIcon={<FiChevronDown />}
                colorScheme="blue"
                variant="outline"
                isLoading={isSaving}
              >
                Resync Options
              </MenuButton>
              <MenuList>
                <MenuItem onClick={handleResync} icon={<FiRefreshCw />}>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="medium">Full Resync</Text>
                    <Text fontSize="xs" color="text.secondary">
                      Regenerate both elements & queries from claim
                    </Text>
                  </VStack>
                </MenuItem>
                <MenuDivider />
                <MenuItem
                  onClick={handleResyncElementsOnly}
                  icon={<FiRefreshCw />}
                  isDisabled={!onResyncElementsOnly}
                >
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="medium">Resync Elements Only</Text>
                    <Text fontSize="xs" color="text.secondary">
                      Re-parse claim, keep your queries
                    </Text>
                  </VStack>
                </MenuItem>
                <MenuItem
                  onClick={handleResyncQueriesOnly}
                  icon={<FiRefreshCw />}
                  isDisabled={!onResyncQueriesOnly}
                >
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="medium">Resync Queries Only</Text>
                    <Text fontSize="xs" color="text.secondary">
                      Regenerate queries from current elements
                    </Text>
                  </VStack>
                </MenuItem>
              </MenuList>
            </Menu>
            <Button
              {...modalButtonStyles.primary}
              onClick={handleSave}
              isLoading={isSaving}
              loadingText="Saving..."
            >
              Save Changes
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

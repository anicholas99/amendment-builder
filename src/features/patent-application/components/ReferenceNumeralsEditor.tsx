import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  IconButton,
  Icon,
  HStack,
  Flex,
  Switch,
  FormControl,
  FormLabel,
  Badge,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiTrash2, FiCheck, FiPlus, FiX, FiCopy, FiPlusCircle } from 'react-icons/fi';
import { InventionData } from '@/types/invention';
import {
  usePatentElements,
  UsePatentSidebarProps,
} from '../hooks/usePatentSidebar';
import { useOptimisticElements } from '../hooks/useOptimisticElements';
import { useFigureMetadata } from '../hooks/useFigureMetadata';
import { useElementEditingState } from '../hooks/useElementEditingState';
import { useAddFigureElement } from '@/hooks/api/useFigureElements';
import { useProjectElements } from '@/hooks/api/useProjectElements';

/**
 * Component for editing reference numerals with add, edit, and delete functionality.
 * Uses modular hooks to separate concerns and maintain clean architecture.
 */
const ReferenceNumeralsEditor: React.FC<UsePatentSidebarProps> = ({
  projectId,
  inventionData,
  currentFigure,
  setCurrentFigure,
}) => {
  const toast = useToast();
  const [showAllElements, setShowAllElements] = useState(false);

  // Use existing hook for data fetching
  const {
    analyzedInvention,
    elements: dbElements,
    figures,
    onUpdate,
    isUpdating,
    isLoading,
  } = usePatentElements({
    projectId,
    inventionData,
    currentFigure,
    setCurrentFigure,
  });

  // Fetch ALL project elements (including those not in figures)
  const { data: allProjectElements = [] } = useProjectElements(projectId);

  // Figure metadata management
  const { allFiguresData, currentFigureId, setCurrentFigureId, getFigureId } =
    useFigureMetadata(projectId);

  // Update current figure ID when current figure changes
  useEffect(() => {
    if (currentFigure && allFiguresData.length > 0) {
      const figureId = getFigureId(currentFigure);
      setCurrentFigureId(figureId);
    }
  }, [currentFigure, allFiguresData, getFigureId, setCurrentFigureId]);

  // Optimistic updates management
  const { elements, addElement, removeElement, updateElement, isMutating } =
    useOptimisticElements({
      projectId,
      currentFigureId,
      dbElements,
    });

  // UI state management
  const editingState = useElementEditingState();

  // For copying elements from other figures
  const addElementMutation = useAddFigureElement(projectId, currentFigureId);

  // Use design-system semantic tokens for consistent theming
  const borderColor = 'border.primary';
  const cardBg = 'bg.card';
  const theadBg = 'bg.card';

  // Theme-aware colors for trash icons
  const trashIconColor = useColorModeValue('gray.500', 'gray.400');
  const trashIconHoverColor = useColorModeValue('red.500', 'red.400');

  // Helper to get all elements from all figures and unassigned elements
  const getAllElements = (): Array<{
    number: string;
    description: string;
    figureKey: string;
    figureId: string;
  }> => {
    if (!showAllElements) {
      return [];
    }

    const allElements: Array<{
      number: string;
      description: string;
      figureKey: string;
      figureId: string;
    }> = [];

    // First, add elements from figures
    if (figures && allFiguresData.length) {
      Object.entries(figures).forEach(([figureKey, figureData]) => {
        if (
          figureData &&
          typeof figureData === 'object' &&
          'elements' in figureData
        ) {
          const elements = figureData.elements;
          if (
            elements &&
            typeof elements === 'object' &&
            !Array.isArray(elements)
          ) {
            const figureInfo = allFiguresData.find(
              f => f.figureKey === figureKey
            );
            if (figureInfo) {
              Object.entries(elements).forEach(([num, desc]) => {
                allElements.push({
                  number: String(num),
                  description: String(desc || ''),
                  figureKey,
                  figureId: figureInfo.id,
                });
              });
            }
          }
        }
      });
    }

    // Then, add elements that aren't in any figure
    const elementsInFigures = new Set(allElements.map(el => el.number));
    allProjectElements.forEach(element => {
      if (!elementsInFigures.has(element.elementKey)) {
        allElements.push({
          number: element.elementKey,
          description: element.elementName,
          figureKey: 'None',
          figureId: '',
        });
      }
    });

    return allElements.sort((a, b) => {
      // Try to parse as numbers first
      const aNum = parseInt(a.number);
      const bNum = parseInt(b.number);
      
      // If both are valid numbers, sort numerically
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      
      // Otherwise, sort alphabetically
      return a.number.localeCompare(b.number);
    });
  };

  const displayElements = showAllElements
    ? getAllElements()
    : Object.entries(elements).map(([number, description]) => ({
        number,
        description,
        figureKey: currentFigure || '',
        figureId: currentFigureId || '',
      }));

  // Handlers
  const handleAddElement = async () => {
    if (
      !editingState.newElementDesc.trim() ||
      !editingState.newElementNum.trim() ||
      !currentFigureId
    )
      return;

    const elementDesc = editingState.newElementDesc.trim();
    const elementNum = editingState.newElementNum.trim();

    editingState.clearNewElementFields();

    try {
      await addElement(elementNum, elementDesc);
    } catch (error) {
      // Restore inputs on error
      editingState.setNewElementFields(elementDesc, elementNum);
    }
  };

  const handleDeleteElement = (number: string) => {
    if (showAllElements || !currentFigure) return;
    editingState.setElementToDelete(number);
  };

  const handleConfirmDelete = async () => {
    if (!editingState.elementToDelete || !currentFigureId) return;

    const deletedElement = editingState.elementToDelete;
    editingState.setElementToDelete(null);

    try {
      await removeElement(deletedElement);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleCancelDelete = () => {
    editingState.setElementToDelete(null);
  };

  const handleStartEdit = (number: string, description: string) => {
    if (showAllElements) return;
    editingState.startEdit(number, description);
  };

  const handleSaveEdit = async () => {
    if (!editingState.editingElement || !currentFigureId) return;

    const currentDesc = elements[editingState.editingElement] || '';
    if (
      editingState.editedDesc === currentDesc &&
      editingState.editedNum === editingState.editingElement
    ) {
      editingState.cancelEdit();
      return;
    }

    const savedElement = editingState.editingElement;
    const savedDesc = editingState.editedDesc;

    editingState.cancelEdit();

    try {
      await updateElement(savedElement, savedDesc);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleCopyElement = async (number: string, description: string) => {
    if (!currentFigureId) return;

    try {
      await addElement(number, description);
    } catch (error) {
      // Error already handled by the hook
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Box
        mt={4}
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="200px"
      >
        <Text>Loading reference numerals...</Text>
      </Box>
    );
  }

  // No figure selected
  if (!currentFigure && !showAllElements) {
    return (
      <Box
        mt={4}
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="200px"
      >
        <Text color="text.secondary">
          Select a figure to view reference numerals
        </Text>
      </Box>
    );
  }

  return (
    <Box
      mt={2}
      display="flex"
      flexDirection="column"
      minH={0}
      h="full"
      flex="1"
    >
      <Flex justify="space-between" align="center" mb={2}>
        <Text
          fontSize="md"
          fontWeight="bold"
          flexShrink={0}
          color="text.primary"
        >
          Reference Numerals
        </Text>
        <FormControl display="flex" alignItems="center" width="auto">
          <FormLabel htmlFor="show-all" mb="0" fontSize="sm" mr={2}>
            Show all
          </FormLabel>
          <Switch
            id="show-all"
            size="sm"
            isChecked={showAllElements}
            onChange={e => setShowAllElements(e.target.checked)}
          />
        </FormControl>
      </Flex>

      <Box
        borderWidth={1}
        borderRadius="md"
        borderColor={borderColor}
        bg={cardBg}
        flex="1"
        minH={0}
        display="flex"
        flexDirection="column"
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          overflowY="auto"
          className="custom-scrollbar"
        >
          <Table
            size="sm"
            variant="simple"
            sx={{
              'tr:last-child td': {
                border: 'none',
              },
              tableLayout: 'fixed',
              width: '100%',
            }}
          >
            <Thead bg={theadBg} position="sticky" top={0} zIndex={1}>
              <Tr>
                <Th
                  py={1.5}
                  px={2}
                  width={showAllElements ? '50%' : '60%'}
                  color="text.primary"
                  borderColor="border.primary"
                >
                  Description
                </Th>
                <Th
                  width="20%"
                  textAlign="right"
                  py={1.5}
                  px={2}
                  color="text.primary"
                  borderColor="border.primary"
                >
                  Number
                </Th>
                {showAllElements && (
                  <Th
                    width="15%"
                    py={1.5}
                    px={2}
                    color="text.primary"
                    borderColor="border.primary"
                  >
                    Figure
                  </Th>
                )}
                <Th
                  width={showAllElements ? '15%' : '20%'}
                  py={1.5}
                  px={1}
                  borderColor="border.primary"
                ></Th>
              </Tr>
            </Thead>
            <Tbody>
              {displayElements.length > 0 ? (
                displayElements
                  .sort((a, b) => parseInt(a.number) - parseInt(b.number))
                  .map(({ number, description, figureKey, figureId }) => (
                    <Tr key={`${figureKey}-${number}`}>
                      <Td py={1} px={2} borderColor="border.light">
                        {editingState.editingElement === number &&
                        !showAllElements ? (
                          <Input
                            value={editingState.editedDesc}
                            onChange={e =>
                              editingState.updateEditFields(e.target.value)
                            }
                            size="sm"
                            autoFocus
                            variant="unstyled"
                            color="text.primary"
                            onBlur={handleSaveEdit}
                            onKeyDown={e => {
                              if (e.key === 'Escape') {
                                e.preventDefault();
                                editingState.cancelEdit();
                              }
                            }}
                            onKeyPress={e => {
                              if (e.key === 'Enter') {
                                handleSaveEdit();
                              }
                            }}
                          />
                        ) : (
                          <Text
                            cursor={showAllElements ? 'default' : 'pointer'}
                            onClick={() =>
                              !showAllElements &&
                              handleStartEdit(number, description)
                            }
                            fontSize="sm"
                            color="text.primary"
                            _hover={
                              showAllElements ? {} : { color: 'text.secondary' }
                            }
                          >
                            {description}
                          </Text>
                        )}
                      </Td>
                      <Td
                        textAlign="right"
                        py={1}
                        px={2}
                        borderColor="border.light"
                      >
                        {editingState.editingElement === number &&
                        !showAllElements ? (
                          <Input
                            value={editingState.editedNum}
                            onChange={e =>
                              editingState.updateEditFields(
                                undefined,
                                e.target.value
                              )
                            }
                            size="sm"
                            width="60px"
                            textAlign="right"
                            variant="unstyled"
                            color="text.primary"
                            onBlur={handleSaveEdit}
                            onKeyDown={e => {
                              if (e.key === 'Escape') {
                                e.preventDefault();
                                editingState.cancelEdit();
                              }
                            }}
                            onKeyPress={e => {
                              if (e.key === 'Enter') {
                                handleSaveEdit();
                              }
                            }}
                          />
                        ) : (
                          <Text
                            cursor={showAllElements ? 'default' : 'pointer'}
                            onClick={() =>
                              !showAllElements &&
                              handleStartEdit(number, description)
                            }
                            fontSize="sm"
                            color="text.primary"
                            _hover={
                              showAllElements ? {} : { color: 'text.secondary' }
                            }
                          >
                            {number}
                          </Text>
                        )}
                      </Td>
                      {showAllElements && (
                        <Td py={1} px={2} borderColor="border.light">
                          <Badge size="sm" colorScheme="blue">
                            {figureKey}
                          </Badge>
                        </Td>
                      )}
                      <Td py={1} px={1} borderColor="border.light">
                        <HStack spacing={1} justifyContent="flex-end">
                          {showAllElements ? (
                            figureId !== currentFigureId &&
                            currentFigureId && (
                              <IconButton
                                aria-label={
                                  figureKey === 'None'
                                    ? 'Assign to current figure'
                                    : 'Copy to current figure'
                                }
                                icon={
                                  <Icon as={figureKey === 'None' ? FiPlusCircle : FiCopy} />
                                }
                                size="xs"
                                variant="ghost"
                                onClick={() =>
                                  handleCopyElement(number, description)
                                }
                                title={
                                  figureKey === 'None'
                                    ? `Assign to ${currentFigure}`
                                    : `Copy to ${currentFigure}`
                                }
                                isDisabled={isMutating}
                              />
                            )
                          ) : editingState.elementToDelete === number ? (
                            <>
                              <IconButton
                                aria-label="Confirm delete"
                                icon={<Icon as={FiCheck} />}
                                size="xs"
                                colorScheme="red"
                                onClick={handleConfirmDelete}
                                isDisabled={isMutating}
                              />
                              <IconButton
                                aria-label="Cancel delete"
                                icon={<Icon as={FiX} />}
                                size="xs"
                                variant="ghost"
                                onClick={handleCancelDelete}
                                isDisabled={isMutating}
                              />
                            </>
                          ) : (
                            <IconButton
                              aria-label="Delete"
                              icon={<Icon as={FiTrash2} />}
                              size="xs"
                              variant="ghost"
                              onClick={() => handleDeleteElement(number)}
                              isDisabled={isMutating}
                              color={trashIconColor}
                              _hover={{ color: trashIconHoverColor }}
                              transition="color 0.15s ease-out"
                            />
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))
              ) : (
                <Tr>
                  <Td colSpan={showAllElements ? 4 : 3} textAlign="center">
                    {showAllElements
                      ? 'No reference numerals in any figures'
                      : 'No reference numerals defined'}
                  </Td>
                </Tr>
              )}
              {!showAllElements && currentFigure && (
                <Tr>
                  <Td py={1} px={2} borderColor="border.light">
                    <Input
                      placeholder="Add new element description..."
                      size="sm"
                      variant="unstyled"
                      value={editingState.newElementDesc}
                      onChange={e =>
                        editingState.setNewElementFields(
                          e.target.value,
                          editingState.newElementNum
                        )
                      }
                      color="text.primary"
                      _placeholder={{ color: 'text.tertiary' }}
                      onKeyPress={e => {
                        if (
                          e.key === 'Enter' &&
                          editingState.newElementDesc.trim() &&
                          editingState.newElementNum.trim()
                        ) {
                          handleAddElement();
                        }
                      }}
                      isDisabled={isMutating}
                    />
                  </Td>
                  <Td
                    textAlign="right"
                    py={1}
                    px={2}
                    borderColor="border.light"
                  >
                    <Input
                      placeholder="#"
                      size="sm"
                      width="60px"
                      textAlign="right"
                      variant="unstyled"
                      value={editingState.newElementNum}
                      onChange={e =>
                        editingState.setNewElementFields(
                          editingState.newElementDesc,
                          e.target.value
                        )
                      }
                      color="text.primary"
                      _placeholder={{ color: 'text.tertiary' }}
                      onKeyPress={e => {
                        if (
                          e.key === 'Enter' &&
                          editingState.newElementDesc.trim() &&
                          editingState.newElementNum.trim()
                        ) {
                          handleAddElement();
                        }
                      }}
                      isDisabled={isMutating}
                    />
                  </Td>
                  <Td py={1} px={1} borderColor="border.light">
                    <IconButton
                      aria-label="Add element"
                      icon={<Icon as={FiPlus} />}
                      size="xs"
                      variant="solid"
                      colorScheme="blue"
                      onClick={handleAddElement}
                      isDisabled={
                        !editingState.newElementDesc.trim() ||
                        !editingState.newElementNum.trim() ||
                        isMutating
                      }
                    />
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
};

export default ReferenceNumeralsEditor;

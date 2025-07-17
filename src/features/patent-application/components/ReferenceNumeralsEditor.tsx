import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/useToastWrapper';
import {
  FiTrash2,
  FiCheck,
  FiPlus,
  FiX,
  FiCopy,
  FiPlusCircle,
  FiSearch,
} from 'react-icons/fi';
import { InventionData } from '@/types/invention';
import {
  usePatentElements,
  UsePatentSidebarProps,
} from '../hooks/usePatentSidebar';
import { useOptimisticElements } from '../hooks/useOptimisticElements';
import { useFigureMetadata } from '../hooks/useFigureMetadata';
import { useElementEditingState } from '../hooks/useElementEditingState';
import { useProjectElements } from '@/hooks/api/useProjectElements';
import CustomEditable from '@/components/common/CustomEditable';
import { usePatentEditor } from '@/contexts/PatentEditorContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Define the combined props type
type ReferenceNumeralsEditorProps = UsePatentSidebarProps & {
  onSearchReferenceNumeral?: (numeralId: string) => void;
};

/**
 * Component for editing reference numerals with add, edit, and delete functionality.
 * Uses modular hooks to separate concerns and maintain clean architecture.
 */
const ReferenceNumeralsEditor: React.FC<ReferenceNumeralsEditorProps> = ({
  projectId,
  inventionData,
  currentFigure,
  setCurrentFigure,
  onSearchReferenceNumeral,
}) => {
  const toast = useToast();
  const [showAllElements, setShowAllElements] = useState(false);
  // Track which elements are being assigned
  const [pendingAssignments, setPendingAssignments] = useState<Set<string>>(
    new Set()
  );

  // Get editor instance for search functionality
  const { editor } = usePatentEditor();

  // Memoize props to prevent infinite re-renders
  const elementsProps = React.useMemo(() => ({
    projectId,
    inventionData,
    currentFigure,
    setCurrentFigure,
  }), [projectId, inventionData, currentFigure, setCurrentFigure]);

  // Use existing hook for data fetching
  const {
    analyzedInvention,
    elements: dbElements,
    figures,
    onUpdate,
    isUpdating,
    isLoading,
  } = usePatentElements(elementsProps);

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
      currentFigureKey: currentFigure,
      dbElements,
    });

  // UI state management
  const editingState = useElementEditingState();

  // For copying elements from other figures - use the existing addElement function
  const handleElementCopy = async (number: string, description: string) => {
    setPendingAssignments(prev => new Set(prev).add(number));
    try {
      await addElement(number, description);
      toast({
        title: 'Reference numeral copied',
        description: `Reference numeral ${number} copied to ${currentFigure}`,
        status: 'success',
        duration: 2000,
        position: 'bottom-right',
      });
    } catch (error) {
      // Error is already handled by the optimistic hook
    } finally {
      setPendingAssignments(prev => {
        const newSet = new Set(prev);
        newSet.delete(number);
        return newSet;
      });
    }
  };

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

  const handleCopyElement = async (
    number: string,
    description: string,
    figureKey: string
  ) => {
    if (!currentFigureId) return;

    // Add to pending assignments immediately for instant feedback
    setPendingAssignments(prev => new Set(prev).add(number));

    try {
      await addElement(number, description);
    } catch (error) {
      // Error already handled by the hook
    } finally {
      // Remove from pending assignments after operation completes
      setPendingAssignments(prev => {
        const newSet = new Set(prev);
        newSet.delete(number);
        return newSet;
      });
    }
  };

  // Check if an element is already in the current figure or pending assignment
  const isElementInCurrentFigure = (elementNumber: string): boolean => {
    return !!elements[elementNumber] || pendingAssignments.has(elementNumber);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="mt-2 flex flex-col min-h-0 h-full flex-1">
        <div className="border border-border rounded-lg bg-card flex-1 min-h-0 flex flex-col relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 right-0 bottom-0 overflow-y-auto custom-scrollbar">
            <table className="w-full text-xs border-collapse table-fixed">
              <thead className="bg-muted sticky top-0 z-[1] border-b border-border">
                <tr>
                  <th className="py-1.5 px-2 w-[60%] text-xs text-left font-semibold text-foreground border-r border-border">
                    Description
                  </th>
                  <th className="w-[20%] text-center py-1.5 px-2 text-xs font-semibold text-foreground border-r border-border">
                    Number
                  </th>
                  <th className="w-[20%] py-1.5 px-1 text-center">
                    <div className="flex items-center justify-center">
                      <label
                        htmlFor="show-all"
                        className="text-xs mr-1 text-muted-foreground font-medium"
                      >
                        All
                      </label>
                      <Switch id="show-all" disabled checked={false} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    colSpan={3}
                    className="py-6 border-b border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // No figure selected
  if (!currentFigure && !showAllElements) {
    return (
      <div className="mt-4 flex items-center justify-center min-h-[200px]">
        <span className="text-muted-foreground">
          Select a figure to view reference numerals
        </span>
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-col min-h-0 h-full flex-1">
      <div className="border border-border rounded-lg bg-card flex-1 min-h-0 flex flex-col relative overflow-hidden shadow-sm">
        <div className="absolute top-0 left-0 right-0 bottom-0 overflow-y-auto custom-scrollbar">
          <table className="w-full text-xs border-collapse table-fixed">
            <thead className="bg-accent sticky top-0 z-[1] border-b border-border">
              <tr>
                <th
                  className={cn(
                    'py-1.5 px-2 text-left font-semibold text-foreground text-xs border-r border-border',
                    showAllElements ? 'w-[50%]' : 'w-[60%]'
                  )}
                >
                  Description
                </th>
                <th className="w-[20%] text-center py-1.5 px-2 text-foreground text-xs font-semibold border-r border-border">
                  Number
                </th>
                {showAllElements && (
                  <th className="w-[15%] py-1.5 px-2 text-foreground text-xs font-semibold border-r border-border">
                    Figure
                  </th>
                )}
                <th
                  className={cn(
                    'py-1.5 px-1 text-center',
                    showAllElements ? 'w-[15%]' : 'w-[20%]'
                  )}
                >
                  <div className="flex items-center justify-center">
                    <label
                      htmlFor="show-all"
                      className="text-xs mr-1 text-muted-foreground font-medium"
                    >
                      All
                    </label>
                    <Switch
                      id="show-all"
                      size="sm"
                      checked={showAllElements}
                      onCheckedChange={(checked: boolean) =>
                        setShowAllElements(checked)
                      }
                    />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {displayElements.length > 0
                ? displayElements
                    .sort((a, b) => parseInt(a.number) - parseInt(b.number))
                    .map(({ number, description, figureKey, figureId }) => {
                      const isPending = pendingAssignments.has(number);
                      return (
                        <tr
                          key={`${figureKey}-${number}`}
                          className={cn(
                            'transition-all duration-200 border-b border-gray-100 dark:border-gray-700',
                            showAllElements &&
                              'hover:bg-gray-50 dark:hover:bg-gray-800',
                            isPending && 'bg-blue-50 dark:bg-blue-900'
                          )}
                        >
                          <td className="py-1 px-2 border-r border-border">
                            {showAllElements ? (
                              <span
                                className="text-xs text-foreground block overflow-hidden text-ellipsis whitespace-nowrap"
                                title={description}
                              >
                                {description}
                              </span>
                            ) : (
                              <CustomEditable
                                value={description}
                                onChange={newValue => {
                                  updateElement(number, newValue);
                                }}
                                placeholder="Enter description..."
                                fontSize="xs"
                                isReadOnly={false}
                                padding="0"
                                lineHeight={1.2}
                                staticBorder={false}
                              />
                            )}
                          </td>
                          <td className="text-center py-1 px-2 border-r border-border">
                            {showAllElements ? (
                              <span className="text-xs text-foreground font-medium">
                                {number}
                              </span>
                            ) : (
                              <div className="flex justify-center">
                                <CustomEditable
                                  value={number}
                                  onChange={async newValue => {
                                    // Don't allow empty numbers
                                    if (!newValue.trim()) {
                                      toast({
                                        title: 'Invalid number',
                                        description:
                                          'Reference numeral number cannot be empty',
                                        status: 'error',
                                        duration: 3000,
                                      });
                                      return;
                                    }

                                    // Don't do anything if the number hasn't changed
                                    if (newValue === number) {
                                      return;
                                    }

                                    // Check if the new number already exists
                                    if (elements[newValue]) {
                                      toast({
                                        title: 'Number already exists',
                                        description: `Reference numeral ${newValue} already exists in this figure`,
                                        status: 'error',
                                        duration: 3000,
                                      });
                                      return;
                                    }

                                    try {
                                      // To update a number, we need to remove the old element and add a new one
                                      await removeElement(number);
                                      await addElement(newValue, description);

                                      toast({
                                        title: 'Number updated',
                                        description: `Reference numeral changed from ${number} to ${newValue}`,
                                        status: 'success',
                                        duration: 2000,
                                        position: 'bottom-right',
                                      });
                                    } catch (error) {
                                      toast({
                                        title: 'Failed to update number',
                                        description: 'Please try again',
                                        status: 'error',
                                        duration: 3000,
                                      });
                                    }
                                  }}
                                  placeholder="#"
                                  fontSize="xs"
                                  isReadOnly={false}
                                  padding="0"
                                  lineHeight={1.2}
                                  staticBorder={false}
                                  className="text-center min-w-[40px]"
                                />
                              </div>
                            )}
                          </td>
                          {showAllElements && (
                            <td className="py-1 px-2 text-center border-r border-border">
                              <Badge
                                variant="secondary"
                                className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              >
                                {figureKey}
                              </Badge>
                            </td>
                          )}
                          <td className="py-1 px-1.5">
                            <div className="flex items-center justify-end space-x-0">
                              {/* Search button */}
                              {onSearchReferenceNumeral && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        aria-label="Search in document"
                                        onClick={() =>
                                          onSearchReferenceNumeral(number)
                                        }
                                        className="w-6 h-6 p-0 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                      >
                                        <FiSearch className="w-3 h-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Search for "{number}" in document</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}

                              {showAllElements ? (
                                <>
                                  {/* Only show button if element is not in current figure and not pending */}
                                  {figureId !== currentFigureId &&
                                    currentFigureId &&
                                    !isElementInCurrentFigure(number) &&
                                    (isPending ? (
                                      // Show spinner while assignment is in progress
                                      <div className="p-1">
                                        <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-500"></div>
                                      </div>
                                    ) : (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        aria-label={
                                          figureKey === 'None'
                                            ? 'Assign to current figure'
                                            : 'Copy to current figure'
                                        }
                                        onClick={() =>
                                          handleCopyElement(
                                            number,
                                            description,
                                            figureKey
                                          )
                                        }
                                        title={
                                          figureKey === 'None'
                                            ? `Assign to ${currentFigure}`
                                            : `Copy to ${currentFigure}`
                                        }
                                        disabled={isMutating}
                                        className="w-6 h-6 p-0 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                      >
                                        {figureKey === 'None' ? (
                                          <FiPlusCircle className="w-3 h-3" />
                                        ) : (
                                          <FiCopy className="w-3 h-3" />
                                        )}
                                      </Button>
                                    ))}
                                  {/* Show checkmark if element is already in current figure */}
                                  {isElementInCurrentFigure(number) &&
                                    figureId !== currentFigureId && (
                                      <div className="p-1">
                                        <FiCheck
                                          className="w-3 h-3 text-green-500"
                                          title="Already in current figure"
                                        />
                                      </div>
                                    )}
                                </>
                              ) : editingState.elementToDelete === number ? (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    aria-label="Confirm delete"
                                    onClick={handleConfirmDelete}
                                    disabled={isMutating}
                                    className="w-6 h-6 p-0 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                  >
                                    <FiCheck className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    aria-label="Cancel delete"
                                    onClick={handleCancelDelete}
                                    disabled={isMutating}
                                    className="w-6 h-6 p-0"
                                  >
                                    <FiX className="w-3 h-3" />
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  aria-label="Delete"
                                  onClick={() => handleDeleteElement(number)}
                                  disabled={isMutating}
                                  className="w-6 h-6 p-0 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 transition-colors duration-150"
                                >
                                  <FiTrash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                : null}
              {!showAllElements && currentFigure && (
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-1 px-2 border-r border-border">
                    <CustomEditable
                      value={editingState.newElementDesc}
                      onChange={value =>
                        editingState.setNewElementFields(
                          value,
                          editingState.newElementNum
                        )
                      }
                      placeholder="Add new element description..."
                      fontSize="xs"
                      isReadOnly={false}
                      padding="0"
                      lineHeight={1.2}
                      staticBorder={false}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (
                          e.key === 'Enter' &&
                          editingState.newElementDesc.trim() &&
                          editingState.newElementNum.trim()
                        ) {
                          e.preventDefault();
                          handleAddElement();
                        }
                      }}
                    />
                  </td>
                  <td className="text-center py-1 px-2 border-r border-border">
                    <div className="flex justify-center">
                      <CustomEditable
                        value={editingState.newElementNum}
                        onChange={value =>
                          editingState.setNewElementFields(
                            editingState.newElementDesc,
                            value
                          )
                        }
                        placeholder="#"
                        fontSize="xs"
                        isReadOnly={false}
                        padding="0"
                        lineHeight={1.2}
                        staticBorder={false}
                        className="text-center min-w-[40px]"
                        onKeyDown={(e: React.KeyboardEvent) => {
                          if (
                            e.key === 'Enter' &&
                            editingState.newElementDesc.trim() &&
                            editingState.newElementNum.trim()
                          ) {
                            e.preventDefault();
                            handleAddElement();
                          }
                        }}
                      />
                    </div>
                  </td>
                  <td className="py-1 px-1.5">
                    <div className="flex justify-end">
                      <Button
                        variant="default"
                        size="sm"
                        aria-label="Add element"
                        onClick={handleAddElement}
                        disabled={
                          !editingState.newElementDesc.trim() ||
                          !editingState.newElementNum.trim() ||
                          isMutating
                        }
                        className="w-6 h-6 p-0"
                      >
                        <FiPlus className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReferenceNumeralsEditor;

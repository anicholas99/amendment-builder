import { useState, useMemo } from 'react';
import { useFigureUpload } from './useFigureUpload';
import { useFigureDelete } from './useFigureDelete';
import { useFigureCreate } from './useFigureCreate';
import { useFigureRename } from './useFigureRename';
import type { FiguresWithIds } from '@/hooks/api/useFigures';

interface FigureFileHandlersOptions {
  figures: FiguresWithIds;
  onUpdate: (figures: FiguresWithIds) => void | Promise<void>;
  onFigureChange?: (figureNumber: string) => void;
  currentIndex: number;
  figureKeys: string[];
  setCurrentIndex: (index: number) => void;
  closeModal?: () => void;
  onOpenAddFigureDialog?: (
    options: {
      label: string;
      value: string;
      isVariant: boolean;
      baseNumber: number;
      variant: string;
    }[]
  ) => void;
  projectId?: string;
}

/**
 * Main orchestrator hook for figure file operations
 * Combines upload, delete, create, and rename functionality
 */
export const useFigureFileHandlers = ({
  figures,
  onUpdate,
  onFigureChange,
  currentIndex,
  figureKeys,
  setCurrentIndex,
  closeModal,
  onOpenAddFigureDialog,
  projectId,
}: FigureFileHandlersOptions) => {
  const [isReplaceMode, setIsReplaceMode] = useState(false);

  // Get current figure information
  const figureNum = figureKeys[currentIndex] || 'FIG. 1';
  const figure = (figureKeys.length > 0 && figures[figureNum]) || {
    description: '',
    type: 'image',
  };

  // Use the focused hooks
  const uploadHandlers = useFigureUpload({
    projectId,
    figures,
    figureKeys,
    currentIndex,
  });

  const deleteHandlers = useFigureDelete({
    projectId,
    figures,
    figureKeys,
    currentIndex,
    onUpdate,
    setCurrentIndex,
    onFigureChange,
    closeModal,
  });

  const createHandlers = useFigureCreate({
    projectId,
    figures,
    figureKeys,
    currentIndex,
    onUpdate,
    setCurrentIndex,
    onFigureChange,
    onOpenAddFigureDialog,
  });

  const renameHandlers = useFigureRename({
    projectId,
    figures,
    figureKeys,
    currentIndex,
    onUpdate,
    setCurrentIndex,
    onFigureChange,
  });

  // Enhanced replace handler that includes isReplaceMode state management
  const handleReplaceImage = useMemo(() => {
    return async (event: React.ChangeEvent<HTMLInputElement>) => {
      try {
        await uploadHandlers.handleReplaceImage(event);
      } finally {
        setIsReplaceMode(false);
      }
    };
  }, [uploadHandlers, setIsReplaceMode]);

  // Return all handlers and state
  return {
    // Upload functionality
    fileInputRef: uploadHandlers.fileInputRef,
    handleFileInput: uploadHandlers.handleFileInput,
    handleReplaceImage,
    handleDroppedFile: uploadHandlers.handleDroppedFile,
    validateImageFile: uploadHandlers.validateImageFile,

    // Delete functionality
    handleDeleteFigure: deleteHandlers.handleDeleteFigure,

    // Create functionality
    handleAddNewFigure: createHandlers.handleAddNewFigure,
    createNewFigure: createHandlers.createNewFigure,
    generateFigureOptions: createHandlers.generateFigureOptions,

    // Rename functionality
    handleRenameFigure: renameHandlers.handleRenameFigure,
    validateFigureNumber: renameHandlers.validateFigureNumber,

    // State
    isReplaceMode,
    setIsReplaceMode,

    // Current figure info
    figureNum,
    figure,
  };
};

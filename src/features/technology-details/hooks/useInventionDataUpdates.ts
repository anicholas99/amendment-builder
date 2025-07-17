import React, { useCallback, useRef } from 'react';
import { InventionData } from '@/types';
import { logger } from '@/utils/clientLogger';
import { isRecord } from '@/types/safe-type-helpers';
import { useDebouncedCallback } from '@/hooks/useDebounce';

interface InventionDataUpdatesOptions {
  addToHistory?: (description: string) => void;
  isUndoRedoOperation?: boolean;
}

/**
 * Custom hook to handle updating invention data in the TechnologyDetailsView
 */
export const useInventionDataUpdates = (
  setAnalyzedInvention: React.Dispatch<
    React.SetStateAction<InventionData | null>
  >,
  options: InventionDataUpdatesOptions = {}
) => {
  const { addToHistory, isUndoRedoOperation = false } = options;

  // Debounced update function
  const [debouncedUpdate] = useDebouncedCallback((updateFn: () => void) => {
    updateFn();
  }, 300); // 300ms debounce delay

  // Function to update any property in the invention data
  const handleUpdateInventionData = useCallback(
    (key: string, value: unknown) => {
      logger.debug('[InventionDataUpdates] Updating invention data', {
        key,
        value,
      });

      debouncedUpdate(() => {
        // Add to history if tracking is enabled and we're not in undo/redo
        if (addToHistory && !isUndoRedoOperation) {
          addToHistory(`Updated ${key}`);
        }

        setAnalyzedInvention(prev => {
          if (!prev) return prev;

          return {
            ...prev,
            [key]: value,
          };
        });
      });
    },
    [setAnalyzedInvention, addToHistory, isUndoRedoOperation, debouncedUpdate]
  );

  // Functions to update nested properties in the invention data
  const handleUpdateBackgroundField = useCallback(
    (field: string, value: unknown) => {
      debouncedUpdate(() => {
        // Add to history if tracking is enabled and we're not in undo/redo
        if (addToHistory && !isUndoRedoOperation) {
          addToHistory(`Updated background ${field}`);
        }

        setAnalyzedInvention(prev => {
          if (!prev) return prev;

          // Pattern: Dynamic property access → use type guard and type narrowing
          const currentBackground = isRecord(prev.background)
            ? prev.background
            : {};

          // Create updated background object
          const updatedBackground = {
            ...currentBackground,
            [field]: value,
          };

          // Return updated invention with new background
          return {
            ...prev,
            background: updatedBackground,
          };
        });
      });
    },
    [setAnalyzedInvention, addToHistory, isUndoRedoOperation, debouncedUpdate]
  );

  const handleUpdateTechnicalImplementationField = useCallback(
    (field: string, value: unknown) => {
      debouncedUpdate(() => {
        // Add to history if tracking is enabled and we're not in undo/redo
        if (addToHistory && !isUndoRedoOperation) {
          addToHistory(`Updated technical implementation ${field}`);
        }

        setAnalyzedInvention(prev => {
          if (!prev) return prev;

          // Pattern: Dynamic property access → use type guard and type narrowing
          const currentTechImpl = isRecord(prev.technical_implementation)
            ? prev.technical_implementation
            : {};

          // Create updated technical implementation object
          const updatedTechImpl = {
            ...currentTechImpl,
            [field]: value,
          };

          // Return updated invention with new technical implementation
          return {
            ...prev,
            technical_implementation: updatedTechImpl,
          };
        });
      });
    },
    [setAnalyzedInvention, addToHistory, isUndoRedoOperation, debouncedUpdate]
  );

  return {
    handleUpdateInventionData,
    handleUpdateBackgroundField,
    handleUpdateTechnicalImplementationField,
  };
};

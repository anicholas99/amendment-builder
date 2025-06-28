import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import {
  useAddFigureElement,
  useRemoveFigureElement,
  useUpdateFigureElementCallout,
} from '@/hooks/api/useFigureElements';
import { useUpdateElementName } from '@/hooks/api/useFiguresNormalized';

interface UseOptimisticElementsProps {
  projectId: string | null | undefined;
  currentFigureId: string | null;
  dbElements: Record<string, unknown> | undefined;
}

/**
 * Hook for managing optimistic updates of figure elements
 * Handles local state updates immediately while syncing with the database
 */
export function useOptimisticElements({
  projectId,
  currentFigureId,
  dbElements,
}: UseOptimisticElementsProps) {
  const toast = useToast();

  // Local state for optimistic updates
  const [localElements, setLocalElements] = useState<Record<string, string>>(
    {}
  );
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  // Database mutation hooks
  const addElementMutation = useAddFigureElement(projectId, currentFigureId);
  const removeElementMutation = useRemoveFigureElement(
    projectId,
    currentFigureId
  );
  const updateCalloutMutation = useUpdateFigureElementCallout(
    projectId,
    currentFigureId
  );
  const updateElementNameMutation = useUpdateElementName();

  // Sync database elements to local state when they change
  useEffect(() => {
    if (!hasLocalChanges && dbElements) {
      const typedElements: Record<string, string> = {};

      if (typeof dbElements === 'object' && !Array.isArray(dbElements)) {
        Object.entries(dbElements).forEach(([key, value]) => {
          typedElements[key] = String(value || '');
        });
      }

      const currentElementsStr = JSON.stringify(localElements);
      const newElementsStr = JSON.stringify(typedElements);

      if (currentElementsStr !== newElementsStr) {
        setLocalElements(typedElements);
      }
    }
  }, [dbElements, hasLocalChanges]);

  // Reset local changes flag when figure changes
  useEffect(() => {
    setHasLocalChanges(false);
  }, [currentFigureId]);

  const addElement = useCallback(
    async (elementNum: string, elementDesc: string) => {
      if (!currentFigureId) return;

      // Optimistic update
      const updatedElements = {
        ...localElements,
        [elementNum]: elementDesc,
      };
      setLocalElements(updatedElements);
      setHasLocalChanges(true);

      try {
        await addElementMutation.mutateAsync({
          elementKey: elementNum,
          elementName: elementDesc,
          calloutDescription: elementDesc,
        });

        toast({
          title: 'Element added',
          status: 'success',
          duration: 2000,
          position: 'bottom-right',
        });
      } catch (error) {
        // Revert optimistic update
        setLocalElements(localElements);

        toast({
          title: 'Failed to add element',
          status: 'error',
          duration: 3000,
          position: 'bottom-right',
        });

        throw error;
      }
    },
    [currentFigureId, localElements, addElementMutation, toast]
  );

  const removeElement = useCallback(
    async (elementNum: string) => {
      if (!currentFigureId) return;

      const originalElements = { ...localElements };
      // Optimistic update
      const updatedElements = { ...localElements };
      delete updatedElements[elementNum];
      setLocalElements(updatedElements);
      setHasLocalChanges(true);

      try {
        await removeElementMutation.mutateAsync(elementNum);

        toast({
          title: 'Element removed',
          status: 'success',
          duration: 2000,
          position: 'bottom-right',
        });
      } catch (error) {
        // Revert optimistic update
        setLocalElements(originalElements);

        toast({
          title: 'Failed to remove element',
          status: 'error',
          duration: 3000,
          position: 'bottom-right',
        });

        throw error;
      }
    },
    [currentFigureId, localElements, removeElementMutation, toast]
  );

  const updateElement = useCallback(
    async (elementNum: string, newDesc: string) => {
      if (!currentFigureId || !projectId) return;

      const originalElements = { ...localElements };
      // Optimistic update
      const updatedElements = {
        ...localElements,
        [elementNum]: newDesc,
      };
      setLocalElements(updatedElements);
      setHasLocalChanges(true);

      try {
        await updateElementNameMutation.mutateAsync({
          projectId,
          elementKey: elementNum,
          name: newDesc,
        });
      } catch (error) {
        // Revert optimistic update
        setLocalElements(originalElements);

        toast({
          title: 'Failed to update element',
          status: 'error',
          duration: 3000,
          position: 'bottom-right',
        });

        throw error;
      }
    },
    [
      currentFigureId,
      projectId,
      localElements,
      updateElementNameMutation,
      toast,
    ]
  );

  const isMutating =
    addElementMutation.isPending ||
    removeElementMutation.isPending ||
    updateCalloutMutation.isPending ||
    updateElementNameMutation.isPending;

  // Determine what elements to display
  const displayElements =
    !hasLocalChanges && Object.keys(localElements).length === 0 && dbElements
      ? (dbElements as Record<string, string>)
      : localElements;

  return {
    elements: displayElements,
    addElement,
    removeElement,
    updateElement,
    isMutating,
  };
}

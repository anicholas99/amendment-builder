import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/useToastWrapper';
import { 
  useOptimisticAddElement, 
  useOptimisticUpdateElement, 
  useOptimisticRemoveElement 
} from '@/hooks/api/useOptimisticFigureElements';

interface UseOptimisticElementsOptions {
  projectId: string | null | undefined;
  currentFigureId: string | null | undefined;
  currentFigureKey: string;
  dbElements: Record<string, unknown>;
}

interface UseOptimisticElementsReturn {
  elements: Record<string, string>;
  addElement: (number: string, description: string) => Promise<void>;
  removeElement: (number: string) => Promise<void>;
  updateElement: (number: string, description: string) => Promise<void>;
  isMutating: boolean;
}

/**
 * Hook that uses the proper React Query optimistic update system
 * This replaces the local state management with React Query cache updates
 */
export function useOptimisticElements({
  projectId,
  currentFigureId,
  currentFigureKey,
  dbElements,
}: UseOptimisticElementsOptions): UseOptimisticElementsReturn {
  const toast = useToast();
  
  // Convert dbElements to the format the component expects
  const elements = useMemo(() => {
    const converted: Record<string, string> = {};
    if (dbElements) {
      Object.entries(dbElements).forEach(([key, value]) => {
        converted[key] = String(value || '');
      });
    }
    return converted;
  }, [dbElements]);

  // Use the existing optimistic hooks that work with React Query
  const addElementMutation = useOptimisticAddElement(
    projectId, 
    currentFigureId, 
    currentFigureKey
  );
  
  const updateElementMutation = useOptimisticUpdateElement(
    projectId, 
    currentFigureKey
  );
  
  const removeElementMutation = useOptimisticRemoveElement(
    projectId, 
    currentFigureId, 
    currentFigureKey
  );

  const addElement = useCallback(async (number: string, description: string) => {
    if (!projectId || !currentFigureId) {
      toast({
        title: 'Cannot add element',
        description: 'Missing project or figure information',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      await addElementMutation.mutateAsync({
        projectId,
        figureId: currentFigureId,
        figureKey: currentFigureKey,
        elementKey: number,
        elementName: description,
      });
      
      toast({
        title: 'Reference numeral added',
        description: `Reference numeral ${number} added to ${currentFigureKey}`,
        status: 'success',
        duration: 2000,
        position: 'bottom-right',
      });
    } catch (error) {
      toast({
        title: 'Failed to add reference numeral',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
      });
    }
  }, [addElementMutation, projectId, currentFigureId, currentFigureKey, toast]);

  const updateElement = useCallback(async (number: string, description: string) => {
    try {
      await updateElementMutation.mutateAsync({
        elementKey: number,
        name: description,
      });
      
      toast({
        title: 'Reference numeral updated',
        description: `Reference numeral ${number} updated`,
        status: 'success',
        duration: 2000,
        position: 'bottom-right',
      });
    } catch (error) {
      toast({
        title: 'Failed to update reference numeral',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
      });
    }
  }, [updateElementMutation, toast]);

  const removeElement = useCallback(async (number: string) => {
    try {
      await removeElementMutation.mutateAsync(number);
      
      toast({
        title: 'Reference numeral deleted',
        description: `Reference numeral ${number} deleted`,
        status: 'success',
        duration: 2000,
        position: 'bottom-right',
      });
    } catch (error) {
      toast({
        title: 'Failed to delete reference numeral',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
      });
    }
  }, [removeElementMutation, toast]);

  const isMutating = addElementMutation.isPending || updateElementMutation.isPending || removeElementMutation.isPending;

  return {
    elements,
    addElement,
    removeElement,
    updateElement,
    isMutating,
  };
} 
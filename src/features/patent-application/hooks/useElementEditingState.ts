import { useState, useCallback } from 'react';

interface EditingState {
  elementToDelete: string | null;
  editingElement: string | null;
  editedDesc: string;
  editedNum: string;
  newElementDesc: string;
  newElementNum: string;
}

/**
 * Hook for managing the UI state of element editing operations
 * Handles form inputs, edit mode, and delete confirmations
 */
export function useElementEditingState() {
  const [state, setState] = useState<EditingState>({
    elementToDelete: null,
    editingElement: null,
    editedDesc: '',
    editedNum: '',
    newElementDesc: '',
    newElementNum: '',
  });

  const setNewElementFields = useCallback((desc: string, num: string) => {
    setState(prev => ({
      ...prev,
      newElementDesc: desc,
      newElementNum: num,
    }));
  }, []);

  const clearNewElementFields = useCallback(() => {
    setState(prev => ({
      ...prev,
      newElementDesc: '',
      newElementNum: '',
    }));
  }, []);

  const startEdit = useCallback((number: string, description: string) => {
    setState(prev => ({
      ...prev,
      editingElement: number,
      editedDesc: description,
      editedNum: number,
    }));
  }, []);

  const cancelEdit = useCallback(() => {
    setState(prev => ({
      ...prev,
      editingElement: null,
      editedDesc: '',
      editedNum: '',
    }));
  }, []);

  const updateEditFields = useCallback((desc?: string, num?: string) => {
    setState(prev => ({
      ...prev,
      ...(desc !== undefined && { editedDesc: desc }),
      ...(num !== undefined && { editedNum: num }),
    }));
  }, []);

  const setElementToDelete = useCallback((elementNum: string | null) => {
    setState(prev => ({
      ...prev,
      elementToDelete: elementNum,
    }));
  }, []);

  return {
    // State values
    ...state,

    // Actions
    setNewElementFields,
    clearNewElementFields,
    startEdit,
    cancelEdit,
    updateEditFields,
    setElementToDelete,
  };
}

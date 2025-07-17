import { useState, useCallback } from 'react';
import { DataChangeType } from '../utils/patent-sections/sectionDependencies';

interface SectionSyncState {
  isOpen: boolean;
  changeTypes: DataChangeType[];
}

/**
 * Hook to manage patent section synchronization
 * Tracks what data has changed and triggers the sync dialog
 */
export function useSectionSync() {
  const [syncState, setSyncState] = useState<SectionSyncState>({
    isOpen: false,
    changeTypes: [],
  });

  const triggerSync = useCallback((changeTypes: DataChangeType[]) => {
    setSyncState({
      isOpen: true,
      changeTypes,
    });
  }, []);

  const closeSync = useCallback(() => {
    setSyncState({
      isOpen: false,
      changeTypes: [],
    });
  }, []);

  // Helper functions for common scenarios
  const syncAfterFigureChange = useCallback(() => {
    triggerSync(['figures']);
  }, [triggerSync]);

  const syncAfterInventionUpdate = useCallback(() => {
    triggerSync(['invention_details']);
  }, [triggerSync]);

  const syncAfterClaimsUpdate = useCallback(() => {
    triggerSync(['claims']);
  }, [triggerSync]);

  const syncAfterPriorArtUpdate = useCallback(() => {
    triggerSync(['prior_art']);
  }, [triggerSync]);

  const syncAfterMultipleChanges = useCallback(
    (types: DataChangeType[]) => {
      triggerSync(types);
    },
    [triggerSync]
  );

  return {
    // State
    isOpen: syncState.isOpen,
    changeTypes: syncState.changeTypes,

    // Actions
    triggerSync,
    closeSync,

    // Convenience methods
    syncAfterFigureChange,
    syncAfterInventionUpdate,
    syncAfterClaimsUpdate,
    syncAfterPriorArtUpdate,
    syncAfterMultipleChanges,
  };
}

import { useState, useCallback } from 'react';
import { ProcessedCitationMatch } from '@/types/domain/citation';
import { logger } from '@/lib/monitoring/logger';

/**
 * Hook for managing citation table UI state following established patterns
 * Similar to useUIStateManagement but focused on table-specific state
 */
export const useCitationTableState = (
  onSaveCitationMatch?: (match: ProcessedCitationMatch) => Promise<void>
) => {
  // Column visibility states
  const [showLocationColumn, setShowLocationColumn] = useState(false);
  
  // Security: Only allow actions column if user has permission to save citations
  const canShowActions = Boolean(onSaveCitationMatch);
  
  // Show actions column by default if user has save permission
  const [showActionsColumn, setShowActionsColumn] = useState(true);

  /**
   * Toggle location column visibility
   */
  const toggleLocationColumn = useCallback(() => {
    setShowLocationColumn(prev => !prev);
  }, []);

  /**
   * Toggle actions column visibility with security check
   */
  const toggleActionsColumn = useCallback(() => {
    if (!canShowActions) {
      logger.warn('Actions column access denied: no save permission');
      return;
    }
    setShowActionsColumn(prev => !prev);
  }, [canShowActions]);

  /**
   * Reset all column visibility to defaults
   */
  const resetColumnVisibility = useCallback(() => {
    setShowLocationColumn(false);
    setShowActionsColumn(false);
  }, []);

  return {
    // Column visibility state
    showLocationColumn,
    showActionsColumn: showActionsColumn && canShowActions, // Enforce security

    // Actions
    toggleLocationColumn,
    toggleActionsColumn,
    resetColumnVisibility,

    // Security info
    canShowActions,
  };
};

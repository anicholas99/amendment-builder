import { useState, useEffect } from 'react';
import { logger } from '@/utils/clientLogger';

interface UseSaveStatusIndicatorProps {
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

export const useSaveStatusIndicator = ({
  isSaving,
  hasUnsavedChanges,
}: UseSaveStatusIndicatorProps) => {
  const [showSaved, setShowSaved] = useState(false);
  const [prevIsSaving, setPrevIsSaving] = useState(false);

  // Debug logging
  useEffect(() => {
    logger.debug('[SaveStatusIndicator] State update', {
      isSaving,
      hasUnsavedChanges,
      showSaved,
      prevIsSaving,
    });
  }, [isSaving, hasUnsavedChanges, showSaved, prevIsSaving]);

  // Show "Saved" message briefly after save completes
  useEffect(() => {
    if (prevIsSaving && !isSaving && !hasUnsavedChanges) {
      logger.debug('[SaveStatusIndicator] Showing saved message');
      setShowSaved(true);
      const timer = setTimeout(() => {
        logger.debug('[SaveStatusIndicator] Hiding saved message');
        setShowSaved(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
    setPrevIsSaving(isSaving);
  }, [isSaving, hasUnsavedChanges, prevIsSaving]);

  return {
    showSaved,
    shouldShowIndicator: isSaving || hasUnsavedChanges || showSaved,
  };
};

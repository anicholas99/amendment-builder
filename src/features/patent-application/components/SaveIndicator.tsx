import React, { useState, useEffect } from 'react';
import { FiCheck } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface SaveIndicatorProps {
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

export const SaveIndicator: React.FC<SaveIndicatorProps> = ({
  isSaving,
  hasUnsavedChanges,
}) => {
  const [showSaved, setShowSaved] = useState(false);
  const [prevIsSaving, setPrevIsSaving] = useState(false);

  // Show "Saved" message briefly after save completes
  useEffect(() => {
    if (prevIsSaving && !isSaving && !hasUnsavedChanges) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
    setPrevIsSaving(isSaving);
  }, [isSaving, hasUnsavedChanges, prevIsSaving]);

  // Don't show anything if idle
  if (!isSaving && !hasUnsavedChanges && !showSaved) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[1000] pointer-events-none">
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-1.5 rounded-full shadow-sm transition-opacity duration-200',
          'bg-white/95 dark:bg-gray-900/95',
          isSaving || hasUnsavedChanges || showSaved
            ? 'opacity-100'
            : 'opacity-0'
        )}
      >
        {isSaving ? (
          <>
            <div
              className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"
              style={{
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
            <span className="text-sm text-muted-foreground">Saving...</span>
          </>
        ) : showSaved ? (
          <>
            <FiCheck className="w-3 h-3 text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400">
              Saved
            </span>
          </>
        ) : hasUnsavedChanges ? (
          <>
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-sm text-muted-foreground">Unsaved</span>
          </>
        ) : null}
      </div>
    </div>
  );
};

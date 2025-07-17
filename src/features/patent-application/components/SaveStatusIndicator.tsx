import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SaveStatusIndicatorProps {
  isSaving: boolean;
  showSaved: boolean;
  hasUnsavedChanges: boolean;
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  isSaving,
  showSaved,
  hasUnsavedChanges,
}) => {
  return (
    <AnimatePresence mode="wait">
      {/* Saving state - just a subtle dot */}
      {isSaving && (
        <motion.div
          key="saving"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-1.5">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div
                className={cn(
                  'w-[5px] h-[5px] rounded-full bg-gray-400 dark:bg-gray-500'
                )}
              />
            </motion.div>
            <span className={cn('text-[11px] text-muted-foreground')}>
              Saving
            </span>
          </div>
        </motion.div>
      )}

      {/* Saved state - brief checkmark */}
      {showSaved && !hasUnsavedChanges && (
        <motion.div
          key="saved"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <span className={cn('text-[11px] text-gray-400 dark:text-gray-500')}>
            ✓ Saved
          </span>
        </motion.div>
      )}

      {/* Unsaved state - just a dot, no text */}
      {hasUnsavedChanges && !isSaving && (
        <motion.div
          key="unsaved"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className={cn(
              'w-[5px] h-[5px] rounded-full bg-gray-400 dark:bg-gray-500'
            )}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

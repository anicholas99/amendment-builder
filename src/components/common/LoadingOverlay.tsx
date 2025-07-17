/**
 * Loading Overlay Component
 *
 * Professional loading overlay component to display during project switching or tenant switching
 * Implemented using React best practices and shadcn/ui components
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

/**
 * Professional loading overlay component to display during project switching or tenant switching
 * Implemented using React best practices and shadcn/ui components
 */
interface LoadingOverlayProps {
  isSwitchingTenant?: boolean;
  title?: string;
  subtitle?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isSwitchingTenant = false,
  title,
  subtitle,
}) => {
  // Set appropriate messages based on props or defaults
  const titleText =
    title ?? (isSwitchingTenant ? 'Switching Tenant' : 'Loading Project');
  const subtitleText =
    subtitle ??
    (isSwitchingTenant
      ? 'Redirecting to the selected tenant...'
      : 'Preparing your patent project data...');

  const overlay = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
      >
        <div className="flex flex-col items-center space-y-6">
          {/* Spinner */}
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-200 border-t-blue-500 dark:border-gray-700 dark:border-t-blue-300 rounded-full animate-spin" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-foreground text-center">
            {titleText}
          </h2>

          {/* Subtitle */}
          <p className="text-base text-muted-foreground text-center max-w-md px-4">
            {subtitleText}
          </p>

          {/* Loading dots animation */}
          <div className="flex items-center space-x-2">
            {[0, 1, 2].map(index => (
              <motion.div
                key={index}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.3,
                  ease: 'easeInOut',
                }}
                className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  // Use createPortal to render the overlay at the document body level
  return typeof document !== 'undefined'
    ? createPortal(overlay, document.body)
    : overlay;
};

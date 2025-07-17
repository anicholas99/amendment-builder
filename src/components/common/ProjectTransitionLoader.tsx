import React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectTransitionLoaderProps {
  projectName?: string;
  targetView?: string;
}

export const ProjectTransitionLoader: React.FC<
  ProjectTransitionLoaderProps
> = ({ projectName, targetView }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed inset-0 z-[100] pointer-events-none"
      >
        {/* Background overlay with subtle blur - slightly darker for better contrast */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-background/40 backdrop-blur-md"
        />

        {/* Center content with scale animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative"
          >
            {/* Simple, elegant loader */}
            <div className="relative flex items-center justify-center">
              {/* Outer ring with gentle pulse */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute w-16 h-16 rounded-full border-2 border-primary/30"
              />

              {/* Simple spinning ring */}
              <div className="absolute w-16 h-16 rounded-full border-2 border-transparent border-t-primary border-r-primary animate-spin" />

              {/* Center dot */}
              <div className="w-3 h-3 rounded-full bg-primary" />
            </div>

            {/* Text content with fade-in */}
            {(projectName || targetView) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="mt-8 text-center"
              >
                {projectName && (
                  <p className="text-sm font-semibold text-foreground">
                    Loading {projectName}
                  </p>
                )}
                {targetView && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {targetView}
                  </p>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Minimal transition indicator for quick switches
export const QuickTransitionIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="fixed top-4 right-4 z-[100] pointer-events-none"
    >
      <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm rounded-lg px-4 py-2.5 shadow-lg border border-border/50">
        <div className="w-4 h-4 rounded-full border-2 border-transparent border-t-primary border-r-primary animate-spin" />
        <span className="text-xs font-medium text-foreground/80">
          Loading...
        </span>
      </div>
    </motion.div>
  );
};

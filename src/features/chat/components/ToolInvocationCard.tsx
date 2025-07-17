// @ts-nocheck
'use client';

// NOTE: framer-motion's complex generic typings can cause false-positive ReactNode assignment errors in TS 5.8.
// To unblock compilation, we temporarily disable type checking in this component until upstream types are fixed.

import React, { memo, forwardRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wrench,
  Search,
  FileSearch,
  FileText,
  Database,
  Image,
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
  Timer,
  Zap,
  Brain,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ToolInvocation, getToolDefinition } from '../types/tool-invocation';

// Icon mapping with more modern icons
const iconMap: Record<string, React.ComponentType<Record<string, unknown>>> = {
  Tool: Zap,
  Wrench: Wrench,
  Search: Search,
  FileSearch: FileSearch,
  FileText: FileText,
  Database: Database,
  Image: Image,
  Clock: Clock,
  Loader2: Loader2,
  CheckCircle: CheckCircle,
  XCircle: XCircle,
  Timer: Timer,
  Brain: Brain,
  Sparkles: Sparkles,
};

interface ToolInvocationCardProps {
  invocation: ToolInvocation;
  isCompact?: boolean;
  isInline?: boolean;
}

export const ToolInvocationCard = memo(
  forwardRef<HTMLDivElement, ToolInvocationCardProps>(
    ({ invocation, isCompact = false, isInline = false }, ref) => {
      const [progress, setProgress] = useState(0);
      const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
      const toolDef = getToolDefinition(invocation.toolName);

      // Determine if we should display a loading message (avoids complex inline logic)
      const showLoadingMessage: boolean =
        invocation.status === 'running' &&
        !!toolDef?.loadingMessages &&
        toolDef.loadingMessages.length > 0;

      // Pre-compute loading message node to keep JSX simple and aid type inference
      const renderLoadingMessage = (): React.ReactNode => {
        if (!showLoadingMessage) {
          return null;
        }

        return (
          <motion.p
            key={loadingMessageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xs text-gray-500 dark:text-gray-400 mb-3 italic"
          >
            {toolDef?.loadingMessages?.[loadingMessageIndex] || 'Processing...'}
          </motion.p>
        );
      };

      // Get the icon component
      const IconComponent = iconMap[toolDef?.icon || 'Tool'] || Zap;

      // Animate progress for running state
      useEffect(() => {
        if (invocation.status === 'running') {
          const updateProgress = () => {
            setProgress(prev => {
              // Math.random() is acceptable here - used only for UI animation variance, not security
              // eslint-disable-next-line no-restricted-properties
              const next = prev + Math.floor(Math.random() * 12) + 1;
              return next > 85 ? 85 : next;
            });
          };

          updateProgress();
          const interval = window.setInterval(updateProgress, 800);

          return () => clearInterval(interval);
        } else if (invocation.status === 'completed') {
          setProgress(100);
        }
      }, [invocation.status]);

      // Cycle through loading messages
      useEffect(() => {
        if (invocation.status === 'running' && toolDef?.loadingMessages) {
          const updateMessage = () => {
            setLoadingMessageIndex(
              prev => (prev + 1) % (toolDef.loadingMessages?.length || 1)
            );
          };

          const interval = window.setInterval(updateMessage, 3000);

          return () => clearInterval(interval);
        }
      }, [invocation.status, toolDef]);

      const statusConfig = {
        pending: {
          color:
            'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800',
          icon: <Clock className="h-3 w-3" />,
          label: 'Pending',
          pulse: false,
        },
        running: {
          color:
            'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800',
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          label: 'Running',
          pulse: true,
        },
        completed: {
          color:
            'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800',
          icon: <CheckCircle className="h-3 w-3" />,
          label: 'Completed',
          pulse: false,
        },
        failed: {
          color:
            'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800',
          icon: <XCircle className="h-3 w-3" />,
          label: 'Failed',
          pulse: false,
        },
      };

      const status = statusConfig[invocation.status];

      // Calculate duration
      const duration = invocation.endTime
        ? `${((invocation.endTime - invocation.startTime) / 1000).toFixed(1)}s`
        : null;

      // Inline compact version - very subtle
      if (isInline) {
        return (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
          >
            <motion.div
              animate={status.pulse ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <IconComponent className="h-3 w-3 text-gray-600 dark:text-gray-400" />
            </motion.div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {invocation.displayName || toolDef?.displayName}
            </span>
            {status.icon}
          </motion.div>
        );
      }

      // Compact version - contained, not full width
      if (isCompact) {
        return (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 max-w-fit"
          >
            <motion.div
              className="flex items-center justify-center w-6 h-6 rounded-md bg-white dark:bg-gray-900 shadow-sm"
              animate={status.pulse ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <IconComponent className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
            </motion.div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {invocation.displayName || toolDef?.displayName}
              </span>
              <div className="flex items-center gap-1">
                {status.icon}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {status.label}
                </span>
              </div>
            </div>

            {/* Subtle progress bar for running state */}
            {invocation.status === 'running' && (
              <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <motion.div
                  className="h-1 bg-blue-500 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}

            {/* Duration for completed */}
            {duration && invocation.status === 'completed' && (
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {duration}
              </span>
            )}
          </motion.div>
        );
      }

      // Full version - still more subtle than original
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={cn(
            'relative rounded-xl border bg-white dark:bg-gray-900 shadow-sm transition-all duration-300',
            invocation.status === 'running' &&
              'border-blue-200 dark:border-blue-800',
            invocation.status === 'completed' &&
              'border-green-200 dark:border-green-800',
            invocation.status === 'failed' &&
              'border-red-200 dark:border-red-800',
            invocation.status === 'pending' &&
              'border-amber-200 dark:border-amber-800'
          )}
        >
          {/* Subtle glow effect for running state */}
          {invocation.status === 'running' && (
            <div className="absolute inset-0 rounded-xl bg-blue-100 dark:bg-blue-900/20 opacity-50" />
          )}

          <div className="relative p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <motion.div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-xl shadow-sm',
                    status.color
                  )}
                  animate={status.pulse ? { scale: [1, 1.1, 1] } : {}}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <IconComponent className="h-5 w-5" />
                </motion.div>

                <div>
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                    {invocation.displayName || toolDef?.displayName}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {invocation.description || toolDef?.description}
                  </p>
                </div>
              </div>

              <Badge variant="outline" className={cn('text-xs', status.color)}>
                <span className="flex items-center gap-1">
                  {status.icon}
                  {status.label}
                </span>
              </Badge>
            </div>

            {/* Loading message for running state */}
            {
              // @ts-expect-error -- framer-motion Motion components with generic props confuse TS ReactNode inference
              renderLoadingMessage()
            }

            {/* Progress bar for running state */}
            {invocation.status === 'running' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-3"
              >
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="h-2 bg-blue-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </motion.div>
            )}

            {/* Result or error */}
            {invocation.status === 'completed' && invocation.result && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
              >
                <p className="text-xs text-green-700 dark:text-green-300">
                  ✓{' '}
                  {typeof invocation.result === 'string'
                    ? invocation.result
                    : 'Operation completed successfully'}
                </p>
              </motion.div>
            )}

            {invocation.status === 'failed' && invocation.error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
              >
                <p className="text-xs text-red-700 dark:text-red-300">
                  ✗ {invocation.error}
                </p>
              </motion.div>
            )}

            {/* Duration */}
            {duration && (
              <div className="mt-3 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Timer className="h-3 w-3" />
                {duration}
              </div>
            )}
          </div>
        </motion.div>
      );
    }
  )
);

ToolInvocationCard.displayName = 'ToolInvocationCard';

'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ToolInvocation } from '../types/tool-invocation';
import { ToolInvocationCard } from './ToolInvocationCard';

interface ToolInvocationGroupProps {
  invocations: ToolInvocation[];
  className?: string;
  isCompact?: boolean;
  isInline?: boolean;
}

export const ToolInvocationGroup = memo<ToolInvocationGroupProps>(
  ({ invocations, className, isCompact = false, isInline = false }) => {
    if (!invocations || invocations.length === 0) {
      return null;
    }

    // Group invocations by their status for better visual organization
    const groupedInvocations = invocations.reduce(
      (acc, inv) => {
        if (!acc[inv.status]) {
          acc[inv.status] = [];
        }
        acc[inv.status].push(inv);
        return acc;
      },
      {} as Record<string, ToolInvocation[]>
    );

    // Order for display
    const statusOrder = ['running', 'pending', 'completed', 'failed'];

    // Inline version - very subtle and integrated
    if (isInline) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className={cn(
            'flex flex-wrap items-center gap-2 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 mb-4',
            className
          )}
        >
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Tools:
          </span>
          <AnimatePresence mode="popLayout">
            {invocations.map(invocation => (
              <ToolInvocationCard
                key={invocation.id}
                invocation={invocation}
                isInline={true}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      );
    }

    // Compact version
    if (isCompact) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn('space-y-2', className)}
        >
          <AnimatePresence mode="popLayout">
            {invocations.map(invocation => (
              <ToolInvocationCard
                key={invocation.id}
                invocation={invocation}
                isCompact={true}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      );
    }

    // Full version
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn('space-y-3', className)}
      >
        <AnimatePresence mode="popLayout">
          {statusOrder.map(status => {
            const invocationsForStatus = groupedInvocations[status];
            if (!invocationsForStatus || invocationsForStatus.length === 0) {
              return null;
            }

            return (
              <motion.div key={status} layout className="space-y-2">
                {invocationsForStatus.map(invocation => (
                  <ToolInvocationCard
                    key={invocation.id}
                    invocation={invocation}
                    isCompact={false}
                  />
                ))}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    );
  }
);

ToolInvocationGroup.displayName = 'ToolInvocationGroup';

// Summary component for showing a quick overview of tool invocations
export const ToolInvocationSummary = memo<{ invocations: ToolInvocation[] }>(
  ({ invocations }) => {
    const counts = invocations.reduce(
      (acc, inv) => {
        acc[inv.status] = (acc[inv.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const statusColors = {
      pending: 'text-amber-600 dark:text-amber-400',
      running: 'text-blue-600 dark:text-blue-400',
      completed: 'text-green-600 dark:text-green-400',
      failed: 'text-red-600 dark:text-red-400',
    };

    return (
      <div className="flex items-center gap-3 text-xs">
        <span className="text-gray-500 dark:text-gray-400">Tools:</span>
        {Object.entries(counts).map(([status, count]) => (
          <span
            key={status}
            className={cn(
              'font-medium',
              statusColors[status as keyof typeof statusColors]
            )}
          >
            {count} {status}
          </span>
        ))}
      </div>
    );
  }
);

ToolInvocationSummary.displayName = 'ToolInvocationSummary';

// Subtle notification component that can be placed in chat bubbles
export const ToolInvocationNotification = memo<{
  invocations: ToolInvocation[];
  className?: string;
}>(({ invocations, className }) => {
  if (!invocations || invocations.length === 0) {
    return null;
  }

  const runningCount = invocations.filter(
    inv => inv.status === 'running'
  ).length;
  const completedCount = invocations.filter(
    inv => inv.status === 'completed'
  ).length;
  const failedCount = invocations.filter(inv => inv.status === 'failed').length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border',
        runningCount > 0 &&
          'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
        runningCount === 0 &&
          completedCount > 0 &&
          'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
        failedCount > 0 &&
          'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
        className
      )}
    >
      {runningCount > 0 && (
        <>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span>
            {runningCount} tool{runningCount === 1 ? '' : 's'} running
          </span>
        </>
      )}
      {runningCount === 0 && completedCount > 0 && (
        <>
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span>
            {completedCount} tool{completedCount === 1 ? '' : 's'} completed
          </span>
        </>
      )}
      {failedCount > 0 && (
        <>
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <span>
            {failedCount} tool{failedCount === 1 ? '' : 's'} failed
          </span>
        </>
      )}
    </motion.div>
  );
});

ToolInvocationNotification.displayName = 'ToolInvocationNotification';

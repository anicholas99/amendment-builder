import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ToolInvocation } from '../types/tool-invocation';
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface SubtleToolDisplayProps {
  invocations: ToolInvocation[];
  className?: string;
  showInMessage?: boolean;
}

export const SubtleToolDisplay = memo<SubtleToolDisplayProps>(
  ({ invocations, className, showInMessage = false }) => {
    if (!invocations || invocations.length === 0) {
      return null;
    }

    const runningCount = invocations.filter(
      inv => inv.status === 'running'
    ).length;
    const completedCount = invocations.filter(
      inv => inv.status === 'completed'
    ).length;
    const failedCount = invocations.filter(
      inv => inv.status === 'failed'
    ).length;
    const pendingCount = invocations.filter(
      inv => inv.status === 'pending'
    ).length;

    // If showing in message, use a very subtle inline indicator
    if (showInMessage) {
      return (
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          exit={{ opacity: 0, width: 0 }}
          className={cn(
            'inline-flex items-center gap-1 ml-1 px-2 py-0.5 rounded-full text-xs border',
            runningCount > 0 &&
              'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
            runningCount === 0 &&
              completedCount > 0 &&
              'bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
            failedCount > 0 &&
              'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
            pendingCount > 0 &&
              runningCount === 0 &&
              'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300',
            className
          )}
        >
          {runningCount > 0 && (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Processing...</span>
            </>
          )}
          {runningCount === 0 && completedCount > 0 && (
            <>
              <CheckCircle className="w-3 h-3" />
              <span>Done</span>
            </>
          )}
          {failedCount > 0 && (
            <>
              <XCircle className="w-3 h-3" />
              <span>Error</span>
            </>
          )}
          {pendingCount > 0 && runningCount === 0 && (
            <>
              <Clock className="w-3 h-3" />
              <span>Queued</span>
            </>
          )}
        </motion.div>
      );
    }

    // Status priority: running > failed > pending > completed
    const primaryStatus =
      runningCount > 0
        ? 'running'
        : failedCount > 0
          ? 'failed'
          : pendingCount > 0
            ? 'pending'
            : 'completed';

    const statusConfig = {
      running: {
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
        color:
          'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-900/20 dark:border-blue-800',
        label: 'Running tools',
        description: `${runningCount} tool${runningCount === 1 ? '' : 's'} executing`,
      },
      completed: {
        icon: <CheckCircle className="w-4 h-4" />,
        color:
          'text-green-600 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-900/20 dark:border-green-800',
        label: 'Tools completed',
        description: `${completedCount} tool${completedCount === 1 ? '' : 's'} finished`,
      },
      failed: {
        icon: <XCircle className="w-4 h-4" />,
        color:
          'text-red-600 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-900/20 dark:border-red-800',
        label: 'Tools failed',
        description: `${failedCount} tool${failedCount === 1 ? '' : 's'} encountered errors`,
      },
      pending: {
        icon: <Clock className="w-4 h-4" />,
        color:
          'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-900/20 dark:border-amber-800',
        label: 'Tools queued',
        description: `${pendingCount} tool${pendingCount === 1 ? '' : 's'} pending`,
      },
    };

    const status = statusConfig[primaryStatus];

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border',
          status.color,
          className
        )}
      >
        <div className="flex items-center gap-2">
          {status.icon}
          <div>
            <div className="font-medium text-sm text-current">
              {status.label}
            </div>
            <div className="text-xs text-current opacity-70">
              {status.description}
            </div>
          </div>
        </div>

        {/* Tool details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-current">
            {invocations.slice(0, 2).map((inv, idx) => (
              <div key={inv.id} className="flex items-center gap-1 opacity-80">
                <Sparkles className="w-3 h-3" />
                <span className="truncate">{inv.displayName}</span>
              </div>
            ))}
            {invocations.length > 2 && (
              <div className="flex items-center gap-1 opacity-60">
                <ChevronRight className="w-3 h-3" />
                <span>+{invocations.length - 2} more</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
);

SubtleToolDisplay.displayName = 'SubtleToolDisplay';

// Minimal status dot that can be placed anywhere
export const ToolStatusDot = memo<{
  invocations: ToolInvocation[];
  className?: string;
}>(({ invocations, className }) => {
  if (!invocations || invocations.length === 0) {
    return null;
  }

  const runningCount = invocations.filter(
    inv => inv.status === 'running'
  ).length;
  const failedCount = invocations.filter(inv => inv.status === 'failed').length;
  const pendingCount = invocations.filter(
    inv => inv.status === 'pending'
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      className={cn(
        'w-2 h-2 rounded-full',
        runningCount > 0 && 'bg-blue-500 animate-pulse',
        runningCount === 0 && failedCount > 0 && 'bg-red-500',
        runningCount === 0 &&
          failedCount === 0 &&
          pendingCount > 0 &&
          'bg-amber-500',
        runningCount === 0 &&
          failedCount === 0 &&
          pendingCount === 0 &&
          'bg-green-500',
        className
      )}
    />
  );
});

ToolStatusDot.displayName = 'ToolStatusDot';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  FiCheck,
  FiAlertCircle,
  FiRefreshCw,
  FiEye,
  FiPlus,
  FiLoader,
} from 'react-icons/fi';
import { LoadingMinimal } from '@/components/common/LoadingState';
import { SyncStatus } from '../hooks/useClaimSyncState';

interface ClaimSyncIndicatorProps {
  syncStatus: SyncStatus;
  error: string | null;
  lastSyncTime: Date | null;
  onResync?: () => void;
  onOpenModal?: () => void;
}

export const ClaimSyncIndicator: React.FC<ClaimSyncIndicatorProps> = ({
  syncStatus,
  error,
  lastSyncTime,
  onResync,
  onOpenModal,
}) => {
  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'synced':
        return <FiCheck className="w-4 h-4 text-green-500" />;
      case 'parsing':
      case 'generating':
        return <LoadingMinimal size="sm" />;
      case 'error':
        return <FiAlertCircle className="w-4 h-4 text-red-500" />;
      case 'out-of-sync':
        return <FiRefreshCw className="w-4 h-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'synced':
        return 'Synced';
      case 'parsing':
        return 'Parsing claim...';
      case 'generating':
        return 'Generating queries...';
      case 'error':
        return 'Sync error';
      case 'idle':
        return 'Click sync to parse';
      case 'out-of-sync':
        return 'Sync needed';
      default:
        return '';
    }
  };

  const getStatusDotColor = () => {
    switch (syncStatus) {
      case 'synced':
        return 'bg-green-500/70 dark:bg-green-400/70';
      case 'parsing':
      case 'generating':
        return 'bg-blue-500/70 dark:bg-blue-400/70';
      case 'error':
        return 'bg-red-500/70 dark:bg-red-400/70';
      case 'out-of-sync':
        return 'bg-amber-500/70 dark:bg-amber-400/70';
      case 'idle':
        return 'bg-muted-foreground/50 dark:bg-muted-foreground/60';
      default:
        return 'bg-muted-foreground/50';
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-1 cursor-default">
              {/* Colored status dot or spinner */}
              {syncStatus === 'parsing' || syncStatus === 'generating' ? (
                <LoadingMinimal size="sm" />
              ) : (
                <div
                  className={cn('w-2 h-2 rounded-full', getStatusDotColor())}
                />
              )}

              <span className="text-xs text-muted-foreground">
                {getStatusText()}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {error ? (
              <div className="space-y-1 max-w-[250px]">
                <p className="font-bold">Error:</p>
                <p>{error}</p>
              </div>
            ) : lastSyncTime ? (
              `Last synced: ${lastSyncTime.toLocaleTimeString()}`
            ) : (
              getStatusText()
            )}
          </TooltipContent>
        </Tooltip>

        {/* Action buttons as subtle IconButtons */}
        {syncStatus === 'idle' && onResync && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={onResync}
                className="w-8 h-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <FiRefreshCw className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sync claim 1</p>
            </TooltipContent>
          </Tooltip>
        )}

        {(syncStatus === 'synced' || syncStatus === 'out-of-sync') && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={onOpenModal}
                className="w-8 h-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <FiEye className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View elements</p>
            </TooltipContent>
          </Tooltip>
        )}

        {syncStatus === 'out-of-sync' && onResync && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={onResync}
                className="w-8 h-8 p-0 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition-colors"
              >
                <FiRefreshCw className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Re-sync</p>
            </TooltipContent>
          </Tooltip>
        )}

        {syncStatus === 'error' && onResync && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={onResync}
                className="w-8 h-8 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50/50 dark:hover:bg-red-950/30 transition-colors"
              >
                <FiRefreshCw className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Retry sync</p>
            </TooltipContent>
          </Tooltip>
        )}

        {syncStatus === 'error' && error?.includes('limit reached') && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={onOpenModal}
                className="w-8 h-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <FiPlus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add parsed data manually</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

import React from 'react';
import { Bot, CheckCircle, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  useAIAuditLog,
  useMarkAIAuditAsReviewed,
} from '@/hooks/api/useAIAudit';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface AITrustBarProps {
  auditLogId?: string | null;
  className?: string;
  showExportButton?: boolean;
  onExport?: () => void;
}

export const AITrustBar: React.FC<AITrustBarProps> = ({
  auditLogId,
  className,
  showExportButton = false,
  onExport,
}) => {
  const { data: auditLog, isLoading } = useAIAuditLog(auditLogId || null);
  const markAsReviewed = useMarkAIAuditAsReviewed();

  if (!auditLogId || (!auditLog && !isLoading)) {
    return null;
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-400',
          className
        )}
      >
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-6 w-24" />
      </div>
    );
  }

  if (!auditLog) {
    return null;
  }

  const handleMarkReviewed = () => {
    markAsReviewed.mutate(auditLogId);
  };

  return (
    <TooltipProvider>
      <div
        className={cn(
          'flex items-center justify-between p-2 text-sm bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-400 transition-all',
          auditLog.humanReviewed &&
            'bg-green-50 dark:bg-green-950/20 border-green-400',
          className
        )}
      >
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-gray-700 dark:text-gray-300">
            AI-generated content ({auditLog.model})
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(auditLog.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Operation: {auditLog.operation}</p>
              {auditLog.toolName && <p>Tool: {auditLog.toolName}</p>}
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-2">
          {auditLog.humanReviewed ? (
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Reviewed
            </Badge>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkReviewed}
              disabled={markAsReviewed.isPending}
              className="h-6 text-xs"
            >
              {markAsReviewed.isPending ? 'Marking...' : 'Mark Reviewed'}
            </Button>
          )}

          {showExportButton && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onExport}
                  className="h-6 w-6 p-0"
                >
                  <Download className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Export audit log for USPTO compliance
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

/**
 * Compact version of the trust bar for inline use
 */
export const AITrustBadge: React.FC<{
  auditLogId?: string | null;
  className?: string;
}> = ({ auditLogId, className }) => {
  const { data: auditLog } = useAIAuditLog(auditLogId || null);

  if (!auditLogId || !auditLog) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={auditLog.humanReviewed ? 'secondary' : 'outline'}
            className={cn('gap-1', className)}
          >
            <Bot className="h-3 w-3" />
            AI
            {auditLog.humanReviewed && <CheckCircle className="h-3 w-3" />}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>AI-generated ({auditLog.model})</p>
          <p>Operation: {auditLog.operation}</p>
          {auditLog.humanReviewed && (
            <p className="text-green-400">✓ Human reviewed</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Summary bar showing AI usage statistics
 */
export const AIUsageSummaryBar: React.FC<{
  projectId: string;
  className?: string;
}> = ({ projectId, className }) => {
  const { data: stats } = useAIAuditStats(projectId);

  if (!stats) {
    return null;
  }

  const reviewPercentage = Math.round(stats.reviewPercentage);

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium">
            {stats.totalLogs} AI operations
          </span>
        </div>
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm">{reviewPercentage}% reviewed</span>
        </div>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        {stats.totalTokens.toLocaleString()} tokens • $
        {stats.totalCost.toFixed(2)}
      </div>
    </div>
  );
};

// Hook to get AI audit stats
import { useQuery } from '@tanstack/react-query';
import { aiAuditKeys } from '@/lib/queryKeys';
import { AIAuditApiService } from '@/client/services/ai-audit.client-service';
import { STALE_TIME } from '@/constants/time';

const useAIAuditStats = (projectId: string | null) => {
  return useQuery({
    queryKey: aiAuditKeys.stats(projectId!),
    queryFn: () => {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      return AIAuditApiService.getAuditStats(projectId);
    },
    enabled: !!projectId,
    staleTime: STALE_TIME.DEFAULT,
  });
};

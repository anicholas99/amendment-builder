import React, { useMemo } from 'react';
import { FileText, Calendar, User, AlertCircle, Plus, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingState } from '@/components/common/LoadingState';
import { cn } from '@/lib/utils';
import { useOfficeActions } from '@/hooks/api/useAmendment';
import { logger } from '@/utils/clientLogger';
import { useToast } from '@/hooks/useToastWrapper';
import type { OfficeAction } from '@/types/amendment';

interface OfficeActionsListProps {
  projectId: string;
  onOfficeActionSelect?: (officeActionId: string) => void;
  onUploadOfficeAction?: () => void;
  selectedOfficeActionId?: string;
  compact?: boolean;
  className?: string;
}

/**
 * Office Actions List Component
 * Displays all Office Actions for a project with status indicators and metadata
 * Follows existing project sidebar patterns for consistent UI/UX
 */
export const OfficeActionsList: React.FC<OfficeActionsListProps> = ({
  projectId,
  onOfficeActionSelect,
  onUploadOfficeAction,
  selectedOfficeActionId,
  compact = false,
  className,
}) => {
  const toast = useToast();

  // Fetch Office Actions for the project using the proper hook
  const {
    data: officeActions = [],
    isLoading,
    error,
    refetch,
  } = useOfficeActions(projectId);

  // Handle Office Action selection
  const handleOfficeActionClick = React.useCallback(
    (officeActionId: string) => {
      logger.debug('[OfficeActionsList] Office Action selected', {
        officeActionId,
        projectId,
      });

      if (onOfficeActionSelect) {
        onOfficeActionSelect(officeActionId);
      }
    },
    [onOfficeActionSelect, projectId]
  );

  // Format date for display
  const formatDate = React.useCallback((dateString: string | Date | null) => {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  }, []);

  // Get status variant for badge
  const getStatusVariant = React.useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'uploaded':
        return 'secondary' as const;
      case 'parsed':
        return 'default' as const;
      case 'processing':
        return 'default' as const;
      case 'completed':
        return 'default' as const;
      case 'error':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  }, []);

  // Get status icon
  const getStatusIcon = React.useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'uploaded':
        return <FileText className="h-3 w-3" />;
      case 'parsed':
      case 'processing':
        return <Clock className="h-3 w-3" />;
      case 'completed':
        return <FileText className="h-3 w-3" />;
      case 'error':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  }, []);

  // Sort Office Actions by date (newest first)
  const sortedOfficeActions = useMemo(() => {
    return [...officeActions].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [officeActions]);

  // Handle retry when error occurs
  const handleRetry = React.useCallback(() => {
    refetch();
  }, [refetch]);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Office Actions</h3>
          {onUploadOfficeAction && (
            <Button variant="outline" size="sm" disabled>
              <Plus className="h-3 w-3 mr-1" />
              Upload
            </Button>
          )}
        </div>
        <LoadingState 
          message="Loading Office Actions"
          submessage="Please wait..."
          size="sm"
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Office Actions</h3>
          {onUploadOfficeAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={onUploadOfficeAction}
            >
              <Plus className="h-3 w-3 mr-1" />
              Upload
            </Button>
          )}
        </div>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Failed to load Office Actions
            </p>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (sortedOfficeActions.length === 0) {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Office Actions</h3>
          {onUploadOfficeAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={onUploadOfficeAction}
            >
              <Plus className="h-3 w-3 mr-1" />
              Upload
            </Button>
          )}
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h4 className="text-sm font-medium mb-1">No Office Actions</h4>
            <p className="text-xs text-muted-foreground mb-4">
              Upload an Office Action document to get started with your amendment response.
            </p>
            {onUploadOfficeAction && (
              <Button variant="default" size="sm" onClick={onUploadOfficeAction}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Office Action
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Office Actions list
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          Office Actions ({sortedOfficeActions.length})
        </h3>
        {onUploadOfficeAction && (
          <Button
            variant="outline"
            size="sm"
            onClick={onUploadOfficeAction}
          >
            <Plus className="h-3 w-3 mr-1" />
            Upload
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {sortedOfficeActions.map((officeAction) => {
          const isSelected = selectedOfficeActionId === officeAction.id;
          
          return (
            <Card
              key={officeAction.id}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-md',
                isSelected 
                  ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20' 
                  : 'hover:bg-muted/50'
              )}
              onClick={() => handleOfficeActionClick(officeAction.id)}
            >
              <CardHeader className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {officeAction.fileName || 'Office Action'}
                      </p>
                      {officeAction.oaNumber && (
                        <p className="text-xs text-muted-foreground truncate">
                          {officeAction.oaNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge 
                    variant={getStatusVariant(officeAction.status)}
                    className="flex items-center gap-1 text-xs flex-shrink-0"
                  >
                    {getStatusIcon(officeAction.status)}
                    {officeAction.status}
                  </Badge>
                </div>
              </CardHeader>

              {!compact && (
                <CardContent className="pt-0 p-4 space-y-2">
                  <div className="flex items-center text-xs text-muted-foreground gap-3">
                    {officeAction.dateIssued && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Issued {formatDate(officeAction.dateIssued)}</span>
                      </div>
                    )}
                    {officeAction.examiner?.id && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="truncate">{officeAction.examiner.id}</span>
                      </div>
                    )}
                  </div>
                  
                  {officeAction.examiner?.artUnit && (
                    <div className="text-xs text-muted-foreground">
                      Art Unit: {officeAction.examiner.artUnit}
                    </div>
                  )}
                  
                  <Separator className="my-2" />
                  <div className="text-xs text-muted-foreground">
                    Uploaded {formatDate(officeAction.createdAt)}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}; 
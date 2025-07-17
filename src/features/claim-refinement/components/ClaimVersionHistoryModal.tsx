import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/useToastWrapper';
import { FaHistory, FaTrash } from 'react-icons/fa';
import { FiLoader, FiInfo, FiAlertCircle } from 'react-icons/fi';
import {
  useClaimVersions,
  useRestoreClaimVersion,
  useDeleteClaimVersion,
} from '@/hooks/api/useClaimVersions';
import { logger } from '@/utils/clientLogger';
import { format } from 'date-fns';

interface ClaimVersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventionId: string;
  projectId: string;
}

export const ClaimVersionHistoryModal: React.FC<
  ClaimVersionHistoryModalProps
> = ({ isOpen, onClose, inventionId, projectId }) => {
  const [versionToDelete, setVersionToDelete] = useState<string | null>(null);
  const [restoringVersionId, setRestoringVersionId] = useState<string | null>(null);
  
  const { 
    data: versions, 
    isLoading, 
    error, 
    refetch 
  } = useClaimVersions(inventionId);
  const restoreVersionMutation = useRestoreClaimVersion();
  const deleteVersionMutation = useDeleteClaimVersion();
  const toast = useToast();

  // Refetch when modal opens to ensure fresh data
  useEffect(() => {
    if (isOpen && inventionId) {
      logger.debug('[ClaimVersionHistoryModal] Modal opened, ensuring fresh data');
      
      // Only refetch if we don't have data
      if (!versions || versions.length === 0) {
        const timeoutId = setTimeout(() => {
          refetch();
        }, 50);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [isOpen, inventionId, refetch, versions]);

  // Listen for version creation events
  useEffect(() => {
    const handleVersionCreated = (event: CustomEvent) => {
      const { inventionId: eventInventionId } = event.detail;
      if (eventInventionId === inventionId && isOpen) {
        logger.debug('[ClaimVersionHistoryModal] Version created event received, refreshing');
        setTimeout(() => {
          refetch();
        }, 100);
      }
    };

    if (isOpen) {
      window.addEventListener('claimVersionCreated', handleVersionCreated as EventListener);
      
      return () => {
        window.removeEventListener('claimVersionCreated', handleVersionCreated as EventListener);
      };
    }
  }, [inventionId, isOpen, refetch]);

  const handleRestore = async (versionId: string, versionName: string) => {
    if (restoreVersionMutation.isPending) {
      logger.warn('[ClaimVersionHistoryModal] Restore already in progress');
      return;
    }

    setRestoringVersionId(versionId);
    
    try {
      await restoreVersionMutation.mutateAsync({
        versionId,
        payload: { inventionId, projectId },
      });

      logger.info('[ClaimVersionHistoryModal] Restored version', {
        versionId,
        inventionId,
        projectId,
      });

      setTimeout(() => {
        onClose();
      }, 200);
    } catch (error) {
      logger.error('[ClaimVersionHistoryModal] Failed to restore version', {
        error,
      });
    } finally {
      setRestoringVersionId(null);
    }
  };

  const handleDeleteClick = (versionId: string) => {
    setVersionToDelete(versionId);
  };

  const handleDeleteConfirm = async () => {
    if (!versionToDelete) return;

    try {
      await deleteVersionMutation.mutateAsync(versionToDelete);
      logger.info('[ClaimVersionHistoryModal] Deleted version', {
        versionId: versionToDelete,
      });
      setVersionToDelete(null);
    } catch (error) {
      logger.error('[ClaimVersionHistoryModal] Failed to delete version', {
        error,
      });
    }
  };

  const versionToDeleteData = versions?.find(v => v.id === versionToDelete);

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-hidden">
          <DialogHeader className="border-b border-border pb-4">
            <DialogTitle className="text-lg font-semibold">
              Claim Version Management
            </DialogTitle>
            <DialogDescription>
              Manage saved versions of your claims. Restore any version to continue editing from that point.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {/* Working Draft Section */}
            <div className="p-4 mb-4 border border-blue-200 bg-blue-50 rounded-lg dark:bg-blue-900 dark:border-blue-700">
              <div className="flex justify-between items-center">
                <div className="flex flex-col items-start space-y-1">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                    >
                      Working Draft
                    </Badge>
                    <span className="font-semibold text-foreground">
                      Live Claims Editor
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Your active claims - always editable and separate from saved versions
                  </span>
                </div>
              </div>
            </div>

            <div className="border-b border-border mb-4" />

            {/* Version History */}
            {isLoading ? (
              <div className="py-8 text-center">
                <FiLoader className="w-8 h-8 animate-spin mx-auto text-gray-500 mb-4" />
                <p className="text-muted-foreground">Loading version history...</p>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <FiAlertCircle className="h-4 w-4" />
                <AlertDescription>Failed to load version history</AlertDescription>
              </Alert>
            ) : !versions || versions.length === 0 ? (
              <div className="p-4">
                <Alert>
                  <FiInfo className="h-4 w-4" />
                  <AlertDescription>
                    No saved versions yet. Save your first version to create a snapshot.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-col items-start space-y-1 mb-4">
                  <span className="text-sm font-semibold text-foreground">
                    Saved Versions
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Restore any version to continue editing from that point
                  </span>
                </div>

                {versions.map(version => {
                  const isOptimistic = version.id.startsWith('temp-');
                  const isBeingRestored = restoringVersionId === version.id;
                  
                  return (
                    <div
                      key={version.id}
                      className={cn(
                        'flex justify-between items-center p-4 border border-border bg-card rounded-lg transition-all duration-200',
                        !isOptimistic && 'hover:bg-accent/50',
                        isOptimistic && 'border-dashed border-blue-300 bg-blue-50/50 dark:bg-blue-900/10'
                      )}
                    >
                      <div className="flex flex-col items-start space-y-1">
                        <div className="flex items-center space-x-2">
                          {isOptimistic && (
                            <FiLoader className="w-4 h-4 animate-spin text-blue-500" />
                          )}
                          <span className={cn(
                            "font-medium text-foreground",
                            isOptimistic && "text-blue-600 dark:text-blue-400"
                          )}>
                            {version.name || 'Untitled Version'}
                          </span>
                          {isOptimistic && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              Saving...
                            </Badge>
                          )}
                          {version.snapshots && !isOptimistic && (
                            <Badge variant="secondary" className="text-xs">
                              {version.snapshots.length} claims
                            </Badge>
                          )}
                        </div>
                        <span className={cn(
                          "text-sm text-muted-foreground",
                          isOptimistic && "text-blue-500/70 dark:text-blue-400/70"
                        )}>
                          {format(new Date(version.createdAt), 'MMM d, yyyy h:mm a')}
                        </span>
                        {version.user && !isOptimistic && (
                          <span className="text-xs text-muted-foreground">
                            by {version.user.name || version.user.email}
                          </span>
                        )}
                      </div>
                      
                      {!isOptimistic && (
                        <div className="flex items-center space-x-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={isBeingRestored}
                                onClick={() => handleRestore(version.id, version.name || 'Untitled Version')}
                                className="hover:bg-blue-50 dark:hover:bg-blue-900"
                              >
                                {isBeingRestored ? (
                                  <FiLoader className="h-4 w-4 animate-spin text-blue-500" />
                                ) : (
                                  <FaHistory className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Restore this version</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={deleteVersionMutation.isPending}
                                onClick={() => handleDeleteClick(version.id)}
                                className="hover:bg-red-50 dark:hover:bg-red-900"
                              >
                                <FaTrash className="h-4 w-4 text-red-500 dark:text-red-400" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete this version</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-border pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!versionToDelete} onOpenChange={() => setVersionToDelete(null)}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-foreground">
              Delete Version
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground">
              Are you sure you want to delete version{' '}
              <span className="font-bold">
                "{versionToDeleteData?.name || 'Untitled Version'}"
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-accent">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteVersionMutation.isPending}
            >
              {deleteVersionMutation.isPending ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
};

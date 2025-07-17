import React, { useState, useEffect } from 'react';
import { logger } from '@/utils/clientLogger';
import { format } from 'date-fns';
import { FaHistory, FaTrash } from 'react-icons/fa';
import {
  useProjectVersionsQuery,
  useDeleteVersionMutation,
} from '@/hooks/api/useProjectVersions';
import type { ProjectVersionsResponse } from '@/types/api/responses';
import { RestoreVersionDialog } from './RestoreVersionDialog';
import { LoadingState } from '@/components/common/LoadingState';
import { useToast } from '@/hooks/useToastWrapper';

// shadcn/ui imports
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { VStack, HStack } from '@/components/ui/stack';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { IconButton } from '@/components/ui/icon-button';
import { Divider } from '@/components/ui/divider';

// Version is an element of the ProjectVersionsResponse array
export type Version = ProjectVersionsResponse[number];

interface VersionsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onLoadVersion: (versionId: string) => void;
  hasUnsavedChanges?: boolean;
  onSaveCurrentVersion?: (versionName: string) => Promise<void>;
}

export const VersionsHistoryModal: React.FC<VersionsHistoryModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onLoadVersion,
  hasUnsavedChanges = false,
  onSaveCurrentVersion,
}) => {
  const [versionToDelete, setVersionToDelete] = useState<Version | null>(null);
  const [versionToRestore, setVersionToRestore] = useState<Version | null>(
    null
  );
  const [isRestoring, setIsRestoring] = useState(false);
  const [isSavingBeforeRestore, setIsSavingBeforeRestore] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const toast = useToast();

  // React Query hooks
  const {
    data: versions = [],
    isLoading,
    error,
    refetch,
  } = useProjectVersionsQuery(projectId);
  const deleteVersionMutation = useDeleteVersionMutation();

  // Refetch versions when modal opens to ensure fresh data
  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  // Handle error states with toast
  useEffect(() => {
    if (error && isOpen) {
      const errorMessage =
        (error as any)?.message || 'Could not load version history.';
      if (
        errorMessage.includes('Project not found') ||
        (error as any)?.response?.status === 404
      ) {
        toast({
          title: 'No Versions',
          description: 'Project not found or has no saved versions.',
          status: 'info',
        });
      } else {
        toast({
          title: 'Error',
          description: errorMessage,
          status: 'error',
        });
      }
    }
  }, [error, isOpen, toast]);

  const handleLoad = (version: Version) => {
    if (hasUnsavedChanges) {
      setVersionToRestore(version);
      setIsRestoreDialogOpen(true);
    } else {
      performRestore(version.id);
    }
  };

  const performRestore = async (versionId: string) => {
    setIsRestoring(true);
    try {
      await onLoadVersion(versionId);
      onClose();
    } catch (error) {
      logger.error('Failed to restore version:', error);
      toast({
        title: 'Restoration Failed',
        description:
          'Unable to restore the selected version. Please try again.',
        status: 'error',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleSaveAndRestore = async () => {
    if (!versionToRestore || !onSaveCurrentVersion) return;

    setIsSavingBeforeRestore(true);
    try {
      // Generate a timestamp-based version name
      const timestamp = new Date().toLocaleString();
      await onSaveCurrentVersion(`Auto-saved before restore - ${timestamp}`);

      // After saving, perform the restore
      setIsRestoreDialogOpen(false);
      await performRestore(versionToRestore.id);
    } catch (error) {
      logger.error('Failed to save before restore:', error);
      toast({
        title: 'Save Failed',
        description: 'Unable to save current changes. Please try again.',
        status: 'error',
      });
    } finally {
      setIsSavingBeforeRestore(false);
    }
  };

  const handleDiscardAndRestore = async () => {
    if (!versionToRestore) return;

    setIsRestoreDialogOpen(false);
    await performRestore(versionToRestore.id);
  };

  const handleDelete = async (versionId: string) => {
    setVersionToDelete(versions.find(v => v.id === versionId) || null);
    setIsAlertOpen(true);
  };

  const confirmDeleteVersion = async () => {
    if (!versionToDelete) return;

    setIsAlertOpen(false); // Close confirmation dialog

    deleteVersionMutation.mutate(
      { projectId, versionId: versionToDelete.id },
      {
        onSuccess: () => {
          toast({
            title: 'Version Deleted',
            description: `Successfully deleted version: ${versionToDelete.name}`,
            status: 'success',
          });
          setVersionToDelete(null);
        },
        onError: error => {
          logger.error(`Error deleting version ${versionToDelete.id}:`, error);
          toast({
            title: 'Error Deleting Version',
            description:
              (error as any)?.message ||
              'Failed to delete the selected version.',
            status: 'error',
          });
          setVersionToDelete(null);
        },
      }
    );
  };

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-hidden">
          <DialogHeader className="border-b border-border pb-4">
            <DialogTitle className="text-lg font-semibold">
              Version Management
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {/* Working Draft Indicator */}
            <Box className="p-4 mb-4 border border-blue-200 bg-blue-50 rounded-lg dark:bg-blue-900 dark:border-blue-700">
              <HStack className="justify-between">
                <VStack className="items-start space-y-1">
                  <HStack>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                    >
                      Working Draft
                    </Badge>
                    <Text className="font-semibold text-foreground">
                      Live Editor
                    </Text>
                  </HStack>
                  <Text className="text-sm text-muted-foreground">
                    Your active document - always editable and separate from
                    saved versions
                  </Text>
                </VStack>
                {hasUnsavedChanges && (
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100 text-xs"
                  >
                    Unsaved Changes
                  </Badge>
                )}
              </HStack>
            </Box>

            <Divider className="mb-4" />

            {/* Version History List */}
            {isLoading ? (
              <Box className="py-8">
                <LoadingState
                  variant="spinner"
                  message="Loading version history..."
                />
              </Box>
            ) : error ? (
              <Alert variant="destructive">
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            ) : versions.length === 0 ? (
              <Box className="p-4">
                <Text className="text-center text-muted-foreground">
                  No saved versions yet. Save your first version to create a
                  snapshot.
                </Text>
              </Box>
            ) : (
              <VStack className="space-y-3 items-stretch">
                <VStack className="items-start space-y-1 mb-2">
                  <Text className="text-sm font-semibold text-foreground">
                    Saved Versions
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    Restore any version to continue editing from that point
                  </Text>
                </VStack>

                {versions.map(version => (
                  <HStack
                    key={version.id}
                    className="justify-between p-4 border border-border bg-card rounded-lg hover:bg-accent/50 transition-all duration-200"
                  >
                    <VStack className="items-start space-y-1">
                      <Text className="font-medium text-foreground">
                        {version.name}
                      </Text>
                      <Text className="text-sm text-muted-foreground">
                        {format(
                          new Date(version.createdAt),
                          'MMM d, yyyy h:mm a'
                        )}
                      </Text>
                    </VStack>
                    <HStack className="space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <IconButton
                            aria-label="Restore version"
                            onClick={() => handleLoad(version)}
                            size="sm"
                            variant="ghost"
                            className="hover:bg-blue-50 dark:hover:bg-blue-900"
                          >
                            <FaHistory className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                          </IconButton>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Restore this version</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <IconButton
                            aria-label="Delete version"
                            onClick={() => handleDelete(version.id)}
                            size="sm"
                            variant="ghost"
                            disabled={deleteVersionMutation.isPending}
                            className="hover:bg-red-50 dark:hover:bg-red-900"
                          >
                            <FaTrash className="h-4 w-4 text-red-500 dark:text-red-400" />
                          </IconButton>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete this version</p>
                        </TooltipContent>
                      </Tooltip>
                    </HStack>
                  </HStack>
                ))}
              </VStack>
            )}
          </div>

          <DialogFooter className="border-t border-border pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-border text-foreground hover:bg-accent"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-foreground">
              Delete Version
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground">
              Are you sure you want to delete version{' '}
              <span className="font-bold">
                "{versionToDelete?.name || 'Unnamed Version'}"
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-accent">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteVersion}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteVersionMutation.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Version Dialog */}
      {versionToRestore && (
        <RestoreVersionDialog
          isOpen={isRestoreDialogOpen}
          onClose={() => setIsRestoreDialogOpen(false)}
          onSaveAndRestore={handleSaveAndRestore}
          onDiscardAndRestore={handleDiscardAndRestore}
          versionName={versionToRestore.name || 'Unnamed Version'}
          isSaving={isSavingBeforeRestore}
          isRestoring={isRestoring}
        />
      )}
    </TooltipProvider>
  );
};

export default VersionsHistoryModal;

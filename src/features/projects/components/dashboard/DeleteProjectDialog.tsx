import React from 'react';
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

interface DeleteProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
  cancelRef: React.RefObject<HTMLButtonElement>;
  isDeleting?: boolean;
}

/**
 * Delete confirmation dialog for cases
 * Follows the established AlertDialog pattern used throughout the application
 */
export const DeleteProjectDialog: React.FC<DeleteProjectDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  projectName,
  cancelRef,
  isDeleting = false,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Case</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete case <strong>"{projectName}"</strong>?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-3">
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. All case data including Office Actions,
            claim amendments, and response documents will be permanently deleted.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel ref={cancelRef} disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

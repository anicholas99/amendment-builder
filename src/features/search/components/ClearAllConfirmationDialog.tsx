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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ClearAllConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cancelRef: React.RefObject<HTMLButtonElement>;
}

/**
 * Clear all confirmation dialog component for search history
 */
const ClearAllConfirmationDialog: React.FC<ClearAllConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  cancelRef,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <AlertDialogContent className="mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold border-b pb-3">
            Clear Search History
          </AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogDescription className="pt-4">
          Are you sure you want to clear all search history? This action cannot
          be undone.
        </AlertDialogDescription>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel ref={cancelRef}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Clear All
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ClearAllConfirmationDialog;

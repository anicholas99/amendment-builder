import React, { RefObject } from 'react';
import { cn } from '@/lib/utils';
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
import { useThemeContext } from '@/contexts/ThemeContext';

interface DeleteFigureAlertProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  figureNum: string;
  cancelRef: RefObject<HTMLButtonElement>;
}

/**
 * Component for the delete figure confirmation dialog
 */
const DeleteFigureAlert: React.FC<DeleteFigureAlertProps> = ({
  isOpen,
  onClose,
  onDelete,
  figureNum,
  cancelRef,
}) => {
  const { isDarkMode } = useThemeContext();

  return (
    <AlertDialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold">
            Delete Figure
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {figureNum}? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel ref={cancelRef} onClick={onClose}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteFigureAlert;

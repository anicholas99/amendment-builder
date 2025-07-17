import React from 'react';
import { AlertTriangle } from 'lucide-react';
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

interface SectionDeletionAlertProps {
  isOpen: boolean;
  headerName: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const SectionDeletionAlert: React.FC<SectionDeletionAlertProps> = ({
  isOpen,
  headerName,
  onConfirm,
  onCancel,
}) => {
  if (!headerName) return null; // Don't render if no header name is provided

  return (
    <AlertDialog open={isOpen} onOpenChange={open => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Section Header</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span className="font-semibold">Warning</span>
          </div>
          <p>
            You're about to delete the "{headerName}" section header. This may
            affect the structure of your document. Section headers are important
            for organizing your patent application.
          </p>
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Delete Section Header
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

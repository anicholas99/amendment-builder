import React from 'react';
import { Save, Trash2, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';

interface RestoreVersionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAndRestore: () => Promise<void>;
  onDiscardAndRestore: () => Promise<void>;
  versionName: string;
  isSaving?: boolean;
  isRestoring?: boolean;
}

export const RestoreVersionDialog: React.FC<RestoreVersionDialogProps> = ({
  isOpen,
  onClose,
  onSaveAndRestore,
  onDiscardAndRestore,
  versionName,
  isSaving = false,
  isRestoring = false,
}) => {
  const { isDarkMode } = useThemeContext();
  const isProcessing = isSaving || isRestoring;

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={open => !open && !isProcessing && onClose()}
    >
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved Changes Detected</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription className="space-y-4">
          <p>
            You have unsaved changes in your working draft. What would you like
            to do before loading content from "{versionName}"?
          </p>

          <div className="space-y-3 pt-2">
            <div
              className={cn(
                'flex items-start gap-3 p-4 border rounded-md',
                isDarkMode
                  ? 'bg-green-900/20 border-green-700'
                  : 'bg-green-50 border-green-200'
              )}
            >
              <Save className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm">
                <span className="font-semibold">Save current draft</span> -
                Create a new snapshot of your working draft before loading the
                selected content
              </div>
            </div>

            <div
              className={cn(
                'flex items-start gap-3 p-4 border rounded-md',
                isDarkMode
                  ? 'bg-orange-900/20 border-orange-700'
                  : 'bg-orange-50 border-orange-200'
              )}
            >
              <Trash2 className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="text-sm">
                <span className="font-semibold">Discard changes</span> - Replace
                your working draft with content from the selected version
              </div>
            </div>

            <div
              className={cn(
                'flex items-start gap-3 p-4 border rounded-md',
                isDarkMode
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-gray-50 border-gray-200'
              )}
            >
              <X className="h-5 w-5 text-gray-600 mt-0.5" />
              <div className="text-sm">
                <span className="font-semibold">Cancel</span> - Keep working on
                your current draft
              </div>
            </div>
          </div>
        </AlertDialogDescription>
        <AlertDialogFooter>
          <div className="flex gap-3">
            <Button onClick={onClose} disabled={isProcessing} variant="ghost">
              Cancel
            </Button>
            <Button
              onClick={onDiscardAndRestore}
              disabled={isProcessing}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isRestoring && !isSaving ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Restoring...
                </>
              ) : (
                'Discard & Restore'
              )}
            </Button>
            <Button
              onClick={onSaveAndRestore}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSaving ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Saving...
                </>
              ) : (
                'Save & Restore'
              )}
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

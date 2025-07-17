import React from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useThemeContext } from '../../../../contexts/ThemeContext';

interface ProjectConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetProject: { name: string } | null;
  isLoading: boolean;
  title?: string;
  actionText?: string;
}

export const ProjectConfirmationModal: React.FC<
  ProjectConfirmationModalProps
> = ({
  isOpen,
  onClose,
  onConfirm,
  targetProject,
  isLoading,
  title = 'Open Project',
  actionText = 'Open',
}) => {
  const { isDarkMode } = useThemeContext();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => !open && !isLoading && onClose()}
    >
      <DialogContent className="sm:max-w-md">
        <div className="space-y-4">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4">
              <p className="text-base">
                Are you sure you want to {actionText.toLowerCase()}{' '}
                <span
                  className={cn(
                    'font-semibold',
                    isDarkMode ? 'text-blue-200' : 'text-blue-600'
                  )}
                >
                  {targetProject?.name || 'this project'}
                </span>
                ?
              </p>
              <p
                className={cn(
                  'text-sm',
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                )}
              >
                Any unsaved changes in the current project will be saved
                automatically.
              </p>
            </div>
          </DialogDescription>
        </div>
        <DialogFooter className="pt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="mr-3"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? `${actionText}ing...` : actionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

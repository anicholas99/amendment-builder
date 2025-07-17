import React from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useThemeContext } from '../../../../contexts/ThemeContext';
import { ProjectData } from '@/contexts';
import { ProjectSidebarProject } from '../../types/projectSidebar';

export interface ProjectSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetProject: ProjectSidebarProject | null;
  isLoading: boolean;
}

export const ProjectSwitchModal: React.FC<ProjectSwitchModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  targetProject,
  isLoading,
}) => {
  const { isDarkMode } = useThemeContext();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => !open && !isLoading && onClose()}
    >
      <DialogContent className="sm:max-w-md">
        <div className="space-y-4">
          <DialogTitle className="text-xl font-semibold">
            Open Project
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4">
              <p className="text-base">
                Are you sure you want to open{' '}
                <span
                  className={cn(
                    'font-semibold',
                    isDarkMode ? 'text-blue-200' : 'text-blue-600'
                  )}
                >
                  {targetProject?.name}
                </span>
                ?
              </p>
              {isLoading && (
                <p
                  className={cn(
                    'text-sm',
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  )}
                >
                  Loading project data...
                </p>
              )}
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
            {isLoading ? 'Opening...' : 'Open'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

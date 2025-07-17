import React from 'react';
import { useDisclosure } from '@/hooks/useDisclosure';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';
import { logger } from '@/utils/clientLogger';

interface ResetApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isResetting?: boolean;
}

export const ResetApplicationModal: React.FC<ResetApplicationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isResetting = false,
}) => {
  const { isDarkMode } = useThemeContext();

  const handleConfirm = async () => {
    logger.info(
      '[ResetApplicationModal] Confirm button clicked, calling onConfirm'
    );
    await onConfirm();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => !open && !isResetting && onClose()}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Patent Application</DialogTitle>
          <DialogDescription>
            This action will permanently delete your patent application content.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-center">
            <AlertTriangle className="h-12 w-12 text-orange-500" />
          </div>
          <p className="font-semibold text-center">
            Are you sure you want to reset your patent application?
          </p>
          <div className="space-y-2">
            <p
              className={cn(
                'text-sm',
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              )}
            >
              This action will:
            </p>
            <div
              className={cn(
                'text-sm pl-4 space-y-1',
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              )}
            >
              <div>• Delete all current patent content</div>
              <div>• Remove all saved versions</div>
              <div>• Return you to the patent generation screen</div>
            </div>
          </div>
          <p
            className={cn(
              'text-sm font-medium text-center',
              isDarkMode ? 'text-red-400' : 'text-red-600'
            )}
          >
            This action cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isResetting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isResetting}
          >
            {isResetting ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Resetting...
              </>
            ) : (
              'Reset Application'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Hook for managing the reset modal
export const useResetApplicationModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return {
    isOpen,
    onOpen,
    onClose,
  };
};

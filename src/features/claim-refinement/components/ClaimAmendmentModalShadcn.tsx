import React, { useRef } from 'react';
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

interface ClaimAmendmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal component for confirming claim amendments when the claim has been modified
 * since the analysis was performed
 */
export const ClaimAmendmentModalShadcn: React.FC<ClaimAmendmentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
}) => {
  const { isDarkMode } = useThemeContext();

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold">
            Claim Modified Since Analysis
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p className={cn(isDarkMode ? 'text-gray-300' : 'text-gray-600')}>
              Claim 1 has been modified since this deep analysis was performed.
            </p>
            <p
              className={cn(
                'font-medium',
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              )}
            >
              The deep analysis was based on an older version of claim 1.
            </p>
            <p
              className={cn(
                'font-medium',
                isDarkMode ? 'text-orange-400' : 'text-orange-500'
              )}
            >
              If you proceed, your current claim 1 text will be REPLACED with
              the suggested amendment.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Keep Current Text
          </Button>
          <Button
            onClick={onConfirm}
            className={cn(
              'ml-3',
              isDarkMode
                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            )}
          >
            Apply Amendment
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

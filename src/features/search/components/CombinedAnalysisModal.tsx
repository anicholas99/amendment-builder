import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { FiCopy, FiX, FiLoader } from 'react-icons/fi';
import { LoadingState } from '@/components/common/LoadingState';
import { useToast } from '@/hooks/useToastWrapper';
import { useThemeContext } from '@/contexts/ThemeContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface CombinedAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  result: string | null;
  selectedReferences: string[];
}

const CombinedAnalysisModal: React.FC<CombinedAnalysisModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  result,
  selectedReferences,
}) => {
  const toast = useToast();
  const { isDarkMode } = useThemeContext();

  const safeSelectedReferences = Array.isArray(selectedReferences)
    ? selectedReferences
    : [];

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => {
      toast({
        title: 'Copied to clipboard',
        duration: 2000,
      });
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            {isLoading && (
              <FiLoader className="w-5 h-5 animate-spin text-blue-600" />
            )}
            {isLoading
              ? 'Generating Analysis...'
              : 'Combined Examiner Analysis'}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Selected references */}
          <div className="mb-4">
            <p
              className={cn(
                'text-sm font-semibold mb-2',
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              )}
            >
              Selected References:
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {safeSelectedReferences.map(ref => (
                <Badge
                  key={ref}
                  variant="secondary"
                  className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  {ref.replace(/-/g, '')}
                </Badge>
              ))}
            </div>
          </div>

          <Separator className="mb-4" />

          {isLoading ? (
            <div className="space-y-4">
              <LoadingState
                variant="spinner"
                message="Analyzing selected references..."
                submessage="This comprehensive analysis examines how the references combine under 35 U.S.C. § 103 to reject your claim."
                minHeight="200px"
              />
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This may take up to 2 minutes for a thorough analysis.
                </p>
              </div>
            </div>
          ) : result ? (
            <div>
              <div className="flex justify-end mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8 w-8 p-0"
                  title="Copy analysis to clipboard"
                >
                  <FiCopy className="h-4 w-4" />
                  <span className="sr-only">Copy analysis to clipboard</span>
                </Button>
              </div>
              <div
                className={cn(
                  'whitespace-pre-wrap text-sm leading-relaxed max-h-[60vh] overflow-y-auto px-2 py-4 rounded-md border',
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-gray-50 border-gray-200'
                )}
              >
                {result}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p
                className={cn(
                  'text-lg mb-2',
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                )}
              >
                No analysis result available
              </p>
              <p
                className={cn(
                  'text-sm',
                  isDarkMode ? 'text-gray-500' : 'text-gray-600'
                )}
              >
                Please try running the analysis again
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {isLoading ? 'Cancel' : 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CombinedAnalysisModal;

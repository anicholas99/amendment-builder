import React from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TechnologyFooterActionsProps {
  value: string;
  uploadedFilesCount: number;
  uploadedFiguresCount: number;
  isProcessing: boolean;
  isUploading: boolean;
  onProceed: () => void;
}

export const TechnologyFooterActions: React.FC<
  TechnologyFooterActionsProps
> = ({
  value,
  uploadedFilesCount,
  uploadedFiguresCount,
  isProcessing,
  isUploading,
  onProceed,
}) => {
  const hasContent =
    value.trim().length > 0 ||
    uploadedFilesCount > 0 ||
    uploadedFiguresCount > 0;
  const isLoading = isProcessing || isUploading;

  return (
    <div className="w-full bg-background">
      <div className="px-4 md:px-6 py-3 md:py-4">
        {/* Match the same grid structure as the content above */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_0.75fr] gap-4 md:gap-5">
          {/* Left column - matches text input area */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Status Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">
                {hasContent ? (
                  <>
                    {value.trim().length > 0 && (
                      <span>{value.trim().length} characters</span>
                    )}
                    {value.trim().length > 0 &&
                      (uploadedFilesCount > 0 || uploadedFiguresCount > 0) && (
                        <span> • </span>
                      )}
                    {uploadedFilesCount > 0 && (
                      <span>
                        {uploadedFilesCount} file
                        {uploadedFilesCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    {uploadedFilesCount > 0 && uploadedFiguresCount > 0 && (
                      <span> • </span>
                    )}
                    {uploadedFiguresCount > 0 && (
                      <span>
                        {uploadedFiguresCount} figure
                        {uploadedFiguresCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </>
                ) : (
                  'Add content to begin analysis'
                )}
              </p>
            </div>

            {/* Action Button - Aligned with right edge of text input container */}
            <div className="flex-shrink-0">
              <Button
                onClick={onProceed}
                disabled={!hasContent || isLoading}
                className="w-full sm:w-auto min-w-[140px]"
                size="default"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isProcessing ? 'Analyzing...' : 'Uploading...'}
                  </>
                ) : (
                  <>
                    Analyze Invention
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right column - empty space to match files sidebar */}
          <div className="hidden lg:block"></div>
        </div>
      </div>
    </div>
  );
};

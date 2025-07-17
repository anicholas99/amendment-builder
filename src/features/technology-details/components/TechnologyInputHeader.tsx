import React from 'react';
import { FiUpload } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useThemeContext } from '../../../contexts/ThemeContext';

/**
 * Custom hook to get colors based on theme mode
 */
const useColorModeValue = (lightValue: string, darkValue: string): string => {
  const { isDarkMode } = useThemeContext();
  return isDarkMode ? darkValue : lightValue;
};

interface TechnologyInputHeaderProps {
  isUploading: boolean;
  isProcessing: boolean;
  onUploadClick: () => void;
}

/**
 * Minimal header component with just an upload button
 */
export const TechnologyInputHeader: React.FC<TechnologyInputHeaderProps> = ({
  isUploading,
  isProcessing,
  onUploadClick,
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <div
      className={cn(
        'flex justify-end items-center py-1 mb-1 border-b',
        'border-border'
      )}
    >
      {!isUploading ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onUploadClick}
                disabled={isProcessing}
                className="h-8 w-8 p-0 rounded-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/20"
                aria-label="Upload Files"
                data-testid="upload-document-button"
              >
                <FiUpload className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Upload Files</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          disabled
          className="h-8 w-8 p-0 text-blue-600 dark:text-blue-400"
          aria-label="Uploading..."
        >
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </Button>
      )}
    </div>
  );
};

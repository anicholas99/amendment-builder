import React from 'react';
import { cn } from '@/lib/utils';
import { FiExternalLink, FiBookmark, FiX } from 'react-icons/fi';
import { BsBookmarkFill } from 'react-icons/bs';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useThemeContext } from '@/contexts/ThemeContext';

interface ReferenceActionButtonsProps {
  referenceNumber: string;
  isSaved: boolean;
  isExcluded: boolean;
  onSave: () => void;
  onExclude: () => void;
  getCitationIcon: (referenceNumber: string) => React.ReactNode;
  isDisabled?: boolean;
}

/**
 * Reusable action buttons for reference cards (save, exclude, view external, citation)
 */
export const ReferenceActionButtons: React.FC<ReferenceActionButtonsProps> =
  React.memo(
    ({
      referenceNumber,
      isSaved,
      isExcluded,
      onSave,
      onExclude,
      getCitationIcon,
      isDisabled = false,
    }) => {
      const { isDarkMode } = useThemeContext();

      const handleExternalLinkClick = (e: React.MouseEvent) => {
        e.stopPropagation();
      };

      const handleSaveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isDisabled && !isExcluded) {
          onSave();
        }
      };

      const handleExcludeClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isDisabled && !isExcluded && !isSaved) {
          onExclude();
        }
      };

      return (
        <div
          className="flex items-center gap-0"
          onClick={e => e.stopPropagation()}
        >
          {/* Citation icon (moved to first position) */}
          {getCitationIcon(referenceNumber)}

          {/* View on Google Patents */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-6 w-6 p-0 transition-colors',
                    isDarkMode
                      ? 'text-white hover:text-gray-200 hover:bg-gray-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  )}
                  onClick={e => {
                    handleExternalLinkClick(e);
                    window.open(
                      `https://patents.google.com/patent/${referenceNumber.replace(/-/g, '')}/en`,
                      '_blank'
                    );
                  }}
                >
                  <FiExternalLink className="h-3 w-3" />
                  <span className="sr-only">View external link</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View on Google Patents</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Save/Unsave button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-6 w-6 p-0 transition-colors',
                    isSaved
                      ? 'text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      : isDarkMode
                        ? 'text-white hover:text-gray-200 hover:bg-gray-700'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  )}
                  onClick={handleSaveClick}
                  disabled={isDisabled || isExcluded}
                >
                  {isSaved ? (
                    <BsBookmarkFill className="h-3 w-3" />
                  ) : (
                    <FiBookmark className="h-3 w-3" />
                  )}
                  <span className="sr-only">
                    {isSaved ? 'Unsave prior art' : 'Save prior art'}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isSaved ? 'Unsave prior art' : 'Save prior art'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Exclude button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-6 w-6 p-0 transition-colors',
                    isExcluded
                      ? 'text-gray-400 cursor-not-allowed opacity-50'
                      : 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                  )}
                  disabled={isDisabled || isExcluded || isSaved}
                  onClick={handleExcludeClick}
                >
                  <FiX className="h-3 w-3" />
                  <span className="sr-only">
                    {isExcluded ? 'Reference excluded' : 'Exclude reference'}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isExcluded ? 'Reference excluded' : 'Exclude reference'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    }
  );

ReferenceActionButtons.displayName = 'ReferenceActionButtons';

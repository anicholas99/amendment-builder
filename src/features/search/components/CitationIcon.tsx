import React from 'react';
import { cn } from '@/lib/utils';
import { FiEye, FiList } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { LoadingMinimal } from '@/components/common/LoadingState';
import { useThemeContext } from '@/contexts/ThemeContext';

interface CitationIconProps {
  referenceNumber: string;
  entryId: string;
  isExtracting: boolean;
  hasJob: boolean;
  onViewCitations?: () => void;
  onExtractCitation?: () => void;
}

/**
 * Citation icon component that shows different states based on citation job status
 */
export const CitationIcon: React.FC<CitationIconProps> = ({
  referenceNumber,
  entryId,
  isExtracting,
  hasJob,
  onViewCitations,
  onExtractCitation,
}) => {
  const { isDarkMode } = useThemeContext();

  if (isExtracting) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="p-1">
              <LoadingMinimal size="sm" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Requesting citation extraction...</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (hasJob) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-6 w-6 p-0',
                isDarkMode
                  ? 'text-gray-400 hover:text-blue-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              )}
              onClick={e => {
                e.stopPropagation();
                requestAnimationFrame(() => {
                  if (onViewCitations) {
                    onViewCitations();
                  }
                });
              }}
            >
              <FiEye className="h-4 w-4" />
              <span className="sr-only">View citations for this search</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View citations</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-6 w-6 p-0',
              isDarkMode
                ? 'text-gray-400 hover:text-blue-300 hover:bg-gray-700'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            )}
            onClick={e => {
              e.stopPropagation();
              if (onExtractCitation) {
                onExtractCitation();
              }
            }}
          >
            <FiList className="h-4 w-4" />
            <span className="sr-only">Extract citation data</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Extract citation data</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

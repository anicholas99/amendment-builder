import React, { useState, useEffect } from 'react';
import { logger } from '@/utils/clientLogger';
import { cn } from '@/lib/utils';
import { FiExternalLink, FiBookmark, FiX, FiList } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useToast } from '@/utils/toast';
import { useAddPatentExclusion } from '@/hooks/api/usePatentExclusions';

interface PatentActionButtonsProps {
  patentNumber: string;
  projectId?: string;
  isSaved?: boolean;
  onSave?: () => void;
  onExtractCitations?: (patentNumber: string) => void;
}

/**
 * Action buttons for patent references in the search history table
 */
const PatentActionButtons: React.FC<PatentActionButtonsProps> = ({
  patentNumber,
  projectId,
  isSaved = false,
  onSave,
  onExtractCitations,
}) => {
  const [isActuallySaved, setIsActuallySaved] = useState(isSaved);
  const { isDarkMode } = useThemeContext();
  const toast = useToast();

  // Use the centralized hook for excluding patents
  const { mutateAsync: excludePatentMutation, isPending: isExcluding } =
    useAddPatentExclusion();

  // Update internal state when prop changes
  useEffect(() => {
    setIsActuallySaved(isSaved);
  }, [isSaved]);

  // Normalize patent number (remove hyphens)
  const normalizedPatentNumber = patentNumber.replace(/-/g, '');

  // Open the patent in Google Patents
  const handleViewPatent = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row expansion
    window.open(
      `https://patents.google.com/patent/${normalizedPatentNumber}`,
      '_blank'
    );
  };

  // Save the patent to the saved prior art list
  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSave && !isActuallySaved) {
      onSave();
      setIsActuallySaved(true); // Optimistically update UI
    }
  };

  // Extract citations for this patent
  const handleExtractCitations = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExtractCitations) {
      onExtractCitations(patentNumber);
    }
  };

  // Exclude the patent from future search results
  const handleExclude = async (e: React.MouseEvent) => {
    e.stopPropagation();

    logger.info('Exclude button clicked for patent:', { patentNumber });
    logger.info('Project ID:', { projectId });

    if (!projectId) {
      toast.error('Cannot exclude patent', {
        description: 'No project context available for exclusion.',
      });
      return;
    }

    try {
      await excludePatentMutation({
        projectId,
        patentNumbers: [patentNumber],
        metadata: { source: 'PatentActionButtons' },
      });

      logger.info('Patent excluded successfully:', { patentNumber });
    } catch (error) {
      logger.error('Error excluding patent:', { error, patentNumber });
      // Error handling is done in the hook
    }
  };

  return (
    <div className="flex flex-row gap-1">
      {/* View in Google Patents */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 w-8 p-0',
              isDarkMode
                ? 'text-gray-400 hover:text-gray-100 hover:bg-gray-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            )}
            onClick={handleViewPatent}
          >
            <FiExternalLink className="h-4 w-4" />
            <span className="sr-only">View in Google Patents</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>View in Google Patents</p>
        </TooltipContent>
      </Tooltip>

      {/* Save to Prior Art (if save handler provided) */}
      {onSave && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isActuallySaved}
              className={cn(
                'h-8 w-8 p-0',
                isActuallySaved
                  ? isDarkMode
                    ? 'text-green-400 hover:text-green-300 hover:bg-green-900/20'
                    : 'text-green-500 hover:text-green-600 hover:bg-green-50'
                  : isDarkMode
                    ? 'text-gray-400 hover:text-gray-100 hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
              onClick={handleSave}
            >
              <FiBookmark className="h-4 w-4" />
              <span className="sr-only">
                {isActuallySaved ? 'Already saved' : 'Save to Prior Art'}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isActuallySaved ? 'Already saved' : 'Save to Prior Art'}</p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Extract Citations button */}
      {onExtractCitations && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 w-8 p-0',
                isDarkMode
                  ? 'text-gray-400 hover:text-gray-100 hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
              onClick={handleExtractCitations}
            >
              <FiList className="h-4 w-4" />
              <span className="sr-only">Extract Citations</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Extract Citations</p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Exclude patent button */}
      {projectId && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isExcluding}
              className={cn(
                'h-8 w-8 p-0',
                isDarkMode
                  ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                  : 'text-red-500 hover:text-red-600 hover:bg-red-50'
              )}
              onClick={handleExclude}
            >
              <FiX className="h-4 w-4" />
              <span className="sr-only">Exclude Patent</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Exclude from future searches</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

export default PatentActionButtons;

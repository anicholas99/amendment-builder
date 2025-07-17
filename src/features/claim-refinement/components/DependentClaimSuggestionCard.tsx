import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { FiPlus, FiEdit, FiX } from 'react-icons/fi';

interface DependentClaimSuggestionCardProps {
  suggestionText: string; // The full suggested claim text (e.g., "2. ...")
  onInsert: (claimText: string) => void;
  onEdit: (claimText: string) => void; // Trigger modal open
  onDismiss: () => void;
}

/**
 * Card component for displaying a dependent claim suggestion
 * with options to insert directly, edit, or dismiss
 */
const DependentClaimSuggestionCard: React.FC<
  DependentClaimSuggestionCardProps
> = ({ suggestionText, onInsert, onEdit, onDismiss }) => {
  // Parse out the claim number if present (for display purposes)
  const match = suggestionText.match(/^(\d+)\.\s*(.*)/);
  const displayNumber = match ? match[1] : '';
  const displayText = match ? match[2] : suggestionText;

  return (
    <TooltipProvider>
      <div className="border border-gray-200 rounded-md p-4 bg-white shadow-sm relative dark:border-gray-600 dark:bg-gray-700">
        <p className="text-sm mb-2">
          {displayNumber && (
            <span className="font-bold mr-1">{displayNumber}.</span>
          )}
          {displayText}
        </p>

        <div className="flex justify-end items-center space-x-2 mt-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
                className="w-8 h-8 p-0"
              >
                <FiX className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Dismiss suggestion</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(suggestionText)}
                className="w-8 h-8 p-0"
              >
                <FiEdit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit before inserting</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                onClick={() => onInsert(suggestionText)}
                className="gap-1"
              >
                <FiPlus className="h-4 w-4" />
                Insert
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Insert directly</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default DependentClaimSuggestionCard;

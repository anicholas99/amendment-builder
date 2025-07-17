import React from 'react';
import { FiTrash2, FiMaximize, FiX } from 'react-icons/fi';
import { FigureControlsProps } from './types';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/**
 * Component for the control buttons (delete, expand) that appear on a figure
 */
const FigureControls: React.FC<FigureControlsProps> = ({
  figureKeys,
  onDelete,
  onFullView,
  onUnassign,
  hasImage = false,
}) => {
  return (
    <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 rounded-md p-1 shadow-sm backdrop-blur-sm">
      <div className="flex items-center space-x-1">
        <TooltipProvider>
          {/* Unassign figure button - only show when image exists */}
          {hasImage && onUnassign && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Unassign figure"
                  onClick={onUnassign}
                  className={cn(
                    'w-6 h-6 p-0 text-muted-foreground',
                    'hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400',
                    'active:scale-95 transition-all duration-200 hover:scale-110'
                  )}
                >
                  <FiX className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Unassign figure</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Delete figure slot button - minimal style */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Delete figure slot"
                onClick={() => {
                  if (figureKeys.length > 0) {
                    onDelete();
                  }
                }}
                disabled={figureKeys.length === 0}
                className={cn(
                  'w-6 h-6 p-0 text-muted-foreground',
                  'hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400',
                  'active:scale-95 transition-all duration-200 hover:scale-110',
                  'disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-transparent disabled:hover:text-gray-600'
                )}
              >
                <FiTrash2 className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete figure slot</p>
            </TooltipContent>
          </Tooltip>

          {/* View full size button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Expand figure"
                onClick={() => {
                  onFullView();
                }}
                className={cn(
                  'w-6 h-6 p-0 text-muted-foreground',
                  'hover:bg-accent hover:text-gray-700 dark:hover:text-gray-200',
                  'active:scale-95 transition-all duration-200 hover:scale-110'
                )}
              >
                <FiMaximize className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View full size</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default FigureControls;

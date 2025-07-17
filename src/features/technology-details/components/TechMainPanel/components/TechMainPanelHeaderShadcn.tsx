import React from 'react';
import { ZoomOut, ZoomIn, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { InventionData } from '@/types/invention';
import { mapAiFieldToDisplayValue } from '../../../utils/technicalFieldMapping';

interface TechMainPanelHeaderShadcnProps {
  analyzedInvention: InventionData | null;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onAddDetails?: () => void;
}

// This component provides the header for the main technology details panel, using shadcn/ui components.
// It is designed to be visually consistent with previous versions.
export const TechMainPanelHeaderShadcn: React.FC<
  TechMainPanelHeaderShadcnProps
> = ({
  analyzedInvention,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onAddDetails,
}) => {
  return (
    <TooltipProvider>
      <div
        className={cn(
          'p-2 flex justify-between items-center gap-2',
          'bg-bg-panel-header rounded-t-md'
        )}
      >
        {/* Left side - Technical field badge */}
        <div className="flex items-center gap-2">
          {analyzedInvention?.technicalField &&
          typeof analyzedInvention.technicalField === 'string' ? (
            <Badge
              className={cn(
                'bg-blue-100 text-blue-800 border-blue-200 text-sm',
                'dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800',
                'hover:bg-blue-100 dark:hover:bg-blue-900'
              )}
            >
              {mapAiFieldToDisplayValue(analyzedInvention.technicalField)}
            </Badge>
          ) : null}
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-r-none border-r-0"
                  onClick={onZoomOut}
                  disabled={zoomLevel <= 70}
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom out (show more content)</p>
              </TooltipContent>
            </Tooltip>

            <Button
              variant="outline"
              size="sm"
              className={cn(
                'h-8 px-3 rounded-none border-l-0 border-r-0',
                'hover:bg-bg-hover'
              )}
              onClick={onResetZoom}
            >
              {zoomLevel}%
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-l-none border-l-0"
                  onClick={onZoomIn}
                  disabled={zoomLevel >= 150}
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom in (larger text)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {onAddDetails && (
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'h-8 gap-1.5',
                'text-blue-600 border-blue-200 hover:bg-blue-50',
                'dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950'
              )}
              onClick={onAddDetails}
            >
              <Upload className="h-3.5 w-3.5" />
              Add Details
            </Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default TechMainPanelHeaderShadcn;

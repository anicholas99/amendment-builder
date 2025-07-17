import React from 'react';
import { RiLayoutColumnLine, RiLayoutLeftLine } from 'react-icons/ri';
import { useLayout } from '@/contexts/LayoutContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/**
 * Toggle button for switching between normal and productivity layout modes
 * Normal mode: Projects | Content | Figures
 * Productivity mode: Figures | Content | Chat
 */
export const ProductivityModeToggle: React.FC = () => {
  const { isProductivityMode, toggleProductivityMode } = useLayout();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleProductivityMode}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center',
              'text-muted-foreground hover:text-foreground hover:bg-accent/50',
              'transition-all duration-200 cursor-pointer'
            )}
            aria-label="Toggle productivity mode"
          >
            {isProductivityMode ? (
              <RiLayoutColumnLine className="w-4.5 h-4.5" />
            ) : (
              <RiLayoutLeftLine className="w-4.5 h-4.5" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isProductivityMode ? 'Normal layout' : 'Productivity layout'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ProductivityModeToggle;

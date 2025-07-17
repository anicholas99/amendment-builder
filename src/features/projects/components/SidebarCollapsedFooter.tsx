import React from 'react';
import { FiList } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SidebarCollapsedFooterProps {
  navigateToProjects: () => void;
  isDarkMode?: boolean;
}

/**
 * A minimal footer for the collapsed sidebar – shows a single icon that
 * navigates to the projects dashboard. We deliberately keep it subtle to
 * avoid visual noise while still offering quick access.
 */
const SidebarCollapsedFooter: React.FC<SidebarCollapsedFooterProps> = ({
  navigateToProjects,
  isDarkMode = false,
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-2 bg-background border-t border-border flex items-center justify-center z-[1]">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              aria-label="View Dashboard"
              onClick={navigateToProjects}
              className={cn(
                'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <FiList className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>View Dashboard</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default SidebarCollapsedFooter;

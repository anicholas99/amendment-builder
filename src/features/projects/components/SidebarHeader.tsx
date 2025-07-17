import React from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface SidebarHeaderProps {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  toggleSidebarVisibility: () => void;
  onOpenModal: () => void;
  onManageProjects: () => void;
  projectCount: number;
  isDarkMode?: boolean;
  isPreloading: boolean;
}

/**
 * SidebarHeader component that displays controls for the sidebar
 * Shows project count and buttons for creating and managing projects
 */
const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  isSidebarCollapsed,
  toggleSidebar,
  toggleSidebarVisibility,
  onOpenModal: _onOpenModal,
  onManageProjects: _onManageProjects,
  projectCount,
  isDarkMode = false,
  isPreloading: _isPreloading,
}) => {
  return (
    <div
      className={cn(
        'flex items-center h-12 border-b bg-background border-border relative z-[1]',
        isSidebarCollapsed ? 'px-1' : 'px-4'
      )}
    >
      {!isSidebarCollapsed && (
        <div className="pl-2">
          <div className="flex items-baseline space-x-1">
            <span className="text-sm font-semibold text-foreground leading-tight">
              Projects
            </span>
            <span className="text-xs text-muted-foreground leading-tight">
              ({projectCount})
            </span>
          </div>
        </div>
      )}

      <div className="flex-1" />

      <TooltipProvider>
        <div className="flex items-center space-x-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Hide sidebar completely"
                onClick={toggleSidebarVisibility}
                className={cn(
                  'min-w-6 h-6 p-0 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors duration-150'
                )}
              >
                <FiChevronsLeft className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isSidebarCollapsed ? 'right' : 'bottom'}>
              <p>Hide sidebar</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label={
                  isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
                }
                onClick={toggleSidebar}
                className={cn(
                  'min-w-6 h-6 p-0 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors duration-150'
                )}
              >
                {isSidebarCollapsed ? (
                  <FiChevronRight className="w-3 h-3" />
                ) : (
                  <FiChevronLeft className="w-3 h-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isSidebarCollapsed ? 'right' : 'bottom'}>
              <p>
                {isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default SidebarHeader;

import React, { useCallback } from 'react';
import { FiList } from 'react-icons/fi';
import { useThemeContext } from '../../../contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarFooterProps {
  navigateToProjects: () => void;
  isDarkMode?: boolean;
}

/**
 * Footer component for the sidebar with useful controls
 */
const SidebarFooter: React.FC<SidebarFooterProps> = React.memo(
  ({ navigateToProjects, isDarkMode = false }) => {
    const { isDarkMode: darkModeFromContext } = useThemeContext();
    // Use prop if provided, otherwise use context
    const isInDarkMode =
      isDarkMode !== undefined ? isDarkMode : darkModeFromContext;

    return (
      <div className="p-3 border-t border-border bg-background relative z-[1] shadow-lg">
        {/* View all projects button */}
        <div
          onClick={navigateToProjects}
          className={cn(
            'rounded-md px-3 py-2 cursor-pointer border transition-all duration-150 ease-out hover:transform hover:-translate-y-px',
            isInDarkMode
              ? 'bg-white/5 border-white/10 hover:bg-white/10'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          )}
        >
          <div className="flex items-center justify-center">
            <FiList
              className={cn(
                'mr-2 transition-colors duration-150',
                isInDarkMode ? 'text-blue-300' : 'text-blue-600'
              )}
            />
            <span
              className={cn(
                'text-sm font-normal transition-colors duration-150',
                isInDarkMode ? 'text-white' : 'text-gray-700'
              )}
            >
              View Dashboard
            </span>
          </div>
        </div>
      </div>
    );
  }
);

SidebarFooter.displayName = 'SidebarFooter';

export default SidebarFooter;

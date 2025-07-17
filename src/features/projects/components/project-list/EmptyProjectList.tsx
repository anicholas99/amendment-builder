import React from 'react';
import { cn } from '@/lib/utils';
import { useThemeContext } from '../../../../contexts/ThemeContext';

export const EmptyProjectList: React.FC = () => {
  const { isDarkMode } = useThemeContext();

  return (
    <div
      className={cn(
        'p-4 text-center',
        isDarkMode ? 'text-white' : 'text-gray-500'
      )}
    >
      <p>No projects found.</p>
      <p className="text-sm mt-2">
        Create a new project using the + button above.
      </p>
    </div>
  );
};

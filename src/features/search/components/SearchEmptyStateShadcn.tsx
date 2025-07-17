import React from 'react';
import { cn } from '@/lib/utils';
import { FiSearch } from 'react-icons/fi';
import { useThemeContext } from '@/contexts/ThemeContext';

export const SearchEmptyStateShadcn: React.FC = () => {
  const { isDarkMode } = useThemeContext();

  return (
    <div
      className={cn(
        'h-full flex flex-col items-center justify-center p-6',
        'min-h-[300px]' // Ensure minimum height for visual consistency
      )}
    >
      <FiSearch
        className={cn(
          'w-16 h-16 mb-4',
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        )}
      />
      <h2
        className={cn(
          'text-lg font-semibold mb-2',
          isDarkMode ? 'text-gray-100' : 'text-gray-900'
        )}
      >
        No search history yet
      </h2>
      <p
        className={cn(
          'text-sm text-center max-w-[300px] leading-relaxed',
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        )}
      >
        Run a search to find patents related to your invention claims
      </p>
    </div>
  );
};

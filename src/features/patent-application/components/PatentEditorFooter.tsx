import React from 'react';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';

interface PatentEditorFooterProps {
  wordCount: number;
  characterCount: number;
}

export const PatentEditorFooter: React.FC<PatentEditorFooterProps> = ({
  wordCount,
  characterCount,
}) => {
  const { isDarkMode } = useThemeContext();

  return (
    <div
      className={cn(
        'p-2 flex justify-end items-center text-sm border-t',
        isDarkMode
          ? 'bg-gray-900 text-gray-400 border-gray-700'
          : 'bg-white text-gray-600 border-gray-200'
      )}
    >
      <div className="flex items-center gap-4">
        <span>
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </span>
        <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
          •
        </span>
        <span>
          {characterCount} {characterCount === 1 ? 'character' : 'characters'}
        </span>
      </div>
    </div>
  );
};

import React from 'react';
import { diffLines } from 'diff';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';

interface DiffViewerProps {
  oldContent: string;
  newContent: string;
  viewType?: 'unified' | 'split';
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  oldContent,
  newContent,
  viewType = 'unified',
}) => {
  const { isDarkMode } = useThemeContext();

  const addedBg = isDarkMode ? 'bg-green-900/20' : 'bg-green-50';
  const addedBorder = isDarkMode ? 'border-green-700' : 'border-green-200';
  const removedBg = isDarkMode ? 'bg-red-900/20' : 'bg-red-50';
  const removedBorder = isDarkMode ? 'border-red-700' : 'border-red-200';
  const contextBg = isDarkMode ? 'bg-gray-800' : 'bg-gray-50';
  const contextBorder = isDarkMode ? 'border-gray-600' : 'border-gray-200';

  // Calculate the diff
  const changes = diffLines(oldContent || '', newContent || '');

  // For unified view
  if (viewType === 'unified') {
    return (
      <div className="flex flex-col text-sm font-mono">
        {changes.map((change, index) => {
          if (change.added) {
            return (
              <div
                key={index}
                className={cn('px-3 py-1 border-l-[3px]', addedBg, addedBorder)}
              >
                <span
                  className={isDarkMode ? 'text-green-300' : 'text-green-700'}
                >
                  + {change.value.trim()}
                </span>
              </div>
            );
          } else if (change.removed) {
            return (
              <div
                key={index}
                className={cn(
                  'px-3 py-1 border-l-[3px]',
                  removedBg,
                  removedBorder
                )}
              >
                <span className={isDarkMode ? 'text-red-300' : 'text-red-700'}>
                  - {change.value.trim()}
                </span>
              </div>
            );
          } else {
            // Context lines - only show first and last few lines
            const lines = change.value.split('\n').filter(l => l.trim());
            if (lines.length > 6) {
              return (
                <div key={index} className="flex flex-col">
                  {lines.slice(0, 2).map((line, i) => (
                    <div
                      key={`${index}-start-${i}`}
                      className={cn(
                        'px-3 py-1 border-l-[3px]',
                        contextBg,
                        contextBorder
                      )}
                    >
                      <span
                        className={
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }
                      >
                        {line}
                      </span>
                    </div>
                  ))}
                  <div
                    className={cn(
                      'px-3 py-1 border-l-[3px]',
                      contextBg,
                      contextBorder
                    )}
                  >
                    <span className="text-gray-500 text-xs">
                      ... ({lines.length - 4} lines omitted) ...
                    </span>
                  </div>
                  {lines.slice(-2).map((line, i) => (
                    <div
                      key={`${index}-end-${i}`}
                      className={cn(
                        'px-3 py-1 border-l-[3px]',
                        contextBg,
                        contextBorder
                      )}
                    >
                      <span
                        className={
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }
                      >
                        {line}
                      </span>
                    </div>
                  ))}
                </div>
              );
            } else {
              return lines.map((line, i) => (
                <div
                  key={`${index}-${i}`}
                  className={cn(
                    'px-3 py-1 border-l-[3px]',
                    contextBg,
                    contextBorder
                  )}
                >
                  <span
                    className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}
                  >
                    {line}
                  </span>
                </div>
              ));
            }
          }
        })}
      </div>
    );
  }

  // Split view (side-by-side) - simplified version
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <h3 className="font-semibold mb-2 text-sm">Current</h3>
        <div
          className={cn(
            'rounded-md p-3 text-sm font-mono max-h-[300px] overflow-y-auto',
            removedBg
          )}
        >
          <pre className="whitespace-pre-wrap">{oldContent || '(empty)'}</pre>
        </div>
      </div>
      <div className="flex-1">
        <h3 className="font-semibold mb-2 text-sm">Updated</h3>
        <div
          className={cn(
            'rounded-md p-3 text-sm font-mono max-h-[300px] overflow-y-auto',
            addedBg
          )}
        >
          <pre className="whitespace-pre-wrap">{newContent || '(empty)'}</pre>
        </div>
      </div>
    </div>
  );
};

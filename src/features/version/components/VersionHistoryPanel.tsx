import React, { useState, useEffect } from 'react';
import { logger } from '@/utils/clientLogger';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useThemeContext } from '@/contexts/ThemeContext';
// Update import path for InventionData
import { InventionData } from '../../../types/invention';
import { formatDistanceToNow } from 'date-fns';

interface VersionHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  versionHistory: InventionData[];
  currentVersionIndex: number;
  onRestoreVersion: (index: number) => void;
}

const getVersionChanges = (
  prev: InventionData | null,
  current: InventionData
): string => {
  if (!prev) return 'Initial version';

  const changes = [];

  // Check for changes in various fields
  if (prev.title !== current.title) changes.push('title');
  if (prev.summary !== current.summary) changes.push('summary');
  if (JSON.stringify(prev.claims) !== JSON.stringify(current.claims))
    changes.push('claims');
  if (JSON.stringify(prev.features) !== JSON.stringify(current.features))
    changes.push('features');
  if (JSON.stringify(prev.figures) !== JSON.stringify(current.figures))
    changes.push('figures');
  if (
    JSON.stringify(prev.technical_implementation) !==
    JSON.stringify(current.technical_implementation)
  )
    changes.push('technical implementation');
  if (JSON.stringify(prev.background) !== JSON.stringify(current.background))
    changes.push('background');
  if (JSON.stringify(prev.prior_art) !== JSON.stringify(current.prior_art))
    changes.push('prior art');
  if (JSON.stringify(prev.use_cases) !== JSON.stringify(current.use_cases))
    changes.push('use cases');

  if (changes.length === 0) return 'No changes';

  return `Changed: ${changes.join(', ')}`;
};

const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({
  isOpen,
  onClose,
  versionHistory,
  currentVersionIndex,
  onRestoreVersion,
}) => {
  const { isDarkMode } = useThemeContext();

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'absolute top-[60px] right-[20px] w-[350px] max-h-[60vh] overflow-y-auto rounded-md shadow-lg z-[1000] border',
        isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
      )}
    >
      <div
        className={cn(
          'p-4 border-b',
          isDarkMode
            ? 'bg-gray-700 border-gray-600'
            : 'bg-gray-50 border-gray-200'
        )}
      >
        <div className="flex justify-between items-center">
          <span className="font-bold">Version History</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close panel</span>
          </Button>
        </div>
      </div>

      {versionHistory.length === 0 ? (
        <div className="p-4 text-center">
          <span className={cn(isDarkMode ? 'text-gray-400' : 'text-gray-500')}>
            No version history available
          </span>
        </div>
      ) : (
        <div className="divide-y">
          {versionHistory.map((version, index) => {
            const prevVersion = index > 0 ? versionHistory[index - 1] : null;
            const changes = getVersionChanges(prevVersion, version);
            const isCurrentVersion = currentVersionIndex === index;

            return (
              <div
                key={index}
                className={cn(
                  'p-4 cursor-pointer transition-colors',
                  isCurrentVersion
                    ? isDarkMode
                      ? 'bg-blue-900/50'
                      : 'bg-blue-50'
                    : isDarkMode
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-50'
                )}
                onClick={() => onRestoreVersion(index)}
              >
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Version {index + 1}</span>
                  <span
                    className={cn(
                      'text-sm',
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    )}
                  >
                    {index === versionHistory.length - 1 ? 'Current' : ''}
                  </span>
                </div>
                <div
                  className={cn(
                    'text-sm truncate',
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  )}
                >
                  {changes}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VersionHistoryPanel;

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useThemeContext } from '@/contexts/ThemeContext';

// Define the PatentVersion interface
export interface PatentVersion {
  timestamp: string;
  content: string;
  description: string;
}

interface PatentVersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: PatentVersion[];
  onRevertToVersion: (version: PatentVersion) => void;
}

const PatentVersionHistoryModal: React.FC<PatentVersionHistoryModalProps> = ({
  isOpen,
  onClose,
  versions,
  onRevertToVersion,
}) => {
  const { isDarkMode } = useThemeContext();

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Version History
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {versions.length === 0 ? (
            <div
              className={cn(
                'text-center py-4',
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              )}
            >
              No versions saved yet
            </div>
          ) : (
            versions.map(version => (
              <div
                key={version.timestamp}
                className={cn(
                  'p-4 border rounded-md',
                  isDarkMode
                    ? 'border-gray-600 bg-gray-800'
                    : 'border-gray-200 bg-white'
                )}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{version.description}</span>
                  <span
                    className={cn(
                      'text-sm',
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    )}
                  >
                    {new Date(version.timestamp).toLocaleString()}
                  </span>
                </div>
                <p
                  className={cn(
                    'line-clamp-2 mb-3',
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  )}
                >
                  {version.content.substring(0, 150)}...
                </p>
                <Button
                  size="sm"
                  onClick={() => onRevertToVersion(version)}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Restore This Version
                </Button>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PatentVersionHistoryModal;

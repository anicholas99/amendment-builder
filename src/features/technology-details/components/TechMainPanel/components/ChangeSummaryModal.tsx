import React from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FiZap, FiEdit2 } from 'react-icons/fi';
import { useThemeContext } from '@/contexts/ThemeContext';

// Define the UpdatedSection type locally since it was removed from useUpdateDetails
export type UpdatedSection = {
  section: string;
  type: 'added' | 'modified' | 'unchanged';
  count?: number;
};

interface ChangeSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  updatedSections?: UpdatedSection[];
  getFontSize: (baseSize: string) => string;
}

/**
 * Modal for displaying a summary of changes after adding additional details
 */
export const ChangeSummaryModal: React.FC<ChangeSummaryModalProps> = ({
  isOpen,
  onClose,
  updatedSections = [], // Provide default empty array
  getFontSize,
}) => {
  const { isDarkMode } = useThemeContext();

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-semibold">
            <FiZap className="mr-2 h-5 w-5 text-green-500" />
            Review Updated Sections
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p
            className={cn(
              'text-base',
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            )}
          >
            The following sections have been updated based on the details you
            provided. Please review the changes.
          </p>

          <div
            className={cn(
              'border rounded-md max-h-[350px] overflow-y-auto',
              isDarkMode
                ? 'border-gray-700 bg-gray-800/50'
                : 'border-gray-200 bg-gray-50'
            )}
          >
            {updatedSections.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {updatedSections.map((section, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'p-4 flex items-center justify-between',
                      isDarkMode ? 'bg-gray-800' : 'bg-white'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <FiEdit2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className={cn('font-normal', getFontSize('sm'))}>
                        {section.section}
                      </span>
                    </div>
                    {section.count !== undefined && section.count > 0 && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-xs px-2 py-1',
                          isDarkMode
                            ? 'bg-blue-900/50 text-blue-200 border-blue-800'
                            : 'bg-blue-50 text-blue-600 border-blue-200'
                        )}
                      >
                        +{section.count}{' '}
                        {section.count === 1 ? 'ITEM' : 'ITEMS'}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p
                  className={cn(isDarkMode ? 'text-gray-400' : 'text-gray-500')}
                >
                  No sections were updated
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 pt-2 flex justify-center">
            <Badge
              variant="secondary"
              className={cn(
                'py-1 px-4 rounded-full text-sm font-medium',
                isDarkMode
                  ? 'bg-green-700/50 text-green-200 border-green-600'
                  : 'bg-green-100 text-green-700 border-green-200'
              )}
            >
              {updatedSections.length} SECTIONS UPDATED
            </Badge>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Accept Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeSummaryModal;

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';

interface SuggestionApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim1Text: string; // The current full text of Claim 1
  elementText: string; // The specific text phrase identified for replacement
  newLanguage: string; // The suggested replacement language
  onConfirmApply: (newClaimText: string) => void; // Callback with the modified claim text
}

/**
 * Modal to preview and confirm applying an AI suggestion to Claim 1.
 */
const SuggestionApplyModal: React.FC<SuggestionApplyModalProps> = ({
  isOpen,
  onClose,
  claim1Text,
  elementText,
  newLanguage,
  onConfirmApply,
}) => {
  const { isDarkMode } = useThemeContext();

  // Simple highlighting function
  const renderHighlightedClaim = () => {
    if (!claim1Text || !elementText) {
      return <span>{claim1Text || 'Claim text unavailable.'}</span>;
    }

    const parts = claim1Text.split(elementText);

    return (
      <span>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <span
                className={cn(
                  'px-1 mx-0.5 rounded-sm',
                  isDarkMode ? 'bg-yellow-800' : 'bg-yellow-100'
                )}
              >
                {elementText}
              </span>
            )}
          </React.Fragment>
        ))}
      </span>
    );
  };

  const handleConfirm = () => {
    // Basic replacement - assumes first occurrence. Could be made more robust.
    const newClaimText = claim1Text.replace(elementText, newLanguage);
    onConfirmApply(newClaimText);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply Suggestion to Claim 1</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="font-bold mb-1">Original Claim 1:</p>
            <div
              className={cn(
                'p-4 border rounded-md',
                isDarkMode
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-gray-50 border-gray-200'
              )}
            >
              {renderHighlightedClaim()}
            </div>
          </div>
          <div>
            <p className="font-bold mb-1">Suggested Change:</p>
            <p className="mb-1">
              Replace highlighted text (
              <code className="text-sm px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                {elementText}
              </code>
              ) with:
            </p>
            <div
              className={cn(
                'p-4 border rounded-md',
                isDarkMode
                  ? 'bg-blue-900/20 border-blue-700'
                  : 'bg-blue-50 border-blue-200'
              )}
            >
              <p className={isDarkMode ? 'text-blue-200' : 'text-blue-700'}>
                {newLanguage}
              </p>
            </div>
          </div>
          <div>
            <p className="font-bold mb-1">Resulting Claim 1:</p>
            <div
              className={cn(
                'p-4 border rounded-md opacity-80',
                isDarkMode
                  ? 'bg-green-900/20 border-green-700'
                  : 'bg-green-50 border-green-200'
              )}
            >
              {/* Show preview of the result */}
              <span>
                {claim1Text.split(elementText).map((part, index) => (
                  <React.Fragment key={index}>
                    {part}
                    {index < claim1Text.split(elementText).length - 1 && (
                      <span
                        className={cn(
                          'font-bold',
                          isDarkMode ? 'text-green-200' : 'text-green-700'
                        )}
                      >
                        {newLanguage}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleConfirm}>Confirm Apply</Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuggestionApplyModal;

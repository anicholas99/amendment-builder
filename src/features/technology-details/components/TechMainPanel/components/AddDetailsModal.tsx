import React from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FiInfo, FiPlus } from 'react-icons/fi';
import { useThemeContext } from '@/contexts/ThemeContext';

interface AddDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  additionalDetails: string;
  setAdditionalDetails: (details: string) => void;
  handleAddDetails: () => void;
  isProcessing: boolean;
  processingProgress: number;
}

/**
 * Modal for adding additional details to the invention
 */
export const AddDetailsModal: React.FC<AddDetailsModalProps> = ({
  isOpen,
  onClose,
  additionalDetails,
  setAdditionalDetails,
  handleAddDetails,
  isProcessing,
  processingProgress,
}) => {
  const { isDarkMode } = useThemeContext();

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add Additional Technology Details
          </DialogTitle>
          <DialogDescription
            className={cn(
              'text-base',
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            )}
          >
            Describe any additional details about your invention. Our AI will
            automatically integrate this information into the appropriate
            sections.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="additional-details" className="text-sm font-medium">
              Details <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="additional-details"
              value={additionalDetails}
              onChange={e => setAdditionalDetails(e.target.value)}
              placeholder="Describe additional technical details, use cases, advantages, or any other aspects of your invention..."
              className="min-h-[200px] resize-y"
            />
          </div>

          <div
            className={cn(
              'p-4 rounded-md border',
              isDarkMode
                ? 'bg-blue-900/50 border-blue-800 text-blue-200'
                : 'bg-blue-50 border-blue-200 text-blue-600'
            )}
          >
            <div className="flex items-start space-x-2 text-sm">
              <FiInfo
                className={cn(
                  'h-4 w-4 mt-0.5 flex-shrink-0',
                  isDarkMode ? 'text-blue-400' : 'text-blue-500'
                )}
              />
              <span>
                Details will be automatically categorized and merged with your
                existing information.
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleAddDetails}
            disabled={isProcessing || !additionalDetails.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isProcessing
              ? `Processing... ${processingProgress}%`
              : 'Process Details'}
          </Button>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddDetailsModal;

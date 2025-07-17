import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface ReferenceOption {
  referenceNumber: string;
  title?: string;
  applicant?: string;
}

interface CombinedAnalysisSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  references: ReferenceOption[];
  onRunAnalysis: (selected: string[]) => void;
}

const CombinedAnalysisSelectionModal: React.FC<
  CombinedAnalysisSelectionModalProps
> = ({ isOpen, onClose, references, onRunAnalysis }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const { isDarkMode } = useThemeContext();

  const handleToggle = (refNum: string) => {
    setSelected(prev =>
      prev.includes(refNum) ? prev.filter(r => r !== refNum) : [...prev, refNum]
    );
  };

  const handleRun = () => {
    onRunAnalysis(selected);
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="min-w-[350px] max-w-[95vw] max-h-[90vh] overflow-hidden">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-lg font-bold">
            Select References for Combined Analysis
          </DialogTitle>
          <p
            className={cn(
              'text-sm mt-2',
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            )}
          >
            Select 2 or more references with deep analysis:
          </p>
        </DialogHeader>

        <div className="py-4">
          <div className="max-h-[40vh] overflow-y-auto space-y-2">
            {references.length === 0 ? (
              <p className={cn(isDarkMode ? 'text-gray-500' : 'text-gray-400')}>
                No references available.
              </p>
            ) : (
              references.map(ref => (
                <div
                  key={ref.referenceNumber}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={ref.referenceNumber}
                    checked={selected.includes(ref.referenceNumber)}
                    onCheckedChange={() => handleToggle(ref.referenceNumber)}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={ref.referenceNumber}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer block"
                    >
                      {ref.referenceNumber.replace(/-/g, '')}
                    </label>
                    {ref.title && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {ref.title}
                      </p>
                    )}
                    {ref.applicant && (
                      <p className="text-xs text-gray-500 mt-1">
                        Applicant: {ref.applicant}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="border-t pt-3 gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleRun}
            disabled={selected.length < 2}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Run Analysis
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CombinedAnalysisSelectionModal;

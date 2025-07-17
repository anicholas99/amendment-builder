import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FigureOption {
  label: string;
  value: string;
  isVariant: boolean;
  baseNumber: number;
  variant: string;
}

interface AddFigureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  options: FigureOption[];
  onAddFigure: (figureNumber: string) => void;
}

/**
 * A modal dialog for adding new figures with a better UX for figure numbering
 */
const AddFigureDialog: React.FC<AddFigureDialogProps> = ({
  isOpen,
  onClose,
  options,
  onAddFigure,
}) => {
  const [activeTab, setActiveTab] = useState('quick-select');
  const [customFigureNumber, setCustomFigureNumber] = useState('');

  // Group options by main figures and variants
  const mainFigures = options.filter(opt => !opt.isVariant);
  const variantGroups: Record<number, FigureOption[]> = {};

  options
    .filter(opt => opt.isVariant)
    .forEach(variant => {
      if (!variantGroups[variant.baseNumber]) {
        variantGroups[variant.baseNumber] = [];
      }
      variantGroups[variant.baseNumber].push(variant);
    });

  // Handle clicking on a suggested option
  const handleOptionClick = (option: FigureOption) => {
    onAddFigure(option.value);
    onClose();
  };

  // Handle custom figure number entry
  const handleCustomSubmit = () => {
    if (!customFigureNumber.trim()) {
      toast({
        title: 'Empty figure number',
        description: 'Please enter a figure number',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    // Basic validation for format
    const isValidFormat = /^\d+[A-Za-z]*$/i.test(customFigureNumber.trim());
    if (!isValidFormat) {
      toast({
        title: 'Invalid format',
        description: 'Figure number must be in format "1", "1A", etc.',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    onAddFigure(customFigureNumber.trim());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="min-w-[90%] md:min-w-[600px] max-w-[800px] rounded-lg">
        <DialogHeader className="border-b border-border">
          <DialogTitle>Add New Figure</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Custom Tabs Implementation */}
          <div className="w-full">
            <div className="flex w-full rounded-lg bg-accent p-1">
              <button
                className={cn(
                  'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all',
                  activeTab === 'quick-select'
                    ? 'bg-white dark:bg-gray-700 text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => setActiveTab('quick-select')}
              >
                Quick Select
              </button>
              <button
                className={cn(
                  'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all',
                  activeTab === 'custom-number'
                    ? 'bg-white dark:bg-gray-700 text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => setActiveTab('custom-number')}
              >
                Custom Number
              </button>
            </div>

            {/* Tab Content */}
            <div className="mt-4">
              {activeTab === 'quick-select' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3 text-blue-600 dark:text-blue-400">
                      Next Figure
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {mainFigures.map(option => (
                        <Button
                          key={option.value}
                          variant="outline"
                          onClick={() => handleOptionClick(option)}
                          className="h-15 w-full border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {Object.keys(variantGroups).length > 0 && (
                    <div className="w-full bg-muted p-4 rounded-md">
                      <h3 className="font-semibold mb-3 text-purple-600 dark:text-purple-400">
                        Variant Options
                      </h3>
                      <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {Object.entries(variantGroups).map(
                          ([baseNumber, variants], index, array) => (
                            <div
                              key={baseNumber}
                              className={cn(
                                'mb-4 pb-3',
                                index < array.length - 1 &&
                                  'border-b border-border'
                              )}
                            >
                              <div className="text-sm mb-2 font-medium text-gray-700 dark:text-gray-300">
                                FIG. {baseNumber} Variants
                              </div>
                              <div className="grid grid-cols-5 gap-2">
                                {variants.map(variant => (
                                  <Button
                                    key={variant.value}
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOptionClick(variant)}
                                    className="py-1 h-auto border-purple-600 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/20"
                                  >
                                    {variant.label.replace(/FIG\.\s*/i, '')}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'custom-number' && (
                <div className="space-y-4">
                  <div>
                    <label className="font-semibold text-sm text-foreground">
                      Custom Figure Number
                    </label>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="font-semibold text-lg text-gray-700 dark:text-gray-300">
                        FIG.
                      </span>
                      <Input
                        value={customFigureNumber}
                        onChange={e => setCustomFigureNumber(e.target.value)}
                        placeholder="1"
                        className="w-30"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            handleCustomSubmit();
                          }
                        }}
                      />
                      <Button
                        onClick={handleCustomSubmit}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Add
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Enter a figure number like "1", "2A", or "3B". The prefix
                      "FIG." will be added automatically.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddFigureDialog;

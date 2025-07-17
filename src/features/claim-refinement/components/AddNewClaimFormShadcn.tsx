import React, { useCallback, useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { FiX, FiCheck, FiInfo } from 'react-icons/fi';
import { useDebouncedCallback } from 'use-debounce';
import { useThemeContext } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface AddNewClaimFormShadcnProps {
  newClaimText: string;
  setNewClaimText: (text: string) => void;
  newClaimDependsOn: string;
  setNewClaimDependsOn: (claimNumber: string) => void;
  onCancel: () => void;
  onAddClaim: () => void;
  isSubmitting?: boolean;
  cooldownRemaining?: number;
}

/**
 * Enhanced form component for adding a new claim with improved UX - ShadCN/Tailwind version
 */
const AddNewClaimFormShadcn: React.FC<AddNewClaimFormShadcnProps> = ({
  newClaimText,
  setNewClaimText,
  newClaimDependsOn,
  setNewClaimDependsOn,
  onCancel,
  onAddClaim,
  isSubmitting = false,
  cooldownRemaining,
}) => {
  const { isDarkMode } = useThemeContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localText, setLocalText] = useState(newClaimText);
  const [charCount, setCharCount] = useState(newClaimText.length);

  // Debounced update to parent state (reduces re-renders)
  const debouncedSetText = useDebouncedCallback((text: string) => {
    setNewClaimText(text);
  }, 300);

  // Handle text change with local state for immediate feedback
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      setLocalText(text);
      setCharCount(text.length);
      debouncedSetText(text);

      // Auto-resize textarea efficiently
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 400)}px`;
      }
    },
    [debouncedSetText]
  );

  // Focus textarea on mount with slight delay for animation
  useEffect(() => {
    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && localText.trim()) {
        e.preventDefault();
        onAddClaim();
      }
      // Escape to cancel
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [localText, onAddClaim, onCancel]);

  return (
    <div className="animate-in slide-in-from-top-5 duration-300">
      <div
        id="add-claim-form"
        className={cn(
          'border-2 border-blue-500 rounded-lg mb-4 shadow-lg overflow-hidden',
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        )}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3
              className={cn(
                'text-lg font-bold',
                isDarkMode ? 'text-gray-100' : 'text-gray-900'
              )}
            >
              Add New Claim
            </h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="h-8 w-8 p-0"
                  >
                    <FiX className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Close form (Esc)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-4">
            {/* Claim Type Selection - Improved UI */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Claim Type</Label>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant={!newClaimDependsOn ? 'default' : 'outline'}
                  onClick={() => setNewClaimDependsOn('')}
                  disabled={isSubmitting}
                  className={cn(
                    'transition-[transform,box-shadow,background-color,border-color] duration-150',
                    !newClaimDependsOn &&
                      (isDarkMode
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-blue-600 hover:bg-blue-700'),
                    'hover:-translate-y-0.5 hover:shadow-sm'
                  )}
                >
                  Independent
                </Button>
                <Button
                  size="sm"
                  variant={newClaimDependsOn ? 'default' : 'outline'}
                  onClick={() => setNewClaimDependsOn('1')}
                  disabled={isSubmitting}
                  className={cn(
                    'transition-[transform,box-shadow,background-color,border-color] duration-150',
                    newClaimDependsOn &&
                      (isDarkMode
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-blue-600 hover:bg-blue-700'),
                    'hover:-translate-y-0.5 hover:shadow-sm'
                  )}
                >
                  Dependent
                </Button>
              </div>
            </div>

            {/* Dependency Selection - Animated */}
            <Collapsible open={!!newClaimDependsOn}>
              <CollapsibleContent className="space-y-2">
                <div className="space-y-2 animate-in slide-in-from-top-3 duration-200">
                  <Label className="text-sm font-medium">
                    Depends on Claim
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={newClaimDependsOn}
                      onChange={e => setNewClaimDependsOn(e.target.value)}
                      className="w-20"
                      type="number"
                      min="1"
                      placeholder="1"
                      disabled={isSubmitting}
                    />
                    <span
                      className={cn(
                        'text-sm',
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      )}
                    >
                      Enter the claim number this claim depends on
                    </span>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Claim Text Input - Enhanced */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Claim Text</Label>
              <Textarea
                ref={textareaRef}
                value={localText}
                onChange={handleTextChange}
                placeholder="Enter claim text..."
                className={cn(
                  'min-h-[150px] max-h-[400px] resize-none',
                  'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                )}
                disabled={isSubmitting}
                style={{
                  height: 'auto',
                  overflowY: 'auto',
                }}
              />
              <div className="flex justify-end">
                <span
                  className={cn(
                    'text-xs',
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  )}
                >
                  {charCount} characters
                </span>
              </div>
            </div>

            {/* Action Buttons - Enhanced */}
            <div className="flex justify-end items-center pt-2">
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={onAddClaim}
                  disabled={
                    !localText.trim() ||
                    isSubmitting ||
                    !!(cooldownRemaining && cooldownRemaining > 0)
                  }
                  className={cn(
                    'transition-[transform,box-shadow,background-color,border-color] duration-150',
                    'hover:-translate-y-0.5 hover:shadow-md'
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Adding...
                    </>
                  ) : cooldownRemaining && cooldownRemaining > 0 ? (
                    `Wait ${Math.ceil(cooldownRemaining / 1000)}s`
                  ) : (
                    <>
                      <FiCheck className="mr-2 h-4 w-4" />
                      Add Claim
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewClaimFormShadcn;

import React, { useState } from 'react';
import { FiSave } from 'react-icons/fi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/clientLogger';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SavePatentVersionButtonProps {
  onSaveVersion: (versionName: string) => Promise<void>;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  colorScheme?: string;
  isLoading?: boolean;
}

export const SavePatentVersionButton: React.FC<SavePatentVersionButtonProps> = ({
  onSaveVersion,
  disabled = false,
  size = 'sm',
  variant = 'outline',
  colorScheme = 'green',
  isLoading = false,
}) => {
  const { isDarkMode } = useThemeContext();
  const [isOpen, setIsOpen] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Check if button should be disabled
  const isDisabled = disabled || isLoading || isSaving;
  const disabledReason = disabled 
    ? 'Cannot save version at this time'
    : isLoading
      ? 'Patent application is loading...'
      : undefined;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      await onSaveVersion(versionName.trim() || '');

      logger.info('[SavePatentVersionButton] Version saved', {
        versionName: versionName.trim() || 'Untitled',
      });

      // Add a small delay to ensure cache updates propagate before closing
      setTimeout(() => {
        setIsOpen(false);
        setVersionName('');
        setIsSaving(false);
      }, 100);
    } catch (error) {
      setIsSaving(false);
      logger.error('[SavePatentVersionButton] Failed to save version', {
        error,
      });
    }
  };

  // Map colorScheme to appropriate button styles
  const getButtonClassName = () => {
    if (colorScheme === 'green' && variant === 'outline') {
      return cn(
        isDarkMode
          ? 'border-green-600 text-green-400 hover:bg-green-900'
          : 'border-green-500 text-green-600 hover:bg-green-50'
      );
    }
    return '';
  };

  const button = (
    <Button
      onClick={() => {
        setIsOpen(true);
      }}
      size={size}
      variant={variant}
      disabled={isDisabled}
      className={cn('h-8 px-2 flex items-center gap-2', getButtonClassName())}
    >
      {(isLoading || isSaving) ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <FiSave className="h-4 w-4" />
      )}
      Save Version
    </Button>
  );

  return (
    <>
      {disabledReason ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent>
              <p>{disabledReason}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        button
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Patent Version</DialogTitle>
            <DialogDescription>
              Save a snapshot of your current patent application
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="version-name">Version Name (optional)</Label>
              <Input
                id="version-name"
                value={versionName}
                onChange={e => setVersionName(e.target.value)}
                placeholder="e.g., Final draft before submission"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleSave();
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setIsOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                isDarkMode
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              )}
            >
              {isSaving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              ) : null}
              {isSaving ? 'Saving...' : 'Save Version'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}; 
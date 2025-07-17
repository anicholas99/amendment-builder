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
import { useCreateClaimVersion } from '@/hooks/api/useClaimVersions';
import { logger } from '@/utils/clientLogger';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SaveClaimVersionButtonProps {
  inventionId: string | undefined; // Changed to allow undefined
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  colorScheme?: string;
}

export const SaveClaimVersionButtonShadcn: React.FC<
  SaveClaimVersionButtonProps
> = ({
  inventionId,
  disabled = false,
  size = 'sm',
  variant = 'outline',
  colorScheme = 'blue',
}) => {
  const { isDarkMode } = useThemeContext();
  const [isOpen, setIsOpen] = useState(false);
  const [versionName, setVersionName] = useState('');
  const createVersionMutation = useCreateClaimVersion();

  // Check if button should be disabled
  const isDisabled =
    disabled || createVersionMutation.isPending || !inventionId;
  const disabledReason = !inventionId
    ? 'Invention data is loading...'
    : disabled
      ? 'Cannot save version at this time'
      : undefined;

  const handleSave = async () => {
    if (!inventionId) {
      toast({
        title: 'Error',
        description: 'No invention found to save version from',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    try {
      await createVersionMutation.mutateAsync({
        inventionId,
        name: versionName.trim() || undefined,
      });

      logger.info('[SaveClaimVersionButton] Version saved', {
        inventionId,
        versionName: versionName.trim() || 'Untitled',
      });

      // Add a small delay to ensure cache updates propagate before closing
      setTimeout(() => {
        setIsOpen(false);
        setVersionName('');
      }, 100); // Reduced from 200ms
    } catch (error) {
      logger.error('[SaveClaimVersionButton] Failed to save version', {
        error,
        inventionId,
      });
    }
  };

  // Map colorScheme to appropriate button styles
  const getButtonClassName = () => {
    if (colorScheme === 'blue' && variant === 'outline') {
      return cn(
        isDarkMode
          ? 'border-blue-600 text-blue-400 hover:bg-blue-900'
          : 'border-blue-500 text-blue-600 hover:bg-blue-50'
      );
    }
    return '';
  };

  const button = (
    <Button
      onClick={() => {
        // Add safeguard check before opening dialog
        if (!inventionId) {
          logger.error(
            '[SaveClaimVersionButton] Button clicked but no inventionId'
          );
          toast({
            title: 'Error',
            description: 'Please wait for invention data to load',
            variant: 'destructive',
            duration: 3000,
          });
          return;
        }
        setIsOpen(true);
      }}
      size={size}
      variant={variant}
      disabled={isDisabled}
      className={cn('h-8 px-2 flex items-center gap-2', getButtonClassName())}
    >
      {createVersionMutation.isPending ? (
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
            <DialogTitle>Save Claim Version</DialogTitle>
            <DialogDescription className="sr-only">
              Save a version of your current claims
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="version-name">Version Name (optional)</Label>
              <Input
                id="version-name"
                value={versionName}
                onChange={e => setVersionName(e.target.value)}
                placeholder="e.g., Before major restructure"
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
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={createVersionMutation.isPending}
              className={cn(
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              )}
            >
              {createVersionMutation.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Save Version'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

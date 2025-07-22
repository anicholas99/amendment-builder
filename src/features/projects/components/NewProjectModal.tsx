import React, {
  useState,
  useEffect,
  useCallback,
  startTransition,
} from 'react';
import { logger } from '@/utils/clientLogger';
import { useTimeout } from '@/hooks/useTimeout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/stack';
import { useToast } from '@/hooks/useToastWrapper';
import { FiPlus, FiCheck } from 'react-icons/fi';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleCreateProject: (name: string) => Promise<void>;
  // Optional props for external state management (for progressive migration)
  isCreating?: boolean;
  error?: string | null;
  isSuccess?: boolean;
}

/**
 * Standardized New Project Modal component used throughout the application
 * for creating new projects with a consistent user experience
 */
const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  handleCreateProject,
  // Support external state management for progressive migration
  isCreating: externalIsCreating,
  error: externalError,
  isSuccess: externalIsSuccess,
}) => {
  const [projectName, setProjectName] = useState('');
  // Use external state if provided, otherwise manage locally (for backward compatibility)
  const [localIsCreating, setLocalIsCreating] = useState(false);
  const [localIsSuccess, setLocalIsSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Use external state if provided, otherwise use local state
  const isCreating = externalIsCreating ?? localIsCreating;
  const isSuccess = externalIsSuccess ?? localIsSuccess;
  const error = externalError ?? localError;

  const toast = useToast();

  // Ref for the first input field for autofocus
  const initialRef = React.useRef<HTMLInputElement>(null);

  // Auto-close modal after success
  useTimeout(
    () => {
      if (externalIsSuccess === undefined) {
        setLocalIsSuccess(false);
      }
      onClose();
    },
    isSuccess ? 200 : null
  );

  // Memoize the input change handler
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setProjectName(e.target.value);
      // Clear error on typing (only if managing locally)
      if (externalError === undefined && localError) {
        setLocalError(null);
      }
    },
    [externalError, localError]
  );

  const handleSubmit = async () => {
    if (!projectName.trim()) {
      if (externalError === undefined) {
        setLocalError('Response name cannot be empty.');
      }
      return;
    }

    // Batch state updates to reduce render cycles
    startTransition(() => {
      // Only manage state locally if not provided externally
      if (externalIsCreating === undefined) {
        setLocalIsCreating(true);
      }
      if (externalError === undefined) {
        setLocalError(null);
      }
    });

    try {
      await handleCreateProject(projectName);

      // Show success state briefly before closing (only if managing locally)
      if (externalIsSuccess === undefined) {
        startTransition(() => {
          setLocalIsSuccess(true);
        });
      }
      setProjectName(''); // Reset form

      // Modal will auto-close via useTimeout hook
    } catch (err) {
      logger.error('Error creating project:', err);
      startTransition(() => {
        if (externalError === undefined) {
          setLocalError('Failed to create project. Please try again.');
        }
      });
      toast({
        title: 'Creation Failed',
        description: 'Could not create the project.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      startTransition(() => {
        if (externalIsCreating === undefined) {
          setLocalIsCreating(false);
        }
      });
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setProjectName('');
      // Only reset local state
      setLocalError(null);
      setLocalIsCreating(false);
      setLocalIsSuccess(false);
    }
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && initialRef.current) {
      setTimeout(() => {
        initialRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isSuccess ? 'Project Created!' : 'Create New Project'}
          </DialogTitle>
        </DialogHeader>

        <div className="pb-6">
          {isSuccess ? (
            <VStack spacing={4} align="center" className="py-4">
              <Box className="bg-green-100 dark:bg-green-900 rounded-full p-4 text-green-500">
                <FiCheck className="h-6 w-6" />
              </Box>
              <Text className="text-green-600 dark:text-green-400 font-medium">
                Amendment response "{projectName}" created successfully!
              </Text>
              <Text size="sm" className="text-muted-foreground">
                Opening amendment studio...
              </Text>
            </VStack>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Response Name</Label>
                <Input
                  id="project-name"
                  ref={initialRef}
                  placeholder="Enter response name (e.g., Response to OA #1)"
                  value={projectName}
                  onChange={handleInputChange}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !isCreating) {
                      handleSubmit();
                    }
                  }}
                />
                {error && (
                  <Text size="sm" className="text-destructive">
                    {error}
                  </Text>
                )}
              </div>
            </div>
          )}
        </div>

        {!isSuccess && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!projectName.trim() || isCreating}
              className="gap-2"
            >
              {isCreating ? (
                <>Creating...</>
              ) : (
                <>
                  <FiPlus className="h-4 w-4" />
                  Create Response
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewProjectModal;

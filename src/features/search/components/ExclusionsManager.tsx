import React, { useState, useMemo, useCallback } from 'react';
import { logger } from '@/utils/clientLogger';
import {
  FiX,
  FiTrash2,
  FiSearch,
  FiPlus,
  FiFile,
  FiCalendar,
  FiUser,
} from 'react-icons/fi';
import {
  usePatentExclusions,
  useAddPatentExclusion,
  useRemovePatentExclusion,
} from '@/hooks/api/usePatentExclusions';
import { ProjectExclusion } from '@/client/services/patent-exclusions.client-service';
import { FixedSizeList as List } from 'react-window';
import { useToast } from '@/hooks/useToastWrapper';

// shadcn/ui imports
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { VStack, HStack } from '@/components/ui/stack';
import { IconButton } from '@/components/ui/icon-button';
import { FormControl, FormLabel } from '@/components/ui/form';
import { Divider } from '@/components/ui/divider';

interface ExclusionsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onExclusionChange?: () => void;
}

// Memoized exclusion item component for better performance
const ExclusionItem = React.memo<{
  exclusion: ProjectExclusion;
  onRemove: (patentNumber: string) => void;
}>(({ exclusion, onRemove }) => (
  <div className="p-4 border-b border-border last:border-b-0">
    <div className="flex justify-between items-start">
      <VStack className="items-start space-y-1 flex-1">
        <HStack>
          <Badge variant="destructive" className="mr-2">
            EXCLUDED
          </Badge>
          <Text className="font-bold">{exclusion.patentNumber}</Text>
        </HStack>

        <HStack className="space-x-1 text-muted-foreground">
          <FiCalendar size={14} />
          <Text className="text-sm">
            Excluded on {new Date(exclusion.createdAt).toLocaleDateString()}
          </Text>
        </HStack>
      </VStack>

      <IconButton
        aria-label="Remove exclusion"
        size="sm"
        variant="ghost"
        onClick={() => onRemove(exclusion.patentNumber)}
        className="hover:bg-red-50 dark:hover:bg-red-900"
      >
        <FiTrash2 className="h-4 w-4 text-red-500" />
      </IconButton>
    </div>
  </div>
));

ExclusionItem.displayName = 'ExclusionItem';

const ExclusionsManager: React.FC<ExclusionsManagerProps> = ({
  isOpen,
  onClose,
  projectId,
  onExclusionChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newExclusion, setNewExclusion] = useState('');
  const toast = useToast();

  // Use the new, centralized React Query hook for fetching exclusions
  // Always fetch when projectId exists so optimistic updates work even when modal is closed
  const {
    data: exclusions = [],
    isLoading,
    error,
  } = usePatentExclusions(projectId, {
    enabled: !!projectId,
  });

  const { mutateAsync: addExclusionMutation } = useAddPatentExclusion();
  const { mutateAsync: removeExclusionMutation } = useRemovePatentExclusion();

  // Memoize filtered exclusions to prevent unnecessary recalculations
  const filteredExclusions = useMemo(() => {
    if (!searchTerm) return exclusions;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return exclusions.filter(item =>
      item.patentNumber.toLowerCase().includes(lowerSearchTerm)
    );
  }, [exclusions, searchTerm]);

  // Memoize callbacks to prevent unnecessary re-renders
  const handleRemoveExclusion = useCallback(
    async (patentNumber: string) => {
      try {
        await removeExclusionMutation({ projectId, patentNumber });
        toast({
          title: 'Exclusion removed',
          description: `Patent ${patentNumber} can now appear in search results.`,
          status: 'success',
        });
        if (onExclusionChange) onExclusionChange();
      } catch (err) {
        logger.error('Error removing exclusion:', err);
        toast({
          title: 'Error removing exclusion',
          description: 'There was an error removing the exclusion.',
          status: 'error',
        });
      }
    },
    [removeExclusionMutation, projectId, toast, onExclusionChange]
  );

  const handleAddExclusion = useCallback(async () => {
    if (!newExclusion.trim()) return;

    try {
      await addExclusionMutation({
        projectId,
        patentNumbers: [newExclusion],
        metadata: { source: 'ExclusionManagerUI' },
      });

      setNewExclusion('');

      toast({
        title: 'Exclusion added',
        description: `Patent ${newExclusion} will be excluded from search results.`,
        status: 'success',
      });
      if (onExclusionChange) onExclusionChange();
    } catch (err) {
      logger.error('Error adding exclusion:', err);
      toast({
        title: 'Error adding exclusion',
        description: 'There was an error adding the exclusion.',
        status: 'error',
      });
    }
  }, [addExclusionMutation, projectId, newExclusion, toast, onExclusionChange]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && newExclusion.trim()) {
        handleAddExclusion();
      }
    },
    [newExclusion, handleAddExclusion]
  );

  // Render function for virtual list items
  const renderExclusionRow = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const exclusion = filteredExclusions[index];
      return (
        <div style={style}>
          <ExclusionItem
            exclusion={exclusion}
            onRemove={handleRemoveExclusion}
          />
        </div>
      );
    },
    [filteredExclusions, handleRemoveExclusion]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="border-b border-border">
          <DialogTitle>Manage Patent Exclusions</DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-4">
          <FormControl>
            <FormLabel>Add Patent Number to Exclude</FormLabel>
            <HStack className="space-x-2">
              <Input
                value={newExclusion}
                onChange={e => setNewExclusion(e.target.value)}
                placeholder="e.g., US1234567B2"
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={handleAddExclusion}
                disabled={!newExclusion.trim()}
              >
                <HStack className="space-x-1">
                  <FiPlus className="h-4 w-4" />
                  <span>Add</span>
                </HStack>
              </Button>
            </HStack>
          </FormControl>

          {exclusions.length > 0 && (
            <FormControl>
              <FormLabel>Search Exclusions</FormLabel>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patent number..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </FormControl>
          )}

          <div>
            <Heading size="sm" className="mb-3">
              Current Exclusions{' '}
              {exclusions.length > 0 && `(${exclusions.length})`}
            </Heading>

            {isLoading ? (
              <Box className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <Text>Loading exclusions...</Text>
              </Box>
            ) : error ? (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  {error.message ||
                    'Failed to load exclusions. Please try again.'}
                </AlertDescription>
              </Alert>
            ) : filteredExclusions.length === 0 ? (
              <Box className="py-4 text-center bg-muted rounded-md">
                <Text className="text-muted-foreground">
                  {searchTerm
                    ? 'No matching exclusions found.'
                    : 'No exclusions added yet.'}
                </Text>
              </Box>
            ) : (
              <Box className="max-h-[300px] overflow-y-auto border border-border rounded-md">
                {/* Use virtual scrolling for large lists */}
                {filteredExclusions.length > 20 ? (
                  <List
                    height={300}
                    itemCount={filteredExclusions.length}
                    itemSize={80} // Approximate height of each exclusion item
                    width="100%"
                  >
                    {renderExclusionRow}
                  </List>
                ) : (
                  <div>
                    {filteredExclusions.map((exclusion, index) => (
                      <ExclusionItem
                        key={exclusion.patentNumber || index}
                        exclusion={exclusion}
                        onRemove={handleRemoveExclusion}
                      />
                    ))}
                  </div>
                )}
              </Box>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-border">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExclusionsManager;

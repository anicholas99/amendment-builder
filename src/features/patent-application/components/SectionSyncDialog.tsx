import React, { useState, useCallback, useMemo } from 'react';
import { FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import { useSectionChangePreview } from '@/hooks/api/useRegenerateSection';
import {
  DataChangeType,
  getAffectedSections,
  getSectionUpdateReason,
  SECTION_DEPENDENCIES,
} from '@/features/patent-application/utils/patent-sections/sectionDependencies';
import { DiffViewer } from './DiffViewer';
import { ClaimsSyncNotification } from './ClaimsSyncNotification';
import { LoadingState } from '@/components/common/LoadingState';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack, HStack } from '@/components/ui/stack';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface SectionSyncDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  changeTypes: DataChangeType[];
  onSync: () => void;
}

export const SectionSyncDialog: React.FC<SectionSyncDialogProps> = ({
  isOpen,
  onClose,
  projectId,
  changeTypes,
  onSync,
}) => {
  const toast = useToast();
  const { previewChanges, applySectionChanges, isLoading, error } =
    useSectionChangePreview(projectId);
  const [sectionDiffs, setSectionDiffs] = useState<any[]>([]);
  const [selectedSections, setSelectedSections] = useState<Set<string>>(
    new Set()
  );
  const [isApplying, setIsApplying] = useState(false);

  // Get affected sections based on change types
  const affectedSections = useMemo(
    () => getAffectedSections(changeTypes),
    [changeTypes]
  );

  // Load preview when dialog opens
  React.useEffect(() => {
    if (isOpen && affectedSections.length > 0) {
      loadPreview();
    }
  }, [isOpen, affectedSections]);

  const loadPreview = async () => {
    try {
      const result = await previewChanges(changeTypes);
      setSectionDiffs(result.sections);
      // Pre-select all changed sections
      const changed = new Set(
        result.sections.filter(s => s.hasChanged).map(s => s.section)
      );
      setSelectedSections(changed);
    } catch (err) {
      toast({
        title: 'Failed to load preview',
        description: err instanceof Error ? err.message : 'Unknown error',
        status: 'error',
      });
    }
  };

  const handleSectionToggle = (section: string) => {
    setSelectedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const handleApplyChanges = async () => {
    if (selectedSections.size === 0) {
      toast({
        title: 'No sections selected',
        description: 'Please select at least one section to update',
        status: 'warning',
      });
      return;
    }

    setIsApplying(true);
    try {
      await applySectionChanges(Array.from(selectedSections));

      toast({
        title: 'Sections updated successfully',
        description: `Updated ${selectedSections.size} section(s)`,
        status: 'success',
      });

      onSync(); // Notify parent to refresh
      onClose();
    } catch (err) {
      toast({
        title: 'Failed to apply changes',
        description: err instanceof Error ? err.message : 'Unknown error',
        status: 'error',
      });
    } finally {
      setIsApplying(false);
    }
  };

  const getChangeTypeDescription = (types: DataChangeType[]) => {
    const descriptions = types.map(type => {
      switch (type) {
        case 'figures':
          return 'Figures modified';
        case 'invention_details':
          return 'Invention details updated';
        case 'claims':
          return 'Claims changed';
        case 'prior_art':
          return 'Prior art updated';
        case 'title':
          return 'Title changed';
        default:
          return type;
      }
    });
    return descriptions.join(', ');
  };

  const getSectionTitle = (section: string) => {
    const config = SECTION_DEPENDENCIES.find(dep => dep.section === section);
    return config?.section.replace(/_/g, ' ') || section;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <VStack className="items-start space-y-2">
            <DialogTitle>Sync Patent Application Sections</DialogTitle>
            <Text className="text-sm text-muted-foreground font-normal">
              {getChangeTypeDescription(changeTypes)}
            </Text>
          </VStack>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <Box className="py-4">
              <LoadingState variant="spinner" message="Analyzing changes..." />
            </Box>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          ) : sectionDiffs.length === 0 ? (
            <Alert>
              <AlertDescription>
                No sections need updating based on the changes.
              </AlertDescription>
            </Alert>
          ) : (
            <VStack className="space-y-4 items-stretch">
              {/* Show claims status first if claims changed */}
              <ClaimsSyncNotification
                hasClaimsChanged={changeTypes.includes('claims')}
              />

              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-700">
                <Box>
                  <Text className="font-semibold">
                    {sectionDiffs.filter(s => s.hasChanged).length} section(s)
                    have changes
                  </Text>
                  <Text className="text-sm mt-1 text-muted-foreground">
                    Review the changes below and select which sections to
                    update.
                  </Text>
                </Box>
              </Alert>

              <Accordion
                type="multiple"
                defaultValue={sectionDiffs
                  .map((diff, idx) => (diff.hasChanged ? idx.toString() : ''))
                  .filter(Boolean)}
              >
                {sectionDiffs.map((diff, idx) => (
                  <AccordionItem key={diff.section} value={idx.toString()}>
                    <AccordionTrigger className="hover:no-underline">
                      <HStack className="flex-1 justify-between pr-4">
                        <HStack className="space-x-3">
                          <Checkbox
                            checked={selectedSections.has(diff.section)}
                            onCheckedChange={() =>
                              handleSectionToggle(diff.section)
                            }
                            disabled={!diff.hasChanged}
                            onClick={e => e.stopPropagation()}
                          />
                          <Text className="font-medium">
                            {getSectionTitle(diff.section)}
                          </Text>
                        </HStack>
                        <HStack className="space-x-2">
                          {diff.hasChanged ? (
                            <Badge
                              variant="secondary"
                              className="bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100"
                            >
                              <HStack className="space-x-1">
                                <FiAlertCircle className="h-3 w-3" />
                                <span>Has Changes</span>
                              </HStack>
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                            >
                              <HStack className="space-x-1">
                                <FiCheck className="h-3 w-3" />
                                <span>Up to Date</span>
                              </HStack>
                            </Badge>
                          )}
                        </HStack>
                      </HStack>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <VStack className="items-stretch space-y-3">
                        <Text className="text-sm text-muted-foreground">
                          {getSectionUpdateReason(diff.section, changeTypes)}
                        </Text>

                        {diff.hasChanged ? (
                          <Box>
                            <Text className="text-sm font-semibold mb-2">
                              Changes Preview:
                            </Text>
                            <DiffViewer
                              oldContent={diff.oldContent || ''}
                              newContent={diff.newContent || ''}
                              viewType="unified"
                            />
                          </Box>
                        ) : (
                          <Alert className="bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700">
                            <Text className="text-sm">
                              This section is already up to date with the latest
                              changes.
                            </Text>
                          </Alert>
                        )}
                      </VStack>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </VStack>
          )}
        </div>

        <DialogFooter>
          <HStack className="space-x-3">
            <Button variant="ghost" onClick={onClose} disabled={isApplying}>
              Cancel
            </Button>
            <Button
              onClick={handleApplyChanges}
              disabled={selectedSections.size === 0 || isLoading || isApplying}
            >
              <HStack className="space-x-1">
                <FiCheck className="h-4 w-4" />
                <span>
                  Apply {selectedSections.size} Change
                  {selectedSections.size !== 1 ? 's' : ''}
                </span>
              </HStack>
            </Button>
          </HStack>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

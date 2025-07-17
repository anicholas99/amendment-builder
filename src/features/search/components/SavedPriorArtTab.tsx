import React, { useState } from 'react';
import { logger } from '@/utils/clientLogger';
import { cn } from '@/lib/utils';
import {
  FiClock,
  FiExternalLink,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiRefreshCw,
} from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useThemeContext } from '@/contexts/ThemeContext';
import { ProcessedSavedPriorArt } from '@/types/domain/priorArt';
import { format } from 'date-fns';
import { ExtractedPriorArtBadge } from '@/components/ui/extracted-prior-art-badge';

interface SavedPriorArtTabProps {
  savedPriorArt: ProcessedSavedPriorArt[];
  onRemovePriorArt: (index: number) => void;
  onOpenPriorArtDetails: (reference: unknown) => void;
  onRefreshList?: () => void;
}

/**
 * Component to display saved prior art in the claim refinement sidebar
 */
const SavedPriorArtTab: React.FC<SavedPriorArtTabProps> = ({
  savedPriorArt,
  onRemovePriorArt,
  onOpenPriorArtDetails,
  onRefreshList,
}) => {
  const { isDarkMode } = useThemeContext();

  // For delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  // State to track the index of the expanded row, null if none
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Format patent number for Google Patents URL
  const formatPatentUrl = (patentNumber: string): string => {
    // Remove any dashes that might be in the patent number
    const cleanPatentNumber = patentNumber.replace(/-/g, '');
    return `https://patents.google.com/patent/${cleanPatentNumber}`;
  };

  // Handle remove button click
  const handleRemoveClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex(index);
    setDeleteDialogOpen(true);
  };

  // Confirm removal
  const confirmRemove = () => {
    if (selectedIndex !== null) {
      onRemovePriorArt(selectedIndex);
      setSelectedIndex(null);
      setDeleteDialogOpen(false);
    }
  };

  // Function to toggle expansion for a row
  const handleToggleExpand = (index: number) => {
    setExpandedIndex(prevIndex => (prevIndex === index ? null : index));
  };

  if (!savedPriorArt || savedPriorArt.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className={cn(isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
          No saved prior art yet
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-3 border-b border-border flex-shrink-0">
        <h2 className="text-sm font-semibold text-foreground">
          Saved Prior Art
        </h2>
        {onRefreshList && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefreshList}
                  className="w-8 h-8 p-0"
                >
                  <FiRefreshCw className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh list</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto custom-scrollbar">
          <Table>
            <TableHeader
              className={cn(
                'sticky top-0 z-10',
                isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
              )}
            >
              <TableRow>
                <TableHead
                  className={cn(
                    'px-4',
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  )}
                >
                  REFERENCE
                </TableHead>
                <TableHead
                  className={cn(
                    'px-4 w-[100px]',
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  )}
                >
                  DATE ADDED
                </TableHead>
                <TableHead
                  className={cn(
                    'px-4 w-[70px]',
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  )}
                >
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedPriorArt.map((reference, index) => {
                // Format the date if available, using savedAt
                const dateText = reference.savedAt
                  ? format(new Date(reference.savedAt), 'MMM d, yyyy')
                  : 'N/A';

                // Safely access patentNumber
                const patentNumber = reference.patentNumber;
                const displayPatentNumber =
                  typeof patentNumber === 'string'
                    ? patentNumber.replace(/-/g, '')
                    : 'Invalid Number';

                // Derive year from publicationDate if year field is missing or empty
                let displayYear = reference.priorArtData.year || 'N/A';
                if (
                  (!reference.priorArtData.year ||
                    reference.priorArtData.year === 'N/A') &&
                  reference.priorArtData.publicationDate &&
                  typeof reference.priorArtData.publicationDate === 'string' &&
                  reference.priorArtData.publicationDate.length >= 4
                ) {
                  displayYear =
                    reference.priorArtData.publicationDate.substring(0, 4);
                }

                // Extract saved citations information from the parsed array
                const savedCitations = reference.savedCitations || [];

                const elementTexts = savedCitations
                  .map(citation => citation.elementText?.trim())
                  .filter(Boolean);
                const uniqueElementTexts = Array.from(new Set(elementTexts));
                const citationCount = savedCitations.length;

                const isExpanded = expandedIndex === index;

                // Check if this reference was extracted from invention disclosure
                const isFromDisclosure =
                  reference.notes?.includes(
                    'Extracted from invention disclosure'
                  ) ?? false;
                let extractedContext: string | undefined;
                let extractedRelevance: string | undefined;
                let originalReference: string | undefined;

                if (isFromDisclosure && reference.notes) {
                  // Parse context, relevance, and original reference from notes
                  const contextMatch =
                    reference.notes.match(/Context: ([^.]+)\./);
                  const relevanceMatch =
                    reference.notes.match(/Relevance: ([^.]+)\./);
                  const originalMatch =
                    reference.notes.match(/Original: ([^.]+)$/);

                  extractedContext =
                    contextMatch?.[1] !== 'N/A' ? contextMatch?.[1] : undefined;
                  extractedRelevance =
                    relevanceMatch?.[1] !== 'N/A'
                      ? relevanceMatch?.[1]
                      : undefined;
                  originalReference = originalMatch?.[1];
                }

                return (
                  <React.Fragment key={index}>
                    <TableRow
                      className={cn(
                        'transition-colors',
                        citationCount > 0 ? 'cursor-pointer' : 'cursor-default',
                        isDarkMode
                          ? 'hover:bg-gray-800/50'
                          : 'hover:bg-gray-50',
                        index % 2 === 0
                          ? 'transparent'
                          : isDarkMode
                            ? 'bg-gray-800/30'
                            : 'bg-gray-50/50'
                      )}
                      onClick={() =>
                        citationCount > 0 && handleToggleExpand(index)
                      }
                      title={
                        citationCount > 0
                          ? 'Click to view citation details'
                          : undefined
                      }
                    >
                      <TableCell className="px-4">
                        <div className="flex items-start gap-2">
                          <span
                            className={cn(
                              'font-medium text-xs',
                              isDarkMode ? 'text-gray-200' : 'text-gray-900'
                            )}
                          >
                            {displayPatentNumber}
                          </span>
                          {citationCount > 0 ? (
                            <>
                              <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                {citationCount}{' '}
                                {citationCount === 1 ? 'citation' : 'citations'}
                              </Badge>
                              {isExpanded ? (
                                <FiChevronUp className="w-3 h-3 text-blue-500 ml-1" />
                              ) : (
                                <FiChevronDown className="w-3 h-3 text-blue-500 ml-1" />
                              )}
                            </>
                          ) : (
                            <span
                              className={cn(
                                'text-[10px]',
                                isDarkMode ? 'text-gray-500' : 'text-gray-400'
                              )}
                            >
                              No citations saved
                            </span>
                          )}
                          {isFromDisclosure && (
                            <ExtractedPriorArtBadge
                              context={extractedContext}
                              relevance={extractedRelevance}
                              originalReference={originalReference}
                            />
                          )}
                        </div>
                        <div className="flex flex-col gap-0">
                          <p
                            className={cn(
                              'text-xs line-clamp-1',
                              isDarkMode ? 'text-gray-200' : 'text-gray-900'
                            )}
                          >
                            {reference.priorArtData.title}
                          </p>
                          {reference.priorArtData.authors && (
                            <p
                              className={cn(
                                'text-[10px]',
                                isDarkMode ? 'text-gray-500' : 'text-gray-400'
                              )}
                            >
                              {reference.priorArtData.authors} ({displayYear})
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4">
                        <span
                          className={cn(
                            'text-xs',
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          )}
                        >
                          {dateText}
                        </span>
                      </TableCell>
                      <TableCell className="px-4">
                        <div className="flex gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-6 h-6 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                  onClick={e => {
                                    e.stopPropagation();
                                    window.open(
                                      formatPatentUrl(reference.patentNumber),
                                      '_blank'
                                    );
                                  }}
                                >
                                  <FiExternalLink className="w-3.5 h-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View patent details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-6 h-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleRemoveClick(index, e);
                                  }}
                                >
                                  <FiTrash2 className="w-3.5 h-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Remove from saved prior art</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className={cn(
                          'p-0',
                          isExpanded
                            ? isDarkMode
                              ? 'border-b border-gray-700'
                              : 'border-b border-gray-200'
                            : 'border-b-0'
                        )}
                      >
                        <Collapsible open={isExpanded}>
                          <CollapsibleContent>
                            <div
                              className={cn(
                                'p-4',
                                isDarkMode ? 'bg-gray-900/50' : 'bg-white'
                              )}
                            >
                              <div className="flex flex-col gap-3">
                                {savedCitations.map((citation, citIndex) => (
                                  <div
                                    key={citIndex}
                                    className={cn(
                                      'pb-2',
                                      citIndex < savedCitations.length - 1
                                        ? isDarkMode
                                          ? 'border-b border-gray-700'
                                          : 'border-b border-gray-200'
                                        : 'border-b-0'
                                    )}
                                  >
                                    <p className="font-medium text-xs mb-1 text-blue-500">
                                      Element: {citation.elementText || 'N/A'}
                                    </p>
                                    <p
                                      className={cn(
                                        'text-xs mb-1 whitespace-pre-wrap',
                                        isDarkMode
                                          ? 'text-gray-200'
                                          : 'text-gray-900'
                                      )}
                                    >
                                      Citation: {citation.citation || 'N/A'}
                                    </p>
                                    <p
                                      className={cn(
                                        'text-xs',
                                        isDarkMode
                                          ? 'text-gray-400'
                                          : 'text-gray-600'
                                      )}
                                    >
                                      Location: {citation.location || 'N/A'}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent
          className={cn(
            isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          )}
        >
          <AlertDialogHeader>
            <AlertDialogTitle
              className={cn(isDarkMode ? 'text-gray-200' : 'text-gray-900')}
            >
              Remove Prior Art
            </AlertDialogTitle>
            <AlertDialogDescription
              className={cn(isDarkMode ? 'text-gray-400' : 'text-gray-600')}
            >
              Are you sure you want to remove this prior art reference? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SavedPriorArtTab;

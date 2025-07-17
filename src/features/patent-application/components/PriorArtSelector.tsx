import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useColorModeValue } from '@/hooks/useColorModeValue';
import { FiChevronDown, FiChevronUp, FiExternalLink } from 'react-icons/fi';
import { cn } from '@/lib/utils';

type SavedPriorArt = {
  id: string;
  patentNumber: string;
  title?: string | null;
  abstract?: string | null;
  authors?: string | null;
  publicationDate?: string | null;
  notes?: string | null;
  claim1?: string | null;
  summary?: string | null;
};

interface PriorArtSelectorProps {
  priorArtItems: SavedPriorArt[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

/**
 * Simple prior art selector with clean UI matching application design patterns
 */
const PriorArtSelector: React.FC<PriorArtSelectorProps> = React.memo(
  ({ priorArtItems, selectedIds, onChange }) => {
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    // Use consistent color patterns from the app
    const borderColor = useColorModeValue(
      'hsl(var(--border))',
      'hsl(var(--border))'
    );
    const textColor = useColorModeValue(
      'hsl(var(--foreground))',
      'hsl(var(--foreground))'
    );
    const mutedTextColor = useColorModeValue(
      'hsl(var(--muted-foreground))',
      'hsl(var(--muted-foreground))'
    );
    const hoverBg = useColorModeValue(
      'hsl(var(--accent))',
      'hsl(var(--accent))'
    );
    const tableBg = useColorModeValue(
      'hsl(var(--background))',
      'hsl(var(--card))'
    );
    const selectedBg = useColorModeValue(
      'hsl(var(--accent))',
      'hsl(var(--accent))'
    );
    const selectedHoverBg = useColorModeValue(
      'hsl(var(--accent))',
      'hsl(var(--accent))'
    );

    // Pre-calculate these outside the map to avoid hook-in-loop errors
    const detailsBg = useColorModeValue(
      'hsl(var(--muted))',
      'hsl(var(--muted))'
    );

    const toggle = (id: string) => {
      if (selectedIds.includes(id)) {
        onChange(selectedIds.filter(p => p !== id));
      } else {
        onChange([...selectedIds, id]);
      }
    };

    const toggleExpanded = (id: string) => {
      const newExpanded = new Set(expandedItems);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      setExpandedItems(newExpanded);
    };

    const selectAll = () => {
      onChange(priorArtItems.map(item => item.id));
    };

    const selectNone = () => {
      onChange([]);
    };

    // Helper functions to extract data from SavedPriorArt structure
    const getTitle = (ref: SavedPriorArt): string => {
      return ref.title || 'No title available';
    };

    const getAuthors = (ref: SavedPriorArt): string | null => {
      return ref.authors || null;
    };

    const getYear = (ref: SavedPriorArt): string | null => {
      return ref.publicationDate || null;
    };

    // Debug logging to see what data we actually have
    React.useEffect(() => {
      if (priorArtItems.length > 0) {
        console.log(
          '[PriorArtSelector] Received priorArtItems:',
          priorArtItems.map(item => ({
            id: item.id,
            patentNumber: item.patentNumber,
            title: item.title,
            authors: item.authors,
            publicationDate: item.publicationDate,
            extractedTitle: getTitle(item),
            extractedAuthors: getAuthors(item),
            extractedYear: getYear(item),
            availableFields: Object.keys(item),
          }))
        );
      }
    }, [priorArtItems]);

    // Clean HTML from text
    const cleanText = (text: string | null | undefined): string => {
      if (!text) return '';
      return text
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
    };

    const truncateText = (text: string, maxLength: number): string => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };

    // Extract and format year from publicationDate (consistent with SavedPriorArtTab)
    const formatDate = (dateStr: string | null | undefined): string => {
      if (!dateStr) return '';

      // If it's in YYYYMMDD format (8 digits), extract just the year
      if (dateStr.length === 8 && /^\d{8}$/.test(dateStr)) {
        return dateStr.substring(0, 4);
      }

      // If it's just a year (4 digits), return as is
      if (dateStr.length === 4 && /^\d{4}$/.test(dateStr)) {
        return dateStr;
      }

      // If it's a longer string (like ISO date), try to extract year from beginning
      if (dateStr.length >= 4 && /^\d{4}/.test(dateStr)) {
        return dateStr.substring(0, 4);
      }

      // Otherwise return the original string
      return dateStr;
    };

    if (priorArtItems.length === 0) {
      return (
        <div className="py-4 px-3">
          <p className="text-sm text-text-secondary text-center">
            No saved prior art references available.
          </p>
        </div>
      );
    }

    return (
      <div className="p-2">
        {/* Simple header with selection count */}
        <div className="flex justify-between mb-2 flex-wrap gap-2">
          <p className="text-sm text-muted-foreground font-medium">
            {selectedIds.length} of {priorArtItems.length} references selected
          </p>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={selectAll}
              disabled={selectedIds.length === priorArtItems.length}
              className="text-xs"
            >
              Select All
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={selectNone}
              disabled={selectedIds.length === 0}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>
        </div>

        {/* Prior Art Items - with flexible height */}
        <div className="flex flex-col space-y-2 max-h-96 overflow-y-auto overflow-x-hidden pr-1">
          {priorArtItems.map(ref => {
            const isSelected = selectedIds.includes(ref.id);
            const isExpanded = expandedItems.has(ref.id);
            const getAbstract = (ref: SavedPriorArt): string | null => {
              return ref.abstract || null;
            };

            const hasDetails =
              getAbstract(ref) || ref.summary || ref.claim1 || ref.notes;

            return (
              <div
                key={ref.id}
                className="border border-border rounded-md p-2"
                style={{
                  backgroundColor: isSelected ? selectedBg : tableBg,
                  borderColor: isSelected ? 'border-blue-400' : borderColor,
                  transition: 'all 0.15s ease-out',
                }}
              >
                <div className="flex flex-col space-y-2">
                  {/* Main row with checkbox and info */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex space-x-2 flex-1 min-w-0 items-start">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggle(ref.id)}
                      />

                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <span className="font-medium text-xs text-foreground text-left">
                            {ref.patentNumber?.replace(/-/g, '') ||
                              'Unknown Patent'}
                          </span>
                        </div>

                        <div className="flex flex-col gap-0 items-start">
                          <p className="text-xs line-clamp-1 text-foreground text-left">
                            {getTitle(ref)}
                          </p>
                          {getAuthors(ref) && (
                            <p className="text-[10px] text-muted-foreground text-left">
                              {getAuthors(ref)}{' '}
                              {getYear(ref)
                                ? `(${formatDate(getYear(ref))})`
                                : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex space-x-1 shrink-0">
                      {ref.patentNumber && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                aria-label="View on Google Patents"
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  window.open(
                                    `https://patents.google.com/patent/${ref.patentNumber?.replace(/-/g, '')}/en`,
                                    '_blank'
                                  );
                                }}
                                className="text-muted-foreground hover:text-foreground bg-background hover:bg-accent"
                              >
                                <FiExternalLink className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View on Google Patents</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {hasDetails && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                aria-label={
                                  isExpanded ? 'Hide details' : 'Show details'
                                }
                                size="icon"
                                variant="ghost"
                                onClick={() => toggleExpanded(ref.id)}
                                className="text-muted-foreground hover:text-foreground bg-background hover:bg-accent"
                              >
                                {isExpanded ? (
                                  <FiChevronUp className="h-4 w-4" />
                                ) : (
                                  <FiChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {isExpanded ? 'Hide details' : 'Show details'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>

                  {/* Expanded details section */}
                  {hasDetails && isExpanded && (
                    <div className="flex flex-col space-y-3 pt-3 mt-3 border-t border-border">
                      {getAbstract(ref) && (
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-2">
                            Abstract
                          </p>
                          <div className="text-xs text-muted-foreground p-3 bg-muted rounded-md border border-border leading-relaxed">
                            {cleanText(getAbstract(ref)!)}
                          </div>
                        </div>
                      )}

                      {ref.summary && (
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-2">
                            Summary
                          </p>
                          <div className="text-xs text-muted-foreground p-3 bg-muted rounded-md border border-border leading-relaxed">
                            {cleanText(ref.summary)}
                          </div>
                        </div>
                      )}

                      {ref.claim1 && (
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-2">
                            Main Claim
                          </p>
                          <div className="text-xs text-muted-foreground p-3 bg-muted rounded-md border border-border leading-relaxed">
                            {cleanText(ref.claim1)}
                          </div>
                        </div>
                      )}

                      {ref.notes && (
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-2">
                            Notes
                          </p>
                          <div className="text-xs text-muted-foreground p-3 bg-muted rounded-md border border-border leading-relaxed">
                            {cleanText(ref.notes)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

PriorArtSelector.displayName = 'PriorArtSelector';

export default PriorArtSelector;

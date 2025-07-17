import React from 'react';
import { logger } from '@/utils/clientLogger';
import { cn } from '@/lib/utils';
import { FiBook, FiChevronDown } from 'react-icons/fi';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
import { useThemeContext } from '@/contexts/ThemeContext';
import { PriorArtReference } from '../../../types/claimTypes';
import { getRelevanceBadgeClasses } from '../utils/searchHistoryUtils';

interface PriorArtPanelProps {
  references: PriorArtReference[];
}

const PriorArtPanel: React.FC<PriorArtPanelProps> = ({ references }) => {
  const { isDarkMode } = useThemeContext();
  const [isOpen, setIsOpen] = React.useState(false);

  // Sort by composite score: relevancy * (1 + 0.2 * (searchAppearanceCount - 1))
  // This gives a 20% boost per additional appearance
  const sortedReferences = [...references].sort((a, b) => {
    // Convert relevancy to decimal (e.g., 68% -> 0.68)
    const aRelevancy = (a.relevance ?? 0) / 100;
    const bRelevancy = (b.relevance ?? 0) / 100;
    const aCount = a.searchAppearanceCount ?? 1;
    const bCount = b.searchAppearanceCount ?? 1;

    // Calculate composite score with appearance boost
    const aScore = aRelevancy * (1 + 0.2 * (aCount - 1));
    const bScore = bRelevancy * (1 + 0.2 * (bCount - 1));

    // If scores are equal, sort by year (newer first)
    if (Math.abs(aScore - bScore) < 0.001) {
      const aYear = parseInt(a.year ?? '0');
      const bYear = parseInt(b.year ?? '0');
      return bYear - aYear;
    }

    return bScore - aScore;
  });

  // Debug logging to verify sorting
  logger.info('Sorted References:', {
    references: sortedReferences.map(ref => ({
      number: ref.number,
      relevance: ref.relevance,
      count: ref.searchAppearanceCount,
      year: ref.year,
      score:
        ((ref.relevance ?? 0) / 100) *
        (1 + 0.2 * ((ref.searchAppearanceCount ?? 1) - 1)),
    })),
  });

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            'flex w-full items-center justify-between rounded-lg border p-4 transition-colors',
            isDarkMode
              ? 'border-gray-700 bg-gray-800 hover:bg-gray-750'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          )}
        >
          <div className="flex items-center gap-2">
            <FiBook className="w-4 h-4" />
            <span className="font-medium">Prior Art References</span>
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
            >
              {sortedReferences.length}
            </Badge>
          </div>
          <FiChevronDown
            className={cn(
              'w-4 h-4 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div className="pb-4">
          {references.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Relevancy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedReferences.map(ref => (
                  <TableRow key={ref.number}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{ref.number}</span>
                          <span>{ref.title}</span>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p
                                className={cn(
                                  'text-sm line-clamp-2 cursor-pointer hover:text-blue-500 transition-colors',
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                )}
                              >
                                {ref.relevantText}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-sm">{ref.relevantText}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                    <TableCell>{ref.year}</TableCell>
                    <TableCell>
                      <Badge
                        className={getRelevanceBadgeClasses(ref.relevance ?? 0)}
                      >
                        {((ref.relevance ?? 0) * 100).toFixed(0)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div
              className={cn(
                'text-center py-4',
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              )}
            >
              <p>No prior art references found</p>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default PriorArtPanel;

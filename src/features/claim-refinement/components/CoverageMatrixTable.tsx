import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CoverageMatrix } from '../../../types/priorArtAnalysisTypes';

interface CoverageMatrixTableProps {
  coverageMatrix: CoverageMatrix;
  referenceIds: string[];
}

/**
 * Component to display a table showing which claim elements are covered by which references.
 * Uses a color-coded table (Yes=Red, Partial=Yellow, No=Green) for quick visual assessment.
 */
const CoverageMatrixTable: React.FC<CoverageMatrixTableProps> = ({
  coverageMatrix,
  referenceIds,
}) => {
  // Get all unique element names and reference IDs from the matrix
  const elements = Object.keys(coverageMatrix);

  // Color schemes for different coverage levels
  const getBadgeProps = (value: 'Yes' | 'Partial' | 'No') => {
    switch (value) {
      case 'Yes':
        return {
          className:
            'bg-red-100 text-red-800 border-red-200 dark:bg-red-800 dark:text-red-100 dark:border-red-700',
          text: 'Yes',
          tooltipText: 'This element is fully disclosed in the reference',
        };
      case 'Partial':
        return {
          className:
            'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-800 dark:text-orange-100 dark:border-orange-700',
          text: 'Partial',
          tooltipText:
            'This element is partially disclosed or has relevant teachings in the reference',
        };
      case 'No':
        return {
          className:
            'bg-green-100 text-green-800 border-green-200 dark:bg-green-800 dark:text-green-100 dark:border-green-700',
          text: 'No',
          tooltipText: 'This element is not disclosed in the reference',
        };
      default:
        return {
          className:
            'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700',
          text: 'Unknown',
          tooltipText: 'Unknown coverage status',
        };
    }
  };

  // Return placeholder if no data or empty matrix
  if (!coverageMatrix || elements.length === 0 || referenceIds.length === 0) {
    return (
      <div className="p-4 border rounded-md bg-muted">
        <p className="text-sm text-muted-foreground">
          No coverage matrix data available.
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="overflow-x-auto border rounded-md shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="w-[40%] font-medium">
                Claim Element
              </TableHead>
              {referenceIds.map(refId => (
                <TableHead
                  key={refId}
                  className="text-center font-medium"
                  style={{ width: `${60 / referenceIds.length}%` }}
                >
                  {refId}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {elements.map(element => (
              <TableRow key={element}>
                <TableCell>
                  <p className="text-xs">{element}</p>
                </TableCell>
                {referenceIds.map(refId => {
                  // Get the coverage value or use 'No' as fallback if not specified
                  const coverageValue = coverageMatrix[element][refId] || 'No';
                  const { className, text, tooltipText } = getBadgeProps(
                    coverageValue as 'Yes' | 'Partial' | 'No'
                  );

                  return (
                    <TableCell
                      key={`${element}-${refId}`}
                      className="text-center"
                    >
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge
                            variant="outline"
                            className={`px-2 py-1 rounded-full ${className}`}
                          >
                            {text}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{tooltipText}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};

export default CoverageMatrixTable;

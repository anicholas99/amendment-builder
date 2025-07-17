import React from 'react';
import { Calendar, Globe, Hash, FileText, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';
import { CitationMatchSummary } from '../ReferenceRelevancySummary';

export interface DisplayableMetadata {
  title?: string;
  publicationDate?: string;
  applicationDate?: string;
  patentOffice?: string;
  applicationNumber?: string;
  publicationNumber?: string;
  familySize?: number;
  inventors?: string[];
  assignee?: string;
  abstractText?: string;
  priority?: string;
  ipc?: string;
  cpc?: string;
  usClass?: string;
}

interface MetadataDisplayProps {
  referenceMetadata: DisplayableMetadata | null;
  selectedReference: string | null;
  isLoading: boolean;
  citationMatches?: CitationMatchSummary[];
}

export const MetadataDisplay: React.FC<MetadataDisplayProps> = ({
  referenceMetadata,
  selectedReference,
  isLoading,
  citationMatches = [],
}) => {
  const { isDarkMode } = useThemeContext();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded-full bg-gray-300 animate-pulse" />
        <div className="h-4 w-24 bg-gray-300 rounded animate-pulse" />
      </div>
    );
  }

  if (!selectedReference || !referenceMetadata) {
    return (
      <div
        className={cn(
          'text-sm',
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        )}
      >
        No reference selected
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const citationCount = citationMatches.length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Reference number */}
      <Badge
        variant="secondary"
        className="flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      >
        <FileText className="w-3 h-3" />
        {selectedReference}
      </Badge>

      {/* Title (truncated) */}
      {referenceMetadata.title && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="max-w-[200px] truncate">
                {referenceMetadata.title}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-[300px]">{referenceMetadata.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Publication Date */}
      {referenceMetadata.publicationDate && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(referenceMetadata.publicationDate)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Publication Date</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Patent Office */}
      {referenceMetadata.patentOffice && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {referenceMetadata.patentOffice}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Patent Office</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Family Size */}
      {referenceMetadata.familySize && referenceMetadata.familySize > 1 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
              >
                {referenceMetadata.familySize} family member
                {referenceMetadata.familySize > 1 ? 's' : ''}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Patent Family Size</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Assignee */}
      {referenceMetadata.assignee && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className="flex items-center gap-1 max-w-[150px] truncate"
              >
                <Users className="w-3 h-3" />
                {referenceMetadata.assignee}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Assignee: {referenceMetadata.assignee}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Citation count */}
      {citationCount > 0 && (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
        >
          {citationCount} citation{citationCount > 1 ? 's' : ''}
        </Badge>
      )}
    </div>
  );
};

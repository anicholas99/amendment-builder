import React, { useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  FamilyMemberReference,
  PriorArtReference,
} from '../../../types/claimTypes';
import {
  getRelevanceBadgeClasses,
  formatRelevancePercentage,
} from '../utils/searchHistoryUtils';
import { ReferenceActionButtons } from './ReferenceActionButtons';

interface FamilyMemberItemProps {
  member: FamilyMemberReference;
  index: number;
  colors: {
    textColor: string;
    hoverBg: string;
  };
  isSaved: boolean;
  isExcluded: boolean;
  getCitationIcon: (referenceNumber: string) => React.ReactNode;
  onSave: (reference: PriorArtReference) => Promise<void> | void;
  onExclude: (reference: PriorArtReference) => void;
}

/**
 * Component for rendering a single family member item
 */
export const FamilyMemberItem: React.FC<FamilyMemberItemProps> = React.memo(
  ({
    member,
    index,
    colors,
    isSaved,
    isExcluded,
    getCitationIcon,
    onSave,
    onExclude,
  }) => {
    const memberNumber = member.number;
    // Check both relevance and relevancy fields
    const memberRelevanceScore = member.relevance ?? member.relevancy;

    const handleSave = useCallback(() => {
      onSave({
        number: memberNumber,
      } as PriorArtReference);
    }, [memberNumber, onSave]);

    const handleExclude = useCallback(() => {
      onExclude({
        number: memberNumber,
      } as PriorArtReference);
    }, [memberNumber, onExclude]);

    if (!memberNumber) return null;

    return (
      <div
        key={`${memberNumber}-${index}`}
        className={cn(
          'flex justify-between items-center w-full py-0.5 px-1 rounded-sm transition-colors',
          'hover:bg-accent/50',
          isExcluded && 'opacity-50'
        )}
      >
        {/* Left side: Number and Badge */}
        <div className="flex items-center space-x-2 flex-1 overflow-hidden min-w-0">
          <span
            className={cn(
              'text-xs text-foreground mr-1 flex-shrink truncate',
              isExcluded && 'line-through'
            )}
            style={{ color: colors.textColor }}
            title={memberNumber}
          >
            {memberNumber.replace(/-/g, '')}
          </span>
          {memberRelevanceScore !== undefined && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs px-2 py-1 flex-shrink-0',
                      getRelevanceBadgeClasses(memberRelevanceScore)
                    )}
                  >
                    {formatRelevancePercentage(memberRelevanceScore)}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Relevance: {formatRelevancePercentage(memberRelevanceScore)}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <ReferenceActionButtons
          referenceNumber={memberNumber}
          isSaved={isSaved}
          isExcluded={isExcluded}
          onSave={handleSave}
          onExclude={handleExclude}
          getCitationIcon={getCitationIcon}
          isDisabled={false}
        />
      </div>
    );
  }
);

FamilyMemberItem.displayName = 'FamilyMemberItem';

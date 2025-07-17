import React, { useCallback, useRef, useState } from 'react';
import { logger } from '@/utils/clientLogger';
import { cn } from '@/lib/utils';
import { FiChevronDown, FiChevronUp, FiFileText, FiUser } from 'react-icons/fi';
import {
  PriorArtReference,
  FamilyMemberReference,
} from '../../../types/claimTypes';
import {
  getRelevancyColor,
  formatRelevancePercentage,
  isValidRelevance,
  cleanAbstract,
  getRelevanceBadgeClasses,
} from '../utils/searchHistoryUtils';
import { ReferenceActionButtons } from './ReferenceActionButtons';
import { FamilyMemberItem } from './FamilyMemberItem';
import { useThemeContext } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// Define the props for the ReferenceCard component
interface ReferenceCardProps {
  reference: PriorArtReference;
  colors: {
    bg: string;
    borderColor: string;
    headerBg: string;
    textColor: string;
    mutedTextColor: string;
    hoverBg: string;
    queryBg: string;
    tableBg: string;
    tableHeaderBg: string;
    tableStripedBg: string;
  };
  isSaved: boolean;
  isExcluded: boolean;
  // Add checks for family member status passed from parent
  isFamilyMemberSaved?: (memberNumber: string) => boolean;
  isFamilyMemberExcluded?: (memberNumber: string) => boolean;
  // hasCitationJob: boolean; // We might need more granular status later
  getCitationIcon: (referenceNumber: string) => React.ReactNode; // Pass down the icon rendering logic
  onSave: (reference: PriorArtReference) => Promise<void> | void;
  onExclude: (reference: PriorArtReference) => void;
  // onViewCitations: (referenceNumber: string) => void; // Handled by getCitationIcon
  resultIndex?: number; // Optional index if needed for keys or logic
}

/**
 * Reusable component to display a single prior art reference card.
 * Migrated to shadcn/ui with exact visual consistency.
 */
const ReferenceCard: React.FC<ReferenceCardProps> = React.memo(
  ({
    reference,
    colors,
    isSaved,
    isExcluded,
    // Destructure new props
    isFamilyMemberSaved = (_mn: string) => false, // Default function if not provided
    isFamilyMemberExcluded = (_mn: string) => false, // Default function if not provided
    getCitationIcon,
    onSave,
    onExclude,
    resultIndex = 0, // Default index
  }) => {
    const { isDarkMode } = useThemeContext();
    const [isFamilyExpanded, setIsFamilyExpanded] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isAbstractExpanded, setIsAbstractExpanded] = useState(false);
    const cancelRef = useRef<HTMLButtonElement>(null);

    // Central handler for the exclude button click
    const handleExcludeClick = useCallback(() => {
      // No need to pass refToExclude, use 'reference' prop
      const hasFamily =
        Array.isArray(reference.otherFamilyMembers) &&
        reference.otherFamilyMembers.length > 0;

      if (isExcluded) return; // Already excluded

      if (hasFamily) {
        setIsConfirmOpen(true); // Open confirmation dialog for family
      } else {
        onExclude(reference); // Exclude single directly using the reference prop
      }
    }, [isExcluded, reference, onExclude]);

    // Dialog confirmation actions
    const confirmExcludeFamily = useCallback(() => {
      onExclude(reference); // Exclude the main reference (parent handles family logic)
      setIsConfirmOpen(false);
    }, [reference, onExclude]);

    const declineExcludeFamily = useCallback(() => {
      logger.warn(
        'Excluding only single reference after declining family exclusion. Ensure parent handler supports this.'
      );
      onExclude(reference); // Call parent handler for single exclusion
      setIsConfirmOpen(false);
    }, [reference, onExclude]);

    // Click handlers with useCallback
    const handleAbstractToggle = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsAbstractExpanded(!isAbstractExpanded);
      },
      [isAbstractExpanded]
    );

    const handleFamilyToggle = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFamilyExpanded(!isFamilyExpanded);
      },
      [isFamilyExpanded]
    );

    const handleSaveReference = useCallback(() => {
      onSave(reference);
    }, [reference, onSave]);

    const patentNumber = String(reference.number || '');
    const hasOtherFamilyMembers =
      Array.isArray(reference.otherFamilyMembers) &&
      reference.otherFamilyMembers.length > 0;
    const displayRelevanceValue = reference.relevance; // Read from prop

    // Check if abstract exists and has content
    const hasAbstract =
      reference.abstract && reference.abstract.trim().length > 0;

    return (
      <>
        <div
          key={`${patentNumber}-${resultIndex}`}
          className={cn(
            'border rounded-md p-1.5 transition-colors duration-200',
            isDarkMode
              ? 'border-gray-600 bg-gray-800 hover:bg-gray-700'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          )}
        >
          <div className="flex flex-col space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span
                  className={cn(
                    'text-sm font-medium',
                    isDarkMode ? 'text-gray-100' : 'text-gray-900'
                  )}
                  title={reference.title}
                >
                  {patentNumber.replace(/-/g, '')}
                </span>

                {isValidRelevance(displayRelevanceValue) ? (
                  (() => {
                    const validRelevance = displayRelevanceValue as number;
                    return (
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-xs px-2 py-1',
                          getRelevanceBadgeClasses(validRelevance / 100)
                        )}
                      >
                        {formatRelevancePercentage(validRelevance)}
                      </Badge>
                    );
                  })()
                ) : (
                  <span
                    className={cn(
                      'text-xs',
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    )}
                  >
                    (N/A)
                  </span>
                )}

                {reference.searchAppearanceCount &&
                  reference.searchAppearanceCount > 1 && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-xs px-2 py-1',
                        isDarkMode
                          ? 'bg-purple-900 text-purple-200'
                          : 'bg-purple-100 text-purple-800'
                      )}
                    >
                      {reference.searchAppearanceCount}x
                    </Badge>
                  )}

                {hasAbstract && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleAbstractToggle}
                    className={cn(
                      'h-auto min-h-0 p-1 text-xs font-normal',
                      isDarkMode
                        ? 'text-blue-400 hover:text-blue-300'
                        : 'text-blue-600 hover:text-blue-500'
                    )}
                  >
                    <FiFileText className="w-3 h-3 mr-1" />
                    Abstract
                    {isAbstractExpanded ? (
                      <FiChevronUp className="w-3 h-3 ml-1" />
                    ) : (
                      <FiChevronDown className="w-3 h-3 ml-1" />
                    )}
                  </Button>
                )}
              </div>

              <ReferenceActionButtons
                referenceNumber={patentNumber}
                isSaved={isSaved}
                isExcluded={isExcluded}
                onSave={handleSaveReference}
                onExclude={handleExcludeClick}
                getCitationIcon={getCitationIcon}
              />
            </div>

            <p
              className={cn(
                'text-xs line-clamp-1 leading-tight',
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              )}
              title={reference.title}
            >
              {reference.title || 'No title available'}
            </p>

            {/* Abstract collapse section */}
            {hasAbstract && (
              <Collapsible open={isAbstractExpanded}>
                <CollapsibleContent>
                  <div
                    className={cn(
                      'p-2 mt-2 rounded-sm border-l-3 border-l-blue-300',
                      isDarkMode
                        ? 'bg-gray-700 border-l-blue-600'
                        : 'bg-blue-50 border-l-blue-300'
                    )}
                  >
                    <p
                      className={cn(
                        'text-xs leading-relaxed whitespace-pre-wrap',
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      )}
                    >
                      {cleanAbstract(reference.abstract!)}
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            <div
              className={cn(
                'flex justify-between text-xs',
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              )}
            >
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-1 mt-1">
                  <FiUser
                    className={cn(
                      'w-3 h-3',
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    )}
                  />
                  <span
                    className="line-clamp-1"
                    title={reference.authors?.join(', ')}
                  >
                    {reference.authors?.join(', ') || 'N/A'}
                  </span>
                </div>

                {hasOtherFamilyMembers && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleFamilyToggle}
                    className={cn(
                      'h-auto min-h-0 p-0 text-xs font-normal justify-start',
                      isDarkMode
                        ? 'text-blue-400 hover:text-blue-300'
                        : 'text-blue-600 hover:text-blue-500'
                    )}
                  >
                    {isFamilyExpanded ? (
                      <FiChevronUp className="w-3 h-3 mr-1" />
                    ) : (
                      <FiChevronDown className="w-3 h-3 mr-1" />
                    )}
                    {isFamilyExpanded ? 'Hide' : 'Show'} Family Members (
                    {(reference.otherFamilyMembers || []).length})
                  </Button>
                )}
              </div>

              <span className="whitespace-nowrap">
                {reference.year || 'N/A'}
              </span>
            </div>
          </div>

          {hasOtherFamilyMembers && (
            <Collapsible open={isFamilyExpanded}>
              <CollapsibleContent>
                <div className="flex flex-col space-y-1 mt-2 pl-4">
                  {(reference.otherFamilyMembers || []).map((member, index) => {
                    const memberRef = member as FamilyMemberReference;
                    const memberNumber = memberRef.number;
                    if (!memberNumber) return null;

                    return (
                      <FamilyMemberItem
                        key={`${memberNumber}-${index}`}
                        member={memberRef}
                        index={index}
                        colors={{
                          textColor: colors.textColor,
                          hoverBg: colors.hoverBg,
                        }}
                        isSaved={isFamilyMemberSaved(memberNumber)}
                        isExcluded={isFamilyMemberExcluded(memberNumber)}
                        getCitationIcon={getCitationIcon}
                        onSave={onSave}
                        onExclude={onExclude}
                      />
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        {/* Confirmation Dialog for family exclusion */}
        <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                Exclude Family Members?
              </DialogTitle>
              <DialogDescription>
                This reference has {reference.otherFamilyMembers?.length || 0}{' '}
                associated family member(s). Do you want to exclude the entire
                family?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                ref={cancelRef}
                variant="outline"
                onClick={declineExcludeFamily}
              >
                No, Exclude Only This
              </Button>
              <Button variant="destructive" onClick={confirmExcludeFamily}>
                Yes, Exclude Family
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison to avoid unnecessary re-renders
    return (
      prevProps.reference.number === nextProps.reference.number &&
      prevProps.isSaved === nextProps.isSaved &&
      prevProps.isExcluded === nextProps.isExcluded &&
      prevProps.resultIndex === nextProps.resultIndex &&
      // Deep compare colors object
      JSON.stringify(prevProps.colors) === JSON.stringify(nextProps.colors)
    );
  }
);

ReferenceCard.displayName = 'ReferenceCard';

export default ReferenceCard;

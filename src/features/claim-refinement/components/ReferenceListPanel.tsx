import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PriorArtReference } from '../../../types/claimTypes';
import { ProcessedSearchHistoryEntry } from '@/types/domain/searchHistory';
import ReferenceCard from '../../search/components/ReferenceCard';
import { useSearchHistoryColors } from '../../search/hooks/useSearchHistoryColors';

interface ReferenceListPanelProps {
  showSavedPriorArt: boolean;
  selectedSearchId: string | null;
  searchHistory: ProcessedSearchHistoryEntry[];
  displayedReferences: PriorArtReference[];
  savedPriorArtReferences: PriorArtReference[];
  selectedReferenceNumbers: string[];
  onToggleReference: (referenceNumber: string) => void;
  onSelectAllReferences: () => void;
  onDeselectAllReferences: () => void;
  onSaveReference: (ref: PriorArtReference) => void;
  onExcludeReference: (ref: PriorArtReference) => void;
  getCitationIcon: (refNum: string) => React.ReactNode | null;
}

/**
 * Component for displaying and managing reference selection
 */
export const ReferenceListPanel: React.FC<ReferenceListPanelProps> = ({
  showSavedPriorArt,
  selectedSearchId,
  searchHistory,
  displayedReferences,
  savedPriorArtReferences,
  selectedReferenceNumbers,
  onToggleReference,
  onSelectAllReferences,
  onDeselectAllReferences,
  onSaveReference,
  onExcludeReference,
  getCitationIcon,
}) => {
  const colors = useSearchHistoryColors();

  // Find the selected search entry for display
  const selectedSearch = selectedSearchId
    ? searchHistory.find(entry => entry.id === selectedSearchId)
    : null;

  const selectedSearchIndex = selectedSearch
    ? searchHistory.findIndex(entry => entry.id === selectedSearchId)
    : -1;

  const isLatestSearch = selectedSearchIndex === 0;

  // Determine which references to display based on the toggle
  const referencesToDisplay = showSavedPriorArt
    ? savedPriorArtReferences
    : displayedReferences;

  return (
    <div>
      <div className="flex items-center mb-2 justify-between">
        <h3 className="text-base font-medium">
          {showSavedPriorArt ? 'Saved References' : 'Search Results'}
          {!showSavedPriorArt && selectedSearch && (
            <span className="text-sm font-normal ml-2 text-muted-foreground">
              {`(Search #${searchHistory.length - selectedSearchIndex}${isLatestSearch ? ' - Latest' : ''})`}
            </span>
          )}
        </h3>
        {referencesToDisplay.length > 0 && !showSavedPriorArt && (
          <div className="flex gap-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onSelectAllReferences}
                disabled={showSavedPriorArt}
              >
                Select All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onDeselectAllReferences}
                disabled={showSavedPriorArt}
              >
                Deselect All
              </Button>
            </div>
          </div>
        )}
      </div>

      {referencesToDisplay.length > 0 ? (
        <div
          className="h-[300px] overflow-y-auto border border-border rounded-md shadow-sm p-2"
          style={{
            scrollbarWidth: 'thin',
            msOverflowStyle: 'auto',
          }}
        >
          <div className="space-y-2 pb-1">
            {referencesToDisplay.map((ref, index) => {
              return (
                <div
                  key={`${showSavedPriorArt ? 'saved' : selectedSearchId}-available-${ref.number}-${index}`}
                  className="flex items-center"
                >
                  {!showSavedPriorArt && (
                    <Checkbox
                      checked={selectedReferenceNumbers.includes(ref.number)}
                      onCheckedChange={() => onToggleReference(ref.number)}
                      className="mr-2"
                    />
                  )}
                  <div className="flex-1">
                    <ReferenceCard
                      reference={ref}
                      colors={colors}
                      isSaved={showSavedPriorArt}
                      isExcluded={false}
                      getCitationIcon={getCitationIcon}
                      onSave={onSaveReference}
                      onExclude={onExcludeReference}
                      resultIndex={index}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : showSavedPriorArt ? (
        <p className="text-muted-foreground">No saved references to display.</p>
      ) : selectedSearchId ? (
        <p className="text-muted-foreground">
          No references found in this search entry or all are hidden.
        </p>
      ) : (
        <p className="text-muted-foreground">
          Please select a search to view references.
        </p>
      )}
    </div>
  );
};

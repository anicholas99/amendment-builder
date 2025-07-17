import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProcessedSearchHistoryEntry } from '@/types/domain/searchHistory';

interface SearchSelectionPanelProps {
  showSavedPriorArt: boolean;
  onToggleMode: () => void;
  selectedSearchId: string | null;
  onSelectedSearchIdChange: (id: string | null) => void;
  searchHistory: ProcessedSearchHistoryEntry[];
}

/**
 * Component for selecting between saved prior art and search references,
 * and choosing which search to display
 */
export const SearchSelectionPanel: React.FC<SearchSelectionPanelProps> = ({
  showSavedPriorArt,
  onToggleMode,
  selectedSearchId,
  onSelectedSearchIdChange,
  searchHistory,
}) => {
  return (
    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
      <div className="flex items-center gap-4">
        <Label htmlFor="saved-toggle" className="text-sm cursor-pointer">
          {showSavedPriorArt ? 'Saved Prior Art' : 'Search References'}
        </Label>
        <Switch
          id="saved-toggle"
          checked={showSavedPriorArt}
          onCheckedChange={onToggleMode}
        />

        {!showSavedPriorArt && (
          <Select
            value={selectedSearchId || ''}
            onValueChange={value => onSelectedSearchIdChange(value || null)}
            disabled={searchHistory.length === 0}
          >
            <SelectTrigger className="w-auto min-w-[180px]">
              <SelectValue placeholder="Select a search" />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(searchHistory) &&
                searchHistory.map((entry, index) => {
                  const isLatest = index === 0;
                  return (
                    <SelectItem key={entry.id} value={entry.id}>
                      Search #{searchHistory.length - index}
                      {isLatest ? ' (Latest)' : ''}
                    </SelectItem>
                  );
                })}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};

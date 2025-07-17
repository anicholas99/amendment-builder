import React from 'react';
import { cn } from '@/lib/utils';
import { FiChevronDown } from 'react-icons/fi';
import { ProcessedSearchHistoryEntry } from '@/types/domain/searchHistory';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SearchSelectionDropdownProps<
  T extends { id: string } = ProcessedSearchHistoryEntry,
> {
  /**
   * Currently selected search identifier (string UUID)
   */
  selectedSearchId: string | null;
  /**
   * Array of search history items. Only the `id` property is required for the dropdown,
   * so we accept a generic type constrained to `{ id: string }` to support lightweight
   * shapes such as `{ id: string; query: string }` used in other features.
   */
  searchHistory: T[];
  /**
   * Change handler propagated to parent components. Must forward the native change event.
   */
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  /**
   * If `true`, renders the dropdown inline (no absolute positioning). Default `false` keeps
   * the original absolute-positioned behaviour used in overlay contexts.
   */
  inline?: boolean;
  /**
   * Placeholder text to show when no search is selected
   */
  placeholder?: string;
}

export function SearchSelectionDropdown<
  T extends { id: string } = ProcessedSearchHistoryEntry,
>({
  selectedSearchId,
  searchHistory,
  onChange,
  inline = false,
  placeholder = 'Please select',
}: SearchSelectionDropdownProps<T>) {
  // Find the selected search to display its name
  const selectedSearch = searchHistory.find(
    entry => entry.id === selectedSearchId
  );
  const selectedIndex = selectedSearch
    ? searchHistory.indexOf(selectedSearch)
    : -1;
  const displayText = selectedSearch
    ? `Search #${searchHistory.length - selectedIndex}${selectedIndex === 0 ? ' (Latest)' : ''}`
    : placeholder;

  const handleSelect = (searchId: string) => {
    // Create a mock event to maintain compatibility with existing onChange handlers
    const mockEvent = {
      target: { value: searchId },
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(mockEvent);
  };

  return (
    <div
      className={cn(
        'min-w-[180px] z-[2]',
        inline ? 'relative' : 'absolute top-4 right-4'
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center justify-between w-full h-9 px-3 py-1.5 text-sm font-normal rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none">
          <span className="truncate">{displayText}</span>
          <FiChevronDown className="ml-2 h-4 w-4 shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="z-[9999] w-full"
          style={{
            minWidth: 'var(--radix-dropdown-menu-trigger-width)',
            transform: 'translateX(0px)',
            left: '0px',
            right: 'auto',
          }}
        >
          {searchHistory.map((entry, index) => (
            <DropdownMenuItem
              key={entry.id}
              onClick={() => handleSelect(entry.id)}
            >
              Search #{searchHistory.length - index}
              {index === 0 ? ' (Latest)' : ''}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

import React, { useState } from 'react';
import { FiSearch, FiFilter, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ProjectSearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  filterBy: string;
  onFilterChange: (filter: string) => void;
  projectCount: number;
  filteredCount: number;
}

export const ProjectSearchFilter: React.FC<ProjectSearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filterBy,
  onFilterChange,
  projectCount,
  filteredCount,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-4 px-1 pt-2">
      {/* Search Input - Clean and minimal */}
      <div className="flex-1 max-w-full md:max-w-md">
        <div className="relative">
          <FiSearch
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={14}
          />
          <Input
            placeholder="Search projects by name..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-9 h-8 text-sm border-0 bg-transparent focus:ring-0 focus:border-0"
          />
        </div>
      </div>

      {/* Minimal controls */}
      <div className="flex items-center gap-2 text-sm">
        {/* Sort By - Ghost style */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[140px] h-8 text-sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recent</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="modified">Modified</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter By Status - Ghost style */}
        <Select value={filterBy} onValueChange={onFilterChange}>
          <SelectTrigger className="w-[120px] h-8 text-sm">
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="recent">Recent</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
          </SelectContent>
        </Select>

        {/* Results count - subtle */}
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {filteredCount === projectCount
            ? `${projectCount} projects`
            : `${filteredCount}/${projectCount}`}
        </span>

        {/* Clear search - only show when searching */}
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSearchChange('')}
            className="text-xs p-1 h-auto min-w-0"
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

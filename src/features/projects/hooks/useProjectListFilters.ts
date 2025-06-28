import { useState, useMemo } from 'react';
import { ProjectData } from '@/types/project';

export type SortBy = 'name' | 'created' | 'modified' | 'recent';
export type FilterBy = 'all' | 'recent' | 'complete' | 'in-progress' | 'draft';

interface UseProjectListFiltersProps {
  projects: ProjectData[] | undefined;
}

interface UseProjectListFiltersReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: SortBy;
  handleSortChange: (sort: string) => void;
  filterBy: FilterBy;
  handleFilterChange: (filter: string) => void;
  filteredProjects: ProjectData[];
}

export function useProjectListFilters({
  projects,
}: UseProjectListFiltersProps): UseProjectListFiltersReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('modified');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy as SortBy);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilterBy(newFilter as FilterBy);
  };

  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    let filtered = [...projects];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter (when filter functionality is added)
    // if (filterBy !== 'all') { ... }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'modified':
        case 'recent':
        default:
          return (b.lastUpdated || 0) - (a.lastUpdated || 0);
      }
    });

    return filtered;
  }, [projects, searchQuery, sortBy, filterBy]);

  return {
    searchQuery,
    setSearchQuery,
    sortBy,
    handleSortChange,
    filterBy,
    handleFilterChange,
    filteredProjects,
  };
}

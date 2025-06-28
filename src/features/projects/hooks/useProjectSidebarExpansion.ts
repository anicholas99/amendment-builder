import { useState, useRef, useCallback, useEffect } from 'react';
import { ProjectData } from '@/types/project';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';

interface UseProjectSidebarExpansionProps {
  activeProject: string | null;
  projects: ProjectData[];
}

const useProjectSidebarExpansion = ({
  activeProject,
  projects,
}: UseProjectSidebarExpansionProps) => {
  const [expandedIndices, setExpandedIndices] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const lastClickTime = useRef<number>(0);

  // Handle toggling project folder expansion
  const handleProjectFolderToggle = useCallback(
    (index: number) => {
      // Check if the project is already expanded
      const isExpanded = expandedIndices.includes(index);

      // Toggle expansion state
      setExpandedIndices(prev =>
        isExpanded ? prev.filter(i => i !== index) : [...prev, index]
      );
    },
    [expandedIndices]
  );

  // Handle setting all expanded indices at once
  const setAllExpandedIndices = useCallback((indices: number[]) => {
    setExpandedIndices(indices);
  }, []);

  // Create a debounced callback factory function
  const createDebouncedCallback = useCallback(
    (callback: () => void, delay = 300) => {
      return useDebouncedCallback(callback, delay);
    },
    []
  );

  return {
    expandedIndices,
    isAnimating,
    setIsAnimating,
    handleProjectFolderToggle,
    setAllExpandedIndices,
    createDebouncedCallback,
    lastClickTime,
  };
};

export default useProjectSidebarExpansion;

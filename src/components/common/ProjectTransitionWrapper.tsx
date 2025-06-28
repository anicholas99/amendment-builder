import React, { useEffect, useState } from 'react';
import { Box, Fade } from '@chakra-ui/react';
import { useProjectData } from '@/contexts/ProjectDataContext';
import { useRouter } from 'next/router';

interface ProjectTransitionWrapperProps {
  children: React.ReactNode;
}

/**
 * ProjectTransitionWrapper provides smooth fade transitions when switching between projects
 * It monitors the active project ID and applies a fade effect during changes
 */
export const ProjectTransitionWrapper: React.FC<
  ProjectTransitionWrapperProps
> = ({ children }) => {
  const { activeProjectId } = useProjectData();
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousProjectId, setPreviousProjectId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const projectId = router.query.projectId as string;

    // Check if we're switching between different projects
    if (projectId && previousProjectId && projectId !== previousProjectId) {
      // Start transition
      setIsTransitioning(true);

      // Complete transition after a short delay
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
      }, 200);

      return () => clearTimeout(timeout);
    }

    // Update previous project ID
    if (projectId) {
      setPreviousProjectId(projectId);
    }
  }, [router.query.projectId, previousProjectId]);

  return (
    <Box
      position="relative"
      width="100%"
      height="100%"
      opacity={isTransitioning ? 0.5 : 1}
      transition="opacity 0.2s ease-in-out"
    >
      {children}
    </Box>
  );
};

export default ProjectTransitionWrapper;

import { useEffect, useRef } from 'react';
import { logger } from '@/lib/monitoring/logger';
import { useRouter } from 'next/router';
import { Box } from '@chakra-ui/react';
import AppLayout from '../../../components/layouts/AppLayout';
import SkeletonLoader from '../../../components/common/SkeletonLoader';
import { useProjectData } from '@/contexts/ProjectDataContext';

export default function ProjectPage() {
  const router = useRouter();
  const { projectId, tenant } = router.query;
  const { setActiveProject, activeProjectId: activeProject } = useProjectData();
  const hasSetProjectRef = useRef(false);

  useEffect(() => {
    // Only set active project if the URL projectId is different from the context's active project
    // and if it hasn't been set already in this component instance.
    if (
      projectId &&
      typeof projectId === 'string' &&
      projectId !== activeProject && // Check if it's actually different
      !hasSetProjectRef.current
    ) {
      logger.log(
        `ProjectPage: Detected change. Setting active project from URL: ${projectId} (current context: ${activeProject})`
      );
      hasSetProjectRef.current = true;

      // Set the active project when the component loads or URL changes to a different project
      setActiveProject(projectId);

      // Redirect to the technology view
      if (tenant) {
        router.replace(`/${tenant}/projects/${projectId}/technology`);
      }
    } else if (
      projectId &&
      projectId === activeProject &&
      !hasSetProjectRef.current
    ) {
      // If the project ID matches but we haven't triggered the redirect yet,
      // mark it as set and perform the redirect.
      // This handles the case where the context loaded the correct project before this page ran its effect.
      logger.log(
        `ProjectPage: Project ID ${projectId} already active in context. Ensuring redirect.`
      );
      hasSetProjectRef.current = true;
      if (tenant) {
        router.replace(`/${tenant}/projects/${projectId}/technology`);
      }
    }
  }, [projectId, router, setActiveProject, tenant, activeProject]);

  return (
    <AppLayout>
      <Box p={4} display="flex" justifyContent="center">
        <SkeletonLoader type="project" />
      </Box>
    </AppLayout>
  );
}

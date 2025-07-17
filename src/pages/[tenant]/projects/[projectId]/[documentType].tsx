import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { useRouter } from 'next/router';
import AppLayout from '../../../../components/layouts/AppLayout';
import { useProjectData } from '@/contexts/ProjectDataContext';
import { useProject } from '@/hooks/api/useProjects';
import { useProjectAutosave } from '@/contexts/ProjectAutosaveContext';
import { useActiveDocument } from '@/contexts/ActiveDocumentContext';
import React from 'react';
import { performanceMonitor } from '@/utils/performance';
import { useViewPrefetch } from '@/hooks/useViewPrefetch';
import { useBatchedUpdates } from '@/hooks/useBatchedUpdates';
import { useViewTransition } from '@/hooks/navigation/useViewTransition';
import type { DocumentType } from '@/types/project';

// Lazy load all views to optimize initial bundle size
const TechnologyDetailsViewClean = lazy(
  () =>
    import(
      '../../../../features/technology-details/components/TechnologyDetailsViewClean'
    )
);
const ClaimRefinementViewClean = lazy(
  () =>
    import(
      '../../../../features/claim-refinement/components/ClaimRefinementViewCleanLazy'
    )
);
const PatentApplicationViewClean = lazy(
  () =>
    import(
      '../../../../features/patent-application/components/PatentApplicationViewClean'
    )
);

// Minimal loading fallback component - properly centered in full height
const ViewLoadingFallback = () => (
  <div className="flex items-center justify-center h-full min-h-screen">
    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function DocumentTypePage() {
  const router = useRouter();
  const [hasError, setHasError] = useState(false);
  const [viewType, setViewType] = useState<DocumentType | null>(null);
  const batchUpdates = useBatchedUpdates();

  // Refs for tracking state across renders
  const lastProjectIdRef = useRef<string | null>(null);
  const lastDocumentTypeRef = useRef<string | null>(null);

  // Extract router params as strings
  const routerProjectId = Array.isArray(router.query.projectId)
    ? router.query.projectId[0]
    : router.query.projectId;
  const routerDocumentType = Array.isArray(router.query.documentType)
    ? router.query.documentType[0]
    : router.query.documentType;

  // Check if this is likely a new project by looking at the referrer or navigation state
  const isLikelyNewProject = useRef(false);
  useEffect(() => {
    // Check if we came from project creation (modal or dashboard)
    const referrer = document.referrer;
    const fromProjectCreation =
      referrer.includes('/projects') &&
      !referrer.includes('/projects/') &&
      routerDocumentType === 'technology';

    if (fromProjectCreation) {
      isLikelyNewProject.current = true;
    }
  }, [routerProjectId, routerDocumentType]);

  // Context hooks
  const { setActiveProject, activeProjectId } = useProjectData();
  const { setActiveDocument } = useActiveDocument();
  const { textInput, setTextInput } = useProjectAutosave();

  // Prefetch adjacent views for smooth transitions
  useViewPrefetch();

  // Use existing view transition hook for data prefetching
  useViewTransition();

  // Track the current project to detect changes
  const currentProjectRef = useRef<string | null>(null);
  const [isProjectChanging, setIsProjectChanging] = useState(false);

  // Only fetch data for the router's project ID
  const { data: project } = useProject(routerProjectId || null);

  // Simplified transition management
  const viewSwitchTimerRef = useRef<string | null>(null);

  // Detect project changes and manage transition state
  useEffect(() => {
    if (!routerProjectId) return;

    // Start performance timer
    if (viewSwitchTimerRef.current) {
      performanceMonitor.endTimer(viewSwitchTimerRef.current);
    }
    viewSwitchTimerRef.current = performanceMonitor.startTimer(
      'View Switch',
      `view-switch-${routerProjectId}-${routerDocumentType}`
    );

    if (
      currentProjectRef.current &&
      currentProjectRef.current !== routerProjectId
    ) {
      // Project is changing - simplified transition
      setIsProjectChanging(true);

      // Use a single timeout for smoother transition
      const transitionTimer = setTimeout(() => {
        batchUpdates(() => {
          currentProjectRef.current = routerProjectId;
          setActiveProject(routerProjectId);
          setIsProjectChanging(false);
        });
      }, 150); // Reduced from complex nested RAF to simple timeout

      return () => clearTimeout(transitionTimer);
    } else if (!currentProjectRef.current) {
      // Initial load - batch all updates
      batchUpdates(() => {
        currentProjectRef.current = routerProjectId;
        setActiveProject(routerProjectId);
      });
    }
  }, [routerProjectId, setActiveProject, batchUpdates]);

  // Set active document - but only after project is set
  useEffect(() => {
    if (routerProjectId && routerDocumentType && !isProjectChanging) {
      // Clear first to prevent any data leak
      setActiveDocument(null);

      // Then set the new document
      requestAnimationFrame(() => {
        setActiveDocument({
          projectId: routerProjectId,
          documentType: routerDocumentType as
            | 'technology'
            | 'claim-refinement'
            | 'patent',
          content: '',
        });
      });

      // End performance timer when everything is loaded
      if (viewSwitchTimerRef.current) {
        performanceMonitor.endTimer(viewSwitchTimerRef.current);
        viewSwitchTimerRef.current = null;
      }
    }

    // Clear on unmount or when project changes
    return () => {
      setActiveDocument(null);
    };
  }, [
    routerProjectId,
    routerDocumentType,
    setActiveDocument,
    isProjectChanging,
  ]);

  // Set the view type based on the document type
  const documentType = routerDocumentType || 'technology';

  // Update view type in effect to avoid render-time state updates
  useEffect(() => {
    if (
      documentType === 'technology' ||
      documentType === 'claim-refinement' ||
      documentType === 'patent'
    ) {
      setViewType(documentType as DocumentType);
    }
  }, [documentType]);

  // Only show loading for missing project ID (shouldn't happen in normal flow)
  if (!routerProjectId) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full min-h-screen">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  // Render the appropriate view based on document type
  const renderView = () => {
    // Use both projectId and documentType as key to ensure proper unmounting when switching views
    const componentKey = `${routerProjectId}-${documentType}`;

    switch (documentType) {
      case 'technology':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <TechnologyDetailsViewClean key={componentKey} />
          </Suspense>
        );
      case 'claim-refinement':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <ClaimRefinementViewClean key={componentKey} />
          </Suspense>
        );
      case 'patent':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <PatentApplicationViewClean key={componentKey} />
          </Suspense>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full min-h-screen">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        );
    }
  };

  return (
    <AppLayout>
      <div className="w-full h-full overflow-auto flex flex-col bg-background">
        {renderView()}
      </div>
    </AppLayout>
  );
}

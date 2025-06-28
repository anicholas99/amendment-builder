import React from 'react';
import { Box } from '@chakra-ui/react';
import { useCurrentProjectId } from '@/hooks/useCurrentProjectId';
import ViewLayout from '@/components/layouts/ViewLayout';
import { useProject } from '@/hooks/api/useProjects';
import PatentHeader from './PatentHeader';
import PatentMainPanel from './PatentMainPanel';
import PatentSidebar from './PatentSidebar';
import PatentGenerationPlaceholder from './PatentGenerationPlaceholder';
import PriorArtSelector from './PriorArtSelector';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import { VIEW_LAYOUT_CONFIG } from '@/constants/layout';

// Hook imports
import { useInventionData } from '@/hooks/useInventionData';
import { useLatestVersionQuery } from '@/hooks/api/useProjects';
import { usePatentApplicationManagerV3 } from '../hooks/usePatentApplicationManagerV3';
import { logger } from '@/lib/monitoring/logger';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Clean Patent Application View
 * Simplified component that uses a composite hook for all state management
 */
const PatentApplicationViewClean: React.FC = () => {
  const projectId = useCurrentProjectId() || '';

  // Debug: Track component mounting
  React.useEffect(() => {
    logger.debug('[PatentApplicationViewClean] Component mounted', { projectId });
    return () => {
      logger.debug('[PatentApplicationViewClean] Component unmounted', { projectId });
    };
  }, [projectId]);

  // --- Data Fetching ---
  const { data: activeProjectData, isLoading: isProjectLoading } =
    useProject(projectId);
  const { data: inventionData, isLoading: isInventionLoading } =
    useInventionData(projectId);
  const {
    data: latestVersion,
    isLoading: isLatestVersionLoading,
    isError: isLatestVersionError,
    error: latestVersionError,
  } = useLatestVersionQuery(projectId);

  // --- Application State Management ---
  const {
    // UI State
    selectedRefIds,
    setSelectedRefIds,
    currentFigure,
    setCurrentFigure,
    activeTab,
    setActiveTab,

    // Content State
    patentContent,
    hasGenerated,
    isSaving,
    hasUnsavedChanges,
    isContentReady,

    // Generation
    isGenerating,
    generationProgress,
    handleGeneratePatent,

    // Content Operations
    handleSaveContent,
    handleExport,
    refreshContent,
    saveOnBlur,

    // Version Operations
    handleSaveNewVersion,
    handleLoadVersion,
    handleResetApplication,

    // Derived Data
    priorArtItems,
  } = usePatentApplicationManagerV3({
    projectId,
    activeProjectData,
    inventionData,
  });
  
  // Warn users about unsaved changes when navigating away
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Memoize PriorArtSelector to prevent re-renders on autosave updates
  const memoizedPriorArtSelector = React.useMemo(() => (
    <PriorArtSelector
      priorArtItems={priorArtItems}
      selectedIds={selectedRefIds}
      onChange={setSelectedRefIds}
    />
  ), [priorArtItems, selectedRefIds, setSelectedRefIds]);

  // --- Rendering ---
  // Wait for critical project/invention data first
  const isCriticalDataLoading = isProjectLoading || isInventionLoading;
  const hasCriticalData = !isCriticalDataLoading && activeProjectData && inventionData;

  // OPTIMIZATION: Don't show skeleton if we're just switching between views
  // Check if draft documents are already in cache to avoid flicker
  const queryClient = useQueryClient();
  const hasCachedDraftData = React.useMemo(() => {
    if (!projectId) return false;
    const cachedData = queryClient.getQueryData(['draft', 'documents', projectId]);
    return cachedData !== undefined && Array.isArray(cachedData) && cachedData.length > 0;
  }, [queryClient, projectId]);

  // Also check if we already have patent content (from previous loads)
  const hasExistingContent = patentContent && patentContent.trim().length > 0;

  if (!hasCriticalData) {
    return (
      <ViewLayout
        header={<PatentHeader />}
        mainContent={
          <Box p={6}>
            <SkeletonLoader type="document" />
          </Box>
        }
        sidebarContent={
          <Box p={4}>
            <SkeletonLoader type="sidebar" />
          </Box>
        }
        {...VIEW_LAYOUT_CONFIG.DEFAULT_PROPS}
      />
    );
  }

  // DEFINITIVE FIX: Single reliable signal that waits for BOTH data loading AND hasGenerated processing
  // This eliminates the race condition where hasGenerated is stale during render
  // BUT: If we have cached data OR existing content, we can skip the skeleton to prevent flicker
  const shouldShowSkeleton = !isContentReady && !hasCachedDraftData && !hasExistingContent;
  
  if (shouldShowSkeleton) {
    return (
      <ViewLayout
        header={<PatentHeader />}
        mainContent={
          <Box p={6}>
            <SkeletonLoader type="document" />
          </Box>
        }
        sidebarContent={
          <PatentSidebar
            currentFigure={currentFigure}
            setCurrentFigure={setCurrentFigure}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleGeneratePatent={() => handleGeneratePatent(selectedRefIds)}
            isGenerating={isGenerating}
            generationProgress={generationProgress}
            setContent={newContent => handleSaveContent(false, newContent)}
            setPreviousContent={() => {}}
            refreshContent={refreshContent}
          />
        }
        {...VIEW_LAYOUT_CONFIG.DEFAULT_PROPS}
      />
    );
  }

  const mainContent = !hasGenerated ? (
    <PatentGenerationPlaceholder
      onGenerate={() => handleGeneratePatent(selectedRefIds)}
      isGenerating={isGenerating}
      generationProgress={generationProgress}
      extras={memoizedPriorArtSelector}
    />
  ) : (
    <PatentMainPanel
      content={patentContent}
      setContent={newContent => handleSaveContent(false, newContent)}
      previousContent={null}
      onContentUpdate={() => handleSaveContent(true)}
      onUndoContent={() => {
        /* no-op */
      }}
      handleGenerateButtonClick={() => handleGeneratePatent(selectedRefIds)}
      isGenerating={isGenerating}
      patentTitle={activeProjectData?.name || 'Patent Application'}
      analyzedInvention={inventionData as any}
      generationProgress={generationProgress}
      onSaveVersion={handleSaveNewVersion}
      onLoadVersion={handleLoadVersion}
      projectId={projectId}
      handleResetApplication={handleResetApplication}
      isSaving={isSaving}
      hasUnsavedChanges={hasUnsavedChanges}
      onBlur={saveOnBlur}
    />
  );

  return (
    <ViewLayout
      header={<PatentHeader />}
      mainContent={mainContent}
      sidebarContent={
        <PatentSidebar
          currentFigure={currentFigure}
          setCurrentFigure={setCurrentFigure}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleGeneratePatent={() => handleGeneratePatent(selectedRefIds)}
          isGenerating={isGenerating}
          generationProgress={generationProgress}
          setContent={newContent => handleSaveContent(false, newContent)}
          setPreviousContent={() => {}}
          refreshContent={refreshContent}
        />
      }
      {...VIEW_LAYOUT_CONFIG.DEFAULT_PROPS}
    />
  );
};

export default PatentApplicationViewClean;

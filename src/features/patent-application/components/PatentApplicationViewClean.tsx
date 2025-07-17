import React, { useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import { useSectionSync } from '../hooks/useSectionSync';
import ViewLayout from '@/components/layouts/ViewLayout';
import ProductivityViewLayout from '@/components/layouts/ProductivityViewLayout';
import { TooltipProvider } from '@/components/ui/tooltip';
import PatentMainPanel from './PatentMainPanel';
import PatentSidebar from './PatentSidebar';
import PatentHeader from './PatentHeader';
import PatentGenerationPlaceholder from './PatentGenerationPlaceholder';
import FiguresTab from '@/components/common/FiguresTab';
import { PatentEditorProvider } from '@/contexts/PatentEditorContext';
import { SectionSyncDialog } from './SectionSyncDialog';
import { ResetApplicationModal } from './ResetApplicationModal';
import { PatentApplicationSkeleton } from './PatentApplicationSkeleton';
import { useLayout } from '@/contexts/LayoutContext';
import { VIEW_LAYOUT_CONFIG } from '@/constants/layout';
import { Editor } from '@tiptap/react';
import { useProject } from '@/hooks/api/useProjects';
import { useInventionQuery } from '@/hooks/api/useInvention';
import { InventionData } from '@/types/invention';
import { useSimplePatentApplicationManager } from '../hooks/useSimplePatentApplicationManager';
import { AgentEditNotificationManager } from './AgentEditNotification';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimeout } from '@/hooks/useTimeout';
import { logger } from '@/utils/clientLogger';

interface PatentEditorRef {
  handleUndo: () => void;
  handleRedo: () => void;
  getEditor: () => Editor | null;
  triggerSearch: (searchTerm: string) => void;
}

const PatentApplicationViewClean: React.FC = () => {
  const router = useRouter();
  const { projectId } = router.query;
  const queryClient = useQueryClient();

  // Track editor instance for context
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const editorRef = useRef<PatentEditorRef | null>(null);

  // Productivity mode state
  const { isProductivityMode } = useLayout();

  // Data loading
  const {
    data: activeProjectData,
    isLoading: isProjectLoading,
    isFetching: _isProjectFetching,
  } = useProject(projectId as string);

  const {
    data: inventionData,
    isLoading: isInventionLoading,
    isFetching: _isInventionFetching,
  } = useInventionQuery(projectId as string);

  // UI State (managed locally since simplified version doesn't include these)
  const [selectedRefIds, setSelectedRefIds] = useState<string[]>([]);
  const [currentFigure, setCurrentFigure] = useState('FIG. 1');
  const [activeTab, setActiveTab] = useState(0);

  // Sync current figure with available figures
  React.useEffect(() => {
    if (
      inventionData?.figures &&
      Object.keys(inventionData.figures).length > 0 &&
      !Object.keys(inventionData.figures).includes(currentFigure)
    ) {
      const firstFigureKey = Object.keys(inventionData.figures)[0];
      if (firstFigureKey) {
        setCurrentFigure(firstFigureKey);
      }
    }
  }, [inventionData, currentFigure]);

  // Memoize props to prevent re-renders
  const patentManagerProps = React.useMemo(() => ({
    projectId: projectId as string,
    activeProjectData: activeProjectData ?? null,
    inventionData,
  }), [projectId, activeProjectData, inventionData]);

  // Patent application management (simplified)
  const {
    // Content State
    patentContent,
    hasGenerated,
    isSaving,
    isContentReady,

    // Generation
    isGenerating,
    generationProgress,
    handleGeneratePatent,
    completeProgress,

    // Content Operations
    updateContent,
    saveOnBlur,
    handleExport,

    // Version Operations
    handleSaveNewVersion,
    handleLoadVersion,
    handleResetApplication,
    isResetModalOpen,
    onResetModalClose,
    isResetting,
    handleResetApplicationConfirm,

    // Derived Data
    priorArtItems,
  } = useSimplePatentApplicationManager(patentManagerProps);

  // Create wrapper functions to match existing interface
  const handleSaveContent = useCallback(
    (showToast: boolean = true, newContent?: string) => {
      if (newContent !== undefined) {
        updateContent(newContent);
      }
      if (showToast) {
        saveOnBlur();
      }
    },
    [updateContent, saveOnBlur]
  );

  const refreshContent = useCallback(() => {
    // Invalidate draft documents cache to trigger a refresh without page reload
    logger.info('[PatentApplicationViewClean] Refreshing content via cache invalidation');
    
    // The useSimplePatentApplicationManager hook will automatically refetch
    // when the underlying query is invalidated, no need for hard reload
    queryClient.invalidateQueries({
      queryKey: ['draftDocuments', projectId],
      exact: false,
    });
  }, [projectId, queryClient]);

  // For compatibility
  const hasUnsavedChanges = isSaving;
  const editorSyncKey = 0; // Not needed in simplified version

  // --- Section Sync ---
  const sectionSync = useSectionSync();

  // Search callback for reference numerals
  const handleSearchReferenceNumeral = React.useCallback(
    (numeralId: string) => {
      if (editorRef.current?.triggerSearch) {
        editorRef.current.triggerSearch(numeralId);
      }
    },
    []
  );

  // Warn users about unsaved changes when navigating away
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSaving) {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isSaving]);

  // Preserve scroll position when switching layouts
  const scrollPositionRef = React.useRef<number>(0);

  React.useEffect(() => {
    // Save scroll position before layout switch
    const saveScrollPosition = () => {
      const mainContent = document.querySelector('.tiptap-editor-container');
      if (mainContent) {
        scrollPositionRef.current = mainContent.scrollTop;
      }
    };

    // Restore scroll position after layout switch
    const restoreScrollPosition = () => {
      requestAnimationFrame(() => {
        const mainContent = document.querySelector('.tiptap-editor-container');
        if (mainContent && scrollPositionRef.current > 0) {
          mainContent.scrollTop = scrollPositionRef.current;
        }
      });
    };

    // Save before mode changes
    saveScrollPosition();

    // Restore after render
    restoreScrollPosition();
  }, [isProductivityMode]);

  // --- Single Rendering Decision Point ---
  // Use React Query states directly to determine what to render
  const isCriticalDataLoading = isProjectLoading || isInventionLoading;
  const hasCriticalData = activeProjectData && inventionData;

  // Determine content state from actual data
  const hasPatentContent = activeProjectData?.hasPatentContent === true;
  const hasAnyContent = hasPatentContent || patentContent?.trim().length > 0;

  // Clear rendering states - render editor in background during generation
  const showSkeleton = isCriticalDataLoading;
  const showPlaceholder = hasCriticalData && (!hasAnyContent || isGenerating);
  const showEditor = hasCriticalData && hasAnyContent; // Always render if content exists
  const hideEditor = isGenerating; // Hide editor during generation but keep it rendered

  // Simplified transition state - just track when we're transitioning from generating to complete
  const [showTransition, setShowTransition] = useState(false);

  React.useEffect(() => {
    if (!isGenerating && generationProgress >= 95 && hasAnyContent) {
      setShowTransition(true);
    } else {
      setShowTransition(false);
    }
  }, [isGenerating, generationProgress, hasAnyContent]);

  // Use useTimeout to hide the transition after 2 seconds
  useTimeout(
    () => {
      if (showTransition) {
        setShowTransition(false);
      }
    },
    showTransition ? 2000 : null
  );

  // Use ProductivityViewLayout when in productivity mode
  const LayoutComponent = isProductivityMode
    ? ProductivityViewLayout
    : ViewLayout;

  // Memoize sidebar content to prevent re-renders during layout transitions
  const sidebarContent = React.useMemo(() => {
    if (isProductivityMode) {
      // In productivity mode, show figures directly without tabs
      return (
        <FiguresTab
          projectId={projectId as string}
          inventionData={inventionData || null}
          currentFigure={currentFigure}
          setCurrentFigure={setCurrentFigure}
          onSearchReferenceNumeral={handleSearchReferenceNumeral}
        />
      );
    }

    // In normal mode, show the full sidebar with tabs
    return (
      <PatentSidebar
        currentFigure={currentFigure}
        setCurrentFigure={setCurrentFigure}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleGeneratePatent={() => handleGeneratePatent(selectedRefIds)}
        isGenerating={isGenerating}
        generationProgress={generationProgress}
        setContent={newContent => handleSaveContent(false, newContent)}
        setPreviousContent={() => {
          /* no-op - legacy prop */
        }}
        refreshContent={refreshContent}
        onSearchReferenceNumeral={handleSearchReferenceNumeral}
      />
    );
  }, [
    isProductivityMode,
    projectId,
    inventionData,
    currentFigure,
    setCurrentFigure,
    activeTab,
    setActiveTab,
    selectedRefIds,
    isGenerating,
    generationProgress,
    handleSaveContent,
    handleGeneratePatent,
    refreshContent,
    handleSearchReferenceNumeral,
  ]);

  // Show skeleton if toggle is on or if actually loading
  if (showSkeleton) {
    return (
      <TooltipProvider>
        <PatentApplicationSkeleton />
      </TooltipProvider>
    );
  }

  // Placeholder state - no content exists
  if (showPlaceholder && !showEditor) {
    return (
      <TooltipProvider>
        <LayoutComponent
          header={<PatentHeader hideTitle={false} />}
          mainContent={
            <div className="h-full p-4">
              <PatentGenerationPlaceholder
                onGenerate={(selectedRefs?: string[]) =>
                  handleGeneratePatent(selectedRefs || selectedRefIds)
                }
                isGenerating={isGenerating}
                generationProgress={generationProgress}
                priorArtItems={priorArtItems}
              />
            </div>
          }
          sidebarContent={sidebarContent}
          {...VIEW_LAYOUT_CONFIG.DEFAULT_PROPS}
        />
      </TooltipProvider>
    );
  }

  // Editor state - content exists or is being generated
  const mainContent = (
    <PatentMainPanel
      content={patentContent}
      hasGenerated={hasGenerated}
      setContent={newContent => handleSaveContent(false, newContent)}
      previousContent={null}
      onContentUpdate={() => handleSaveContent(true)}
      onUndoContent={() => {
        /* no-op */
      }}
      handleGenerateButtonClick={selectedRefs =>
        handleGeneratePatent(selectedRefs || selectedRefIds)
      }
      isGenerating={isGenerating}
      patentTitle={activeProjectData?.name || 'Patent Application'}
      analyzedInvention={inventionData as InventionData | null}
      generationProgress={generationProgress}
      onSaveVersion={handleSaveNewVersion}
      onLoadVersion={handleLoadVersion}
      projectId={projectId as string}
      handleResetApplication={handleResetApplication}
      isSaving={isSaving}
      hasUnsavedChanges={hasUnsavedChanges}
      onBlur={saveOnBlur}
      priorArtItems={priorArtItems}
      onEditorReady={ref => {
        editorRef.current = ref;
        // Extract the actual editor instance for the context
        if (ref?.getEditor) {
          setEditorInstance(ref.getEditor());
        }
      }}
      editorSyncKey={editorSyncKey}
      completeProgress={completeProgress}
    />
  );

  // Render both placeholder and editor when generating (editor hidden in background)
  if (showPlaceholder && showEditor) {
    return (
      <TooltipProvider>
        <LayoutComponent
          header={<PatentHeader hideTitle={false} />}
          mainContent={
            <div className="relative h-full overflow-hidden">
              <AnimatePresence>
                {/* Loading placeholder - visible during generation */}
                {hideEditor && (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.5,
                      ease: 'easeOut',
                    }}
                    className="absolute inset-0 z-10 p-4"
                  >
                    <PatentGenerationPlaceholder
                      onGenerate={(selectedRefs?: string[]) =>
                        handleGeneratePatent(selectedRefs || selectedRefIds)
                      }
                      isGenerating={isGenerating}
                      generationProgress={generationProgress}
                      priorArtItems={priorArtItems}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Editor - always rendered, just hidden during generation */}
              <motion.div
                key="editor"
                initial={false}
                animate={{
                  opacity: hideEditor ? 0 : 1,
                  scale: hideEditor ? 0.98 : 1,
                }}
                transition={{
                  duration: 0.6,
                  ease: 'easeOut',
                }}
                className="absolute inset-0"
                style={{
                  pointerEvents: hideEditor ? 'none' : 'auto',
                }}
              >
                {mainContent}
              </motion.div>

              {/* Success overlay animation */}
              <AnimatePresence>
                {showTransition && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 260,
                        damping: 20,
                      }}
                      className="bg-green-500/10 backdrop-blur-sm rounded-full p-8"
                    >
                      <svg
                        className="w-16 h-16 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          }
          sidebarContent={sidebarContent}
          {...VIEW_LAYOUT_CONFIG.DEFAULT_PROPS}
        />
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <PatentEditorProvider editor={editorInstance}>
        <LayoutComponent
          header={<PatentHeader hideTitle={false} />}
          mainContent={mainContent}
          sidebarContent={sidebarContent}
          {...VIEW_LAYOUT_CONFIG.DEFAULT_PROPS}
        />

        {/* Section Sync Dialog */}
        <SectionSyncDialog
          isOpen={sectionSync.isOpen}
          onClose={sectionSync.closeSync}
          projectId={projectId as string}
          changeTypes={sectionSync.changeTypes}
          onSync={() => {
            // Refresh content after successful sync
            refreshContent();
          }}
        />

        {/* Reset Application Modal */}
        <ResetApplicationModal
          isOpen={isResetModalOpen}
          onClose={onResetModalClose}
          onConfirm={handleResetApplicationConfirm}
          isResetting={isResetting}
        />

        {/* Agent Edit Notifications with Undo */}
        <AgentEditNotificationManager />
      </PatentEditorProvider>
    </TooltipProvider>
  );
};

export default PatentApplicationViewClean;

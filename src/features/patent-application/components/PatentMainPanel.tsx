import React, { useState, useRef } from 'react';
import { Editor } from '@tiptap/react';
import PatentEditor from './TiptapPatentEditorLazy';
import PatentGenerationPlaceholder from './PatentGenerationPlaceholder';
import VersionsHistoryModal from './VersionsHistoryModal';
import { InventionData } from '@/types/invention';
import { PatentEditorHeader } from './PatentEditorHeader';
import { SimpleMainPanel } from '@/components/common/SimpleMainPanel';
import {
  usePatentEditorToolbar,
  useResponsiveToolbar,
  useSaveStatusIndicator,
} from '../hooks';
import {
  handlePatentExport,
  extractProjectIdFromUrl,
} from '../utils/patentExportUtils';

interface PatentEditorRef {
  handleUndo: () => void;
  handleRedo: () => void;
  getEditor: () => Editor | null;
  triggerSearch: (searchTerm: string) => void;
  applyAgentSectionContent: (sectionType: string, newContent: string) => void;
  flushPendingUpdates: () => void;
}

type SavedPriorArt = {
  id: string;
  patentNumber: string;
  title?: string | null;
  abstract?: string | null;
  authors?: string | null;
  year?: string | null;
  notes?: string | null;
  claim1?: string | null;
  summary?: string | null;
};

interface PatentMainPanelProps {
  content: string | null;
  hasGenerated?: boolean;
  setContent: (content: string) => void;
  previousContent: string | null;
  onContentUpdate: (newContent: string) => void;
  onUndoContent: () => void;
  handleGenerateButtonClick: (selectedRefs?: string[]) => void;
  isGenerating: boolean;
  patentTitle?: string;
  analyzedInvention?: InventionData | null;
  generationProgress?: number;
  onSaveVersion?: (versionName: string) => Promise<void>;
  onLoadVersion?: (versionId: string) => Promise<void>;
  projectId?: string;
  handleResetApplication?: () => void;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  onBlur?: () => void;
  priorArtItems?: SavedPriorArt[];
  onEditorReady?: (editorRef: PatentEditorRef) => void;
  editorSyncKey?: number;
  completeProgress?: (showSuccessToast?: boolean) => void;
}

/**
 * Main panel for editing and managing patent content in the Patent Application view
 */
const PatentMainPanel: React.FC<PatentMainPanelProps> = ({
  content,
  hasGenerated = false,
  setContent,
  previousContent: _previousContent,
  onContentUpdate: _onContentUpdate,
  onUndoContent: _onUndoContent,
  handleGenerateButtonClick,
  isGenerating,
  patentTitle = 'Patent Application',
  analyzedInvention,
  generationProgress = 0,
  onSaveVersion,
  onLoadVersion,
  projectId,
  handleResetApplication,
  isSaving = false,
  hasUnsavedChanges = false,
  onBlur,
  priorArtItems = [],
  onEditorReady,
  editorSyncKey = 0,
  completeProgress,
}) => {
  // We now assume we're always in edit mode for individual sections
  const [isEditMode] = useState(true);

  // State for version history modal
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);

  // Ref to access the editor instance
  const editorRef = useRef<PatentEditorRef | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Call onEditorReady when editor is mounted
  React.useEffect(() => {
    if (editorRef.current && onEditorReady) {
      onEditorReady(editorRef.current);
    }
  }, [editorRef, onEditorReady]);

  // Set this to false in production
  const FORCE_SHOW_VERSION_UI = false;

  // Use provided projectId, or extract from URL if missing
  const actualProjectId = projectId || extractProjectIdFromUrl();

  // Add a flag to determine if we can show version UI
  const canShowVersionUI = !!actualProjectId || FORCE_SHOW_VERSION_UI;

  // Use custom hooks
  const { editor, zoomLevel, handleZoomIn, handleZoomOut, handleResetZoom } =
    usePatentEditorToolbar({ editorRef });

  const { visibleButtons } = useResponsiveToolbar(containerRef);

  const { showSaved } = useSaveStatusIndicator({
    isSaving,
    hasUnsavedChanges,
  });

  // Export handler
  const handleExportDocx = () => {
    // Get the editor instance from the ref
    const editorInstance = editorRef.current?.getEditor();
    handlePatentExport(
      content || '', // Use the current content directly
      patentTitle,
      analyzedInvention || null,
      editorInstance
    );
  };

  // Header content - consistent with other views
  const headerContent = (
    <div className="relative">
      <PatentEditorHeader
        editor={editor}
        zoomLevel={zoomLevel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onExportDocx={handleExportDocx}
        onResetApplication={handleResetApplication}
        onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
        onSaveVersion={
          onSaveVersion
            ? async (description?: string) => {
                await onSaveVersion(description || 'Version saved');
              }
            : undefined
        }
        canShowVersionUI={canShowVersionUI}
        visibleButtons={visibleButtons}
        isSaving={isSaving}
        showSaved={showSaved}
        hasUnsavedChanges={hasUnsavedChanges}
        actualProjectId={actualProjectId ?? undefined}
      />
    </div>
  );

  // Always render the editor container - parent decides what content to show
  return (
    <>
      <SimpleMainPanel
        header={headerContent}
        reserveScrollbarGutter={false}
        contentPadding={false}
        contentStyles={{ overflow: 'hidden' }}
      >
        <PatentEditor
          key={`patent-editor-${projectId || 'default'}`}
          ref={editorRef}
          content={content || ''} // Pass the current content directly
          setContent={setContent}
          isEditMode={isEditMode}
          hasGenerated={hasGenerated}
          zoomLevel={zoomLevel}
          containerRef={containerRef}
          onBlur={onBlur}
          projectId={projectId ? projectId : undefined}
          completeProgress={completeProgress}
        />
      </SimpleMainPanel>

      {/* Hidden button for version history - can be triggered from header */}
      <button
        id="version-history-button"
        className="hidden"
        onClick={() => setIsVersionHistoryOpen(true)}
      />

      {/* Version History Modal */}
      {canShowVersionUI && onLoadVersion && (
        <VersionsHistoryModal
          isOpen={isVersionHistoryOpen}
          onClose={() => setIsVersionHistoryOpen(false)}
          projectId={actualProjectId || ''}
          onLoadVersion={onLoadVersion}
          hasUnsavedChanges={hasUnsavedChanges}
          onSaveCurrentVersion={onSaveVersion}
        />
      )}
    </>
  );
};

export default PatentMainPanel;

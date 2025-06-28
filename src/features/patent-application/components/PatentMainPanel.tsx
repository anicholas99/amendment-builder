import React, { useState, useRef } from 'react';
import { Editor } from '@tiptap/react';
import PatentEditor from './TiptapPatentEditorLazy';
import PatentGenerationPlaceholder from './PatentGenerationPlaceholder';
import { SimpleMainPanel } from '@/components/common/SimpleMainPanel';
import VersionsHistoryModal from './VersionsHistoryModal';
import { InventionData } from '@/types/invention';
import { PatentEditorHeader } from './PatentEditorHeader';
import { PatentEditorFooter } from './PatentEditorFooter';
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
}

interface PatentMainPanelProps {
  content: string | null;
  setContent: (content: string) => void;
  previousContent: string | null;
  onContentUpdate: (newContent: string) => void;
  onUndoContent: () => void;
  handleGenerateButtonClick: () => void;
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
}

/**
 * Main panel for editing and managing patent content in the Patent Application view
 */
const PatentMainPanel: React.FC<PatentMainPanelProps> = ({
  content,
  setContent,
  previousContent: _previousContent,
  onContentUpdate: _onContentUpdate,
  onUndoContent: _onUndoContent,
  handleGenerateButtonClick,
  isGenerating,
  patentTitle = 'Patent Application',
  analyzedInvention,
  generationProgress: _generationProgress = 0,
  onSaveVersion,
  onLoadVersion,
  projectId,
  handleResetApplication,
  isSaving = false,
  hasUnsavedChanges = false,
  onBlur,
}) => {
  // We now assume we're always in edit mode for individual sections
  const [isEditMode] = useState(true);

  // State for version history modal
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);

  // Ref to access the editor instance
  const editorRef = useRef<PatentEditorRef | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set this to false in production
  const FORCE_SHOW_VERSION_UI = false;

  // Use provided projectId, or extract from URL if missing
  const actualProjectId = projectId || extractProjectIdFromUrl();

  // Add a flag to determine if we can show version UI
  const canShowVersionUI = !!actualProjectId || FORCE_SHOW_VERSION_UI;

  // Use custom hooks
  const {
    editor,
    zoomLevel,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    characterCount,
    wordCount,
  } = usePatentEditorToolbar({ editorRef });

  const { visibleButtons } = useResponsiveToolbar(containerRef);

  const { showSaved } = useSaveStatusIndicator({
    isSaving,
    hasUnsavedChanges,
  });

  // Export handler
  const handleExportDocx = () => {
    handlePatentExport(content, patentTitle, analyzedInvention || null);
  };

  if (!content) {
    return (
      <SimpleMainPanel contentPadding={false}>
        <PatentGenerationPlaceholder
          onGenerate={handleGenerateButtonClick}
          isGenerating={isGenerating}
        />
      </SimpleMainPanel>
    );
  }

  return (
    <>
      <SimpleMainPanel
        header={
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
            actualProjectId={actualProjectId}
          />
        }
        contentPadding={false}
        footer={
          editor && (
            <PatentEditorFooter
              wordCount={wordCount}
              characterCount={characterCount}
            />
          )
        }
      >
        <PatentEditor
          ref={editorRef}
          content={content}
          setContent={setContent}
          isEditMode={isEditMode}
          hasGenerated={true}
          zoomLevel={zoomLevel}
          containerRef={containerRef}
          onBlur={onBlur}
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

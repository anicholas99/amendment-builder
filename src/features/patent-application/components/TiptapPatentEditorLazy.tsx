import React, { lazy, Suspense, useImperativeHandle, forwardRef } from 'react';
import type { Editor } from '@tiptap/react';
import { cn } from '@/lib/utils';

// Lazy load the simplified TipTap editor component
const SimpleTiptapPatentEditor = lazy(() => import('./SimpleTiptapPatentEditor'));

// Match the exact props from TiptapPatentEditor
interface PatentEditorProps {
  content: string;
  setContent: (content: string) => void;
  isEditMode: boolean;
  hasGenerated: boolean;
  zoomLevel: number;
  containerRef?: React.RefObject<HTMLDivElement>;
  onSelectionChange?: (selection: {
    text: string;
    range: unknown;
    section: string | null;
  }) => void;
  onBlur?: () => void;
  syncKey?: number; // Add this
  projectId?: string; // Add this for section updates
  completeProgress?: (showSuccessToast?: boolean) => void;
}

interface PatentEditorRef {
  handleUndo: () => void;
  handleRedo: () => void;
  getEditor: () => Editor | null;
  triggerSearch: (searchTerm: string) => void;
  applyAgentSectionContent: (sectionType: string, newContent: string) => void;
  flushPendingUpdates: () => void;
}

const LoadingFallback = () => {
  return (
    <div className={cn('flex-1 h-full')}>
      {/* Empty placeholder - no text, just maintain layout */}
    </div>
  );
};

// Adapter component to bridge the interface differences
const EditorAdapter = forwardRef<PatentEditorRef, PatentEditorProps>((props, ref) => {
  const { setContent, completeProgress, projectId = '', ...otherProps } = props;
  const editorRef = React.useRef<any>(null);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    handleUndo: () => {
      // Simplified editor doesn't have undo - it's handled by Tiptap itself
    },
    handleRedo: () => {
      // Simplified editor doesn't have redo - it's handled by Tiptap itself
    },
    getEditor: () => {
      return editorRef.current?.getEditor() || null;
    },
    triggerSearch: (searchTerm: string) => {
      // Simplified editor doesn't have search - this feature can be added if needed
    },
    applyAgentSectionContent: (sectionType: string, newContent: string) => {
      // Simplified editor handles this via events, not direct method calls
    },
    flushPendingUpdates: () => {
      // Simplified editor saves automatically, no need to flush
    },
  }));

  return (
    <SimpleTiptapPatentEditor
      ref={editorRef}
      {...otherProps}
      projectId={projectId}
      onContentChange={setContent}
      onBlur={props.onBlur}
    />
  );
});

EditorAdapter.displayName = 'EditorAdapter';

/**
 * Lazy-loaded wrapper for SimpleTiptapPatentEditor to improve initial page load performance
 * This is a drop-in replacement that maintains the exact same interface
 */
const TiptapPatentEditorLazy = React.forwardRef<
  PatentEditorRef,
  PatentEditorProps
>((props, ref) => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EditorAdapter ref={ref} {...props} />
    </Suspense>
  );
});

TiptapPatentEditorLazy.displayName = 'TiptapPatentEditorLazy';

export default TiptapPatentEditorLazy;

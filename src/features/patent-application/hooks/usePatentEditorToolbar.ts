import { useState, useRef, useEffect, RefObject } from 'react';
import { Editor } from '@tiptap/react';

interface PatentEditorRef {
  handleUndo: () => void;
  handleRedo: () => void;
  getEditor: () => Editor | null;
}

interface UsePatentEditorToolbarProps {
  editorRef: RefObject<PatentEditorRef | null>;
}

export const usePatentEditorToolbar = ({
  editorRef,
}: UsePatentEditorToolbarProps) => {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Update editor state when ref changes
  useEffect(() => {
    let mounted = true;

    const checkEditor = () => {
      if (!mounted) return;

      if (editorRef.current?.getEditor) {
        const editorInstance = editorRef.current.getEditor();
        if (editorInstance && editorInstance !== editor) {
          setEditor(editorInstance);
        }
      }
    };

    // Check immediately
    checkEditor();

    // Poll for editor initialization
    let frameId: number;
    const pollEditor = () => {
      checkEditor();
      if (!editor && mounted) {
        frameId = requestAnimationFrame(pollEditor);
      }
    };

    frameId = requestAnimationFrame(pollEditor);

    return () => {
      mounted = false;
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [editor, editorRef]);

  // Zoom handling functions
  const handleZoomIn = () => {
    setZoomLevel(Math.min(zoomLevel + 10, 130));
  };

  const handleZoomOut = () => {
    setZoomLevel(Math.max(zoomLevel - 10, 70));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  // Get character and word count from editor
  const characterCount = editor?.storage.characterCount?.characters() || 0;
  const wordCount = editor?.storage.characterCount?.words() || 0;

  return {
    editor,
    zoomLevel,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    characterCount,
    wordCount,
  };
};

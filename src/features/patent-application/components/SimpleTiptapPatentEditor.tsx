import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
} from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import CharacterCount from '@tiptap/extension-character-count';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { FontSize } from '../extensions/fontSize';
import { TabIndent } from '../extensions/tabIndent';
import {
  TIPTAP_EDITOR_STYLES,
  TIPTAP_RESPONSIVE_STYLES,
} from '../utils/editorStyles';
import { EditorSkeleton } from './EditorSkeleton';
import { logger } from '@/utils/clientLogger';
import ProtectedHeading from '../extensions/protectedHeading';
import { PreventHeaderEditing } from '../extensions/preventHeaderEditing';
import { cn } from '@/lib/utils';
import { ContentBasedParagraphNumbering } from '../extensions/contentBasedParagraphNumbering';

interface SimpleTiptapPatentEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onBlur?: () => void;
  isEditMode: boolean;
  zoomLevel: number;
  containerRef?: React.RefObject<HTMLDivElement>;
  projectId: string;
}

export interface SimpleTiptapPatentEditorRef {
  getEditor: () => Editor | null;
  setContent: (content: string) => void;
}

/**
 * Simplified Tiptap Patent Editor
 * 
 * Core principles:
 * - Focus on editing functionality only
 * - Simple content binding
 * - No complex state management
 * - Direct event handling for external updates
 */
const SimpleTiptapPatentEditor = forwardRef<
  SimpleTiptapPatentEditorRef,
  SimpleTiptapPatentEditorProps
>(
  (
    {
      content,
      onContentChange,
      onBlur,
      isEditMode,
      zoomLevel,
      containerRef,
      projectId,
    },
    ref
  ) => {
    const hasInitialized = useRef(false);
    const isUpdatingFromExternal = useRef(false);
    // Holds the content string we just applied via an external event
    const pendingExternalContentRef = useRef<string | null>(null);

    // Create editor instance
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: false,
          history: {
            depth: 100,
            newGroupDelay: 1000,
          },
        }),
        PreventHeaderEditing,
        Underline,
        ProtectedHeading.configure({
          levels: [1, 2, 3],
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph', 'listItem'],
          defaultAlignment: 'left',
          alignments: ['left', 'center', 'right', 'justify'],
        }),
        CharacterCount,
        Subscript,
        Superscript,
        TextStyle,
        FontFamily,
        FontSize,
        ContentBasedParagraphNumbering.configure({
          enabled: false,
          startNumber: 1,
        }),
        TabIndent.configure({
          indentSize: 4,
          useTabs: false,
        }),
      ],
      content: '',
      editable: isEditMode,
      autofocus: false,
      immediatelyRender: false,
      parseOptions: {
        preserveWhitespace: 'full',
      },
      onUpdate: ({ editor }) => {
        // Don't trigger onChange when content is being set from external source
        if (!isUpdatingFromExternal.current) {
          const newContent = editor.getHTML();
          onContentChange(newContent);
        }
      },
      onBlur: () => {
        if (onBlur) {
          onBlur();
        }
      },
    });

    // Initialize content when editor is ready
    useEffect(() => {
      if (editor && !hasInitialized.current && content) {
        isUpdatingFromExternal.current = true;
        editor.commands.setContent(content, false);
        hasInitialized.current = true;
        // Reset flag after content is set
        setTimeout(() => {
          isUpdatingFromExternal.current = false;
        }, 0);
      }
    }, [editor, content]);

    // Update content when the parent `content` prop changes, *unless* we are in the
    // middle of an externally-triggered update (e.g. version restore). This guard
    // prevents a race where the parent still holds the old HTML while the editor
    // has already switched to the restored version – which would otherwise cause
    // us to immediately revert the change we just applied.
    useEffect(() => {
      if (!editor || !hasInitialized.current) return;

      // If we're still waiting for the parent to echo the externally-set
      // content back via props, ignore older prop values to prevent reverting.
      if (isUpdatingFromExternal.current) {
        if (content === pendingExternalContentRef.current) {
          // Parent has caught up → safe to clear the guard.
          logger.info('[SimpleTiptapEditor] Prop sync complete, clearing external update flag', {
            projectId,
            contentLength: content.length,
          });
          isUpdatingFromExternal.current = false;
          pendingExternalContentRef.current = null;
        } else {
          // Prop is stale; skip this update.
          logger.debug('[SimpleTiptapEditor] Skipping stale prop update during external update', {
            projectId,
            propLength: content.length,
            expectedLength: pendingExternalContentRef.current?.length || 0,
            isExternal: isUpdatingFromExternal.current,
          });
          return;
        }
      }

      const editorContent = editor.getHTML();
      if (content !== editorContent && content) {
        logger.info('[SimpleTiptapEditor] Prop content differs, updating editor', {
          newLength: content.length,
          oldLength: editorContent.length,
          first20New: content.slice(0, 20),
          first20Old: editorContent.slice(0, 20),
        });
        editor.commands.setContent(content, false);
      }
    }, [content, editor, projectId]);

    // Update editable state
    useEffect(() => {
      if (editor && editor.isEditable !== isEditMode) {
        editor.setEditable(isEditMode);
      }
    }, [editor, isEditMode]);

    // Listen for direct content updates (version restore, agent edits)
    useEffect(() => {
      if (!editor || !projectId) return;

      const handleDirectUpdate = (event: CustomEvent) => {
        const { projectId: eventProjectId, content: newContent, source } = event.detail;
        
        if (eventProjectId === projectId && newContent && !editor.isDestroyed) {
          const existingHtml = editor.getHTML();
          logger.info('[SimpleTiptapEditor] Direct content update received', {
            projectId,
            source,
            contentLength: newContent.length,
            oldLength: existingHtml.length,
            first20Old: existingHtml.slice(0, 20),
            first20New: newContent.slice(0, 20),
          });
          
          // Set flag to prevent onUpdate from firing
          isUpdatingFromExternal.current = true;
          
          // Temporarily allow heading replacement
          (window as any).__ALLOW_HEADER_REPLACE__ = true;
          try {
            editor.commands.setContent(newContent, false);
          } finally {
            // Clear flag next tick
            setTimeout(() => {
              delete (window as any).__ALLOW_HEADER_REPLACE__;
            }, 0);
          }
          
          // Track the content we just applied so we can ignore stale props
          pendingExternalContentRef.current = newContent;

          // Immediately notify parent so its state & props update synchronously
          if (onContentChange) {
            onContentChange(newContent);
          }

          // Reset the external update flag with both prop-based and timeout-based fallbacks
          // This ensures autosave is always re-enabled, even if prop sync fails
          // Dual approach:
          // 1. Prop-based reset: When parent content prop matches the restored content (ideal case)
          // 2. Timeout-based reset: 1-second fallback to prevent permanent autosave disable (safety net)
          setTimeout(() => {
            if (isUpdatingFromExternal.current) {
              logger.info('[SimpleTiptapEditor] Timeout fallback: resetting external update flag', {
                projectId,
                source,
              });
              isUpdatingFromExternal.current = false;
              pendingExternalContentRef.current = null;
            }
          }, 1000); // 1 second fallback to ensure autosave is always restored
        }
      };

      window.addEventListener('directEditorContentUpdate', handleDirectUpdate as EventListener);
      
      return () => {
        window.removeEventListener('directEditorContentUpdate', handleDirectUpdate as EventListener);
      };
    }, [editor, projectId, onContentChange]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getEditor: () => editor,
      setContent: (newContent: string) => {
        if (editor && !editor.isDestroyed) {
          editor.commands.setContent(newContent, false);
        }
      },
    }));

    // Inject styles once on mount
    useLayoutEffect(() => {
      const styleElement = document.createElement('style');
      styleElement.setAttribute('data-tiptap-styles', 'static');
      styleElement.textContent =
        TIPTAP_EDITOR_STYLES + '\n' + TIPTAP_RESPONSIVE_STYLES;
      document.head.appendChild(styleElement);
      return () => {
        document.head.removeChild(styleElement);
      };
    }, []);

    // Handle scrollbar width
    useEffect(() => {
      if (!editor || !containerRef?.current) return;

      const containerEl = containerRef.current;
      const scrollBarWidth = containerEl.offsetWidth - containerEl.clientWidth;
      containerEl.style.setProperty('--scrollbar-width', `${scrollBarWidth}px`);
    }, [editor, containerRef]);

    if (!editor) {
      return (
        <div className="h-full flex items-center justify-center">
          <EditorSkeleton message="Initializing editor..." />
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className={cn('h-[100%] flex flex-col position-relative bg-bg-primary')}
      >
        <div
          className={cn(
            'patent-editor-tiptap',
            'h-[100%] overflow-y-auto overflow-x-hidden position-relative'
          )}
          style={
            {
              '--zoom-scale': `${zoomLevel / 100}`,
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(0, 0, 0, 0.2) transparent',
            } as React.CSSProperties
          }
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  }
);

SimpleTiptapPatentEditor.displayName = 'SimpleTiptapPatentEditor';

export default SimpleTiptapPatentEditor; 
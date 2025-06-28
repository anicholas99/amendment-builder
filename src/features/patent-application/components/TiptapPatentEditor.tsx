import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
} from 'react';
import { Box, Text } from '@chakra-ui/react';
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
import {
  transformPlainTextToHtml,
  transformHtmlToPlainText,
} from '../utils/editorTransformations';
import { EDITOR_STYLES, RESPONSIVE_EDITOR_STYLES } from '../utils/editorStyles';
import {
  TIPTAP_EDITOR_STYLES_QUILL,
  TIPTAP_RESPONSIVE_STYLES,
} from '../utils/tiptapEditorStyles';
import { useSectionHeaderProtection } from '../hooks/useSectionHeaderProtection';
import { SectionDeletionAlert } from './SectionDeletionAlert';
import { EditorSkeleton } from './EditorSkeleton';
import { logger } from '@/lib/monitoring/logger';
import { FindReplacePanel } from './FindReplacePanel';
import ProtectedHeading from '../extensions/protectedHeading';
import { PreventHeaderEditing } from '../extensions/preventHeaderEditing';

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
}

interface PatentEditorRef {
  handleUndo: () => void;
  handleRedo: () => void;
  getEditor: () => Editor | null;
}

const TiptapPatentEditor = forwardRef<PatentEditorRef, PatentEditorProps>(
  (
    {
      content,
      setContent,
      isEditMode,
      hasGenerated,
      zoomLevel,
      containerRef,
      onSelectionChange,
      onBlur,
    },
    ref
  ) => {
    const [isInitialized, setIsInitialized] = useState<boolean>(
      () => typeof window !== 'undefined'
    );
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    
    // Track the last content we sent to parent to avoid unnecessary updates
    const lastSentContentRef = useRef<string>(content);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    // Track if we're currently syncing to prevent loops
    const isSyncingRef = useRef<boolean>(false);

    // Hook for header deletion protection - MUST be called at the top level
    const {
      isAlertOpen,
      alertHeaderName,
      handleAlertConfirm,
      handleAlertCancel,
      checkHeaderDeletion,
    } = useSectionHeaderProtection({
      currentHtmlContent: content,
      onContentUpdate: setContent,
    });

    // Create debounced update function using Tiptap's recommended approach
    const debouncedUpdate = useCallback((newContent: string) => {
      // Clear any existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      // Set new timeout
      debounceTimeoutRef.current = setTimeout(() => {
        // Only update if content actually changed
        if (newContent !== lastSentContentRef.current) {
          lastSentContentRef.current = newContent;
          setContent(newContent);
        }
      }, 2000); // 2 second debounce as recommended by Tiptap
    }, [setContent]);
    
    // Function to flush pending updates
    const flushPendingUpdates = useCallback(() => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
    }, []);
    
    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
      };
    }, []);

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: false,
          history: {
            depth: 100,
            newGroupDelay: 1000,
          },
          // Disable features that might cause reflows
          dropcursor: {
            width: 2,
            class: 'ProseMirror-dropcursor',
          },
          // Configure ordered list to work properly
          orderedList: {
            HTMLAttributes: {
              class: 'patent-ordered-list',
            },
          },
          listItem: {
            HTMLAttributes: {
              class: 'patent-list-item',
            },
          },
        }),
        PreventHeaderEditing,
        Underline,
        ProtectedHeading.configure({
          levels: [1, 2, 3],
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph'],
          defaultAlignment: 'left', // Ensure default is left, not justify
          // Explicitly exclude list items from text alignment
          alignments: ['left', 'center', 'right', 'justify'],
        }),
        CharacterCount.configure({
          limit: null,
        }),
        Subscript,
        Superscript,
        TextStyle,
        FontFamily.configure({
          types: ['textStyle'],
        }),
        FontSize.configure({
          types: ['textStyle'],
        }),
      ],
      content: content,
      editable: isEditMode,
      autofocus: false,
      immediatelyRender: false,
      // Add performance optimizations
      parseOptions: {
        preserveWhitespace: 'full',
      },
      editorProps: {
        attributes: {
          spellcheck: 'true',
          autocorrect: 'off',
          autocapitalize: 'off',
        },
      },
      onUpdate: ({ editor }) => {
        const newContent = editor.getHTML();
        
        // Debounced autosave as recommended by Tiptap
        debouncedUpdate(newContent);
        
        // Check if headers were deleted
        checkHeaderDeletion(newContent);
      },
      onSelectionUpdate: ({ editor }) => {
        if (onSelectionChange) {
          const { from, to } = editor.state.selection;
          const text = editor.state.doc.textBetween(from, to);
          const section = getCurrentSection(editor);
          onSelectionChange({ text, range: { from, to }, section });
        }
      },
      onBlur: () => {
        // Cancel any pending debounced updates and save immediately
        flushPendingUpdates();
        
        const currentContent = editor?.getHTML();
        if (currentContent && currentContent !== lastSentContentRef.current) {
          lastSentContentRef.current = currentContent;
          setContent(currentContent);
        }
        
        // Call the parent's onBlur handler
        if (onBlur) {
          logger.debug('[TiptapPatentEditor] Editor blur event triggered');
          onBlur();
        }
      },
    });
    
    // Effect to flush pending updates on unmount
    useEffect(() => {
      return () => {
        if (editor && debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
          
          // Get the current editor content and save it immediately
          const currentContent = editor.getHTML();
          if (currentContent && currentContent !== lastSentContentRef.current) {
            logger.debug('[TiptapPatentEditor] Flushing pending content on unmount', {
              contentLength: currentContent.length,
            });
            lastSentContentRef.current = currentContent;
            setContent(currentContent);
          }
        }
      };
    }, [editor, setContent]);

    // Sync content from parent when it changes externally
    useEffect(() => {
      if (!editor || !isInitialized || isSyncingRef.current) return;
      
      // Get current editor content
      const currentEditorContent = editor.getHTML();
      
      // Only update if parent content is different from current editor content
      // This prevents syncing our own updates back
      if (content !== currentEditorContent && content !== lastSentContentRef.current) {
        logger.debug(
          '[TiptapPatentEditor] Syncing external content change to editor',
          {
            contentLength: content?.length || 0,
            currentLength: currentEditorContent?.length || 0,
          }
        );
        
        // Set syncing flag to prevent loops
        isSyncingRef.current = true;
        
        // Save current cursor position
        const { from, to } = editor.state.selection;
        
        // Update editor content without emitting events
        editor.commands.setContent(content, false, {
          preserveWhitespace: true,
        });
        
        // Update our ref to prevent re-syncing
        lastSentContentRef.current = content;
        
        // Try to restore cursor position after a frame
        requestAnimationFrame(() => {
          try {
            const docLength = editor.state.doc.content.size;
            const safeFrom = Math.min(from, docLength - 1);
            const safeTo = Math.min(to, docLength - 1);
            
            if (safeFrom >= 0 && safeTo >= 0) {
              editor.commands.setTextSelection({ from: safeFrom, to: safeTo });
            }
          } catch (e) {
            logger.debug('[TiptapPatentEditor] Could not restore cursor position', { 
              error: e instanceof Error ? e.message : String(e) 
            });
          } finally {
            // Clear syncing flag
            isSyncingRef.current = false;
          }
        });
      }
    }, [content, editor, isInitialized]);

    useImperativeHandle(ref, () => ({
      handleUndo: () => editor?.commands.undo(),
      handleRedo: () => editor?.commands.redo(),
      getEditor: () => editor,
    }));

    useLayoutEffect(() => {
      setIsInitialized(true);
    }, []);

    // Inject styles once on mount
    useLayoutEffect(() => {
      const styleElement = document.createElement('style');
      styleElement.setAttribute('data-tiptap-styles', 'static');
      styleElement.textContent =
        RESPONSIVE_EDITOR_STYLES +
        '\n' +
        TIPTAP_EDITOR_STYLES_QUILL +
        '\n' +
        TIPTAP_RESPONSIVE_STYLES;
      document.head.appendChild(styleElement);
      return () => {
        document.head.removeChild(styleElement);
      };
    }, []);

    // Add keyboard shortcut handler for Ctrl+F
    useEffect(() => {
      if (!editor || !isEditMode) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
          e.preventDefault();
          setIsSearchOpen(true);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [editor, isEditMode]);

    useEffect(() => {
      if (editor && typeof window !== 'undefined') {
        const proseMirrorEl = editor.view.dom as HTMLElement;
        if (proseMirrorEl) {
          proseMirrorEl.style.minHeight = '0';
        }
      }
    }, [editor]);

    const editorComponent = useMemo(() => {
      if (!isInitialized) {
        return <EditorSkeleton />;
      }

      if (!editor) {
        logger.debug('[TiptapPatentEditor] Editor not created yet');
        return (
          <Box flex="1" p={6}>
            <Text>Initializing editor...</Text>
          </Box>
        );
      }

      return (
        <Box
          className="patent-editor-tiptap custom-scrollbar"
          flex="1"
          overflowY="auto"
          position="relative"
          style={{ 
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
            width: `${100 / (zoomLevel / 100)}%`,
            maxWidth: `${100 / (zoomLevel / 100)}%`,
            willChange: zoomLevel !== 100 ? 'transform' : 'auto',
          }}
          bg="bg.primary"
          css={{
            '& .ProseMirror': {
              minHeight: 'auto',
              height: 'auto',
              backgroundColor: 'var(--chakra-colors-bg-primary)',
              color: 'var(--chakra-colors-text-primary)',
            },
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      );
    }, [editor, zoomLevel, isInitialized]);

    if (!hasGenerated) {
      return (
        <Box
          flex="1"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={6}
        >
          <Text>Generate content to start editing...</Text>
        </Box>
      );
    }

    if (typeof window === 'undefined') {
      return (
        <Box flex="1" p={6}>
          <Text>Editor will load in browser...</Text>
        </Box>
      );
    }

    if (!editor) {
      return <EditorSkeleton />;
    }

    return (
      <Box
        ref={containerRef}
        height="100%"
        display="flex"
        flexDirection="column"
        position="relative"
        bg="bg.primary"
      >
        {editorComponent}
        {isEditMode && (
          <FindReplacePanel
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            editor={editor}
          />
        )}
        <SectionDeletionAlert
          isOpen={isAlertOpen}
          headerName={alertHeaderName}
          onConfirm={handleAlertConfirm}
          onCancel={handleAlertCancel}
        />
      </Box>
    );
  }
);

TiptapPatentEditor.displayName = 'TiptapPatentEditor';

// Helper function to extract most common font styles from HTML content
function extractCommonFontStyles(htmlContent: string): { fontFamily?: string; fontSize?: string } {
  if (!htmlContent || typeof window === 'undefined') return {};
  
  try {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Count font families and sizes
    const fontFamilies: Record<string, number> = {};
    const fontSizes: Record<string, number> = {};
    
    // Find all elements with inline styles
    const elementsWithStyle = tempDiv.querySelectorAll('[style]');
    
    elementsWithStyle.forEach((element) => {
      const style = (element as HTMLElement).style;
      
      if (style.fontFamily) {
        fontFamilies[style.fontFamily] = (fontFamilies[style.fontFamily] || 0) + 1;
      }
      
      if (style.fontSize) {
        fontSizes[style.fontSize] = (fontSizes[style.fontSize] || 0) + 1;
      }
    });
    
    // Find most common values
    const mostCommonFontFamily = Object.entries(fontFamilies).sort((a, b) => b[1] - a[1])[0]?.[0];
    const mostCommonFontSize = Object.entries(fontSizes).sort((a, b) => b[1] - a[1])[0]?.[0];
    
    return {
      fontFamily: mostCommonFontFamily,
      fontSize: mostCommonFontSize,
    };
  } catch (error) {
    logger.debug('[TiptapPatentEditor] Error extracting font styles', { error });
    return {};
  }
}

// Helper function to get current section
function getCurrentSection(editor: Editor): string | null {
  const { $from } = editor.state.selection;
  let node = $from.node($from.depth);
  while (node) {
    if (node.type.name === 'heading') {
      return node.textContent;
    }
    const depth = $from.depth - 1;
    if (depth < 0) break;
    node = $from.node(depth);
  }
  return null;
}

export default TiptapPatentEditor;

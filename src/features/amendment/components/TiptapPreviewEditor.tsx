/**
 * TiptapPreviewEditor - Reusable USPTO-compliant editor for preview components
 * 
 * Designed for amendment document previews with:
 * - USPTO-compliant styling (Times New Roman, proper margins)
 * - Auto-save functionality using debounced updates
 * - Read-only mode support
 * - Consistent toolbar with essential formatting
 * - Integration with existing draft document patterns
 */

import React, { useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import CharacterCount from '@tiptap/extension-character-count';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Save,
  Edit3,
  Eye,
  RotateCcw,
  RotateCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { logger } from '@/utils/clientLogger';

// USPTO-compliant editor styles
const USPTO_EDITOR_STYLES = `
  .tiptap-preview-editor {
    --font-family: "Times New Roman", Times, serif;
    --font-size: 12pt;
    --line-height: 1.6;
    --margin-top: 72px;
    --margin-bottom: 72px;
    --margin-left: 96px;
    --margin-right: 72px;
  }

  .tiptap-preview-editor .ProseMirror {
    font-family: var(--font-family);
    font-size: var(--font-size);
    line-height: var(--line-height);
    color: #000;
    background: white;
    padding: var(--margin-top) var(--margin-right) var(--margin-bottom) var(--margin-left);
    min-height: 8.5in;
    max-width: 8.5in;
    margin: 0 auto;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    outline: none;
    border: none;
  }

  .tiptap-preview-editor .ProseMirror:focus {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .tiptap-preview-editor .ProseMirror h1,
  .tiptap-preview-editor .ProseMirror h2,
  .tiptap-preview-editor .ProseMirror h3 {
    font-weight: bold;
    margin: 0.5em 0 0.25em 0;
    color: black;
    line-height: var(--line-height);
  }

  .tiptap-preview-editor .ProseMirror h1 {
    font-size: 14pt;
    text-align: center;
  }

  .tiptap-preview-editor .ProseMirror h2 {
    font-size: 12pt;
  }

  .tiptap-preview-editor .ProseMirror h3 {
    font-size: 12pt;
  }

  .tiptap-preview-editor .ProseMirror p {
    margin: 0.25em 0;
    line-height: var(--line-height);
    color: black;
    text-align: justify;
  }

  .tiptap-preview-editor .ProseMirror ul,
  .tiptap-preview-editor .ProseMirror ol {
    margin: 0.5em 0;
    padding-left: 2em;
    color: black;
    line-height: var(--line-height);
  }

  .tiptap-preview-editor .ProseMirror li {
    margin: 0.25em 0;
    color: black;
    line-height: var(--line-height);
  }

  .tiptap-preview-editor .ProseMirror strong {
    font-weight: bold;
    color: black;
  }

  .tiptap-preview-editor .ProseMirror em {
    font-style: italic;
    color: black;
  }

  .tiptap-preview-editor .ProseMirror u {
    text-decoration: underline;
    color: black;
  }

  /* Responsive adjustments for smaller screens */
  @media (max-width: 1024px) {
    .tiptap-preview-editor .ProseMirror {
      max-width: 100%;
      padding: 54px 54px 54px 72px;
    }
  }

  @media (max-width: 768px) {
    .tiptap-preview-editor .ProseMirror {
      padding: 36px 36px 36px 48px;
      font-size: 11pt;
    }
  }
`;

interface TiptapPreviewEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onSave?: () => void;
  isReadOnly?: boolean;
  placeholder?: string;
  className?: string;
  showToolbar?: boolean;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export interface TiptapPreviewEditorRef {
  getEditor: () => Editor | null;
  focus: () => void;
  save: () => void;
  toggleReadOnly: () => void;
}

const TiptapPreviewEditor = forwardRef<TiptapPreviewEditorRef, TiptapPreviewEditorProps>(
  (
    {
      content,
      onContentChange,
      onSave,
      isReadOnly = false,
      placeholder = "Start editing...",
      className,
      showToolbar = true,
      autoSave = true,
      autoSaveDelay = 2000,
    },
    ref
  ) => {
    const hasInitialized = useRef(false);
    const [isEditable, setIsEditable] = React.useState(!isReadOnly);

    // Debounced auto-save
    const debouncedSave = useDebouncedCallback(
      useCallback(() => {
        if (autoSave && onSave) {
          onSave();
          logger.debug('[TiptapPreviewEditor] Auto-saved content');
        }
      }, [autoSave, onSave]),
      autoSaveDelay
    );

    // Create editor instance
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
          history: {
            depth: 100,
            newGroupDelay: 1000,
          },
        }),
        Underline,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
          defaultAlignment: 'left',
          alignments: ['left', 'center', 'right', 'justify'],
        }),
        CharacterCount,
        Subscript,
        Superscript,
        TextStyle,
        FontFamily,
      ],
      content: '',
      editable: isEditable,
      placeholder,
      parseOptions: {
        preserveWhitespace: 'full',
      },
      onUpdate: ({ editor }) => {
        const newContent = editor.getHTML();
        onContentChange(newContent);
        
        if (autoSave) {
          debouncedSave();
        }
      },
    });

    // Initialize content when editor is ready
    useEffect(() => {
      if (editor && !hasInitialized.current && content) {
        editor.commands.setContent(content, false);
        hasInitialized.current = true;
      }
    }, [editor, content]);

    // Update content when prop changes
    useEffect(() => {
      if (editor && hasInitialized.current && content !== editor.getHTML()) {
        editor.commands.setContent(content, false);
      }
    }, [editor, content]);

    // Update editable state
    useEffect(() => {
      if (editor && editor.isEditable !== isEditable) {
        editor.setEditable(isEditable);
      }
    }, [editor, isEditable]);

    // Inject styles once on mount
    useEffect(() => {
      const styleElement = document.createElement('style');
      styleElement.setAttribute('data-tiptap-preview-styles', 'true');
      styleElement.textContent = USPTO_EDITOR_STYLES;
      document.head.appendChild(styleElement);

      return () => {
        const existingStyle = document.querySelector('[data-tiptap-preview-styles="true"]');
        if (existingStyle) {
          document.head.removeChild(existingStyle);
        }
      };
    }, []);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getEditor: () => editor,
      focus: () => {
        if (editor) {
          editor.commands.focus();
        }
      },
      save: () => {
        if (onSave) {
          onSave();
        }
      },
      toggleReadOnly: () => {
        setIsEditable(prev => !prev);
      },
    }));

    const handleSave = () => {
      if (onSave) {
        onSave();
        logger.info('[TiptapPreviewEditor] Manual save triggered');
      }
    };

    const toggleEditMode = () => {
      setIsEditable(prev => !prev);
    };

    if (!editor) {
      return (
        <div className={cn('flex items-center justify-center h-64 bg-gray-50 rounded-lg', className)}>
          <div className="text-gray-500">Loading editor...</div>
        </div>
      );
    }

    return (
      <div className={cn('tiptap-preview-editor bg-gray-50 p-6', className)}>
        {showToolbar && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-white border rounded-lg shadow-sm">
            {/* Edit/View Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isEditable ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleEditMode}
                >
                  {isEditable ? <Edit3 className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {isEditable ? 'Editing' : 'Viewing'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isEditable ? 'Switch to view mode' : 'Switch to edit mode'}
              </TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6" />

            {/* Formatting buttons - only show when editable */}
            {isEditable && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={editor.isActive('bold') ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => editor.chain().focus().toggleBold().run()}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Bold</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={editor.isActive('italic') ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => editor.chain().focus().toggleItalic().run()}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Italic</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={editor.isActive('underline') ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => editor.chain().focus().toggleUnderline().run()}
                    >
                      <UnderlineIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Underline</TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" className="h-6" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editor.chain().focus().undo().run()}
                      disabled={!editor.can().undo()}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Undo</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editor.chain().focus().redo().run()}
                      disabled={!editor.can().redo()}
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Redo</TooltipContent>
                </Tooltip>
              </>
            )}

            <Separator orientation="vertical" className="h-6" />

            {/* Save button */}
            {onSave && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save changes</TooltipContent>
              </Tooltip>
            )}

            {/* Character count */}
            <div className="ml-auto text-xs text-gray-500">
              {editor.storage.characterCount?.characters() || 0} characters
            </div>
          </div>
        )}

        <div className="relative">
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  }
);

TiptapPreviewEditor.displayName = 'TiptapPreviewEditor';

export default TiptapPreviewEditor; 
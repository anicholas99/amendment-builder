import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Editor } from '@tiptap/react';
import {
  FiBold,
  FiItalic,
  FiUnderline,
  // FiAlignLeft,
  // FiAlignCenter,
  // FiAlignRight,
  // FiAlignJustify,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiList,
  FiChevronDown,
  FiPlus,
  FiMinus,
} from 'react-icons/fi';
import { BiListOl } from 'react-icons/bi';
import { TbSubscript, TbSuperscript } from 'react-icons/tb';
import { cn } from '@/lib/utils';
import { logger } from '@/utils/clientLogger';

interface TiptapToolbarProps {
  editor: Editor | null;
  onFindReplace?: () => void;
}

const TiptapToolbar: React.FC<TiptapToolbarProps> = ({
  editor,
  onFindReplace: _onFindReplace,
}) => {
  // Track current font scale
  const [fontScale, setFontScale] = useState(100);

  // Initialize font scale on mount
  useEffect(() => {
    if (editor) {
      const editorElement = editor.view.dom.closest('.patent-editor-tiptap');
      if (editorElement) {
        (editorElement as HTMLElement).style.setProperty('--font-scale', '1');
      }
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  // Helper function to increase font size globally
  const increaseFontSize = () => {
    const newScale = Math.min(fontScale + 10, 150); // Max 150%
    setFontScale(newScale);

    const editorElement = editor.view.dom.closest('.patent-editor-tiptap');
    if (editorElement) {
      (editorElement as HTMLElement).style.setProperty(
        '--font-scale',
        `${newScale / 100}`
      );
    }
  };

  // Helper function to decrease font size globally
  const decreaseFontSize = () => {
    const newScale = Math.max(fontScale - 10, 70); // Min 70%
    setFontScale(newScale);

    const editorElement = editor.view.dom.closest('.patent-editor-tiptap');
    if (editorElement) {
      (editorElement as HTMLElement).style.setProperty(
        '--font-scale',
        `${newScale / 100}`
      );
    }
  };

  // Text alignment functions temporarily commented out
  // const getCurrentAlignment = () => {
  //   if (editor.isActive({ textAlign: 'left' }))
  //     return { icon: FiAlignLeft, label: 'Left' };
  //   if (editor.isActive({ textAlign: 'center' }))
  //     return { icon: FiAlignCenter, label: 'Center' };
  //   if (editor.isActive({ textAlign: 'right' }))
  //     return { icon: FiAlignRight, label: 'Right' };
  //   if (editor.isActive({ textAlign: 'justify' }))
  //     return { icon: FiAlignJustify, label: 'Justify' };
  //   return { icon: FiAlignLeft, label: 'Left' }; // Default
  // };

  // const currentAlignment = getCurrentAlignment();

  // Connected button styles - no gaps, connected borders
  const leftButtonClass = cn(
    'inline-flex items-center justify-center h-7 w-7 text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
    'disabled:opacity-50 disabled:pointer-events-none',
    'border border-r-0 bg-background hover:bg-accent hover:text-accent-foreground',
    'rounded-l rounded-r-none'
  );

  const middleButtonClass = cn(
    'inline-flex items-center justify-center h-7 w-7 text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
    'disabled:opacity-50 disabled:pointer-events-none',
    'border border-r-0 bg-background hover:bg-accent hover:text-accent-foreground',
    'rounded-none'
  );

  const rightButtonClass = cn(
    'inline-flex items-center justify-center h-7 w-7 text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
    'disabled:opacity-50 disabled:pointer-events-none',
    'border bg-background hover:bg-accent hover:text-accent-foreground',
    'rounded-r rounded-l-none'
  );

  const singleButtonClass = cn(
    'inline-flex items-center justify-center h-7 w-7 text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
    'disabled:opacity-50 disabled:pointer-events-none',
    'border bg-background hover:bg-accent hover:text-accent-foreground',
    'rounded'
  );

  // Active button variants
  const leftActiveButtonClass = cn(
    leftButtonClass,
    'bg-accent text-accent-foreground'
  );
  const middleActiveButtonClass = cn(
    middleButtonClass,
    'bg-accent text-accent-foreground'
  );
  const rightActiveButtonClass = cn(
    rightButtonClass,
    'bg-accent text-accent-foreground'
  );

  return (
    <div className="flex items-center gap-2">
      {/* Undo/Redo - Connected buttons */}
      <div className="flex">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
              className={leftButtonClass}
            >
              <FiCornerUpLeft className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Undo</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
              className={rightButtonClass}
            >
              <FiCornerUpRight className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Redo</TooltipContent>
        </Tooltip>
      </div>

      <Separator orientation="vertical" className="h-5" />

      {/* Text formatting - Connected buttons */}
      <div className="flex">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={
                editor.isActive('bold')
                  ? leftActiveButtonClass
                  : leftButtonClass
              }
            >
              <FiBold className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Bold</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={
                editor.isActive('italic')
                  ? middleActiveButtonClass
                  : middleButtonClass
              }
            >
              <FiItalic className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Italic</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={
                editor.isActive('underline')
                  ? rightActiveButtonClass
                  : rightButtonClass
              }
            >
              <FiUnderline className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Underline</TooltipContent>
        </Tooltip>
      </div>

      <Separator orientation="vertical" className="h-5" />

      {/* Font Size - Connected buttons with label */}
      <div className="flex items-center">
        <Tooltip>
          <TooltipTrigger
            className={leftButtonClass}
            onClick={decreaseFontSize}
            disabled={fontScale <= 70}
            aria-label="Decrease font size"
          >
            <FiMinus size={10} />
          </TooltipTrigger>
          <TooltipContent>Decrease font size</TooltipContent>
        </Tooltip>

        <div className="px-2 py-1 h-7 text-xs font-medium bg-gray-50 dark:bg-gray-800 border-t border-b text-gray-700 dark:text-gray-300 min-w-[32px] text-center flex items-center justify-center">
          {fontScale}%
        </div>

        <Tooltip>
          <TooltipTrigger
            className={rightButtonClass}
            onClick={increaseFontSize}
            disabled={fontScale >= 150}
            aria-label="Increase font size"
          >
            <FiPlus size={10} />
          </TooltipTrigger>
          <TooltipContent>Increase font size</TooltipContent>
        </Tooltip>
      </div>

      {/* Super/Subscript - Connected buttons */}
      <div className="flex">
        <Tooltip>
          <TooltipTrigger
            className={
              editor.isActive('subscript')
                ? leftActiveButtonClass
                : leftButtonClass
            }
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            aria-label="Subscript"
          >
            <TbSubscript size={12} />
          </TooltipTrigger>
          <TooltipContent>Subscript</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            className={
              editor.isActive('superscript')
                ? rightActiveButtonClass
                : rightButtonClass
            }
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            aria-label="Superscript"
          >
            <TbSuperscript size={12} />
          </TooltipTrigger>
          <TooltipContent>Superscript</TooltipContent>
        </Tooltip>
      </div>

      {/* Lists - Connected buttons */}
      <div className="flex">
        <Tooltip>
          <TooltipTrigger
            className={
              editor.isActive('bulletList')
                ? leftActiveButtonClass
                : leftButtonClass
            }
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            aria-label="Bullet List"
          >
            <FiList size={12} />
          </TooltipTrigger>
          <TooltipContent>Bullet List</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            className={
              editor.isActive('orderedList')
                ? rightActiveButtonClass
                : rightButtonClass
            }
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            aria-label="Numbered List"
          >
            <BiListOl size={12} />
          </TooltipTrigger>
          <TooltipContent>Numbered List</TooltipContent>
        </Tooltip>
      </div>

      {/* Text Alignment Dropdown - TEMPORARILY HIDDEN FOR FUTURE USE */}
    </div>
  );
};

export default TiptapToolbar;

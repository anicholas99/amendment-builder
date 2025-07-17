import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { logger } from '@/utils/clientLogger';

export const tabIndentPluginKey = new PluginKey('tabIndent');

export interface TabIndentOptions {
  /**
   * The number of spaces to use for indentation
   */
  indentSize: number;
  /**
   * Whether to use tabs or spaces for indentation
   */
  useTabs: boolean;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tabIndent: {
      /**
       * Indent the current line or selection
       */
      indent: () => ReturnType;
      /**
       * Outdent the current line or selection
       */
      outdent: () => ReturnType;
    };
  }
}

/**
 * Tab Indent Extension
 *
 * Handles Tab and Shift+Tab key presses to indent/outdent text like in Word processors.
 * - Tab: Adds indentation at cursor position
 * - Shift+Tab: Removes indentation from start of line
 * - Works with both single cursor and text selections
 */
export const TabIndent = Extension.create<TabIndentOptions>({
  name: 'tabIndent',

  addOptions() {
    return {
      indentSize: 4, // 4 spaces by default
      useTabs: false, // Use spaces by default
    };
  },

  addCommands() {
    return {
      indent:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          const { from, to } = selection;

          // Create the indent string
          const indentString = this.options.useTabs
            ? '\t'
            : ' '.repeat(this.options.indentSize);

          if (from === to) {
            // Single cursor - insert indent at cursor position
            tr.insertText(indentString, from);
          } else {
            // Selection - indent each line in the selection
            const selectedText = state.doc.textBetween(from, to);
            const lines = selectedText.split('\n');
            const indentedText = lines
              .map(line => indentString + line)
              .join('\n');
            tr.replaceWith(from, to, state.schema.text(indentedText));
          }

          if (dispatch) {
            dispatch(tr);
          }
          return true;
        },

      outdent:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          const { from, to } = selection;

          if (from === to) {
            // Single cursor - remove indentation from start of current line
            const $from = state.doc.resolve(from);
            const lineStart = $from.start($from.depth);
            const lineText = state.doc.textBetween(
              lineStart,
              $from.end($from.depth)
            );

            // Check if line starts with our indent pattern
            const indentString = this.options.useTabs
              ? '\t'
              : ' '.repeat(this.options.indentSize);

            if (lineText.startsWith(indentString)) {
              tr.delete(lineStart, lineStart + indentString.length);
            } else if (lineText.startsWith(' ') || lineText.startsWith('\t')) {
              // Remove single space or tab if it doesn't match our indent size
              tr.delete(lineStart, lineStart + 1);
            }
          } else {
            // Selection - outdent each line in the selection
            const selectedText = state.doc.textBetween(from, to);
            const lines = selectedText.split('\n');
            const indentString = this.options.useTabs
              ? '\t'
              : ' '.repeat(this.options.indentSize);

            const outdentedText = lines
              .map(line => {
                if (line.startsWith(indentString)) {
                  return line.substring(indentString.length);
                } else if (line.startsWith(' ') || line.startsWith('\t')) {
                  return line.substring(1);
                }
                return line;
              })
              .join('\n');

            tr.replaceWith(from, to, state.schema.text(outdentedText));
          }

          if (dispatch) {
            dispatch(tr);
          }
          return true;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        logger.debug('[TabIndent] Tab key pressed');
        return this.editor.commands.indent();
      },
      'Shift-Tab': () => {
        logger.debug('[TabIndent] Shift+Tab key pressed');
        return this.editor.commands.outdent();
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: tabIndentPluginKey,
        props: {
          handleKeyDown: (view, event) => {
            // Handle Tab key
            if (event.key === 'Tab') {
              event.preventDefault();

              if (event.shiftKey) {
                // Shift+Tab - outdent
                return this.editor.commands.outdent();
              } else {
                // Tab - indent
                return this.editor.commands.indent();
              }
            }

            return false;
          },
        },
      }),
    ];
  },
});

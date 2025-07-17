import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { DecorationSet } from '@tiptap/pm/view';
import { logger } from '@/utils/clientLogger';

import { ContentBasedParagraphNumberingOptions } from './types';
import { handleEnterKey, handleBackspaceKey } from './keyboardHandlers';
import {
  toggleParagraphNumbering,
  toggleParagraphNumberingAt,
  addParagraphNumbers,
  removeParagraphNumbers,
  renumberParagraphs,
  cleanupMalformedNumbers,
  removeNumbersFromHeaders,
} from './commands';

// Re-export types for external use
export type { ContentBasedParagraphNumberingOptions };

// Declare the command extensions for TypeScript
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    contentBasedParagraphNumbering: {
      /**
       * Toggle paragraph numbering on/off globally
       */
      toggleParagraphNumbering: () => ReturnType;
      /**
       * Toggle numbering for a specific paragraph
       */
      toggleParagraphNumberingAt: (pos: number) => ReturnType;
      /**
       * Add paragraph numbers to all eligible paragraphs
       */
      addParagraphNumbers: () => ReturnType;
      /**
       * Remove all paragraph numbers
       */
      removeParagraphNumbers: () => ReturnType;
      /**
       * Renumber all paragraphs that have numbering enabled
       */
      renumberParagraphs: () => ReturnType;
      /**
       * Clean up all malformed paragraph numbers
       */
      cleanupMalformedNumbers: () => ReturnType;
      /**
       * Remove paragraph numbers from headers immediately
       */
      removeNumbersFromHeaders: () => ReturnType;
    };
  }
}

const contentBasedParagraphNumberingPluginKey = new PluginKey(
  'contentBasedParagraphNumbering'
);

/**
 * Content-Based Paragraph Numbering Extension
 *
 * This extension provides patent-style paragraph numbering ([0001], [0002], etc.)
 * by storing numbers directly in the content rather than using decorations.
 *
 * Features:
 * - Numbers are part of the actual content (persistent)
 * - Uses data-numbered attribute to control which paragraphs get numbers
 * - Click on numbers to toggle numbering on/off
 * - Automatic renumbering when content changes
 * - Proper handling of patent sections (skips CLAIMS and ABSTRACT)
 */
export const ContentBasedParagraphNumbering =
  Extension.create<ContentBasedParagraphNumberingOptions>({
    name: 'contentBasedParagraphNumbering',

    addOptions() {
      return {
        startNumber: 1,
        formatNumber: (num: number) => `[${String(num).padStart(4, '0')}]`,
        className: 'patent-paragraph-number',
        enabled: false,
      };
    },

    addStorage() {
      return {
        enabled: this.options.enabled,
        isUpdating: false,
        renumberTimeout: null as NodeJS.Timeout | null,
      };
    },

    addProseMirrorPlugins() {
      return [
        new Plugin({
          key: contentBasedParagraphNumberingPluginKey,

          props: {
            handleKeyDown: (view: any, event: KeyboardEvent) => {
              // Handle Enter key for auto-numbering new paragraphs
              if (event.key === 'Enter' && this.storage.enabled) {
                return handleEnterKey(view, event, this.storage, this.options);
              }

              // Handle backspace within paragraph numbers
              if (event.key === 'Backspace' && this.storage.enabled) {
                return handleBackspaceKey(
                  view,
                  event,
                  this.storage,
                  this.options
                );
              }

              return false;
            },
          },

          state: {
            init() {
              return DecorationSet.empty;
            },
            apply(tr: any, decorations: any) {
              // Handle any decoration updates if needed
              return decorations.map(tr.mapping, tr.doc);
            },
          },
        }),
      ];
    },

    addCommands() {
      return {
        toggleParagraphNumbering: () =>
          toggleParagraphNumbering(this.storage, this.options),
        toggleParagraphNumberingAt: (pos: number) =>
          toggleParagraphNumberingAt(
            this.editor,
            this.storage,
            this.options
          )(pos),
        addParagraphNumbers: () =>
          addParagraphNumbers(this.storage, this.options),
        removeParagraphNumbers: () => removeParagraphNumbers(this.storage),
        renumberParagraphs: () =>
          renumberParagraphs(this.storage, this.options),
        cleanupMalformedNumbers: () => cleanupMalformedNumbers(this.storage),
        removeNumbersFromHeaders: () => removeNumbersFromHeaders(this.storage),
      };
    },

    onCreate() {
      logger.info('[ContentBasedParagraphNumbering] Extension created', {
        enabled: this.storage.enabled,
        startNumber: this.options.startNumber,
      });
    },

    onUpdate() {
      // Simple behavior: no auto-renumbering
      // Users can manually remove paragraph numbers with backspace
    },

    onDestroy() {
      // Clean up timeout on destroy
      if (this.storage.renumberTimeout) {
        clearTimeout(this.storage.renumberTimeout);
      }
    },
  });

/**
 * Helper function to get content with patent numbers for external use
 * This replaces the old getContentWithPatentNumbers function
 */
export function getContentWithPatentNumbers(editor: any): string {
  if (!editor || !editor.state) return '';

  // With the new content-based system, numbers are already in the content
  // So we can just return the regular HTML
  return editor.getHTML();
}

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { logger } from '../../../utils/clientLogger';

export const patentParagraphPluginKey = new PluginKey('patentParagraph');

export type PatentParagraphOptions = {
  startNumber: number;
  formatNumber: (num: number) => string;
  className: string;
  enabled: boolean;
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    patentParagraph: {
      /**
       * Toggle patent paragraph numbering on/off
       */
      togglePatentNumbering: () => ReturnType;
      /**
       * Export content with paragraph numbers baked in
       */
      exportWithPatentNumbers: () => ReturnType;
      /**
       * Exclude numbering for a specific paragraph (used internally)
       */
      toggleParagraphNumber: (pos: number) => ReturnType;
    };
  }
}

/**
 * Patent Paragraph Extension
 *
 * Provides visual paragraph numbering ([0001], [0002], etc.) without modifying document content.
 * Numbers are displayed as decorations and only inserted into actual text during export.
 *
 * Features:
 * - Automatic numbering of paragraphs
 * - Backspace at paragraph start to exclude from numbering
 * - No content modification during editing
 * - Clean copy/paste behavior
 * - High performance with decoration-based approach
 * - Export-ready formatting
 */
export const PatentParagraph = Extension.create<PatentParagraphOptions>({
  name: 'patentParagraph',

  addOptions() {
    return {
      // Start numbering from 1
      startNumber: 1,
      // Format function for paragraph numbers
      formatNumber: (num: number) => `[${String(num).padStart(4, '0')}]`,
      // CSS classes for styling
      className: 'patent-paragraph-number',
      // Enable/disable the extension
      enabled: true,
    };
  },

  addStorage() {
    return {
      exportedHtml: '',
      enabled: false, // Default to disabled to prevent flickering
      excludedParagraphs: new Set<number>(), // Track excluded paragraph positions
      lastDocSize: 0, // Track document size to detect major changes
    };
  },

  onCreate() {
    // Initialize storage with the enabled state from options
    this.storage.enabled = this.options.enabled || false;
    this.storage.excludedParagraphs = new Set<number>();
    this.storage.lastDocSize = 0;
    logger.debug('[PatentParagraph] Extension created', {
      enabled: this.storage.enabled,
      optionsEnabled: this.options.enabled,
    });
  },

  addProseMirrorPlugins() {
    const extension = this;

    return [
      new Plugin({
        key: patentParagraphPluginKey,
        state: {
          init(_, state) {
            // Use options.enabled for initial state to prevent flicker
            const enabled = extension.options.enabled || false;
            extension.storage.enabled = enabled;
            logger.debug('[PatentParagraph] Plugin init', {
              enabled,
              optionsEnabled: extension.options.enabled,
            });
            if (!enabled) return DecorationSet.empty;
            return createDecorations(
              state.doc,
              extension.options,
              extension.storage.excludedParagraphs,
              extension.editor
            );
          },
          apply(tr, decorations, oldState, newState) {
            // Auto-enable numbering if we detect patent content
            const hasPatentContent =
              newState.doc.textContent.includes('BACKGROUND') ||
              newState.doc.textContent.includes('DETAILED DESCRIPTION') ||
              newState.doc.textContent.includes('SUMMARY');

            if (hasPatentContent && !extension.storage.enabled) {
              extension.storage.enabled = true;
            }

            const enabled = extension.storage.enabled;

            // Check if enabled state changed via meta
            const toggleMeta = tr.getMeta('togglePatentNumbering');
            if (toggleMeta !== undefined) {
              logger.debug('[PatentParagraph] Toggle meta received', {
                toggleMeta,
              });
              if (!toggleMeta) {
                // Toggling OFF - return empty decorations
                return DecorationSet.empty;
              }
              return createDecorations(
                newState.doc,
                extension.options,
                extension.storage.excludedParagraphs,
                extension.editor
              );
            }

            // Check if a specific paragraph was toggled
            const togglePosMeta = tr.getMeta('toggleParagraphNumber');
            if (togglePosMeta !== undefined) {
              logger.debug('[PatentParagraph] Toggle paragraph at position', {
                pos: togglePosMeta,
              });
              // Recreate decorations with updated exclusions
              return createDecorations(
                newState.doc,
                extension.options,
                extension.storage.excludedParagraphs,
                extension.editor
              );
            }

            if (!enabled) return DecorationSet.empty;

            // Only recreate decorations if document structure changed significantly
            if (tr.docChanged) {
              // Check if this is just a text change or a structural change
              const structuralChange = tr.steps.some(step => {
                const stepType = step.constructor.name;
                // Check if it's a replace step with actual content changes
                return (
                  stepType === 'ReplaceStep' || stepType === 'ReplaceAroundStep'
                );
              });

              // Update excluded positions based on mapping
              const newExcluded = new Set<number>();
              let excludedChanged = false;

              extension.storage.excludedParagraphs.forEach((pos: number) => {
                const mappedPos = tr.mapping.map(pos);
                if (mappedPos >= 0 && mappedPos !== pos) {
                  excludedChanged = true;
                }
                if (mappedPos >= 0) {
                  newExcluded.add(mappedPos);
                }
              });

              if (excludedChanged) {
                extension.storage.excludedParagraphs = newExcluded;
              }

              // Only recreate if there was a structural change or excluded positions changed
              if (structuralChange || excludedChanged) {
                logger.debug(
                  '[PatentParagraph] Structural change detected, recreating decorations',
                  { structuralChange, excludedChanged }
                );
                return createDecorations(
                  newState.doc,
                  extension.options,
                  extension.storage.excludedParagraphs,
                  extension.editor
                );
              }
            }

            // Map existing decorations through the transaction
            return decorations.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
          handleKeyDown: (view: any, event: KeyboardEvent) => {
            // Handle backspace at the beginning of a numbered paragraph
            if (event.key === 'Backspace') {
              const { state } = view;
              const { selection } = state;
              const { $from } = selection;

              // Check if cursor is at the very beginning of a paragraph
              if (
                selection.empty &&
                $from.parentOffset === 0 &&
                $from.parent.type.name === 'paragraph'
              ) {
                const paragraphPos = $from.start($from.depth) - 1;

                // Check if this paragraph has a number (not excluded)
                if (!extension.storage.excludedParagraphs.has(paragraphPos)) {
                  // Check if we're in a section that should have numbers
                  const currentSection = getCurrentSectionAtPos(
                    state.doc,
                    paragraphPos
                  );
                  const skipSection =
                    currentSection === 'CLAIMS' ||
                    currentSection === 'ABSTRACT';

                  if (!skipSection) {
                    logger.info(
                      '[PatentParagraph] Backspace at beginning of numbered paragraph',
                      {
                        paragraphPos,
                        currentSection,
                      }
                    );

                    // Exclude this paragraph from numbering instead of deleting it
                    extension.storage.excludedParagraphs.add(paragraphPos);

                    // Dispatch transaction to update decorations
                    const tr = state.tr.setMeta(
                      'toggleParagraphNumber',
                      paragraphPos
                    );
                    view.dispatch(tr);

                    // Prevent default backspace behavior
                    event.preventDefault();
                    return true;
                  }
                }
              }
            }

            return false;
          },
        },
      }),
    ];
  },

  addCommands() {
    return {
      togglePatentNumbering:
        () =>
        ({ editor, tr }) => {
          // Toggle the enabled state in storage
          const currentState = this.storage.enabled;
          this.storage.enabled = !currentState;

          logger.info('[PatentParagraph] Toggling numbering', {
            from: currentState,
            to: !currentState,
          });

          // Stabilize layout before toggle
          if (editor?.view?.dom) {
            const dom = editor.view.dom as HTMLElement;
            const scrollTop = dom.scrollTop;

            // Add meta to trigger decoration update
            tr.setMeta('togglePatentNumbering', !currentState);

            // Restore scroll position after toggle to prevent header shifting
            requestAnimationFrame(() => {
              if (dom.scrollTop !== scrollTop) {
                dom.scrollTop = scrollTop;
              }
            });
          } else {
            // Fallback if no DOM access
            tr.setMeta('togglePatentNumbering', !currentState);
          }

          return true;
        },

      toggleParagraphNumber:
        (pos: number) =>
        ({ tr }) => {
          // Toggle exclusion for specific paragraph
          if (this.storage.excludedParagraphs.has(pos)) {
            this.storage.excludedParagraphs.delete(pos);
          } else {
            this.storage.excludedParagraphs.add(pos);
          }

          // Add meta to trigger decoration update
          tr.setMeta('toggleParagraphNumber', pos);

          return true;
        },

      exportWithPatentNumbers:
        () =>
        ({ editor }) => {
          const { doc } = editor.state;
          const { formatNumber, startNumber } = this.options;
          const excludedParagraphs = this.storage.excludedParagraphs;

          // Get the full HTML
          const tempEditor = document.createElement('div');
          tempEditor.innerHTML = editor.getHTML();

          // Track current section while processing
          let currentSection = '';
          let paragraphCount = startNumber - 1;
          let nodePos = 0;

          // Process the document to add numbers
          doc.descendants(node => {
            // Check for section headers
            if (
              node.type.name === 'heading' ||
              (node.type.name === 'paragraph' && node.textContent)
            ) {
              const text = node.textContent.trim().toUpperCase();

              if (
                text === 'CLAIMS' ||
                text === 'WHAT IS CLAIMED IS:' ||
                text === 'I CLAIM:' ||
                text === 'WE CLAIM:'
              ) {
                currentSection = 'CLAIMS';
              } else if (
                text === 'ABSTRACT' ||
                text === 'ABSTRACT OF THE DISCLOSURE'
              ) {
                currentSection = 'ABSTRACT';
              } else if (
                text === 'BACKGROUND' ||
                text === 'FIELD' ||
                text === 'SUMMARY' ||
                text === 'DETAILED DESCRIPTION' ||
                text === 'BRIEF DESCRIPTION OF THE DRAWINGS'
              ) {
                currentSection = 'DESCRIPTION';
              }
            }

            // Process paragraphs
            if (node.type.name === 'paragraph') {
              const skipSection =
                currentSection === 'CLAIMS' || currentSection === 'ABSTRACT';

              // Find matching paragraph in HTML
              const paragraphs = tempEditor.querySelectorAll('p');
              const paragraphIndex = Array.from(paragraphs).findIndex(p => {
                return p.textContent?.trim() === node.textContent.trim();
              });

              if (
                paragraphIndex >= 0 &&
                !excludedParagraphs.has(nodePos) &&
                !skipSection
              ) {
                paragraphCount++;
                const number = formatNumber(paragraphCount);
                // Add number even to empty paragraphs
                if (node.textContent.trim()) {
                  paragraphs[paragraphIndex].innerHTML =
                    `${number} ${paragraphs[paragraphIndex].innerHTML}`;
                } else {
                  paragraphs[paragraphIndex].innerHTML = `${number} `;
                }
              }
            }
            nodePos += node.nodeSize;
          });

          const html = tempEditor.innerHTML;

          // Store the HTML for retrieval
          this.storage.exportedHtml = html;
          return true;
        },
    };
  },
});

/**
 * Create decorations for paragraph numbers
 */
function createDecorations(
  doc: ProseMirrorNode,
  options: PatentParagraphOptions,
  excludedParagraphs: Set<number>,
  editor?: any
): DecorationSet {
  const decorations: Decoration[] = [];
  let paragraphCount = options.startNumber - 1;
  let totalParagraphs = 0;
  let currentSection = '';

  try {
    // First pass: identify section boundaries for efficiency
    const sectionBoundaries: Map<number, string> = new Map();

    doc.descendants((node: ProseMirrorNode, pos: number) => {
      if (node.type.name === 'paragraph') {
        totalParagraphs++;
      }

      // Check for section headers
      if (
        node.type.name === 'heading' ||
        (node.type.name === 'paragraph' && node.textContent)
      ) {
        const text = node.textContent.trim().toUpperCase();

        if (
          text === 'CLAIMS' ||
          text === 'WHAT IS CLAIMED IS:' ||
          text === 'I CLAIM:' ||
          text === 'WE CLAIM:'
        ) {
          sectionBoundaries.set(pos, 'CLAIMS');
        } else if (
          text === 'ABSTRACT' ||
          text === 'ABSTRACT OF THE DISCLOSURE'
        ) {
          sectionBoundaries.set(pos, 'ABSTRACT');
        } else if (
          text === 'BACKGROUND' ||
          text === 'FIELD' ||
          text === 'SUMMARY' ||
          text === 'DETAILED DESCRIPTION' ||
          text === 'BRIEF DESCRIPTION OF THE DRAWINGS'
        ) {
          sectionBoundaries.set(pos, 'DESCRIPTION');
        }
      }
    });

    logger.debug('[PatentParagraph] Document analysis', {
      totalParagraphs,
      excludedCount: excludedParagraphs.size,
      sectionCount: sectionBoundaries.size,
    });

    // Second pass: create decorations
    doc.descendants((node: ProseMirrorNode, pos: number) => {
      // Update current section based on boundaries
      const newSection = sectionBoundaries.get(pos);
      if (newSection) {
        currentSection = newSection;
      }

      // Handle all paragraphs (including empty ones)
      if (node.type.name === 'paragraph') {
        // Skip numbering for CLAIMS and ABSTRACT sections
        const skipSection =
          currentSection === 'CLAIMS' || currentSection === 'ABSTRACT';

        if (!excludedParagraphs.has(pos) && !skipSection) {
          // Number all paragraphs in description sections (including empty ones)
          paragraphCount++;
          const number = options.formatNumber(paragraphCount);

          // Create widget decoration at the start of the paragraph
          const decoration = Decoration.widget(
            pos + 1,
            () => {
              const span = document.createElement('span');
              span.className = options.className;
              span.textContent = number + ' ';
              span.contentEditable = 'false';
              span.setAttribute('data-patent-number', number);

              // Apply inline styles directly
              Object.assign(span.style, {
                userSelect: 'none',
                display: 'inline-block',
                color: 'var(--foreground, #000)',
                fontFamily: '"Times New Roman", Times, serif',
                fontSize: '14px',
                marginRight: '0.5em',
                fontWeight: 'normal',
                verticalAlign: 'baseline',
                lineHeight: 'inherit',
                position: 'static',
                pointerEvents: 'none',
                // Ensure no layout impact
                transform: 'none',
                willChange: 'auto',
                // Show immediately if enabled from start
                visibility: 'visible',
                opacity: '1',
              });

              return span;
            },
            {
              side: -1, // Place before cursor
              key: `patent-paragraph-${pos}`, // Use position as key for stability
            }
          );

          decorations.push(decoration);
        }
        // Removed the placeholder creation for excluded paragraphs
      }
    });

    logger.info('[PatentParagraph] Decorations created', {
      decorationCount: decorations.length,
      paragraphsNumbered: paragraphCount,
    });
  } catch (error) {
    logger.error('[PatentParagraph] Error creating decorations:', error);
  }

  return DecorationSet.create(doc, decorations);
}

/**
 * Helper function to determine the current section at a given position
 */
function getCurrentSectionAtPos(doc: ProseMirrorNode, pos: number): string {
  let currentSection = '';
  let foundPos = false;

  doc.descendants((node: ProseMirrorNode, nodePos: number) => {
    if (foundPos) return false; // Stop traversing once we've found our position

    // Check if this is a section header
    if (
      node.type.name === 'heading' ||
      (node.type.name === 'paragraph' && node.textContent)
    ) {
      const text = node.textContent.trim().toUpperCase();

      if (
        text === 'CLAIMS' ||
        text === 'WHAT IS CLAIMED IS:' ||
        text === 'I CLAIM:' ||
        text === 'WE CLAIM:'
      ) {
        currentSection = 'CLAIMS';
      } else if (text === 'ABSTRACT' || text === 'ABSTRACT OF THE DISCLOSURE') {
        currentSection = 'ABSTRACT';
      } else if (
        text === 'BACKGROUND' ||
        text === 'FIELD' ||
        text === 'SUMMARY' ||
        text === 'DETAILED DESCRIPTION' ||
        text === 'BRIEF DESCRIPTION OF THE DRAWINGS'
      ) {
        currentSection = 'DESCRIPTION';
      }
    }

    // Check if we've reached our target position
    if (nodePos >= pos) {
      foundPos = true;
    }
  });

  return currentSection;
}

/**
 * Helper function to get content with patent numbers for external use
 */
export function getContentWithPatentNumbers(editor: any): string {
  if (!editor || !editor.state) return '';

  // First run the export command to generate the HTML
  editor.chain().exportWithPatentNumbers().run();

  // Then retrieve the stored HTML
  const exportedHtml = editor.storage.patentParagraph?.exportedHtml;
  if (exportedHtml) {
    return exportedHtml;
  }

  // Fallback to regular HTML if command fails
  return editor.getHTML();
}

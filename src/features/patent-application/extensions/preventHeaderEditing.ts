import { Extension } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';
import { ReplaceStep, ReplaceAroundStep } from 'prosemirror-transform';
import { logger } from '@/utils/clientLogger';

/**
 * PreventHeaderEditing
 * A comprehensive ProseMirror/Tiptap extension that protects heading nodes from:
 * 1. Direct editing of heading text content
 * 2. Backspacing from the next paragraph into the heading
 * 3. Merging content with headings through any means
 * 4. Deleting headings accidentally
 *
 * This ensures patent section headers remain intact and properly formatted.
 */
export const PreventHeaderEditing = Extension.create({
  name: 'preventHeaderEditing',

  priority: 1000, // Execute early to block before other extensions

  addProseMirrorPlugins() {
    return [
      new Plugin({
        filterTransaction: (tr, state) => {
          // Allow external forced updates (e.g., version restore) by checking global flag
          // This is a coarse but reliable escape hatch that we enable for one tick
          if ((window as any).__ALLOW_HEADER_REPLACE__) {
            logger.info('[PreventHeaderEditing] Escape hatch active, allowing header replacement');
            
            // Clear the flag after a short delay to ensure event processing completes
            setTimeout(() => {
              (window as any).__ALLOW_HEADER_REPLACE__ = false;
              logger.debug('[PreventHeaderEditing] Escape hatch flag cleared');
            }, 200); // Increased from 0 to 200ms to ensure event processing completes
            
            return true;
          }

          if (!tr.docChanged) {
            return true;
          }

          const { selection } = state;
          const { $from, $to } = selection;

          // Check if we're trying to edit inside a heading
          if ($from.parent.type.name === 'heading') {
            // Allow editing for level-1 heading (document title)
            const level = $from.parent.attrs?.level || 1;
            if (level !== 1) {
              logger.debug(
                '[PreventHeaderEditing] Blocked edit inside heading',
                {
                  level,
                  headingText: $from.parent.textContent,
                }
              );
              return false;
            }
          }

          // Check if selection spans across a heading (would merge content)
          if (!selection.empty && $from.parent !== $to.parent) {
            let blocksHeadingEdit = false;

            state.doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
              if (node.type.name === 'heading') {
                const level = node.attrs?.level || 1;
                if (level !== 1) {
                  logger.debug(
                    '[PreventHeaderEditing] Blocked selection spanning heading',
                    {
                      level,
                      headingText: node.textContent,
                    }
                  );
                  blocksHeadingEdit = true;
                  return false; // Stop iteration
                }
              }
            });

            if (blocksHeadingEdit) {
              return false;
            }
          }

          // Check for operations that might affect headings
          for (const step of tr.steps) {
            if (
              step instanceof ReplaceStep ||
              step instanceof ReplaceAroundStep
            ) {
              const from = step.from;
              const to = step.to;

              // Check if the operation affects a heading
              let affectsHeading = false;
              state.doc.nodesBetween(from, to, (node, pos) => {
                if (node.type.name === 'heading') {
                  const level = node.attrs?.level || 1;
                  if (level !== 1) {
                    logger.debug(
                      '[PreventHeaderEditing] Blocked operation affecting heading',
                      {
                        operation: step.constructor.name,
                        level,
                        headingText: node.textContent,
                        from,
                        to,
                      }
                    );
                    affectsHeading = true;
                    return false;
                  }
                }
              });

              if (affectsHeading) {
                return false;
              }
            }
          }

          // Check if we're at the start of a paragraph that follows a heading
          // and trying to backspace (which would merge with the heading)
          if (selection.empty && $from.parentOffset === 0) {
            try {
              const $before = state.doc.resolve($from.pos - 1);

              // Check if the previous node is a heading
              if ($before.parent.type.name === 'heading') {
                const level = $before.parent.attrs?.level || 1;
                if (level !== 1) {
                  // Check if this transaction would delete content (indicating backspace)
                  let isDeleting = false;
                  for (const step of tr.steps) {
                    if (step instanceof ReplaceStep) {
                      if (step.slice.size === 0 && step.from < step.to) {
                        isDeleting = true;
                        break;
                      }
                    }
                  }

                  if (isDeleting) {
                    logger.debug(
                      '[PreventHeaderEditing] Blocked backspace into heading',
                      {
                        level,
                        headingText: $before.parent.textContent,
                        cursorPos: $from.pos,
                      }
                    );
                    return false;
                  }
                }
              }
            } catch (error) {
              // Silently handle position resolution errors
              logger.debug('[PreventHeaderEditing] Position resolution error', {
                error,
              });
            }
          }

          // Otherwise allow the transaction
          return true;
        },

        // Add key handling to prevent specific problematic keys
        props: {
          handleKeyDown: (view, event) => {
            const { state } = view;
            const { selection } = state;
            const { $from } = selection;

            // If we're at the start of a paragraph following a heading
            if (
              selection.empty &&
              $from.parentOffset === 0 &&
              $from.parent.type.name === 'paragraph'
            ) {
              try {
                const $before = state.doc.resolve($from.pos - 1);

                if ($before.parent.type.name === 'heading') {
                  const level = $before.parent.attrs?.level || 1;

                  // Block backspace and delete when at start of paragraph after heading
                  if (
                    level !== 1 &&
                    (event.key === 'Backspace' || event.key === 'Delete')
                  ) {
                    logger.debug(
                      '[PreventHeaderEditing] Blocked key at paragraph start after heading',
                      {
                        key: event.key,
                        level,
                        headingText: $before.parent.textContent,
                      }
                    );
                    event.preventDefault();
                    return true;
                  }
                }
              } catch (error) {
                // Silently handle any position resolution errors
                logger.debug(
                  '[PreventHeaderEditing] Position resolution error',
                  { error }
                );
              }
            }

            // Block keys when cursor is inside a protected heading
            if ($from.parent.type.name === 'heading') {
              const level = $from.parent.attrs?.level || 1;
              if (level !== 1) {
                // Block all content-changing keys
                if (
                  event.key.length === 1 || // Any character
                  event.key === 'Backspace' ||
                  event.key === 'Delete' ||
                  event.key === 'Enter' ||
                  event.key === 'Tab' ||
                  (event.ctrlKey && (event.key === 'v' || event.key === 'x'))
                ) {
                  logger.debug(
                    '[PreventHeaderEditing] Blocked key inside heading',
                    {
                      key: event.key,
                      level,
                      headingText: $from.parent.textContent,
                    }
                  );
                  event.preventDefault();
                  return true;
                }
              }
            }

            return false;
          },
        },
      }),
    ];
  },
});

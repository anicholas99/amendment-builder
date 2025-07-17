import { logger } from '@/utils/clientLogger';
import {
  extractParagraphNumber,
  SectionTracker,
  shouldNumberParagraph,
  looksLikeHeader,
} from './utils';
import {
  ParagraphUpdate,
  ContentBasedParagraphNumberingOptions,
} from './types';

/**
 * Handle Enter key for auto-numbering new paragraphs
 */
export function handleEnterKey(
  view: any,
  event: KeyboardEvent,
  storage: any,
  options: ContentBasedParagraphNumberingOptions
): boolean {
  if (!storage.enabled) return false;

  const { state } = view;
  const { selection } = state;
  const { $from } = selection;

  // Check if we're at the end of a numbered paragraph
  if (selection.empty && $from.parent.type.name === 'paragraph') {
    const text = $from.parent.textContent;
    const numberInfo = extractParagraphNumber(text);

    if (numberInfo) {
      const cursorOffset = $from.parentOffset;
      const paragraphLength = text.length;

      // If cursor is at or near the end of the paragraph
      if (cursorOffset >= paragraphLength - 2) {
        // Create new paragraph without number first
        const tr = state.tr;
        const pos = $from.after($from.depth);

        // Insert new empty paragraph (will be numbered by renumbering)
        tr.replaceWith(pos, pos, state.schema.nodes.paragraph.create());

        // Position cursor in the new paragraph
        const newPos = pos + 1;
        tr.setSelection(
          state.selection.constructor.near(tr.doc.resolve(newPos))
        );

        view.dispatch(tr);
        event.preventDefault();

        // Complete renumbering of all paragraphs
        setTimeout(() => {
          performCompleteRenumbering(view, storage, options);
        }, 150);

        return true;
      }
    }
  }

  return false;
}

/**
 * Handle Backspace key within paragraph numbers
 */
export function handleBackspaceKey(
  view: any,
  event: KeyboardEvent,
  storage: any,
  options: ContentBasedParagraphNumberingOptions
): boolean {
  if (!storage.enabled) return false;

  const { state } = view;
  const { selection } = state;
  const { $from } = selection;

  // Check if we're in a paragraph
  if ($from.parent.type.name === 'paragraph') {
    const text = $from.parent.textContent;
    const numberInfo = extractParagraphNumber(text);

    if (numberInfo) {
      const numberLength = numberInfo.fullMatch.length;
      const cursorOffset = $from.parentOffset;

      // If cursor is anywhere within the number pattern or right after it
      if (cursorOffset <= numberLength) {
        // Delete the entire number pattern
        const tr = state.tr;
        const start = $from.start($from.depth);
        tr.delete(start, start + numberLength);

        view.dispatch(tr);
        event.preventDefault();

        // Safe auto-renumbering after deletion
        setTimeout(() => {
          performSafeRenumbering(view, storage, options);
        }, 50);

        return true;
      }
    }
  }

  return false;
}

/**
 * Perform complete renumbering after Enter key
 */
function performCompleteRenumbering(
  view: any,
  storage: any,
  options: ContentBasedParagraphNumberingOptions
): void {
  if (storage.isUpdating) return;

  storage.isUpdating = true;

  try {
    const { state } = view;
    const tr = state.tr;
    let currentNumber = options.startNumber;
    const sectionTracker = new SectionTracker();
    const updates: ParagraphUpdate[] = [];

    // Complete renumbering: number ALL eligible paragraphs sequentially
    state.doc.descendants((node: any, pos: number) => {
      sectionTracker.update(node);

      if (node.type.name === 'paragraph' && node.isBlock) {
        const currentSection = sectionTracker.getSection();
        const text = node.textContent.trim();

        // Process all eligible paragraphs (including empty ones from new paragraph)
        const isEligible =
          currentSection !== 'CLAIMS' &&
          currentSection !== 'ABSTRACT' &&
          !looksLikeHeader(text);

        if (isEligible) {
          const numberInfo = extractParagraphNumber(text);
          const expectedNumber = options.formatNumber(currentNumber);

          logger.debug(
            '[ContentBasedParagraphNumbering] Processing paragraph',
            {
              pos,
              text: text.substring(0, 30),
              textLength: text.length,
              hasNumber: !!numberInfo,
              expectedNumber: currentNumber,
              currentSection,
            }
          );

          if (numberInfo) {
            // Existing numbered paragraph - update if needed
            const actualNumber = parseInt(numberInfo.number, 10);
            if (actualNumber !== currentNumber) {
              updates.push({
                pos: pos + 1,
                action: 'update',
                oldNumber: numberInfo.fullMatch,
                newNumber: `${expectedNumber} `,
              });
            }
          } else {
            // Paragraph without number - add number
            updates.push({
              pos: pos + 1,
              action: 'add',
              newNumber: `${expectedNumber} `,
            });
            logger.debug(
              '[ContentBasedParagraphNumbering] Adding number to paragraph',
              {
                pos: pos + 1,
                number: expectedNumber,
                isEmpty: text.length === 0,
              }
            );
          }

          currentNumber++;
        }
      }
    });

    // Apply updates in reverse order
    updates.reverse().forEach(update => {
      if (update.action === 'update' && update.oldNumber) {
        tr.delete(update.pos, update.pos + update.oldNumber.length);
        tr.insertText(update.newNumber, update.pos);
      } else if (update.action === 'add') {
        tr.insertText(update.newNumber, update.pos);
      }
    });

    if (updates.length > 0) {
      logger.info(
        '[ContentBasedParagraphNumbering] Complete renumbering after Enter',
        {
          updatesApplied: updates.length,
        }
      );
      view.dispatch(tr);
    }
  } catch (error) {
    logger.error(
      '[ContentBasedParagraphNumbering] Enter renumber failed:',
      error
    );
  } finally {
    storage.isUpdating = false;
  }
}

/**
 * Perform safe renumbering after Backspace
 */
function performSafeRenumbering(
  view: any,
  storage: any,
  options: ContentBasedParagraphNumberingOptions
): void {
  if (storage.isUpdating) return;

  storage.isUpdating = true;

  try {
    const { state } = view;
    const tr = state.tr;
    let currentNumber = options.startNumber;
    const sectionTracker = new SectionTracker();
    const updates: Array<{
      pos: number;
      oldNumber: string;
      newNumber: string;
    }> = [];

    // First pass: identify sections and collect numbered paragraphs
    state.doc.descendants((node: any, pos: number) => {
      sectionTracker.update(node);

      // Only process paragraph nodes
      if (node.type.name === 'paragraph' && node.isBlock) {
        const currentSection = sectionTracker.getSection();
        const shouldSkip =
          currentSection === 'CLAIMS' || currentSection === 'ABSTRACT';
        const text = node.textContent.trim();

        // Skip empty paragraphs
        if (text.length === 0) return;

        // Only process eligible paragraphs in description sections
        if (!shouldSkip && !looksLikeHeader(text)) {
          const numberInfo = extractParagraphNumber(text);

          if (numberInfo) {
            // This paragraph has a number - check if it needs updating
            const actualNumber = parseInt(numberInfo.number, 10);
            const expectedNumber = currentNumber;

            if (actualNumber !== expectedNumber) {
              const newNumberText = options.formatNumber(expectedNumber);
              updates.push({
                pos: pos + 1,
                oldNumber: numberInfo.fullMatch,
                newNumber: `${newNumberText} `,
              });
            }

            currentNumber++;
          }
        }
      }
    });

    // Apply updates in reverse order to maintain positions
    updates.reverse().forEach(update => {
      tr.delete(update.pos, update.pos + update.oldNumber.length);
      tr.insertText(update.newNumber, update.pos);
    });

    if (updates.length > 0) {
      logger.info('[ContentBasedParagraphNumbering] Auto-renumbered', {
        updatesApplied: updates.length,
      });
      view.dispatch(tr);
    }
  } catch (error) {
    logger.error(
      '[ContentBasedParagraphNumbering] Auto-renumber failed:',
      error
    );
  } finally {
    storage.isUpdating = false;
  }
}

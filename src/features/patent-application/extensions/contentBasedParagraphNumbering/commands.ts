import { logger } from '@/utils/clientLogger';
import {
  extractParagraphNumber,
  SectionTracker,
  shouldNumberParagraph,
  looksLikeHeader,
  PARAGRAPH_NUMBER_REGEX,
} from './utils';
import {
  ContentBasedParagraphNumberingOptions,
  ParagraphToNumber,
  NumberToRemove,
} from './types';

/**
 * Toggle paragraph numbering on/off globally
 */
export function toggleParagraphNumbering(
  storage: any,
  options: ContentBasedParagraphNumberingOptions
) {
  return ({ tr, state, dispatch }: any) => {
    const wasEnabled = storage.enabled;
    logger.info('[ContentBasedParagraphNumbering] Toggle called', {
      currentlyEnabled: wasEnabled,
      hasDispatch: !!dispatch,
    });

    if (wasEnabled) {
      // Turn off numbering - remove all numbers
      logger.info('[ContentBasedParagraphNumbering] Turning OFF numbering');
      storage.enabled = false;

      // First, collect all paragraph numbers with their positions
      const numbersToRemove: NumberToRemove[] = [];

      state.doc.descendants((node: any, pos: number) => {
        if (node.type.name === 'paragraph' && node.isBlock) {
          const text = node.textContent;
          const numberInfo = extractParagraphNumber(text);

          if (numberInfo) {
            numbersToRemove.push({
              pos: pos + 1, // Position inside the paragraph
              length: numberInfo.fullMatch.length,
            });
          }
        }
      });

      // Remove numbers in reverse order to maintain positions
      numbersToRemove.reverse().forEach(item => {
        tr.delete(item.pos, item.pos + item.length);
      });

      logger.info('[ContentBasedParagraphNumbering] Removed numbers', {
        numbersRemoved: numbersToRemove.length,
      });
    } else {
      // Turn on numbering - add numbers to all eligible paragraphs
      logger.info('[ContentBasedParagraphNumbering] Turning ON numbering');
      storage.enabled = true;

      // Add paragraph numbers using a careful approach
      const currentNumber = options.startNumber;
      const sectionTracker = new SectionTracker();
      let numbersAdded = 0;

      // First, collect all paragraph nodes with their proper positions
      const paragraphsToNumber: ParagraphToNumber[] = [];

      state.doc.descendants((node: any, pos: number) => {
        sectionTracker.update(node);

        // Collect paragraph nodes that should be numbered
        if (
          node.type.name === 'paragraph' &&
          node.isBlock &&
          node.textContent.trim().length > 0
        ) {
          const currentSection = sectionTracker.getSection();
          const shouldSkip =
            currentSection === 'CLAIMS' || currentSection === 'ABSTRACT';
          const alreadyNumbered = PARAGRAPH_NUMBER_REGEX.test(node.textContent);

          const textContent = node.textContent.trim();

          if (
            !shouldSkip &&
            !alreadyNumbered &&
            !looksLikeHeader(textContent)
          ) {
            paragraphsToNumber.push({ node, pos, section: currentSection });
          }
        }
      });

      // Now add numbers to collected paragraphs in reverse order (to maintain positions)
      paragraphsToNumber.reverse().forEach((item, index) => {
        const number = options.formatNumber(
          currentNumber + (paragraphsToNumber.length - 1 - index)
        );
        // Insert at the very beginning of the paragraph's content
        const insertPos = item.pos + 1;
        tr.insertText(`${number} `, insertPos);
        numbersAdded++;

        logger.debug('[ContentBasedParagraphNumbering] Adding number', {
          number,
          insertPos,
          nodePos: item.pos,
          section: item.section,
          textStart: item.node.textContent.substring(0, 30),
        });
      });

      logger.info('[ContentBasedParagraphNumbering] Added numbers', {
        numbersAdded,
      });
    }

    // Log final state
    logger.info('[ContentBasedParagraphNumbering] Toggle completed', {
      wasEnabled,
      nowEnabled: storage.enabled,
      stateChanged: wasEnabled !== storage.enabled,
    });

    return true;
  };
}

/**
 * Toggle numbering for a specific paragraph
 */
export function toggleParagraphNumberingAt(
  editor: any,
  storage: any,
  options: ContentBasedParagraphNumberingOptions
) {
  return (pos: number) =>
    ({ tr, state }: any) => {
      if (storage.isUpdating) return false;

      const $pos = state.doc.resolve(pos);
      let paragraphNode = null;
      let paragraphStart = -1;

      // Find the paragraph node more carefully
      for (let depth = $pos.depth; depth >= 0; depth--) {
        const node = $pos.node(depth);
        if (node.type.name === 'paragraph') {
          paragraphNode = node;
          paragraphStart = $pos.start(depth);
          break;
        }
      }

      if (!paragraphNode || paragraphStart === -1) return false;

      const text = paragraphNode.textContent;

      // Check if paragraph currently has a number
      const hasNumber = PARAGRAPH_NUMBER_REGEX.test(text);

      if (hasNumber) {
        // Remove the number
        const numberInfo = extractParagraphNumber(text);
        if (numberInfo) {
          tr.delete(
            paragraphStart,
            paragraphStart + numberInfo.fullMatch.length
          );
        }
      } else {
        // Add a number to this paragraph
        // First get the current paragraph count to determine the right number
        let currentNumber = options.startNumber;
        const sectionTracker = new SectionTracker();

        state.doc.descendants((node: any, nodePos: number) => {
          sectionTracker.update(node);

          // Count numbered paragraphs up to this point
          if (
            node.type.name === 'paragraph' &&
            node.isBlock &&
            nodePos < paragraphStart
          ) {
            const currentSection = sectionTracker.getSection();
            const shouldSkip =
              currentSection === 'CLAIMS' || currentSection === 'ABSTRACT';
            const hasExistingNumber = PARAGRAPH_NUMBER_REGEX.test(
              node.textContent
            );

            if (
              !shouldSkip &&
              hasExistingNumber &&
              node.textContent.trim().length > 0
            ) {
              currentNumber++;
            }
          }
        });

        const number = options.formatNumber(currentNumber);
        tr.insertText(`${number} `, paragraphStart);
      }

      // Renumber all paragraphs after this change
      setTimeout(() => {
        editor.commands.renumberParagraphs();
      }, 0);

      return true;
    };
}

/**
 * Add paragraph numbers to all eligible paragraphs
 */
export function addParagraphNumbers(
  storage: any,
  options: ContentBasedParagraphNumberingOptions
) {
  return ({ tr, state }: any) => {
    logger.info('[ContentBasedParagraphNumbering] addParagraphNumbers called');

    if (storage.isUpdating) {
      logger.warn(
        '[ContentBasedParagraphNumbering] Already updating, skipping'
      );
      return false;
    }
    storage.isUpdating = true;

    try {
      let currentNumber = options.startNumber;
      const sectionTracker = new SectionTracker();
      let numbersAdded = 0;

      state.doc.descendants((node: any, pos: number) => {
        sectionTracker.update(node);

        // Process paragraphs only
        if (node.type.name === 'paragraph' && node.isBlock) {
          const currentSection = sectionTracker.getSection();
          const shouldSkip =
            currentSection === 'CLAIMS' || currentSection === 'ABSTRACT';
          const alreadyNumbered = PARAGRAPH_NUMBER_REGEX.test(node.textContent);
          const explicitlyDisabled =
            node.attrs && node.attrs['data-numbered'] === 'false';

          const textContent = node.textContent.trim();

          if (
            !shouldSkip &&
            !alreadyNumbered &&
            !explicitlyDisabled &&
            !looksLikeHeader(textContent) &&
            textContent.length > 0
          ) {
            // Add number to this paragraph
            const number = options.formatNumber(currentNumber);
            tr.insertText(`${number} `, pos + 1);

            currentNumber++;
            numbersAdded++;
            logger.debug('[ContentBasedParagraphNumbering] Added number', {
              number,
              pos,
              text: node.textContent.substring(0, 50),
            });
          }
        }
      });

      logger.info(
        '[ContentBasedParagraphNumbering] addParagraphNumbers completed',
        {
          numbersAdded,
          totalParagraphs: state.doc.nodeSize,
          enabled: storage.enabled,
        }
      );

      return true;
    } finally {
      storage.isUpdating = false;
    }
  };
}

/**
 * Remove all paragraph numbers
 */
export function removeParagraphNumbers(storage: any) {
  return ({ tr, state }: any) => {
    if (storage.isUpdating) return false;
    storage.isUpdating = true;

    try {
      // Remove all paragraph numbers
      state.doc.descendants((node: any, pos: number) => {
        if (node.type.name === 'paragraph' && node.isBlock) {
          const text = node.textContent;
          const numberInfo = extractParagraphNumber(text);

          if (numberInfo) {
            tr.delete(pos + 1, pos + 1 + numberInfo.fullMatch.length);
          }
        }
      });

      return true;
    } finally {
      storage.isUpdating = false;
    }
  };
}

/**
 * Renumber all paragraphs that have numbering enabled
 */
export function renumberParagraphs(
  storage: any,
  options: ContentBasedParagraphNumberingOptions
) {
  return ({ tr, state }: any) => {
    if (storage.isUpdating) return false;
    storage.isUpdating = true;

    try {
      let currentNumber = options.startNumber;
      const sectionTracker = new SectionTracker();

      state.doc.descendants((node: any, pos: number) => {
        sectionTracker.update(node);

        // Process paragraphs ONLY
        if (node.type.name === 'paragraph' && node.isBlock) {
          const currentSection = sectionTracker.getSection();
          const shouldSkip =
            currentSection === 'CLAIMS' || currentSection === 'ABSTRACT';
          const text = node.textContent;
          const hasNumber = PARAGRAPH_NUMBER_REGEX.test(text);

          const textContent = text.trim();

          if (
            !shouldSkip &&
            !looksLikeHeader(textContent) &&
            textContent.length > 0
          ) {
            const newNumber = options.formatNumber(currentNumber);

            if (hasNumber) {
              // Update existing number
              const numberInfo = extractParagraphNumber(text);
              if (numberInfo && numberInfo.fullMatch !== `${newNumber} `) {
                tr.delete(pos + 1, pos + 1 + numberInfo.fullMatch.length);
                tr.insertText(`${newNumber} `, pos + 1);
              }
              currentNumber++;
            } else {
              // Auto-add number to new paragraph in description sections when numbering is enabled
              tr.insertText(`${newNumber} `, pos + 1);
              logger.debug(
                '[ContentBasedParagraphNumbering] Added number to new paragraph',
                {
                  number: newNumber,
                  pos,
                  text: text.substring(0, 30),
                }
              );
              currentNumber++;
            }
          }
        }
      });

      return true;
    } finally {
      storage.isUpdating = false;
    }
  };
}

/**
 * Clean up all malformed paragraph numbers
 */
export function cleanupMalformedNumbers(storage: any) {
  return ({ tr, state }: any) => {
    logger.info(
      '[ContentBasedParagraphNumbering] Cleaning up malformed numbers'
    );

    if (storage.isUpdating) return false;
    storage.isUpdating = true;

    try {
      let cleanedCount = 0;

      // Find and remove all instances of [####] pattern throughout the document
      state.doc.descendants((node: any, pos: number) => {
        if (node.isText && node.text) {
          const text = node.text;
          const regex = /\[(\d{4})\]\s?/g;
          let match;
          const matches: any[] = [];

          while ((match = regex.exec(text)) !== null) {
            matches.push({
              start: match.index,
              end: match.index + match[0].length,
              full: match[0],
            });
          }

          // Remove matches in reverse order to maintain positions
          matches.reverse().forEach(m => {
            tr.delete(pos + m.start, pos + m.end);
            cleanedCount++;
          });
        }
      });

      logger.info('[ContentBasedParagraphNumbering] Cleanup completed', {
        cleanedCount,
      });
      storage.enabled = false; // Reset to disabled state

      return true;
    } finally {
      storage.isUpdating = false;
    }
  };
}

/**
 * Remove paragraph numbers from headers immediately
 */
export function removeNumbersFromHeaders(storage: any) {
  return ({ tr, state }: any) => {
    logger.info(
      '[ContentBasedParagraphNumbering] Removing numbers from headers'
    );

    if (storage.isUpdating) return false;
    storage.isUpdating = true;

    try {
      let cleanedCount = 0;

      state.doc.descendants((node: any, pos: number) => {
        // Remove numbers from any heading nodes
        if (node.type.name === 'heading') {
          const text = node.textContent;
          const numberInfo = extractParagraphNumber(text);

          if (numberInfo) {
            tr.delete(pos + 1, pos + 1 + numberInfo.fullMatch.length);
            cleanedCount++;
            logger.debug(
              '[ContentBasedParagraphNumbering] Removed number from heading',
              {
                text: text.substring(0, 50),
              }
            );
          }
        }

        // Also remove from paragraphs that look like headers
        if (node.type.name === 'paragraph' && node.isBlock) {
          const text = node.textContent;
          const textContent = text.trim();

          if (looksLikeHeader(textContent)) {
            const numberInfo = extractParagraphNumber(text);
            if (numberInfo) {
              tr.delete(pos + 1, pos + 1 + numberInfo.fullMatch.length);
              cleanedCount++;
              logger.debug(
                '[ContentBasedParagraphNumbering] Removed number from header-like paragraph',
                {
                  text: text.substring(0, 50),
                }
              );
            }
          }
        }
      });

      logger.info('[ContentBasedParagraphNumbering] Header cleanup completed', {
        cleanedCount,
      });

      return true;
    } finally {
      storage.isUpdating = false;
    }
  };
}

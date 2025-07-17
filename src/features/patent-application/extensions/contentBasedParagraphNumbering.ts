/**
 * Content-Based Paragraph Numbering Extension
 *
 * This file now re-exports from the modular structure.
 * The implementation has been refactored into separate modules for better maintainability.
 *
 * @see ./contentBasedParagraphNumbering/index.ts - Main extension file
 * @see ./contentBasedParagraphNumbering/types.ts - Type definitions
 * @see ./contentBasedParagraphNumbering/utils.ts - Utility functions
 * @see ./contentBasedParagraphNumbering/commands.ts - Command implementations
 * @see ./contentBasedParagraphNumbering/keyboardHandlers.ts - Keyboard event handlers
 */

export {
  ContentBasedParagraphNumbering,
  getContentWithPatentNumbers,
  type ContentBasedParagraphNumberingOptions,
} from './contentBasedParagraphNumbering/index';

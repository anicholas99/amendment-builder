import { STANDARD_SECTION_ORDER, SECTION_PATTERNS } from './constants';
import {
  getStandardSectionName,
  shouldAutoCreateSection,
  PATENT_SECTION_CONFIG,
} from './sectionConfig';
import { logger } from '@/utils/clientLogger';

// Add import for TipTap Editor
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import type { Node } from '@tiptap/pm/model';

/**
 * Extract individual sections from complete patent content
 * @param content Complete formatted patent text
 * @returns Object with section titles as keys and content as values
 */
export const extractSections = (content: string): { [key: string]: string } => {
  if (!content || typeof content !== 'string') {
    logger.error('Invalid content passed to extractSections:', content);
    return {};
  }

  // First try Editor-based extraction if content contains HTML
  if (content.includes('<h1') || content.includes('<h2')) {
    const editorSections = extractSectionsUsingEditor(content);
    if (Object.keys(editorSections).length > 0) {
      logger.info('Successfully extracted sections using Editor', {
        sectionCount: Object.keys(editorSections).length,
        sectionKeys: Object.keys(editorSections),
      });
      return editorSections;
    }

    // Fall back to DOM-based extraction
    const htmlSections = extractSectionsFromHTML(content);
    if (Object.keys(htmlSections).length > 0) {
      logger.info('Successfully extracted sections from HTML', {
        sectionCount: Object.keys(htmlSections).length,
        sectionKeys: Object.keys(htmlSections),
      });
      return htmlSections;
    }
  }

  // Clean up potential HTML tags from content before processing
  // Replace <p> with newline and remove other tags
  const cleanContent = content
    .replace(/<p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .trim();

  const sections: { [key: string]: string } = {};
  const processedSectionNames = new Set<string>();

  extractTitle(cleanContent, sections, processedSectionNames);

  // Define the standard section headers for matching boundaries
  const sectionHeadersRegexPart = STANDARD_SECTION_ORDER.slice(1) // Exclude Title
    .map(name => name.replace(/\s+/g, '[\\s\\n]+')) // Allow flexible whitespace
    .join('|'); // Join with OR

  // Try extracting using regex patterns first, making them more robust
  STANDARD_SECTION_ORDER.forEach(name => {
    if (processedSectionNames.has(name.toUpperCase())) return;

    // Find the specific pattern for the current section name
    const patternInfo = SECTION_PATTERNS.find(p => p.name === name);
    let regexPattern: RegExp | null = null;

    if (patternInfo) {
      // Construct a more robust regex for each section
      // Header part: Matches the section name (e.g., FIELD, BACKGROUND OF THE INVENTION)
      // Allows flexible spacing and optional "OF THE INVENTION"
      const headerPart =
        patternInfo.name.replace(/\s+/g, '[\\s\\n]+') + // Allow spaces or newlines between words
        '(?:[\\s\\n]+OF[\\s\\n]+THE[\\s\\n]+INVENTION)?';

      // Content part: Matches everything until the next known section header or end of string
      // Use a positive lookahead `(?=...)` to find the boundary without consuming it
      // Boundary is start of next known section OR end of string `$`
      const contentPart = `([\\s\\S]*?)(?=\\r?\\n\\r?\\n(?:${sectionHeadersRegexPart})\\b|$)`;

      // Combine header and content parts with optional whitespace/newlines in between
      try {
        regexPattern = new RegExp(
          `^${headerPart}\\s*\\r?\\n\\r?\n${contentPart}`,
          'i' // Case-insensitive
        );
      } catch (e) {
        logger.error(`Failed to create regex for section ${name}:`, e);
        regexPattern = null;
      }
    } else if (name === 'Title') {
      // Title is handled by extractTitle, skip pattern matching
      return;
    }

    if (regexPattern) {
      const match = cleanContent.match(regexPattern);
      if (match && match[1]) {
        const sectionContent = match[1].trim();
        if (sectionContent) {
          sections[name] = sectionContent;
          processedSectionNames.add(name.toUpperCase());
          logger.info(
            `Extracted section via Regex: ${name} (${sectionContent.length} chars)`
          );
        }
      }
    }
  });

  // If pattern matching didn't get enough, try line-by-line as a fallback
  if (Object.keys(sections).length < 3) {
    // Increased threshold slightly
    logger.warn(
      'Pattern matching extracted few sections, trying line-by-line fallback.'
    );
    extractSectionsLineByLine(cleanContent, sections, processedSectionNames);
  }

  logger.info('Final Extracted sections:', {
    sectionKeys: Object.keys(sections),
  });
  return sections;
};

/**
 * Extract sections using TipTap Editor for reliable parsing
 * This avoids regex failures on complex content
 */
export function extractSectionsUsingEditor(htmlContent: string): {
  [key: string]: string;
} {
  const sections: { [key: string]: string } = {};

  // Only use in browser environment
  if (typeof window === 'undefined') {
    logger.warn(
      '[extractSectionsUsingEditor] Not in browser environment, falling back'
    );
    return extractSectionsFromHTML(htmlContent);
  }

  try {
    // Create a headless editor instance
    const editor = new Editor({
      content: htmlContent,
      extensions: [StarterKit],
      editable: false,
    });

    let currentSection = '';
    let currentContent: string[] = [];

    // Traverse the document
    editor.state.doc.descendants((node: Node, pos: number) => {
      if (node.type.name === 'heading') {
        // Save previous section if exists
        if (currentSection) {
          const normalizedTitle = getStandardSectionName(currentSection);
          if (normalizedTitle) {
            sections[normalizedTitle] = currentContent.join('\n').trim();
          }
        }

        // Check heading level to determine if it's a title (h1) or section header (h2)
        const headingLevel = node.attrs.level;
        const headingText = node.textContent || '';

        if (headingLevel === 1) {
          // This is the title - save the content directly
          sections['Title'] = headingText;
          logger.info('[extractSectionsUsingEditor] Found title in h1', {
            title: headingText,
            headingLevel,
            nodeType: node.type.name,
          });
          currentSection = '';
          currentContent = [];
        } else {
          // This is a section header (h2, h3, etc.)
          currentSection = headingText;
          currentContent = [];
          logger.debug('[extractSectionsUsingEditor] Found section header', {
            section: headingText,
            headingLevel,
            nodeType: node.type.name,
          });
        }
      } else if (currentSection) {
        // Skip section spacers
        if (node.type.name === 'paragraph' && node.textContent) {
          currentContent.push(node.textContent);
        }
      }

      return true; // Continue traversing
    });

    // Don't forget the last section
    if (currentSection) {
      const normalizedTitle = getStandardSectionName(currentSection);
      if (normalizedTitle) {
        sections[normalizedTitle] = currentContent.join('\n').trim();
      }
    }

    // Clean up
    editor.destroy();

    logger.info(
      '[extractSectionsUsingEditor] Successfully extracted sections',
      {
        sectionCount: Object.keys(sections).length,
        sectionKeys: Object.keys(sections),
        titleContent: sections['Title'] || 'NO TITLE FOUND',
        titleLength: sections['Title']?.length || 0,
      }
    );

    return sections;
  } catch (error) {
    logger.error('[extractSectionsUsingEditor] Failed to parse with Editor', {
      error,
    });
    return extractSectionsFromHTML(htmlContent);
  }
}

function extractTitle(
  content: string,
  sections: { [key: string]: string },
  processedSectionNames: Set<string>
) {
  // More robust title extraction: Look for the first line that seems like a title
  // (mostly uppercase, maybe some numbers/hyphens, relatively short)
  const lines = content.split('\n');
  let potentialTitle = '';
  for (const line of lines) {
    const trimmedLine = line.trim();
    // Basic check: not empty, likely uppercase-dominant, not a standard section header
    if (
      trimmedLine &&
      trimmedLine.length > 5 &&
      trimmedLine.length < 150 && // Reasonable title length
      (trimmedLine.match(/[A-Z]/g)?.length || 0) / trimmedLine.length > 0.5 && // Uppercase dominant
      !STANDARD_SECTION_ORDER.slice(1).some(sec => trimmedLine === sec)
    ) {
      potentialTitle = trimmedLine;
      break; // Take the first likely candidate
    }
  }

  if (potentialTitle && !processedSectionNames.has('TITLE')) {
    sections['Title'] = potentialTitle;
    processedSectionNames.add('TITLE');
    logger.info(`Extracted Title: ${potentialTitle}`);
  }
}

function extractSectionsLineByLine(
  content: string,
  sections: { [key: string]: string },
  processedSectionNames: Set<string>
) {
  logger.info('[Fallback] Using line-by-line section extraction.');

  const lines = content.split('\n');
  let currentSection = '';
  let currentContent: string[] = [];
  const allSectionNamesUpper = STANDARD_SECTION_ORDER.map(s => s.toUpperCase());

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    let isSectionHeader = false;
    let matchedSectionName = '';

    // Check if line exactly matches or includes a standard section header (all caps)
    for (const sectionName of STANDARD_SECTION_ORDER) {
      const upperSectionName = sectionName.toUpperCase();
      // More specific matching: exact match or common variations
      if (
        line === upperSectionName ||
        line === sectionName || // Case sensitive match too
        (upperSectionName === 'FIELD' && line === 'FIELD OF THE INVENTION') ||
        (upperSectionName === 'BACKGROUND' &&
          line === 'BACKGROUND OF THE INVENTION') ||
        (upperSectionName === 'SUMMARY' &&
          line === 'SUMMARY OF THE INVENTION') ||
        (upperSectionName === 'DETAILED DESCRIPTION' &&
          line === 'DETAILED DESCRIPTION OF THE INVENTION') ||
        (upperSectionName === 'CLAIMS' && line === 'CLAIM SET')
      ) {
        isSectionHeader = true;
        matchedSectionName = sectionName; // Use the standard mixed-case name
        break;
      }
    }

    // Basic ALL CAPS check as fallback header detection
    if (
      !isSectionHeader &&
      line.length > 3 &&
      line.length < 60 &&
      line === line.toUpperCase() &&
      !line.match(/^[0-9\.\s]+$/)
    ) {
      // Use normalizeSectionTitle to get the standard name
      matchedSectionName = normalizeSectionTitle(line);
      isSectionHeader = true;
    }

    if (isSectionHeader) {
      // Save previous section if valid
      if (
        currentSection &&
        currentContent.length > 0 &&
        !processedSectionNames.has(currentSection.toUpperCase())
      ) {
        sections[currentSection] = currentContent.join('\n').trim();
        processedSectionNames.add(currentSection.toUpperCase());
        logger.info(`[Fallback] Extracted: ${currentSection}`);
      }

      // Start new section, only if not already processed
      const normalizedName = normalizeSectionTitle(matchedSectionName);
      if (!processedSectionNames.has(normalizedName.toUpperCase())) {
        currentSection = normalizedName;
        currentContent = [];
        logger.info(
          `[Fallback] Found header: ${line} -> Section: ${currentSection}`
        );
        // Skip potential blank line after header
        if (i + 1 < lines.length && lines[i + 1].trim() === '') {
          i++;
        }
      } else {
        // Section already processed, treat subsequent lines as content of *previous* section (if any)
        logger.info(`[Fallback] Skipping already processed header: ${line}`);
        // Add line to previous section's content if a section was active
        if (currentSection) {
          currentContent.push(lines[i]); // Add the header line itself as content if skipping
        }
        currentSection = ''; // Reset current section as we're skipping this header block
      }
    } else if (currentSection) {
      // Add line to current section's content
      currentContent.push(lines[i]); // Add the original line with its whitespace
    }
  }

  // Save the last section
  if (
    currentSection &&
    currentContent.length > 0 &&
    !processedSectionNames.has(currentSection.toUpperCase())
  ) {
    sections[currentSection] = currentContent.join('\n').trim();
    processedSectionNames.add(currentSection.toUpperCase());
    logger.info(`[Fallback] Extracted final section: ${currentSection}`);
  }
}

/**
 * Extract sections from HTML content by looking for h1/h2 headers
 * @param htmlContent HTML formatted patent content
 * @returns Object with section titles as keys and content as values
 */
function extractSectionsFromHTML(htmlContent: string): {
  [key: string]: string;
} {
  const sections: { [key: string]: string } = {};

  // First extract title from h1
  const titleMatch = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (titleMatch && titleMatch[1]) {
    const titleText = titleMatch[1].replace(/<[^>]*>/g, '').trim();
    if (titleText) {
      sections['Title'] = titleText;
      logger.info(`Extracted Title from HTML: ${titleText}`);
    }
  }

  // Extract sections from h2 headers
  const sectionRegex = /<h2[^>]*>(.*?)<\/h2>([\s\S]*?)(?=<h2[^>]*>|$)/gi;
  let match: RegExpExecArray | null;

  while ((match = sectionRegex.exec(htmlContent)) !== null) {
    const sectionTitle = match[1].replace(/<[^>]*>/g, '').trim();
    const sectionContent = match[2]
      .replace(/<div[^>]*class="section-spacer"[^>]*>[\s\S]*?<\/div>/gi, '') // Remove spacers
      .replace(/<p>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]*>/g, '') // Remove remaining tags
      .trim();

    if (sectionTitle && sectionContent) {
      // Normalize section name to match standard names
      const normalizedTitle = normalizeSectionTitle(sectionTitle);
      sections[normalizedTitle] = sectionContent;
      logger.info(
        `Extracted section from HTML: ${normalizedTitle} (${sectionContent.length} chars)`
      );
    }
  }

  return sections;
}

/**
 * Normalize section titles to match standard section names
 */
function normalizeSectionTitle(title: string): string {
  // Use the configuration-based normalization
  const standardName = getStandardSectionName(title);

  if (standardName) {
    // Only return the standard name if auto-creation is allowed
    // This prevents unexpected sections from appearing
    if (shouldAutoCreateSection(title)) {
      return standardName;
    }

    // Log when we skip auto-creating a section
    logger.debug(
      `[extractSections] Skipping auto-creation of section: ${title} -> ${standardName}`
    );
  }

  // Return original if no match found or auto-creation not allowed
  return title;
}

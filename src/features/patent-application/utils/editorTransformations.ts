import { logger } from '@/lib/monitoring/logger';
/**
 * Utility functions for transforming between plain text and HTML in the patent editor
 */

/**
 * Transforms plain text patent content to HTML for the editor
 *
 * @param content Plain text content with patent sections
 * @returns HTML content formatted for the editor
 */
export function transformPlainTextToHtml(content: string): string {
  if (!content) return '';

  let html = '';
  const lines = content.split('\n');
  let inBackground = false;
  let backgroundContent = '';
  let lastSectionEnd = -1;

  // Track sections we've already seen to avoid duplicates
  const processedSections = new Set();

  // First pass - find the title line (if any)
  let titleLineIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.match(/^[A-Z][A-Z0-9\s\-]{2,}$/)) {
      titleLineIndex = i;
      break;
    }
  }

  // Check if next line is a single character (likely a title fragment)
  if (titleLineIndex >= 0 && titleLineIndex + 1 < lines.length) {
    const nextLine = lines[titleLineIndex + 1].trim();
    if (nextLine.length === 1) {
      // This is likely a title fragment, merge it with the title
      lines[titleLineIndex] = lines[titleLineIndex] + nextLine;
      // Remove the fragment line
      lines.splice(titleLineIndex + 1, 1);
      logger.log('Detected and fixed title fragment', { fragment: nextLine });
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === '') {
      continue;
    }

    // Check if this is the very first content line (the title)
    if (
      lastSectionEnd === -1 &&
      !line.match(/^[A-Z\s\-\d]{2,}$/) &&
      !line.startsWith('**')
    ) {
      // This is the title - not all caps, just regular text
      html += `<h2 class="section-header patent-title">${line}</h2>`;
      // Add spacing after the title
      html += `<div class="section-spacer"></div>`;
      lastSectionEnd = i;
      processedSections.add('TITLE');
      continue;
    }

    // Handle section headers
    if (line.match(/^[A-Z\s\-\d]{2,}$/)) {
      // Extract the section name (for duplicate checking)
      const sectionName = line.toUpperCase();

      // Skip duplicate sections (except for the title)
      if (processedSections.has(sectionName) && lastSectionEnd !== -1) {
        logger.log(`Skipping duplicate section: ${sectionName}`);
        continue;
      }

      // Check for single-character line immediately after this section header (typically "T")
      if (i + 1 < lines.length && lines[i + 1].trim().length === 1) {
        logger.log(
          `Found single character fragment "${lines[i + 1].trim()}" after section ${sectionName}, removing it`
        );
        // Skip this fragment by advancing the counter (we'll jump over it)
        i++;
      }

      // Add to processed sections
      processedSections.add(sectionName);

      // Add any collected background content before starting a new section
      if (inBackground && backgroundContent) {
        html += `<p class="background-paragraph">${backgroundContent}</p>`;
        backgroundContent = '';
        inBackground = false;
        lastSectionEnd = i;
      }

      // Check if this is the title (first section)
      if (lastSectionEnd === -1) {
        // This is the title, just add it without spacing before
        html += `<h2 class="section-header patent-title">${line}</h2>`;
        // Add spacing after the title
        html += `<div class="section-spacer"></div>`;
        lastSectionEnd = i;
      } else {
        // For all other sections, add spacing before the section header
        html += `<div class="section-spacer"></div>`;
        html += `<h2 class="section-header">${line}</h2>`;
      }

      // Check if we're entering background section
      if (line === 'BACKGROUND') {
        inBackground = true;
      }
    } else if (line.startsWith('**') && line.endsWith('**')) {
      // Extract the section name (for duplicate checking)
      const sectionName = line.substring(2, line.length - 2).toUpperCase();

      // Skip duplicate sections
      if (processedSections.has(sectionName)) {
        logger.log(`Skipping duplicate section: ${sectionName}`);
        continue;
      }

      // Add to processed sections
      processedSections.add(sectionName);

      // Add any collected background content before starting a new section
      if (inBackground && backgroundContent) {
        html += `<p class="background-paragraph">${backgroundContent}</p>`;
        backgroundContent = '';
        inBackground = false;
        lastSectionEnd = i;
      }

      // Add extra spacing only if this isn't the first section
      if (lastSectionEnd !== -1) {
        // Add empty paragraph for better spacing
        html += `<div class="section-spacer"></div><p>&nbsp;</p>`;
      }

      // Bold headers
      html += `<h2 class="section-header">${line.substring(2, line.length - 2)}</h2>`;

      // Check if we're entering background section
      if (line.substring(2, line.length - 2).toUpperCase() === 'BACKGROUND') {
        inBackground = true;
      }
    } else {
      // Handle paragraph text
      if (inBackground) {
        // For background, collect all text into one paragraph
        backgroundContent += (backgroundContent ? ' ' : '') + line;
      } else {
        // Check if this is a figure description line
        if (line.startsWith('FIG.') || line.match(/^FIG\.\s+\d+/)) {
          // Figure descriptions should be on separate lines
          html += `<p>${line}</p>`;
          lastSectionEnd = i;
        } else {
          // Regular paragraph text
          html += `<p>${line}</p>`;
          lastSectionEnd = i;
        }
      }
    }
  }

  // Add any remaining background content at the end of document
  if (inBackground && backgroundContent) {
    html += `<p class="background-paragraph">${backgroundContent}</p>`;
  }

  return html;
}

/**
 * Transforms HTML content from the editor to plain text patent format
 *
 * @param html HTML content from the editor
 * @returns Plain text content formatted for patents
 */
export function transformHtmlToPlainText(html: string): string {
  if (!html || typeof window === 'undefined') return '';

  const root = document.createElement('div');
  // Safe: html is already sanitized content from our editor
  root.innerHTML = html;

  let plainText = '';
  let previousWasHeader = false;
  let currentSection = '';
  let isFirstSection = true;
  let lastHeaderText = '';
  let lastHeaderIndex = -1;

  // Process all nodes to rebuild plain text with proper formatting
  const elements = Array.from(
    root.querySelectorAll('h1, h2, h3, h4, h5, h6, p, div, ul, ol, li')
  );
  elements.forEach((el, index) => {
    // Handle section spacers
    if (el.classList.contains('section-spacer')) {
      return; // Skip spacer divs entirely for the exported document
    }

    const text = el.textContent?.trim() || '';
    if (!text) {
      return;
    }

    // Handle different element types
    if (el.tagName.toLowerCase().startsWith('h')) {
      // For headers, add proper spacing for export
      if (!isFirstSection) {
        // Add empty line between sections
        plainText += '\n\n';
      } else {
        isFirstSection = false;
      }

      // Save current section name
      currentSection = text.toUpperCase();
      lastHeaderText = currentSection;
      lastHeaderIndex = index;

      // Headings become all caps with space after
      plainText += `${currentSection}\n`;
      previousWasHeader = true;
    } else if (el.tagName.toLowerCase() === 'li') {
      // List items
      plainText += `- ${text}\n`;
      previousWasHeader = false;
    } else {
      // Normal paragraphs or background

      // Check for single letter paragraphs right after a header which might be a title fragment
      if (
        previousWasHeader &&
        text.length === 1 &&
        index === lastHeaderIndex + 1
      ) {
        // This is likely a fragment of the title, skip it
        logger.log('Detected title fragment, skipping', { text });
        previousWasHeader = false;
        return;
      }

      if (
        el.classList.contains('background-paragraph') ||
        currentSection === 'BACKGROUND'
      ) {
        // Background section - single paragraph
        plainText += `${text}\n`;
      } else if (
        currentSection === 'BRIEF DESCRIPTION OF THE DRAWINGS' &&
        text.match(/^FIG\.\s+\d+/)
      ) {
        // Figure descriptions should each be on their own line
        plainText += `${text}\n`;
      } else {
        // Other sections - maintain paragraph structure
        if (previousWasHeader) {
          plainText += `${text}\n`;
        } else {
          // For consecutive figure descriptions, don't add extra blank line
          if (
            currentSection === 'BRIEF DESCRIPTION OF THE DRAWINGS' &&
            elements[index - 1]?.textContent?.trim().match(/^FIG\.\s+\d+/)
          ) {
            plainText += `${text}\n`;
          } else {
            plainText += `${text}\n\n`;
          }
        }
      }
      previousWasHeader = false;
    }
  });

  return plainText.trim();
}

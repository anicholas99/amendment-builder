import { logger } from '@/utils/clientLogger';

/**
 * Normalizes patent HTML content to ensure consistent formatting
 * between generated and edited content. This acts as a safety net
 * to preserve patent-specific formatting.
 */
export function normalizePatentContent(html: string): string {
  if (!html) return '';

  try {
    // For server-side or initial render, return as-is
    if (typeof window === 'undefined') {
      return html;
    }

    // Create a temporary container to parse HTML
    const container = document.createElement('div');
    container.innerHTML = html;

    // Ensure h2 elements have correct classes
    const h2Elements = container.querySelectorAll('h2');
    h2Elements.forEach((h2, index) => {
      const text = h2.textContent?.trim() || '';

      // Check if this is the patent title (must be the very first h2 and not a standard section header)
      const isTitle =
        index === 0 &&
        !text.match(/^[A-Z\s]+$/) && // Not all caps (like FIELD, BACKGROUND, etc.)
        h2.classList.contains('patent-title'); // Already marked as title

      if (isTitle) {
        // Ensure title has correct classes
        if (!h2.classList.contains('patent-title')) {
          h2.classList.add('section-header', 'patent-title');
        }
      } else {
        // Regular section headers
        if (!h2.classList.contains('section-header')) {
          h2.classList.add('section-header');
        }
        // Make sure we remove patent-title class if it was incorrectly applied
        h2.classList.remove('patent-title');
      }
    });

    // Ensure section spacers are preserved
    // TipTap might remove empty divs, so we need to check and re-add them
    const headers = container.querySelectorAll('h2.section-header');
    headers.forEach((header, index) => {
      if (index > 0) {
        // Check if there's a spacer before this header
        const prevSibling = header.previousElementSibling;
        if (!prevSibling || !prevSibling.classList.contains('section-spacer')) {
          const spacer = document.createElement('div');
          spacer.className = 'section-spacer';
          header.parentNode?.insertBefore(spacer, header);
        }
      }
    });

    // Ensure background paragraphs retain their class
    const paragraphs = container.querySelectorAll('p');
    paragraphs.forEach(p => {
      // Check if this paragraph is in the background section
      let currentElement = p.previousElementSibling;
      let inBackgroundSection = false;

      while (currentElement) {
        if (currentElement.tagName === 'H2') {
          const headerText = currentElement.textContent?.trim().toUpperCase();
          if (headerText === 'BACKGROUND') {
            inBackgroundSection = true;
          }
          break;
        }
        currentElement = currentElement.previousElementSibling;
      }

      if (
        inBackgroundSection &&
        !p.classList.contains('background-paragraph')
      ) {
        p.classList.add('background-paragraph');
      }
    });

    // Fix figure descriptions - ensure each FIG. line is in its own paragraph
    let inDrawingsSection = false;
    const allElements = Array.from(container.children);

    for (let i = 0; i < allElements.length; i++) {
      const element = allElements[i];

      // Check if we're in the drawings section
      if (element.tagName === 'H2') {
        const headerText = element.textContent?.trim().toUpperCase() || '';
        inDrawingsSection =
          headerText.includes('BRIEF DESCRIPTION OF THE DRAWINGS') ||
          headerText.includes('DRAWINGS');
      }

      // Process paragraphs in the drawings section
      if (inDrawingsSection && element.tagName === 'P') {
        const text = element.textContent || '';

        // Check if this paragraph contains multiple FIG. descriptions
        const figPattern = /FIG\.\s*\d+/g;
        const matches = text.match(figPattern);

        if (matches && matches.length > 1) {
          // This paragraph contains multiple figure descriptions - split them
          logger.debug(
            '[normalizePatentContent] Splitting figure descriptions',
            {
              originalText: text,
              figureCount: matches.length,
            }
          );

          const parts = text.split(/(?=FIG\.\s*\d+)/);

          // Replace the current paragraph with separate paragraphs
          const parent = element.parentNode;
          parts.forEach((part, index) => {
            const trimmedPart = part.trim();
            if (trimmedPart) {
              const newP = document.createElement('p');
              newP.textContent = trimmedPart;
              if (index === 0) {
                // Replace the original paragraph with the first part
                parent?.replaceChild(newP, element);
              } else {
                // Insert subsequent parts after the previous one
                const prevP = parent?.children[i + index - 1];
                if (prevP && prevP.nextSibling) {
                  parent?.insertBefore(newP, prevP.nextSibling);
                } else {
                  parent?.appendChild(newP);
                }
              }
            }
          });
        }
      }
    }

    return container.innerHTML;
  } catch (error) {
    logger.error('[normalizePatentContent] Error normalizing content', {
      error,
    });
    return html; // Return original on error
  }
}

/**
 * Checks if the content needs normalization by looking for
 * missing patent-specific formatting
 */
export function needsNormalization(html: string): boolean {
  if (!html || typeof window === 'undefined') return false;

  try {
    const container = document.createElement('div');
    container.innerHTML = html;

    // Check if any h2 elements lack proper classes
    const h2Elements = container.querySelectorAll('h2');
    for (const h2 of Array.from(h2Elements)) {
      if (
        !h2.classList.contains('section-header') &&
        !h2.classList.contains('patent-title')
      ) {
        return true;
      }
    }

    // Check if section spacers are missing
    const headers = container.querySelectorAll('h2.section-header');
    for (let i = 1; i < headers.length; i++) {
      const header = headers[i];
      const prevSibling = header.previousElementSibling;
      if (!prevSibling || !prevSibling.classList.contains('section-spacer')) {
        return true;
      }
    }

    // Check for improperly formatted figure descriptions
    const paragraphs = container.querySelectorAll('p');
    for (const p of Array.from(paragraphs)) {
      const text = p.textContent || '';
      const figMatches = text.match(/FIG\.\s*\d+/g);
      if (figMatches && figMatches.length > 1) {
        // Multiple figures in one paragraph - needs normalization
        return true;
      }
    }

    return false;
  } catch (error) {
    logger.error('[needsNormalization] Error checking content', { error });
    return false;
  }
}

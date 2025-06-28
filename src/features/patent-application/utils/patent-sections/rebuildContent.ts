import { STANDARD_SECTION_ORDER } from './constants';
import { logger } from '@/lib/monitoring/logger';

/**
 * Rebuild complete patent content from individual sections
 * @param sections Object with section titles as keys and content as values
 * @returns Complete formatted patent text
 */
export const rebuildContent = (sections: { [key: string]: string }): string => {
  if (!sections || typeof sections !== 'object') {
    logger.error('Invalid sections passed to rebuildContent:', sections);
    return '';
  }

  // Debug all available sections
  // logger.log('[rebuildContent] Received sections object:', sections);
  logger.log('Available sections for rebuilding:', {
    sectionKeys: Object.keys(sections),
  });

  // Get the sections ordered according to the standard list
  const orderedSections = getOrderedSections(sections);

  // Debug the ordered sections
  logger.log('🔄 Ordered sections:', {
    titles: orderedSections.map(([title]) => title),
  });

  // Join sections with proper formatting (three newlines between sections)
  const content = orderedSections
    .map(([title, sectionContent]) => {
      logger.log(`📄 Adding section: ${title}`);
      // Special handling for Title - just show the content without a header
      if (title.toUpperCase() === 'TITLE') {
        return sectionContent || '';
      }
      // Format other sections with uppercase header followed by content
      return `${title.toUpperCase()}\n\n${sectionContent || ''}`;
    })
    .join('\n\n\n');

  // Log the reconstructed section count for debugging
  logger.log(
    `📃 Rebuilt content from sections. Section count: ${orderedSections.length}`
  );
  // Log the first 50 characters to check if title is present
  logger.log(
    `📃 First 50 chars of rebuilt content: ${content.substring(0, 50)}`
  );

  return content;
};

/**
 * Rebuild complete patent content from individual HTML sections for TiptapEditor
 * @param sections Object with section titles as keys and HTML content as values
 * @returns Complete formatted HTML patent content
 */
export const rebuildHtmlContent = (sections: {
  [key: string]: string;
}): string => {
  if (!sections || typeof sections !== 'object') {
    logger.error('Invalid sections passed to rebuildHtmlContent:', sections);
    return '';
  }

  logger.log('Available sections for HTML rebuilding:', {
    sectionKeys: Object.keys(sections),
  });

  // Get the sections ordered according to the standard list
  const orderedSections = getOrderedSections(sections);

  logger.log('🔄 Ordered HTML sections:', {
    titles: orderedSections.map(([title]) => title),
  });

  // Build HTML content with proper structure
  let htmlContent = '';

  orderedSections.forEach(([title, sectionContent], index) => {
    logger.log(`📄 Adding HTML section: ${title}`);

    // Clean the section content - remove any stray plain text headers
    let cleanContent = sectionContent || '';

    // Remove any plain text section headers that might be embedded in the content
    cleanContent = cleanContent.replace(
      new RegExp(`^${title.toUpperCase()}\\s*\n*`, 'i'),
      ''
    );

    // Special handling for Title - just the content with title styling
    if (title.toUpperCase() === 'TITLE') {
      // Title should be a main heading
      if (!cleanContent.includes('<')) {
        htmlContent += `<h1 class="patent-title">${cleanContent}</h1>`;
      } else {
        // ensure title uses h1 and correct class
        htmlContent += cleanContent
          .replace(/<h\d[^>]*>/i, '<h1 class="patent-title">')
          .replace(/<\/h\d>/i, '</h1>');
      }
      htmlContent += '<div class="section-spacer"></div>';
    } else {
      // Add spacing before section (except for first section)
      if (index > 0 || title.toUpperCase() !== 'TITLE') {
        htmlContent += '<div class="section-spacer"></div>';
      }

      // Check if content already starts with a header that matches the section name
      const headerRegex = new RegExp(
        `^<h2[^>]*>\\s*${title.toUpperCase()}\\s*</h2>`,
        'i'
      );
      const contentAlreadyHasHeader = headerRegex.test(cleanContent);

      // Log for debugging
      if (title.toUpperCase() === 'FIELD') {
        logger.log(`📄 FIELD section debug:`, {
          contentAlreadyHasHeader,
          firstChars: cleanContent.substring(0, 100),
          matchedHeader: cleanContent.match(headerRegex)?.[0] || 'no match',
        });
      }

      // Only add section header if content doesn't already have it
      if (!contentAlreadyHasHeader) {
        htmlContent += `<h2 class="section-header">${title.toUpperCase()}</h2>`;
      }

      // Add section content
      if (cleanContent) {
        if (contentAlreadyHasHeader) {
          // Content already has the header, just add it as-is
          htmlContent += cleanContent;
        } else if (!cleanContent.includes('<')) {
          // If content doesn't have HTML tags, split into paragraphs by blank lines
          const paragraphs = cleanContent.split(/\n{2,}/).map(p => p.trim());
          paragraphs.forEach((para, idx) => {
            if (para) {
              htmlContent += `<p>${para}</p>`;
            } else if (idx !== paragraphs.length - 1) {
              htmlContent += '<p>&nbsp;</p>'; // preserve blank line
            }
          });
        } else {
          // Already HTML without header, add as-is
          htmlContent += cleanContent;
        }
      }
    }
  });

  logger.log(
    `📃 Rebuilt HTML content from sections. Section count: ${orderedSections.length}`
  );
  logger.log(
    `📃 First 100 chars of rebuilt HTML: ${htmlContent.substring(0, 100)}`
  );

  return htmlContent;
};

/**
 * Get the sections in the standard order
 */
function getOrderedSections(sections: {
  [key: string]: string;
}): [string, string][] {
  const orderedSections: [string, string][] = [];

  // Create a normalized lookup map for the sections
  // This handles both case differences and underscore/space differences
  const normalizedSections: {
    [normalizedKey: string]: { originalKey: string; content: string };
  } = {};

  Object.entries(sections).forEach(([key, value]) => {
    // Normalize the key: lowercase and replace underscores with spaces
    let normalizedKey = key.toLowerCase().replace(/_/g, ' ');

    // Special cases for database format
    if (normalizedKey === 'claims set' || normalizedKey === 'claim set') {
      normalizedKey = 'claims';
    }
    
    // Handle "brief description" which might not have "of the drawings"
    if (normalizedKey === 'brief description') {
      normalizedKey = 'brief description of the drawings';
    }

    normalizedSections[normalizedKey] = { originalKey: key, content: value };
  });

  // Add standard sections in the correct order
  STANDARD_SECTION_ORDER.forEach(standardSection => {
    const normalizedStandard = standardSection.toLowerCase();

    if (normalizedSections[normalizedStandard]) {
      // Use the standard section name for consistent casing in the output
      orderedSections.push([
        standardSection,
        normalizedSections[normalizedStandard].content,
      ]);

      // Mark this section as processed
      delete normalizedSections[normalizedStandard];
    } else {
      logger.warn(
        `Section "${standardSection}" not found in provided sections. Looking for normalized: "${normalizedStandard}"`
      );
    }
  });

  // Add any remaining sections that weren't in the standard order to the end
  Object.entries(normalizedSections).forEach(
    ([normalizedKey, { originalKey, content }]) => {
      logger.warn(
        `Section "${originalKey}" (normalized: "${normalizedKey}") not in STANDARD_SECTION_ORDER, adding to end.`
      );
      orderedSections.push([originalKey, content]);
    }
  );

  return orderedSections;
}

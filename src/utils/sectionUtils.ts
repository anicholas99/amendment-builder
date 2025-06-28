/**
 * Checks if a section has data
 * @param section The section to check
 * @returns boolean indicating if the section has data
 */
export const hasSectionData = (section: unknown): boolean => {
  if (!section) return false;
  if (Array.isArray(section)) return section.length > 0;
  if (typeof section === 'object' && section !== null)
    return Object.keys(section).length > 0;
  return !!section;
};

/**
 * Ensures section content is always returned as a string
 * @param content The section content which could be a string, object, or undefined
 * @returns A properly formatted string representation of the content
 */
export const safeSectionContent = (content: unknown): string => {
  if (!content) return '';

  if (typeof content === 'string') return content;

  if (typeof content === 'object' && content !== null) {
    const obj = content as Record<string, unknown>;
    // Handle claims-like objects (numbered entries)
    if (Object.keys(obj).every(key => !isNaN(Number(key)))) {
      return Object.entries(obj)
        .map(([number, text]) => `${number}. ${text}`)
        .join('\n\n');
    }

    // Generic object conversion
    return JSON.stringify(content, null, 2);
  }

  // Convert any other type to string
  return String(content);
};

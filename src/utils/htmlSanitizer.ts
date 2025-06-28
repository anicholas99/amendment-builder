import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Used when we need to render HTML content safely (e.g., with innerHTML)
 * @param html HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHTML(html: string): string {
  if (!html) return '';

  // Only run DOMPurify on client-side
  if (typeof window === 'undefined') {
    // Server-side: strip all HTML tags
    return html.replace(/<[^>]*>/g, '');
  }

  // Client-side: use DOMPurify with safe defaults
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'div', 'span'],
    ALLOWED_ATTR: [],
  });
}

/**
 * Extracts text content from HTML string safely
 * @param html HTML string to extract text from
 * @returns Plain text content
 */
export function extractTextFromHTML(html: string): string {
  if (!html) return '';

  if (typeof window === 'undefined') {
    // Server-side: basic HTML stripping
    return html.replace(/<[^>]*>/g, '');
  }

  // Client-side: use DOMParser for safe text extraction
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

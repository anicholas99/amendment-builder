import { logger } from '@/utils/clientLogger';

/**
 * Helper to detect if content has fundamentally changed
 * Compares section structure rather than exact content
 */
export function isDifferentContent(oldContent: string, newContent: string): boolean {
  // Extract section headers from both contents
  const extractSectionHeaders = (html: string): string[] => {
    const headers: string[] = [];
    const headerRegex = /<h[1-3][^>]*>([^<]+)<\/h[1-3]>/gi;
    let match;
    while ((match = headerRegex.exec(html)) !== null) {
      headers.push(match[1].trim().toUpperCase());
    }
    return headers;
  };

  const oldHeaders = extractSectionHeaders(oldContent);
  const newHeaders = extractSectionHeaders(newContent);

  // Different number of sections is a fundamental change
  if (oldHeaders.length !== newHeaders.length) {
    return true;
  }

  // Different section names/order is a fundamental change
  return !oldHeaders.every((header, index) => header === newHeaders[index]);
}

/**
 * Generate session storage key for project
 */
export function getSessionStorageKey(projectId: string): string {
  return `patent-draft-${projectId}`;
}

/**
 * Generate reset project key for session storage
 */
export function getResetProjectKey(projectId: string): string {
  return `patent-reset-${projectId}`;
}

/**
 * Attempt to recover content from session storage
 */
export function recoverFromSessionStorage(
  projectId: string
): { content: string; recovered: boolean } {
  if (typeof window === 'undefined' || !projectId) {
    return { content: '', recovered: false };
  }

  try {
    const sessionStorageKey = getSessionStorageKey(projectId);
    const recovered = sessionStorage.getItem(sessionStorageKey);
    
    if (recovered) {
      const parsed = JSON.parse(recovered);
      // Only use if less than 24 hours old
      if (parsed.timestamp > Date.now() - 24 * 60 * 60 * 1000) {
        logger.info(
          '[PatentAutosave] Recovered draft from session storage',
          {
            projectId,
            contentLength: parsed.content.length,
            age: Date.now() - parsed.timestamp,
          }
        );
        return { content: parsed.content, recovered: true };
      }
    }
  } catch (error) {
    logger.error('[PatentAutosave] Error recovering from session storage', {
      error,
    });
  }

  return { content: '', recovered: false };
}

/**
 * Save content to session storage for crash recovery
 */
export function saveToSessionStorage(
  projectId: string,
  content: string
): boolean {
  if (typeof window === 'undefined' || !projectId || !content) {
    return false;
  }

  try {
    const sessionStorageKey = getSessionStorageKey(projectId);
    sessionStorage.setItem(
      sessionStorageKey,
      JSON.stringify({
        content,
        timestamp: Date.now(),
        projectId,
      })
    );
    return true;
  } catch (error) {
    logger.warn('[PatentAutosave] Failed to save to session storage', {
      error,
    });
    return false;
  }
}

/**
 * Clear session storage for project
 */
export function clearSessionStorage(projectId: string): void {
  if (typeof window === 'undefined' || !projectId) {
    return;
  }

  try {
    const sessionStorageKey = getSessionStorageKey(projectId);
    sessionStorage.removeItem(sessionStorageKey);
  } catch (error) {
    // Ignore errors during cleanup
  }
}

/**
 * Check if project was reset
 */
export function isResetProject(projectId: string): boolean {
  if (typeof window === 'undefined' || !projectId) {
    return false;
  }

  return sessionStorage.getItem(getResetProjectKey(projectId)) === 'true';
}

/**
 * Clear reset project flag
 */
export function clearResetProject(projectId: string): void {
  if (typeof window === 'undefined' || !projectId) {
    return;
  }

  try {
    sessionStorage.removeItem(getResetProjectKey(projectId));
  } catch (error) {
    // Ignore errors during cleanup
  }
} 
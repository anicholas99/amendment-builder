/**
 * Utilities for safe object property access
 */

/**
 * Safely get a nested property value from an object
 * @param obj - The object to access
 * @param path - Dot-separated path to the property (e.g., 'user.profile.name')
 * @param defaultValue - Default value if property doesn't exist
 * @returns The property value or default
 */
export function getNestedProperty<T = unknown>(
  obj: unknown,
  path: string,
  defaultValue?: T
): T | undefined {
  if (!obj || typeof obj !== 'object') {
    return defaultValue;
  }

  const keys = path.split('.');
  let current: Record<string, unknown> = obj as Record<string, unknown>;

  for (const key of keys) {
    if (current === null || current === undefined || !(key in current)) {
      return defaultValue;
    }
    current = current[key] as Record<string, unknown>;
  }

  return current as T;
}

/**
 * Type-safe tenant ID resolver for citation-related objects
 */
export function resolveTenantIdFromCitation(obj: unknown): string | null {
  // Try multiple paths in order of preference
  const paths = [
    'searchHistory.project.tenantId',
    'project.tenantId',
    'tenantId',
  ];

  for (const path of paths) {
    const tenantId = getNestedProperty<string>(obj, path);
    if (tenantId) {
      return tenantId;
    }
  }

  return null;
}

/**
 * Check if a nested property exists
 */
export function hasNestedProperty(obj: unknown, path: string): boolean {
  return getNestedProperty(obj, path) !== undefined;
}

/**
 * Set a nested property value safely
 */
export function setNestedProperty(
  obj: unknown,
  path: string,
  value: unknown
): boolean {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  // Convert bracket notation to dot notation: items[0].name -> items.0.name
  const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');

  const keys = normalizedPath.split('.');
  const lastKey = keys.pop();

  if (!lastKey) {
    return false;
  }

  let current = obj as Record<string, unknown>;

  for (const key of keys) {
    // Check if key is a number (array index)
    const isArrayIndex = /^\d+$/.test(key);

    if (isArrayIndex) {
      const index = parseInt(key, 10);
      if (!Array.isArray(current)) {
        return false;
      }
      if (!current[index] || typeof current[index] !== 'object') {
        current[index] = {};
      }
      current = current[index] as Record<string, unknown>;
    } else {
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }
  }

  // Handle the last key
  const isLastKeyArrayIndex = /^\d+$/.test(lastKey);
  if (isLastKeyArrayIndex && Array.isArray(current)) {
    current[parseInt(lastKey, 10)] = value;
  } else {
    current[lastKey] = value;
  }

  return true;
}

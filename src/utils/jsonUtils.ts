/**
 * Safe JSON parsing utilities with error handling and validation
 */
import { z } from 'zod';
import { logger } from '@/utils/clientLogger';

/**
 * Clean markdown code block formatting from JSON strings
 * @param content - Content that might be wrapped in markdown code blocks
 * @returns Clean JSON string
 */
export function cleanMarkdownJson(content: string): string {
  let cleaned = content.trim();

  // Remove ```json or ``` prefix
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }

  // Remove ``` suffix
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }

  return cleaned.trim();
}

/**
 * Safely parse JSON with error handling
 * @param json - JSON string to parse
 * @param fallback - Optional fallback value if parsing fails
 * @returns Parsed value or fallback
 */
export function safeJsonParse<T = any>(
  json: string | null | undefined,
  fallback?: T
): T | undefined {
  if (json === null || json === undefined || json === '') {
    return fallback;
  }

  try {
    // Clean markdown formatting if present
    const cleanJson = cleanMarkdownJson(json);
    return JSON.parse(cleanJson);
  } catch (error) {
    // Only log warnings for strings that look like they should be JSON
    // Skip logging for simple strings like "Paragraph 13" that are clearly not JSON
    const trimmed = json.trim();
    const looksLikeJson =
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      trimmed.includes('"') ||
      trimmed.includes(':');

    if (looksLikeJson) {
      logger.warn('Failed to parse JSON', {
        error: error instanceof Error ? error.message : 'Unknown error',
        jsonSnippet: json.substring(0, 100),
      });
    }

    return fallback;
  }
}

/**
 * Parse JSON with Zod schema validation
 * @param json - JSON string to parse
 * @param schema - Zod schema for validation
 * @returns Parsed and validated data or null
 */
export function parseJsonWithSchema<T>(
  json: string,
  schema: z.ZodSchema<T>
): T | null {
  try {
    const cleanJson = cleanMarkdownJson(json);
    const parsed = JSON.parse(cleanJson);
    return schema.parse(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('JSON validation failed', {
        errors: error.errors,
        jsonSnippet: json.substring(0, 100),
      });
    } else if (error instanceof SyntaxError) {
      logger.error('Invalid JSON syntax', {
        error: error.message,
        jsonSnippet: json.substring(0, 100),
      });
    } else {
      logger.error('Unexpected error parsing JSON', { error });
    }
    return null;
  }
}

/**
 * Try to parse JSON, return original string if parsing fails
 * Useful for fields that might be JSON or plain text
 */
export function tryParseJson<T = unknown>(value: string): T | string {
  try {
    const cleanJson = cleanMarkdownJson(value);
    return JSON.parse(cleanJson);
  } catch {
    return value;
  }
}

/**
 * Safely stringify JSON with error handling
 */
export function safeJsonStringify(
  value: unknown,
  space?: string | number
): string | null {
  if (value === undefined) {
    return null;
  }

  try {
    return JSON.stringify(value, null, space);
  } catch (error) {
    logger.error('Failed to stringify JSON', {
      error: error instanceof Error ? error.message : 'Unknown error',
      valueType: typeof value,
    });
    return null;
  }
}

/**
 * Parses a value that might be a JSON string or an already-parsed object.
 * This is useful when data may or may not have been pre-parsed.
 * @param input The value to parse (string, object, array, null, or undefined).
 * @param fallback An optional fallback value to return if parsing fails.
 * @returns The parsed object, the original object if not a string, or the fallback.
 */
export function flexibleJsonParse<T = any>(
  input: unknown,
  fallback?: T
): T | undefined {
  if (input === null || input === undefined) {
    return fallback;
  }
  if (typeof input === 'string') {
    return safeJsonParse(input, fallback);
  }
  // If it's not a string, assume it's already a valid JSON-like object.
  return input as T;
}

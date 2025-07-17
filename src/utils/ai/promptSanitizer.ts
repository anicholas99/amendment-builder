/**
 * AI Prompt Sanitization
 *
 * Prevents prompt injection attacks by removing common injection patterns.
 * Follows OWASP guidelines for AI security.
 */

import { logger } from '@/server/logger';

/**
 * Common prompt injection patterns to block
 */
const INJECTION_PATTERNS = [
  // Direct instruction overrides
  /\bignore\s+(all\s+)?previous\s+(instructions?|commands?)\b/gi,
  /\bforget\s+(everything|all|previous)\b/gi,
  /\breset\s+(instructions?|system|prompt)\b/gi,

  // Role manipulation attempts
  /\b(you\s+are|act\s+as|pretend\s+to\s+be)\s+a?\s*(new|different)\b/gi,
  /\bsystem\s*:\s*/gi,
  /\bassistant\s*:\s*/gi,
  /\b(admin|root|sudo)\s+mode\b/gi,

  // Output manipulation
  /\bprint\s+(your\s+)?(instructions?|prompt|system)\b/gi,
  /\bshow\s+me\s+(your\s+)?(instructions?|source|code)\b/gi,
  /\breveal\s+(your\s+)?(instructions?|secrets?|prompt)\b/gi,
];

// Default prompt length limits for different contexts
const PROMPT_LIMITS = {
  DEFAULT: 50000, // Increased from 10k to 50k for patent applications
  CHAT: 25000, // Chat messages can be long but not as long as patents
  CLAIMS: 100000, // Claims can be very long
  INVENTION: 75000, // Invention descriptions are typically long
  PRIOR_ART: 150000, // Prior art analysis can include many references
  SHORT_FORM: 5000, // For titles, abstracts, etc.
} as const;

type PromptContext = keyof typeof PROMPT_LIMITS;

/**
 * Sanitize user prompt to prevent injection attacks
 *
 * @param prompt - Raw user input
 * @param context - Context for the prompt to determine appropriate length limit
 * @returns Sanitized prompt safe for AI processing
 */
export function sanitizePrompt(
  prompt: string,
  context: PromptContext = 'DEFAULT'
): string {
  if (!prompt || typeof prompt !== 'string') {
    return '';
  }

  let sanitized = prompt;

  // Remove injection patterns
  INJECTION_PATTERNS.forEach(pattern => {
    const matches = sanitized.match(pattern);
    if (matches) {
      logger.warn('Potential prompt injection detected', {
        pattern: pattern.source,
        matched: matches[0],
        context,
      });
    }
    sanitized = sanitized.replace(pattern, '');
  });

  // Remove excessive whitespace but preserve structure
  sanitized = sanitized
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    .trim();

  // Apply context-appropriate length limit
  const maxLength = PROMPT_LIMITS[context];
  if (sanitized.length > maxLength) {
    logger.warn('Prompt exceeded maximum length for context', {
      original: sanitized.length,
      truncated: maxLength,
      context,
      truncationPercentage:
        (((sanitized.length - maxLength) / sanitized.length) * 100).toFixed(1) +
        '%',
    });
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Validate AI response for potential security issues
 *
 * @param response - AI generated response
 * @returns true if response appears safe, false if suspicious
 */
export function validateAIResponse(response: string): boolean {
  if (!response || typeof response !== 'string') {
    return true; // Empty response is safe
  }

  const suspiciousPatterns = [
    // Attempts to reveal system prompts
    /my\s+(instructions?|system\s+prompt|programming)\s+(is|are|says?)/i,
    /i\s+was\s+(instructed|told|programmed)\s+to/i,

    // Jailbreak confirmations
    /jailbreak\s+(successful|complete|activated)/i,
    /restrictions?\s+(removed|disabled|bypassed)/i,

    // Code injection attempts
    /<script[\s>]/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick=, onload=, etc.
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(response)) {
      logger.warn('Suspicious AI response detected', {
        pattern: pattern.source,
        response: response.substring(0, 100) + '...',
      });
      return false;
    }
  }

  return true;
}

/**
 * Helper functions for specific patent use cases
 */
export const PatentPromptSanitizer = {
  /**
   * Sanitize invention disclosure text (typically long technical descriptions)
   */
  sanitizeInventionDisclosure: (prompt: string) =>
    sanitizePrompt(prompt, 'INVENTION'),

  /**
   * Sanitize claims text (can be very long with multiple claims)
   */
  sanitizeClaims: (prompt: string) => sanitizePrompt(prompt, 'CLAIMS'),

  /**
   * Sanitize prior art analysis prompts (often include multiple references)
   */
  sanitizePriorArtAnalysis: (prompt: string) =>
    sanitizePrompt(prompt, 'PRIOR_ART'),

  /**
   * Sanitize chat messages in patent context
   */
  sanitizeChat: (prompt: string) => sanitizePrompt(prompt, 'CHAT'),

  /**
   * Sanitize short form content like titles, abstracts
   */
  sanitizeShortForm: (prompt: string) => sanitizePrompt(prompt, 'SHORT_FORM'),
};

/**
 * Extract safe content from user input for specific fields
 * Used for patent-specific inputs that need extra validation
 */
export function sanitizePatentInput(
  input: string,
  fieldType: 'title' | 'abstract' | 'claims'
): string {
  let sanitized: string;

  switch (fieldType) {
    case 'title':
      // Titles should be single line, no special characters
      sanitized = PatentPromptSanitizer.sanitizeShortForm(input)
        .replace(/[^\w\s\-.,]/g, '')
        .replace(/\s+/g, ' ')
        .substring(0, 200);
      break;

    case 'abstract':
      // Abstracts can be multi-line but no code/scripts
      sanitized = PatentPromptSanitizer.sanitizeShortForm(input)
        .replace(/<[^>]*>/g, '') // Remove HTML
        .substring(0, 2000);
      break;

    case 'claims':
      // Claims need numbered format preservation and can be very long
      sanitized = PatentPromptSanitizer.sanitizeClaims(input).replace(
        /<[^>]*>/g,
        ''
      ); // Remove HTML but keep full length for claims
      break;

    default:
      sanitized = sanitizePrompt(input, 'DEFAULT');
      break;
  }

  return sanitized;
}

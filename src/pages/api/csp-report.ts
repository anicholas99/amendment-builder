import type { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/server/logger';
import { SecurePresets } from '@/server/api/securePresets';

// Simple in-memory throttle for development
const throttleMap = new Map<string, number>();
const THROTTLE_DURATION = 60000; // 1 minute

/**
 * Content Security Policy (CSP) violation report endpoint
 * Browsers will POST CSP violation reports to this endpoint
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // Only accept POST requests (CSP reports are always POST)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log the CSP violation report
    const report = req.body;

    // Extract the most important information
    const violation = report['csp-report'] || report;

    // In development, throttle similar violations to prevent log spam
    if (process.env.NODE_ENV === 'development') {
      const throttleKey = `${violation['violated-directive']}-${violation['blocked-uri']}`;
      const lastLogged = throttleMap.get(throttleKey);
      const now = Date.now();

      if (lastLogged && now - lastLogged < THROTTLE_DURATION) {
        // Skip logging this violation
        res.status(204).end();
        return;
      }

      // Update throttle map
      throttleMap.set(throttleKey, now);

      // Clean up old entries periodically
      if (throttleMap.size > 100) {
        for (const [key, time] of throttleMap.entries()) {
          if (now - time > THROTTLE_DURATION) {
            throttleMap.delete(key);
          }
        }
      }
    }

    // Only log in production or for non-throttled violations
    if (
      process.env.NODE_ENV === 'production' ||
      !throttleMap.has(
        `${violation['violated-directive']}-${violation['blocked-uri']}`
      )
    ) {
      logger.warn('CSP Violation Report', {
        documentUri: violation['document-uri'],
        violatedDirective: violation['violated-directive'],
        effectiveDirective: violation['effective-directive'],
        originalPolicy: violation['original-policy'],
        blockedUri: violation['blocked-uri'],
        lineNumber: violation['line-number'],
        columnNumber: violation['column-number'],
        sourceFile: violation['source-file'],
        statusCode: violation['status-code'],
        referrer: violation['referrer'],
      });
    }

    // Return 204 No Content (standard for report endpoints)
    res.status(204).end();
  } catch (error) {
    logger.error('Error processing CSP report', {
      error,
      headers: req.headers,
    });

    // Still return success to prevent browser from retrying
    res.status(204).end();
  }
}

// SECURITY: This is a public endpoint for receiving CSP violation reports
// It needs to be public so browsers can send reports
export default SecurePresets.public(handler);

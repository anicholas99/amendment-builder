import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/lib/monitoring/logger';

/**
 * CSP Violation Report endpoint
 * Receives reports when CSP blocks resources
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const report = req.body;

    // Log CSP violations for monitoring
    logger.warn('CSP Violation Report', {
      documentUri: report['csp-report']?.['document-uri'],
      violatedDirective: report['csp-report']?.['violated-directive'],
      effectiveDirective: report['csp-report']?.['effective-directive'],
      blockedUri: report['csp-report']?.['blocked-uri'],
      lineNumber: report['csp-report']?.['line-number'],
      columnNumber: report['csp-report']?.['column-number'],
      sourceFile: report['csp-report']?.['source-file'],
      sample: report['csp-report']?.['script-sample'],
      referrer: report['csp-report']?.referrer,
    });

    // In production, you might want to:
    // - Send to monitoring service (Sentry, DataDog, etc.)
    // - Store in database for analysis
    // - Alert on high violation rates

    res.status(204).end();
  } catch (error) {
    logger.error('Failed to process CSP report', { error });
    res.status(500).json({ error: 'Failed to process report' });
  }
}

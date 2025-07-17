import { NextApiRequest, NextApiResponse } from 'next';
import { logBusinessEvent } from '@/server/monitoring/enhanced-logger';
import { createAuditLog } from '@/server/monitoring/audit-logger';
import { AuthenticatedRequest } from '@/types/middleware';

/**
 * Map of URL patterns to business event names
 */
const EVENT_MAP: Record<string, string> = {
  // Projects
  'POST:/api/projects': 'project.create',
  'PUT:/api/projects': 'project.update',
  'DELETE:/api/projects': 'project.delete',
  'GET:/api/projects': 'project.read',

  // Claims
  'POST:/api/claims': 'claim.create',
  'PUT:/api/claims': 'claim.update',
  'POST:/api/parse-claim': 'claim.parse',
  'POST:/api/claim-refinement': 'claim.refine',

  // Patent Application
  'POST:/api/generate-patent': 'patent.generate',
  'PUT:/api/patent-sections': 'patent.update',

  // Search & Prior Art
  'POST:/api/search': 'search.execute',
  'POST:/api/prior-art': 'prior_art.save',
  'DELETE:/api/prior-art': 'prior_art.delete',

  // Citations
  'POST:/api/citation-extraction': 'citation.extract',
  'PUT:/api/citation-matches': 'citation.update',

  // Files & Uploads
  'POST:/api/upload-invention': 'invention.upload',

  // Chat & AI
  'POST:/api/chat': 'chat.message',
  'POST:/api/ai': 'ai.request',

  // User Actions
  'POST:/api/auth/switch-tenant': 'auth.tenant_switch',
  'PUT:/api/tenants/active': 'tenant.change',
  'PUT:/api/users/preferences': 'user.preferences_update',
};

/**
 * Extract event name from request method and path
 */
function getEventName(method: string, path: string): string {
  // Try exact match first
  const key = `${method}:${path}`;
  if (EVENT_MAP[key]) {
    return EVENT_MAP[key];
  }

  // Try pattern matching for dynamic routes
  for (const [pattern, eventName] of Object.entries(EVENT_MAP)) {
    const [patternMethod, patternPath] = pattern.split(':');
    if (method === patternMethod) {
      // Convert pattern to regex (e.g., /api/projects/[id] -> /api/projects/.+)
      const regex = new RegExp(
        '^' + patternPath.replace(/\[.*?\]/g, '[^/]+') + '$'
      );
      if (regex.test(path)) {
        return eventName;
      }
    }
  }

  // Fallback to generic event name
  return `api.${method.toLowerCase()}_${path.replace(/[^a-zA-Z0-9]/g, '_')}`;
}

/**
 * Extract resource info from request
 */
function extractResourceInfo(req: AuthenticatedRequest): {
  resourceType?: string;
  resourceId?: string;
} {
  const url = req.url || '';

  // Extract resource type and ID from common patterns
  if (url.includes('/projects/')) {
    const match = url.match(/\/projects\/([^\/]+)/);
    return { resourceType: 'project', resourceId: match?.[1] };
  }
  if (url.includes('/claims/')) {
    const match = url.match(/\/claims\/([^\/]+)/);
    return { resourceType: 'claim', resourceId: match?.[1] };
  }
  if (url.includes('/search-history/')) {
    const match = url.match(/\/search-history\/([^\/]+)/);
    return { resourceType: 'search_history', resourceId: match?.[1] };
  }

  // Extract from query params
  if (req.query.id) {
    return { resourceId: String(req.query.id) };
  }
  if (req.query.projectId) {
    return { resourceType: 'project', resourceId: String(req.query.projectId) };
  }

  return {};
}

/**
 * Extract relevant metadata from request
 */
function extractMetadata(req: AuthenticatedRequest): Record<string, unknown> {
  const metadata: Record<string, unknown> = {};

  // Extract IDs from URL
  if (req.query.id) metadata.entityId = req.query.id;
  if (req.query.projectId) metadata.projectId = req.query.projectId;
  if (req.query.claimId) metadata.claimId = req.query.claimId;

  // Extract key data from body (be selective to avoid logging sensitive data)
  if (req.body) {
    if (req.body.name) metadata.entityName = req.body.name;
    if (req.body.title) metadata.entityTitle = req.body.title;
    if (req.body.action) metadata.action = req.body.action;
    if (req.body.status) metadata.status = req.body.status;
  }

  return metadata;
}

/**
 * Activity logging middleware for tracking user actions
 *
 * This middleware should be applied AFTER authentication middleware
 * so that req.user is available
 */
export function withActivityLogging<
  T extends AuthenticatedRequest = AuthenticatedRequest,
>(handler: (req: T, res: NextApiResponse) => Promise<void> | void) {
  return async (req: T, res: NextApiResponse) => {
    const startTime = Date.now();
    const { url, method } = req;
    const userId = req.user?.id;
    const tenantId = req.headers['x-tenant-slug'] as string;
    const ipAddress = (req.headers['x-forwarded-for'] ||
      req.socket?.remoteAddress) as string;
    const userAgent = req.headers['user-agent'];
    const eventName = getEventName(method || 'GET', url || '');
    const { resourceType, resourceId } = extractResourceInfo(req);
    const metadata = extractMetadata(req);

    // Log the incoming request (to console for immediate visibility)
    logBusinessEvent(
      eventName,
      {
        stage: 'request',
        method,
        url,
        ...metadata,
      },
      userId,
      tenantId
    );

    // Capture the original json method to log responses
    const originalJson = res.json;
    res.json = function (data: unknown) {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode || 200;
      const success = statusCode < 400;

      // Persist to audit log for SOC 2 compliance
      createAuditLog({
        userId,
        tenantId,
        action: eventName,
        resourceType,
        resourceId,
        method,
        path: url,
        statusCode,
        duration,
        ipAddress,
        userAgent,
        metadata,
        success,
        errorMessage:
          !success && (data as { error?: unknown })?.error
            ? String((data as { error: unknown }).error)
            : undefined,
      });

      // Log the response (to console)
      logBusinessEvent(
        eventName,
        {
          stage: 'response',
          method,
          url,
          statusCode,
          duration,
          success,
          ...metadata,
        },
        userId,
        tenantId
      );

      return originalJson.call(this, data);
    };

    try {
      await handler(req, res);
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // Persist error to audit log
      await createAuditLog({
        userId,
        tenantId,
        action: eventName,
        resourceType,
        resourceId,
        method,
        path: url,
        duration,
        ipAddress,
        userAgent,
        metadata,
        success: false,
        errorMessage,
      });

      // Log unhandled errors (to console)
      logBusinessEvent(
        `${eventName}_error`,
        {
          stage: 'unhandled_error',
          method,
          url,
          duration,
          error: errorMessage,
          errorType: error instanceof Error ? error.name : 'UnknownError',
          ...metadata,
        },
        userId,
        tenantId
      );

      throw error; // Re-throw to let error handlers deal with it
    }
  };
}

/**
 * Express-style middleware for activity logging
 * Can be used with custom Next.js server if needed
 */
export function activityLogger(
  req: AuthenticatedRequest & { url?: string },
  res: NextApiResponse,
  next: () => void
) {
  const { url, method } = req;
  const userId = req.user?.id;
  const tenantId = req.headers['x-tenant-slug'] as string;

  logBusinessEvent(
    'api_request',
    {
      method,
      url,
      userId,
      tenantId,
      timestamp: new Date().toISOString(),
    },
    userId,
    tenantId
  );

  next();
}

/**
 * Log specific high-value business events
 */
export function logImportantAction(
  action: string,
  details: Record<string, unknown>,
  req: AuthenticatedRequest
) {
  const userId = req.user?.id;
  const tenantId = req.headers['x-tenant-slug'] as string;

  logBusinessEvent(
    action,
    {
      ...details,
      ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString(),
    },
    userId,
    tenantId
  );
}

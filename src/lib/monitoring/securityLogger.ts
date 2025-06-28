import { logger } from './logger';
import { parseAuth0UserId } from '@/lib/validation/schemas/auth';
import { env } from '@/config/env';

interface SecurityEvent extends Record<string, unknown> {
  event:
    | 'INVALID_USER_ID'
    | 'AUTH_VALIDATION_FAILED'
    | 'TENANT_MISMATCH'
    | 'UNAUTHORIZED_ACCESS';
  userId?: string;
  userIdFormat?: 'auth0' | 'uuid' | 'invalid';
  provider?: string;
  path?: string;
  method?: string;
  error?: string;
  tenantId?: string;
  requestedResource?: string;
}

/**
 * Security-focused logger for authentication and authorization events
 * Helps with monitoring and detecting potential security issues
 */
export class SecurityLogger {
  /**
   * Log invalid user ID attempts
   * This helps detect if someone is trying to bypass client validation
   */
  static logInvalidUserId(
    userId: string,
    context: { path?: string; method?: string }
  ) {
    const parsedId = parseAuth0UserId(userId);
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    let format: SecurityEvent['userIdFormat'] = 'invalid';
    if (parsedId) {
      format = 'auth0';
    } else if (uuidRegex.test(userId)) {
      format = 'uuid';
    }

    const event: SecurityEvent = {
      event: 'INVALID_USER_ID',
      userId,
      userIdFormat: format,
      provider: parsedId?.provider,
      path: context.path,
      method: context.method,
    };

    // Log as warning for monitoring
    logger.warn('[SECURITY] Invalid user ID format detected', event);

    // In production, you might want to send this to a security monitoring service
    if (env.NODE_ENV === 'production') {
      // TODO: Send to security monitoring service
      // e.g., Sentry, DataDog, or custom security event stream
    }
  }

  /**
   * Log general auth validation failures
   */
  static logAuthValidationFailure(
    error: string,
    context: {
      userId?: string;
      path?: string;
      method?: string;
    }
  ) {
    const event: SecurityEvent = {
      event: 'AUTH_VALIDATION_FAILED',
      error,
      ...context,
    };

    logger.error('[SECURITY] Authentication validation failed', event);
  }

  /**
   * Log tenant mismatch attempts
   */
  static logTenantMismatch(context: {
    userId: string;
    requestedTenantId: string;
    userTenantId: string;
    path?: string;
    method?: string;
  }) {
    const event: SecurityEvent = {
      event: 'TENANT_MISMATCH',
      userId: context.userId,
      tenantId: context.userTenantId,
      requestedResource: context.requestedTenantId,
      path: context.path,
      method: context.method,
    };

    logger.warn('[SECURITY] Tenant access mismatch detected', event);
  }

  /**
   * Log unauthorized access attempts
   */
  static logUnauthorizedAccess(context: {
    userId?: string;
    resource?: string;
    path?: string;
    method?: string;
    reason?: string;
  }) {
    const event: SecurityEvent = {
      event: 'UNAUTHORIZED_ACCESS',
      userId: context.userId,
      requestedResource: context.resource,
      error: context.reason,
      path: context.path,
      method: context.method,
    };

    logger.warn('[SECURITY] Unauthorized access attempt', event);
  }
}

export const securityLogger = SecurityLogger;

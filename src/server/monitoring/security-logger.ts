import { logger } from '@/server/logger';
import { environment } from '@/config/environment';

/**
 * Security event types for monitoring and alerting
 */
export enum SecurityEventType {
  // Authentication events
  AUTH_SUCCESS = 'AUTH_SUCCESS',
  AUTH_FAILURE = 'AUTH_FAILURE',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_INVALID_TOKEN = 'AUTH_INVALID_TOKEN',

  // Authorization events
  AUTHZ_DENIED = 'AUTHZ_DENIED',
  TENANT_ACCESS_DENIED = 'TENANT_ACCESS_DENIED',
  ROLE_ACCESS_DENIED = 'ROLE_ACCESS_DENIED',

  // Rate limiting events
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  RATE_LIMIT_WARNING = 'RATE_LIMIT_WARNING',

  // Input validation events
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  PATH_TRAVERSAL_ATTEMPT = 'PATH_TRAVERSAL_ATTEMPT',

  // File security events
  MALWARE_DETECTED = 'MALWARE_DETECTED',
  FILE_TYPE_VIOLATION = 'FILE_TYPE_VIOLATION',
  FILE_SIZE_VIOLATION = 'FILE_SIZE_VIOLATION',

  // CSRF events
  CSRF_TOKEN_MISSING = 'CSRF_TOKEN_MISSING',
  CSRF_TOKEN_INVALID = 'CSRF_TOKEN_INVALID',

  // API security events
  INVALID_API_KEY = 'INVALID_API_KEY',
  SUSPICIOUS_REQUEST = 'SUSPICIOUS_REQUEST',

  // Data access events
  UNAUTHORIZED_DATA_ACCESS = 'UNAUTHORIZED_DATA_ACCESS',
  BULK_DATA_EXPORT = 'BULK_DATA_EXPORT',
}

/**
 * Security event severity levels
 */
export enum SecuritySeverity {
  INFO = 'info',
  WARNING = 'warning',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Security event metadata
 */
export interface SecurityEventMetadata {
  userId?: string;
  tenantId?: string;
  ip?: string;
  userAgent?: string;
  requestId?: string;
  path?: string;
  method?: string;
  attemptedValue?: string;
  reason?: string;
  count?: number;
  threshold?: number;
  [key: string]: unknown;
}

/**
 * Log a security event with appropriate metadata
 */
export function logSecurityEvent(
  eventType: SecurityEventType,
  severity: SecuritySeverity,
  message: string,
  metadata: SecurityEventMetadata = {}
): void {
  const event = {
    type: 'SECURITY_EVENT',
    eventType,
    severity,
    message,
    timestamp: new Date().toISOString(),
    environment: environment.env,
    ...metadata,
  };

  // Log based on severity
  switch (severity) {
    case SecuritySeverity.CRITICAL:
      logger.error('🚨 CRITICAL SECURITY EVENT', event);
      // In production, trigger alerts
      if (environment.isProduction) {
        // TODO: Send to monitoring service (e.g., PagerDuty, Slack)
      }
      break;

    case SecuritySeverity.HIGH:
      logger.error('⚠️ HIGH SECURITY EVENT', event);
      break;

    case SecuritySeverity.WARNING:
      logger.warn('⚡ SECURITY WARNING', event);
      break;

    case SecuritySeverity.INFO:
      logger.info('🔒 Security Event', event);
      break;
  }
}

/**
 * Track authentication failures for potential brute force detection
 */
const authFailures = new Map<string, number>();

export function trackAuthFailure(identifier: string): number {
  const key = `auth_failure:${identifier}`;
  const failures = (authFailures.get(key) || 0) + 1;
  authFailures.set(key, failures);

  // Clear after 15 minutes
  setTimeout(() => authFailures.delete(key), 15 * 60 * 1000);

  // Log if threshold exceeded
  if (failures >= 5) {
    logSecurityEvent(
      SecurityEventType.AUTH_FAILURE,
      SecuritySeverity.WARNING,
      `Multiple authentication failures detected for ${identifier}`,
      { identifier, count: failures, threshold: 5 }
    );
  }

  return failures;
}

/**
 * Helper functions for common security events
 */
export const securityLogger = {
  authSuccess(userId: string, metadata: SecurityEventMetadata = {}) {
    logSecurityEvent(
      SecurityEventType.AUTH_SUCCESS,
      SecuritySeverity.INFO,
      `User authenticated successfully`,
      { userId, ...metadata }
    );
  },

  authFailure(
    attemptedIdentifier: string,
    reason: string,
    metadata: SecurityEventMetadata = {}
  ) {
    const failures = trackAuthFailure(attemptedIdentifier);
    logSecurityEvent(
      SecurityEventType.AUTH_FAILURE,
      failures >= 5 ? SecuritySeverity.HIGH : SecuritySeverity.WARNING,
      `Authentication failed: ${reason}`,
      { attemptedIdentifier, reason, failures, ...metadata }
    );
  },

  accessDenied(
    userId: string,
    resource: string,
    reason: string,
    metadata: SecurityEventMetadata = {}
  ) {
    logSecurityEvent(
      SecurityEventType.AUTHZ_DENIED,
      SecuritySeverity.WARNING,
      `Access denied to ${resource}: ${reason}`,
      { userId, resource, reason, ...metadata }
    );
  },

  rateLimitExceeded(
    identifier: string,
    endpoint: string,
    metadata: SecurityEventMetadata = {}
  ) {
    logSecurityEvent(
      SecurityEventType.RATE_LIMIT_EXCEEDED,
      SecuritySeverity.WARNING,
      `Rate limit exceeded for ${endpoint}`,
      { identifier, endpoint, ...metadata }
    );
  },

  validationFailed(
    field: string,
    attemptedValue: string,
    metadata: SecurityEventMetadata = {}
  ) {
    // Check for potential injection attempts
    const sqlPatterns =
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)|(-{2})|(')/i;
    const xssPatterns = /<[^>]*script|on\w+\s*=/i;
    const pathPatterns = /\.\.[\/\\]/;

    let eventType = SecurityEventType.VALIDATION_FAILED;
    let severity = SecuritySeverity.INFO;

    if (sqlPatterns.test(attemptedValue)) {
      eventType = SecurityEventType.SQL_INJECTION_ATTEMPT;
      severity = SecuritySeverity.HIGH;
    } else if (xssPatterns.test(attemptedValue)) {
      eventType = SecurityEventType.XSS_ATTEMPT;
      severity = SecuritySeverity.HIGH;
    } else if (pathPatterns.test(attemptedValue)) {
      eventType = SecurityEventType.PATH_TRAVERSAL_ATTEMPT;
      severity = SecuritySeverity.HIGH;
    }

    logSecurityEvent(
      eventType,
      severity,
      `Validation failed for field: ${field}`,
      { field, attemptedValue: attemptedValue.substring(0, 100), ...metadata }
    );
  },

  malwareDetected(
    filename: string,
    threat: string,
    metadata: SecurityEventMetadata = {}
  ) {
    logSecurityEvent(
      SecurityEventType.MALWARE_DETECTED,
      SecuritySeverity.CRITICAL,
      `Malware detected in uploaded file: ${filename}`,
      { filename, threat, ...metadata }
    );
  },

  csrfViolation(reason: string, metadata: SecurityEventMetadata = {}) {
    logSecurityEvent(
      SecurityEventType.CSRF_TOKEN_INVALID,
      SecuritySeverity.HIGH,
      `CSRF protection triggered: ${reason}`,
      { reason, ...metadata }
    );
  },

  suspiciousRequest(reason: string, metadata: SecurityEventMetadata = {}) {
    logSecurityEvent(
      SecurityEventType.SUSPICIOUS_REQUEST,
      SecuritySeverity.WARNING,
      `Suspicious request detected: ${reason}`,
      { reason, ...metadata }
    );
  },
};

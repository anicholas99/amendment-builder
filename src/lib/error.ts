/**
 * Custom Error Handling
 *
 * This file defines a standardized ApplicationError class and error codes
 * for consistent error handling across the backend.
 */

export enum ErrorCode {
  // General Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  VALIDATION_REQUIRED_FIELD = 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT = 'VALIDATION_INVALID_FORMAT',
  VALIDATION_OUT_OF_RANGE = 'VALIDATION_OUT_OF_RANGE',
  DEPRECATED_ENDPOINT = 'DEPRECATED_ENDPOINT',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',

  // Environment Errors
  ENV_VAR_MISSING = 'ENV_VAR_MISSING',
  ENV_VAR_INVALID = 'ENV_VAR_INVALID',
  CONFIG_MISSING = 'CONFIG_MISSING',

  // File Processing Errors
  FILE_PROCESSING_ERROR = 'FILE_PROCESSING_ERROR',

  // Storage Errors
  STORAGE_FILE_NOT_FOUND = 'STORAGE_FILE_NOT_FOUND',
  STORAGE_INVALID_FILE_TYPE = 'STORAGE_INVALID_FILE_TYPE',
  STORAGE_UPLOAD_FAILED = 'STORAGE_UPLOAD_FAILED',
  STORAGE_DOWNLOAD_FAILED = 'STORAGE_DOWNLOAD_FAILED',

  // Security Errors
  SECURITY_MALWARE_DETECTED = 'SECURITY_MALWARE_DETECTED',

  // AI Errors
  AI_INVALID_RESPONSE = 'AI_INVALID_RESPONSE',
  AI_GENERATION_FAILED = 'AI_GENERATION_FAILED',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  AI_MAX_ITERATIONS = 'AI_MAX_ITERATIONS',

  // Auth Errors
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',
  AUTH_FORBIDDEN = 'AUTH_FORBIDDEN',
  AUTH_INSUFFICIENT_PERMISSIONS = 'AUTH_INSUFFICIENT_PERMISSIONS',
  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',

  // Network & API Errors
  API_INVALID_RESPONSE = 'API_INVALID_RESPONSE',
  API_NETWORK_ERROR = 'API_NETWORK_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Citation & External API Errors
  CITATION_EXTERNAL_API_ERROR = 'CITATION_EXTERNAL_API_ERROR',
  CITATION_JOB_NOT_FOUND = 'CITATION_JOB_NOT_FOUND',

  // Cache Errors
  CACHE_INVALIDATION_ERROR = 'CACHE_INVALIDATION_ERROR',

  // Tenant Errors
  TENANT_NOT_FOUND = 'TENANT_NOT_FOUND',
  TENANT_ACCESS_DENIED = 'TENANT_ACCESS_DENIED',
  TENANT_RESOLUTION_FAILED = 'TENANT_RESOLUTION_FAILED',

  // Project Errors
  PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND',
  PROJECT_ACCESS_DENIED = 'PROJECT_ACCESS_DENIED',
  PROJECT_ID_REQUIRED = 'PROJECT_ID_REQUIRED',

  // Database Errors
  DB_QUERY_ERROR = 'DB_QUERY_ERROR',
  DB_CONNECTION_ERROR = 'DB_CONNECTION_ERROR',
  DB_TRANSACTION_FAILED = 'DB_TRANSACTION_FAILED',
  DB_CONSTRAINT_VIOLATION = 'DB_CONSTRAINT_VIOLATION',
  DB_DUPLICATE_ENTRY = 'DB_DUPLICATE_ENTRY',
  DB_RECORD_NOT_FOUND = 'DB_RECORD_NOT_FOUND',

  // API Service Errors
  API_TIMEOUT = 'API_TIMEOUT',
  API_SERVICE_UNAVAILABLE = 'API_SERVICE_UNAVAILABLE',
}

export class ApplicationError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;

  constructor(code: ErrorCode, message?: string, statusCode: number = 500) {
    super(message || code);
    this.code = code;
    this.statusCode = this.mapToStatusCode(code, statusCode);
    Object.setPrototypeOf(this, ApplicationError.prototype);
  }

  static fromUnknown(error: unknown, code?: ErrorCode): ApplicationError {
    if (error instanceof ApplicationError) {
      return error;
    }

    const message = error instanceof Error ? error.message : String(error);
    return new ApplicationError(code || ErrorCode.UNKNOWN_ERROR, message);
  }

  private mapToStatusCode(code: ErrorCode, defaultStatus: number): number {
    switch (code) {
      case ErrorCode.INVALID_INPUT:
        return 400;
      case ErrorCode.AUTH_UNAUTHORIZED:
        return 401;
      case ErrorCode.AUTH_FORBIDDEN:
      case ErrorCode.PROJECT_ACCESS_DENIED:
        return 403;
      case ErrorCode.TENANT_NOT_FOUND:
      case ErrorCode.PROJECT_NOT_FOUND:
        return 404;
      case ErrorCode.DB_DUPLICATE_ENTRY:
        return 409;
      default:
        return defaultStatus;
    }
  }
}

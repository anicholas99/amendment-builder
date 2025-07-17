# SOC 2 Security Controls Implementation

This document outlines the security controls implemented to support SOC 2 compliance.

## 1. Session Management

### Session Timeout Controls
- **Inactivity Timeout**: 30 minutes (configurable via `SESSION_TIMEOUT_MINUTES`)
- **Absolute Timeout**: 8 hours (configurable via `SESSION_ABSOLUTE_TIMEOUT_HOURS`)
- **Implementation**: `src/middleware/auth.ts`
- **Repository**: `src/repositories/sessionRepository.ts`

### Session Cleanup
- **Automated Cleanup**: Runs hourly to remove expired sessions
- **Manual Cleanup**: Admin endpoint at `POST /api/admin/session-cleanup`
- **Service**: `src/server/services/sessionCleanupService.ts`
- **Edge Runtime Compatible**: No process-level shutdown handlers to maintain compatibility

### Configuration
```env
SESSION_TIMEOUT_MINUTES=30
SESSION_ABSOLUTE_TIMEOUT_HOURS=8
```

## 2. Audit Logging

### Comprehensive Audit Trail
- **Service**: `src/services/api/auditService.ts`
- **Repository**: `src/repositories/auditLogRepository.ts`
- **Storage**: Database table `AuditLog`

### Tracked Events
- User login/logout
- Failed login attempts
- Project CRUD operations
- Claim modifications
- Data exports
- Data deletions
- Admin actions
- Security events

### Example Usage
```typescript
// Log project creation
await AuditService.logProjectAction(req, 'create', projectId, {
  projectName: project.name,
  status: project.status
});

// Log security event
await AuditService.logSecurityEvent(req, 'suspicious_activity', {
  reason: 'Multiple failed login attempts'
});
```

## 3. Request Tracking

### Request ID Correlation
- **Middleware**: `src/middleware/requestTracking.ts`
- **Features**:
  - Unique request ID generation
  - Request/response logging
  - Performance tracking
  - Error correlation

### Usage
```typescript
// In API routes, access the request logger
req.logger.info('Processing request', { data });
```

## 4. Multi-Tenant Security

### Tenant Isolation
- **Middleware**: `SecurePresets.tenantProtected()`
- **Validation**: Every API request validates tenant context
- **Data Access**: Repository pattern enforces tenant filtering

### Implementation
```typescript
// All tenant-scoped endpoints use this pattern
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler
);
```

## 5. Authentication & Authorization

### Auth0 Integration
- **Session Management**: Auth0 sessions with local tracking
- **Role-Based Access**: User, Admin, Global Admin roles
- **Service Accounts**: OAuth2 client credentials for internal services

### CSRF Protection
- **Token Validation**: Required for all mutation requests
- **Implementation**: Built into SecurePresets middleware

## 6. Security Configuration

### Environment Variables
```env
# Session Management
SESSION_TIMEOUT_MINUTES=30
SESSION_ABSOLUTE_TIMEOUT_HOURS=8

# Security
TRUSTED_PROXY_IPS=10.0.0.0/8,172.16.0.0/12
VIRUSTOTAL_API_KEY=your-api-key

# Rate Limiting
RATE_LIMIT_WINDOW=60000
MAX_REQUESTS_PER_WINDOW=100
```

### Structured Logging
- **Server Logger**: Winston-based with log levels
- **Client Logger**: Development-only console logging
- **No Direct Console Usage**: ESLint rule enforces structured logging

## 7. Data Protection

### Soft Deletes
- **Implementation**: Prisma middleware for soft deletes
- **Audit Trail**: Deletions are logged but data retained

### PII Protection
- **Log Sanitization**: Sensitive data removed from logs
- **Error Messages**: Generic messages to clients, detailed logs server-side

## 8. API Security

### Rate Limiting
- **Configuration**: Per-endpoint rate limits
- **Categories**: public, api, admin, critical-auth

### Input Validation
- **Zod Schemas**: All inputs validated before processing
- **File Upload**: Virus scanning for uploads

## 9. Monitoring & Alerting

### Health Checks
- **Endpoint**: `GET /api/health`
- **Database Connectivity**: Verified on each check
- **Memory Usage**: Monitored and reported

### Error Tracking
- **Structured Errors**: ApplicationError with error codes
- **Error Boundaries**: Graceful error handling
- **Audit Logging**: All errors logged with context

## 10. Best Practices

### Code Organization
- **Repository Pattern**: All DB access through repositories
- **Service Layer**: Business logic separated from API routes
- **Type Safety**: Full TypeScript coverage

### Security Headers
- **CSP**: Content Security Policy implemented
- **HSTS**: Strict Transport Security
- **Additional Headers**: Via Next.js security headers

## Testing Security Controls

### Manual Testing
1. **Session Timeout**: Wait 30 minutes, verify logout
2. **Audit Logs**: Check database for event records
3. **Request Tracking**: Verify X-Request-ID headers

### Automated Testing
```bash
# Run security tests
npm run test:security

# Check for vulnerabilities
npm audit

# Lint security rules
npm run lint
```

## Compliance Checklist

- [x] Session timeout implementation
- [x] Audit logging for all critical operations
- [x] Request tracking and correlation
- [x] Multi-tenant data isolation
- [x] Structured logging (no console.log)
- [x] Error handling and sanitization
- [x] Rate limiting
- [x] Input validation
- [x] Soft deletes for data retention
- [x] Admin controls for security operations

## Next Steps

1. **Implement automated security scanning** in CI/CD
2. **Add penetration testing** schedule
3. **Create incident response runbooks**
4. **Set up log aggregation** (e.g., Datadog, Splunk)
5. **Implement backup testing** procedures
6. **Add security training** documentation 
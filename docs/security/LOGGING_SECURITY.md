# Secure Logging Guidelines

## Overview

This document outlines secure logging practices for the Patent Drafter AI application to prevent information leakage and maintain consistent, secure logging across client and server environments.

## Key Principles

### 1. **Never Log Sensitive Data**
- No passwords, tokens, API keys, or secrets
- No user IDs, tenant IDs, or personal information  
- No database queries or internal implementation details
- No full URLs with query parameters or path parameters

### 2. **Use Appropriate Logger for Context**
- **Client-side**: Use `@/utils/clientLogger`
- **Server-side**: Use `@/server/logger`
- **Never use `console.log` directly** (enforced by ESLint)

### 3. **Sanitization is Automatic**
The client logger automatically:
- Filters sensitive patterns (passwords, tokens, IDs)
- Truncates long strings to prevent log flooding
- Removes internal implementation details
- Sanitizes object keys containing sensitive names

## Client-Side Logging

### Import the Logger
```typescript
import { logger } from '@/utils/clientLogger';
```

### Log Levels
- `logger.debug()` - Detailed debugging info (dev only)
- `logger.info()` - General information
- `logger.warn()` - Warning conditions
- `logger.error()` - Error conditions
- `logger.performance()` - Performance metrics

### Examples

```typescript
// ✅ GOOD: General information without sensitive data
logger.info('User action completed', { 
  action: 'save_draft',
  duration: '250ms' 
});

// ✅ GOOD: Performance tracking
logger.performance('API /api/projects', 1250);

// ❌ BAD: Exposing user IDs
logger.info('User logged in', { userId: 'auth0|12345' });

// ❌ BAD: Exposing internal details
logger.debug('Database query completed', { 
  query: 'SELECT * FROM users',
  time: '45ms' 
});
```

## Server-Side Logging

### Import the Logger
```typescript
import { logger } from '@/server/logger';
```

### Structured Logging
Always use structured logging with context objects:

```typescript
// ✅ GOOD: Structured with safe context
logger.info('API request completed', {
  routeName: 'projects',
  method: 'GET',
  statusCode: 200,
  duration: '125ms'
});

// ❌ BAD: Logging sensitive headers
logger.debug('Request received', {
  headers: req.headers, // May contain auth tokens!
  body: req.body       // May contain passwords!
});
```

## Performance Monitoring

Use the performance monitor for API tracking:

```typescript
import { trackApiPerformance } from '@/utils/performanceMonitor';

// Track API performance
const startTime = performance.now();
try {
  const response = await fetch('/api/projects');
  trackApiPerformance('/api/projects', 'GET', startTime);
} catch (error) {
  trackApiPerformance('/api/projects', 'GET', startTime);
}
```

Endpoints are automatically sanitized:
- UUIDs → `[ID]`
- Numbers → `[NUM]`
- Query params → removed
- User IDs → `[USER]`

## Security Patterns

### 1. **Sanitize User Input**
```typescript
// Always sanitize before logging
const sanitizedInput = input.substring(0, 100);
logger.info('Search performed', { query: sanitizedInput });
```

### 2. **Use Generic Messages**
```typescript
// ✅ GOOD: Generic error without details
logger.error('Authentication failed', { 
  reason: 'invalid_credentials' 
});

// ❌ BAD: Exposing system details
logger.error('Login failed', { 
  error: 'User not found in tenant_users table' 
});
```

### 3. **Aggregate Metrics**
```typescript
// ✅ GOOD: Aggregated stats
logger.info('Daily stats', { 
  totalRequests: 1523,
  avgResponseTime: '245ms' 
});

// ❌ BAD: Individual user actions
logger.info('User actions', { 
  userId: 'abc123',
  actions: ['edit', 'save', 'delete'] 
});
```

## Common Mistakes to Avoid

### 1. **Logging Full Objects**
```typescript
// ❌ BAD: May contain sensitive nested data
logger.info('Project data', project);

// ✅ GOOD: Log only what's needed
logger.info('Project updated', { 
  projectId: '[FILTERED]',
  fieldsUpdated: ['title', 'description'] 
});
```

### 2. **Logging in Production**
```typescript
// ❌ BAD: Debug logs in production
if (environment.isProduction) {
  logger.debug('Detailed state', state); // This won't log!
}

// ✅ GOOD: Only essential logs in production
if (!response.ok) {
  logger.error('API request failed', { 
    endpoint: sanitizeEndpoint(url),
    status: response.status 
  });
}
```

### 3. **Logging Errors with Stack Traces**
```typescript
// ❌ BAD: Full stack trace may reveal internals
logger.error('Error occurred', error);

// ✅ GOOD: Safe error logging
logger.error('Operation failed', {
  message: error.message,
  code: error.code || 'UNKNOWN'
});
```

## ESLint Enforcement

The `no-console-logs` rule prevents direct console usage:

```javascript
// This will trigger an ESLint error
console.log('Debug info'); // ❌ ESLint: Use logger instead

// Use this instead
logger.info('Debug info'); // ✅
```

## Testing

When writing tests, console usage is allowed:

```typescript
// In test files (*.test.ts, *.spec.ts)
console.log('Test output'); // ✅ Allowed in tests
```

## Performance Considerations

1. **Logging is disabled in production** for client-side code
2. **Sanitization has minimal overhead** (~1-2ms per log)
3. **Performance tracking is async** and won't block operations
4. **Log aggregation** reduces volume in development

## Troubleshooting

### Issue: Logs not appearing
- Check if you're in production mode
- Verify correct logger import
- Ensure log level is appropriate

### Issue: Sensitive data in logs
- Review sanitization patterns in `clientLogger.ts`
- Add new patterns for domain-specific data
- Use structured logging to control output

### Issue: Performance warnings
- Use `logger.performance()` for timing data
- Investigate slow endpoints (>3s is concerning)
- Consider implementing caching or optimization

## Quick Reference

```typescript
// Client-side
import { logger } from '@/utils/clientLogger';

// Server-side  
import { logger } from '@/server/logger';

// Log levels
logger.debug('Detailed info');        // Dev only
logger.info('General info');          // Standard logging
logger.warn('Warning condition');     // Potential issues
logger.error('Error occurred');       // Errors
logger.performance('Operation', ms);  // Performance data

// Never log
// - Passwords, tokens, keys
// - User/tenant IDs
// - Database queries
// - Full URLs with params
// - Internal implementation details
``` 
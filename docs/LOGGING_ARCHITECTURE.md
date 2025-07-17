# Logging Architecture

## Overview

The Patent Drafter application uses a simple, consistent logging strategy with clear separation between client and server environments.

## Logger Usage Guide

### 🎯 Quick Reference

| Environment | Import Statement | File Location |
|-------------|-----------------|---------------|
| **Client-side** (React components, hooks, client services) | `import { logger } from '@/utils/clientLogger'` | `src/utils/clientLogger.ts` |
| **Server-side** (API routes, server services, repositories) | `import { logger } from '@/server/logger'` | `src/server/logger.ts` |
| **Shared library code** (runs in both environments) | `import { logger } from '@/lib/monitoring/logger'` | `src/lib/monitoring/logger.ts` |

### ✅ Correct Usage Examples

```typescript
// In a React component (src/features/*/components/*.tsx)
import { logger } from '@/utils/clientLogger';

export function MyComponent() {
  logger.info('Component rendered');
  // ...
}
```

```typescript
// In an API route (src/pages/api/*.ts)
import { logger } from '@/server/logger';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  logger.info('API request received', { method: req.method, path: req.url });
  // ...
}
```

```typescript
// In a repository (src/repositories/*.ts)
import { logger } from '@/server/logger';

export async function findProjectById(id: string) {
  logger.debug('Finding project', { projectId: id });
  // ...
}
```

### ❌ Common Mistakes to Avoid

1. **Don't use clientLogger in server code**
   ```typescript
   // ❌ WRONG - API route using client logger
   import { logger } from '@/utils/clientLogger';
   ```

2. **Don't use console.log directly**
   ```typescript
   // ❌ WRONG
   console.log('Debug info:', data);
   
   // ✅ CORRECT
   logger.debug('Debug info', { data });
   ```

3. **Don't import from deprecated locations**
   ```typescript
   // ❌ WRONG - These are deprecated
   import { logger } from '@/lib/monitoring/enhanced-logger';
   import { logger } from '@/server/monitoring/enhanced-logger';
   ```

## Logger Capabilities

Both client and server loggers provide the same simple API:

```typescript
logger.debug(message: string, context?: Record<string, unknown>)
logger.info(message: string, context?: Record<string, unknown>)
logger.warn(message: string, context?: Record<string, unknown>)
logger.error(message: string, errorOrContext?: unknown)
logger.log(message: string, context?: Record<string, unknown>) // Alias for info
```

### Client Logger Behavior
- Only logs in development environment
- Uses browser console methods
- All logs are disabled in production for security and performance

### Server Logger Behavior
- Uses Winston for structured logging
- Respects LOG_LEVEL environment variable
- Outputs JSON format in production
- Sanitizes sensitive data automatically
- Writes to console and log files based on configuration

## Log Levels

Configure server log levels via the `LOG_LEVEL` environment variable:

```bash
LOG_LEVEL=debug  # Show all logs
LOG_LEVEL=info   # Show info, warn, error (default)
LOG_LEVEL=warn   # Show warn and error only
LOG_LEVEL=error  # Show errors only
```

## Specialized Logging

For specialized logging needs (audit, security, performance), import from the server monitoring module:

```typescript
// Only available server-side
import { 
  logAuditEvent,
  logSecurityEvent,
  perfLogger 
} from '@/server/monitoring/enhanced-logger';

// Audit logging
logAuditEvent('UPDATE', 'project', projectId, userId, tenantId, changes);

// Performance tracking
perfLogger.start('database-query');
// ... perform operation ...
perfLogger.end('database-query');
```

## Migration Guide

If you're updating existing code:

1. **Replace `@/utils/clientLogger` imports in server code** with `@/server/logger`
2. **Replace `console.log` statements** with appropriate logger calls
3. **Update any imports from deprecated enhanced-logger paths**

## Best Practices

1. **Include structured context** instead of string concatenation:
   ```typescript
   // ❌ WRONG
   logger.info(`User ${userId} updated project ${projectId}`);
   
   // ✅ CORRECT
   logger.info('User updated project', { userId, projectId });
   ```

2. **Use appropriate log levels**:
   - `debug`: Detailed information for debugging
   - `info`: General informational messages
   - `warn`: Warning messages for potentially harmful situations
   - `error`: Error messages for actual errors

3. **Never log sensitive data** (passwords, API keys, tokens)
   - The server logger automatically sanitizes common sensitive fields

4. **Keep logs concise and actionable**
   - Good: `logger.error('Failed to save project', { projectId, error })`
   - Bad: `logger.error('Something went wrong')`

## File Structure

```
src/
├── utils/
│   └── clientLogger.ts          # Client-side logger
├── server/
│   ├── logger.ts               # Main server logger
│   └── monitoring/
│       ├── logger-config.ts    # Winston configuration
│       ├── enhanced-logger.ts  # Specialized logging functions
│       ├── audit-logger.ts     # Audit logging
│       └── security-logger.ts  # Security event logging
└── lib/
    └── monitoring/
        └── logger.ts           # Universal logger for shared code
```

## Environment Variables

Server logging configuration:

```bash
# Log level (debug, info, warn, error)
LOG_LEVEL=info

# Enable file logging (development only)
LOG_TO_FILE=false

# Enable verbose logging
ENABLE_LOGGING=true
``` 
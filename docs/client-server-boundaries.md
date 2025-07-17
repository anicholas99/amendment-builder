# Client-Server Module Boundaries

## Overview

This document defines the strict boundaries between client and server code to ensure Fast Refresh works properly and to maintain security by preventing server-only code from being included in client bundles.

## Key Principles

1. **React components and hooks must NEVER import server-only modules**
2. **Server code (API routes, repositories) should use server imports**
3. **Shared utilities must be client-safe or have separate implementations**

## Import Rules

### Environment Configuration

| Import | Use In | Purpose |
|--------|--------|---------|
| `@/config/environment.client` | React components, hooks, client services | Browser-safe configuration |
| `@/config/environment` | API routes, server services, repositories | Full environment with secrets |

```typescript
// ✅ CORRECT: In React components
import { isDevelopment, isProduction } from '@/config/environment.client';

// ❌ WRONG: In React components
import { environment } from '@/config/environment';
```

### Logger

| Import | Use In | Purpose |
|--------|--------|---------|
| `@/utils/clientLogger` | React components, hooks, client services | Console-based logger |
| `@/lib/monitoring/logger` | API routes, server services, repositories | Full logger with monitoring |

```typescript
// ✅ CORRECT: In React components
import { logger } from '@/utils/clientLogger';

// ❌ WRONG: In React components
import { logger } from '@/lib/monitoring/logger';
```

## Directory Guidelines

### Client-Only Directories
These directories should ONLY use client-safe imports:
- `src/components/`
- `src/hooks/`
- `src/features/`
- `src/contexts/`
- `src/client/`
- `src/services/api/` (service layer used by React)
- `src/pages/` (except `pages/api/`)

### Server-Only Directories
These directories can use server imports:
- `src/pages/api/`
- `src/repositories/`
- `src/middleware/`
- `src/server/`
- `src/lib/monitoring/`

### Mixed Directories
These require careful consideration:
- `src/utils/` - Most should be client-safe
- `src/lib/` - Split by subdirectory

## Common Anti-Patterns to Avoid

### ❌ Conditional Imports
```typescript
// WRONG: Still creates module dependency
const logger = isServer 
  ? require('@/lib/monitoring/logger')
  : require('@/utils/clientLogger');
```

### ❌ Re-exporting Server Modules
```typescript
// WRONG: utils/index.ts
export { logger } from '@/lib/monitoring/logger';
```

### ❌ Mixed Exports in Same File
```typescript
// WRONG: Mixing React and non-React exports
export const MyComponent = () => <div>Hello</div>;
export function serverOnlyFunction() { /* ... */ }
```

## ESLint Enforcement

The following ESLint rule enforces these boundaries:

```javascript
'no-restricted-imports': [
  'error',
  {
    paths: [
      {
        name: '@/config/environment',
        message: 'Use @/config/environment.client in React/client code',
      },
      {
        name: '@/lib/monitoring/logger',
        message: 'Use @/utils/clientLogger in React/client code',
      },
    ],
    patterns: [
      {
        group: ['**/server/**', '**/repositories/**'],
        message: 'Server code should not be imported in React components',
      },
    ],
  },
],
```

## Fast Refresh Troubleshooting

If Fast Refresh stops working (full page reloads on save):

1. **Check the browser console** for module boundary warnings
2. **Look for server imports** in your React component tree
3. **Verify all hooks and contexts** use client-safe imports
4. **Check shared utilities** aren't importing server modules

Common culprits:
- Service layer files importing server logger
- Utility functions importing environment
- React Context providers using server imports

## Migration Guide

When creating new files:

1. **Determine the file's context** (client or server)
2. **Import from the appropriate module**:
   - Client: `environment.client`, `clientLogger`
   - Server: `environment`, `monitoring/logger`
3. **Test Fast Refresh** after adding imports
4. **Run ESLint** to catch violations early

## Security Considerations

Following these boundaries also ensures:
- Server secrets never reach the client bundle
- Reduced client bundle size
- Clear separation of concerns
- Easier code review and auditing

Remember: When in doubt, prefer client-safe imports in shared code! 
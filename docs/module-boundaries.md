# Client vs Server Module Boundaries

This document defines the clear boundaries between client and server code to maintain Fast Refresh and prevent server-only code from leaking into client bundles.

## Quick Reference

### ✅ Client Code Should Use

- **Logger**: `@/utils/clientLogger`
- **Environment**: `@/config/environment.client` (for `isDevelopment`, `isProduction`)
- **API Calls**: Service layer via `@/services/api/*` or hooks in `@/hooks/api/*`

### ❌ Client Code Must Never Import

- **Server Logger**: `@/lib/monitoring/logger`
- **Server Environment**: `@/config/environment`
- **Repositories**: `@/repositories/*`
- **Database**: `@/lib/prisma` or `@prisma/client`
- **Server Utilities**: Anything in `src/server/*`

## What is Client Code?

Client code includes:
- React components (`*.tsx` files)
- React hooks (`src/hooks/*`)
- Client services (`src/client/*`)
- Feature modules (`src/features/*`)
- Pages (except `pages/api/*`)

## What is Server Code?

Server code includes:
- API routes (`src/pages/api/*`)
- Repositories (`src/repositories/*`)
- Server services (`src/server/*`)
- Middleware (`src/middleware/*`)

## Common Violations and Fixes

### ❌ Wrong: Importing server logger in a service used by React
```typescript
// src/services/api/myService.ts
import { logger } from '@/lib/monitoring/logger'; // WRONG!
```

### ✅ Correct: Use client logger
```typescript
// src/services/api/myService.ts
import { logger } from '@/utils/clientLogger'; // Correct!
```

### ❌ Wrong: Direct repository access in React
```typescript
// src/hooks/useMyData.ts
import { findUserById } from '@/repositories/userRepository'; // WRONG!
```

### ✅ Correct: Use API calls
```typescript
// src/hooks/useMyData.ts
import { UserApiService } from '@/services/api/userApiService'; // Correct!
```

## ESLint Enforcement

These boundaries are enforced by ESLint. If you see an error like:
- "Use @/utils/clientLogger in React/client code"
- "Repositories must only be imported server-side"

You're violating a module boundary and need to fix your import.

## Why This Matters

1. **Fast Refresh**: Mixed imports break React's Fast Refresh, causing full page reloads
2. **Security**: Server secrets must never reach the client bundle
3. **Bundle Size**: Server-only code shouldn't bloat the client bundle
4. **Type Safety**: Clear boundaries make it obvious where code runs 

### Fast Refresh & `getServerSideProps`

Pages that export both a React component and `getServerSideProps` (or `getStaticProps`) will always trigger a full browser reload during development.  
This behaviour is a framework limitation in Next.js/Turbopack, not a problem with our code.  
All other components continue to hot-reload normally. 
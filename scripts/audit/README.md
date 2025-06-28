# Code Audit Scripts

This directory contains automated audit scripts to help identify security gaps, anti-patterns, and technical debt in the codebase.

## Available Scripts

### 1. CSRF Protection Audit (`audit-csrf.ts`)

**Purpose:** Detects API routes that should use CSRF protection but don't.

**What it checks:**
- API routes with POST, PUT, PATCH, DELETE methods
- Presence of `withCsrf` middleware wrapper
- Usage of `composeApiMiddleware` pattern

**Run it:**
```bash
npm run audit:csrf
```

**Example output:**
```
[!] Missing CSRF protection in 3 file(s):

- src/pages/api/users/create.ts:25 (POST)
  ⚠️  Consider using composeApiMiddleware
- src/pages/api/projects/[projectId]/update.ts:42 (PUT)
- src/pages/api/claims/[id]/delete.ts:18 (DELETE)

→ Consider wrapping with `withCsrf` inside `composeApiMiddleware(...)`
```

### 2. Environment Variables Audit (`audit-env-vars.ts`)

**Purpose:** Finds insecure use of environment variables and hardcoded secrets.

**What it checks:**
- Hardcoded fallback values that look like secrets
- Sensitive env vars (KEY, SECRET, TOKEN, etc.) with defaults
- Direct `process.env` access without validation
- Hardcoded local/private URLs
- Potential base64 encoded secrets

**Run it:**
```bash
npm run audit:env
```

**Example output:**
```
[!] Found 5 potential issue(s):

📄 src/lib/api/client.ts
  Line 10: Sensitive environment variable with hardcoded fallback
    const apiKey = process.env.API_KEY || 'sk-default-key-12345'
    💡 Use getRequiredEnvVar() for sensitive values

📄 src/config/database.ts
  Line 25: Direct env var access without fallback or validation
    const dbUrl = process.env.DATABASE_URL
    💡 Consider using getEnvVar() or getRequiredEnvVar()
```

### 3. Console Usage Audit (`audit-console.ts`)

**Purpose:** Finds all console.log, console.error, etc., usages.

**What it checks:**
- All console methods (log, error, warn, info, debug, etc.)
- Categorizes by file context (API Route, Component, Service, etc.)
- Skips legitimate patterns (e.g., with eslint-disable comments)

**Run it:**
```bash
npm run audit:console
```

**Example output:**
```
[!] Found 23 console usage(s):

📁 API Route (12 usages):

  src/pages/api/projects/index.ts
    Line 45: console.log(...)
      console.log('Creating project:', data);

📁 React Component (8 usages):

  src/components/ProjectList.tsx
    Line 67: console.error(...)
      console.error('Failed to load projects:', error);

📊 Summary by console method:
  console.log: 15 usages
  console.error: 6 usages
  console.warn: 2 usages
```

## Running All Audits

To run all audit scripts at once:

```bash
npm run audit:all
```

## Exit Codes

All scripts exit with:
- `0` if no issues found
- `1` if issues are detected

This makes them suitable for CI/CD pipelines.

## Adding to CI/CD

Example GitHub Actions workflow:

```yaml
- name: Run security audits
  run: |
    npm run audit:csrf
    npm run audit:env
    npm run audit:console
```

## Customizing the Scripts

### Excluding Files/Patterns

Edit the `SKIP_PATTERNS` array in each script:

```typescript
const SKIP_PATTERNS = [
  '**/node_modules/**',
  '**/.next/**',
  '**/dist/**',
  // Add your custom patterns here
];
```

### Adding New Patterns

For environment variable audit, add patterns to `INSECURE_PATTERNS`:

```typescript
{
  pattern: /your-regex-here/g,
  issue: 'Description of the issue',
  suggestion: 'How to fix it',
}
```

## Best Practices

1. **Run before every release** - Include in your pre-release checklist
2. **Fix incrementally** - Don't try to fix everything at once
3. **Add suppressions carefully** - Use eslint-disable comments sparingly
4. **Document exceptions** - If you must keep a console.log, explain why
5. **Update patterns** - Add new patterns as you discover security issues

## Common Fixes

### CSRF Protection
```typescript
import { composeApiMiddleware } from '@/lib/middleware';
import { withCsrf } from '@/lib/middleware/csrf';

export default composeApiMiddleware(
  withCsrf,
  withAuth,
  withTenantGuard(resolveTenantId)
)(handler);
```

### Environment Variables
```typescript
import { getRequiredEnvVar, getEnvVar } from '@/lib/config/env';

// Required vars (app won't start without them)
const apiKey = getRequiredEnvVar('API_KEY');

// Optional with defaults
const debugMode = getEnvVar('DEBUG_MODE', 'false');
```

### Console Logging
```typescript
import { logger } from '@/lib/logger';

// Instead of console.log
logger.info('Processing request', { userId, action });

// Instead of console.error
logger.error('Failed to process', { error, context });
``` 
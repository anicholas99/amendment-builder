# Code Audit Summary & Cleanup Guide

## Quick Start

Run all audits to get a comprehensive view of technical debt:

```bash
npm run audit:all
```
 
Or run individual audits:

```bash
npm run audit:csrf    # Check CSRF protection
npm run audit:env     # Check environment variable usage
npm run audit:console # Check console logging
```

## Current Status (as of latest run)

### ✅ CSRF Protection Audit
- **Status**: EXCELLENT ✅
- **Found**: 100 API route files
- **Issues**: 0 - All mutating routes have CSRF protection!
- **Action**: No action needed

### ⚠️ Environment Variables Audit
- **Status**: NEEDS ATTENTION
- **Found**: 268 potential issues
- **Main issues**:
  - Direct `process.env` access without validation
  - Hardcoded local URLs in code
  - Missing use of `getEnvVar()` and `getRequiredEnvVar()` helpers
- **Action**: See "Environment Variables Cleanup" below

### ⚠️ Console Logging Audit
- **Status**: NEEDS ATTENTION
- **Found**: 291 console usages
- **Main areas**:
  - Scripts (expected and acceptable)
  - Logger module itself (acceptable)
  - Some in production code (needs fixing)
- **Action**: See "Console Logging Cleanup" below

## Cleanup Priority

### 🔴 High Priority
1. **Environment variables in production code** - Security risk
2. **Console logs in API routes** - Can leak sensitive data

### 🟡 Medium Priority
1. **Console logs in React components** - Poor practice
2. **Hardcoded URLs** - Configuration issue

### 🟢 Low Priority
1. **Console logs in scripts** - Generally acceptable
2. **Environment variables in test files** - Expected

## Environment Variables Cleanup

### Quick Wins (5 minutes each)
1. Replace direct `process.env` access in API routes:
   ```typescript
   // ❌ Before
   const apiKey = process.env.API_KEY;
   
   // ✅ After
   import { getRequiredEnvVar } from '@/lib/config/env';
   const apiKey = getRequiredEnvVar('API_KEY');
   ```

2. Move hardcoded URLs to environment variables:
   ```typescript
   // ❌ Before
   const url = 'http://localhost:3000/api';
   
   // ✅ After
   const url = getEnvVar('API_BASE_URL', 'http://localhost:3000/api');
   ```

### Systematic Approach
1. Start with files that have the most issues
2. Group similar changes together
3. Test after each batch of changes

## Console Logging Cleanup

### Quick Wins (2 minutes each)
1. Replace console logs in API routes:
   ```typescript
   // ❌ Before
   console.log('Processing request:', data);
   
   // ✅ After
   import { logger } from '@/lib/logger';
   logger.info('Processing request', { data });
   ```

2. Add eslint-disable for intentional console usage:
   ```typescript
   // For debugging that should stay
   // eslint-disable-next-line no-console
   console.log('Debug info for development');
   ```

### Areas to Focus On
1. **API Routes** (`src/pages/api/**`)
2. **Services** (`src/services/**`)
3. **Repositories** (`src/repositories/**`)
4. **React Components** (`src/components/**`)

### Areas to Skip
- Scripts (`scripts/**`) - Console is fine here
- Logger module itself
- Test files
- Configuration files

## Automation Ideas

### Pre-commit Hook
Add to your pre-commit hook to catch new issues:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run audit:csrf && npm run audit:env"
    }
  }
}
```

### CI/CD Pipeline
Add to GitHub Actions:

```yaml
- name: Security Audits
  run: |
    npm run audit:csrf
    npm run audit:env
  continue-on-error: true # For gradual adoption
```

## Tracking Progress

### Create GitHub Issues
1. Create one issue per audit type
2. Use task lists to track file-by-file progress
3. Assign to team members by area of expertise

### Metrics to Track
- Number of issues per audit
- Files cleaned up per week
- New issues introduced vs fixed

## Best Practices Going Forward

### For New Code
1. **Always use** `getEnvVar()` or `getRequiredEnvVar()`
2. **Always use** the logger instead of console
3. **Always wrap** mutating API routes with CSRF protection

### Code Review Checklist
- [ ] No direct `process.env` access
- [ ] No console.log/error in production code
- [ ] All POST/PUT/DELETE routes have CSRF protection
- [ ] No hardcoded URLs or secrets

## Next Steps

1. **Run the audits**: `npm run audit:all`
2. **Pick one area** to focus on (recommend starting with API routes)
3. **Fix 5-10 files** as a test
4. **Create a PR** with the fixes
5. **Share learnings** with the team
6. **Repeat** until clean!

## Questions?

If you're unsure about a specific fix:
1. Check the examples in `/scripts/audit/README.md`
2. Look at recently updated files for patterns
3. Ask in the team chat

Remember: Perfect is the enemy of good. Start with the highest impact fixes and iterate! 
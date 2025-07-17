# Content Security Policy (CSP) Migration Guide

## Overview

This guide documents the migration from a permissive CSP (with `unsafe-inline` and `unsafe-eval`) to a strict CSP that enhances the application's security posture.

## Migration Strategy

The migration is implemented in three phases to ensure a smooth transition without breaking existing functionality:

### Phase 1: Current State (Default)
- CSP includes `unsafe-inline` and `unsafe-eval`
- No environment variable needed
- Current production behavior

### Phase 2: Report-Only Mode
- Set `CSP_MODE=report-only` in environment
- Strict CSP is enforced in report-only mode
- Violations are logged to `/api/csp-report` without blocking
- Existing permissive CSP remains active
- Monitor logs to identify issues

### Phase 3: Strict Mode
- Set `CSP_MODE=strict` in environment
- Fully enforces strict CSP without unsafe directives
- All inline scripts/styles must be removed

## Implementation Details

### 1. Configuration
Add to your `.env` file:
```bash
# Options: 'report-only', 'strict', or leave unset for default
CSP_MODE=report-only
```

### 2. Monitoring CSP Violations
In report-only mode, violations are sent to `/api/csp-report`. Monitor these logs:

```bash
# View CSP violation logs
grep "CSP Violation Report" logs/application.log
```

### 3. Common Violations and Fixes

#### Inline Styles
**Before:**
```tsx
<div style={{ color: 'red' }}>Text</div>
<style>
  .my-class { color: blue; }
</style>
```

**After:**
```tsx
// Use theme styling
<Box color="red">Text</Box>

// Or use CSS files
import './styles.css';
```

#### Inline Scripts
**Before:**
```tsx
<script>
  console.log('Hello');
</script>
<button onClick="doSomething()">Click</button>
```

**After:**
```tsx
// Use React event handlers
<button onClick={handleClick}>Click</button>
```

## Completed Migrations

1. **AppLayout.tsx**: Moved inline styles to `/src/styles/appLayout.css`
2. **ViewLayout.tsx**: Moved resize handle styles to `/src/styles/resizeHandle.css`

## Remaining Work

1. Check for any remaining inline scripts/styles
2. Test third-party integrations (Auth0, analytics, etc.)
3. Validate all API connections work with strict CSP
4. Review and update any dynamic style generation

## Testing Checklist

- [ ] Enable report-only mode in development
- [ ] Test all major user flows
- [ ] Monitor CSP violation reports
- [ ] Fix any violations found
- [ ] Test in strict mode locally
- [ ] Deploy to staging with report-only mode
- [ ] Monitor staging for 24-48 hours
- [ ] Switch to strict mode in production

## Security Benefits

1. **XSS Protection**: Prevents execution of injected scripts
2. **Data Theft Prevention**: Restricts where data can be sent
3. **Clickjacking Protection**: frame-ancestors directive
4. **MITM Protection**: Enforces HTTPS for external resources

## Rollback Plan

If issues arise in production:
1. Remove `CSP_MODE` environment variable
2. Restart application
3. CSP reverts to permissive mode immediately

## Resources

- [MDN CSP Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Report URI Service](https://report-uri.com/) (for production CSP reporting) 
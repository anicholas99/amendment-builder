# Security Architecture

This document outlines the security architecture and patterns used in the Patent Drafter AI application. All API endpoints MUST follow these patterns to ensure consistent security posture across the application.

## Core Security Principles

1. **Fail-Closed by Default**: Security controls must fail safely. If a security check cannot be performed, the request must be denied.
2. **Defense in Depth**: Multiple layers of security controls protect each endpoint.
3. **Explicit Security**: Security controls must be visible and explicit in the code, not hidden in configuration.
4. **Tenant Isolation**: Multi-tenant data must be strictly isolated with no possibility of cross-tenant access.

## Secure API Presets

All API endpoints MUST use one of the following secure presets. These presets enforce security best practices and make it impossible to accidentally create insecure endpoints.

### Available Presets

#### 1. `SecurePresets.tenantProtected`

**Use for:** Endpoints that handle tenant-specific data (90% of your endpoints).

**Security Controls:**
- ✅ Authentication required
- ✅ Tenant isolation enforced
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Error handling

**Example:**
```typescript
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: projectIdSchema,
      body: updateProjectSchema,
    },
  }
);
```

**Common Tenant Resolvers:**
- `TenantResolvers.fromProject` - Resolve tenant from projectId in query params
- `TenantResolvers.fromSearchHistory` - Resolve tenant from searchHistoryId
- `TenantResolvers.fromUser` - Use the authenticated user's tenant
- `TenantResolvers.fromCitationJob` - Resolve tenant from citationJobId

#### 2. `SecurePresets.userPrivate`

**Use for:** Private endpoints that don't require tenant isolation (rare).

**Security Controls:**
- ✅ Authentication required
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Error handling
- ❌ No tenant isolation

**Example:**
```typescript
export default SecurePresets.userPrivate(handler, {
  validate: {
    body: updateProfileSchema,
  },
});
```

**Valid Use Cases:**
- User profile updates
- User preferences
- Account settings

#### 3. `SecurePresets.adminTenant`

**Use for:** Admin endpoints that operate within a specific tenant.

**Security Controls:**
- ✅ Authentication required
- ✅ Admin role required
- ✅ Tenant isolation enforced
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Error handling

**Example:**
```typescript
export default SecurePresets.adminTenant(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: projectIdSchema,
    },
  }
);
```

#### 4. `SecurePresets.adminGlobal`

**Use for:** Global admin endpoints that can operate across tenants.

**Security Controls:**
- ✅ Authentication required
- ✅ Admin role required
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Error handling
- ⚠️ No tenant isolation (use with extreme caution)

**Example:**
```typescript
export default SecurePresets.adminGlobal(handler, {
  validate: {
    body: adminActionSchema,
  },
});
```

**Valid Use Cases:**
- System health monitoring
- Cross-tenant analytics
- User management across tenants

#### 5. `SecurePresets.public`

**Use for:** Truly public endpoints (no authentication required).

**Security Controls:**
- ✅ Rate limiting
- ✅ Error handling
- ❌ No authentication
- ❌ No CSRF protection
- ❌ No tenant isolation

**Example:**
```typescript
export default SecurePresets.public(handler, {
  rateLimit: 'api', // or 'upload', 'auth', false
});
```

**Valid Use Cases:**
- Health checks (`/api/health`)
- Public documentation
- OAuth callbacks

## Security Decision Tree

```
Is authentication required?
├─ No → SecurePresets.public
└─ Yes
   └─ Does it access tenant-specific data?
      ├─ No → SecurePresets.userPrivate
      └─ Yes
         └─ Requires admin role?
            ├─ No → SecurePresets.tenantProtected
            └─ Yes
               └─ Can operate across tenants?
                  ├─ No → SecurePresets.adminTenant
                  └─ Yes → SecurePresets.adminGlobal
```

## Validation Options

All presets support validation schemas:

```typescript
{
  validate: {
    query: z.object({
      projectId: z.string().uuid(),
    }),
    body: z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    }),
    bodyMethods: ['POST', 'PUT'], // Default: ['POST', 'PUT', 'PATCH']
  },
}
```

## Rate Limiting Options

All presets support rate limiting configuration:

```typescript
{
  rateLimit: 'api',    // Standard API rate limit (default)
  rateLimit: 'upload', // Higher limit for file uploads
  rateLimit: 'auth',   // Stricter limit for auth endpoints
  rateLimit: false,    // Disable rate limiting (not recommended)
}
```

## CSRF Protection

CSRF protection is enabled by default for all authenticated endpoints. It can be disabled for specific endpoints that use bearer token authentication:

```typescript
{
  csrf: false, // Only disable if using bearer tokens, not cookies
}
```

## Migration Guide

### From `composeApiMiddleware`

**Before:**
```typescript
export default composeApiMiddleware(handler, {
  tenantSecurity: {
    resolver: TenantResolvers.fromProject,
  },
  validation: {
    query: projectIdSchema,
  },
  rateLimit: 'api',
});
```

**After:**
```typescript
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: projectIdSchema,
    },
  }
);
```

## Security Checklist for New Endpoints

- [ ] Choose the appropriate secure preset based on the decision tree
- [ ] If tenant-protected, select the correct tenant resolver
- [ ] Add validation schemas for query and body parameters
- [ ] Consider if custom rate limiting is needed
- [ ] Write tests that verify 401/403 responses for unauthorized access
- [ ] Document any special security considerations in code comments

## Common Security Mistakes to Avoid

1. **Using the wrong tenant resolver**
   - ❌ Using `TenantResolvers.fromUser` for project-specific endpoints
   - ✅ Using `TenantResolvers.fromProject` for project-specific endpoints

2. **Creating custom middleware chains**
   - ❌ `withAuth(withCsrf(handler))` - Missing tenant protection!
   - ✅ Use secure presets instead

3. **Disabling security controls without justification**
   - ❌ `{ csrf: false }` without using bearer tokens
   - ✅ Document why any security control is disabled

4. **Using `adminGlobal` when `adminTenant` would work**
   - ❌ Global admin for tenant-specific operations
   - ✅ Tenant-scoped admin whenever possible

## Security Event Logging

The secure presets automatically log security events for audit trails:

- `auth_failed` - Authentication failure
- `tenant_mismatch` - Tenant isolation violation attempt
- `role_denied` - Insufficient role permissions

These events include:
- User information (if authenticated)
- Request details (method, URL, IP, user agent)
- Custom details provided by the security middleware

## Questions?

If you're unsure which preset to use or have questions about security patterns, please ask in #engineering or consult with the security team before implementing. 
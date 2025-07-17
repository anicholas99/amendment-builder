# SecurePresets Pattern - Security Architecture Guide

## Overview

The SecurePresets pattern is a security-first architectural approach that ensures all API endpoints are secure by default. Instead of requiring developers to manually compose security middleware for each endpoint, SecurePresets provides pre-configured security stacks that automatically apply authentication, authorization, rate limiting, and other security measures.

## Key Benefits

1. **Secure by Default**: Impossible to accidentally create an insecure endpoint
2. **Consistent Security**: All endpoints follow the same security patterns
3. **Type Safety**: Full TypeScript support with proper request typing
4. **Maintainable**: Security policies can be updated in one place
5. **Performance**: Middleware is composed efficiently with minimal overhead

## Available Presets

### 1. `SecurePresets.tenantProtected`
**Use Case**: Most common - for endpoints that operate on tenant-specific data

```typescript
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,  // How to resolve tenant ID
  handler,                       // Your API logic
  {
    validate: { body: schema },  // Optional validation
    rateLimit: 'api',           // Optional rate limit type
  }
);
```

**Applied Security**:
- ✅ Authentication required
- ✅ Tenant isolation enforced
- ✅ CSRF protection
- ✅ Rate limiting (default: 'api')
- ✅ Error handling

### 2. `SecurePresets.userPrivate`
**Use Case**: For user-specific operations that don't require tenant context

```typescript
export default SecurePresets.userPrivate(handler, {
  validate: { body: updateProfileSchema }
});
```

**Applied Security**:
- ✅ Authentication required
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Error handling
- ❌ No tenant isolation

### 3. `SecurePresets.adminTenant`
**Use Case**: Admin operations within a specific tenant

```typescript
export default SecurePresets.adminTenant(
  TenantResolvers.fromUser,
  handler
);
```

**Applied Security**:
- ✅ Authentication required
- ✅ Admin role required
- ✅ Tenant isolation enforced
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Error handling

### 4. `SecurePresets.adminGlobal`
**Use Case**: Global admin operations (use sparingly)

```typescript
export default SecurePresets.adminGlobal(handler);
```

**Applied Security**:
- ✅ Authentication required
- ✅ Admin role required
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Error handling
- ❌ No tenant isolation

### 5. `SecurePresets.browserAccessible`
**Use Case**: Resources accessed directly by browsers (images, downloads)

```typescript
export default SecurePresets.browserAccessible(
  TenantResolvers.fromProject,
  handler,
  { rateLimit: 'resource' }
);
```

**Applied Security**:
- ✅ Authentication required
- ✅ Validates user has access to resource's tenant
- ✅ Rate limiting
- ❌ No CSRF (browsers can't send custom headers)

### 6. `SecurePresets.public`
**Use Case**: Truly public endpoints (health checks, etc.)

```typescript
export default SecurePresets.public(handler, {
  rateLimit: 'api'  // Still rate limited!
});
```

**Applied Security**:
- ❌ No authentication
- ✅ Rate limiting (unless explicitly disabled)
- ✅ Error handling

## Tenant Resolvers

Tenant resolvers determine how to extract the tenant context from a request:

```typescript
// From project ID in query params
TenantResolvers.fromProject

// From search history ID
TenantResolvers.fromSearchHistory

// From authenticated user's tenant
TenantResolvers.fromUser

// From request body field
TenantResolvers.fromBodyField('projectId')

// Custom resolver
const customResolver: TenantResolver = async (req) => {
  const { customId } = req.query;
  return await resolveCustomTenant(customId);
};
```

## Middleware Composition Order

The SecurePresets pattern applies middleware in a specific order for optimal security:

```
Request → Error Handling → Rate Limiting → Authentication → Tenant Guard → CSRF → Validation → Handler
```

This ensures:
1. Errors are always handled gracefully
2. Rate limiting happens before expensive operations
3. Authentication occurs before any data access
4. Tenant isolation is enforced before handler execution
5. CSRF tokens are validated for state changes
6. Input is validated last, closest to the handler

## Migration Guide

### From Legacy Patterns

**Before** (legacy):
```typescript
import { withAuth } from '@/middleware/auth';
import { withCsrf } from '@/middleware/csrf';

const handler = async (req, res) => {
  // ... handler logic
};

export default withAuth(withCsrf(handler));
```

**After** (SecurePresets):
```typescript
const handler = async (req, res) => {
  // ... handler logic
};

export default SecurePresets.userPrivate(handler);
```

### Adding Validation

```typescript
const schema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: { 
      body: schema,
      bodyMethods: ['POST', 'PUT'] // Only validate on these methods
    }
  }
);
```

## Best Practices

1. **Always use the most specific preset**: Don't use `adminGlobal` when `adminTenant` would work
2. **Provide validation schemas**: Help catch errors early and document your API
3. **Use appropriate rate limits**: Different operations have different costs
4. **Document public endpoints**: Explain why authentication isn't required
5. **Test tenant isolation**: Ensure users can't access other tenants' data

## Common Patterns

### Creating a Project
```typescript
export default SecurePresets.tenantProtected(
  TenantResolvers.fromUser,  // New projects go in user's current tenant
  handler,
  {
    validate: { body: createProjectSchema },
    rateLimit: 'api',
  }
);
```

### Accessing a Resource
```typescript
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,  // Verify user has access to project's tenant
  handler,
  {
    validate: { query: projectIdSchema },
    rateLimit: 'read',
  }
);
```

### Admin Operation
```typescript
export default SecurePresets.adminTenant(
  TenantResolvers.fromUser,  // Admin operates in their current tenant
  handler,
  {
    validate: { body: adminActionSchema },
    csrf: true,  // Extra CSRF protection for admin actions
  }
);
```

## Security Guarantees

When using SecurePresets, you get these guarantees:

1. **Authentication**: User identity is verified and available as `req.user`
2. **Authorization**: Tenant context is verified based on the resolver
3. **Rate Limiting**: Prevents abuse and DoS attacks
4. **CSRF Protection**: State-changing operations are protected
5. **Error Handling**: All errors are caught and logged appropriately
6. **Type Safety**: TypeScript ensures proper request/response types

## Troubleshooting

### "Tenant ID is required but was not provided"
- Ensure your tenant resolver returns a valid tenant ID
- Check that the user has `tenantId` in their session

### "CSRF token validation failed"
- Frontend must include CSRF token for POST/PUT/DELETE
- Check that cookies are being sent with requests

### "Rate limit exceeded"
- Different endpoint types have different limits
- Consider using a more appropriate rate limit type

## Future Enhancements

The SecurePresets pattern is designed to evolve:

1. **OAuth Support**: When migrating from cookies to OAuth, only SecurePresets needs updating
2. **New Security Features**: Add new security measures without touching individual endpoints
3. **Metrics & Monitoring**: Centralized security event tracking
4. **Dynamic Policies**: Runtime security policy updates

## Conclusion

The SecurePresets pattern represents a significant advancement in API security architecture. By making security the default rather than an afterthought, it ensures that your application maintains enterprise-grade security standards as it grows and evolves. 
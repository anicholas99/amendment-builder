# IPD Integration Readiness

## Summary
The Patent Drafter application is architected for IPD integration using a provider abstraction pattern.

## IPD Implementation Details
IPD's specific authentication implementation (cookie format, validation method, API endpoints) are not yet known. The codebase supports multiple common authentication patterns to accommodate whatever approach IPD uses.

## IPD Integration Requirements Status

✅ **Tracking presence of IPD cookies for direct link access**
- `hasIPDCookies(req)` function exists to detect IPD cookies
- Middleware framework in place to deny access without valid authentication
- *Implementation needed: IPD cookie validation logic*

✅ **Login page redirection when cookies are removed**
- 401 error handling automatically redirects to login
- IPD login redirect logic exists with feature flag
- *Implementation needed: Active IPD authentication checking*

✅ **Identifying User Claims from IPD cookies**
- `validateIPDCookies()` function skeleton ready
- `IPDUserClaims` interface defines expected structure
- *Implementation needed: Cookie parsing and validation logic*

✅ **User & Current Tenant identification**
- Multi-tenant architecture fully implemented
- Session management extracts user/tenant from auth provider
- *Implementation needed: Reading tenant info from IPD cookies*

✅ **Permissions with tenant changes**
- Permission system with tenant switching fully implemented
- Cache invalidation on tenant changes working
- *Implementation needed: Reading permissions from IPD cookies*

✅ **Token refresh for tenant users**
- `refreshIPDTokens()` function skeleton exists
- Session refresh monitoring infrastructure in place
- *Implementation needed: IPD token refresh API calls*

## What's Already Built

### ✅ Authentication Abstraction
- Single authentication manager (`src/lib/auth/authManager.ts`)
- Provider interface that IPD implements
- Switch providers by changing one line

### ✅ Cookie Handling Infrastructure
```typescript
// Already implemented in src/lib/ipd/cookieUtils.ts:
extractIPDCookies(req)     // ✓ Reads IPD cookies from request
hasIPDCookies(req)         // ✓ Checks if user has IPD session
validateIPDCookies()       // Skeleton ready - needs IPD logic
refreshIPDTokens()         // Skeleton ready - needs IPD endpoint
```

### ✅ Session Management
- 401 errors redirect to login
- Automatic session refresh
- Cookie removal detection
- Multi-tenant context switching

### ✅ Multi-Tenant Support
- Tenant extracted from URL
- Tenant headers on API calls  
- Permissions update on tenant switch
- Cache invalidation on tenant switch

## Implementation Steps

### 1. Create IPD Provider
```typescript
// Copy auth0.provider.ts and modify:
class IPDProvider implements AuthProvider {
  async getSession(req, res) {
    // Extract cookies (function exists)
    // Validate cookies (add IPD API call)
    // Return normalized session (interface defined)
  }
}
```

### 2. Implement Cookie Validation
Based on IPD's method:
- Option A: Call IPD validation API
- Option B: Verify JWT with public key
- Option C: Validate HMAC with shared secret

### 3. Add Token Refresh
Implement refresh token API call to IPD

### 4. Update Configuration
```bash
# .env
NEXT_PUBLIC_AUTH_TYPE=ipd
IPD_API_URL=https://api.ipdashboard.com
IPD_PUBLIC_KEY=...
```

## Architecture

```
Current:
[App] → [AuthManager] → [Auth0Provider] → [Auth0 API]

After IPD:
[App] → [AuthManager] → [IPDProvider] → [IPD API]
```

## File Locations

- Auth Manager: `src/lib/auth/authManager.ts`
- Provider Interface: `src/lib/auth/types.ts`
- IPD Cookie Utils: `src/lib/ipd/cookieUtils.ts`
- Example Provider: `src/lib/auth/providers/auth0.provider.ts`
- Feature Flag: `NEXT_PUBLIC_AUTH_TYPE` in `.env` 
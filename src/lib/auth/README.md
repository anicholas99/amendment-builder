# Authentication System

This directory contains the authentication abstraction layer that makes it easy to swap auth providers.

## Current Setup

The application currently uses **Auth0** for authentication, but the system is designed to make swapping providers simple.

## How to Swap Auth Providers

To replace Auth0 with IPD Identity or any other auth provider:

### 1. Create a New Provider

Create a new file in `src/lib/auth/providers/` that implements the `AuthProvider` interface:

```typescript
// src/lib/auth/providers/ipd.provider.ts
import { AuthProvider, AuthSession, AuthResult } from '../types';

export class IPDProvider implements AuthProvider {
  name = 'ipd';

  async getSession(req, res): Promise<AuthSession | null> {
    // Implement IPD session retrieval
  }

  async handleCallback(req, res): Promise<AuthResult> {
    // Handle IPD OAuth callback
  }

  async handleLogout(req, res): Promise<void> {
    // Handle IPD logout
  }

  // ... implement other required methods
}
```

### 2. Update the Auth Manager

Change ONE line in `src/lib/auth/authManager.ts`:

```typescript
function getAuthProvider(): AuthProvider {
  if (!authProvider) {
    // Change this line to use your new provider:
    authProvider = new IPDProvider({});  // <-- This is the only change needed!
  }
  return authProvider;
}
```

### 3. That's It!

Everything else automatically uses the new provider:
- API routes (`/api/auth/*`)
- Middleware authentication
- Frontend session management
- Login/logout flows

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌────────────────┐
│   Frontend  │────▶│ Auth Manager │────▶│ Auth Provider  │
│             │     │              │     │ (Auth0/IPD/etc)│
└─────────────┘     └──────────────┘     └────────────────┘
        │                   ▲
        │                   │
        ▼                   │
┌─────────────┐            │
│ API Routes  │────────────┘
│ /api/auth/* │
└─────────────┘
```

## Key Files

- `authManager.ts` - Central auth coordinator (change provider here)
- `types.ts` - Interfaces all providers must implement
- `providers/auth0.provider.ts` - Auth0 implementation
- `providers/ipd.provider.ts` - Future IPD implementation

## Testing a New Provider

1. Update environment variables for the new provider
2. Change the provider in `authManager.ts`
3. Test login/logout flows
4. Verify session management works
5. Check that all API routes authenticate properly

## Notes

- User IDs: When migrating, you'll need to handle the user ID format change (Auth0 uses `auth0|xxx`, IPD might use different format)
- For local development, you can reset the database to avoid ID conflicts
- The abstraction ensures minimal code changes when switching providers 
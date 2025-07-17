# 2.2 Authentication and Authorization

This document details the application's authentication and authorization mechanisms. It covers the end-to-end flow, from user login to securing API endpoints, and outlines the strategy for migrating to IPD Identity.

## Table of Contents
- [Authentication Flow](#-authentication-flow)
- [Core Components](#-core-components)
- [Server-Side: Securing API Routes](#-server-side-securing-api-routes)
- [Client-Side: Accessing Session Data](#-client-side-accessing-session-data)
- [IPD Identity Migration Plan](#-ipd-identity-migration-plan)

---

## 🔐 Authentication Flow

The application uses Auth0 as the current identity provider, but it is architected to be provider-agnostic.

1.  **Login**: The user is redirected from the client-side application to an Auth0 login page. The redirect is initiated by the `<AuthGuard />` component.
2.  **Callback**: After successful login with Auth0, the user is redirected back to the application's `/api/auth/callback` endpoint.
3.  **Session Creation**: The `@auth0/nextjs-auth0` library handles the callback, creating an encrypted, HTTP-only session cookie.
4.  **Session Usage**: On subsequent requests to the backend, this cookie is automatically sent, allowing the server to retrieve the user's session.

---

## 🧩 Core Components

This entire system is built upon a few key, reusable components:

### `getSession.ts`
-   **Location**: `src/lib/auth/getSession.ts`
-   **Purpose**: The **single source of truth** for server-side session retrieval.
-   **Function**: It wraps the underlying `getAuth0Session` call and normalizes the raw Auth0 session data into a clean, application-specific `AppSession` object. This abstraction is critical for the future migration to IPD Identity.

### `middleware.ts` (Root)
-   **Location**: `middleware.ts` (at the project root)
-   **Purpose**: A global, secure-by-default middleware that runs on nearly all incoming requests.
-   **Function**: It checks for a valid session using `getSession` on all API routes that are not explicitly public. If no session is found, it immediately returns a `401 Unauthorized` error.

### `withAuth` Middleware
-   **Location**: `src/middleware/auth.ts`
-   **Purpose**: A higher-order function used to wrap individual API route handlers.
-   **Function**: It uses `getSession` to ensure the user is authenticated, syncs the user with the database (creating a record if one doesn't exist), and injects a normalized `user` object into the `req` object for downstream handlers to use.

### `AuthGuard.tsx`
-   **Location**: `src/components/AuthGuard.tsx`
-   **Purpose**: A client-side component that protects pages from unauthenticated access.
-   **Function**: It uses the `useAuth` hook to check the user's authentication status. If the user is not logged in (`user` is null), it calls `redirectToLogin()` to initiate the login flow.

---

## 🖥️ Server-Side: Securing API Routes

API routes are secured by default using the root `middleware.ts`. For routes that require user-specific data, the `withAuth` middleware is composed with other middleware (like tenant guards and validation) to create a secure request pipeline.

```typescript
// Example of a secured API route
// src/pages/api/projects/index.ts

// The handler expects an AuthenticatedRequest with a user object.
const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  // The user and tenantId are guaranteed to exist by the middleware.
  const { id: userId, tenantId } = req.user!;
  
  // ... business logic
};

// composeMiddleware wraps the handler with withAuth and other guards.
export default composeMiddleware(
  withAuth,
  withTenant,
  withCsrf
)(handler);
```

---

## 🖼️ Client-Side: Accessing Session Data

Client-side components should **never** make direct API calls to fetch session data. All session information is provided through a central context.

### `AuthProvider.tsx` and `useAuth()`
-   **Location**: `src/contexts/AuthProvider.tsx`, `src/hooks/useAuth.ts`
-   **Purpose**: Provides session data to all components in the React tree.
-   **Function**:
    1.  The `AuthProvider` uses the `useSessionQuery` hook (which calls `/api/auth/session`) to fetch the `AppSession`.
    2.  It exposes the session data (`session`, `user`, `currentTenant`, `permissions`), loading state, and error state via the `useAuth` hook.
    3.  Components use `useAuth()` to access this data and reactively update based on authentication state.

```typescript
// Example usage in a component
import { useAuth } from '@/hooks/useAuth';

function UserProfile() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Spinner />;
  if (!user) return <div>Please log in.</div>;

  return <h1>Welcome, {user.name}</h1>;
}
```

---

## 🚀 IPD Identity Migration Plan

The architecture is designed for a seamless transition to IPD Identity.

-   **`getSession.ts`**: This is the primary touchpoint. The logic inside will be updated to validate an IPD Identity JWT instead of an Auth0 session cookie. The rest of the application, which relies on the normalized `AppSession` object, will require no changes.
-   **`redirects.ts`**: This file (`src/lib/auth/redirects.ts`) already contains logic gated by the `NEXT_PUBLIC_USE_IPD_IDENTITY` environment flag to redirect to an IPD login page instead of the Auth0 one.
-   **`cookieUtils.ts`**: This file (`src/lib/ipd/cookieUtils.ts`) is a placeholder with `TODO`s, ready to be implemented with the specific logic for parsing and validating IPD Identity cookies.
-   **Environment Variables**: The `.env.example` file already contains placeholders for the required IPD Identity environment variables.

The migration will primarily involve implementing `cookieUtils.ts` and swapping the logic within `getSession.ts`, making the transition efficient and low-risk. 
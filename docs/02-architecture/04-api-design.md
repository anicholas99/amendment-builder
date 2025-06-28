# 2.4 API Design & Conventions

This document outlines the standards and conventions for designing, securing, and implementing API routes within the application. Following these patterns is essential for maintaining a secure, consistent, and maintainable API layer.

## Table of Contents
- [Guiding Principles](#-guiding-principles)
- [API Route Structure](#-api-route-structure)
- [Security: The Middleware Chain](#-security-the-middleware-chain)
- [Request & Response Validation](#-request--response-validation)
- [Error Handling](#-error-handling)

---

## 🏛️ Guiding Principles

1.  **Secure by Default**: Endpoints are non-public by default. Security is layered and enforced consistently.
2.  **Thin Controllers**: API routes contain minimal logic. Their primary role is to validate a request, call the appropriate server-side service, and return a response.
3.  **Consistent & Predictable**: All APIs should follow the same structural patterns, and their responses (both success and error) should have a consistent shape.

---

## 📁 API Route Structure

All API routes are located in `src/pages/api/`. A typical API route file has the following structure:

1.  **Schema Definitions**: Zod schemas for validating request query parameters and body.
2.  **The Handler Function**: The core `async` function that processes the request.
3.  **Middleware Composition**: A call to `composeApiMiddleware` that wraps the handler with security and validation layers.

```typescript
// src/pages/api/projects/index.ts
import { z } from 'zod';
import { composeApiMiddleware, TenantResolvers } from '@/lib/api/middleware-helpers';
// ... other imports

// 1. Zod schemas for validation
const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
});

// 2. The core handler function
const handler = async (req: CustomApiRequest, res: NextApiResponse) => {
  // ... handler logic using req.validatedBody
};

// 3. Middleware composition
export default composeApiMiddleware(handler, {
  validation: {
    body: createProjectSchema,
    bodyMethods: ['POST'],
  },
  tenantSecurity: {
    resolver: TenantResolvers.fromUser,
    methods: ['POST'],
  },
  // ... other middleware options
});
```

---

## 🔒 Security: The Middleware Chain

API security is not optional; it's baked into the request lifecycle via a chain of composable middleware.

1.  **Root `middleware.ts`**: This file at the project root acts as the first line of defense. It blocks any unauthenticated request to a non-public API route with a `401 Unauthorized` response before it even reaches the specific API handler.

2.  **`withAuth`**: Ensures a user is logged in and populates `req.user` with a normalized session object.

3.  **`withTenantGuard`**: **This is a critical security measure.** For any endpoint that accesses or modifies tenant-specific data, this guard ensures the authenticated user has the right to perform the action within that tenant. It prevents users from one tenant from accessing data belonging to another. It requires a `resolveTenantId` function to locate the correct tenant from the request.

4.  **`withValidation`**: Uses Zod schemas to validate incoming request queries and bodies, preventing malformed data from being processed.

5.  **`withCsrf`**: Protects against Cross-Site Request Forgery on all mutating requests (POST, PUT, PATCH, DELETE).

---

## ✅ Request & Response Validation

To ensure type safety from end to end, we use **Zod** for validation.

-   **Request Validation**: The `composeApiMiddleware` function takes a `validation` key where you provide Zod schemas for the request's `query` or `body`. If validation fails, it automatically sends a `400 Bad Request` response with details about the validation errors. The validated and typed data is then available to your handler as `req.validatedQuery` and `req.validatedBody`.

-   **Response Validation**: While not automatically enforced by middleware, it is a **strongly encouraged best practice** to validate data from external sources or before complex transformations using Zod schemas to ensure data integrity.

---

## ❌ Error Handling

Proper error handling is crucial for security and a good developer experience.

-   **Standardized Error Shape**: All errors thrown by the API have a consistent JSON shape, making them predictable for the client to handle.
    ```json
    {
      "error": {
        "code": "ERROR_CODE",
        "message": "A human-readable explanation of what went wrong."
      }
    }
    ```
-   **`ApplicationError`**: When you need to throw an error from a service or handler, use the custom `ApplicationError` class from `src/lib/error.ts`. This allows you to specify a machine-readable `ErrorCode` and a clear message.
-   **No Sensitive Information**: Never expose raw database errors, stack traces, or other sensitive implementation details in an API response. The global error handling middleware will catch unhandled exceptions and return a generic `500 Internal Server Error` response while logging the full error details on the server for debugging. 
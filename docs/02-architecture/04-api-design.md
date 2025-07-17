# 2.4 API Design & Conventions

**Last Updated**: January 8, 2025

This document outlines the standards and conventions for designing, securing, and implementing API routes within the application. Following these patterns is essential for maintaining a secure, consistent, and maintainable API layer.

## Table of Contents
- [Guiding Principles](#-guiding-principles)
- [SecurePresets Architecture](#-securepresets-architecture)
- [API Route Structure](#-api-route-structure)
- [Request & Response Validation](#-request--response-validation)
- [Error Handling](#-error-handling)
- [RESTful Conventions](#-restful-conventions)
- [Real-Time APIs](#-real-time-apis)

---

## 🏛️ Guiding Principles

1. **Secure by Default**: All endpoints require authentication unless explicitly made public
2. **Thin Controllers**: API routes contain minimal logic, delegating to service layers
3. **Consistent & Predictable**: Uniform patterns for requests, responses, and errors
4. **Tenant Isolated**: Multi-tenant data isolation enforced at the API level
5. **Type Safe**: Full TypeScript coverage with runtime validation

---

## 🔐 SecurePresets Architecture

The application uses a centralized security pattern called `SecurePresets` that provides pre-configured middleware stacks for different security contexts.

### Available Presets

```typescript
import { SecurePresets } from '@/server/api/securePresets';

// 1. Standard tenant-isolated endpoint (most common)
export default SecurePresets.tenantProtected(
  async (req, res) => {
    // Has access to req.user and req.tenant
  }
);

// 2. User-specific endpoint (no tenant required)
export default SecurePresets.userPrivate(
  async (req, res) => {
    // Has access to req.user only
  }
);

// 3. Public endpoint (no auth required)
export default SecurePresets.public(
  async (req, res) => {
    // No authentication required
  }
);

// 4. Admin endpoints
export default SecurePresets.adminTenant(handler);  // Tenant admin
export default SecurePresets.adminGlobal(handler);  // System admin

// 5. Browser-accessible resources
export default SecurePresets.browserAccessible(handler);
```

### Security Stack

Each preset applies these middleware layers in order:

1. **Error Handling** - Catches and formats all errors
2. **Security Headers** - Adds X-Frame-Options, etc.
3. **Rate Limiting** - Prevents abuse
4. **Authentication** - Verifies user identity
5. **Session Security** - Validates session state
6. **CSRF Protection** - For state-changing operations
7. **Tenant Guard** - Ensures tenant isolation
8. **Request Validation** - Validates input schemas

### Custom Configuration

```typescript
// Override default configuration
export default SecurePresets.tenantProtected(
  async (req, res) => {
    // Handler
  },
  {
    skipCsrf: true,           // For GET requests
    rateLimit: {              // Custom rate limits
      windowMs: 60000,
      max: 10
    },
    validation: {             // Zod schemas
      body: createProjectSchema,
      query: querySchema
    }
  }
);
```

---

## 📁 API Route Structure

### Basic Structure

```typescript
// src/pages/api/projects/[projectId]/index.ts
import { z } from 'zod';
import { SecurePresets } from '@/server/api/securePresets';
import { projectService } from '@/server/services/project.server-service';

// 1. Define validation schemas
const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
});

// 2. Define the handler
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { projectId } = req.query as { projectId: string };
  const { tenantId } = req.tenant!;
  
  switch (req.method) {
    case 'GET':
      const project = await projectService.getProject(projectId, tenantId);
      return res.json(project);
      
    case 'PUT':
      const updated = await projectService.updateProject(
        projectId,
        tenantId,
        req.body
      );
      return res.json(updated);
      
    case 'DELETE':
      await projectService.deleteProject(projectId, tenantId);
      return res.status(204).end();
      
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
};

// 3. Export with security preset
export default SecurePresets.tenantProtected(handler, {
  validation: {
    body: updateProjectSchema
  }
});
```

### File Organization

```
pages/api/
├── auth/                    # Authentication endpoints
│   ├── [...auth0].ts       # Auth0 callback
│   ├── login.ts            # Login endpoint
│   └── session.ts          # Session info
├── projects/               # Project resources
│   ├── index.ts           # List/Create projects
│   └── [projectId]/       # Single project operations
│       ├── index.ts       # Get/Update/Delete
│       ├── claims/        # Project claims
│       └── figures/       # Project figures
├── search/                # Search operations
├── admin/                 # Admin endpoints
└── health.ts             # Health check
```

---

## ✅ Request & Response Validation

### Input Validation with Zod

```typescript
import { z } from 'zod';

// Define schemas
const createClaimSchema = z.object({
  text: z.string().min(1).max(5000),
  type: z.enum(['independent', 'dependent']),
  parentId: z.string().uuid().optional(),
});

// Use in handler
export default SecurePresets.tenantProtected(
  async (req, res) => {
    // req.body is already validated and typed
    const claim = await claimService.create(req.body);
    res.json(claim);
  },
  {
    validation: {
      body: createClaimSchema
    }
  }
);
```

### Response Formatting

```typescript
// Success responses
res.json({
  id: 'uuid',
  name: 'Project Name',
  createdAt: '2025-01-08T00:00:00Z',
  // ... other fields
});

// Paginated responses
res.json({
  data: [...],
  pagination: {
    page: 1,
    pageSize: 20,
    totalPages: 5,
    totalCount: 100
  }
});

// Error responses (handled automatically)
res.status(400).json({
  error: 'Validation failed',
  details: {
    field: 'name',
    message: 'Name is required'
  }
});
```

---

## 🚨 Error Handling

### Error Types

```typescript
// Custom error classes
export class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
```

### Error Handling in Services

```typescript
// In service layer
async getProject(id: string, tenantId: string) {
  const project = await projectRepository.findById(id, tenantId);
  
  if (!project) {
    throw new NotFoundError('Project', id);
  }
  
  return project;
}
```

### Automatic Error Formatting

The error handling middleware automatically formats errors:

```typescript
// NotFoundError → 404
{
  "error": "Project with id 123 not found"
}

// ValidationError → 400
{
  "error": "Validation failed",
  "details": { ... }
}

// UnauthorizedError → 401
{
  "error": "Unauthorized"
}

// Generic Error → 500
{
  "error": "Internal server error"
}
```

---

## 🔗 RESTful Conventions

### URL Structure

```
/api/projects                    # Collection
/api/projects/{id}              # Single resource
/api/projects/{id}/claims       # Nested collection
/api/projects/{id}/claims/{id}  # Nested resource
```

### HTTP Methods

| Method | Purpose | Request Body | Response |
|--------|---------|--------------|----------|
| GET | Retrieve resource(s) | None | Resource data |
| POST | Create resource | New resource data | Created resource |
| PUT | Full update | Complete resource | Updated resource |
| PATCH | Partial update | Partial data | Updated resource |
| DELETE | Remove resource | None | 204 No Content |

### Status Codes

| Code | Usage |
|------|-------|
| 200 | Success with data |
| 201 | Created (POST) |
| 202 | Accepted (async) |
| 204 | Success no data (DELETE) |
| 400 | Bad request/validation |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict |
| 422 | Unprocessable entity |
| 429 | Rate limited |
| 500 | Server error |

---

## 🔄 Real-Time APIs

### Server-Sent Events (SSE)

```typescript
// Chat streaming endpoint
export default SecurePresets.tenantProtected(
  async (req, res) => {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Stream data
    const stream = chatService.streamResponse(req.body);
    
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
  }
);
```

### Long Polling

```typescript
// Status polling endpoint
export default SecurePresets.tenantProtected(
  async (req, res) => {
    const { jobId } = req.query;
    const { tenantId } = req.tenant!;
    
    const job = await jobService.getStatus(jobId, tenantId);
    
    res.json({
      id: job.id,
      status: job.status,
      progress: job.progress,
      result: job.result
    });
  }
);
```

---

## Best Practices

1. **Use SecurePresets** - Don't compose middleware manually
2. **Validate Everything** - Use Zod schemas for all inputs
3. **Delegate to Services** - Keep route handlers thin
4. **Handle Errors Properly** - Throw typed errors in services
5. **Document APIs** - Use JSDoc comments for complex endpoints
6. **Test Security** - Ensure tenant isolation in tests
7. **Monitor Performance** - Log slow queries and endpoints

---

This API design provides a secure, consistent, and maintainable foundation for building robust REST APIs with built-in security, validation, and error handling.
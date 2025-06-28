# API Documentation

This directory contains all Next.js API routes for Patent Drafter AI. Our API follows RESTful principles with consistent patterns for authentication, validation, and error handling.

## 🔐 Authentication & Security

All API endpoints (except auth endpoints) require authentication:

```typescript
// Required headers for all API calls
{
  "Authorization": "Bearer <jwt-token>",
  "x-tenant-slug": "tenant-name"
}
```

### Security Middleware Stack

```typescript
export default composeApiMiddleware(handler, {
  schema: requestSchema,        // Zod validation
  resolveTenantId,             // Tenant isolation
  requireAuth: true,           // JWT validation
  rateLimit: { ... },          // Rate limiting
});
```

## 📁 API Structure

```
api/
├── auth/                    # Authentication endpoints
├── projects/               # Project management
│   └── [projectId]/       # Project-specific operations
├── ai/                    # AI integration endpoints
├── citation-*/            # Citation and search operations
├── documents/             # Document management
├── prior-art/            # Prior art analysis
├── users/                # User management
└── v1/                   # Versioned API endpoints
```

## 🔧 Core Endpoints

### Authentication

#### `POST /api/auth/login`
Authenticate user and receive JWT token.
```json
{
  "email": "user@example.com",
  "password": "secure-password"
}
```

#### `POST /api/auth/logout`
Invalidate current session.

#### `GET /api/auth/me`
Get current user information.

### Projects

#### `GET /api/projects`
List all projects for the authenticated user.

Query parameters:
- `page` (number): Page number for pagination
- `limit` (number): Items per page (max: 50)
- `status` (string): Filter by project status

#### `POST /api/projects`
Create a new project.
```json
{
  "name": "My Patent Project",
  "description": "AI-powered assistant",
  "status": "draft"
}
```

#### `GET /api/projects/[projectId]`
Get detailed project information.

#### `PUT /api/projects/[projectId]`
Update project details.

#### `DELETE /api/projects/[projectId]`
Delete a project (soft delete).

### AI Operations

#### `POST /api/ai/generate-claims`
Generate patent claims from invention description.
```json
{
  "projectId": "proj_123",
  "inventionDescription": "...",
  "claimType": "independent"
}
```

#### `POST /api/ai/analyze-prior-art`
Analyze prior art for patentability.
```json
{
  "projectId": "proj_123",
  "claims": ["..."],
  "priorArt": ["..."]
}
```

### Search & Citations

#### `POST /api/search-history`
Create a new search.
```json
{
  "projectId": "proj_123",
  "query": "machine learning optimization",
  "filters": {
    "dateRange": "2020-2024",
    "jurisdictions": ["US", "EP"]
  }
}
```

#### `GET /api/citation-jobs/[jobId]`
Get citation extraction job status.

#### `POST /api/citation-extraction/queue`
Queue citations for extraction.

## 📋 Request/Response Patterns

### Standard Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-01-20T10:30:00Z",
    "version": "1.0"
  }
}
```

### Standard Error Response

```json
{
  "error": true,
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    // Additional error context
  }
}
```

### Pagination Response

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## 🛡️ API Best Practices

### 1. Input Validation

Always use Zod schemas for request validation:

```typescript
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'completed']),
});

export default withValidation(createProjectSchema, handler);
```

### 2. Error Handling

Use consistent error responses:

```typescript
try {
  // Operation
} catch (error) {
  if (error instanceof ValidationError) {
    return res.status(400).json({
      error: true,
      message: 'Validation failed',
      details: error.errors,
    });
  }
  
  logger.error('Unexpected error', { error });
  return res.status(500).json({
    error: true,
    message: 'Internal server error',
  });
}
```

### 3. Tenant Isolation

Always include tenant checks:

```typescript
const resolveTenantId = async (req: Request): Promise<string | null> => {
  const { projectId } = req.query;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { tenantId: true },
  });
  return project?.tenantId || null;
};
```

### 4. Rate Limiting

Configure appropriate rate limits:

```typescript
export default composeApiMiddleware(handler, {
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
  },
});
```

## 🔄 Async Operations

For long-running operations, use job queues:

1. **Initiate Job**
   ```json
   POST /api/jobs/create
   Response: { "jobId": "job_123", "status": "pending" }
   ```

2. **Check Status**
   ```json
   GET /api/jobs/job_123/status
   Response: { "status": "processing", "progress": 45 }
   ```

3. **Get Results**
   ```json
   GET /api/jobs/job_123/result
   Response: { "status": "completed", "data": {...} }
   ```

## 🧪 Testing API Endpoints

### Using cURL

```bash
# Get project
curl -H "Authorization: Bearer $TOKEN" \
     -H "x-tenant-slug: acme-corp" \
     https://api.patentdrafter.ai/api/projects/proj_123

# Create project
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "x-tenant-slug: acme-corp" \
     -H "Content-Type: application/json" \
     -d '{"name":"New Project"}' \
     https://api.patentdrafter.ai/api/projects
```

### Using Jest

```typescript
describe('POST /api/projects', () => {
  it('should create a project', async () => {
    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-slug', 'test-tenant')
      .send({ name: 'Test Project' });
      
    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('id');
  });
});
```

## 📊 API Monitoring

Key metrics to track:
- Response time (p50, p95, p99)
- Error rates by endpoint
- Request volume
- Authentication failures
- Rate limit violations

## 🚀 Performance Guidelines

1. **Use Pagination**: Limit result sets to prevent large payloads
2. **Implement Caching**: Cache frequently accessed data
3. **Optimize Queries**: Use database indexes and limit fields
4. **Compress Responses**: Enable gzip compression
5. **Set Timeouts**: Implement request timeouts (30s default)

## 🔍 Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `AUTH_REQUIRED` | Missing authentication | 401 |
| `AUTH_INVALID` | Invalid token | 401 |
| `FORBIDDEN` | Lack of permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Invalid input | 400 |
| `RATE_LIMITED` | Too many requests | 429 |
| `SERVER_ERROR` | Internal error | 500 |

## 🆕 Adding New Endpoints

1. Create the handler file in appropriate directory
2. Implement request handler with proper typing
3. Add validation schema
4. Configure middleware
5. Add tests
6. Update this documentation

Example template:

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { composeApiMiddleware } from '@/middleware/compose';
import { createApiLogger } from '@/lib/monitoring/apiLogger';

const logger = createApiLogger('endpoint-name');

const schema = z.object({
  // Define schema
});

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Implementation
    logger.info('Operation completed');
    return res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Operation failed', { error });
    throw error;
  }
}

const resolveTenantId = async (req: NextApiRequest) => {
  // Tenant resolution logic
};

export default composeApiMiddleware(handler, {
  schema,
  resolveTenantId,
}); 
# API Response Utilities

This directory contains utilities for standardizing API responses across all endpoints.

## Quick Start

```typescript
import { apiResponse } from '@/utils/api/responses';

// Success responses
apiResponse.ok(res, data);           // 200 OK
apiResponse.created(res, data);      // 201 Created

// Error responses
apiResponse.badRequest(res);         // 400
apiResponse.unauthorized(res);       // 401
apiResponse.forbidden(res);          // 403
apiResponse.notFound(res);          // 404
apiResponse.methodNotAllowed(res, ['GET', 'POST']);  // 405
apiResponse.serverError(res, error); // 500+
```

## Standard Response Formats

### Success Response
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "pagination": { ... }
  }
}
```

### Error Response
```json
{
  "error": "Human-friendly message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

## Migration Guide

### Before (Inconsistent)
```typescript
// Different formats across endpoints
res.status(200).json(projects);
res.status(200).json({ projects: [...] });
res.status(400).json({ error: 'Bad request' });
res.status(404).json({ message: 'Not found' });
```

### After (Standardized)
```typescript
// Consistent format using utility
apiResponse.ok(res, projects);
apiResponse.ok(res, { projects: [...] });
apiResponse.badRequest(res);
apiResponse.notFound(res);
```

## Complete Example

```typescript
import { apiResponse } from '@/utils/api/responses';
import { ApplicationError, ErrorCode } from '@/lib/error';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validate method
    if (req.method !== 'GET') {
      return apiResponse.methodNotAllowed(res, ['GET']);
    }

    // Get data
    const data = await fetchData();
    
    if (!data) {
      return apiResponse.notFound(res);
    }

    // Return success with optional pagination
    return apiResponse.ok(res, data, {
      pagination: {
        page: 1,
        limit: 20,
        total: 100,
        totalPages: 5,
        hasNextPage: true,
        hasPrevPage: false,
      }
    });
  } catch (error) {
    // Automatic error handling with proper status codes
    return apiResponse.serverError(res, error);
  }
}
```

## Benefits

1. **Consistency**: All endpoints return the same format
2. **Security**: Never exposes internal error details to clients
3. **Type Safety**: Full TypeScript support
4. **DX**: Simple, intuitive API
5. **Logging**: Automatic error logging with context

## Best Practices

1. Always use `apiResponse` utility instead of direct `res.json()`
2. Let the utility handle status codes - don't set them manually
3. For custom errors, use `ApplicationError` with appropriate `ErrorCode`
4. The utility automatically logs errors - no need to log separately
5. Validation errors are automatically formatted with field details

## Error Code Mapping

The utility automatically maps `ApplicationError` codes to HTTP status codes:

- `VALIDATION_*` → 400
- `AUTH_UNAUTHORIZED` → 401
- `AUTH_FORBIDDEN` → 403
- `*_NOT_FOUND` → 404
- `DB_DUPLICATE_ENTRY` → 409
- `RATE_LIMIT_EXCEEDED` → 429
- `INTERNAL_ERROR` → 500

See `src/lib/error.ts` for all available error codes. 
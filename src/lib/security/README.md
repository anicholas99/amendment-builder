# Rate Limiting Architecture

## Overview

This directory contains two separate rate limiting implementations for different runtime environments:

### 1. `rateLimit.edge.ts` - Edge Runtime
- Used by: `middleware.ts`
- Runtime: Edge Runtime (V8 isolates)
- Storage: In-memory per edge instance
- Features: Lightweight, synchronous, no Node.js dependencies

### 2. `rateLimit.ts` - Node.js Runtime
- Used by: API routes (`/pages/api/*`)
- Runtime: Node.js
- Storage: Redis with in-memory fallback
- Features: Distributed rate limiting, Redis support

## Why Two Implementations?

Next.js middleware runs in the Edge Runtime, which doesn't support Node.js modules like:
- `ioredis` (requires `net`, `dns`, `tls`)
- `winston` (requires `fs`, `stream`)
- Other Node.js built-ins

By separating the implementations:
1. Edge Runtime gets a lightweight, compatible rate limiter
2. API routes get full Redis support for distributed rate limiting
3. No runtime errors from incompatible modules
4. Clear separation of concerns

## Usage

### In Middleware (Edge Runtime)
```typescript
import { rateLimit } from '@/lib/security/rateLimit.edge';

export async function middleware(req: NextRequest) {
  const rateLimitResponse = rateLimit(req);
  if (rateLimitResponse) {
    return rateLimitResponse; // 429 response
  }
  // Continue processing...
}
```

### In API Routes (Node.js)
```typescript
import { withRateLimit } from '@/middleware/rateLimiter';

const handler = async (req, res) => {
  // Your API logic
};

export default withRateLimit('api')(handler);
```

## Configuration

Both implementations share the same rate limit configurations:
- `auth`: 5 requests per 5 minutes
- `api`: 100 requests per minute
- `ai`: 20 requests per 5 minutes
- `upload`: 10 requests per 5 minutes
- `system`: 300 requests per minute

## Production Considerations

1. **Edge Runtime**: Rate limits are per-edge-instance, not global
2. **API Routes**: Use Redis for distributed rate limiting across all instances
3. **Monitoring**: Track rate limit hits in your monitoring system
4. **Scaling**: Consider using a global rate limiter service for true distributed limiting 
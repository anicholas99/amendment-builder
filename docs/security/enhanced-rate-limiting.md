# Enhanced Rate Limiting System

## Overview

The enhanced rate limiting system provides advanced security features including:
- **Client Fingerprinting**: Combines IP, user agent, user ID, and API keys for better identification
- **Progressive Penalties**: Exponentially increasing penalties for repeat offenders
- **Cost-Based Limiting**: Different operations consume different amounts of rate limit quota
- **Bypass Mechanism**: Trusted services can skip rate limiting
- **Violation Tracking**: Monitors and escalates penalties for suspicious behavior

## Migration Guide

### Step 1: Simple Drop-in Replacement

For existing endpoints using the old rate limiter, you can switch to the enhanced version with zero code changes:

```typescript
// Old import
import { withRateLimit } from '@/middleware/rateLimiter';

// New import - just change the import path
import { withRateLimit } from '@/middleware/enhancedRateLimiter';

// Usage remains the same
export default withRateLimit(handler, 'auth');
```

### Step 2: Direct Enhanced Rate Limiting

For new endpoints or when you want to use enhanced features directly:

```typescript
import { withEnhancedRateLimit } from '@/lib/security/enhancedRateLimit';

// Simple usage
export default withEnhancedRateLimit('api')(handler);

// With SecurePresets
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  withEnhancedRateLimit('ai')(handler) as any
);
```

### Step 3: Cost-Based Rate Limiting

For expensive operations like AI or batch processing:

```typescript
import { withCostBasedRateLimit } from '@/lib/security/enhancedRateLimit';

// Define cost calculation
function calculateCost(req: NextApiRequest): number {
  let cost = 1; // Base cost
  
  if (req.body?.batchSize) {
    cost *= req.body.batchSize;
  }
  
  if (req.url?.includes('/ai/')) {
    cost *= 5; // AI operations cost 5x
  }
  
  return cost;
}

// Apply cost-based limiting
export default withCostBasedRateLimit('ai', calculateCost)(handler);
```

## Configuration

### Rate Limit Types

| Type | Points | Duration | Features |
|------|--------|----------|----------|
| `auth` | 5 | 5 min | 15 min block, 2x penalty multiplier |
| `api` | 100 | 1 min | Standard API calls |
| `ai` | 50 | 5 min | 5x cost multiplier, 1.5x penalty |
| `upload` | 10 | 5 min | 10 min block, 3x cost multiplier |
| `search` | 50 | 1 min | 2x cost multiplier |

### Progressive Penalties

When a client exceeds rate limits repeatedly:
1. First violation: Normal block duration
2. Second violation within 1 hour: 2x block duration
3. Third violation: 4x block duration
4. Fourth+ violation: 8x block duration (max 16x penalty on costs)

### Client Fingerprinting

The system creates a unique fingerprint using:
- IP address (with proxy detection)
- User agent (first 50 chars)
- Authenticated user ID
- API key (if present)
- Accept-Language header
- Accept-Encoding header

This prevents simple IP spoofing and provides better tracking across sessions.

## Headers

All rate-limited endpoints return these headers:
- `X-RateLimit-Limit`: Total points available
- `X-RateLimit-Remaining`: Points remaining
- `X-RateLimit-Reset`: ISO timestamp when limit resets
- `X-RateLimit-Cost`: Cost of this request (for cost-based limiting)
- `Retry-After`: Seconds until retry allowed (on 429 responses)

## Best Practices

### 1. Choose the Right Limiter Type
```typescript
// Authentication endpoints - strict limits
withEnhancedRateLimit('auth')

// AI/ML endpoints - cost-based
withCostBasedRateLimit('ai', calculateAICost)

// Standard API - balanced limits
withEnhancedRateLimit('api')

// File uploads - restrictive
withEnhancedRateLimit('upload')
```

### 2. Calculate Costs Appropriately
```typescript
function calculateAICost(req: NextApiRequest): number {
  const base = 10; // Base cost for AI operation
  
  // Factor in complexity
  if (req.body?.mode === 'detailed') return base * 2;
  if (req.body?.includeAnalysis) return base * 1.5;
  
  // Factor in data size
  const dataSize = JSON.stringify(req.body).length;
  if (dataSize > 10000) return base * 1.5;
  
  return base;
}
```

### 3. Monitor Rate Limit Logs
```typescript
// Violations are logged with context
logger.warn('Rate limit exceeded', {
  fingerprint: { ip, userId, hasApiKey },
  cost: effectiveCost,
  penalty: penaltyLevel,
  violations: violationCount,
  path: req.url,
});
```

### 4. Handle 429 Responses Gracefully
```typescript
// Client-side handling
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  const resetAt = response.headers.get('X-RateLimit-Reset');
  
  // Show user-friendly message
  showError(`Rate limit exceeded. Please try again in ${retryAfter} seconds.`);
  
  // Optionally implement exponential backoff
  await delay(parseInt(retryAfter) * 1000);
}
```

## Security Benefits

1. **DDoS Protection**: Progressive penalties discourage sustained attacks
2. **Cost Control**: AI and expensive operations have appropriate limits
3. **User Fairness**: Cost-based system prevents single users from monopolizing resources
4. **Attack Detection**: Violation tracking helps identify suspicious patterns
5. **Flexibility**: Easy to adjust limits without code changes

## Future Enhancements

1. **Redis Integration**: For distributed rate limiting across multiple servers
2. **IP Reputation**: Integration with IP reputation services
3. **Machine Learning**: Automatic adjustment of limits based on usage patterns
4. **Webhook Alerts**: Notify admins of suspicious rate limit violations
5. **User-Specific Limits**: Different limits for different subscription tiers

## Monitoring

Track these metrics:
- Rate limit violations by endpoint
- Repeat offenders (high penalty levels)
- Cost distribution across endpoints
- 429 response rates
- Average remaining quota by user type

## Testing

```typescript
// In tests, rate limiting is automatically disabled
// But you can test the logic directly:

import { EnhancedRateLimiter } from '@/lib/security/enhancedRateLimit';

const limiter = new EnhancedRateLimiter({
  points: 10,
  duration: 60,
  penaltyMultiplier: 2,
});

// Test consumption
const result = await limiter.consume(mockReq, 5);
expect(result.remaining).toBe(5);

// Test penalty
const overLimit = await limiter.consume(mockReq, 10);
expect(overLimit.allowed).toBe(false);
``` 
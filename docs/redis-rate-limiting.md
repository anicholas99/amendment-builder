# Redis Rate Limiting Implementation

This document describes the Redis-based rate limiting implementation for the Patent Drafter AI application.

## Overview

The application uses Redis for distributed rate limiting when deployed to Azure, ensuring consistent rate limits across multiple instances. When Redis is unavailable, the system automatically falls back to in-memory rate limiting.

## Architecture

### Components

1. **RateLimiter Interface** - Common interface for all rate limiters
2. **InMemoryRateLimiter** - Local rate limiting for development and fallback
3. **RedisRateLimiter** - Distributed rate limiting using Redis sorted sets
4. **RateLimiterFactory** - Creates and manages rate limiter instances

### Rate Limit Configurations

Different endpoints have different rate limits:

- **Auth** (5 requests per 5 minutes): Login/logout endpoints
- **API** (100 requests per minute): General API endpoints
- **AI** (20 requests per 5 minutes): AI generation endpoints
- **Upload** (10 requests per 5 minutes): File upload endpoints
- **System** (300 requests per minute): CSRF, session endpoints

## Implementation Details

### Redis Algorithm

The Redis implementation uses sorted sets with a sliding window approach:

1. Each request is stored as a member in a sorted set with the timestamp as the score
2. Expired entries are removed based on the time window
3. The cardinality of the set determines if the limit is exceeded
4. Each key has a TTL equal to the rate limit window

### Key Structure

```
ratelimit:{client_identifier}
```

Where `client_identifier` is typically `{ip_address}` or `{ip_address}:{user_id}` for authenticated requests.

### Fallback Mechanism

The system provides multiple levels of resilience:

1. **Connection Retry** - Limited retries with exponential backoff
2. **Automatic Fallback** - Falls back to in-memory when Redis is unavailable
3. **Error Recovery** - Continues to serve requests even if rate limiting fails

## Configuration

### Environment Variables

```bash
# Redis connection URL
REDIS_URL=redis://localhost:6379  # Local development
REDIS_URL=redis://:<password>@<name>.redis.cache.windows.net:6380?tls=true  # Azure
```

### Azure Cache for Redis Setup

1. Create an Azure Cache for Redis instance
2. Choose appropriate pricing tier (Basic C0 for small deployments)
3. Enable SSL/TLS only connections
4. Configure firewall rules for your App Service
5. Copy the connection string to your environment variables

## Testing

### Unit Tests

Run the rate limiting tests:

```bash
npm test -- src/lib/security/__tests__/rateLimit.test.ts
```

### Integration Testing

Test Redis connection:

```bash
npm run test:redis
```

This will verify:
- Redis connectivity
- Basic operations (SET/GET)
- Sorted set operations (used for rate limiting)
- Server information

### Manual Testing

Test rate limits using curl:

```bash
# Test auth endpoint (5 requests allowed)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test"}' \
    -w "\nStatus: %{http_code}\n"
done
```

## Monitoring

### Rate Limit Headers

All responses include rate limit information:

- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Requests remaining in current window
- `X-RateLimit-Reset` - Time when the limit resets (ISO 8601)
- `Retry-After` - Seconds until next request allowed (429 responses only)

### Logging

The system logs:
- Rate limit exceeded events with client information
- Redis connection status changes
- Fallback to in-memory events
- Redis errors (without exposing sensitive data)

## Production Considerations

### Scaling

- Redis rate limiting works across multiple instances
- Each instance maintains its own connection pool
- Rate limits are enforced globally, not per-instance

### Performance

- Redis operations are performed asynchronously
- Failed Redis operations don't block requests
- In-memory fallback ensures service continuity

### Security

- Rate limits prevent brute force attacks on auth endpoints
- AI endpoints have lower limits to control costs
- Client identification uses IP + user ID when available
- No sensitive data is stored in Redis keys

## Troubleshooting

### Common Issues

1. **Redis Connection Failures**
   - Check REDIS_URL format
   - Verify network connectivity
   - Check firewall rules in Azure
   - Ensure SSL/TLS is enabled for Azure Cache

2. **Rate Limits Not Working**
   - Verify Redis is connected (check logs)
   - Test with `npm run test:redis`
   - Check for multiple instances using same Redis

3. **Performance Issues**
   - Monitor Redis latency
   - Check connection pool settings
   - Consider upgrading Redis tier

### Debug Commands

```bash
# Check Redis connection
REDIS_URL=your-redis-url npm run test:redis

# View rate limiter logs
grep "rate limit" logs/application.log

# Monitor Redis operations (if you have redis-cli)
redis-cli -h your-redis-host -p 6380 -a your-password --tls monitor
```

## Future Enhancements

1. **Rate Limit by API Key** - Support for different limits per API key
2. **Dynamic Configuration** - Update limits without restart
3. **Rate Limit Analytics** - Track usage patterns
4. **Gradual Backoff** - Increase block duration for repeat offenders 
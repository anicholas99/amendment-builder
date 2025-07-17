# 2.7 Caching Architecture

**Last Updated**: January 8, 2025

This document describes the multi-tier caching strategy implemented in the Patent Drafter AI application to improve performance and reduce database load.

## Table of Contents
- [Overview](#overview)
- [Cache Layers](#cache-layers)
- [Cache Manager Implementation](#cache-manager-implementation)
- [Caching Patterns](#caching-patterns)
- [Cache Keys Strategy](#cache-keys-strategy)
- [Cache Invalidation](#cache-invalidation)
- [Monitoring & Debugging](#monitoring--debugging)

---

## Overview

The application implements a sophisticated multi-tier caching system with automatic fallback:

1. **Primary**: Redis (distributed cache)
2. **Fallback**: In-memory cache (node-cache)
3. **Edge**: CDN caching (planned)

This architecture ensures high availability and performance even if Redis is unavailable.

---

## Cache Layers

### Redis Cache (Primary)

```typescript
// Configuration
const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    connectTimeout: 5000,
    reconnectStrategy: (retries) => {
      if (retries > 3) return false;
      return Math.min(retries * 100, 3000);
    }
  }
});

// Features
- Distributed across instances
- Persistent storage option
- TTL support
- Atomic operations
- Pub/sub for invalidation
```

### In-Memory Cache (Fallback)

```typescript
// Configuration
const memoryCache = new NodeCache({
  stdTTL: 600,              // 10 minutes default
  checkperiod: 120,         // Check every 2 minutes
  useClones: false,         // Better performance
  maxKeys: 10000            // Prevent memory issues
});

// Features
- Zero network latency
- Automatic memory management
- Per-instance isolation
- Fast for hot data
```

### Cache Manager

```typescript
export class CacheManager {
  private redis?: RedisClient;
  private memory: NodeCache;
  private useRedis: boolean;

  async get<T>(key: string): Promise<T | null> {
    // Try Redis first
    if (this.useRedis) {
      try {
        const value = await this.redis.get(key);
        if (value) return JSON.parse(value);
      } catch (error) {
        logger.warn('Redis get failed, falling back', { key, error });
      }
    }

    // Fallback to memory
    return this.memory.get<T>(key) || null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const ttlSeconds = ttl || 600; // 10 min default

    // Set in memory first (fast)
    this.memory.set(key, value, ttlSeconds);

    // Then Redis (may fail)
    if (this.useRedis) {
      try {
        await this.redis.setex(
          key, 
          ttlSeconds, 
          JSON.stringify(value)
        );
      } catch (error) {
        logger.warn('Redis set failed', { key, error });
      }
    }
  }
}
```

---

## Caching Patterns

### 1. Cache-Aside Pattern

Most common pattern for database queries:

```typescript
async function getProject(projectId: string, tenantId: string) {
  const cacheKey = `project:${tenantId}:${projectId}`;
  
  // Check cache
  const cached = await cache.get<Project>(cacheKey);
  if (cached) return cached;
  
  // Load from database
  const project = await db.project.findFirst({
    where: { id: projectId, tenantId }
  });
  
  // Cache for future
  if (project) {
    await cache.set(cacheKey, project, 300); // 5 min
  }
  
  return project;
}
```

### 2. Write-Through Pattern

For frequently updated data:

```typescript
async function updateProject(projectId: string, data: UpdateData) {
  // Update database
  const updated = await db.project.update({
    where: { id: projectId },
    data
  });
  
  // Update cache immediately
  const cacheKey = `project:${updated.tenantId}:${projectId}`;
  await cache.set(cacheKey, updated, 300);
  
  return updated;
}
```

### 3. Cache Decorators

Simplified caching with decorators:

```typescript
class ProjectService {
  @Cacheable({
    key: (projectId, tenantId) => `project:${tenantId}:${projectId}`,
    ttl: 300
  })
  async getProject(projectId: string, tenantId: string) {
    return await db.project.findFirst({
      where: { id: projectId, tenantId }
    });
  }

  @CacheEvict({
    key: (projectId, tenantId) => `project:${tenantId}:${projectId}`
  })
  async deleteProject(projectId: string, tenantId: string) {
    return await db.project.delete({
      where: { id: projectId, tenantId }
    });
  }
}
```

### 4. Batch Loading

Efficient caching for multiple items:

```typescript
async function getProjects(projectIds: string[], tenantId: string) {
  const keys = projectIds.map(id => `project:${tenantId}:${id}`);
  
  // Multi-get from cache
  const cached = await cache.mget(keys);
  const hits = cached.filter(Boolean);
  const misses = projectIds.filter((id, i) => !cached[i]);
  
  if (misses.length === 0) return hits;
  
  // Load missing from DB
  const missing = await db.project.findMany({
    where: {
      id: { in: misses },
      tenantId
    }
  });
  
  // Cache missing items
  await Promise.all(
    missing.map(project => 
      cache.set(
        `project:${tenantId}:${project.id}`, 
        project, 
        300
      )
    )
  );
  
  return [...hits, ...missing];
}
```

---

## Cache Keys Strategy

### Naming Convention

```typescript
// Pattern: {resource}:{tenantId}:{identifier}:{version?}
const patterns = {
  // Single resources
  project: 'project:{tenantId}:{projectId}',
  user: 'user:{userId}',
  claim: 'claim:{tenantId}:{claimId}:v{version}',
  
  // Collections
  projectList: 'projects:{tenantId}:page:{page}:size:{size}',
  searchResults: 'search:{tenantId}:{queryHash}',
  
  // Computed data
  statistics: 'stats:{tenantId}:{type}:{date}',
  analysis: 'analysis:{projectId}:{analysisId}',
  
  // System
  config: 'config:{key}',
  feature: 'feature:{flag}'
};
```

### Key Generation Utilities

```typescript
export const cacheKeys = {
  project: (tenantId: string, projectId: string) => 
    `project:${tenantId}:${projectId}`,
    
  projectList: (tenantId: string, params: ListParams) => 
    `projects:${tenantId}:${hashObject(params)}`,
    
  userSession: (userId: string, sessionId: string) =>
    `session:${userId}:${sessionId}`,
    
  searchResults: (tenantId: string, query: string) =>
    `search:${tenantId}:${createHash('md5').update(query).digest('hex')}`
};
```

---

## Cache Invalidation

### Invalidation Strategies

#### 1. TTL-Based Expiration
```typescript
const ttlConfig = {
  // Frequently changing
  activeUsers: 60,        // 1 minute
  statistics: 300,        // 5 minutes
  
  // Moderately stable
  projects: 600,          // 10 minutes
  userProfile: 1800,      // 30 minutes
  
  // Rarely changing
  configuration: 3600,    // 1 hour
  tenantSettings: 86400   // 24 hours
};
```

#### 2. Event-Based Invalidation
```typescript
// On data mutation
async function updateProject(projectId: string, data: UpdateData) {
  const result = await db.project.update({ where: { id: projectId }, data });
  
  // Invalidate specific key
  await cache.delete(`project:${result.tenantId}:${projectId}`);
  
  // Invalidate related lists
  await cache.deletePattern(`projects:${result.tenantId}:*`);
  
  // Publish invalidation event
  await pubsub.publish('cache.invalidate', {
    pattern: `project:${result.tenantId}:*`
  });
  
  return result;
}
```

#### 3. Pattern-Based Invalidation
```typescript
export async function invalidateTenantCache(tenantId: string) {
  // Redis supports pattern deletion
  if (cache.isRedisAvailable()) {
    const keys = await cache.keys(`*:${tenantId}:*`);
    if (keys.length > 0) {
      await cache.del(...keys);
    }
  } else {
    // Memory cache requires manual tracking
    cache.flushAll(); // Nuclear option
  }
}
```

### Cache Warming

Pre-populate cache for better performance:

```typescript
export async function warmCache(tenantId: string) {
  // Load frequently accessed data
  const [projects, settings, users] = await Promise.all([
    db.project.findMany({ where: { tenantId }, take: 100 }),
    db.tenantSettings.findUnique({ where: { tenantId } }),
    db.user.findMany({ where: { tenantId }, take: 50 })
  ]);
  
  // Populate cache
  await Promise.all([
    ...projects.map(p => 
      cache.set(`project:${tenantId}:${p.id}`, p, 600)
    ),
    cache.set(`settings:${tenantId}`, settings, 3600),
    ...users.map(u => 
      cache.set(`user:${u.id}`, u, 1800)
    )
  ]);
}
```

---

## Monitoring & Debugging

### Cache Metrics

```typescript
interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  hitRate: number;
  avgLoadTime: number;
  memoryUsage: number;
}

// Collect metrics
cache.on('hit', (key) => metrics.hits++);
cache.on('miss', (key) => metrics.misses++);
cache.on('set', (key) => metrics.sets++);
cache.on('del', (key) => metrics.deletes++);
cache.on('error', (err) => metrics.errors++);
```

### Debug Endpoints

```typescript
// Development only
if (process.env.NODE_ENV === 'development') {
  app.get('/api/debug/cache/stats', async (req, res) => {
    const stats = await cache.getStats();
    res.json({
      ...stats,
      hitRate: (stats.hits / (stats.hits + stats.misses)) * 100,
      keys: await cache.keys('*').length
    });
  });
  
  app.delete('/api/debug/cache/flush', async (req, res) => {
    await cache.flushAll();
    res.json({ success: true });
  });
}
```

### Logging

```typescript
// Cache operations logging
logger.debug('Cache hit', { key, latency: Date.now() - start });
logger.debug('Cache miss', { key, reason: 'not_found' });
logger.warn('Cache error', { operation: 'get', key, error });

// Performance logging
if (loadTime > 1000) {
  logger.warn('Slow cache operation', { 
    operation, 
    key, 
    duration: loadTime 
  });
}
```

---

## Best Practices

1. **Choose appropriate TTLs** - Balance freshness vs performance
2. **Use consistent key patterns** - Makes invalidation easier
3. **Handle cache failures gracefully** - Always have fallback logic
4. **Monitor hit rates** - Aim for >80% for frequently accessed data
5. **Implement cache warming** - For predictable access patterns
6. **Avoid cache stampede** - Use locks or probabilistic expiration
7. **Size your cache appropriately** - Monitor memory usage
8. **Test cache invalidation** - Ensure data consistency

---

This caching architecture provides a robust, performant, and resilient caching layer that significantly improves application performance while maintaining data consistency.
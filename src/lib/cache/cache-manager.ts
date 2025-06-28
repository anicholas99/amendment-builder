import { logger } from '@/lib/monitoring/logger';
import { perfLogger } from '@/lib/monitoring/enhanced-logger';
import { environment } from '@/config/environment';
import Redis from 'ioredis';

import { ApplicationError, ErrorCode } from '@/lib/error';

// Cache entry interface
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  tags?: string[];
  etag?: string;
}

// Cache options
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Tags for cache invalidation
  etag?: string; // ETag for conditional requests
}

// Abstract cache provider
export abstract class CacheProvider {
  abstract get<T>(key: string): Promise<T | null>;
  abstract set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
  abstract delete(key: string): Promise<void>;
  abstract deleteByTag(tag: string): Promise<void>;
  abstract clear(): Promise<void>;
  abstract has(key: string): Promise<boolean>;
  abstract size(): Promise<number>;
}

// In-memory cache provider
export class InMemoryCacheProvider extends CacheProvider {
  private cache = new Map<string, CacheEntry<unknown>>();
  private tagIndex = new Map<string, Set<string>>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.timestamp + entry.ttl * 1000) {
      await this.delete(key);
      return null;
    }

    return entry.data as T;
  }

  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const ttl = options.ttl || 3600; // Default 1 hour
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl,
      tags: options.tags,
      etag: options.etag,
    };

    this.cache.set(key, entry);

    // Update tag index
    if (options.tags) {
      for (const tag of options.tags) {
        if (!this.tagIndex.has(tag)) {
          this.tagIndex.set(tag, new Set());
        }
        this.tagIndex.get(tag)!.add(key);
      }
    }

    // Cleanup expired entries periodically
    if (this.cache.size % 100 === 0) {
      this.cleanup();
    }
  }

  async delete(key: string): Promise<void> {
    const entry = this.cache.get(key);
    if (entry?.tags) {
      for (const tag of entry.tags) {
        this.tagIndex.get(tag)?.delete(key);
      }
    }
    this.cache.delete(key);
  }

  async deleteByTag(tag: string): Promise<void> {
    const keys = this.tagIndex.get(tag);
    if (keys) {
      for (const key of Array.from(keys)) {
        await this.delete(key);
      }
      this.tagIndex.delete(tag);
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.tagIndex.clear();
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  async size(): Promise<number> {
    return this.cache.size;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (now > entry.timestamp + entry.ttl * 1000) {
        this.delete(key);
      }
    }
  }
}

// Redis cache provider (simplified - would need redis client)
export class RedisCacheProvider extends CacheProvider {
  private redis: Redis | null = null;
  private fallback = new InMemoryCacheProvider();
  private connected = false;

  constructor(private redisUrl?: string) {
    super();
    if (!redisUrl) {
      logger.warn('Redis URL not provided, using in-memory fallback');
    } else {
      this.initializeRedis(redisUrl);
    }
  }

  private async initializeRedis(redisUrl: string): Promise<void> {
    try {
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        connectTimeout: 10000,
        lazyConnect: false,
        retryStrategy: (times: number) => {
          if (times > 3) {
            logger.error('Redis cache connection failed after 3 retries');
            return null;
          }
          return Math.min(times * 50, 2000);
        },
      });

      this.redis.on('error', err => {
        logger.error('Redis cache error:', err);
        this.connected = false;
      });

      this.redis.on('connect', () => {
        logger.info('Redis cache connected successfully');
        this.connected = true;
      });

      this.redis.on('ready', () => {
        logger.info('Redis cache ready');
        this.connected = true;
      });

      this.redis.on('close', () => {
        logger.warn('Redis cache connection closed');
        this.connected = false;
      });

      // Test the connection
      await this.redis.ping();
      this.connected = true;
    } catch (error) {
      logger.error('Failed to initialize Redis cache:', error);
      if (this.redis) {
        this.redis.disconnect();
        this.redis = null;
      }
      this.connected = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.connected || !this.redis) {
      return this.fallback.get<T>(key);
    }

    try {
      const data = await this.redis.get(key);
      if (!data) return null;

      const entry: CacheEntry<T> = JSON.parse(data);

      // Check if expired
      if (Date.now() > entry.timestamp + entry.ttl * 1000) {
        await this.delete(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      logger.error('Redis cache get error:', error);
      return this.fallback.get<T>(key);
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    if (!this.connected || !this.redis) {
      return this.fallback.set(key, value, options);
    }

    try {
      const ttl = options?.ttl || 3600;
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl,
        tags: options?.tags,
        etag: options?.etag,
      };

      await this.redis.setex(key, ttl, JSON.stringify(entry));

      // Handle tags
      if (options?.tags) {
        for (const tag of options.tags) {
          await this.redis.sadd(`tag:${tag}`, key);
          await this.redis.expire(`tag:${tag}`, ttl);
        }
      }
    } catch (error) {
      logger.error('Redis cache set error:', error);
      return this.fallback.set(key, value, options);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.connected || !this.redis) {
      return this.fallback.delete(key);
    }

    try {
      // Get the entry to check for tags
      const data = await this.redis.get(key);
      if (data) {
        const entry: CacheEntry<unknown> = JSON.parse(data);
        if (entry.tags) {
          for (const tag of entry.tags) {
            await this.redis.srem(`tag:${tag}`, key);
          }
        }
      }

      await this.redis.del(key);
    } catch (error) {
      logger.error('Redis cache delete error:', error);
      await this.fallback.delete(key);
    }
  }

  async deleteByTag(tag: string): Promise<void> {
    if (!this.connected || !this.redis) {
      return this.fallback.deleteByTag(tag);
    }

    try {
      const keys = await this.redis.smembers(`tag:${tag}`);
      if (keys.length > 0) {
        await Promise.all(keys.map(key => this.delete(key)));
        await this.redis.del(`tag:${tag}`);
      }
    } catch (error) {
      logger.error('Redis cache deleteByTag error:', error);
      await this.fallback.deleteByTag(tag);
    }
  }

  async clear(): Promise<void> {
    if (!this.connected || !this.redis) {
      return this.fallback.clear();
    }

    try {
      await this.redis.flushdb();
    } catch (error) {
      logger.error('Redis cache clear error:', error);
      await this.fallback.clear();
    }
  }

  async has(key: string): Promise<boolean> {
    if (!this.connected || !this.redis) {
      return this.fallback.has(key);
    }

    try {
      const exists = await this.redis.exists(key);
      return exists === 1;
    } catch (error) {
      logger.error('Redis cache has error:', error);
      return this.fallback.has(key);
    }
  }

  async size(): Promise<number> {
    if (!this.connected || !this.redis) {
      return this.fallback.size();
    }

    try {
      const dbSize = await this.redis.dbsize();
      return dbSize;
    } catch (error) {
      logger.error('Redis cache size error:', error);
      return this.fallback.size();
    }
  }

  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
      this.connected = false;
    }
  }
}

// Cache key builder
export class CacheKeyBuilder {
  private parts: string[] = [];

  constructor(private namespace: string) {
    this.parts.push(namespace);
  }

  add(part: string | number): CacheKeyBuilder {
    this.parts.push(String(part));
    return this;
  }

  addIf(condition: boolean, part: string | number): CacheKeyBuilder {
    if (condition) {
      this.parts.push(String(part));
    }
    return this;
  }

  build(): string {
    return this.parts.join(':');
  }

  static create(namespace: string): CacheKeyBuilder {
    return new CacheKeyBuilder(namespace);
  }
}

// Cache manager with multiple strategies
export class CacheManager {
  private providers: Map<string, CacheProvider> = new Map();
  private defaultProvider: CacheProvider;

  constructor() {
    // Initialize providers
    const inMemory = new InMemoryCacheProvider();
    const redis = new RedisCacheProvider(environment.redis.url);

    this.providers.set('memory', inMemory);
    this.providers.set('redis', redis);

    // Set default provider based on environment
    this.defaultProvider = environment.redis.url ? redis : inMemory;
  }

  // Get with automatic caching
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    perfLogger.start(`cache:get:${key}`);

    try {
      // Try to get from cache
      const cached = await this.get<T>(key);
      if (cached !== null) {
        perfLogger.end(`cache:get:${key}`, { hit: true });
        return cached;
      }

      // Cache miss - execute factory
      perfLogger.end(`cache:get:${key}`, { hit: false });
      perfLogger.start(`cache:factory:${key}`);

      const value = await factory();

      perfLogger.end(`cache:factory:${key}`);

      // Store in cache
      await this.set(key, value, options);

      return value;
    } catch (error) {
      perfLogger.end(`cache:get:${key}`, { error: true });
      throw error;
    }
  }

  // Standard cache operations
  async get<T>(key: string, provider?: string): Promise<T | null> {
    const cacheProvider = provider
      ? this.providers.get(provider)
      : this.defaultProvider;
    if (!cacheProvider) {
      throw new ApplicationError(
        ErrorCode.CACHE_INVALIDATION_ERROR,
        `Cache provider '${provider}' not found`
      );
    }
    return cacheProvider.get<T>(key);
  }

  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {},
    provider?: string
  ): Promise<void> {
    const cacheProvider = provider
      ? this.providers.get(provider)
      : this.defaultProvider;
    if (!cacheProvider) {
      throw new ApplicationError(
        ErrorCode.CACHE_INVALIDATION_ERROR,
        `Cache provider '${provider}' not found`
      );
    }
    return cacheProvider.set(key, value, options);
  }

  async delete(key: string, provider?: string): Promise<void> {
    const cacheProvider = provider
      ? this.providers.get(provider)
      : this.defaultProvider;
    if (!cacheProvider) {
      throw new ApplicationError(
        ErrorCode.CACHE_INVALIDATION_ERROR,
        `Cache provider '${provider}' not found`
      );
    }
    return cacheProvider.delete(key);
  }

  async deleteByTag(tag: string, provider?: string): Promise<void> {
    const cacheProvider = provider
      ? this.providers.get(provider)
      : this.defaultProvider;
    if (!cacheProvider) {
      throw new ApplicationError(
        ErrorCode.CACHE_INVALIDATION_ERROR,
        `Cache provider '${provider}' not found`
      );
    }
    return cacheProvider.deleteByTag(tag);
  }

  async clear(provider?: string): Promise<void> {
    if (provider) {
      const cacheProvider = this.providers.get(provider);
      if (!cacheProvider) {
        throw new ApplicationError(
          ErrorCode.CACHE_INVALIDATION_ERROR,
          'Cache provider not found'
        );
      }
      return cacheProvider.clear();
    }

    // Clear all providers
    for (const provider of Array.from(this.providers.values())) {
      await provider.clear();
    }
  }

  // Cache invalidation helpers
  async invalidateProject(projectId: string): Promise<void> {
    await this.deleteByTag(`project:${projectId}`);
  }

  async invalidateTenant(tenantId: string): Promise<void> {
    await this.deleteByTag(`tenant:${tenantId}`);
  }

  async invalidateUser(userId: string): Promise<void> {
    await this.deleteByTag(`user:${userId}`);
  }

  // Cache warming
  async warm(
    keys: string[],
    factory: (key: string) => Promise<unknown>
  ): Promise<void> {
    const promises = keys.map(async key => {
      try {
        const cached = await this.get(key);
        if (!cached) {
          const value = await factory(key);
          await this.set(key, value);
        }
      } catch (error) {
        logger.error(`Failed to warm cache for key: ${key}`, { error });
      }
    });

    await Promise.all(promises);
  }

  // Cache statistics
  async getStats(provider?: string): Promise<{
    provider: string;
    size: number;
    hitRate?: number;
    missRate?: number;
  }> {
    const cacheProvider = provider
      ? this.providers.get(provider)
      : this.defaultProvider;
    if (!cacheProvider) {
      throw new ApplicationError(
        ErrorCode.CACHE_INVALIDATION_ERROR,
        `Cache provider '${provider}' not found`
      );
    }

    const size = await cacheProvider.size();

    return {
      provider: provider || 'default',
      size,
      // Hit/miss rates would be tracked separately
    };
  }
}

// Singleton instance
let cacheManager: CacheManager | null = null;

export function getCacheManager(): CacheManager {
  if (!cacheManager) {
    cacheManager = new CacheManager();
  }
  return cacheManager;
}

// Cache decorators
export function Cacheable(options: CacheOptions = {}) {
  return function (
    target: object,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const cache = getCacheManager();
      const key = CacheKeyBuilder.create(
        `${target.constructor.name}:${propertyName}`
      )
        .add(JSON.stringify(args))
        .build();

      return cache.getOrSet(key, () => method.apply(this, args), options);
    };

    return descriptor;
  };
}

export function CacheEvict(tags: string[]) {
  return function (
    target: object,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const result = await method.apply(this, args);

      const cache = getCacheManager();
      for (const tag of tags) {
        await cache.deleteByTag(tag);
      }

      return result;
    };

    return descriptor;
  };
}

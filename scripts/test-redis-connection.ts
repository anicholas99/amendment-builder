#!/usr/bin/env node
/**
 * Test Redis Connection Script
 * 
 * This script tests the Redis connection and basic operations.
 * Use this to verify your Redis setup for rate limiting and caching.
 * 
 * Usage: 
 *   npm run test:redis
 *   or
 *   REDIS_URL=redis://localhost:6379 npm run test:redis
 */

import Redis from 'ioredis';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const REDIS_URL = process.env.REDIS_URL;

async function testRedisConnection() {
  console.log('🔍 Testing Redis Connection...\n');

  if (!REDIS_URL) {
    console.log('❌ REDIS_URL environment variable not set');
    console.log('ℹ️  Redis is optional - the application will use in-memory fallback');
    console.log('ℹ️  To use Redis, set REDIS_URL in your .env.local file');
    console.log('\nExample configurations:');
    console.log('  Local Redis:       REDIS_URL=redis://localhost:6379');
    console.log('  Azure Cache:       REDIS_URL=redis://:<password>@<name>.redis.cache.windows.net:6380?tls=true');
    return;
  }

  console.log(`📡 Connecting to: ${REDIS_URL.replace(/:[^:@]+@/, ':****@')}\n`);

  let redis: Redis | null = null;

  try {
    redis = new Redis(REDIS_URL, {
      connectTimeout: 10000,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // Don't retry for this test
    });

    // Test connection
    console.log('1️⃣  Testing PING...');
    const pong = await redis.ping();
    console.log(`✅ PING successful: ${pong}\n`);

    // Test basic operations
    console.log('2️⃣  Testing SET/GET operations...');
    const testKey = 'test:connection';
    const testValue = { timestamp: new Date().toISOString(), test: true };
    
    await redis.setex(testKey, 60, JSON.stringify(testValue));
    console.log('✅ SET operation successful');
    
    const retrieved = await redis.get(testKey);
    const parsed = JSON.parse(retrieved!);
    console.log('✅ GET operation successful:', parsed, '\n');

    // Test rate limiting operations
    console.log('3️⃣  Testing rate limiting operations (sorted sets)...');
    const rateLimitKey = 'ratelimit:test';
    const now = Date.now();
    
    await redis.zadd(rateLimitKey, now, `${now}-test`);
    const count = await redis.zcard(rateLimitKey);
    console.log(`✅ Sorted set operations successful. Count: ${count}\n`);

    // Cleanup
    await redis.del(testKey, rateLimitKey);
    console.log('🧹 Test keys cleaned up\n');

    // Show connection info
    console.log('📊 Redis Server Info:');
    const info = await redis.info('server');
    const versionMatch = info.match(/redis_version:(.+)/);
    if (versionMatch) {
      console.log(`   Version: ${versionMatch[1].trim()}`);
    }

    console.log('\n✅ All tests passed! Redis is properly configured for rate limiting.');
    
  } catch (error) {
    console.error('❌ Redis connection failed:', error instanceof Error ? error.message : String(error));
    console.log('\nℹ️  The application will still work using in-memory fallback');
    console.log('ℹ️  Check your Redis connection string and ensure Redis is running');
    
    if (REDIS_URL.includes('azure')) {
      console.log('\n💡 Azure Cache for Redis tips:');
      console.log('   - Ensure SSL/TLS is enabled (use port 6380)');
      console.log('   - Check firewall rules allow your IP');
      console.log('   - Verify the access key is correct');
    }
  } finally {
    if (redis) {
      await redis.quit();
      console.log('\n👋 Connection closed');
    }
  }
}

// Run the test
testRedisConnection().catch(console.error); 
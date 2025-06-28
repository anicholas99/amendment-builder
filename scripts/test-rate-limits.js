#!/usr/bin/env node

/**
 * Script to simulate high load and multiple tab refreshes
 * Run with: node scripts/test-rate-limits.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const CONCURRENT_TABS = 5; // Simulate 5 browser tabs
const REQUESTS_PER_TAB = 20; // Each tab makes 20 requests
const DELAY_BETWEEN_REQUESTS = 50; // 50ms between requests in each tab

// Endpoints that are typically called on page refresh
const PAGE_LOAD_ENDPOINTS = [
  '/api/csrf-token',
  '/api/auth/session',
  '/api/projects?page=1&limit=20&filterBy=all&sortBy=modified&sortOrder=desc',
  '/api/tenants/user',
];

/**
 * Make an HTTP request and return timing info
 */
function makeRequest(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const endTime = Date.now();
        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          duration: endTime - startTime,
          retryAfter: res.headers['retry-after'],
        });
      });
    }).on('error', (err) => {
      resolve({
        url,
        status: 0,
        error: err.message,
        duration: Date.now() - startTime,
      });
    });
  });
}

/**
 * Simulate a browser tab refreshing
 */
async function simulateTabRefresh(tabId) {
  console.log(`\n[Tab ${tabId}] Starting refresh simulation...`);
  const results = [];
  
  for (let i = 0; i < REQUESTS_PER_TAB; i++) {
    console.log(`[Tab ${tabId}] Request batch ${i + 1}/${REQUESTS_PER_TAB}`);
    
    // Make all page load requests in parallel (like a real page refresh)
    const batchPromises = PAGE_LOAD_ENDPOINTS.map(endpoint => 
      makeRequest(BASE_URL + endpoint)
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Log any rate limits
    batchResults.forEach(result => {
      if (result.status === 429) {
        console.log(`[Tab ${tabId}] ⚠️  RATE LIMITED: ${result.url} (Retry after: ${result.retryAfter}s)`);
      } else if (result.status !== 200 && result.status !== 304) {
        console.log(`[Tab ${tabId}] ❌ ERROR ${result.status}: ${result.url}`);
      }
    });
    
    // Small delay between refreshes
    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
  }
  
  return results;
}

/**
 * Generate statistics from results
 */
function generateStats(allResults) {
  const stats = {
    total: allResults.length,
    successful: allResults.filter(r => r.status === 200 || r.status === 304).length,
    rateLimited: allResults.filter(r => r.status === 429).length,
    errors: allResults.filter(r => r.status !== 200 && r.status !== 304 && r.status !== 429).length,
    byEndpoint: {},
  };
  
  // Group by endpoint
  PAGE_LOAD_ENDPOINTS.forEach(endpoint => {
    const endpointResults = allResults.filter(r => r.url.includes(endpoint));
    stats.byEndpoint[endpoint] = {
      total: endpointResults.length,
      successful: endpointResults.filter(r => r.status === 200 || r.status === 304).length,
      rateLimited: endpointResults.filter(r => r.status === 429).length,
      avgDuration: Math.round(endpointResults.reduce((sum, r) => sum + r.duration, 0) / endpointResults.length),
    };
  });
  
  return stats;
}

/**
 * Main test runner
 */
async function main() {
  console.log('🚀 Starting rate limit test...');
  console.log(`📊 Simulating ${CONCURRENT_TABS} tabs, ${REQUESTS_PER_TAB} requests each`);
  console.log(`🎯 Total requests: ${CONCURRENT_TABS * REQUESTS_PER_TAB * PAGE_LOAD_ENDPOINTS.length}`);
  console.log(`🔗 Target: ${BASE_URL}`);
  console.log('');
  
  const startTime = Date.now();
  
  // Run all tabs concurrently
  const tabPromises = Array.from({ length: CONCURRENT_TABS }, (_, i) => 
    simulateTabRefresh(i + 1)
  );
  
  const allResults = (await Promise.all(tabPromises)).flat();
  const duration = Date.now() - startTime;
  
  // Generate and display statistics
  const stats = generateStats(allResults);
  
  console.log('\n\n📈 TEST RESULTS:');
  console.log('================');
  console.log(`Total Duration: ${(duration / 1000).toFixed(2)}s`);
  console.log(`Total Requests: ${stats.total}`);
  console.log(`✅ Successful: ${stats.successful} (${((stats.successful / stats.total) * 100).toFixed(1)}%)`);
  console.log(`⚠️  Rate Limited: ${stats.rateLimited} (${((stats.rateLimited / stats.total) * 100).toFixed(1)}%)`);
  console.log(`❌ Errors: ${stats.errors} (${((stats.errors / stats.total) * 100).toFixed(1)}%)`);
  
  console.log('\n📊 BY ENDPOINT:');
  Object.entries(stats.byEndpoint).forEach(([endpoint, endpointStats]) => {
    console.log(`\n${endpoint}:`);
    console.log(`  Total: ${endpointStats.total}`);
    console.log(`  Success: ${endpointStats.successful} (${((endpointStats.successful / endpointStats.total) * 100).toFixed(1)}%)`);
    console.log(`  Rate Limited: ${endpointStats.rateLimited}`);
    console.log(`  Avg Duration: ${endpointStats.avgDuration}ms`);
  });
  
  console.log('\n✅ Test completed!');
  
  if (stats.rateLimited > 0) {
    console.log('\n⚠️  RECOMMENDATION: Some requests were rate limited.');
    console.log('This is expected behavior - the app should handle these gracefully with retries.');
  }
}

// Run the test
main().catch(console.error); 
/**
 * Script to test Content Security Policy configuration
 * Run with: npx tsx scripts/test-csp.ts
 */

import { buildCSPHeader, getCSPConfig, getCSPReportOnlyConfig } from '../src/lib/security/csp';

console.log('Testing CSP Configuration\n');

// Test secure CSP (without unsafe-inline)
console.log('Secure CSP (Production):');
const secureCSP = getCSPConfig();
console.log(secureCSP.value);
console.log('\n');

// Test Report-Only CSP
console.log('Report-Only CSP (Testing):');
const reportOnlyCSP = getCSPReportOnlyConfig();
console.log(reportOnlyCSP.value);
console.log('\n');

// Show what's being blocked
console.log('What this CSP blocks:');
console.log('- ❌ Inline scripts without nonce');
console.log('- ❌ Inline styles without nonce');  
console.log('- ❌ eval() and similar functions');
console.log('- ❌ Scripts from untrusted domains');
console.log('- ❌ Styles from untrusted domains');
console.log('- ❌ Iframes (frame-src: none)');
console.log('- ❌ Plugins/Flash (object-src: none)');
console.log('\n');

console.log('What this CSP allows:');
console.log('- ✅ Scripts from same origin');
console.log('- ✅ Styles from same origin');
console.log('- ✅ Images from same origin + data: + blob: + https:');
console.log('- ✅ Fonts from Google Fonts');
console.log('- ✅ API calls to configured domains');
console.log('- ✅ WebSocket connections');
console.log('\n');

console.log('Migration steps:');
console.log('1. Add report-only CSP to next.config.js');
console.log('2. Monitor /api/csp-report for violations');
console.log('3. Fix components causing violations');
console.log('4. Switch to enforcing CSP when clean');

// Test with nonce (for migration period)
console.log('\n\nCSP with nonce (migration helper):');
const nonce = 'test-nonce-123';
const cspWithNonce = buildCSPHeader(nonce);
console.log(cspWithNonce); 
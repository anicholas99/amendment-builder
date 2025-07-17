#!/usr/bin/env tsx

import { executeTool } from '../src/server/tools/toolExecutor';
import { logger } from '../src/server/logger';

async function testPhase1Tools() {
  // Test project and tenant IDs (you'll need to update these)
  const projectId = process.env.TEST_PROJECT_ID || 'test-project-id';
  const tenantId = process.env.TEST_TENANT_ID || 'test-tenant-id';

  logger.info('Testing Phase 1 Patent Tools', { projectId, tenantId });

  try {
    // Test 1: Filing Fee Calculator
    logger.info('\n=== Testing Filing Fee Calculator ===');
    const feeResult = await executeTool('calculateFilingFees', {
      projectId,
      tenantId,
      entityType: 'large',
    });
    
    if (feeResult.success) {
      logger.info('Filing Fee Result:', { data: feeResult.data });
    } else {
      logger.error('Filing Fee Error:', { error: feeResult.error });
    }

    // Test 2: Auto Renumber Claims
    logger.info('\n=== Testing Auto Renumber Claims ===');
    const renumberResult = await executeTool('autoRenumberClaims', {
      projectId,
      tenantId,
    });
    
    if (renumberResult.success) {
      logger.info('Renumber Result:', { data: renumberResult.data });
    } else {
      logger.error('Renumber Error:', { error: renumberResult.error });
    }

    // Test 3: §112(b) Support Checker
    logger.info('\n=== Testing §112(b) Support Checker ===');
    const supportResult = await executeTool('check112Support', {
      projectId,
      tenantId,
    });
    
    if (supportResult.success) {
      logger.info('Support Check Result:', { data: supportResult.data });
    } else {
      logger.error('Support Check Error:', { error: supportResult.error });
    }

    logger.info('\n✅ Phase 1 tools test completed!');
  } catch (error) {
    logger.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testPhase1Tools().catch(console.error); 
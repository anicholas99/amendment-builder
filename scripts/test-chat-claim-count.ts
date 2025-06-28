import { getInventionContextForChat } from '../src/repositories/chatRepository';
import { logger } from '../src/lib/monitoring/logger';

async function testClaimCount() {
  // Replace with your actual project ID and tenant ID
  const projectId = process.argv[2];
  const tenantId = process.argv[3];

  if (!projectId || !tenantId) {
    console.error('Usage: ts-node scripts/test-chat-claim-count.ts <projectId> <tenantId>');
    process.exit(1);
  }

  try {
    console.log(`\nTesting claim count for project: ${projectId}`);
    console.log(`Tenant: ${tenantId}\n`);

    const context = await getInventionContextForChat(projectId, tenantId);

    if (!context) {
      console.log('❌ No context found - project not found or access denied');
      return;
    }

    console.log('✅ Context loaded successfully');
    console.log(`Project: ${context.project.name}`);
    console.log(`Has Invention: ${!!context.invention}`);
    console.log(`\n📊 CLAIM COUNT: ${context.claims.length}`);
    
    if (context.claims.length > 0) {
      console.log('\nClaim Details:');
      context.claims.forEach(claim => {
        console.log(`  - Claim ${claim.number}: ${claim.text.substring(0, 50)}...`);
      });
    } else {
      console.log('\n⚠️  No claims found');
      if (!context.invention) {
        console.log('   Reason: No invention record exists');
      } else {
        console.log('   Reason: Invention exists but has no claims linked');
      }
    }

    // Show what the AI would see
    console.log('\n🤖 What the AI sees in system prompt:');
    console.log(`### Current Claims (${context.claims.length} total):`);
    if (context.claims.length > 0) {
      context.claims.forEach(claim => {
        console.log(`\nClaim ${claim.number}:\n${claim.text}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }

  process.exit(0);
}

testClaimCount(); 
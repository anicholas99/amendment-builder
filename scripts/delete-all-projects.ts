import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/monitoring/logger';

const prisma = new PrismaClient();

async function deleteAllProjects() {
  try {
    console.log('⚠️  WARNING: This will delete ALL projects and related data!');
    console.log('Press Ctrl+C to cancel or wait 5 seconds to continue...\n');
    
    // Give user time to cancel
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('Deleting all project data...\n');
    
    // Delete in correct order to avoid foreign key constraints
    console.log('1. Deleting citation matches...');
    const citationMatches = await prisma.citationMatch.deleteMany({});
    console.log(`   ✓ Deleted ${citationMatches.count} citation matches`);
    
    console.log('2. Deleting citation results...');
    const citationResults = await prisma.citationResult.deleteMany({});
    console.log(`   ✓ Deleted ${citationResults.count} citation results`);
    
    console.log('3. Deleting citation jobs...');
    const citationJobs = await prisma.citationJob.deleteMany({});
    console.log(`   ✓ Deleted ${citationJobs.count} citation jobs`);
    
    console.log('4. Deleting chat messages...');
    const chatMessages = await prisma.chatMessage.deleteMany({});
    console.log(`   ✓ Deleted ${chatMessages.count} chat messages`);
    
    console.log('5. Deleting search histories...');
    const searchHistories = await prisma.searchHistory.deleteMany({});
    console.log(`   ✓ Deleted ${searchHistories.count} search histories`);
    
    console.log('6. Deleting claims...');
    const claims = await prisma.claim.deleteMany({});
    console.log(`   ✓ Deleted ${claims.count} claims`);
    
    console.log('7. Deleting saved prior art...');
    const savedPriorArt = await prisma.savedPriorArt.deleteMany({});
    console.log(`   ✓ Deleted ${savedPriorArt.count} saved prior art entries`);
    
    console.log('8. Deleting project exclusions...');
    const projectExclusions = await prisma.projectExclusion.deleteMany({});
    console.log(`   ✓ Deleted ${projectExclusions.count} project exclusions`);
    
    console.log('9. Deleting projects...');
    const projects = await prisma.project.deleteMany({});
    console.log(`   ✓ Deleted ${projects.count} projects`);
    
    console.log('\n✅ Successfully cleaned the database!');
    console.log('You now have a fresh start with no legacy data.');
    
  } catch (error) {
    console.error('❌ Error deleting projects:', error);
    logger.error('Failed to delete projects', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
deleteAllProjects(); 
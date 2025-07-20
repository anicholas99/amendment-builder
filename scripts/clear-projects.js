const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper function to safely delete from a table
async function safeDeleteFromTable(tableName, prismaModel) {
  try {
    if (!prismaModel) {
      console.log(`ℹ️  Model for ${tableName} not available, skipping`);
      return 0;
    }
    
    const count = await prismaModel.count();
    if (count > 0) {
      await prismaModel.deleteMany({});
      console.log(`✅ Deleted ${count} ${tableName} records`);
      return count;
    } else {
      console.log(`ℹ️  No ${tableName} records to delete`);
      return 0;
    }
  } catch (error) {
    if (error.code === 'P2021') {
      console.log(`ℹ️  Table ${tableName} does not exist, skipping`);
      return 0;
    } else {
      console.error(`❌ Error deleting from ${tableName}:`, error.message);
      throw error;
    }
  }
}

async function clearAllProjects() {
  try {
    console.log('🚀 Starting project data cleanup...');
    
    // Get count of projects before deletion
    const projectCount = await prisma.project.count();
    console.log(`📊 Found ${projectCount} projects to delete`);
    
    if (projectCount === 0) {
      console.log('✅ No projects found to delete');
      return;
    }
    
    // Delete related data first (in order of dependencies - child tables first)
    console.log('🗑️  Deleting related data...');
    
    // List of tables to delete from, in dependency order (child tables first)
    // Only include models that are likely to exist
    const tablesToDelete = [
      { name: 'chat messages', model: prisma.chatMessage },
      { name: 'search history', model: prisma.searchHistory },
      { name: 'citation jobs', model: prisma.citationJob },
      { name: 'citation matches', model: prisma.citationMatch },
      { name: 'citation results', model: prisma.citationResult },
      { name: 'saved citations', model: prisma.savedCitation },
      { name: 'saved prior art', model: prisma.savedPriorArt },
      { name: 'prior art analysis cache', model: prisma.priorArtAnalysisCache },
      { name: 'patentability scores', model: prisma.patentabilityScore },
      { name: 'project figures', model: prisma.projectFigure },
      { name: 'project images', model: prisma.projectImage },
      { name: 'project exclusions', model: prisma.projectExclusion },
      { name: 'project collaborators', model: prisma.projectCollaborator },
      { name: 'project documents', model: prisma.projectDocument },
      { name: 'draft documents', model: prisma.draftDocument },
      { name: 'office action summaries', model: prisma.officeActionSummary },
      { name: 'office actions', model: prisma.officeAction },
      { name: 'prosecution events', model: prisma.prosecutionEvent },
      { name: 'rejections', model: prisma.rejection },
      { name: 'rejection analysis results', model: prisma.rejectionAnalysisResult },
      { name: 'strategy recommendations', model: prisma.strategyRecommendation },
      { name: 'amendment project files', model: prisma.amendmentProjectFile },
      { name: 'amendment projects', model: prisma.amendmentProject },
      { name: 'inventions', model: prisma.invention },
      { name: 'claim versions', model: prisma.claimVersion },
      { name: 'claim snapshots', model: prisma.claimSnapshot },
      { name: 'claim validations', model: prisma.claimValidation },
      { name: 'claims', model: prisma.claim },
      { name: 'elements', model: prisma.element },
      { name: 'figure elements', model: prisma.figureElement },
      { name: 'patent claim versions', model: prisma.patentClaimVersion },
      { name: 'patent applications', model: prisma.patentApplication },
      { name: 'application versions', model: prisma.applicationVersion },
      { name: 'documents', model: prisma.document },
      { name: 'combined examiner analyses', model: prisma.combinedExaminerAnalysis },
      { name: 'refinement sessions', model: prisma.refinementSession },
      { name: 'audit logs', model: prisma.auditLog },
      { name: 'AI audit logs', model: prisma.aiAuditLog },
      { name: 'job queue entries', model: prisma.jobQueue },
    ];
    
    let totalDeleted = 0;
    for (const table of tablesToDelete) {
      const deleted = await safeDeleteFromTable(table.name, table.model);
      totalDeleted += deleted;
    }
    
    // Finally, delete all projects
    console.log('🗑️  Deleting all projects...');
    const deletedProjects = await prisma.project.deleteMany({});
    console.log(`✅ Deleted ${deletedProjects.count} projects`);
    totalDeleted += deletedProjects.count;
    
    // Verify cleanup
    const remainingProjects = await prisma.project.count();
    console.log(`\n📊 Verification: ${remainingProjects} projects remaining`);
    
    if (remainingProjects === 0) {
      console.log('🎉 All project data has been successfully cleared!');
      console.log(`📈 Total records deleted: ${totalDeleted}`);
    } else {
      console.warn(`⚠️  Warning: ${remainingProjects} projects still remain`);
    }
    
  } catch (error) {
    console.error('❌ Error during project cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
  clearAllProjects()
    .then(() => {
      console.log('\n🎉 Project cleanup process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Project cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = { clearAllProjects }; 
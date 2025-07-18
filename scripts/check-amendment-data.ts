import { prisma } from '../src/lib/prisma';

async function checkAmendmentData() {
  try {
    console.log('🔍 Checking amendment data in database...\n');

    // Check office actions
    const officeActions = await prisma.officeAction.findMany({
      select: {
        id: true,
        projectId: true,
        status: true,
        createdAt: true,
      },
    });

    console.log('📋 Office Actions:', officeActions.length);
    officeActions.forEach(oa => {
      console.log(`  - ID: ${oa.id}`);
      console.log(`    Project: ${oa.projectId}`);
      console.log(`    Status: ${oa.status}`);
      console.log(`    Created: ${oa.createdAt.toISOString()}\n`);
    });

    // Check amendment projects
    const amendmentProjects = await prisma.amendmentProject.findMany({
      select: {
        id: true,
        officeActionId: true,
        projectId: true,
        name: true,
        status: true,
        createdAt: true,
      },
    });

    console.log('📝 Amendment Projects:', amendmentProjects.length);
    amendmentProjects.forEach(ap => {
      console.log(`  - ID: ${ap.id}`);
      console.log(`    Office Action: ${ap.officeActionId}`);
      console.log(`    Project: ${ap.projectId}`);
      console.log(`    Name: ${ap.name}`);
      console.log(`    Status: ${ap.status}\n`);
    });

    // Check draft documents with amendmentProjectId
    const amendmentDrafts = await prisma.draftDocument.findMany({
      where: {
        amendmentProjectId: {
          not: null,
        },
      },
      select: {
        id: true,
        projectId: true,
        amendmentProjectId: true,
        type: true,
        content: true,
        createdAt: true,
      },
    });

    console.log('📄 Amendment Draft Documents:', amendmentDrafts.length);
    amendmentDrafts.forEach(doc => {
      console.log(`  - Type: ${doc.type}`);
      console.log(`    Project: ${doc.projectId}`);
      console.log(`    Amendment Project: ${doc.amendmentProjectId}`);
      console.log(`    Has Content: ${!!(doc.content && doc.content.length > 0)}`);
      if (doc.content && doc.content.length > 0) {
        console.log(`    Content Preview: ${doc.content.substring(0, 100)}...`);
      }
      console.log(`    Created: ${doc.createdAt.toISOString()}\n`);
    });

    // Check for CLAIMS_AMENDMENTS and ARGUMENTS_SECTION specifically
    const claimAmendments = await prisma.draftDocument.findMany({
      where: {
        type: 'CLAIMS_AMENDMENTS',
      },
      select: {
        id: true,
        projectId: true,
        amendmentProjectId: true,
        content: true,
      },
    });

    console.log('🔧 Claim Amendment Documents:', claimAmendments.length);
    claimAmendments.forEach(doc => {
      console.log(`  - Project: ${doc.projectId}`);
      console.log(`    Amendment Project: ${doc.amendmentProjectId}`);
      
      if (doc.content) {
        try {
          const parsed = JSON.parse(doc.content);
          console.log(`    Claim Count: ${Array.isArray(parsed) ? parsed.length : 'not array'}`);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log(`    First Claim: ${parsed[0].claimNumber} - ${parsed[0].amendedText?.substring(0, 50)}...`);
          }
        } catch (e) {
          console.log(`    Content (raw): ${doc.content.substring(0, 100)}...`);
        }
      }
      console.log('');
    });

    const argumentSections = await prisma.draftDocument.findMany({
      where: {
        type: 'ARGUMENTS_SECTION',
      },
      select: {
        id: true,
        projectId: true,
        amendmentProjectId: true,
        content: true,
      },
    });

    console.log('💬 Argument Section Documents:', argumentSections.length);
    argumentSections.forEach(doc => {
      console.log(`  - Project: ${doc.projectId}`);
      console.log(`    Amendment Project: ${doc.amendmentProjectId}`);
      
      if (doc.content) {
        try {
          const parsed = JSON.parse(doc.content);
          console.log(`    Section Count: ${Array.isArray(parsed) ? parsed.length : 'not array'}`);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log(`    First Section: ${parsed[0].title} - ${parsed[0].content?.substring(0, 50)}...`);
          }
        } catch (e) {
          console.log(`    Content (raw): ${doc.content.substring(0, 100)}...`);
        }
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error checking amendment data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAmendmentData(); 
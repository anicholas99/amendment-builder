#!/usr/bin/env tsx

import { prisma } from '../src/lib/prisma';
import { logger } from '../src/lib/monitoring/logger';

async function checkDrafts() {
  try {
    // Get all draft documents
    const drafts = await prisma!.draftDocument.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    
    logger.info(`Found ${drafts.length} draft documents`);
    
    // Group by project
    const projectGroups = drafts.reduce((acc, doc) => {
      if (!acc[doc.projectId]) acc[doc.projectId] = [];
      acc[doc.projectId].push(doc);
      return acc;
    }, {} as Record<string, typeof drafts>);
    
    // Show each project's documents
    Object.entries(projectGroups).forEach(([projectId, docs]) => {
      console.log(`\nProject: ${projectId}`);
      console.log('Sections:');
      docs.forEach(d => {
        console.log(`  - ${d.type}: ${d.content?.substring(0, 50)}... (${d.content?.length || 0} chars)`);
      });
    });
    
  } catch (error) {
    logger.error('Failed to check drafts', { error });
  } finally {
    await prisma!.$disconnect();
  }
}

checkDrafts(); 
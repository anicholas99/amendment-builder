/**
 * Script to mark essential USPTO documents in existing ProjectDocument records
 * Run this to update documents that were imported before the isEssentialDoc field was added
 */

import { prisma } from '@/lib/prisma';
import { isEssentialDocument } from '@/lib/api/uspto/utils/documentCategorization';

async function markEssentialUSPTODocuments() {
  console.log('Starting to mark essential USPTO documents...');
  
  try {
    // Get all USPTO documents
    const usptoDocuments = await prisma.projectDocument.findMany({
      where: {
        fileType: 'uspto-document',
      },
      select: {
        id: true,
        originalName: true,
        projectId: true,
      }
    });
    
    console.log(`Found ${usptoDocuments.length} USPTO documents to process`);
    
    let essentialCount = 0;
    let updatedCount = 0;
    
    // Process in batches to avoid overwhelming the database
    const batchSize = 50;
    for (let i = 0; i < usptoDocuments.length; i += batchSize) {
      const batch = usptoDocuments.slice(i, i + batchSize);
      
      const updates = await Promise.all(
        batch.map(async (doc) => {
          // The document code is stored in originalName
          const documentCode = doc.originalName;
          const isEssential = isEssentialDocument(documentCode);
          
          if (isEssential) {
            essentialCount++;
          }
          
          // Update the document
          return prisma.projectDocument.update({
            where: { id: doc.id },
            data: { isEssentialDoc: isEssential },
          });
        })
      );
      
      updatedCount += updates.length;
      console.log(`Processed ${updatedCount}/${usptoDocuments.length} documents...`);
    }
    
    console.log('\n=== Summary ===');
    console.log(`Total USPTO documents: ${usptoDocuments.length}`);
    console.log(`Essential documents: ${essentialCount}`);
    console.log(`Non-essential documents: ${usptoDocuments.length - essentialCount}`);
    
    // Show breakdown by document type
    const essentialByType: Record<string, number> = {};
    usptoDocuments.forEach(doc => {
      if (isEssentialDocument(doc.originalName)) {
        essentialByType[doc.originalName] = (essentialByType[doc.originalName] || 0) + 1;
      }
    });
    
    console.log('\n=== Essential Documents by Type ===');
    Object.entries(essentialByType)
      .sort(([, a], [, b]) => b - a)
      .forEach(([code, count]) => {
        console.log(`${code}: ${count}`);
      });
    
  } catch (error) {
    console.error('Error marking essential documents:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
markEssentialUSPTODocuments()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
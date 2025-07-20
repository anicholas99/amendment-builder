/**
 * Script to update Office Action statuses based on prosecution timeline
 * 
 * This fixes existing Office Actions that were created before the
 * timeline-aware status logic was implemented.
 */

import { prisma } from '../src/lib/prisma';
import { ProsecutionTimelineService } from '../src/server/services/prosecutionTimeline.server-service';
import { fetchProsecutionHistory } from '../src/lib/api/uspto/services/prosecutionHistoryService';

async function updateOfficeActionStatuses() {
  console.log('Starting Office Action status update...');
  
  try {
    // Get all projects with patent applications
    const projects = await prisma.project.findMany({
      where: {
        deletedAt: null,
        patentApplication: {
          isNot: null,
        },
      },
      include: {
        patentApplication: true,
        officeActions: {
          where: { deletedAt: null },
          orderBy: { dateIssued: 'desc' },
        },
      },
    });
    
    console.log(`Found ${projects.length} projects to process`);
    
    let totalUpdated = 0;
    
    for (const project of projects) {
      if (!project.patentApplication?.applicationNumber) {
        continue;
      }
      
      console.log(`\nProcessing project ${project.id} (${project.name})`);
      
      try {
        // Fetch USPTO documents to build timeline
        const cleanAppNumber = project.patentApplication.applicationNumber.replace(/[^0-9]/g, '');
        const prosecutionData = await fetchProsecutionHistory(cleanAppNumber);
        
        if (!prosecutionData?.documents) {
          console.log('  No USPTO data found');
          continue;
        }
        
        // Build timeline to determine current OA
        const timeline = ProsecutionTimelineService.buildTimelineSequence(prosecutionData.documents);
        const currentOA = ProsecutionTimelineService.findCurrentOfficeAction(timeline);
        
        // Update each Office Action's status
        for (const oa of project.officeActions) {
          const isCurrentOA = currentOA && 
            oa.dateIssued && 
            currentOA.date.getTime() === new Date(oa.dateIssued).getTime() &&
            oa.oaNumber === currentOA.documentCode;
          
          const newStatus = isCurrentOA ? 'PENDING_RESPONSE' : 'COMPLETED';
          
          if (oa.status !== newStatus) {
            await prisma.officeAction.update({
              where: { id: oa.id },
              data: { status: newStatus },
            });
            
            console.log(`  Updated OA ${oa.id} from ${oa.status} to ${newStatus}`);
            totalUpdated++;
          }
        }
        
        // Update application status
        const appStatus = ProsecutionTimelineService.getApplicationStatus(timeline);
        await prisma.patentApplication.update({
          where: { id: project.patentApplication.id },
          data: { status: appStatus },
        });
        
      } catch (error) {
        console.error(`  Error processing project ${project.id}:`, error);
      }
    }
    
    console.log(`\nUpdate complete! Updated ${totalUpdated} Office Actions`);
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateOfficeActionStatuses();
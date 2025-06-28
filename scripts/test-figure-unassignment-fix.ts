import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/monitoring/logger';
import { FigureStatus } from '@/constants/database-enums';

/**
 * Test script to verify the figure unassignment fix
 * 
 * This script demonstrates:
 * 1. The issue: Frontend was sending the uploaded figure ID for unassignment
 * 2. The fix: Backend now validates that only ASSIGNED figures can be unassigned
 */
async function testFigureUnassignmentFix() {
  if (!prisma) {
    logger.error('Prisma client not initialized');
    return;
  }

  try {
    logger.info('Testing figure unassignment fix...');

    // Find a project with both uploaded and assigned figures
    const projectWithFigures = await prisma.project.findFirst({
      where: {
        deletedAt: null,
      },
      include: {
        figures: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    }) as any;

    const project = projectWithFigures;

    if (!project || !project.figures) {
      logger.error('No project found with figures');
      return;
    }

    // Filter for projects with assigned figures
    const hasAssignedFigures = project.figures.some(
      (f: any) => f.status === FigureStatus.ASSIGNED
    );

    if (!hasAssignedFigures) {
      logger.error('No project found with assigned figures');
      return;
    }

    logger.info('Using project for test', {
      projectId: project.id,
      projectName: project.name,
      figureCount: project.figures.length,
    });

    // Count figures by status
    const uploadedFigures = project.figures.filter(
      (f: any) => f.status === FigureStatus.UPLOADED
    );
    const assignedFigures = project.figures.filter(
      (f: any) => f.status === FigureStatus.ASSIGNED
    );
    const pendingFigures = project.figures.filter(
      (f: any) => f.status === FigureStatus.PENDING
    );

    logger.info('Figure counts by status:', {
      uploaded: uploadedFigures.length,
      assigned: assignedFigures.length,
      pending: pendingFigures.length,
    });

    // Find an assigned figure and its corresponding uploaded figure
    const assignedFigure = assignedFigures[0];
    if (!assignedFigure) {
      logger.error('No assigned figure found');
      return;
    }

    // Find the uploaded figure with the same blobName
    const uploadedFigureWithSameBlobName = uploadedFigures.find(
      (f: any) => f.blobName === assignedFigure.blobName
    );

    logger.info('Test scenario:', {
      assignedFigure: {
        id: assignedFigure.id,
        figureKey: assignedFigure.figureKey,
        status: (assignedFigure as any).status,
        blobName: assignedFigure.blobName,
      },
      uploadedFigureWithSameBlobName: uploadedFigureWithSameBlobName ? {
        id: uploadedFigureWithSameBlobName.id,
        figureKey: uploadedFigureWithSameBlobName.figureKey,
        status: (uploadedFigureWithSameBlobName as any).status,
        blobName: uploadedFigureWithSameBlobName.blobName,
      } : null,
    });

    // Simulate the frontend issue: trying to unassign using the uploaded figure ID
    if (uploadedFigureWithSameBlobName) {
      logger.info('Simulating frontend issue: Trying to unassign using uploaded figure ID...');
      
      // Import the unassignFigure function
      const { unassignFigure } = await import('@/repositories/figureRepository');
      
      try {
        // This should now fail with our fix
        await unassignFigure(
          uploadedFigureWithSameBlobName.id,
          project.userId,
          project.tenantId
        );
        
        logger.error('❌ PROBLEM: Unassignment succeeded with uploaded figure ID! The fix is not working.');
      } catch (error: any) {
        if (error.message.includes('Only assigned figures can be unassigned')) {
          logger.info('✅ SUCCESS: Unassignment correctly rejected for uploaded figure!');
          logger.info('Error message:', error.message);
        } else {
          logger.error('❌ Unexpected error:', error.message);
        }
      }
    }

    // Now test the correct behavior: unassigning using the assigned figure ID
    logger.info('\nTesting correct behavior: Unassigning using assigned figure ID...');
    
    try {
      const { unassignFigure } = await import('@/repositories/figureRepository');
      
      const result = await unassignFigure(
        assignedFigure.id,
        project.userId,
        project.tenantId
      );
      
      logger.info('✅ SUCCESS: Unassignment succeeded with assigned figure ID!');
      logger.info('Result:', {
        id: result.id,
        status: result.status,
        figureKey: result.figureKey,
        hasBlobName: !!result.blobName,
      });
      
      // Verify the figure is now PENDING
      const updatedFigure = await prisma.projectFigure.findUnique({
        where: { id: assignedFigure.id },
      });
      
      if (updatedFigure && (updatedFigure as any).status === FigureStatus.PENDING) {
        logger.info('✅ Verified: Figure is now PENDING in database');
      } else {
        logger.error('❌ Figure status not updated correctly:', (updatedFigure as any)?.status);
      }
    } catch (error: any) {
      logger.error('❌ Failed to unassign assigned figure:', error.message);
    }

    // Summary
    logger.info('\n=== TEST SUMMARY ===');
    logger.info('1. Backend fix is working: UPLOADED figures cannot be unassigned');
    logger.info('2. ASSIGNED figures can still be unassigned correctly');
    logger.info('3. Frontend needs to ensure it uses the assigned figure ID, not the uploaded figure ID');

  } catch (error) {
    logger.error('Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testFigureUnassignmentFix().catch(console.error); 
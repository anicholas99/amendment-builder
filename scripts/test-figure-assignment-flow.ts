import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/monitoring/logger';
import { FigureStatus } from '@/constants/database-enums';

/**
 * Test script to verify the figure assignment and unassignment flow
 * 
 * This script tests:
 * 1. Assigning an uploaded figure to a pending slot
 * 2. Verifying the correct figure ID is used after assignment
 * 3. Unassigning the figure using the correct assigned figure ID
 */
async function testFigureAssignmentFlow() {
  if (!prisma) {
    logger.error('Prisma client not initialized');
    return;
  }

  try {
    logger.info('Testing figure assignment and unassignment flow...');

    // Find a project with uploaded and pending figures
    const project = await prisma.project.findFirst({
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

    if (!project) {
      logger.error('No project found with uploaded figures');
      return;
    }

    logger.info('Using project for test', {
      projectId: project.id,
      projectName: project.name,
      figureCount: project.figures.length,
    });

    // Find an uploaded figure and a pending slot
    const uploadedFigure = project.figures.find(
      (f: any) => f.status === FigureStatus.UPLOADED && f.blobName
    );
    const pendingSlot = project.figures.find(
      (f: any) => f.status === FigureStatus.PENDING && f.figureKey
    );

    if (!uploadedFigure || !pendingSlot) {
      logger.error('Could not find suitable figures for test', {
        hasUploadedFigure: !!uploadedFigure,
        hasPendingSlot: !!pendingSlot,
      });
      return;
    }

    logger.info('Test setup', {
      uploadedFigure: {
        id: uploadedFigure.id,
        status: (uploadedFigure as any).status,
        fileName: uploadedFigure.fileName,
        hasBlobName: !!uploadedFigure.blobName,
      },
      pendingSlot: {
        id: pendingSlot.id,
        status: (pendingSlot as any).status,
        figureKey: pendingSlot.figureKey,
      },
    });

    // Simulate assignment
    logger.info('Simulating figure assignment...');
    
    // This is what the assignFigureToSlot function does
    const assignedFigure = await prisma.projectFigure.update({
      where: { id: pendingSlot.id },
      data: {
        fileName: uploadedFigure.fileName,
        blobName: uploadedFigure.blobName,
        mimeType: uploadedFigure.mimeType,
        sizeBytes: uploadedFigure.sizeBytes,
        uploadedBy: uploadedFigure.uploadedBy,
      } as any,
    });

    logger.info('Figure assigned successfully', {
      assignedFigureId: assignedFigure.id,
      figureKey: assignedFigure.figureKey,
      status: (assignedFigure as any).status,
    });

    // Verify the assignment
    const verifyAssigned = await prisma.projectFigure.findUnique({
      where: { id: assignedFigure.id },
    });

    if (!verifyAssigned || (verifyAssigned as any).status !== FigureStatus.ASSIGNED) {
      logger.error('Assignment verification failed');
      return;
    }

    logger.info('Assignment verified', {
      id: verifyAssigned.id,
      status: (verifyAssigned as any).status,
      figureKey: verifyAssigned.figureKey,
      hasBlobName: !!verifyAssigned.blobName,
    });

    // Now test unassignment using the ASSIGNED figure ID
    logger.info('Testing unassignment with correct figure ID...');

    const unassignedFigure = await prisma.projectFigure.update({
      where: { id: assignedFigure.id },
      data: {
        status: FigureStatus.PENDING,
        fileName: null,
        blobName: null,
        mimeType: null,
        sizeBytes: null,
      },
    });

    logger.info('Figure unassigned successfully', {
      id: unassignedFigure.id,
      status: (unassignedFigure as any).status,
      figureKey: unassignedFigure.figureKey,
      hasBlobName: !!unassignedFigure.blobName,
    });

    // Verify the uploaded figure is still intact
    const verifyUploaded = await prisma.projectFigure.findUnique({
      where: { id: uploadedFigure.id },
    });

    logger.info('Uploaded figure status after unassignment', {
      id: verifyUploaded?.id,
      status: verifyUploaded ? (verifyUploaded as any).status : 'not found',
      hasBlobName: !!verifyUploaded?.blobName,
    });

    logger.info('✅ Test completed successfully!');
    logger.info('Summary:', {
      uploadedFigureId: uploadedFigure.id,
      assignedFigureId: assignedFigure.id,
      correctIdUsed: assignedFigure.id !== uploadedFigure.id,
      finalSlotStatus: (unassignedFigure as any).status,
      uploadedFigurePreserved: verifyUploaded && (verifyUploaded as any).status === FigureStatus.UPLOADED,
    });

  } catch (error) {
    logger.error('Test failed', { error });
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testFigureAssignmentFlow().catch(console.error); 
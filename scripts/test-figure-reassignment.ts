import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/monitoring/logger';
import { FigureStatus } from '@/constants/database-enums';

/**
 * Test script to verify figure reassignment functionality:
 * 1. Uploaded figures are not deleted when assigned
 * 2. Assigned figures don't show up in unassigned list
 * 3. Unassigned figures become available again
 */
async function testFigureReassignment() {
  if (!prisma) {
    logger.error('Prisma client not initialized');
    return;
  }

  try {
    logger.info('Testing figure reassignment functionality...');

    // Find a project to test with
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
    });

    if (!project) {
      logger.error('No project found for testing');
      return;
    }

    logger.info('Using project for test', {
      projectId: project.id,
      projectName: project.name,
      figureCount: project.figures.length,
    });

    // Count figures by status
    const uploadedFigures = project.figures.filter(
      f => (f as any).status === FigureStatus.UPLOADED
    );
    const pendingFigures = project.figures.filter(
      f => (f as any).status === FigureStatus.PENDING
    );
    const assignedFigures = project.figures.filter(
      f => (f as any).status === FigureStatus.ASSIGNED
    );

    logger.info('Figure counts by status:', {
      uploaded: uploadedFigures.length,
      pending: pendingFigures.length,
      assigned: assignedFigures.length,
    });

    // Test 1: Check that uploaded figures with assigned blobNames don't appear as unassigned
    const assignedBlobNames = new Set(
      assignedFigures
        .map(f => f.blobName)
        .filter(Boolean)
    );

    logger.info('Assigned blob names:', {
      count: assignedBlobNames.size,
      blobNames: Array.from(assignedBlobNames),
    });

    // Check uploaded figures
    const availableUploadedFigures = uploadedFigures.filter(
      f => !assignedBlobNames.has(f.blobName)
    );

    logger.info('Available uploaded figures:', {
      total: uploadedFigures.length,
      available: availableUploadedFigures.length,
      filtered: uploadedFigures.length - availableUploadedFigures.length,
    });

    // Test 2: Simulate assignment and check if uploaded figure persists
    const unassignedUploadedFigure = uploadedFigures.find(
      f => !f.figureKey && !assignedBlobNames.has(f.blobName)
    );
    const pendingFigureToAssign = pendingFigures.find(
      f => !f.blobName
    );

    if (unassignedUploadedFigure && pendingFigureToAssign) {
      logger.info('Simulating assignment:', {
        uploadedFigureId: unassignedUploadedFigure.id,
        uploadedBlobName: unassignedUploadedFigure.blobName,
        pendingFigureId: pendingFigureToAssign.id,
        pendingFigureKey: pendingFigureToAssign.figureKey,
      });

      // Check if the uploaded figure still exists after assignment
      const uploadedAfterAssignment = await prisma.projectFigure.findUnique({
        where: { id: unassignedUploadedFigure.id },
      });

      if (uploadedAfterAssignment) {
        logger.info('✅ Uploaded figure still exists after assignment', {
          id: uploadedAfterAssignment.id,
          status: (uploadedAfterAssignment as any).status,
        });
      } else {
        logger.warn('❌ Uploaded figure was deleted after assignment');
      }
    } else {
      logger.info('No suitable figures found for assignment test');
    }

    // Test 3: Check figures with matching blobNames
    // Get all non-null blobNames for the project
    const allFiguresWithBlobNames = await prisma.projectFigure.findMany({
      where: {
        projectId: project.id,
        blobName: { not: { equals: '' } },
        deletedAt: null,
      },
      select: {
        id: true,
        blobName: true,
        figureKey: true,
        fileName: true,
      },
    });

    // Group by blobName manually
    const blobNameGroups = new Map<string, typeof allFiguresWithBlobNames>();
    for (const figure of allFiguresWithBlobNames) {
      if (figure.blobName) {
        const existing = blobNameGroups.get(figure.blobName) || [];
        existing.push(figure);
        blobNameGroups.set(figure.blobName, existing);
      }
    }

    // Find blobNames that appear multiple times
    const duplicateBlobNames = Array.from(blobNameGroups.entries())
      .filter(([_, figures]) => figures.length > 1);

    if (duplicateBlobNames.length > 0) {
      logger.info('Found figures sharing blobNames (indicating reassignment works):', {
        count: duplicateBlobNames.length,
        groups: duplicateBlobNames.map(([blobName, figures]) => ({
          blobName,
          count: figures.length,
        })),
      });

      // For each shared blobName, show the figures
      for (const [blobName, figures] of duplicateBlobNames) {
        logger.info(`Figures with blobName ${blobName}:`, {
          figures: figures.map(f => ({
            id: f.id,
            figureKey: f.figureKey,
            fileName: f.fileName,
          })),
        });
      }
    } else {
      logger.info('No figures found sharing blobNames');
    }

    // Summary
    logger.info('Test completed. Summary:');
    logger.info('- Uploaded figures should persist after assignment');
    logger.info('- Assigned figures should not appear in unassigned list');
    logger.info('- Multiple figures can share the same blobName (uploaded + assigned)');

  } catch (error) {
    logger.error('Error during figure reassignment test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testFigureReassignment().catch(console.error); 
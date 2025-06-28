import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/monitoring/logger';
import { FigureStatus } from '@/constants/database-enums';

/**
 * Test script to debug why figures still show after unassignment
 */
async function testFigureCacheIssue() {
  if (!prisma) {
    logger.error('Prisma client not initialized');
    return;
  }

  try {
    // Use the project ID from the logs
    const projectId = '57556a31-b38f-4093-b5d4-86517b14e112';
    const figureId = 'a6397e65-fc93-4506-984b-4dc7ce73ecb9';

    logger.info('Testing figure cache issue...');

    // Check the current state of the figure
    const figure = await prisma.projectFigure.findUnique({
      where: { id: figureId },
      include: {
        figureElements: true,
      },
    });

    if (!figure) {
      logger.error('Figure not found');
      return;
    }

    logger.info('Current figure state', {
      id: figure.id,
      projectId: figure.projectId,
      status: (figure as any).status,
      figureKey: figure.figureKey,
      fileName: figure.fileName,
      blobName: figure.blobName,
      hasBlobName: !!figure.blobName,
      mimeType: figure.mimeType,
      elementCount: figure.figureElements.length,
    });

    // Check all figures for the project
    const allFigures = await prisma.projectFigure.findMany({
      where: {
        projectId,
        deletedAt: null,
      },
      orderBy: {
        figureKey: 'asc',
      },
    });

    logger.info('All project figures', {
      count: allFigures.length,
      figures: allFigures.map(f => ({
        id: f.id,
        status: (f as any).status,
        figureKey: f.figureKey,
        fileName: f.fileName || 'null',
        hasBlobName: !!f.blobName,
      })),
    });

    // Check if there are any ASSIGNED figures with the same figureKey
    const assignedWithSameKey = allFigures.filter(
      f => f.figureKey === figure.figureKey && (f as any).status === FigureStatus.ASSIGNED
    );

    if (assignedWithSameKey.length > 0) {
      logger.warn('Found ASSIGNED figures with same figureKey!', {
        count: assignedWithSameKey.length,
        figures: assignedWithSameKey.map(f => ({
          id: f.id,
          status: (f as any).status,
          fileName: f.fileName,
        })),
      });
    }

    // Check for orphaned UPLOADED figures
    const uploadedFigures = allFigures.filter(
      f => (f as any).status === FigureStatus.UPLOADED
    );

    logger.info('Uploaded figures', {
      count: uploadedFigures.length,
      figures: uploadedFigures.map(f => ({
        id: f.id,
        figureKey: f.figureKey,
        fileName: f.fileName,
      })),
    });

  } catch (error) {
    logger.error('Test failed', { error });
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testFigureCacheIssue().catch(console.error); 
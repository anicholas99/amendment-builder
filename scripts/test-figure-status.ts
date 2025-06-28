import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/monitoring/logger';

async function testFigureStatus() {
  if (!prisma) {
    logger.error('Prisma client not initialized');
    return;
  }

  try {
    logger.info('Testing figure status implementation...');

    // Find a project with pending figures
    const projectWithFigures = await prisma.project.findFirst({
      where: {
        figures: {
          some: {}
        }
      },
      include: {
        figures: {
          where: {
            deletedAt: null
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      }
    });

    if (!projectWithFigures) {
      logger.warn('No projects with figures found');
      return;
    }

    logger.info('Found project with figures', {
      projectId: projectWithFigures.id,
      projectName: projectWithFigures.name,
      figureCount: projectWithFigures.figures.length
    });

    // Display figure statuses
    for (const figure of projectWithFigures.figures) {
      logger.info('Figure details', {
        id: figure.id,
        figureKey: figure.figureKey,
        status: (figure as any).status || 'NOT SET',
        fileName: figure.fileName,
        blobName: figure.blobName,
        hasBlobName: !!figure.blobName,
        mimeType: figure.mimeType
      });
    }

    // Find figures with the old pending pattern
    const pendingFigures = await prisma.projectFigure.findMany({
      where: {
        blobName: {
          startsWith: 'pending-'
        },
        deletedAt: null
      },
      take: 10
    });

    if (pendingFigures.length > 0) {
      logger.info('Found figures with old pending pattern', {
        count: pendingFigures.length
      });

      // Update them to use the new status field
      for (const figure of pendingFigures) {
        logger.info('Updating figure to use status field', {
          id: figure.id,
          oldBlobName: figure.blobName
        });

        await prisma.projectFigure.update({
          where: { id: figure.id },
          data: {
            status: 'PENDING',
            fileName: null,
            originalName: null,
            blobName: null,
            mimeType: null,
            sizeBytes: null
          } as any
        });
      }

      logger.info('Updated all pending figures to use new status field');
    } else {
      logger.info('No figures with old pending pattern found');
    }

    // Test the new structure
    const updatedFigures = await prisma.projectFigure.findMany({
      where: {
        status: 'PENDING'
      } as any,
      take: 5
    });

    logger.info('Figures with PENDING status', {
      count: updatedFigures.length
    });

    for (const figure of updatedFigures) {
      logger.info('Pending figure', {
        id: figure.id,
        figureKey: figure.figureKey,
        status: (figure as any).status,
        hasFileName: !!figure.fileName,
        hasBlobName: !!figure.blobName
      });
    }

  } catch (error) {
    logger.error('Test failed', { error });
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testFigureStatus().catch(console.error); 
/**
 * Script to fix element descriptions by copying Element.name to FigureElement.calloutDescription
 * This ensures consistency in display regardless of what was originally extracted by AI
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../src/lib/monitoring/logger';

const prisma = new PrismaClient();

async function fixElementDescriptions() {
  try {
    logger.info('Starting element description fix...');

    // Get all FigureElement records with their associated Element
    const figureElements = await prisma.figureElement.findMany({
      include: {
        element: true,
        figure: {
          select: {
            projectId: true,
            figureKey: true,
          }
        }
      }
    });

    logger.info(`Found ${figureElements.length} figure elements to process`);

    let updateCount = 0;

    // Update each FigureElement to use Element.name as calloutDescription
    for (const figureElement of figureElements) {
      // Only update if the calloutDescription is different from the element name
      if (figureElement.calloutDescription !== figureElement.element.name) {
        await prisma.figureElement.update({
          where: { id: figureElement.id },
          data: {
            calloutDescription: figureElement.element.name
          }
        });

        updateCount++;
        
        logger.debug('Updated element description', {
          projectId: figureElement.figure.projectId,
          figureKey: figureElement.figure.figureKey,
          elementKey: figureElement.element.elementKey,
          oldDescription: figureElement.calloutDescription,
          newDescription: figureElement.element.name,
        });
      }
    }

    logger.info(`Element description fix completed. Updated ${updateCount} records`);
  } catch (error) {
    logger.error('Failed to fix element descriptions', { error });
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixElementDescriptions()
  .then(() => {
    console.log('✅ Element descriptions fixed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to fix element descriptions:', error);
    process.exit(1);
  }); 
import { Figure, Figures } from './types';
import { logger } from '@/lib/monitoring/logger';

/**
 * Natural sort for figure keys that handles FIG. 1, FIG. 1A, FIG. 2, etc.
 */
export const sortFigureKeys = (figures: Figures): string[] => {
  return Object.keys(figures).sort((a, b) => {
    // Extract the numeric part and any suffix
    const matchA = a.match(/FIG\.\s*(\d+)([A-Za-z]*)/i);
    const matchB = b.match(/FIG\.\s*(\d+)([A-Za-z]*)/i);

    if (!matchA || !matchB) {
      return a.localeCompare(b); // Fallback to string comparison
    }

    const numA = parseInt(matchA[1], 10);
    const numB = parseInt(matchB[1], 10);

    // If numeric parts are different, sort by number
    if (numA !== numB) {
      return numA - numB;
    }

    // If numeric parts are same, sort by suffix
    const suffixA = matchA[2] || '';
    const suffixB = matchB[2] || '';
    return suffixA.localeCompare(suffixB);
  });
};

/**
 * Validates figures to check for gaps in numbering
 */
export const validateFigures = (figures: Figures): Figures => {
  // Extract base figure numbers (without suffixes)
  const figureBaseNumbers = new Set<number>();
  Object.keys(figures).forEach(key => {
    const match = key.match(/FIG\.\s*(\d+)/i);
    if (match) {
      figureBaseNumbers.add(parseInt(match[1], 10));
    }
  });

  const figureNumbers = Array.from(figureBaseNumbers).sort((a, b) => a - b);

  // Check for gaps in figure numbering
  if (figureNumbers.length > 0) {
    const maxFigure = Math.max(...figureNumbers);
    for (let i = 1; i <= maxFigure; i++) {
      if (!figureNumbers.includes(i)) {
        logger.warn(
          `Warning: Gap detected in figure numbering - missing FIG. ${i}`
        );
      }
    }
  }
  return figures;
};

/**
 * Extracts the next available base figure number
 */
export const getNextBaseNumber = (figures: Figures): number => {
  // Extract base figure numbers (without suffixes)
  const figureBaseNumbers = new Set<number>();
  Object.keys(figures).forEach(key => {
    const match = key.match(/FIG\.\s*(\d+)/i);
    if (match) {
      figureBaseNumbers.add(parseInt(match[1], 10));
    }
  });

  const figureNumbers = Array.from(figureBaseNumbers).sort((a, b) => a - b);

  let nextNumber = 1;
  if (figureNumbers.length > 0) {
    nextNumber = Math.max(...figureNumbers) + 1;
  }

  return nextNumber;
};

/**
 * Generates a new figure number based on the current figures
 */
export const getNextFigureNumber = (figures: Figures): string => {
  const nextNumber = getNextBaseNumber(figures);
  return `FIG. ${nextNumber}`;
};

/**
 * Gets all variants for a specific figure number (e.g., for figure 1: ['A', 'B'])
 */
export const getFigureVariants = (
  figures: Figures,
  baseNumber: number
): string[] => {
  const variants: string[] = [];

  Object.keys(figures).forEach(key => {
    const match = key.match(/FIG\.\s*(\d+)([A-Za-z]*)/i);
    if (match && parseInt(match[1], 10) === baseNumber && match[2]) {
      variants.push(match[2]);
    }
  });

  return variants.sort();
};

/**
 * Gets the next available variant for a specific figure number
 * e.g., if FIG. 1A and FIG. 1B exist, returns 'C'
 */
export const getNextVariant = (
  figures: Figures,
  baseNumber: number
): string => {
  const variants = getFigureVariants(figures, baseNumber);

  if (variants.length === 0) {
    return 'A';
  }

  // Get the last variant and increment it
  const lastVariant = variants[variants.length - 1];
  const lastChar = lastVariant.charCodeAt(lastVariant.length - 1);
  return String.fromCharCode(lastChar + 1);
};

/**
 * Optimizes an image by reducing its dimensions and quality
 * to keep the project size manageable
 */
export const optimizeImage = async (
  imageData: string,
  maxWidth = 1200
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.onload = () => {
        // Create a canvas to resize the image
        const canvas = document.createElement('canvas');

        // Calculate new dimensions (maintain aspect ratio)
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        // Draw the image on the canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageData); // Fallback to original if context not available
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Get the optimized data URL (0.85 quality is a good balance)
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(optimizedDataUrl);
      };

      img.onerror = () => {
        logger.error('Error loading image for optimization');
        resolve(imageData); // Fallback to original on error
      };

      img.src = imageData;
    } catch (err) {
      logger.error('Error optimizing image:', err);
      resolve(imageData); // Fallback to original on error
    }
  });
};

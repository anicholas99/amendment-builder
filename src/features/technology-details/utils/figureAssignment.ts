/**
 * Utility functions for auto-assigning figure numbers based on filename patterns
 */

interface FigureAssignment {
  fileName: string;
  detectedNumber: string | null;
  assignedNumber: string;
}

/**
 * Extract figure number from filename using common patterns
 * Returns alphanumeric figure number (e.g., "1A", "2B") or null if no pattern is detected
 */
export function extractFigureNumber(fileName: string): string | null {
  // Remove file extension for easier pattern matching
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '').toLowerCase();

  // Common figure naming patterns - now support alphanumeric (1A, 1B, etc.)
  const patterns = [
    // fig1A, figure1B, fig_1C, figure_1D, fig-1E, figure-1F
    /(?:fig|figure)[_\-\s]?(\d+[a-z]?)/,
    // drawing1A, dwg1B, diagram1C, diag1D
    /(?:drawing|dwg|diagram|diag)[_\-\s]?(\d+[a-z]?)/,
    // image1A, img1B
    /(?:image|img)[_\-\s]?(\d+[a-z]?)/,
    // Just numbers with optional letters: 1A.png, 01B.jpg, etc.
    /^(\d+[a-z]?)$/,
    // Numbers at the end: patent_1A, invention1B
    /[_\-\s](\d+[a-z]?)$/,
  ];

  for (const pattern of patterns) {
    const match = nameWithoutExt.match(pattern);
    if (match && match[1]) {
      const rawFigureNumber = match[1].toUpperCase(); // Convert to uppercase (1A, 1B, etc.)

      // Extract numeric part for validation and normalization
      const numericMatch = rawFigureNumber.match(/^(\d+)([A-Z]*)$/);
      if (numericMatch) {
        const numericPart = parseInt(numericMatch[1], 10);
        const letterPart = numericMatch[2];

        // Validate reasonable figure numbers (1-99)
        if (numericPart >= 1 && numericPart <= 99) {
          // Normalize by removing leading zeros: "01A" → "1A"
          return numericPart.toString() + letterPart;
        }
      }
    }
  }

  return null;
}

/**
 * Assign figure numbers to a list of files
 * Uses detected numbers when available, fills gaps with sequential numbers
 */
export function assignFigureNumbers(fileNames: string[]): FigureAssignment[] {
  // First pass: detect numbers from filenames
  const detections = fileNames.map(fileName => ({
    fileName,
    detectedNumber: extractFigureNumber(fileName),
    assignedNumber: '', // Will be filled in second pass
  }));

  // Track which numbers are already taken (track by base numeric value)
  const takenNumbers = new Set<string>();

  // Second pass: assign numbers sequentially
  return detections.map(detection => {
    if (
      detection.detectedNumber !== null &&
      !takenNumbers.has(detection.detectedNumber)
    ) {
      // Use detected number if available and not taken
      detection.assignedNumber = detection.detectedNumber;
      takenNumbers.add(detection.detectedNumber);
    } else {
      // Find next available number starting from 1
      let nextNumber = 1;
      while (takenNumbers.has(nextNumber.toString())) {
        nextNumber++;
      }
      detection.assignedNumber = nextNumber.toString();
      takenNumbers.add(nextNumber.toString());
    }

    return detection;
  });
}

/**
 * Reorder figure assignments based on drag-and-drop or manual ordering
 */
export function reorderFigures<T extends { assignedNumber: string }>(
  figures: T[],
  fromIndex: number,
  toIndex: number
): T[] {
  const result = [...figures];
  const [movedItem] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, movedItem);

  // Reassign numbers based on new order
  return result.map((figure, index) => ({
    ...figure,
    assignedNumber: (index + 1).toString(),
  }));
}

/**
 * Reset figure numbers to sequential order (1, 2, 3...)
 */
export function resetFigureNumbers<T extends { assignedNumber: string }>(
  figures: T[]
): T[] {
  return figures.map((figure, index) => ({
    ...figure,
    assignedNumber: (index + 1).toString(),
  }));
}

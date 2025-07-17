import { logger } from '@/utils/clientLogger';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/useToastWrapper';
import { InventionData } from '../../../types';
import { extractSections } from './patent-sections';
import { extractTextFromHTML } from '@/utils/htmlSanitizer';

/**
 * Helper function to process content for DOCX export
 */
export const processContentForDocx = async (
  content: string,
  skipTitle: boolean = true
): Promise<any[]> => {
  // Lazy load docx library
  const { Paragraph, HeadingLevel, AlignmentType } = await import('docx');

  if (!content) return [];

  const paragraphs: any[] = [];
  const lines = content.split('\n');

  let currentSection = '';
  let isSectionHeader = false;
  let inClaimsSection = false;
  let inTitleSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip the title section if requested (since it's already in the header)
    if (skipTitle && inTitleSection) {
      if (
        line.trim() === '' ||
        (line.startsWith('**') && line.endsWith('**')) ||
        (line.toUpperCase() === line && line.trim() !== '')
      ) {
        // We've reached the end of the title section
        inTitleSection = false;
        if (line.startsWith('**') || line.toUpperCase() === line) {
          // Process this line normally as it's a new section
          i--;
          continue;
        }
      } else {
        // Skip this line as it's part of the title section
        continue;
      }
    }

    // Check if this is a section header
    if (line.startsWith('**') && line.endsWith('**')) {
      currentSection = line.replace(/\*\*/g, '').trim();
      isSectionHeader = true;
      inClaimsSection = currentSection.toUpperCase() === 'CLAIMS';
      inTitleSection = skipTitle && currentSection.toUpperCase() === 'TITLE';
    } else if (
      line.toUpperCase() === line &&
      line.trim() !== '' &&
      [
        'TITLE',
        'ABSTRACT',
        'BACKGROUND',
        'SUMMARY',
        'BRIEF DESCRIPTION OF THE DRAWINGS',
        'DETAILED DESCRIPTION',
        'CLAIMS',
        'FIELD OF THE INVENTION',
      ].includes(line.trim())
    ) {
      currentSection = line.trim();
      isSectionHeader = true;
      inClaimsSection = currentSection === 'CLAIMS';
      inTitleSection = skipTitle && currentSection === 'TITLE';
    } else {
      isSectionHeader = false;
    }

    // Skip empty lines but preserve spacing
    if (line.trim() === '') {
      // Add an empty paragraph for spacing
      paragraphs.push(new Paragraph({ text: '' }));
      continue;
    }

    // Format based on line type
    if (isSectionHeader) {
      // Add extra spacing before section headers (except the first one)
      if (paragraphs.length > 0) {
        paragraphs.push(new Paragraph({ text: '' }));
      }

      // Section headers are bold and centered
      paragraphs.push(
        new Paragraph({
          text: currentSection,
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.CENTER,
        })
      );

      // Add spacing after section header
      paragraphs.push(new Paragraph({ text: '' }));
    } else if (inClaimsSection && /^\d+\./.test(line)) {
      // Format claims with proper indentation
      const claimMatch = line.match(/^(\d+\.)\s*(.*)$/);
      if (claimMatch) {
        // Claims are formatted with bold claim number
        paragraphs.push(
          new Paragraph({
            text: line,
          })
        );
      } else {
        paragraphs.push(new Paragraph({ text: line }));
      }
    } else {
      // Regular paragraph
      paragraphs.push(
        new Paragraph({
          text: line,
        })
      );
    }
  }

  return paragraphs;
};

/**
 * Exports the patent application to a DOCX file
 */
export const exportToDocx = async (
  analyzedInvention: InventionData,
  content: string,
  toast: ReturnType<typeof useToast>
): Promise<void> => {
  // Lazy load docx library
  const { Document, Packer, Paragraph, HeadingLevel, AlignmentType } =
    await import('docx');

  if (!analyzedInvention) {
    toast({
      title: 'Export Failed',
      description: 'No invention data available to export',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
    return;
  }

  // Check if there's actual patent content
  if (!content || content.trim().length === 0) {
    toast({
      title: 'Export Failed',
      description:
        'No patent application has been generated yet. Please generate the patent application first.',
      status: 'warning',
      duration: 5000,
      isClosable: true,
    });
    return;
  }

  // Extract the patent title from the content
  let patentTitle = '';

  // Try to extract title from the content (looking for TITLE section)
  const titleMatch =
    content.match(/\*\*TITLE\*\*\s*\n+([^\n]+)/i) ||
    content.match(/^TITLE\s*\n+([^\n]+)/im);

  if (titleMatch && titleMatch[1]) {
    patentTitle = titleMatch[1].trim();

    // Strip HTML tags from the title
    if (patentTitle.includes('<') && patentTitle.includes('>')) {
      // Use safe text extraction instead of innerHTML
      patentTitle = extractTextFromHTML(patentTitle);
      patentTitle = patentTitle.trim();
    }

    // Decode HTML entities in the title
    const textarea = document.createElement('textarea');
    textarea.textContent = patentTitle; // Use textContent instead of innerHTML
    patentTitle = textarea.textContent || '';
  } else {
    // Fallback to invention title if no TITLE section found
    patentTitle = analyzedInvention.title || 'Patent Application';
  }

  // Make sure abstract is properly included in the content if needed
  let exportContent = content;

  // Strip HTML from the content if present
  if (exportContent.includes('<') && exportContent.includes('>')) {
    logger.info('[exportToDocx] Stripping HTML from export content');

    // Use safe text extraction for content
    exportContent = extractTextFromHTML(exportContent);

    // Decode HTML entities safely
    const textarea = document.createElement('textarea');
    textarea.textContent = exportContent;
    exportContent = textarea.textContent || '';

    // Clean up excessive line breaks
    exportContent = exportContent
      .replace(/\n{3,}/g, '\n\n') // Replace 3+ line breaks with 2
      .trim();
  }

  // If abstract is missing from content but exists at top level, add it
  if (
    !content.includes('**ABSTRACT**') &&
    !content.includes('\nABSTRACT\n') &&
    (
      analyzedInvention.generated_content as {
        sections?: { ABSTRACT?: string };
      }
    )?.sections?.ABSTRACT
  ) {
    exportContent =
      content +
      '\n\n\n**ABSTRACT**\n\n' +
      (
        analyzedInvention.generated_content as {
          sections: { ABSTRACT: string };
        }
      ).sections.ABSTRACT;
  }

  // Create a new Document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Attorney Docket Number
          new Paragraph({
            text: 'Attorney Docket No. 12345-001',
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({ text: '' }), // Empty line

          // Patent Title (centered and bold)
          new Paragraph({
            text: patentTitle,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: '' }), // Empty line

          // Process the content line by line to maintain formatting
          ...(await processContentForDocx(exportContent)),
        ],
      },
    ],
  });

  // Generate the DOCX file
  Packer.toBlob(doc).then(blob => {
    // Save the file using the patent title for filename
    const filename = patentTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .substring(0, 50); // Limit length

    saveAs(blob, `${filename || 'patent-application'}.docx`);

    // Show success message
    toast({
      title: 'Export Successful',
      description: 'Your patent application has been exported to DOCX',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  });
};

/**
 * Rebuilds sections from patent content
 */
export const rebuildSections = (
  content: string,
  analyzedInvention: InventionData
) => {
  if (!content) {
    return null;
  }

  try {
    // Extract sections from the current content
    const newSections = extractSections(content);

    if (Object.keys(newSections).length <= 1) {
      return null;
    }

    // Get abstract text from sections
    const abstractText =
      newSections['ABSTRACT'] ||
      newSections['Abstract'] ||
      (
        analyzedInvention.generated_content as {
          sections?: { ABSTRACT?: string };
        }
      )?.sections?.ABSTRACT ||
      '';

    // If abstract is missing from sections but exists at top level, add it to sections
    if (!newSections['ABSTRACT'] && abstractText) {
      newSections['ABSTRACT'] = abstractText;
    }

    return newSections;
  } catch (error) {
    logger.error('Error rebuilding sections:', error);
    return null;
  }
};

/**
 * Get the section title for a given node path
 */
export const getSectionTitle = (
  path: number[],
  analyzedInvention: InventionData,
  claimSetVersions: any[],
  selectedClaimSetVersionId: string | null
): string => {
  const content = getContentForPath(
    path,
    analyzedInvention,
    claimSetVersions,
    selectedClaimSetVersionId
  );
  return content.title;
};

export const getContentForPath = (
  path: number[],
  analyzedInvention: InventionData,
  claimSetVersions: any[],
  selectedClaimSetVersionId: string | null
): { title: string; text: string } => {
  const contentMap: Record<number, { title: string; text: string }> = {
    0: { title: 'Title of the Invention', text: analyzedInvention.title ?? '' },
    1: { title: 'Abstract', text: analyzedInvention.abstract ?? '' },
    2: {
      title: 'Background',
      text: (analyzedInvention.background as string) ?? '',
    },
    3: { title: 'Summary', text: analyzedInvention.summary ?? '' },
    4: {
      title: 'Brief Description of the Drawings',
      text: analyzedInvention.briefDescription ?? '',
    },
    5: {
      title: 'Detailed Description',
      text: analyzedInvention.detailedDescription ?? '',
    },
  };

  const selectedVersion = claimSetVersions.find((claim, index) => {
    const claimNumber = index + 1;
    contentMap[index] = {
      title: `Claim ${claimNumber}`,
      text: claim.content,
    };
  });

  const elementContent = analyzedInvention.generated_content as {
    sections?: { [key: string]: string };
  };

  if (elementContent && elementContent.sections) {
    const elementContentMap: Record<string, string> = elementContent.sections;
    const elementContentArray = Object.entries(elementContentMap);

    elementContentArray.forEach(([key, value], index) => {
      const elementNumber = index + 1;
      contentMap[index + 6] = {
        title: `Element ${elementNumber}`,
        text: value,
      };
    });
  }

  return contentMap[path[0]] || { title: 'Unknown Section', text: '' };
};

/**
 * @returns The text of the claim, or null if not found.
 */
export function findClaimTextInVersion(
  claim: any,
  claimNumber: string
): string | null {
  if (claim && claim.content) {
    // Attempt to parse claim data if it's a JSON string
    try {
      const parsedClaims = JSON.parse(claim.content);
      if (typeof parsedClaims === 'object' && parsedClaims !== null) {
        // Find the specific claim text from the parsed object
        const claimText = parsedClaims[claimNumber];
        if (typeof claimText === 'string') {
          return claimText;
        }
      }
    } catch (e) {
      // If parsing fails, it might be a plain string (legacy)
      // This case is less likely with new schema but handled for safety
      logger.warn(
        '[findClaimTextInVersion] Could not parse claimData, falling back to direct use.',
        {
          claimSetVersionId: claim.id,
          error: e,
        }
      );
      // For safety, let's assume if it's not a parsable JSON object of claims,
      // and we are looking for claim "1", the whole string might be claim 1.
      if (claimNumber === '1') {
        return claim.content;
      }
    }
  }
  return null; // Return null if no claim text found
}

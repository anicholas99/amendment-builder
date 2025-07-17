import { saveAs } from 'file-saver';
import { InventionData } from '../../../types';
import { logger } from '@/utils/clientLogger';

interface ExportOptions {
  title?: string;
  showDocketNumber?: boolean;
  docketNumber?: string;
  useDoubleSpacing?: boolean; // New option for USPTO compliance
  addPageNumbers?: boolean; // New option for page numbering
}

/**
 * Export the patent document as a USPTO-compliant DOCX file
 * Updated for 2024 requirements to avoid $400 surcharge
 *
 * IMPORTANT FOR USPTO COMPLIANCE:
 * - Document exported with proper page separation (Specification, Claims, Abstract)
 * - USPTO margins: left ≥1", top/bottom/right ≥0.75"
 * - Line spacing: 1.5x default (can be set to 2.0x via options)
 * - Font: ALL text (headers, body, claims, abstract) formatted as Times New Roman 12pt
 * - Color: ALL text formatted as black
 * - Headers: Bold, Underlined, Black, 12pt Times New Roman
 * - Title: Bold, Black, 12pt Times New Roman (centered)
 * - Body Text: Regular, Black, 12pt Times New Roman
 * - No extra spacing above section headers for tight formatting
 *
 * @param content - The patent content in plain text or HTML format
 * @param analyzedInvention - The structured patent data
 * @param options - Export options (title, docket number, etc.)
 */
export const exportPatentToDocx = async (
  content: string,
  analyzedInvention: InventionData | null,
  options: ExportOptions = {}
): Promise<void> => {
  // Lazy load docx library to improve initial bundle size
  const { Document, Packer, Paragraph, HeadingLevel, AlignmentType, TextRun } =
    await import('docx');

  // Helper function to convert inches to twips (1 inch = 1440 twips)
  const convertInchesToTwip = (inches: number) => inches * 1440;

  // Helper function to create proper USPTO spacing
  const createSpacing = (useDouble: boolean) => ({
    line: useDouble ? 480 : 360, // 480 twips = 2.0x, 360 twips = 1.5x
    before: 0,
    after: 0,
  });

  // Global counter to track paragraph numbers across all sections
  let globalParagraphCount = 1;

  const processPatentParagraphs = (
    lines: string[],
    useDoubleSpacing: boolean
  ) => {
    const paragraphs: any[] = [];

    for (const line of lines) {
      if (!line.trim()) {
        // Empty line for spacing
        paragraphs.push(new Paragraph({ text: '' }));
        continue;
      }

      // Check if line starts with patent paragraph number format [0001], [0002], etc.
      const patentNumberMatch = line.match(/^\[(\d{4})\]\s*(.*)$/);

      if (patentNumberMatch) {
        const [, originalNumber, text] = patentNumberMatch;

        // Choose numbering reference based on paragraph count
        const numberingReference =
          globalParagraphCount < 10
            ? 'patent-numbering-single-digit'
            : 'patent-numbering-double-digit';

        // Create paragraph using appropriate numbering system
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: text,
                font: 'Times New Roman',
                size: 24, // 12pt in half-points
                color: '000000', // black
              }),
            ],
            spacing: createSpacing(useDoubleSpacing),
            numbering: {
              reference: numberingReference,
              level: 0,
            },
          } as any)
        );

        globalParagraphCount++;
      } else {
        // Regular paragraph
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                font: 'Times New Roman',
                size: 24, // 12pt in half-points
                color: '000000', // black
              }),
            ],
            spacing: createSpacing(useDoubleSpacing),
          } as any)
        );
      }
    }

    return paragraphs;
  };

  // Extract options with USPTO-compliant defaults
  const {
    showDocketNumber = false,
    docketNumber = 'Attorney Docket No. [Insert Docket Number]',
    useDoubleSpacing = false, // Default to 1.5x spacing for better readability
    addPageNumbers = true, // Default to page numbering for USPTO compliance
  } = options;

  // First, try to extract the actual patent title from the content
  let extractedTitle = '';

  // Try different patterns to find the title in the content
  // Pattern 1: First line before FIELD section
  const beforeFieldMatch = content.match(
    /^([\s\S]+?)(?=\n*FIELD|\n*\*\*FIELD\*\*)/
  );
  if (beforeFieldMatch && beforeFieldMatch[1]) {
    // Take only the first line if there are multiple lines
    const firstLine = beforeFieldMatch[1].trim().split('\n')[0];
    extractedTitle = firstLine.trim();
  }

  // Pattern 2: Check if there's a TITLE section
  if (!extractedTitle) {
    const titleSectionMatch = content.match(
      /(?:TITLE|\*\*TITLE\*\*)\s*\n+(.+?)(?=\n{2,}|\n*(?:FIELD|BACKGROUND|\*\*))/i
    );
    if (titleSectionMatch && titleSectionMatch[1]) {
      extractedTitle = titleSectionMatch[1].trim();
    }
  }

  logger.info('[exportPatentToDocx] Title extraction:', {
    extractedTitle,
    optionsTitle: options.title,
    analyzedInventionTitle: analyzedInvention?.title,
  });

  // Strip HTML from extractedTitle if present
  if (
    extractedTitle &&
    extractedTitle.includes('<') &&
    extractedTitle.includes('>')
  ) {
    logger.info('[exportPatentToDocx] Stripping HTML from extracted title', {
      extractedTitle,
    });
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = extractedTitle;
    extractedTitle = tempDiv.textContent || tempDiv.innerText || extractedTitle;

    const textarea = document.createElement('textarea');
    textarea.innerHTML = extractedTitle;
    extractedTitle = textarea.value.trim();

    logger.info('[exportPatentToDocx] Title after HTML stripping', {
      extractedTitle,
    });
  }

  // Use the extracted title if found, otherwise fall back to options
  const title =
    extractedTitle ||
    analyzedInvention?.title ||
    options.title ||
    'Patent Application';

  // Check if content is empty or invalid
  if (!content || content.trim() === '') {
    alert(
      'No patent application has been generated yet. Please generate the patent application first.'
    );
    return;
  }

  // Log the incoming content for debugging
  logger.info('[exportPatentToDocx] Starting export with:', {
    contentLength: content.length,
    contentSample: content.substring(0, 200),
    title,
    hasAnalyzedInvention: !!analyzedInvention,
    useDoubleSpacing,
    addPageNumbers,
  });

  // Check if content contains HTML and strip it if needed
  let cleanContent = content;
  if (content.includes('<') && content.includes('>')) {
    logger.info(
      '[exportPatentToDocx] Content appears to contain HTML, stripping tags'
    );
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;

    // Replace block elements with line breaks before extracting text
    tempDiv.innerHTML = tempDiv.innerHTML
      .replace(/<\/p>/gi, '</p>\n')
      .replace(/<\/div>/gi, '</div>\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '</h1>\n\n')
      .replace(/<h[1-6][^>]*>/gi, '\n');

    cleanContent = tempDiv.textContent || tempDiv.innerText || '';
    cleanContent = cleanContent.replace(/\n{3,}/g, '\n\n').trim();

    logger.info('[exportPatentToDocx] Stripped HTML:', {
      originalLength: content.length,
      cleanLength: cleanContent.length,
      cleanSample: cleanContent.substring(0, 200),
      lineCount: cleanContent.split('\n').length,
    });
  }

  // Parse the plain text content into a structured format
  const structuredContent = parsePatentContent(cleanContent);

  logger.info('[exportPatentToDocx] Structured content:', {
    sectionCount: Object.keys(structuredContent.sections).length,
    sections: Object.keys(structuredContent.sections),
    sectionSamples: Object.entries(structuredContent.sections).map(
      ([key, value]) => ({
        section: key,
        lineCount: value.length,
        firstLine: value[0] || 'empty',
      })
    ),
  });

  // USPTO Page Properties - consistent across all sections
  const usptoPageProperties = {
    margin: {
      // USPTO margins: top/bottom/right ≥0.75", left ≥1"
      top: convertInchesToTwip(0.75),
      right: convertInchesToTwip(0.75),
      bottom: convertInchesToTwip(0.75),
      left: convertInchesToTwip(1.0),
    },
  };

  // ========================================
  // SECTION 1: SPECIFICATION
  // ========================================
  const specificationParagraphs: any[] = [];

  // Add docket number if requested (at top of first page)
  if (showDocketNumber) {
    specificationParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: docketNumber,
            font: 'Times New Roman',
            size: 24, // 12pt in half-points
            color: '000000', // black
          }),
        ],
        alignment: AlignmentType.RIGHT,
        spacing: createSpacing(useDoubleSpacing),
      } as any)
    );

    // Add some space after docket number
    specificationParagraphs.push(new Paragraph({ text: '' }));
  }

  // Add title (centered, first page) - bold, black, 12pt
  specificationParagraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          font: 'Times New Roman',
          size: 24, // 12pt in half-points
          color: '000000', // black
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: {
        ...createSpacing(useDoubleSpacing),
        before: convertInchesToTwip(0.5),
        after: convertInchesToTwip(0.25),
      },
    } as any) // Use 'as any' to bypass TypeScript check
  );

  // No extra spacing after title - content flows immediately

  // Add required USPTO specification sections
  const requiredSpecSections = [
    'CROSS-REFERENCE TO RELATED APPLICATIONS',
    'STATEMENT REGARDING FEDERALLY SPONSORED RESEARCH OR DEVELOPMENT',
    'FIELD',
    'BACKGROUND',
    'SUMMARY',
    'BRIEF DESCRIPTION OF THE DRAWINGS',
    'DETAILED DESCRIPTION',
  ];

  requiredSpecSections.forEach(sectionName => {
    const normalizedName = sectionName.replace(/\s+/g, ' ').toUpperCase();
    const sectionData =
      structuredContent.sections[normalizedName] ||
      structuredContent.sections[sectionName] ||
      structuredContent.sections[sectionName.replace(/\s+/g, '_')];

    // Add section header - bold, underlined, black, 12pt
    specificationParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: sectionName,
            bold: true,
            underline: {},
            font: 'Times New Roman',
            size: 24, // 12pt in half-points
            color: '000000', // black
          }),
        ],
        spacing: {
          ...createSpacing(useDoubleSpacing),
          before: 0, // No space before header
          after: convertInchesToTwip(0.05), // Minimal space after header
        },
      } as any) // Use 'as any' to bypass TypeScript check
    );

    // Add section content or placeholder
    if (sectionData && sectionData.length > 0) {
      const processedLines = processPatentParagraphs(
        sectionData,
        useDoubleSpacing
      );
      specificationParagraphs.push(...processedLines);
    } else {
      // Add placeholder for missing sections
      const placeholder = getPlaceholderText(sectionName);
      specificationParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: placeholder,
              font: 'Times New Roman',
              size: 24, // 12pt in half-points
              color: '000000', // black
            }),
          ],
          spacing: createSpacing(useDoubleSpacing),
        } as any)
      );
    }

    // No extra spacing between sections - let them flow naturally
  });

  // ========================================
  // SECTION 2: CLAIMS (Separate Page)
  // ========================================
  const claimsData =
    structuredContent.sections['CLAIMS'] ||
    structuredContent.sections['CLAIM'] ||
    [];

  const claimsParagraphs: any[] = [
    new Paragraph({
      children: [
        new TextRun({
          text: 'CLAIMS',
          bold: true,
          underline: {},
          font: 'Times New Roman',
          size: 24, // 12pt in half-points
          color: '000000', // black
        }),
      ],
      spacing: {
        ...createSpacing(useDoubleSpacing),
        before: 0, // No space before header
        after: convertInchesToTwip(0.05), // Minimal space after header
      },
    } as any), // Use 'as any' to bypass TypeScript check
  ];

  // No extra spacing after header - content flows immediately

  if (claimsData && claimsData.length > 0) {
    const processedLines = processPatentParagraphs(
      claimsData,
      useDoubleSpacing
    );
    claimsParagraphs.push(...processedLines);
  } else {
    // Add placeholder claims
    claimsParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '1. [Insert independent claim here]',
            font: 'Times New Roman',
            size: 24, // 12pt in half-points
            color: '000000', // black
          }),
        ],
        spacing: createSpacing(useDoubleSpacing),
      } as any)
    );
    claimsParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '2. The method of claim 1, wherein [insert dependent claim limitation here].',
            font: 'Times New Roman',
            size: 24, // 12pt in half-points
            color: '000000', // black
          }),
        ],
        spacing: createSpacing(useDoubleSpacing),
      } as any)
    );
  }

  // ========================================
  // SECTION 3: ABSTRACT (Separate Page)
  // ========================================
  const abstractData = structuredContent.sections['ABSTRACT'] || [];

  const abstractParagraphs: any[] = [
    new Paragraph({
      children: [
        new TextRun({
          text: 'ABSTRACT',
          bold: true,
          underline: {},
          font: 'Times New Roman',
          size: 24, // 12pt in half-points
          color: '000000', // black
        }),
      ],
      spacing: {
        ...createSpacing(useDoubleSpacing),
        before: 0, // No space before header
        after: convertInchesToTwip(0.05), // Minimal space after header
      },
    } as any), // Use 'as any' to bypass TypeScript check
  ];

  // No extra spacing after header - content flows immediately

  if (abstractData && abstractData.length > 0) {
    const processedLines = processPatentParagraphs(
      abstractData,
      useDoubleSpacing
    );
    abstractParagraphs.push(...processedLines);
  } else {
    // Use abstract from analyzedInvention if available
    const generatedContent = analyzedInvention?.generated_content as
      | { sections?: { ABSTRACT?: string } }
      | undefined;

    const abstractText =
      generatedContent?.sections?.ABSTRACT ||
      'Abstract text describing the invention in 150 words or less.';

    abstractParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: abstractText,
            font: 'Times New Roman',
            size: 24, // 12pt in half-points
            color: '000000', // black
          }),
        ],
        spacing: createSpacing(useDoubleSpacing),
      } as any)
    );
  }

  // ========================================
  // CREATE USPTO-COMPLIANT DOCUMENT
  // ========================================

  logger.info(
    '[exportPatentToDocx] Creating USPTO-compliant document with 3 sections:',
    {
      specificationParagraphs: specificationParagraphs.length,
      claimsParagraphs: claimsParagraphs.length,
      abstractParagraphs: abstractParagraphs.length,
      hasPageNumbers: addPageNumbers,
      useDoubleSpacing,
    }
  );

  // Create document with three separate sections as required by USPTO
  // Note: Font styling is handled at the application level in Word
  // The document will default to Times New Roman 12pt when opened
  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'patent-numbering-single-digit',
          levels: [
            {
              level: 0,
              format: 'decimal',
              text: '[000%1] ',
              start: 1,
              style: {
                paragraph: {
                  indent: { left: 0, hanging: 0 },
                },
                run: {
                  font: 'Times New Roman',
                  size: 24,
                  color: '000000',
                },
              },
            },
          ],
        },
        {
          reference: 'patent-numbering-double-digit',
          levels: [
            {
              level: 0,
              format: 'decimal',
              text: '[00%1] ',
              start: 10,
              style: {
                paragraph: {
                  indent: { left: 0, hanging: 0 },
                },
                run: {
                  font: 'Times New Roman',
                  size: 24,
                  color: '000000',
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      // Section 1: Specification
      {
        properties: {
          page: usptoPageProperties,
        },
        children: specificationParagraphs,
      },
      // Section 2: Claims (New Page)
      {
        properties: {
          page: usptoPageProperties,
        },
        children: claimsParagraphs,
      },
      // Section 3: Abstract (New Page)
      {
        properties: {
          page: usptoPageProperties,
        },
        children: abstractParagraphs,
      },
    ],
  } as any);

  // Generate and save the DOCX file
  Packer.toBlob(doc)
    .then(blob => {
      logger.info('[exportPatentToDocx] Generated USPTO-compliant blob:', {
        size: blob.size,
        type: blob.type,
      });
      saveAs(blob, `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`);
    })
    .catch(error => {
      logger.error('[exportPatentToDocx] Error generating DOCX:', error);
      alert(
        'Failed to generate the document. Please check the console for details.'
      );
    });
};

/**
 * Get placeholder text for missing USPTO sections
 */
const getPlaceholderText = (sectionName: string): string => {
  const placeholders: Record<string, string> = {
    'CROSS-REFERENCE TO RELATED APPLICATIONS':
      'This application claims priority to [Prior Application Number] filed [Date], which is incorporated herein by reference in its entirety.',
    'STATEMENT REGARDING FEDERALLY SPONSORED RESEARCH OR DEVELOPMENT':
      'Not applicable.',
    FIELD: 'The present invention relates to [technical field].',
    BACKGROUND:
      'Background information describing the technical field and prior art.',
    SUMMARY:
      'A summary of the invention highlighting the key features and advantages.',
    'BRIEF DESCRIPTION OF THE DRAWINGS':
      'Brief description of any drawings or figures.',
    'DETAILED DESCRIPTION':
      'Detailed description of the invention and preferred embodiments.',
  };

  return placeholders[sectionName] || `Content for ${sectionName} section.`;
};

/**
 * Parse plain text content for export
 */
interface StructuredContent {
  sections: {
    [key: string]: string[];
  };
}

const parsePatentContent = (content: string): StructuredContent => {
  logger.info('[parsePatentContent] Starting parse with content:', {
    length: content.length,
    first100Chars: content.substring(0, 100),
    containsHTML: content.includes('<') && content.includes('>'),
  });

  const result: StructuredContent = {
    sections: {},
  };

  // Split the content into lines
  const lines = content.split('\n');
  logger.info('[parsePatentContent] Split into lines:', {
    lineCount: lines.length,
    first5Lines: lines.slice(0, 5),
  });

  let currentSection = 'Default';
  result.sections[currentSection] = [];

  // First, remove the document title (treat it as metadata, not content)
  let startIndex = 0;
  if (lines.length > 0 && lines[0].trim()) {
    // Skip the first line as it's usually the title
    startIndex = 1;

    // Also skip any blank lines after the title
    while (startIndex < lines.length && !lines[startIndex].trim()) {
      startIndex++;
    }
  }

  // First pass: pre-identify all section headers to avoid duplicates
  const sectionHeaders = new Map<number, string>(); // line index to section name
  const allNormalizedSections = new Map<string, string[]>(); // normalized name to content lines

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    let sectionName = null;

    // Check if this is a section header with asterisks
    if (line.startsWith('**') && line.endsWith('**')) {
      // Extract section name without asterisks
      sectionName = line.substring(2, line.length - 2).trim();
    }
    // Alternative section header format: all caps followed by line breaks
    else if (
      line.match(/^[A-Z\s]+$/) &&
      line.length > 3 &&
      (!lines[i - 1] || lines[i - 1].trim() === '') &&
      (!lines[i + 1] || lines[i + 1].trim() === '')
    ) {
      sectionName = line.trim();
    }

    // If we found a section header
    if (sectionName) {
      // Normalize section name
      const normalizedName = sectionName.toUpperCase();

      // Register this as a section header
      sectionHeaders.set(i, normalizedName);

      // Initialize the section's content array if needed
      if (!allNormalizedSections.has(normalizedName)) {
        allNormalizedSections.set(normalizedName, []);
      }
    }
  }

  // Second pass: gather all content by normalized section names
  currentSection = 'Default';
  let currentNormalizedSection = 'DEFAULT';

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();

    // If this line is a section header, switch to that section
    if (sectionHeaders.has(i)) {
      currentNormalizedSection = sectionHeaders.get(i) || 'DEFAULT';
      continue; // Skip the header line itself
    }

    // Skip single character lines that might be stray characters
    if (line.length === 1 && i > 0 && sectionHeaders.has(i - 1)) {
      continue;
    }

    // Add content to the current section
    if (line || allNormalizedSections.get(currentNormalizedSection)?.length) {
      const sectionContent =
        allNormalizedSections.get(currentNormalizedSection) || [];
      if (line) {
        sectionContent.push(line);
      } else {
        sectionContent.push(''); // Empty line
      }
      allNormalizedSections.set(currentNormalizedSection, sectionContent);
    }
  }

  // Build the final sections object
  allNormalizedSections.forEach((contentLines, normalizedName) => {
    if (normalizedName !== 'DEFAULT' || contentLines.length > 0) {
      // Remove empty lines at the start and end of each section
      while (contentLines.length > 0 && contentLines[0] === '') {
        contentLines.shift();
      }
      while (
        contentLines.length > 0 &&
        contentLines[contentLines.length - 1] === ''
      ) {
        contentLines.pop();
      }

      // Only add non-empty sections
      if (contentLines.length > 0 || normalizedName !== 'DEFAULT') {
        result.sections[normalizedName] = contentLines;
      }
    }
  });

  // Ensure we don't have both FIELD and empty FIELD
  if (result.sections['FIELD'] && result.sections['FIELD'].length === 0) {
    delete result.sections['FIELD'];
  }

  // If we have multiple sections that start with the same name (e.g., "FIELD"),
  // combine them into one section
  const sectionPrefixes = new Map<string, string[]>();

  Object.keys(result.sections).forEach(sectionName => {
    // Skip default section
    if (sectionName === 'Default' || sectionName === 'DEFAULT') return;

    // Check all other sections to see if they start with this name
    const parts = sectionName.split(' ');
    if (parts.length > 0) {
      const prefix = parts[0];
      if (!sectionPrefixes.has(prefix)) {
        sectionPrefixes.set(prefix, []);
      }
      sectionPrefixes.get(prefix)?.push(sectionName);
    }
  });

  // Merge sections with the same prefix
  sectionPrefixes.forEach((relatedSections, _prefix) => {
    if (relatedSections.length > 1) {
      const primarySection = relatedSections[0];

      // Merge all related sections into the primary one
      for (let i = 1; i < relatedSections.length; i++) {
        const secondarySection = relatedSections[i];

        if (
          result.sections[primarySection].length === 0 &&
          result.sections[secondarySection].length > 0
        ) {
          // If primary is empty but secondary has content, use secondary's content
          result.sections[primarySection] = [
            ...result.sections[secondarySection],
          ];
        } else if (result.sections[secondarySection].length > 0) {
          // Otherwise append secondary content to primary if secondary has content
          result.sections[primarySection] = [
            ...result.sections[primarySection],
            '', // Add an empty line between sections
            ...result.sections[secondarySection],
          ];
        }

        // Remove the secondary section
        delete result.sections[secondarySection];
      }
    }
  });

  return result;
};

/**
 * Create DOCX paragraphs from structured content
 */
const createDocxParagraphs = (
  content: StructuredContent,
  analyzedInvention: InventionData | null,
  docxClasses: { Paragraph: any; HeadingLevel: any }
): any[] => {
  const paragraphs: any[] = [];

  // Skip sections we don't want to include
  const skipSections = ['DEFAULT', 'FIELD T'];

  // Process each section
  Object.entries(content.sections).forEach(([sectionName, lines]) => {
    // Skip the default section or sections we want to exclude
    if (
      sectionName === 'Default' ||
      sectionName === 'DEFAULT' ||
      skipSections.includes(sectionName)
    ) {
      return;
    }

    // Add section header (except for default)
    if (sectionName !== 'Default') {
      paragraphs.push(
        new docxClasses.Paragraph({
          text: sectionName.toUpperCase(),
          heading: docxClasses.HeadingLevel.HEADING_2,
          spacing: {
            before: 400,
            after: 200,
          },
        })
      );
    }

    // Add section content
    lines.forEach(line => {
      if (!line) {
        // Empty line for spacing
        paragraphs.push(new docxClasses.Paragraph({}));
      } else {
        paragraphs.push(
          new docxClasses.Paragraph({
            text: line,
          })
        );
      }
    });
  });

  // Check if abstract is missing
  const generatedContent = analyzedInvention?.generated_content as
    | {
        sections?: { ABSTRACT?: string };
      }
    | undefined;

  if (
    generatedContent?.sections?.ABSTRACT &&
    !content.sections['ABSTRACT'] &&
    !content.sections['Abstract']
  ) {
    // Add abstract section
    paragraphs.push(
      new docxClasses.Paragraph({
        text: 'ABSTRACT',
        heading: docxClasses.HeadingLevel.HEADING_2,
        spacing: {
          before: 800,
          after: 200,
        },
      })
    );

    // Add abstract content
    paragraphs.push(
      new docxClasses.Paragraph({
        text: generatedContent.sections.ABSTRACT,
      })
    );
  }

  return paragraphs;
};

/**
 * Export the patent document as a properly formatted PDF file
 */
export const exportPatentToPdf = (
  content: string,
  analyzedInvention: InventionData | null,
  options: ExportOptions = {}
): void => {
  const {
    title = analyzedInvention?.title || 'Patent Application',
    showDocketNumber = false,
    docketNumber = 'Attorney Docket No. 12345-001',
  } = options;

  // Create a temporary hidden div to hold formatted content
  const tempDiv = document.createElement('div');
  tempDiv.style.visibility = 'hidden';
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '-9999px';
  document.body.appendChild(tempDiv);

  // Add print-specific CSS
  const style = document.createElement('style');
  style.textContent = `
    @page {
      size: 8.5in 11in;
      margin: 1in;
    }
    .patent-export {
      font-family: "Times New Roman", Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      color: black;
    }
    .patent-export h1 {
      text-align: center;
      font-size: 14pt;
      margin: 1.5em 0;
    }
    .patent-export h2 {
      font-size: 12pt;
      text-transform: uppercase;
      margin: 1.5em 0 0.5em 0;
      border-bottom: 1px solid black;
      padding-bottom: 0.2em;
    }
    .patent-export p {
      /* Remove default first-line indent */
      text-indent: 0;
      margin: 0.5em 0;
    }
    .patent-export .docket {
      text-align: left;
      margin-bottom: 1em;
    }
    .patent-export .section-content {
      margin-bottom: 1em;
    }
  `;
  tempDiv.appendChild(style);

  // Create container for the export
  const exportDiv = document.createElement('div');
  exportDiv.className = 'patent-export';
  tempDiv.appendChild(exportDiv);

  // Add docket number if requested
  if (showDocketNumber) {
    const docketP = document.createElement('p');
    docketP.className = 'docket';
    docketP.textContent = docketNumber;
    exportDiv.appendChild(docketP);
  }

  // Add title
  const titleH1 = document.createElement('h1');
  titleH1.textContent = title;
  exportDiv.appendChild(titleH1);

  // Parse content
  const structuredContent = parsePatentContent(content);

  // Process each section
  Object.entries(structuredContent.sections).forEach(([sectionName, lines]) => {
    // Skip the default section or sections we want to exclude
    if (
      sectionName === 'Default' ||
      sectionName === 'DEFAULT' ||
      ['FIELD T'].includes(sectionName)
    ) {
      return;
    }

    // Add section header (except for default)
    if (sectionName !== 'Default') {
      const h2 = document.createElement('h2');
      h2.textContent = sectionName.toUpperCase();
      exportDiv.appendChild(h2);
    }

    // Create section content container
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'section-content';
    exportDiv.appendChild(sectionDiv);

    // Add section content
    lines.forEach(line => {
      if (!line) {
        // Empty paragraph for spacing
        const emptyP = document.createElement('p');
        emptyP.innerHTML = '&nbsp;';
        sectionDiv.appendChild(emptyP);
      } else {
        const p = document.createElement('p');
        p.textContent = line;
        sectionDiv.appendChild(p);
      }
    });
  });

  // Check if abstract is missing
  const pdfGeneratedContent = analyzedInvention?.generated_content as
    | {
        sections?: { ABSTRACT?: string };
      }
    | undefined;

  if (
    pdfGeneratedContent?.sections?.ABSTRACT &&
    !structuredContent.sections['ABSTRACT'] &&
    !structuredContent.sections['Abstract']
  ) {
    // Add abstract section
    const h2 = document.createElement('h2');
    h2.textContent = 'ABSTRACT';
    exportDiv.appendChild(h2);

    // Create section content container
    const abstractDiv = document.createElement('div');
    abstractDiv.className = 'section-content';
    exportDiv.appendChild(abstractDiv);

    // Add abstract content
    const p = document.createElement('p');
    p.textContent = pdfGeneratedContent.sections.ABSTRACT;
    abstractDiv.appendChild(p);
  }

  // Print the document
  setTimeout(() => {
    window.print();
    // Remove the temporary div after printing
    document.body.removeChild(tempDiv);
  }, 500);
};

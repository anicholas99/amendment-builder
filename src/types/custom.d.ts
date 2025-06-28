declare module 'docx' {
  interface SectionProperties {
    page?: {
      margin?: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
      };
      size?: {
        width?: number;
        height?: number;
      };
    };
    [key: string]: unknown;
  }

  interface DocumentOptions {
    sections: {
      properties?: SectionProperties;
      children: unknown[];
    }[];
  }

  interface ParagraphOptions {
    text?: string;
    heading?: HeadingLevel;
    alignment?: AlignmentType;
    spacing?: {
      before?: number;
      after?: number;
    };
  }

  interface TextRunOptions {
    text?: string;
    bold?: boolean;
    italics?: boolean;
    underline?: {
      type?: string;
      color?: string;
    };
    size?: number;
    font?: string;
    color?: string;
    [key: string]: unknown;
  }

  export class Document {
    constructor(options: DocumentOptions);
  }

  export class Paragraph {
    constructor(options: ParagraphOptions);
  }

  export class TextRun {
    constructor(options: TextRunOptions);
  }

  export enum HeadingLevel {
    TITLE = 'TITLE',
    HEADING_1 = 'HEADING_1',
    HEADING_2 = 'HEADING_2',
    HEADING_3 = 'HEADING_3',
  }

  export enum AlignmentType {
    LEFT = 'left',
    CENTER = 'center',
    RIGHT = 'right',
    JUSTIFIED = 'justified',
  }

  export class Packer {
    static toBlob(doc: Document): Promise<Blob>;
  }
}

export interface ContentBasedParagraphNumberingOptions {
  startNumber: number;
  formatNumber: (num: number) => string;
  className: string;
  enabled: boolean;
}

export interface ParagraphUpdate {
  pos: number;
  action: 'update' | 'add';
  oldNumber?: string;
  newNumber: string;
}

export interface ParagraphToNumber {
  node: any;
  pos: number;
  section: string;
}

export interface NumberToRemove {
  pos: number;
  length: number;
}

export type PatentSection = 'DESCRIPTION' | 'CLAIMS' | 'ABSTRACT' | '';

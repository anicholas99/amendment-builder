declare module 'pdf-poppler' {
  export interface ConvertOptions {
    format?: 'png' | 'jpeg';
    out_dir: string;
    out_prefix?: string;
    page?: number | null;
    scale?: number;
  }

  export function convert(pdfPath: string, options: ConvertOptions): Promise<string[]>;
} 
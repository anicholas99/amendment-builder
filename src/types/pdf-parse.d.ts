declare module 'pdf-parse' {
  interface PDFInfo {
    PDFFormatVersion?: string;
    IsAcroFormPresent?: boolean;
    IsXFAPresent?: boolean;
    Title?: string;
    Author?: string;
    Subject?: string;
    Keywords?: string;
    Creator?: string;
    Producer?: string;
    CreationDate?: string;
    ModDate?: string;
    Trapped?: string;
  }

  interface PDFData {
    text: string;
    numpages: number;
    info: PDFInfo;
  }

  function PDFParse(dataBuffer: Buffer): Promise<PDFData>;
  export default PDFParse;
}

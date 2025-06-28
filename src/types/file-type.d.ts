declare module 'file-type' {
  // Minimal typings to silence TypeScript until proper @types/file-type or built-in types are available
  export interface FileTypeResult {
    ext: string;
    mime: string;
  }
  export function fileTypeFromFile(
    path: string
  ): Promise<FileTypeResult | undefined>;
}

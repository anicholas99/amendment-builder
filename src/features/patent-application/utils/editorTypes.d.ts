/**
 * Type declarations for editor utility modules
 */

declare module '../utils/editorTransformations' {
  export function transformPlainTextToHtml(content: string): string;
  export function transformHtmlToPlainText(html: string): string;
}

declare module '../utils/editorStyles' {
  export const EDITOR_STYLES: (zoomLevel: number) => Record<string, any>;
}

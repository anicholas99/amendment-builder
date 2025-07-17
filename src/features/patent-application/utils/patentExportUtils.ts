import { logger } from '@/utils/clientLogger';
import { InventionData } from '@/types/invention';

export const extractProjectIdFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;

  const url = window.location.pathname;
  const matches = url.match(/\/projects\/([^\/]+)/);
  return matches ? matches[1] : null;
};

export const handlePatentExport = async (
  content: string | null,
  patentTitle: string,
  analyzedInvention: InventionData | null,
  editor?: any // Editor instance for getting content
) => {
  logger.info('[PatentMainPanel] Export DOCX clicked', {
    hasContent: !!content,
    contentLength: content?.length || 0,
    contentSample: content?.substring(0, 100) || 'No content',
    patentTitle,
    hasAnalyzedInvention: !!analyzedInvention,
    hasEditor: !!editor,
  });

  if (!content) {
    logger.warn('[PatentMainPanel] No content available for export');
    return;
  }

  try {
    // Get current content from editor (which includes paragraph numbers if enabled)
    let exportContent = content;
    if (editor) {
      logger.info('[PatentMainPanel] Getting current editor content');
      exportContent = editor.getHTML();
    }

    const { exportPatentToDocx } = await import('../utils/editorExport');
    await exportPatentToDocx(exportContent, analyzedInvention, {
      showDocketNumber: false,
    });
  } catch (error) {
    logger.error('Error exporting to DOCX:', error);
  }
};

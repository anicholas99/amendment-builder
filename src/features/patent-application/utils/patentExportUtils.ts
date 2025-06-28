import { logger } from '@/lib/monitoring/logger';
import { InventionData } from '@/types/invention';

export const handlePatentExport = async (
  content: string | null,
  patentTitle: string,
  analyzedInvention: InventionData | null
) => {
  logger.info('[PatentMainPanel] Export DOCX clicked', {
    hasContent: !!content,
    contentLength: content?.length || 0,
    contentSample: content?.substring(0, 100) || 'No content',
    patentTitle,
    hasAnalyzedInvention: !!analyzedInvention,
  });

  if (!content) {
    logger.warn('[PatentMainPanel] No content available for export');
    return;
  }

  try {
    const { exportPatentToDocx } = await import('../utils/editorExport');
    await exportPatentToDocx(content, analyzedInvention, {
      showDocketNumber: false,
    });
  } catch (error) {
    logger.error('Error exporting to DOCX:', error);
  }
};

export const extractProjectIdFromUrl = (): string => {
  if (typeof window !== 'undefined') {
    const url = window.location.pathname;
    const matches = url.match(/\/projects\/([^\/]+)/);
    if (matches && matches[1]) {
      return matches[1];
    }
  }
  return '';
};

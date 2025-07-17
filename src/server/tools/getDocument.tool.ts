import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { prisma } from '@/lib/prisma';

/**
 * Retrieves the content of a specific document
 * This tool allows the AI to fetch document content on demand
 * rather than loading everything into the system prompt
 */
export async function getDocument(
  projectId: string,
  tenantId: string,
  documentId?: string,
  fileName?: string
): Promise<{
  document: {
    id: string;
    fileName: string;
    fileType: string;
    content: string | null;
    metadata: any;
  } | null;
  error?: string;
}> {
  try {
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database connection unavailable'
      );
    }

    // Require either documentId or fileName
    if (!documentId && !fileName) {
      return {
        document: null,
        error:
          'Please provide either documentId or fileName to retrieve the document',
      };
    }

    // Try ProjectDocument table first (user uploads)
    let document = null;

    if (documentId) {
      document = await (prisma as any).projectDocument.findFirst({
        where: {
          id: documentId,
          projectId,
        },
        select: {
          id: true,
          fileName: true,
          fileType: true,
          extractedText: true,
          extractedMetadata: true,
        },
      });
    } else if (fileName) {
      document = await (prisma as any).projectDocument.findFirst({
        where: {
          projectId,
          OR: [
            { fileName: { contains: fileName } },
            { originalName: { contains: fileName } },
          ],
        },
        select: {
          id: true,
          fileName: true,
          fileType: true,
          extractedText: true,
          extractedMetadata: true,
        },
      });
    }

    if (document) {
      return {
        document: {
          id: document.id,
          fileName: document.fileName,
          fileType: document.fileType,
          content: document.extractedText,
          metadata: document.extractedMetadata
            ? JSON.parse(document.extractedMetadata)
            : null,
        },
      };
    }

    // If not found in ProjectDocument, try SavedPriorArt (for backward compatibility)
    let priorArt = null;

    if (documentId) {
      priorArt = await prisma.savedPriorArt.findFirst({
        where: {
          id: documentId,
          projectId,
        },
        select: {
          id: true,
          patentNumber: true,
          title: true,
          abstract: true,
          claim1: true,
        },
      });
    } else if (fileName) {
      priorArt = await prisma.savedPriorArt.findFirst({
        where: {
          projectId,
          OR: [
            { patentNumber: { contains: fileName } },
            { title: { contains: fileName } },
          ],
        },
        select: {
          id: true,
          patentNumber: true,
          title: true,
          abstract: true,
          claim1: true,
        },
      });
    }

    if (priorArt) {
      // Construct content from available fields
      let content = '';
      if (priorArt.title) content += `Title: ${priorArt.title}\n\n`;
      if (priorArt.abstract) content += `Abstract: ${priorArt.abstract}\n\n`;
      if (priorArt.claim1) content += `Claim 1: ${priorArt.claim1}\n`;

      return {
        document: {
          id: priorArt.id,
          fileName: priorArt.patentNumber,
          fileType: 'prior-art',
          content: content || 'No content available',
          metadata: {
            title: priorArt.title,
            patentNumber: priorArt.patentNumber,
          },
        },
      };
    }

    return {
      document: null,
      error: `Document not found. Available documents can be seen in the project context.`,
    };
  } catch (error) {
    logger.error('[GetDocument] Failed to retrieve document', {
      projectId,
      documentId,
      fileName,
      error,
    });

    return {
      document: null,
      error: 'Failed to retrieve document content',
    };
  }
}

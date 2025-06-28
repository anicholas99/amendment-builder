import { logger } from '@/lib/monitoring/logger';
import { extractSections } from '../utils/patent-sections';
import { ApplicationVersionWithDocuments } from '@/types/versioning';

interface SectionUpdate {
  documentId: string;
  documentType: string;
  content: string;
  sectionName: string;
}

/**
 * Service for synchronizing patent content with individual section documents
 * Centralizes section extraction and matching logic
 */
export class SectionSyncService {
  // Map common section name variations to database document types
  private static readonly SECTION_TYPE_MAP: Record<string, string> = {
    CLAIMS: 'CLAIM_SET',
    CLAIM: 'CLAIM_SET',
    CLAIM_SET: 'CLAIM_SET',
    // Add other mappings if needed
  };

  /**
   * Extract sections from content and prepare updates for changed sections
   */
  static extractSectionUpdates(
    content: string,
    currentVersion: ApplicationVersionWithDocuments,
    lastSavedContent: Map<string, string>
  ): SectionUpdate[] {
    const updates: SectionUpdate[] = [];

    try {
      const extractedSections = extractSections(content);
      logger.debug('[SectionSyncService] Extracted sections', {
        count: Object.keys(extractedSections).length,
        names: Object.keys(extractedSections),
      });

      Object.entries(extractedSections).forEach(
        ([sectionName, sectionContent]) => {
          const docType = this.normalizeDocumentType(sectionName);
          const sectionDoc = currentVersion.documents.find(
            d => d.type === docType
          );

          if (sectionDoc) {
            // Check if content changed
            const lastSaved = lastSavedContent.get(sectionDoc.id);
            if (
              sectionContent !== lastSaved &&
              sectionContent !== sectionDoc.content
            ) {
              logger.debug('[SectionSyncService] Section changed', {
                sectionName,
                docType: sectionDoc.type,
                docId: sectionDoc.id,
              });

              updates.push({
                documentId: sectionDoc.id,
                documentType: sectionDoc.type,
                content: sectionContent,
                sectionName,
              });
            }
          } else {
            logger.debug('[SectionSyncService] Section document not found', {
              sectionName,
              attemptedDocType: docType,
              availableTypes: currentVersion.documents.map(d => d.type),
            });
          }
        }
      );

      return updates;
    } catch (error) {
      logger.error('[SectionSyncService] Error extracting sections', { error });
      return [];
    }
  }

  /**
   * Normalize section names to match database document types
   */
  private static normalizeDocumentType(sectionName: string): string {
    const upperName = sectionName.toUpperCase().replace(/\s+/g, '_');

    // Check if we have a mapping for this section
    if (this.SECTION_TYPE_MAP[upperName]) {
      return this.SECTION_TYPE_MAP[upperName];
    }

    // Default transformation
    return upperName;
  }
}

/**
 * Migration Helpers for Client Services
 *
 * These helpers provide backward compatibility during the migration
 * from singleton services to context-based services.
 *
 * @deprecated These will be removed once all code is migrated to use hooks
 */

import { DocumentClientService } from './document.client-service';
import { StorageClientService } from './storage.client-service';
import { FigureClientService } from './figure.client-service';
import { ClaimClientService } from './claim.client-service';
import { InventionClientService } from './invention.client-service';
import { ChatClientService } from './chat.client-service';
import { SearchHistoryClientService } from './search-history.client-service';
import { BlobStorageClientService } from './storage/blob-storage.client-service';
import { logger } from '@/utils/clientLogger';

// Create singleton instances for backward compatibility
// These are safe for now as they're client-side only
export const documentClientService = new DocumentClientService();
export const storageClientService = new StorageClientService();
export const figureClientService = new FigureClientService();
export const claimClientService = new ClaimClientService();
export const inventionClientService = new InventionClientService();
export const chatClientService = new ChatClientService();
export const searchHistoryClientService = new SearchHistoryClientService();
export const blobStorageClientService = new BlobStorageClientService();

// Log deprecation warning in development
if (process.env.NODE_ENV === 'development') {
  logger.warn(
    '⚠️  Using singleton client services is deprecated. ' +
      'Please migrate to using hooks from @/contexts/ClientServicesContext:\n' +
      '- useDocumentService()\n' +
      '- useStorageService()\n' +
      '- useFigureService()\n' +
      '- useClaimService()\n' +
      '- useInventionService()\n' +
      '- useChatService()\n' +
      '- useSearchHistoryService()\n' +
      '- useBlobStorageService()'
  );
}

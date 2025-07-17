import React, { createContext, useContext, useRef, ReactNode } from 'react';
import { StorageClientService } from '@/client/services/storage.client-service';
import { FigureClientService } from '@/client/services/figure.client-service';
import { DocumentClientService } from '@/client/services/document.client-service';
import { ClaimClientService } from '@/client/services/claim.client-service';
import { InventionClientService } from '@/client/services/invention.client-service';
import { ChatClientService } from '@/client/services/chat.client-service';
import { SearchHistoryClientService } from '@/client/services/search-history.client-service';
import { BlobStorageClientService } from '@/client/services/storage/blob-storage.client-service';

interface ClientServicesContextValue {
  storageService: StorageClientService;
  figureService: FigureClientService;
  documentService: DocumentClientService;
  claimService: ClaimClientService;
  inventionService: InventionClientService;
  chatService: ChatClientService;
  searchHistoryService: SearchHistoryClientService;
  blobStorageService: BlobStorageClientService;
}

const ClientServicesContext = createContext<
  ClientServicesContextValue | undefined
>(undefined);

export function ClientServicesProvider({ children }: { children: ReactNode }) {
  // Create single instances per React app lifecycle
  // This is safe because they're client-side and tied to the user's session
  const servicesRef = useRef<ClientServicesContextValue>();

  if (!servicesRef.current) {
    servicesRef.current = {
      storageService: new StorageClientService(),
      figureService: new FigureClientService(),
      documentService: new DocumentClientService(),
      claimService: new ClaimClientService(),
      inventionService: new InventionClientService(),
      chatService: new ChatClientService(),
      searchHistoryService: new SearchHistoryClientService(),
      blobStorageService: new BlobStorageClientService(),
    };
  }

  return (
    <ClientServicesContext.Provider value={servicesRef.current}>
      {children}
    </ClientServicesContext.Provider>
  );
}

export function useClientServices(): ClientServicesContextValue {
  const context = useContext(ClientServicesContext);

  if (!context) {
    throw new Error(
      'useClientServices must be used within ClientServicesProvider'
    );
  }

  return context;
}

// Convenience hooks for individual services
export const useStorageService = () => useClientServices().storageService;
export const useFigureService = () => useClientServices().figureService;
export const useDocumentService = () => useClientServices().documentService;
export const useClaimService = () => useClientServices().claimService;
export const useInventionService = () => useClientServices().inventionService;
export const useChatService = () => useClientServices().chatService;
export const useSearchHistoryService = () =>
  useClientServices().searchHistoryService;
export const useBlobStorageService = () =>
  useClientServices().blobStorageService;

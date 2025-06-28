import { InventionClientService } from '@/client/services/invention.client-service';

/**
 * Reads a text file and returns its content
 * @param file The text file to read
 * @returns Promise resolving to the text content
 */
export const readTextFile = async (file: File): Promise<string> => {
  return await file.text();
};

/**
 * Processes a file through the server API using the service layer
 * @param file The file to process
 * @returns Promise resolving to the server response
 */
export const processFileOnServer = async (
  file: File
): Promise<{
  url?: string;
  fileName?: string;
  type?: string;
}> => {
  if (file.type.startsWith('image/')) {
    // Handle figure uploads - note: this may need projectId parameter
    throw new Error(
      'Figure uploads require a projectId parameter. Use InventionClientService.uploadFigure() directly.'
    );
  } else {
    // Handle document uploads using the service layer
    return InventionClientService.uploadDocument(file);
  }
};

/**
 * Extracts text from a document file using the service layer
 * @param file The document file to extract text from
 * @returns Promise resolving to extracted text and metadata
 */
export const extractTextFromFile = async (file: File) => {
  return InventionClientService.extractText(file);
};

/**
 * Processes a document file completely (upload + extract + structure)
 * @param file The document file to process
 * @returns Promise resolving to structured invention data
 */
export const processDocumentCompletely = async (file: File) => {
  return InventionClientService.processDocumentFile(file);
};

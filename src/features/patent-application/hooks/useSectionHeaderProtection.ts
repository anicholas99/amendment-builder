import { useState, useCallback, useRef, useEffect } from 'react';
import { logger } from '@/utils/clientLogger';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useToast } from '@/hooks/useToastWrapper';

// Helper function to extract H2 headers (can be moved to utils if preferred)
const extractHeaders = (html: string): Set<string> => {
  if (!html) return new Set<string>();
  try {
    // Use DOMParser only if in browser environment
    if (
      typeof window !== 'undefined' &&
      typeof window.DOMParser === 'function'
    ) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const headerElements = doc.querySelectorAll('h2');
      const headers = new Set<string>();
      headerElements.forEach(header => {
        const text = header.textContent?.trim();
        if (text) headers.add(text);
      });
      return headers;
    }
  } catch (e) {
    logger.error('Error parsing HTML for headers:', e);
  }
  return new Set<string>(); // Return empty set if not in browser or error occurs
};

interface UseSectionHeaderProtectionProps {
  currentHtmlContent: string;
  onContentUpdate: (newHtml: string) => void; // Callback to update editor content
}

export const useSectionHeaderProtection = ({
  currentHtmlContent,
  onContentUpdate,
}: UseSectionHeaderProtectionProps) => {
  const toast = useToast();
  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure();
  const [deletedHeaderName, setDeletedHeaderName] = useState<string | null>(
    null
  );
  const prevHeadersRef = useRef<Set<string>>(
    extractHeaders(currentHtmlContent)
  );
  const pendingHtmlRef = useRef<string | null>(null); // Store HTML content that triggered the alert

  // Update prevHeadersRef whenever the canonical currentHtmlContent changes externally
  // This ensures we have the correct baseline when checkHeaderDeletion is called
  useEffect(() => {
    prevHeadersRef.current = extractHeaders(currentHtmlContent);
  }, [currentHtmlContent]);

  const handleAlertConfirm = useCallback(() => {
    if (pendingHtmlRef.current !== null) {
      // Allow deletion: update content and prevHeaders
      const newHtml = pendingHtmlRef.current;
      prevHeadersRef.current = extractHeaders(newHtml); // Update baseline
      onContentUpdate(newHtml); // Update editor state
    }
    onAlertClose();
    setDeletedHeaderName(null);
    pendingHtmlRef.current = null;
    toast({
      title: 'Section header deleted',
      description: 'The section header has been removed.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  }, [onContentUpdate, onAlertClose, toast]);

  const handleAlertCancel = useCallback(() => {
    // Prevent deletion: Do not call onContentUpdate with pendingHtmlRef.current
    // Editor content should ideally remain unchanged or reverted by Tiptap's history
    onAlertClose();
    setDeletedHeaderName(null);
    pendingHtmlRef.current = null;
    toast({
      title: 'Deletion canceled',
      description: 'The section header was not deleted.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }, [onAlertClose, toast]);

  // Function called by the editor's onChange handler
  const checkHeaderDeletion = useCallback(
    (newHtml: string): boolean => {
      const currentHeaders = extractHeaders(newHtml);
      const previousHeaders = prevHeadersRef.current;
      let headerWasDeleted = false;
      let deletedHeader: string | null = null;

      previousHeaders.forEach(header => {
        if (!currentHeaders.has(header)) {
          headerWasDeleted = true;
          deletedHeader = header;
          // Break is not possible in forEach, but we only care if *any* header was deleted
        }
      });

      if (headerWasDeleted && deletedHeader) {
        logger.info(`Header deleted: "${deletedHeader}". Opening alert.`);
        setDeletedHeaderName(deletedHeader);
        pendingHtmlRef.current = newHtml; // Store the content that caused the deletion attempt
        onAlertOpen();
        return true; // Indicate that deletion was detected and alert is shown
      }

      // No deletion detected OR deletion allowed previously, update baseline for next check
      // Important: Only update prevHeadersRef if no alert was triggered OR after confirmation
      prevHeadersRef.current = currentHeaders;
      pendingHtmlRef.current = null; // Clear pending state if no alert triggered
      return false; // Indicate no deletion alert was triggered
    },
    [onAlertOpen]
  ); // Dependency on onAlertOpen

  return {
    isAlertOpen,
    alertHeaderName: deletedHeaderName,
    handleAlertConfirm,
    handleAlertCancel,
    checkHeaderDeletion,
  };
};

import { useState, useRef } from 'react';

export const useExtractionState = () => {
  const [extractingReferenceNumber, setExtractingReferenceNumber] = useState<
    string | null
  >(null);
  const extractingReferenceRef = useRef<string | null>(null);
  const [extractionTrigger, setExtractionTrigger] = useState(0);

  const setExtractingReference = (referenceNumber: string | null) => {
    setExtractingReferenceNumber(referenceNumber);
    extractingReferenceRef.current = referenceNumber;
    // Force re-render when setting the ref
    setExtractionTrigger(prev => prev + 1);
  };

  const clearExtractingReference = (referenceNumber: string) => {
    if (extractingReferenceRef.current === referenceNumber) {
      extractingReferenceRef.current = null;
      // Force re-render when clearing the ref
      setExtractionTrigger(prev => prev + 1);
    }
    if (extractingReferenceNumber === referenceNumber) {
      setExtractingReferenceNumber(null);
    }
  };

  return {
    extractingReferenceNumber,
    setExtractingReferenceNumber,
    extractingReferenceRef,
    extractionTrigger,
    setExtractionTrigger,
    setExtractingReference,
    clearExtractingReference,
  };
};

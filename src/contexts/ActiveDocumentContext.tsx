import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ActiveDocument {
  projectId: string;
  documentType: 'technology' | 'claim-refinement' | 'patent';
  content: string;
}

interface ActiveDocumentContextType {
  activeDocument: ActiveDocument | null;
  setActiveDocument: (document: ActiveDocument | null) => void;
}

const ActiveDocumentContext = createContext<
  ActiveDocumentContextType | undefined
>(undefined);

export function ActiveDocumentProvider({ children }: { children: ReactNode }) {
  const [activeDocument, setActiveDocument] = useState<ActiveDocument | null>(
    null
  );

  return (
    <ActiveDocumentContext.Provider
      value={{ activeDocument, setActiveDocument }}
    >
      {children}
    </ActiveDocumentContext.Provider>
  );
}

export function useActiveDocument() {
  const context = useContext(ActiveDocumentContext);
  if (!context) {
    throw new Error(
      'useActiveDocument must be used within ActiveDocumentProvider'
    );
  }
  return context;
}

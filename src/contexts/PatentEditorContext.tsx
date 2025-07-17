import React, { createContext, useContext, ReactNode } from 'react';
import { Editor } from '@tiptap/react';

interface PatentEditorContextType {
  editor: Editor | null;
}

const PatentEditorContext = createContext<PatentEditorContextType | undefined>(
  undefined
);

export const PatentEditorProvider: React.FC<{
  editor: Editor | null;
  children: ReactNode;
}> = ({ editor, children }) => {
  return (
    <PatentEditorContext.Provider value={{ editor }}>
      {children}
    </PatentEditorContext.Provider>
  );
};

export const usePatentEditor = () => {
  const context = useContext(PatentEditorContext);
  if (context === undefined) {
    // Return null editor instead of throwing - graceful degradation
    return { editor: null };
  }
  return context;
};

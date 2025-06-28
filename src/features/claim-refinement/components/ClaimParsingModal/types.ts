export type ParsedElement = {
  label: string;
  text: string;
  emphasized: boolean;
};

export type InventionData = {
  title?: string;
  technical_field?: string;
  novelty?: string;
  features?: string[];
  background?: string;
};

export type ClaimParsingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  parsedElements: ParsedElement[];
  searchQueries: string[];
  isLoading: boolean;
  inventionData: InventionData;
  searchMode: 'basic' | 'advanced';
  onExecuteSearch: (
    editedElements: ParsedElement[],
    editedQueries: string[]
  ) => void;
};

export type ElementSectionProps = {
  editableParsedElements: ParsedElement[];
  handleElementLabelChange: (index: number, newLabel: string) => void;
  handleElementEmphasisToggle: (index: number) => void;
  handleElementTextChange: (index: number, newText: string) => void;
  handleRemoveElement: (index: number) => void;
};

export type QuerySectionProps = {
  editableSearchQueries: string[];
  handleQueryChange: (index: number, newQuery: string) => void;
  onCopy: () => void;
  hasCopied: boolean;
  copyQuery: (index: number, text: string) => void;
  copiedQueryIndex: number | null;
};

export type ConfirmationSectionProps = {
  emphasizedElementsCount: number;
};

export type FooterButtonsProps = {
  currentStep: number;
  searchMode: 'basic' | 'advanced';
  isLoading: boolean;
  isGeneratingQueries: boolean;
  onClose: () => void;
  handleBack: () => void;
  generateQueries: () => void;
  handleExecuteWithEdited: () => void;
};

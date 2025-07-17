// Raw data returned from search APIs or citation extraction
export interface PriorArtReference {
  number: string;
  patentNumber: string;
  title: string;
  abstract?: string;
  source: 'GooglePatents' | 'PatBase' | 'Manual';
  relevance: number;
  claimOverlapScore?: number;
  sourceUrl?: string;
  url?: string; // Alternative URL field
  year?: string;
  authors?: string[];
  publicationDate?: string;
  relevantText?: string;
  CPCs?: string[];
  IPCs?: string[];
  otherFamilyMembers?: FamilyMemberReference[];
  isExcluded?: boolean; // Flag to indicate if this reference is excluded from future searches
  citationStatus?: string | null; // Status of the citation job for this reference
  searchAppearanceCount?: number; // Number of times this reference appeared across searches
  isMock?: boolean; // For mock data in development
  isGuaranteedQuery?: boolean; // For guaranteed query results
  id?: string;
  [key: string]: unknown; // for flexibility
}

// Type for family members
export interface FamilyMemberReference {
  number: string;
  title?: string;
  relevance?: number;
  relevancy?: number; // Keep both for now in case source data varies
  url?: string;
  CPCs?: string[];
  IPCs?: string[];
}

export interface PriorArtDataToSave {
  patentNumber: string;
  title?: string;
  abstract?: string;
  url?: string;
  notes?: string;
  authors?: string;
  publicationDate?: string;
  savedCitationsData?: string; // JSON string of SavedCitationUI[]
  claim1?: string; // Main independent claim - what the prior art actually claims
  summary?: string; // Brief summary of the invention - what problem it solves and how
}

// DB record from SavedPriorArt model (matches Prisma schema)
export interface SavedPriorArt {
  id: string;
  projectId: string;
  patentNumber: string;
  title?: string | null;
  abstract?: string | null;
  url?: string | null;
  notes?: string | null;
  authors?: string | null;
  publicationDate?: string | null;
  savedAt: Date | string;
  savedCitationsData?: string | null; // JSON string of SavedCitationUI[]
  claim1?: string | null; // Main independent claim - what the prior art actually claims
  summary?: string | null; // Brief summary of the invention - what problem it solves and how
  // Include the savedCitations relation when using Prisma include
  savedCitations?: SavedCitationRecord[];
}

// Database record for SavedCitation (matches Prisma schema)
export interface SavedCitationRecord {
  id: string;
  savedPriorArtId: string;
  elementText?: string;
  citationText?: string;
  location?: string | null;
  reasoning?: string | null;
  displayOrder?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// UI-ready version with processed data
export interface ProcessedSavedPriorArt
  extends Omit<SavedPriorArt, 'savedCitationsData' | 'savedCitations'> {
  priorArtData: PriorArtReference; // Built from DB fields
  savedCitations?: SavedCitationUI[]; // Parsed from savedCitationsData or savedCitations relation
}

// For type compatibility with database SavedCitation model
export interface SavedCitation {
  id: string;
  citationId: string;
  savedPriorArtId: string;
  saveReason?: string;
  savedAt: string;
}

// UI-friendly saved citation data
export interface SavedCitationUI {
  elementText: string;
  citation: string;
  location?: string; // Formatted location string
  reasoning?: string; // Reasoning summary
}

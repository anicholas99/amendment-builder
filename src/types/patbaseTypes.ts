/**
 * Structure reflecting expected successful data for ONE patent from PatBase getmember&ft=true
 */
export interface PatBaseGetMemberResult {
  publicationNumber?: string;
  FullText?: {
    // Fields defined as string arrays based on observed debug logs
    Titles?: string[];
    Abstracts?: string[];
    Descriptions?: string[];
    Claims?: string[];
  }[]; // FullText itself is an array
}

/**
 * Structure for formatted reference data prepared for GPT input.
 */
export interface GPTReadyReference {
  id: string; // Original publicationNumber (with hyphens)
  title?: string;
  abstract?: string;
  description?: string; // Truncated
  claims?: string; // Truncated (typically the first independent claim)
}

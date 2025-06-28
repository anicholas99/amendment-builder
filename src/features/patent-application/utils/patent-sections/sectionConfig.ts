/**
 * Patent Section Configuration
 * Defines expected sections and their handling behavior
 */

export interface SectionConfig {
  /** Standard name for the section */
  standardName: string;
  /** Whether this section is required in a patent */
  required: boolean;
  /** Alternative names/variations that map to this section */
  aliases: string[];
  /** Whether to auto-create this section if detected in content */
  autoCreate: boolean;
  /** Display order */
  order: number;
}

/**
 * Master configuration for patent sections
 * This defines the contract for what sections should exist
 */
export const PATENT_SECTION_CONFIG: Record<string, SectionConfig> = {
  TITLE: {
    standardName: 'Title',
    required: true,
    aliases: ['TITLE'],
    autoCreate: true,
    order: 1,
  },
  FIELD: {
    standardName: 'FIELD',
    required: true,
    aliases: ['FIELD OF THE INVENTION'],
    autoCreate: true,
    order: 2,
  },
  BACKGROUND: {
    standardName: 'BACKGROUND',
    required: true,
    aliases: ['BACKGROUND OF THE INVENTION'],
    autoCreate: true,
    order: 3,
  },
  SUMMARY: {
    standardName: 'SUMMARY',
    required: true,
    aliases: ['SUMMARY OF THE INVENTION'],
    autoCreate: true,
    order: 4,
  },
  BRIEF_DESCRIPTION_OF_THE_DRAWINGS: {
    standardName: 'BRIEF DESCRIPTION OF THE DRAWINGS',
    required: false,
    aliases: ['BRIEF DESCRIPTION OF DRAWINGS', 'DRAWINGS'],
    autoCreate: true,
    order: 5,
  },
  DETAILED_DESCRIPTION: {
    standardName: 'DETAILED DESCRIPTION',
    required: true,
    aliases: ['DETAILED DESCRIPTION OF THE INVENTION'],
    autoCreate: true,
    order: 6,
  },
  CLAIMS: {
    standardName: 'CLAIMS',
    required: false, // Not always present in initial generation
    aliases: ['CLAIM SET', 'PATENT CLAIMS'],
    autoCreate: false, // Don't auto-create unless explicitly present
    order: 7,
  },
  ABSTRACT: {
    standardName: 'ABSTRACT',
    required: true,
    aliases: ['PATENT ABSTRACT'],
    autoCreate: true,
    order: 8,
  },
};

/**
 * Get standardized section name from any variation
 */
export function getStandardSectionName(sectionName: string): string | null {
  const upperName = sectionName.toUpperCase().trim();
  
  // Check each section config
  for (const [key, config] of Object.entries(PATENT_SECTION_CONFIG)) {
    // Check standard name
    if (config.standardName.toUpperCase() === upperName) {
      return config.standardName;
    }
    
    // Check aliases
    if (config.aliases.some(alias => alias.toUpperCase() === upperName)) {
      return config.standardName;
    }
  }
  
  return null;
}

/**
 * Check if a section should be auto-created when detected
 */
export function shouldAutoCreateSection(sectionName: string): boolean {
  const standardName = getStandardSectionName(sectionName);
  if (!standardName) return false;
  
  const config = Object.values(PATENT_SECTION_CONFIG).find(
    c => c.standardName === standardName
  );
  
  return config?.autoCreate ?? false;
}

/**
 * Get ordered list of standard section names
 */
export function getOrderedSectionNames(): string[] {
  return Object.values(PATENT_SECTION_CONFIG)
    .sort((a, b) => a.order - b.order)
    .map(config => config.standardName);
} 
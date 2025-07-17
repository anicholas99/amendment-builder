/**
 * Section Dependency Configuration
 * Maps data changes to affected patent sections
 */

export type DataChangeType =
  | 'invention_details'
  | 'figures'
  | 'claims'
  | 'prior_art'
  | 'title';

export interface SectionDependency {
  section: string;
  dependsOn: DataChangeType[];
  description: string;
}

/**
 * Configuration defining which sections need regeneration when specific data changes
 */
export const SECTION_DEPENDENCIES: SectionDependency[] = [
  {
    section: 'TITLE',
    dependsOn: ['title'],
    description: 'Updates when invention title changes',
  },
  {
    section: 'FIELD',
    dependsOn: ['invention_details'],
    description: 'Updates when technical field or category changes',
  },
  {
    section: 'BACKGROUND',
    dependsOn: ['invention_details', 'prior_art'],
    description:
      'Updates when background, problems solved, or prior art changes',
  },
  {
    section: 'SUMMARY',
    dependsOn: ['invention_details', 'claims'],
    description: 'Updates when core invention details or claims change',
  },
  {
    section: 'BRIEF_DESCRIPTION_OF_THE_DRAWINGS',
    dependsOn: ['figures'],
    description: 'Updates when figures are added, removed, or modified',
  },
  {
    section: 'DETAILED_DESCRIPTION',
    dependsOn: ['invention_details', 'figures', 'claims'],
    description: 'Updates when invention details, figures, or claims change',
  },
  {
    section: 'CLAIMS',
    dependsOn: ['claims'],
    description: 'Syncs with claims from the claim refinement view',
  },
  {
    section: 'ABSTRACT',
    dependsOn: ['invention_details'],
    description: 'Updates when core invention summary changes',
  },
];

/**
 * Get sections affected by a specific type of data change
 */
export function getAffectedSections(changeTypes: DataChangeType[]): string[] {
  return SECTION_DEPENDENCIES.filter(dep =>
    dep.dependsOn.some(type => changeTypes.includes(type))
  ).map(dep => dep.section);
}

/**
 * Get human-readable description of why a section needs updating
 */
export function getSectionUpdateReason(
  section: string,
  changeTypes: DataChangeType[]
): string {
  const dependency = SECTION_DEPENDENCIES.find(dep => dep.section === section);
  if (!dependency) return 'Unknown reason';

  const relevantChanges = changeTypes.filter(type =>
    dependency.dependsOn.includes(type)
  );
  const changeDescriptions = relevantChanges.map(type => {
    switch (type) {
      case 'figures':
        return 'figures were modified';
      case 'invention_details':
        return 'invention details were updated';
      case 'claims':
        return 'claims were changed';
      case 'prior_art':
        return 'prior art references were updated';
      case 'title':
        return 'title was changed';
      default:
        return type;
    }
  });

  return `This section needs updating because ${changeDescriptions.join(' and ')}.`;
}

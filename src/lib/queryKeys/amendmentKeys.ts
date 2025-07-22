/**
 * Query keys for amendment-related queries
 */
export const amendmentKeys = {
  all: ['amendments'] as const,
  
  // By project
  byProject: (projectId: string, officeActionId?: string) => 
    officeActionId 
      ? ['amendments', 'project', projectId, 'office-action', officeActionId] as const
      : ['amendments', 'project', projectId] as const,
  
  // By claim number
  byClaim: (projectId: string, claimNumber: number) => 
    ['amendments', 'project', projectId, 'claim', claimNumber] as const,
  
  // Office actions
  officeActions: {
    all: ['amendments', 'office-actions'] as const,
    byProject: (projectId: string) => 
      ['amendments', 'office-actions', 'project', projectId] as const,
    byId: (projectId: string, officeActionId: string) => 
      ['amendments', 'office-actions', 'project', projectId, officeActionId] as const,
  },
  
  // Rejections
  rejections: {
    byOfficeAction: (projectId: string, officeActionId: string) => 
      ['amendments', 'rejections', 'project', projectId, 'office-action', officeActionId] as const,
    analysis: (projectId: string, officeActionId: string) => 
      ['amendments', 'rejections', 'analysis', projectId, officeActionId] as const,
  },
} as const;
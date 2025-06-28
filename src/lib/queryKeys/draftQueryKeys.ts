/**
 * Query keys for draft document operations
 */
export const draftQueryKeys = {
  all: (projectId: string) => ['draft', 'documents', projectId] as const,
  byType: (projectId: string, type: string) =>
    [...draftQueryKeys.all(projectId), type] as const,
  exists: (projectId: string) =>
    [...draftQueryKeys.all(projectId), 'exists'] as const,
}; 
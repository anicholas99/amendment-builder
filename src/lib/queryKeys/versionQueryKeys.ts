export const versionQueryKeys = {
  all: (projectId: string) => ['versions', projectId] as const,
  list: (projectId: string) =>
    [...versionQueryKeys.all(projectId), 'list'] as const,
  detail: (projectId: string, versionId: string) =>
    [...versionQueryKeys.all(projectId), 'detail', versionId] as const,
  latest: (projectId: string) =>
    [...versionQueryKeys.all(projectId), 'latest'] as const,
  documents: (projectId: string, versionId: string) =>
    [...versionQueryKeys.detail(projectId, versionId), 'documents'] as const,
};

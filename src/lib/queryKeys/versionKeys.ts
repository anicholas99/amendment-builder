export const versionKeys = {
  all: (projectId: string) => ['versions', projectId] as const,
  lists: (projectId: string) =>
    [...versionKeys.all(projectId), 'list'] as const,
  list: (projectId: string, filters: string) =>
    [...versionKeys.lists(projectId), { filters }] as const,
  details: (projectId: string) =>
    [...versionKeys.all(projectId), 'detail'] as const,
  detail: (projectId: string, id: string) =>
    [...versionKeys.details(projectId), id] as const,
  latest: (projectId: string) =>
    [...versionKeys.all(projectId), 'latest'] as const,
};

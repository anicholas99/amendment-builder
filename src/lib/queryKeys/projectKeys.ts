/**
 * @fileoverview Centralized query key factories for project-specific data.
 */

import { getCurrentTenant } from './tenant';

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [getCurrentTenant(), ...projectKeys.all, 'list'] as const,
  list: (filters?: any) => [...projectKeys.lists(), { filters }] as const,
  details: () => [getCurrentTenant(), ...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

export const versioningKeys = {
  all: (projectId: string) =>
    [...projectKeys.detail(projectId), 'versions'] as const,
  detail: (projectId: string, versionId: string) =>
    [...versioningKeys.all(projectId), versionId] as const,
};

export const searchHistoryKeys = {
  all: (projectId: string) =>
    [...projectKeys.detail(projectId), 'searchHistory'] as const,
  project: (projectId: string) => searchHistoryKeys.all(projectId),
};

export const priorArtKeys = {
  all: (projectId: string) =>
    [...projectKeys.detail(projectId), 'priorArt'] as const,
};

export const exclusionKeys = {
  all: (projectId: string) =>
    [...projectKeys.detail(projectId), 'exclusions'] as const,
};

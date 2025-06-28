/**
 * @fileoverview Centralized query key factory for invention-related data.
 * This ensures consistency and prevents string literal duplication.
 */

import { getCurrentTenant } from './tenant';

export const inventionQueryKeys = {
  /**
   * Base key for all invention queries.
   */
  all: ['invention'] as const,

  /**
   * Query key for the invention data of a specific project.
   * @param projectId The ID of the project.
   */
  detail: (projectId: string) =>
    [getCurrentTenant(), ...inventionQueryKeys.all, projectId] as const,

  /**
   * Query key for invention figures
   * @param projectId Project ID
   */
  figures: (projectId: string) =>
    [...inventionQueryKeys.detail(projectId), 'figures'] as const,
};

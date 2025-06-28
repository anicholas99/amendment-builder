/**
 * @fileoverview Centralized query key factory for exclusion-related data.
 * This ensures consistency and prevents string literal duplication.
 */

import { getCurrentTenant } from './tenant';

export const exclusionKeys = {
  /**
   * Base key for all exclusion queries.
   */
  all: ['exclusions'] as const,

  /**
   * Query key for exclusions of a specific project.
   * @param projectId The ID of the project.
   */
  byProject: (projectId: string) =>
    [getCurrentTenant(), ...exclusionKeys.all, 'project', projectId] as const,

  /**
   * Query key for a specific exclusion.
   * @param exclusionId The ID of the exclusion.
   */
  detail: (exclusionId: string) =>
    [getCurrentTenant(), ...exclusionKeys.all, 'detail', exclusionId] as const,
};

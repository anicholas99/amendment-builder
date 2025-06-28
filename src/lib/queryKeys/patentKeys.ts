/**
 * @fileoverview Centralized query key factory for patent-related data.
 * This ensures consistency and prevents string literal duplication.
 */

const baseKey = ['patents'] as const;

export const patentKeys = {
  /**
   * Base key for all patent queries.
   */
  all: baseKey,

  /**
   * Query key for patent versions.
   */
  versions: {
    all: [...baseKey, 'versions'] as const,

    /**
     * Query key for versions of a specific project.
     * @param projectId The ID of the project.
     */
    byProject: (projectId: string) =>
      [...baseKey, 'versions', 'project', projectId] as const,

    /**
     * Query key for a specific version.
     * @param versionId The ID of the version.
     */
    detail: (versionId: string) => [...baseKey, 'versions', versionId] as const,
  },

  /**
   * Query key for patent documents.
   */
  documents: {
    all: [...baseKey, 'documents'] as const,

    /**
     * Query key for documents of a specific project.
     * @param projectId The ID of the project.
     */
    byProject: (projectId: string) =>
      [...baseKey, 'documents', 'project', projectId] as const,
  },

  /**
   * Query key for patent lookup operations.
   */
  lookup: {
    all: [...baseKey, 'lookup'] as const,
    /**
     * Query key for bulk patent lookup results.
     * @param references Array of patent reference numbers.
     */
    bulk: (references: string[]) =>
      [...baseKey, 'lookup', 'bulk', references.join(',')] as const,
  },
};

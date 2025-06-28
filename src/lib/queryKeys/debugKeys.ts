/**
 * @fileoverview Centralized query key factory for debug-related data.
 */

const baseKey = ['debug'] as const;

/**
 * Query keys for debug operations
 */
export const debugKeys = {
  all: baseKey,
  citation: {
    all: () => [...baseKey, 'citation'] as const,
    status: (jobId: string) =>
      [...baseKey, 'citation', 'status', jobId] as const,
    info: () => [...baseKey, 'citation', 'info'] as const,
  },
};

/**
 * @fileoverview Centralized query key factory for system-related data.
 */

const baseKey = ['system'] as const;

/**
 * Query keys for system-level data, such as health checks or status.
 */
export const systemKeys = {
  all: baseKey,
  health: () => [...baseKey, 'health'] as const,
  status: () => [...baseKey, 'status'] as const,
};

// Export an alias for backward compatibility
export const systemHealthKeys = systemKeys;

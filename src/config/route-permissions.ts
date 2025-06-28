/**
 * Centralized route permissions configuration
 * Maps API routes to their required roles and methods
 */

export type RoutePermission = {
  /** Required role for accessing this endpoint */
  requiredRole: 'ADMIN' | 'USER';
  /** Apply role check only to these methods (default: all) */
  methods?: string[];
  /** Description of what this endpoint does */
  description?: string;
};

/**
 * Route permission mappings
 * Use glob patterns for flexible matching
 */
export const routePermissions: Record<string, RoutePermission> = {
  // Admin-only routes
  '/api/tenants': {
    requiredRole: 'ADMIN',
    methods: ['POST'], // Only POST requires admin
    description: 'Create new tenants',
  },
  '/api/users': {
    requiredRole: 'ADMIN',
    methods: ['POST'], // Only POST requires admin
    description: 'Create new users',
  },
  '/api/search-history': {
    requiredRole: 'ADMIN',
    methods: ['DELETE'], // Only DELETE requires admin
    description: 'Bulk delete search history',
  },
  '/api/projects/[projectId]': {
    requiredRole: 'ADMIN',
    methods: ['DELETE'], // Only DELETE requires admin
    description: 'Delete projects',
  },
  '/api/documents/batch-update': {
    requiredRole: 'ADMIN',
    description: 'Bulk document operations',
  },
  '/api/patbase/test-*': {
    requiredRole: 'ADMIN',
    description: 'Admin testing endpoints',
  },

  '/api/export-data': {
    requiredRole: 'ADMIN',
    description: 'Export all data',
  },
  '/api/debug-tools/*': {
    requiredRole: 'ADMIN',
    description: 'Debug and maintenance tools',
  },

  // User-level routes (authenticated users)
  '/api/projects': {
    requiredRole: 'USER',
    methods: ['POST'], // Only POST requires authentication
    description: 'Create projects',
  },
  '/api/citation-jobs': {
    requiredRole: 'USER',
    methods: ['POST', 'PUT'],
    description: 'Manage citation jobs',
  },
  '/api/upload-*': {
    requiredRole: 'USER',
    description: 'File uploads',
  },
  '/api/generate-*': {
    requiredRole: 'USER',
    description: 'AI generation endpoints',
  },
  '/api/analyze-*': {
    requiredRole: 'USER',
    description: 'Analysis endpoints',
  },
  '/api/projects/[projectId]/*': {
    requiredRole: 'USER',
    methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
    description: 'Project-specific mutations',
  },
  '/api/save-*': {
    requiredRole: 'USER',
    description: 'Save operations',
  },
  '/api/search-history/*': {
    requiredRole: 'USER',
    methods: ['POST', 'PUT', 'PATCH'],
    description: 'Search history mutations',
  },
};

/**
 * Helper function to get route permission by path
 * Supports glob pattern matching
 */
export function getRoutePermission(path: string): RoutePermission | null {
  // First try exact match
  if (routePermissions[path]) {
    return routePermissions[path];
  }

  // Then try glob patterns
  for (const [pattern, permission] of Object.entries(routePermissions)) {
    if (matchPattern(pattern, path)) {
      return permission;
    }
  }

  return null;
}

/**
 * Simple glob pattern matcher
 * Supports * for single segment and [param] for dynamic segments
 */
function matchPattern(pattern: string, path: string): boolean {
  // Convert [param] to regex pattern
  const regexPattern =
    pattern
      .replace(/\[([^\]]+)\]/g, '[^/]+') // [param] -> any segment
      .replace(/\*/g, '[^/]+') // * -> any segment
      .replace(/\//g, '\\/') + // escape slashes
    '$'; // end of string

  return new RegExp('^' + regexPattern).test(path);
}

/**
 * Get all routes that require a specific role
 */
export function getRoutesByRole(role: 'ADMIN' | 'USER'): string[] {
  return Object.entries(routePermissions)
    .filter(([_, permission]) => permission.requiredRole === role)
    .map(([route, _]) => route);
}

/**
 * Check if a route requires authentication
 */
export function requiresAuth(path: string, method: string): boolean {
  const permission = getRoutePermission(path);
  if (!permission) return false;

  if (!permission.methods) return true; // All methods require auth
  return permission.methods.includes(method);
}

/**
 * Mock Authentication Service for Development
 *
 * This file provides mock authentication data and services for local development.
 * It simulates Auth0 behavior without requiring a live connection.
 *
 * IMPORTANT: This should NEVER be used in production!
 */

import { env } from '@/config/env';

// Ensure this is only used in development
if (env.NODE_ENV === 'production') {
  throw new Error('Mock auth service should not be used in production!');
}

// Mock tenant data
export const MOCK_TENANTS = [
  {
    id: 'tenant_development',
    name: 'Development Tenant',
    slug: 'development',
  },
  {
    id: 'tenant_test',
    name: 'Test Tenant',
    slug: 'test',
  },
];

// Mock user data
export const MOCK_USERS = [
  {
    id: 'mock_user_1',
    email: 'developer@example.com',
    name: 'Developer User',
    role: 'admin',
    tenantId: 'tenant_development',
  },
  {
    id: 'mock_user_2',
    email: 'tester@example.com',
    name: 'Test User',
    role: 'user',
    tenantId: 'tenant_test',
  },
];

// Storage key for mock session
const MOCK_SESSION_KEY = 'mock_user_session';

// Mock auth service
const mockAuthService = {
  getCurrentUser: () => {
    if (typeof window === 'undefined') return null;
    const sessionData = localStorage.getItem(MOCK_SESSION_KEY);
    if (!sessionData) {
      // Default to first user if no session
      const defaultUser = MOCK_USERS[0];
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(defaultUser));
      return defaultUser;
    }
    return JSON.parse(sessionData);
  },

  switchUser: (userId: string) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (!user) throw new Error(`User ${userId} not found`);
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(user));
    return user;
  },

  switchTenant: (tenantId: string) => {
    const currentUser = mockAuthService.getCurrentUser();
    if (!currentUser) throw new Error('No user logged in');

    const tenant = MOCK_TENANTS.find(t => t.id === tenantId);
    if (!tenant) throw new Error(`Tenant ${tenantId} not found`);

    const updatedUser = { ...currentUser, tenantId };
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  },

  getTenants: () => MOCK_TENANTS,

  hasPermission: (permission: string): boolean => {
    const user = mockAuthService.getCurrentUser();
    if (!user) return false;

    // Simple role-based permissions for mock
    const adminPermissions = [
      'project:create',
      'project:delete',
      'patent:create',
      'patent:delete',
    ];
    const userPermissions = ['project:create', 'patent:create'];

    if (user.role === 'admin') {
      return adminPermissions.includes(permission);
    } else if (user.role === 'user') {
      return userPermissions.includes(permission);
    }

    return false;
  },

  logout: () => {
    localStorage.removeItem(MOCK_SESSION_KEY);
  },
};

// React hook for using mock auth
export const useMockAuth = () => {
  if (typeof window === 'undefined') {
    return {
      user: null,
      isLoading: false,
      error: null,
    };
  }

  const user = mockAuthService.getCurrentUser();
  return {
    user,
    isLoading: false,
    error: null,
  };
};

export default mockAuthService;

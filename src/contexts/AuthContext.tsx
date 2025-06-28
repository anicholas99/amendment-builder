import React, { createContext, useContext } from 'react';
import type { AppSession, AppUser, AppTenant } from '@/lib/auth/getSession';

export interface AuthContextType {
  // Session data
  session: AppSession | null;
  user: AppUser | null;
  currentTenant: AppTenant | null;
  permissions: string[];
  tenants: AppTenant[];

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  refetchSession: () => Promise<void>;
  switchTenant: (tenantId: string) => Promise<boolean>;

  // Utilities
  hasPermission: (permission: string) => boolean;
  belongsToTenant: (tenantId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

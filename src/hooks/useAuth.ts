// Re-export useAuth from AuthContext for convenience
export { useAuth } from '@/contexts/AuthContext';

// Also export the React Query hooks for direct usage
export { useSessionQuery, useSwitchTenantMutation } from '@/hooks/api/useAuth';

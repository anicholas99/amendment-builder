import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UIPreferencesService,
  UI_PREFERENCE_KEYS,
} from '@/services/api/uiPreferencesService';
import { userKeys } from '@/lib/queryKeys/userKeys';
import { useAuth } from '@/hooks/useAuth';
import { useState, useCallback, useEffect } from 'react';
import { logger } from '@/utils/clientLogger';

/**
 * Hook for managing UI preferences with backend persistence
 * Provides a seamless API for getting and setting UI preferences
 * with automatic caching and optimistic updates
 */
export function useUIPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Local state for optimistic updates
  const [localPreferences, setLocalPreferences] = useState<Record<string, any>>(
    {}
  );

  // Query for fetching preferences
  const { data: serverPreferences = {}, isLoading } = useQuery({
    queryKey: [...userKeys.preferences(user?.id || ''), 'ui'],
    queryFn: () => UIPreferencesService.getPreferences(),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  });

  // Merge server and local preferences (local takes precedence for optimistic updates)
  const preferences = { ...serverPreferences, ...localPreferences };

  // Mutation for updating preferences
  const updateMutation = useMutation({
    mutationFn: (updates: Record<string, any>) =>
      UIPreferencesService.updatePreferences(updates),
    onMutate: async updates => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: [...userKeys.preferences(user?.id || ''), 'ui'],
      });

      // Optimistically update local state
      setLocalPreferences(prev => ({ ...prev, ...updates }));

      // Return context for rollback
      return { previousPreferences: preferences };
    },
    onSuccess: () => {
      // Clear local optimistic updates on success
      setLocalPreferences({});

      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: [...userKeys.preferences(user?.id || ''), 'ui'],
      });
    },
    onError: (error, updates, context) => {
      // Rollback optimistic update on error
      if (context?.previousPreferences) {
        setLocalPreferences({});
      }
      // Log error in development only
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to update UI preferences', { error, updates });
      }
    },
  });

  // Helper to get a specific preference with default value
  const getPreference = useCallback(
    <T = any>(key: string, defaultValue: T): T => {
      const value = preferences[key];
      return value !== undefined ? value : defaultValue;
    },
    [preferences]
  );

  // Helper to set a single preference
  const setPreference = useCallback(
    async (key: string, value: any) => {
      // Optimistically update
      setLocalPreferences(prev => ({ ...prev, [key]: value }));

      // Persist to backend
      try {
        await updateMutation.mutateAsync({ [key]: value });
      } catch (error) {
        // Error handled in mutation onError
      }
    },
    [updateMutation]
  );

  // Helper to set multiple preferences at once
  const setPreferences = useCallback(
    async (updates: Record<string, any>) => {
      // Optimistically update
      setLocalPreferences(prev => ({ ...prev, ...updates }));

      // Persist to backend
      try {
        await updateMutation.mutateAsync(updates);
      } catch (error) {
        // Error handled in mutation onError
      }
    },
    [updateMutation]
  );

  // Migrate localStorage values on mount (one-time migration)
  useEffect(() => {
    if (!user?.id || isLoading) return;

    const migrateLocalStoragePreferences = async () => {
      const migrations: Record<string, any> = {};

      // Check for localStorage values to migrate
      const localStorageKeys = [
        { key: 'claimViewMode', prefKey: UI_PREFERENCE_KEYS.CLAIM_VIEW_MODE },
        {
          key: 'sidebar-show-all-projects',
          prefKey: UI_PREFERENCE_KEYS.SIDEBAR_SHOW_ALL_PROJECTS,
        },
      ];

      for (const { key, prefKey } of localStorageKeys) {
        const localValue = localStorage.getItem(key);
        if (localValue !== null && preferences[prefKey] === undefined) {
          try {
            // Try to parse as JSON first
            migrations[prefKey] = JSON.parse(localValue);
          } catch {
            // If not JSON, use as string
            migrations[prefKey] = localValue;
          }

          // Remove from localStorage after migration
          localStorage.removeItem(key);
        }
      }

      // If we have migrations, save them
      if (Object.keys(migrations).length > 0) {
        await setPreferences(migrations);
        // Log migration info in development only
        if (process.env.NODE_ENV === 'development') {
          logger.info('Migrated localStorage preferences to backend', {
            keys: Object.keys(migrations),
          });
        }
      }
    };

    migrateLocalStoragePreferences();
  }, [user?.id, isLoading, preferences, setPreferences]);

  return {
    preferences,
    isLoading,
    getPreference,
    setPreference,
    setPreferences,
    isUpdating: updateMutation.isPending,
  };
}

// Convenience hooks for specific preferences
export function useClaimViewMode() {
  const { getPreference, setPreference } = useUIPreferences();

  const viewMode = getPreference(UI_PREFERENCE_KEYS.CLAIM_VIEW_MODE, 'box') as
    | 'box'
    | 'compact';
  const setViewMode = (mode: 'box' | 'compact') =>
    setPreference(UI_PREFERENCE_KEYS.CLAIM_VIEW_MODE, mode);

  return [viewMode, setViewMode] as const;
}

export function useSidebarShowAllProjects() {
  const { getPreference, setPreference } = useUIPreferences();

  const showAllProjects = getPreference(
    UI_PREFERENCE_KEYS.SIDEBAR_SHOW_ALL_PROJECTS,
    true
  ) as boolean;
  const setShowAllProjects = (show: boolean) =>
    setPreference(UI_PREFERENCE_KEYS.SIDEBAR_SHOW_ALL_PROJECTS, show);

  return [showAllProjects, setShowAllProjects] as const;
}

export function useEditorZoom() {
  const { getPreference, setPreference } = useUIPreferences();

  const zoomLevel = getPreference(
    UI_PREFERENCE_KEYS.EDITOR_ZOOM_LEVEL,
    100
  ) as number;
  const setZoomLevel = (level: number) =>
    setPreference(UI_PREFERENCE_KEYS.EDITOR_ZOOM_LEVEL, level);

  return [zoomLevel, setZoomLevel] as const;
}

export function useMainPanelWidth() {
  const { getPreference, setPreference } = useUIPreferences();

  const width = getPreference(UI_PREFERENCE_KEYS.MAIN_PANEL_WIDTH, null) as
    | number
    | null;
  const setWidth = (width: number) =>
    setPreference(UI_PREFERENCE_KEYS.MAIN_PANEL_WIDTH, width);

  return [width, setWidth] as const;
}

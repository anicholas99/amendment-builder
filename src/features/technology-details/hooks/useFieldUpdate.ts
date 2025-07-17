/**
 * Unified field update hook for Tech Details
 *
 * This hook handles ALL field updates with:
 * - Proper field name mapping
 * - Debouncing where needed
 * - Validation
 * - Success/error toasts
 * - Consistent error handling
 *
 * If you break this, you know what happens.
 */

import { useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/useToastWrapper';
import { useUpdateInventionMutation } from '@/hooks/api/useInvention';
import { InventionData } from '@/types/invention';
import { logger } from '@/utils/clientLogger';
import {
  getDbFieldName,
  validateField,
  getFieldSaveBehavior,
  getFieldDebounceMs,
  FIELD_MAPPINGS,
} from '../constants/fieldMappings';
import { useDebouncedCallback } from '@/hooks/useDebounce';

interface UseFieldUpdateProps {
  projectId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseFieldUpdateReturn {
  updateField: (uiFieldName: string, value: any) => void;
  isUpdating: boolean;
  lastError: Error | null;
}

export function useFieldUpdate({
  projectId,
  onSuccess,
  onError,
}: UseFieldUpdateProps): UseFieldUpdateReturn {
  const toast = useToast();
  const updateMutation = useUpdateInventionMutation();

  const [debouncedUpdate, cancelDebouncedUpdate] = useDebouncedCallback(
    (uiFieldName: string, updates: Partial<InventionData>) => {
      updateMutation.mutate(
        { projectId, updates },
        {
          onSuccess: () => {
            const fieldConfig = FIELD_MAPPINGS[uiFieldName];
            toast({
              title: 'Saved',
              description: `${fieldConfig?.displayName || uiFieldName} updated`,
              status: 'success',
              duration: 2000,
              isClosable: true,
              position: 'bottom-right',
              variant: 'subtle',
            });
            logger.info('[useFieldUpdate] Field updated successfully', {
              field: uiFieldName,
            });
            onSuccess?.();
          },
          onError: error => {
            const fieldConfig = FIELD_MAPPINGS[uiFieldName];
            toast({
              title: 'Save Failed',
              description: `Could not update ${fieldConfig?.displayName || uiFieldName}. Please try again.`,
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
            logger.error('[useFieldUpdate] Field update failed', {
              field: uiFieldName,
              error: error.message,
            });
            onError?.(error as Error);
          },
        }
      );
    },
    200
  );

  /**
   * The main update function - handles all the complexity
   */
  const updateField = useCallback(
    (uiFieldName: string, value: any) => {
      if (!projectId) {
        logger.error('[useFieldUpdate] CRITICAL: No projectId provided!');
        toast({
          title: 'Update Failed',
          description: 'No project selected. Please reload the page.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      const dbFieldName = getDbFieldName(uiFieldName);
      const fieldConfig = FIELD_MAPPINGS[uiFieldName];

      if (!validateField(uiFieldName, value)) {
        toast({
          title: 'Invalid Value',
          description: `Please check your input for ${fieldConfig?.displayName || uiFieldName}`,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const saveBehavior = getFieldSaveBehavior(uiFieldName);
      const updates: Partial<InventionData> = {
        [dbFieldName]: value,
      };

      if (saveBehavior === 'immediate' || saveBehavior === 'on-blur') {
        cancelDebouncedUpdate(); // Cancel any pending debounced update
        updateMutation.mutate(
          { projectId, updates },
          {
            onSuccess: () => {
              toast({
                title: 'Saved',
                description: `${fieldConfig?.displayName || uiFieldName} updated`,
                status: 'success',
                duration: 2000,
                isClosable: true,
                position: 'bottom-right',
                variant: 'subtle',
              });
              onSuccess?.();
            },
            onError: error => {
              toast({
                title: 'Save Failed',
                description: `Could not update ${fieldConfig?.displayName || uiFieldName}. Please try again.`,
                status: 'error',
                duration: 5000,
                isClosable: true,
              });
              onError?.(error as Error);
            },
          }
        );
      } else if (saveBehavior === 'debounced') {
        const debounceMs = getFieldDebounceMs(uiFieldName);
        debouncedUpdate(uiFieldName, updates);
      }
    },
    [
      projectId,
      toast,
      onSuccess,
      onError,
      updateMutation,
      debouncedUpdate,
      cancelDebouncedUpdate,
    ]
  );

  return {
    updateField,
    isUpdating: updateMutation.isPending,
    lastError: updateMutation.error as Error | null,
  };
}

/**
 * Helper hook to create pre-bound update functions for specific fields
 * This makes the component code even cleaner
 */
export function useFieldUpdaters(projectId: string) {
  const { updateField, isUpdating } = useFieldUpdate({ projectId });

  return {
    // Create a specific updater for each field type
    updateTitle: (value: string) => updateField('title', value),
    updateAbstract: (value: string) => updateField('abstract', value),
    updateSummary: (value: string) => updateField('summary', value),
    updateNovelty: (value: string) => updateField('novelty', value),
    updatePatentCategory: (value: string) =>
      updateField('patentCategory', value),
    updateTechnicalField: (value: string) =>
      updateField('technicalField', value),
    updateBackground: (value: string) => updateField('background', value),
    updateProblemStatement: (items: string[]) =>
      updateField('problemStatement', items),
    updateSolutionSummary: (items: string[]) =>
      updateField('solutionSummary', items),
    updateFeatures: (items: string[]) => updateField('features', items),
    updateAdvantages: (items: string[]) => updateField('advantages', items),
    updateUseCases: (items: string[]) => updateField('useCases', items),
    updateProcessSteps: (items: string[]) => updateField('processSteps', items),
    updateDetailedDescription: (value: string) =>
      updateField('detailedDescription', value),
    updateBriefDescription: (value: string) =>
      updateField('briefDescription', value),
    updateTechnicalImplementation: (value: any) =>
      updateField('technicalImplementation', value),
    isUpdating,
  };
}

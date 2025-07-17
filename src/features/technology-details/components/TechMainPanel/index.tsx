import React from 'react';
import { SimpleMainPanel } from '@/components/common/SimpleMainPanel';
import TechMainPanelHeaderShadcn from './components/TechMainPanelHeaderShadcn';
import TechSectionsRendererShadcn from './components/TechSectionsRendererShadcn';
import { useZoomControls } from './hooks/useZoomControls';
import { useFieldUpdate } from '../../hooks/useFieldUpdate';
import { TechMainPanelProps } from './types';
import { logger } from '@/utils/clientLogger';

/**
 * Main panel for displaying and editing technology details
 *
 * Clean, simple, and maintainable.
 */
const TechMainPanel: React.FC<TechMainPanelProps> = ({
  projectId,
  analyzedInvention,
  onUpdateInvention,
}) => {
  // Zoom controls - ALWAYS call hooks first
  const {
    zoomLevel,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    getFontSize,
  } = useZoomControls();

  // THE NEW WAY: One hook to rule them all - ALWAYS call hooks first
  const { updateField } = useFieldUpdate({
    projectId: projectId || '', // Ensure it's never undefined
    onSuccess: () => {
      // Optional: Add any additional success handling here
      logger.info('[TechMainPanel] Field saved successfully');
    },
    onError: error => {
      // Optional: Add any additional error handling here
      logger.error('[TechMainPanel] Field save failed:', { error });
    },
  });

  const handleFieldSave = async (field: string, value: any) => {
    try {
      await updateField(field, value);
      logger.info('[TechMainPanel] Field saved successfully', { field });
    } catch (error) {
      // Error handling is done by the mutation
      logger.error('[TechMainPanel] Field save failed:', { field, error });
    }
  };

  // Safety check - return early AFTER hooks are called
  if (!projectId) {
    logger.warn('[TechMainPanel] No projectId provided, cannot render');
    return null;
  }

  // Header content - Using shadcn/ui version for testing
  const headerContent = (
    <TechMainPanelHeaderShadcn
      analyzedInvention={analyzedInvention}
      zoomLevel={zoomLevel}
      onZoomIn={handleZoomIn}
      onZoomOut={handleZoomOut}
      onResetZoom={handleResetZoom}
    />
  );

  return (
    <>
      <SimpleMainPanel header={headerContent} contentPadding={true}>
        <TechSectionsRendererShadcn
          analyzedInvention={analyzedInvention}
          getFontSize={getFontSize}
          onUpdate={handleFieldSave} // Pass the unified update function
          zoomLevel={zoomLevel} // Pass zoom level for CSS transform scaling
        />
      </SimpleMainPanel>
    </>
  );
};

export default TechMainPanel;

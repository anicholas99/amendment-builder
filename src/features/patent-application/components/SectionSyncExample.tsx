/**
 * Example of how to integrate the Section Sync feature into your patent application view
 *
 * This is not a production component - it's documentation showing how to use the sync system
 */

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToastWrapper';
import { useSectionSync } from '../hooks/useSectionSync';
import { SectionSyncDialog } from './SectionSyncDialog';

// Example integration into PatentApplicationView or similar component
export const PatentApplicationWithSync: React.FC<{ projectId: string }> = ({
  projectId,
}) => {
  const toast = useToast();
  const sectionSync = useSectionSync();

  // Example: After adding a figure
  const handleFigureAdded = async () => {
    // ... your figure add logic ...

    // Trigger sync dialog
    sectionSync.syncAfterFigureChange();
  };

  // Example: After updating invention details
  const handleInventionUpdated = async () => {
    // ... your invention update logic ...

    // Show notification and then trigger sync
    toast({
      title: 'Invention details updated',
      description: 'Opening section sync dialog...',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });

    // Trigger sync dialog after a short delay
    setTimeout(() => {
      sectionSync.syncAfterInventionUpdate();
    }, 500);
  };

  // Example: Manual sync button in toolbar
  const PatentToolbar = () => (
    <div className="flex items-center gap-2">
      {/* Other toolbar buttons */}

      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          // You can detect what changed and trigger appropriate sync
          // For example, check if figures were modified since last sync
          const changedItems = detectChangedItems(); // Your logic

          if (changedItems.figures) {
            sectionSync.syncAfterFigureChange();
          } else if (changedItems.invention) {
            sectionSync.syncAfterInventionUpdate();
          } else {
            toast({
              title: 'No changes detected',
              description: 'All sections are up to date',
              status: 'info',
              duration: 3000,
            });
          }
        }}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Sync Sections
      </Button>
    </div>
  );

  // Handle sync completion
  const handleSyncComplete = () => {
    // Refresh your patent application content
    // refetchPatentContent();

    toast({
      title: 'Sections synchronized',
      status: 'success',
      duration: 3000,
    });
  };

  return (
    <>
      {/* Your patent application UI */}
      <PatentToolbar />

      {/* Include the sync dialog */}
      <SectionSyncDialog
        isOpen={sectionSync.isOpen}
        onClose={sectionSync.closeSync}
        projectId={projectId}
        changeTypes={sectionSync.changeTypes}
        onSync={handleSyncComplete}
      />
    </>
  );
};

// Helper function to detect what changed (implement based on your needs)
function detectChangedItems() {
  // This would check timestamps or compare hashes to detect changes
  return {
    figures: false,
    invention: false,
    claims: false,
    priorArt: false,
  };
}

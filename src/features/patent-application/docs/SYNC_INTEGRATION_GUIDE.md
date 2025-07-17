# Patent Section Sync Integration Guide

This guide shows exactly where to trigger section sync in your application.

## 1. Patent Application View (PatentApplicationViewClean.tsx)

### Add imports:
```typescript
import { useSectionSync } from '../hooks/useSectionSync';
import { SectionSyncDialog } from './SectionSyncDialog';
```

### Add in component:
```typescript
const PatentApplicationViewClean: React.FC = () => {
  // ... existing code ...
  
  // Add section sync
  const sectionSync = useSectionSync();
  
  // Add before return statement
  return (
    <LayoutComponent
      header={<PatentHeader hideTitle={false} />}
      mainContent={mainContent}
      sidebarContent={sidebarContent}
      {...VIEW_LAYOUT_CONFIG.DEFAULT_PROPS}
    >
      {/* Add sync dialog */}
      <SectionSyncDialog
        isOpen={sectionSync.isOpen}
        onClose={sectionSync.closeSync}
        projectId={projectId}
        changeTypes={sectionSync.changeTypes}
        onSync={refreshContent}
      />
    </LayoutComponent>
  );
};
```

## 2. Technology Details View (After Invention Updates)

### In TechnologyDetailsViewClean.tsx:
```typescript
// Add to imports
import { useSectionSync } from '@/features/patent-application/hooks/useSectionSync';

// In component
const sectionSync = useSectionSync();

// After successful invention update
const updateHandlers = useMemo(() => {
  const handleUpdateInventionData = (field: string, value: any) => {
    if (!currentProjectId) return;
    updateInventionMutation.mutate({
      projectId: currentProjectId,
      updates: { [field]: value },
    }, {
      onSuccess: () => {
        // Trigger sync notification after update
        toast({
          title: 'Invention updated',
          description: 'Would you like to sync patent sections?',
          status: 'info',
          duration: 5000,
          isClosable: true,
          action: (
            <Button size="sm" onClick={sectionSync.syncAfterInventionUpdate}>
              Sync Now
            </Button>
          ),
        });
      }
    });
  };
  // ... rest of handlers
}, [updateInventionMutation, currentProjectId, sectionSync]);
```

## 3. Figure Management Triggers

### After Figure Upload (in useFigureFileHandlers.ts):
```typescript
const handleFileInput = useCallback(
  async (event: React.ChangeEvent<HTMLInputElement>) => {
    // ... existing upload logic ...
    
    if (result && result.url) {
      // ... existing success handling ...
      
      // Add sync trigger
      toast({
        title: 'Figure uploaded',
        description: 'The Brief Description of Drawings section may need updating',
        status: 'success',
        duration: 5000,
        action: (
          <Button size="sm" onClick={() => window.dispatchEvent(new CustomEvent('sync-figures'))}>
            Update Sections
          </Button>
        ),
      });
    }
  },
  [/* dependencies */]
);
```

### Listen for figure sync events in PatentApplicationViewClean:
```typescript
useEffect(() => {
  const handleFigureSync = () => {
    sectionSync.syncAfterFigureChange();
  };
  
  window.addEventListener('sync-figures', handleFigureSync);
  return () => window.removeEventListener('sync-figures', handleFigureSync);
}, [sectionSync]);
```

## 4. Claims Management Triggers

### After Claims Update (in claim mutation hooks):
```typescript
// In useUpdateClaimMutation or similar
const updateClaimMutation = useMutation({
  // ... mutation config ...
  onSuccess: () => {
    // Existing success handling
    
    // Dispatch sync event
    window.dispatchEvent(new CustomEvent('sync-claims'));
  }
});
```

## 5. Prior Art Selection Triggers

### In PriorArtSelector component:
```typescript
// Add to PriorArtSelector props
interface PriorArtSelectorProps {
  // ... existing props ...
  onSelectionChange?: () => void;
}

// In the toggle function
const toggle = (id: string) => {
  // ... existing toggle logic ...
  
  // Notify parent of change
  onSelectionChange?.();
};
```

### In PatentApplicationViewClean:
```typescript
const handlePriorArtChange = useCallback(() => {
  // Show sync suggestion after a delay
  setTimeout(() => {
    toast({
      title: 'Prior art selection changed',
      description: 'Background section may need updating',
      status: 'info',
      duration: 5000,
      action: (
        <Button size="sm" onClick={sectionSync.syncAfterPriorArtUpdate}>
          Update Background
        </Button>
      ),
    });
  }, 1000);
}, [sectionSync, toast]);

// In the PriorArtSelector
<PriorArtSelector
  priorArtItems={priorArtItems}
  selectedIds={selectedRefIds}
  onChange={setSelectedRefIds}
  onSelectionChange={handlePriorArtChange}
/>
```

## 6. Manual Sync Button in Patent Editor Header

### Add to PatentEditorHeader component:
```typescript
interface PatentEditorHeaderProps {
  // ... existing props ...
  onSyncSections?: () => void;
}

// In the header actions
<Button
  size="sm"
  variant="outline"
  leftIcon={<Icon as={FiRefreshCw} />}
  onClick={onSyncSections}
  title="Sync sections with latest data"
>
  Sync
</Button>
```

## 7. Auto-Detection Pattern (Advanced)

### Create a change detection hook:
```typescript
// hooks/useDataChangeDetection.ts
export function useDataChangeDetection(
  inventionData: any,
  figures: any,
  claims: any,
  priorArt: any
) {
  const previousData = useRef({ inventionData, figures, claims, priorArt });
  const [changedTypes, setChangedTypes] = useState<DataChangeType[]>([]);
  
  useEffect(() => {
    const changes: DataChangeType[] = [];
    
    if (JSON.stringify(inventionData) !== JSON.stringify(previousData.current.inventionData)) {
      changes.push('invention_details');
    }
    if (JSON.stringify(figures) !== JSON.stringify(previousData.current.figures)) {
      changes.push('figures');
    }
    if (JSON.stringify(claims) !== JSON.stringify(previousData.current.claims)) {
      changes.push('claims');
    }
    if (JSON.stringify(priorArt) !== JSON.stringify(previousData.current.priorArt)) {
      changes.push('prior_art');
    }
    
    if (changes.length > 0) {
      setChangedTypes(changes);
      previousData.current = { inventionData, figures, claims, priorArt };
    }
  }, [inventionData, figures, claims, priorArt]);
  
  return changedTypes;
}
```

## Best Practices

1. **Don't Over-Trigger**: Avoid triggering sync on every small change
2. **Batch Changes**: Wait for user to finish making changes before suggesting sync
3. **User Control**: Always let users decide when to sync
4. **Clear Communication**: Explain which sections will be affected
5. **Non-Intrusive**: Use toast notifications with action buttons rather than modal popups

## Example Integration Flow

1. User adds a new figure in Technology Details
2. System shows toast: "Figure added. Patent sections may need updating."
3. User clicks "Update Sections" in the toast
4. Sync dialog opens showing "Brief Description of Drawings" needs update
5. User reviews the diff and accepts changes
6. System updates the draft and shows success message 
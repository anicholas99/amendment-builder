import { renderHook, act, waitFor } from '@testing-library/react';
import { usePatentAutosave } from '../usePatentAutosave';

// Mock dependencies
jest.mock('@/lib/monitoring/logger');
jest.mock('@/hooks/api/useDraftDocuments');

const mockBatchUpdateMutation = {
  mutateAsync: jest.fn(),
};

const mockDraftDocuments = [
  {
    id: 'doc-123',
    type: 'FULL_CONTENT',
    content: 'Test patent content',
    projectId: 'test-project-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

jest.mock('@/hooks/api/useDraftDocuments', () => ({
  useDraftDocuments: () => ({
    data: mockDraftDocuments,
    isLoading: false,
  }),
  useBatchUpdateDraftDocuments: () => mockBatchUpdateMutation,
}));

describe('usePatentAutosave', () => {
  const mockProjectId = 'test-project-123';
  const mockContent = 'Test patent content';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('initializes with content from draft documents', () => {
    const { result } = renderHook(() =>
      usePatentAutosave({
        projectId: mockProjectId,
      })
    );

    expect(result.current.content).toBe(mockContent);
    expect(result.current.hasUnsavedChanges).toBe(false);
    expect(result.current.isSaving).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('updates content immediately on change', () => {
    const { result } = renderHook(() =>
      usePatentAutosave({
        projectId: mockProjectId,
      })
    );

    const newContent = 'Updated patent content';
    
    act(() => {
      result.current.updateContent(newContent);
    });

    // Content updates immediately for responsive UI
    expect(result.current.content).toBe(newContent);
    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  it('debounces saves with 400ms delay', async () => {
    const { result } = renderHook(() =>
      usePatentAutosave({
        projectId: mockProjectId,
      })
    );

    const newContent = 'Updated content';
    
    act(() => {
      result.current.updateContent(newContent);
    });

    // Should not save immediately
    expect(mockBatchUpdateMutation.mutateAsync).not.toHaveBeenCalled();

    // Advance timer by 300ms - still shouldn't save
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(mockBatchUpdateMutation.mutateAsync).not.toHaveBeenCalled();

    // Advance to 400ms - should trigger save
    act(() => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(mockBatchUpdateMutation.mutateAsync).toHaveBeenCalledWith({
        projectId: mockProjectId,
        updates: [{
          type: 'FULL_CONTENT',
          content: newContent,
        }],
      });
    });
  });

  it('saves immediately on blur', async () => {
    const { result } = renderHook(() =>
      usePatentAutosave({
        projectId: mockProjectId,
      })
    );

    const newContent = 'Content to save on blur';
    
    act(() => {
      result.current.updateContent(newContent);
    });

    // Call saveOnBlur - should save immediately
    act(() => {
      result.current.saveOnBlur();
    });

    await waitFor(() => {
      expect(mockBatchUpdateMutation.mutateAsync).toHaveBeenCalledWith({
        projectId: mockProjectId,
        updates: [{
          type: 'FULL_CONTENT',
          content: newContent,
        }],
      });
    });
  });

  it('skips save if content hasn\'t changed', async () => {
    const { result } = renderHook(() =>
      usePatentAutosave({
        projectId: mockProjectId,
      })
    );

    // Update with same content
    act(() => {
      result.current.updateContent(mockContent);
    });

    // Should not mark as having unsaved changes
    expect(result.current.hasUnsavedChanges).toBe(false);

    // Force save should not call mutation
    await act(async () => {
      await result.current.forceSave();
    });

    expect(mockBatchUpdateMutation.mutateAsync).not.toHaveBeenCalled();
  });

  it('handles save failures silently', async () => {
    const error = new Error('Save failed');
    mockBatchUpdateMutation.mutateAsync.mockRejectedValueOnce(error);

    const { result } = renderHook(() =>
      usePatentAutosave({
        projectId: mockProjectId,
      })
    );

    const newContent = 'Content that will fail to save';
    
    act(() => {
      result.current.updateContent(newContent);
    });

    // Force save to trigger immediately
    await act(async () => {
      await result.current.forceSave();
    });

    // Should handle error gracefully - no throw
    expect(result.current.isSaving).toBe(false);
    // Content remains in local state
    expect(result.current.content).toBe(newContent);
  });

  it('cleans up on unmount', () => {
    const { result, unmount } = renderHook(() =>
      usePatentAutosave({
        projectId: mockProjectId,
      })
    );

    const newContent = 'Unsaved content';
    
    act(() => {
      result.current.updateContent(newContent);
    });

    // Unmount should clear timeouts
    unmount();

    // Advance timers - save should not be called
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockBatchUpdateMutation.mutateAsync).not.toHaveBeenCalled();
  });

  it('respects enabled flag', async () => {
    const { result, rerender } = renderHook(
      ({ enabled }) =>
        usePatentAutosave({
          projectId: mockProjectId,
          enabled,
        }),
      { initialProps: { enabled: false } }
    );

    const newContent = 'Should not save when disabled';
    
    act(() => {
      result.current.updateContent(newContent);
    });

    // Force save should not work when disabled
    await act(async () => {
      await result.current.forceSave();
    });

    expect(mockBatchUpdateMutation.mutateAsync).not.toHaveBeenCalled();

    // Enable and try again
    rerender({ enabled: true });

    await act(async () => {
      await result.current.forceSave();
    });

    expect(mockBatchUpdateMutation.mutateAsync).toHaveBeenCalledWith({
      projectId: mockProjectId,
      updates: [{
        type: 'FULL_CONTENT',
        content: newContent,
      }],
    });
  });
}); 
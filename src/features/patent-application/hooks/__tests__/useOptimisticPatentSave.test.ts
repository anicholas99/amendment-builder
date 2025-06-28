import { renderHook, act } from '@testing-library/react';
import { useOptimisticPatentSave } from '../useOptimisticPatentSave';
import { ApplicationVersionWithDocuments } from '@/types/versioning';

// Mock dependencies
jest.mock('@/lib/monitoring/logger');
jest.mock('../services/sectionSyncService', () => ({
  SectionSyncService: {
    extractSectionUpdates: jest.fn(() => []),
  },
}));

describe('useOptimisticPatentSave', () => {
  const mockBatchUpdateMutation = {
    mutateAsync: jest.fn(),
  };

  const mockUpdateCurrentVersionDocument = jest.fn();

  const mockCurrentVersion: ApplicationVersionWithDocuments = {
    id: 'version-1',
    name: 'Test Version',
    projectId: 'project-1',
    userId: 'user-1',
    createdAt: new Date(),
    deletedAt: null,
    documents: [
      {
        id: 'doc-1',
        type: 'FULL_CONTENT',
        content: 'Original content',
        applicationVersionId: 'version-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should skip update when content has not changed and forceUpdate is false', () => {
    const { result } = renderHook(() =>
      useOptimisticPatentSave({
        currentVersion: mockCurrentVersion,
        batchUpdateDocumentsMutation: mockBatchUpdateMutation,
        updateCurrentVersionDocument: mockUpdateCurrentVersionDocument,
        projectId: 'project-1',
      })
    );

    // Queue the same content that already exists
    act(() => {
      result.current.queueContentUpdate('Original content');
    });

    // Should not call updateCurrentVersionDocument since content hasn't changed
    expect(mockUpdateCurrentVersionDocument).not.toHaveBeenCalled();
  });

  it('should perform update when content has not changed but forceUpdate is true', () => {
    const { result } = renderHook(() =>
      useOptimisticPatentSave({
        currentVersion: mockCurrentVersion,
        batchUpdateDocumentsMutation: mockBatchUpdateMutation,
        updateCurrentVersionDocument: mockUpdateCurrentVersionDocument,
        projectId: 'project-1',
      })
    );

    // Queue the same content with forceUpdate = true
    act(() => {
      result.current.queueContentUpdate('Original content', true);
    });

    // Should call updateCurrentVersionDocument even though content hasn't changed
    expect(mockUpdateCurrentVersionDocument).toHaveBeenCalledWith(
      'doc-1',
      'Original content'
    );
  });

  it('should always update when content has changed regardless of forceUpdate', () => {
    const { result } = renderHook(() =>
      useOptimisticPatentSave({
        currentVersion: mockCurrentVersion,
        batchUpdateDocumentsMutation: mockBatchUpdateMutation,
        updateCurrentVersionDocument: mockUpdateCurrentVersionDocument,
        projectId: 'project-1',
      })
    );

    // Queue different content
    act(() => {
      result.current.queueContentUpdate('New content');
    });

    // Should call updateCurrentVersionDocument
    expect(mockUpdateCurrentVersionDocument).toHaveBeenCalledWith(
      'doc-1',
      'New content'
    );
  });
}); 
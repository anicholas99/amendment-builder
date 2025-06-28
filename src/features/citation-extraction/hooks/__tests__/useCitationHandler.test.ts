/**
 * Unit tests for useCitationHandler hook
 */
import { renderHook, act } from '@testing-library/react';
import { useCitationHandler } from '../useCitationHandler';
import { CitationClientService } from '@/client/services/citation.client-service';

// Mock dependencies
jest.mock('@/client/services/citation.client-service');
jest.mock('@/lib/monitoring/logger', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

const mockCitationService = CitationClientService as jest.Mocked<typeof CitationClientService>;

describe('useCitationHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useCitationHandler({
      projectId: 'project-123',
      searchId: 'search-456',
    }));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.citationMatches).toEqual([]);
  });

  it('should handle citation extraction request', async () => {
    const mockJobResponse = { success: true, jobId: 'job-123' };
    mockCitationService.createCitationJob.mockResolvedValue(mockJobResponse);

    const { result } = renderHook(() => useCitationHandler({
      projectId: 'project-123',
      searchId: 'search-456',
    }));

    await act(async () => {
      await result.current.extractCitations('US123', ['element1', 'element2']);
    });

    expect(mockCitationService.createCitationJob).toHaveBeenCalledWith(
      'search-456',
      'US123',
      ['element1', 'element2'],
      expect.any(Number)
    );
  });

  it('should handle citation extraction errors', async () => {
    const error = new Error('Citation extraction failed');
    mockCitationService.createCitationJob.mockRejectedValue(error);

    const { result } = renderHook(() => useCitationHandler({
      projectId: 'project-123',
      searchId: 'search-456',
    }));

    await act(async () => {
      try {
        await result.current.extractCitations('US123', ['element1']);
      } catch (e) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe(error);
  });

  it('should fetch citation matches', async () => {
    const mockMatches = [
      { id: 'match-1', referenceNumber: 'US123' },
      { id: 'match-2', referenceNumber: 'US456' },
    ];
    mockCitationService.getCitationMatches.mockResolvedValue(mockMatches);

    const { result } = renderHook(() => useCitationHandler({
      projectId: 'project-123',
      searchId: 'search-456',
    }));

    await act(async () => {
      await result.current.fetchCitationMatches();
    });

    expect(mockCitationService.getCitationMatches).toHaveBeenCalledWith('search-456');
    expect(result.current.citationMatches).toEqual(mockMatches);
  });

  it('should handle loading states correctly', async () => {
    let resolvePromise: Function;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockCitationService.getCitationMatches.mockReturnValue(promise as any);

    const { result } = renderHook(() => useCitationHandler({
      projectId: 'project-123',
      searchId: 'search-456',
    }));

    act(() => {
      result.current.fetchCitationMatches();
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise([]);
      await promise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should sync job status', async () => {
    const mockResponse = { success: true };
    mockCitationService.syncJobStatus.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useCitationHandler({
      projectId: 'project-123',
      searchId: 'search-456',
    }));

    await act(async () => {
      const response = await result.current.syncJobStatus('job-123');
      expect(response).toEqual(mockResponse);
    });

    expect(mockCitationService.syncJobStatus).toHaveBeenCalledWith('job-123');
  });

  it('should handle threshold updates', () => {
    const { result } = renderHook(() => useCitationHandler({
      projectId: 'project-123',
      searchId: 'search-456',
      initialThreshold: 50,
    }));

    act(() => {
      result.current.setThreshold(75);
    });

    expect(result.current.threshold).toBe(75);
  });

  it('should reset error state on successful operations', async () => {
    const { result } = renderHook(() => useCitationHandler({
      projectId: 'project-123',
      searchId: 'search-456',
    }));

    // Set an error first
    act(() => {
      result.current.setError(new Error('Previous error'));
    });

    expect(result.current.error).toBeTruthy();

    // Successful operation should clear the error
    mockCitationService.getCitationMatches.mockResolvedValue([]);

    await act(async () => {
      await result.current.fetchCitationMatches();
    });

    expect(result.current.error).toBeNull();
  });
});
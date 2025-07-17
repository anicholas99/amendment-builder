import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import '@/lib/testing/test-env-mock'; // Import environment mock
import { useProjects } from '../api/useProjects';
import {
  AllTheProviders,
  mockFetch,
  mockFetchError,
  TestDataFactory,
  setupTestEnvironment,
} from '@/lib/testing/test-helpers';

// Mock the project client service
jest.mock('@/client/services/project.client-service', () => ({
  ProjectApiService: {
    getProjects: jest.fn(),
  },
}));

import { ProjectApiService } from '@/client/services/project.client-service';

// Mock dependencies
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toasts: [],
    toast: mockToast,
  }),
}));

describe('useProjects', () => {
  setupTestEnvironment();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useProjects hook', () => {
    it('should fetch projects successfully', async () => {
      const mockProjects = [
        TestDataFactory.createMockProject(),
        TestDataFactory.createMockProject(),
      ];

      // Mock the service response directly
      const mockResponse = {
        projects: mockProjects,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
          hasMore: false,
          nextCursor: null,
        },
      };

      (ProjectApiService.getProjects as jest.Mock).mockResolvedValue(
        mockResponse
      );

      const { result } = renderHook(() => useProjects(), {
        wrapper: AllTheProviders,
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Access the flattened projects from the paginated structure
      const projects =
        result.current.data?.pages.flatMap(page => page.projects) ?? [];
      expect(projects).toHaveLength(2);
      expect(projects[0].id).toBe(mockProjects[0].id);
      expect(projects[1].id).toBe(mockProjects[1].id);
      expect(result.current.error).toBeNull();

      // Verify the service was called with correct params
      expect(ProjectApiService.getProjects).toHaveBeenCalledWith({
        pageParam: 1,
      });
    });

    it('should handle fetch errors', async () => {
      const mockError = new Error('Network error');
      (ProjectApiService.getProjects as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useProjects(), {
        wrapper: AllTheProviders,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe('Network error');
    });

    it('should handle empty project list', async () => {
      const mockResponse = {
        projects: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasMore: false,
          nextCursor: null,
        },
      };

      (ProjectApiService.getProjects as jest.Mock).mockResolvedValue(
        mockResponse
      );

      const { result } = renderHook(() => useProjects(), {
        wrapper: AllTheProviders,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const projects =
        result.current.data?.pages.flatMap(page => page.projects) ?? [];
      expect(projects).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should handle pagination', async () => {
      // First page
      const firstPageResponse = {
        projects: [TestDataFactory.createMockProject()],
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 2,
          hasMore: true,
          nextCursor: 2,
        },
      };

      // Second page
      const secondPageResponse = {
        projects: [TestDataFactory.createMockProject()],
        pagination: {
          page: 2,
          limit: 20,
          total: 2,
          totalPages: 2,
          hasMore: false,
          nextCursor: null,
        },
      };

      (ProjectApiService.getProjects as jest.Mock)
        .mockResolvedValueOnce(firstPageResponse)
        .mockResolvedValueOnce(secondPageResponse);

      const { result } = renderHook(() => useProjects(), {
        wrapper: AllTheProviders,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Should have first page
      expect(result.current.data?.pages).toHaveLength(1);
      expect(result.current.hasNextPage).toBe(true);

      // Fetch next page
      await result.current.fetchNextPage();

      await waitFor(() => {
        expect(result.current.data?.pages).toHaveLength(2);
      });

      const allProjects =
        result.current.data?.pages.flatMap(page => page.projects) ?? [];
      expect(allProjects).toHaveLength(2);
      expect(result.current.hasNextPage).toBe(false);
    });
  });
});

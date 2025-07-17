import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import '@/lib/testing/test-env-mock'; // Import environment mock
import { useSessionQuery, useSwitchTenantMutation } from '../useAuth';
import {
  AllTheProviders,
  TestDataFactory,
  setupTestEnvironment,
} from '@/lib/testing/test-helpers';
import { AuthApiService } from '@/client/services/auth.client-service';

// Mock dependencies
jest.mock('@/client/services/auth.client-service');
jest.mock('@/server/logger');

// Mock toast
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toasts: [], // Provide the expected 'toasts' array
    toast: mockToast, // Keep the mock function for other use cases
  }),
}));

describe('useAuth hooks', () => {
  setupTestEnvironment();

  const mockedAuthApiService = AuthApiService as jest.Mocked<
    typeof AuthApiService
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockToast.mockClear();
  });

  describe('useSessionQuery', () => {
    it('should fetch session successfully', async () => {
      const mockUser = TestDataFactory.createMockUser();
      const mockTenant = TestDataFactory.createMockTenant({
        id: mockUser.tenantId,
      });
      const mockSession = {
        user: {
          id: mockUser.id,
          auth0Id: mockUser.auth0Id,
          email: mockUser.email,
          name: mockUser.name || undefined,
          role: mockUser.role,
        },
        currentTenant: {
          id: mockTenant.id,
          name: mockTenant.name,
          slug: mockTenant.slug,
        },
        accessToken: 'mock-token',
        expires: new Date(Date.now() + 3600000).toISOString(),
        permissions: [],
        tenants: [mockTenant],
      };

      mockedAuthApiService.getSession.mockResolvedValue(mockSession);

      const { result } = renderHook(() => useSessionQuery(), {
        wrapper: AllTheProviders,
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSession);
      expect(mockedAuthApiService.getSession).toHaveBeenCalled();
    });

    it('should handle no active session', async () => {
      mockedAuthApiService.getSession.mockResolvedValue(null);

      const { result } = renderHook(() => useSessionQuery(), {
        wrapper: AllTheProviders,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeNull();
    });

    it.skip('should redirect on 401 error', async () => {
      // Skip this test as window.location is being configured elsewhere in test setup
      // and cannot be redefined. The redirect functionality is tested in integration tests.

      // Mock error that contains '401'
      mockedAuthApiService.getSession.mockRejectedValue(
        new Error('401 Unauthorized')
      );

      const { result } = renderHook(() => useSessionQuery(), {
        wrapper: AllTheProviders,
      });

      // Wait for the hook to process the error
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // The hook should redirect on 401
      expect(window.location.href).toBe('/api/auth/login');
      expect(result.current.data).toBeNull();
    });

    it('should retry on non-401 errors', async () => {
      // First call fails with network error, second succeeds
      mockedAuthApiService.getSession
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(null);

      const { result } = renderHook(() => useSessionQuery(), {
        wrapper: AllTheProviders,
      });

      // Wait for retries to complete
      await waitFor(
        () => {
          expect(mockedAuthApiService.getSession).toHaveBeenCalledTimes(2);
        },
        { timeout: 5000 }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeNull();
    });
  });

  describe('useSwitchTenantMutation', () => {
    it('should switch tenant successfully', async () => {
      mockedAuthApiService.switchTenant.mockResolvedValue();

      const { result } = renderHook(() => useSwitchTenantMutation(), {
        wrapper: AllTheProviders,
      });

      await act(async () => {
        await result.current.mutateAsync('new-tenant-id');
      });

      expect(mockedAuthApiService.switchTenant).toHaveBeenCalledWith(
        'new-tenant-id'
      );
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Tenant switched',
        variant: 'default',
      });
    });

    it('should handle switch tenant error', async () => {
      const error = new Error('Switch failed');
      mockedAuthApiService.switchTenant.mockRejectedValue(error);

      const { result } = renderHook(() => useSwitchTenantMutation(), {
        wrapper: AllTheProviders,
      });

      act(() => {
        result.current.mutate('new-tenant-id');
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error switching tenant',
        variant: 'destructive',
      });
    });
  });
});

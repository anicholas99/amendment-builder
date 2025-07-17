import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useClaimBatchOperations } from '../useClaimBatchOperations';
import { ClaimsApiService } from '@/services/api/claims.api-service';
import { ProjectApiService } from '@/client/services/project.client-service';
import React from 'react';
import { ClaimClientService } from '@/client/services/claim.client-service';

// Mock dependencies
jest.mock('@/services/api/claims.api-service');
jest.mock('@/client/services/project.client-service');
jest.mock('@/client/services/claim.client-service');
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toasts: [],
    toast: mockToast,
  }),
}));
jest.mock('@/server/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('useClaimBatchOperations', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };

  describe('insertClaimWithRenumbering', () => {
    it('should only renumber consecutive claims when inserting with a gap', async () => {
      // Setup: Claims 1, 2, 3, and 11
      const existingClaims = [
        { id: 'claim-1', number: 1, text: 'A system...' },
        { id: 'claim-2', number: 2, text: 'The system of claim 1...' },
        { id: 'claim-3', number: 3, text: 'The system of claim 2...' },
        { id: 'claim-11', number: 11, text: 'A method...' },
      ];

      // Set initial data in query cache with correct key format
      queryClient.setQueryData(['claims', 'list', 'project-123'], {
        claims: existingClaims,
      });

      // Mock the API calls
      (ClaimsApiService.batchUpdateNumbers as jest.Mock).mockResolvedValue({
        claims: [
          { id: 'claim-2', number: 3, text: 'The system of claim 1...' },
          { id: 'claim-3', number: 4, text: 'The system of claim 2...' },
        ],
      });

      (ClaimsApiService.addClaim as jest.Mock).mockResolvedValue({
        id: 'new-claim',
        number: 2,
        text: 'The system of claim 1, wherein...',
      });

      (ProjectApiService.getClaims as jest.Mock).mockResolvedValue({
        claims: [
          { id: 'claim-1', number: 1, text: 'A system...' },
          {
            id: 'new-claim',
            number: 2,
            text: 'The system of claim 1, wherein...',
          },
          { id: 'claim-2', number: 3, text: 'The system of claim 1...' },
          { id: 'claim-3', number: 4, text: 'The system of claim 2...' },
          { id: 'claim-11', number: 11, text: 'A method...' },
        ],
      });

      const { result } = renderHook(() => useClaimBatchOperations(), {
        wrapper,
      });

      // Act: Insert claim after claim 1
      await result.current.insertClaimWithRenumberingAsync({
        projectId: 'project-123',
        inventionId: 'invention-123',
        afterClaimNumber: 1,
        text: 'The system of claim 1, wherein...',
      });

      // Verify that only claims 2 and 3 were renumbered, NOT claim 11
      expect(ClaimsApiService.batchUpdateNumbers).toHaveBeenCalledWith({
        inventionId: 'invention-123',
        updates: [
          { claimId: 'claim-2', newNumber: 3 },
          { claimId: 'claim-3', newNumber: 4 },
          // claim-11 should NOT be included
        ],
      });

      // Verify addClaim was called with the correct number
      expect(ClaimsApiService.addClaim).toHaveBeenCalledWith('project-123', {
        number: 2,
        text: 'The system of claim 1, wherein...',
      });
    });

    it('should handle no renumbering when inserting at the end', async () => {
      // Setup: Claims 1, 2, 3
      const existingClaims = [
        { id: 'claim-1', number: 1, text: 'A system...' },
        { id: 'claim-2', number: 2, text: 'The system of claim 1...' },
        { id: 'claim-3', number: 3, text: 'The system of claim 2...' },
      ];

      queryClient.setQueryData(['claims', 'list', 'project-123'], {
        claims: existingClaims,
      });

      (ClaimsApiService.addClaim as jest.Mock).mockResolvedValue({
        id: 'new-claim',
        number: 4,
        text: 'The system of claim 3, wherein...',
      });

      const { result } = renderHook(() => useClaimBatchOperations(), {
        wrapper,
      });

      // Insert claim after claim 3 (at the end)
      await result.current.insertClaimWithRenumberingAsync({
        projectId: 'project-123',
        inventionId: 'invention-123',
        afterClaimNumber: 3,
        text: 'The system of claim 3, wherein...',
      });

      // Verify that batchUpdateNumbers was NOT called
      expect(ClaimsApiService.batchUpdateNumbers).not.toHaveBeenCalled();

      // Verify addClaim was called with the correct number
      expect(ClaimsApiService.addClaim).toHaveBeenCalledWith('project-123', {
        number: 4,
        text: 'The system of claim 3, wherein...',
      });
    });

    it('should handle inserting in a gap', async () => {
      // Setup: Claims 1, 2, 5, 6
      const existingClaims = [
        { id: 'claim-1', number: 1, text: 'A system...' },
        { id: 'claim-2', number: 2, text: 'The system of claim 1...' },
        { id: 'claim-5', number: 5, text: 'A method...' },
        { id: 'claim-6', number: 6, text: 'The method of claim 5...' },
      ];

      queryClient.setQueryData(['claims', 'list', 'project-123'], {
        claims: existingClaims,
      });

      (ClaimsApiService.addClaim as jest.Mock).mockResolvedValue({
        id: 'new-claim',
        number: 3,
        text: 'The system of claim 2, wherein...',
      });

      const { result } = renderHook(() => useClaimBatchOperations(), {
        wrapper,
      });

      // Insert claim after claim 2 (in the gap before 5)
      await result.current.insertClaimWithRenumberingAsync({
        projectId: 'project-123',
        inventionId: 'invention-123',
        afterClaimNumber: 2,
        text: 'The system of claim 2, wherein...',
      });

      // Verify that no renumbering was needed (3 is available)
      expect(ClaimsApiService.batchUpdateNumbers).not.toHaveBeenCalled();

      // Verify addClaim was called with the correct number
      expect(ClaimsApiService.addClaim).toHaveBeenCalledWith('project-123', {
        number: 3,
        text: 'The system of claim 2, wherein...',
      });
    });
  });
});
